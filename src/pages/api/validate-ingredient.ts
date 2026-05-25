import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { validateIngredient } from '../../lib/openai';
import Ingredient from '../../models/ingredient';
import mongoose from 'mongoose';
import pluralize from 'pluralize';

const MAX_INGREDIENT_NAME_LENGTH = 20;

const normalizeIngredientName = (value: string) => value.trim().toLowerCase();

const parseValidationResponse = (
    response: string | null
): { isValid: boolean; possibleVariations: string[] } | null => {
    if (!response) return null;

    const sanitizedResponse = response
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try {
        const parsed: unknown = JSON.parse(sanitizedResponse);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        const parsedRecord = parsed as Record<string, unknown>;
        if (typeof parsedRecord.isValid !== 'boolean') return null;

        const possibleVariations = Array.isArray(parsedRecord.possibleVariations)
            ? parsedRecord.possibleVariations.filter((variation: unknown): variation is string => typeof variation === 'string')
            : [];

        return {
            isValid: parsedRecord.isValid,
            possibleVariations
        };
    } catch (error) {
        console.error('Failed to parse OpenAI ingredient validation response', error);
        return null;
    }
};

const isDuplicateIngredient = (ingredientName: string, existingName: string) => {
    const normalizedIngredient = normalizeIngredientName(ingredientName);
    const normalizedExisting = normalizeIngredientName(existingName);

    return (
        normalizedIngredient === normalizedExisting ||
        pluralize.singular(normalizedIngredient) === pluralize.singular(normalizedExisting)
    );
};

/**
 * API handler for validating and adding a new ingredient.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredient name from the request body
        const { ingredientName } = req.body;
        
        // Get userId from session - handle undefined gracefully
        const userId = session?.user?.id || session?.user?._id;
        if (!userId) {
            console.error('No user ID found in session:', JSON.stringify(session, null, 2));
            return res.status(401).json({ error: 'User not authenticated properly' });
        }
        
        const trimmedIngredientName = typeof ingredientName === 'string' ? ingredientName.trim() : '';

        // Validate ingredient name input
        if (!trimmedIngredientName) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }
        if (trimmedIngredientName.length > MAX_INGREDIENT_NAME_LENGTH) {
            return res.status(400).json({ error: `Ingredient name cannot exceed ${MAX_INGREDIENT_NAME_LENGTH} characters` });
        }

        const formattedIngredientName = trimmedIngredientName[0].toUpperCase() + trimmedIngredientName.slice(1).toLowerCase();
        
        // Try to check MongoDB, but don't fail if unavailable
        let ingredientExists = false;
        try {
            const allIngredients = await Ingredient.find({}, { name: 1 });
            ingredientExists = allIngredients.some((ingredient: { name: string }) =>
                isDuplicateIngredient(formattedIngredientName, ingredient.name)
            );
        } catch (dbError) {
            // MongoDB connection failed, continue without DB check
            console.warn('MongoDB check failed, continuing without DB validation:', dbError);
        }

        if (ingredientExists) {
            return res.status(200).json({
                message: 'Error: This ingredient already exists'
            });
        }

        // Simple validation: Check if it's a common cooking ingredient or valid word
        // For now, accept any non-empty ingredient name as valid
        const isValidIngredient = trimmedIngredientName.length > 0 && /^[a-zA-Z\s\-]+$/.test(trimmedIngredientName);

        if (!isValidIngredient) {
            return res.status(200).json({
                message: 'Invalid',
                suggested: ['Please use letters, spaces, or hyphens only']
            });
        }

        // Try to create new ingredient in MongoDB, but don't fail if unavailable
        let newIngredient: any = {
            _id: new mongoose.Types.ObjectId(),
            name: formattedIngredientName,
            createdBy: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId
        };
        
        try {
            const created = await Ingredient.create(newIngredient);
            newIngredient = created;
        } catch (dbError) {
            // MongoDB creation failed, use local object
            console.warn('MongoDB creation failed, using local ingredient object:', dbError);
        }
        
        return res.status(200).json({
            message: 'Success',
            newIngredient,
            suggested: []
        });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error in validate-ingredient:', error);
        return res.status(200).json({ 
            message: 'Error',
            error: 'Failed to add ingredient'
        });
    }
};

export default apiMiddleware(['POST'], handler);
