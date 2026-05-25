import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { generateImages, generateRecipeTags } from '../../lib/openai';
import { uploadImagesToS3 } from '../../lib/awss3';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import recipe from '../../models/recipe';
import { Recipe, UploadReturnType, ExtendedRecipe } from '../../types';

/**
 * Helper function to get the S3 link for an uploaded image.
 * @param uploadResults - The results of the S3 upload operation.
 * @param location - The location identifier for the image.
 * @returns The URL of the image in S3 or a fallback image URL.
 */
const getS3Link = (uploadResults: UploadReturnType[] | null, location: string) => {
    const fallbackImg = '/logo.svg';
    if (!uploadResults) return fallbackImg;
    const filteredResult = uploadResults.filter(result => result.location === location);
    if (filteredResult[0]?.uploaded) {
        return `https://smart-recipe-generator.s3.amazonaws.com/${location}`;
    }
    return fallbackImg;
};

/**
 * Helper function to fallback to Unsplash images when DALL-E/S3 uploads fail or are not available.
 */
const getFallbackUnsplashImage = (name: string, preferences: string[]): string => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('salad')) {
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('smoothie') || lowerName.includes('shake') || lowerName.includes('juice') || lowerName.includes('drink') || lowerName.includes('tea') || lowerName.includes('chai')) {
        return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('pasta') || lowerName.includes('spaghetti') || lowerName.includes('penne') || lowerName.includes('noodle') || lowerName.includes('alfredo')) {
        return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('chicken') || lowerName.includes('poultry') || lowerName.includes('turkey')) {
        return 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('beef') || lowerName.includes('meat') || lowerName.includes('lamb') || lowerName.includes('mutton') || lowerName.includes('pork') || lowerName.includes('steak') || lowerName.includes('stew')) {
        return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('seafood') || lowerName.includes('shrimp') || lowerName.includes('tuna')) {
        return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('egg') || lowerName.includes('omelette') || lowerName.includes('scramble') || lowerName.includes('frittata')) {
        return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('dessert') || lowerName.includes('cake') || lowerName.includes('blondie') || lowerName.includes('cookie') || lowerName.includes('sweet') || lowerName.includes('chocolate') || lowerName.includes('pancake') || lowerName.includes('waffle')) {
        return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('pizza') || lowerName.includes('flatbread')) {
        return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('soup')) {
        return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop';
    }
    if (lowerName.includes('rice') || lowerName.includes('biryani') || lowerName.includes('bowl') || lowerName.includes('stir-fry') || lowerName.includes('stir fry')) {
        return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop';
};

