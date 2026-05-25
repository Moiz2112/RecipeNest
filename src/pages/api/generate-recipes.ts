import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { generateRecipe } from '../../lib/openai';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredients and dietary preferences from request body
        const { ingredients, dietaryPreferences } = req.body;

        // Validate ingredients input
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        // Get user ID from session
        const userId = session?.user?.id || session?.user?._id || 'anonymous';

        // Generate recipes using mock or AI API
        console.info('Generating recipes...');
        const response = await generateRecipe(ingredients, dietaryPreferences, userId);

        // Respond with the generated recipes
        res.status(200).json(response);
    } catch (error: any) {
        // Handle any errors that occur during recipe generation
        console.error('Generate recipes error:', error?.message || error);
        
        // Return a 500 error with message
        res.status(500).json({ 
            error: 'Failed to generate recipes',
            details: error?.message || 'Unknown error'
        });
    }
};

export default apiMiddleware(['POST'], handler);