/**
 * API handler for generating images for recipes, uploading them to S3, and saving the recipes to MongoDB.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        console.info('=== SAVE RECIPES API CALLED ===');
        console.info('Session available:', !!session);
        console.info('Session user:', session?.user?.id || session?.user?._id || 'NO USER ID');
        
        // Validate session and user
        if (!session || !session.user) {
            console.error('No session or user found');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const userId = session.user.id || session.user._id;
        if (!userId) {
            console.error('No user ID in session');
            return res.status(401).json({ error: 'User ID not found in session' });
        }
        
        console.info(`User authenticated: ${userId}`);
        
        // Extract recipes from the request body
        const { recipes } = req.body;
        
        if (!recipes || recipes.length === 0) {
            console.warn('No recipes provided in request');
            return res.status(400).json({ error: 'No recipes provided' });
        }
        
        console.info(`Received ${recipes.length} recipes to save`);

        // STEP 1: Generate images with graceful fallback
        console.info('STEP 1: Generating images...');
        let imageResults: { imgLink: string; name: string }[] = [];
        try {
            const recipeNames = recipes.map(({ name, ingredients }: Recipe) => ({ name, ingredients }));
            imageResults = await generateImages(recipeNames, userId);
            console.info(`✓ Generated ${imageResults.length} images`);
        } catch (imageGenError) {
            console.error('✗ Image generation failed:', imageGenError);
            // Fallback: use placeholder images for all
            imageResults = recipes.map((r: Recipe) => ({
                imgLink: '/logo.svg',
                name: r.name,
            }));
            console.info(`✓ Using placeholder images for ${imageResults.length} recipes`);
        }

        // STEP 2: Prepare images for S3 upload (only if real images)
        console.info('STEP 2: Preparing images for S3 (if needed)...');
        let uploadResults = null;
        const hasRealImages = imageResults.some((result: { imgLink: string }) => result.imgLink !== '/logo.svg');
        
        if (hasRealImages) {
            try {
                console.info('Real images detected, attempting S3 upload...');
                const openaiImagesArray = imageResults.map((result: { imgLink: string }, idx: number) => {
                    const dataUriPrefix = 'data:image/png;base64,';
                    const isBase64DataUri = result.imgLink?.startsWith(dataUriPrefix);
                    const b64Data = isBase64DataUri ? result.imgLink.slice(dataUriPrefix.length) : '';

                    return {
                        originalImgLink: isBase64DataUri ? undefined : result.imgLink,
                        imageBuffer: isBase64DataUri ? Buffer.from(b64Data, 'base64') : undefined,
                        userId: userId,
                        location: recipes[idx].openaiPromptId
                    };
                });

                uploadResults = await uploadImagesToS3(openaiImagesArray);
                console.info('✓ S3 upload completed');
            } catch (s3Error) {
                console.warn('✗ S3 upload failed, will use placeholders:', s3Error);
                uploadResults = null;
            }
        } else {
            console.info('✓ No real images, using placeholders');
        }

        // STEP 3: Prepare recipe data with final image links
        console.info('STEP 3: Preparing recipe data...');
        const updatedRecipes = recipes.map((r: Recipe, idx: number) => {
            let finalImgLink = '/logo.svg';
            if (uploadResults) {
                finalImgLink = getS3Link(uploadResults, r.openaiPromptId);
            }
            if (finalImgLink === '/logo.svg') {
                finalImgLink = getFallbackUnsplashImage(r.name, r.dietaryPreference || []);
            }

            return {
                ...r,
                owner: mongoose.Types.ObjectId.isValid(userId)
                    ? new mongoose.Types.ObjectId(userId)
                    : userId,
                imgLink: finalImgLink,
                openaiPromptId: r.openaiPromptId.split('-')[0]
            };
        });
        console.info(`✓ Prepared ${updatedRecipes.length} recipes with images`);

        // STEP 4: Connect to MongoDB
        console.info('STEP 4: Connecting to MongoDB...');
        try {
            await connectDB();
            console.info('✓ Connected to MongoDB');
        } catch (dbError) {
            console.error('✗ MongoDB connection failed:', dbError);
            return res.status(500).json({ 
                error: 'Database connection failed',
                details: (dbError as Error).message 
            });
        }

        // STEP 5: Save recipes to MongoDB
        console.info('STEP 5: Saving recipes to MongoDB...');
        let savedRecipes;
        try {
            savedRecipes = await recipe.insertMany(updatedRecipes);
            console.info(`✓ Successfully saved ${savedRecipes.length} recipes`);
        } catch (saveError) {
            console.error('✗ Recipe save failed:', saveError);
            return res.status(500).json({ 
                error: 'Failed to save recipes',
                details: (saveError as Error).message 
            });
        }

        // STEP 6: Generate tags asynchronously (non-blocking)
        console.info('STEP 6: Queuing tag generation (background task)...');
        savedRecipes.forEach((r) => {
            generateRecipeTags(r as ExtendedRecipe, userId)
                .then(() => console.info(`✓ Tags generated for: ${r.name}`))
                .catch((error) => console.error(`✗ Tag generation failed for ${r.name}:`, error));
        });
        console.info('✓ Tag generation queued');

        // STEP 7: Return success
        console.info('=== SAVE RECIPES COMPLETED SUCCESSFULLY ===');
        return res.status(200).json({ 
            status: 'Saved Recipes!',
            count: savedRecipes.length,
            imagesGenerated: hasRealImages
        });
        
    } catch (error) {
        // Catch-all for any unexpected errors
        console.error('=== UNEXPECTED ERROR IN SAVE RECIPES ===:', error);
        console.error('Error details:', (error as Error).message);
        console.error('Error stack:', (error as Error).stack);
        
        if (!res.headersSent) {
            return res.status(500).json({ 
                error: 'Unexpected error saving recipes',
                details: (error as Error).message 
            });
        }
    }
};

export default apiMiddleware(['POST'], handler);
