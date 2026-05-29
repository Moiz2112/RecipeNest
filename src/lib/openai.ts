import OpenAI from 'openai';
import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index';
import aiGenerated from '../models/aigenerated';
import { connectDB } from '../lib/mongodb';
import { ImagesResponse } from 'openai/resources';
import recipeModel from '../models/recipe';
import {
    getRecipeGenerationPrompt,
    getImageGenerationPrompt,
    getIngredientValidationPrompt,
    getRecipeNarrationPrompt,
    getRecipeTaggingPrompt,
    getChatAssistantSystemPrompt
} from './prompts';

// Initialize standard OpenAI client for fallback / non-compatible text models if needed, and for TTS / DALL-E
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const apiKey = process.env.OPENAI_API_KEY;
const isGroqKey = apiKey?.startsWith('gsk_');
const isXAIKey = apiKey?.startsWith('xai-');

let baseURL: string | undefined = undefined;
if (isGroqKey) {
    baseURL = 'https://api.groq.com/openai/v1';
} else if (isXAIKey) {
    baseURL = 'https://api.x.ai/v1';
}

// Client for text/chat completions (dynamically configured for Groq, x.ai/Grok, or OpenAI)
const textClient = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

// Determine model name
let textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-4o';
if (isGroqKey) {
    // If Groq key is used but text model is configured as grok or openai, override to groq's llama
    if (!textModel || textModel.toLowerCase().includes('grok') || textModel.toLowerCase().includes('gpt')) {
        textModel = 'llama-3.3-70b-versatile';
    }
} else if (isXAIKey) {
    if (!textModel || !textModel.toLowerCase().includes('grok')) {
        textModel = 'grok-beta';
    }
}
export const OPENAI_TEXT_MODEL = textModel;

// Save OpenAI responses in the database for logging/tracking
type SaveOpenaiResponsesType = {
    userId: string;
    prompt: string;
    response: any;
    model?: string;
};
const saveOpenaiResponses = async ({ userId, prompt, response, model }: SaveOpenaiResponsesType) => {
    try {
        await connectDB();
        const { _id } = await aiGenerated.create({
            userId,
            prompt,
            response,
            model,
        });
        return _id;
    } catch (error) {
        console.error('Failed to save response to db:', error);
        return null;
    }
};

type ResponseType = {
    recipes: string | null;
    openaiPromptId: string;
};

// Helper function to generate mock recipes if USE_MOCK_RECIPES is true or as a fallback
const generateMockRecipe = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[], userId: string): Promise<ResponseType> => {
    try {
        console.log('Generating recipes with mock data...');
        const ingredientNames = ingredients.map((i) => i.name);
        const prefs = Array.isArray(dietaryPreferences) ? dietaryPreferences : [];

        const stylePool = [
            {
                prefix: 'Zesty',
                format: 'Skillet',
                prepTime: '12 minutes',
                cookTime: '18 minutes',
                servings: 2,
                steps: (names: string[]) => [
                    `Prep and chop all ingredients: ${names.join(', ')}.`,
                    'Warm oil in a skillet over medium heat.',
                    `Cook the main ingredients until lightly browned, then add the remaining ingredients in stages.`,
                    'Season, stir, and cook until everything is tender and well coated.',
                    'Finish with a short rest before serving hot.'
                ],
                tips: 'Cook in batches if the pan is crowded.',
                variations: 'Swap in extra vegetables or a different protein.',
                servingSuggestions: 'Serve over rice, noodles, or mashed potatoes.',
                nutritionalInformation: 'Balanced meal with protein, vegetables, and carbohydrates.'
            },
            {
                prefix: 'Roasted',
                format: 'Tray Bake',
                prepTime: '15 minutes',
                cookTime: '25 minutes',
                servings: 3,
                steps: (names: string[]) => [
                    `Preheat the oven and arrange ${names.join(', ')} on a lined tray.`,
                    'Toss everything with oil, seasoning, and any dry spices.',
                    'Spread evenly and roast until the edges are caramelized.',
                    'Turn once halfway through for even browning.',
                    'Rest briefly, then serve warm.'
                ],
                tips: 'Cut ingredients into similar sizes for even cooking.',
                variations: 'Add herbs, citrus, or a yogurt sauce.',
                servingSuggestions: 'Pair with flatbread, couscous, or a simple grain salad.',
                nutritionalInformation: 'High in fiber and rich in flavor.'
            },
            {
                prefix: 'Creamy',
                format: 'Soup',
                prepTime: '10 minutes',
                cookTime: '20 minutes',
                servings: 4,
                steps: (names: string[]) => [
                    `Chop ${names.join(', ')} into small, even pieces.`,
                    'Sauté aromatics in a pot until fragrant.',
                    'Add the vegetables and enough liquid to cover them.',
                    'Simmer until tender, then blend lightly or leave chunky.',
                    'Adjust seasoning and serve hot.'
                ],
                tips: 'Add stock gradually so the texture stays controlled.',
                variations: 'Finish with cream, coconut milk, or herbs.',
                servingSuggestions: 'Serve with toast, crackers, or a sandwich.',
                nutritionalInformation: 'Comforting and filling with a moderate calorie count.'
            },
            {
                prefix: 'Herby',
                format: 'Bowl',
                prepTime: '10 minutes',
                cookTime: '12 minutes',
                servings: 2,
                steps: (names: string[]) => [
                    `Cook the base ingredients and set them aside.`,
                    `Prepare ${names.join(', ')} with a quick seasoning mix.`,
                    'Layer the base, toppings, and any sauce in a bowl.',
                    'Add fresh herbs or crunch for contrast.',
                    'Serve immediately while warm.'
                ],
                tips: 'Keep wet and dry components separate until plating.',
                variations: 'Add avocado, pickles, seeds, or a spicy drizzle.',
                servingSuggestions: 'Great for lunch or a light dinner.',
                nutritionalInformation: 'Well-rounded bowl with protein, texture, and fresh elements.'
            }
        ];

        const selectedStyles = Array.from({ length: 3 }, (_, index) => {
            const styleIndex = (Math.floor(Math.random() * stylePool.length) + index) % stylePool.length;
            return stylePool[styleIndex];
        });

        const buildQuantity = (index: number) => {
            const cycle = ['1 cup', '2 tbsp', '3 cloves', '200 g', '1 tsp', '2 pieces', '150 ml', '1/2 cup'];
            return cycle[index % cycle.length];
        };

        const mockRecipes = selectedStyles.map((style, recipeIndex) => {
            const mainIngredient = ingredientNames[recipeIndex % Math.max(ingredientNames.length, 1)] || 'Mixed Ingredient';
            const supportingNames = ingredientNames.filter((_, idx) => idx !== recipeIndex % Math.max(ingredientNames.length, 1));
            const recipeIngredientNames = ingredientNames.length ? ingredientNames : [mainIngredient];

            return {
                name: `${style.prefix} ${mainIngredient} ${style.format}`,
                description: `A distinct ${style.format.toLowerCase()} built around ${mainIngredient} and ${supportingNames.slice(0, 2).join(', ') || 'balanced pantry flavors'}.`,
                ingredients: recipeIngredientNames.map((name, idx) => ({
                    name,
                    quantity: buildQuantity(idx + recipeIndex),
                    unit: ''
                })),
                instructions: style.steps(recipeIngredientNames),
                prepTime: style.prepTime,
                cookTime: style.cookTime,
                servings: style.servings,
                dietaryPreference: prefs.length > 0 ? prefs : ['Regular'],
                additionalInformation: {
                    tips: style.tips,
                    variations: style.variations,
                    servingSuggestions: style.servingSuggestions,
                    nutritionalInformation: style.nutritionalInformation
                }
            };
        });
        
        const recipesJson = JSON.stringify(mockRecipes);
        
        // Save to database if possible (non-critical)
        try {
            const _id = await saveOpenaiResponses({ userId, prompt: 'mock-generation', response: { mock: true, count: 3 }, model: 'mock-recipes' });
            return { recipes: recipesJson, openaiPromptId: _id || 'mock-prompt-id' };
        } catch (saveError) {
            console.warn('Could not save to DB, returning recipes anyway:', saveError);
            return { recipes: recipesJson, openaiPromptId: 'mock-prompt-id' };
        }
    } catch (error) {
        console.error('Error in generateMockRecipe:', error);
        // Return emergency mock recipes even if everything fails
        const mockRecipes = [
            {
                name: 'Classic Vegetable Stir Fry',
                description: 'A quick and delicious stir fry',
                ingredients: ingredients.slice(0, 2),
                instructions: ['Heat oil', 'Add ingredients', 'Stir fry', 'Serve'],
                prepTime: '15 minutes',
                cookTime: '10 minutes',
                servings: 4,
                dietaryPreference: ['Regular'],
                additionalInformation: {
                    tips: 'Use high heat',
                    variations: 'Any vegetables work',
                    servingSuggestions: 'Serve with rice',
                    nutritionalInformation: 'Balanced meal'
                }
            },
            {
                name: 'Grilled Protein Plate',
                description: 'A perfectly grilled dish',
                ingredients: ingredients,
                instructions: ['Season', 'Grill', 'Rest', 'Serve'],
                prepTime: '10 minutes',
                cookTime: '15 minutes',
                servings: 2,
                dietaryPreference: ['Regular'],
                additionalInformation: {
                    tips: 'Medium heat recommended',
                    variations: 'Use different marinades',
                    servingSuggestions: 'Great with vegetables',
                    nutritionalInformation: 'High protein meal'
                }
            },
            {
                name: 'Fresh Garden Salad',
                description: 'A fresh and healthy salad',
                ingredients: ingredients,
                instructions: ['Chop', 'Mix', 'Dress', 'Serve'],
                prepTime: '10 minutes',
                cookTime: '0 minutes',
                servings: 2,
                dietaryPreference: ['Vegetarian', 'Vegan'],
                additionalInformation: {
                    tips: 'Use fresh produce',
                    variations: 'Add protein for main dish',
                    servingSuggestions: 'Perfect as a side',
                    nutritionalInformation: 'Full of vitamins'
                }
            }
        ];
        return { recipes: JSON.stringify(mockRecipes), openaiPromptId: 'emergency-mock' };
    }
};

// Generate recipes using dynamic AI client (supporting Groq, Grok, or OpenAI)
export const generateRecipe = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[], userId: string): Promise<ResponseType> => {
    if (process.env.USE_MOCK_RECIPES === 'true') {
        return generateMockRecipe(ingredients, dietaryPreferences, userId);
    }

    try {
        console.log('Generating recipes using AI model:', OPENAI_TEXT_MODEL);
        const creativeBriefs = [
            'Lean into comfort-food techniques, but keep the recipes practical and weeknight-friendly.',
            'Aim for brighter flavors, fresh herbs, a little acidity, and a more elegant presentation.',
            'Treat the ingredients like a restaurant chef would: bold contrasts, layered textures, and a polished final dish.',
            'Use a global inspiration lens, but keep the ingredients recognizable and the instructions easy to follow.'
        ];
        const creativeBrief = creativeBriefs[Math.floor(Math.random() * creativeBriefs.length)];
        const prompt = `${creativeBrief}\n\n${getRecipeGenerationPrompt(ingredients, dietaryPreferences)}`;

        const response = await textClient.chat.completions.create({
            model: OPENAI_TEXT_MODEL,
            messages: [{
                role: 'system',
                content: 'You are an inventive chef who writes distinct, realistic, and vivid recipes. Never reuse a generic recipe template unless the ingredients truly demand it.'
            }, {
                role: 'user',
                content: prompt,
            }],
            max_completion_tokens: 2500,
            temperature: 1.05,
            top_p: 0.98,
            frequency_penalty: 0.35,
            presence_penalty: 0.6,
        });

        const rawResponse = response.choices[0].message?.content?.trim() || '';
        
        // Clean the response from markdown formatting if present (e.g. ```json ... ```)
        const sanitizedResponse = rawResponse
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();

        const extractJsonArray = (text: string) => {
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start >= 0 && end > start) {
                return text.slice(start, end + 1);
            }
            return text;
        };

        // Validate JSON structure by parsing it
        try {
            const parsed = JSON.parse(extractJsonArray(sanitizedResponse));
            if (!Array.isArray(parsed)) {
                throw new Error('Expected JSON array of recipes.');
            }
            
            // Save to database
            const _id = await saveOpenaiResponses({ 
                userId, 
                prompt: `Ingredients: ${ingredients.map(i => i.name).join(', ')}, Preferences: ${dietaryPreferences.join(', ')}`, 
                response: parsed, 
                model: OPENAI_TEXT_MODEL 
            });

            return { recipes: sanitizedResponse, openaiPromptId: _id || 'real-prompt-id' };
        } catch (jsonError: any) {
            console.error('Failed to parse AI response as valid recipes array:', jsonError);
            console.error('Raw response content was:', rawResponse);
            throw new Error(`AI generated invalid recipes format: ${jsonError.message}`);
        }
    } catch (error: any) {
        console.error('Error generating recipes with AI client, falling back to mock:', error?.message || error);
        return generateMockRecipe(ingredients, dietaryPreferences, userId);
    }
};

// Generate an image using DALL-E by sending an image generation prompt to OpenAI
const generateImage = async (prompt: string, model: string): Promise<ImagesResponse | null> => {
    try {
        // Use Cloudflare AI for image generation if credentials available and properly configured
        const cfKey = process.env.CLOUDFLARE_API_KEY;
        const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        
        if (cfKey && cfAccountId && cfAccountId !== 'your-cloudflare-account-id') {
            try {
                console.info(`[CF] Attempting Cloudflare image generation for: ${prompt.substring(0, 50)}...`);
                const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-lightning`;
                
                console.info(`[CF] URL: ${cloudflareUrl}`);
                console.info(`[CF] Headers: Authorization: Bearer ${cfKey.substring(0, 10)}...`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
                const response = await fetch(cloudflareUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${cfKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt }),
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);

                console.info(`[CF] Response status: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[CF] Error response: ${errorText}`);
                    console.warn(`[CF] API error: ${response.status} ${response.statusText}`);
                    throw new Error(`Cloudflare API error: ${response.status} - ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                console.info(`[CF] Received image buffer: ${arrayBuffer.byteLength} bytes`);
                
                const b64 = Buffer.from(arrayBuffer).toString('base64');
                
                console.info('[CF] Image generated successfully');
                // Return in OpenAI format for compatibility
                return {
                    created: Math.floor(Date.now() / 1000),
                    data: [{ b64_json: b64 }],
                } as ImagesResponse;
            } catch (cloudflareError) {
                console.warn('[CF] Cloudflare image generation failed:', cloudflareError);
                console.warn('[CF] Error message:', (cloudflareError as Error).message);
                return null;
            }
        } else {
            if (!cfAccountId || cfAccountId === 'your-cloudflare-account-id') {
                console.info('[CF] Cloudflare Account ID not configured, using placeholder images');
            } else {
                console.info('[CF] Cloudflare credentials not found, using fallback');
            }
        }

        // Fallback to OpenAI if Cloudflare not configured
        try {
            console.info('[OpenAI] Attempting OpenAI image generation...');
            const response = await openai.images.generate({
                model,
                prompt,
                n: 1,
                size: '1024x1024',
            });
            console.info('[OpenAI] Image generated successfully');
            return response;
        } catch (openaiError) {
            console.warn('OpenAI image generation failed:', openaiError);
            return null;
        }
    } catch (error) {
        console.warn('Image generation failed for prompt, using placeholder:', error);
        return null;
    }
};

const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';

// Generate images for an array of recipes and return image links paired with recipe names
export const generateImages = async (recipes: Recipe[], userId: string) => {
    try {
        console.log('[generateImages] Starting for', recipes.length, 'recipes');
        const model = OPENAI_IMAGE_MODEL;
        const imagePromises: Promise<ImagesResponse | null>[] = recipes.map((recipe, idx) =>
            generateImage(getImageGenerationPrompt(recipe.name, recipe.ingredients), model)
                .catch(err => {
                    console.error(`[generateImages] Error generating image ${idx + 1}:`, err);
                    return null;
                })
        );
        const images = await Promise.all(imagePromises);
        console.log('[generateImages] All image generation attempts completed');
        
        // Map images safely - use placeholder for any failed generations
        const imagesWithNames = images.map((imageResponse, idx) => {
            const recipeName = recipes[idx].name;
            
            // If image generation failed or returned null, use placeholder
            if (!imageResponse) {
                console.log(`[generateImages] Using placeholder for recipe: ${recipeName}`);
                return {
                    imgLink: '/logo.svg', // Placeholder image
                    name: recipeName,
                };
            }
            
            const imageData = imageResponse?.data?.[0];
            const url = imageData?.url;
            const b64Json = imageData?.b64_json;

            if (!b64Json && !url) {
                console.log(`[generateImages] No image data for: ${recipeName}, using placeholder`);
                return {
                    imgLink: '/logo.svg', // Fallback to placeholder
                    name: recipeName,
                };
            }

            console.log(`[generateImages] Successfully generated image for: ${recipeName}`);
            return {
                imgLink: b64Json ? `data:image/png;base64,${b64Json}` : url as string,
                name: recipeName,
            };
        });
        
        const imageLogSummary = images.map((imageResponse, idx) => ({
            recipe: recipes[idx]?.name || `recipe-${idx}`,
            generated: imageResponse !== null,
            hasUrl: Boolean(imageResponse?.data?.[0]?.url),
            hasB64Json: Boolean(imageResponse?.data?.[0]?.b64_json),
        }));
        
        // Log to database (non-critical, don't let it fail the process)
        try {
            await saveOpenaiResponses({
                userId,
                prompt: `Image generation for recipe names ${recipes.map(r => r.name).join(', ')}`,
                response: imageLogSummary,
                model
            });
        } catch (logError) {
            console.warn('[generateImages] Failed to log responses:', logError);
        }
        
        console.log(`[generateImages] Returning ${imagesWithNames.length} images`);
        return imagesWithNames;
    } catch (error) {
        console.error('[generateImages] Critical error, returning placeholders:', error);
        // Return placeholder images for all recipes instead of throwing
        return recipes.map((recipe) => ({
            imgLink: '/logo.svg',
            name: recipe.name,
        }));
    }
};

// Validate an ingredient name by sending a prompt to OpenAI/Groq/Grok and returning its response
export const validateIngredient = async (ingredientName: string, userId: string): Promise<string | null> => {
    try {
        const prompt = getIngredientValidationPrompt(ingredientName);
        const model = OPENAI_TEXT_MODEL;
        const response = await textClient.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_completion_tokens: 800,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content;
    } catch (error) {
        console.error('Failed to validate ingredient:', error);
        throw new Error('Failed to validate ingredient');
    }
};

// Retrieve narrated text for a recipe by sending a narration prompt to OpenAI/Groq/Grok
const getRecipeNarration = async (recipe: ExtendedRecipe, userId: string): Promise<string | null> => {
    try {
        const prompt = getRecipeNarrationPrompt(recipe);
        console.info('Getting recipe narration text from AI client...');
        const model = OPENAI_TEXT_MODEL;
        const response = await textClient.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_completion_tokens: 1500,
        });
        const _id = await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content;
    } catch (error) {
        console.error('Failed to generate recipe narration:', error);
        throw new Error('Failed to generate recipe narration');
    }
};

// Convert narrated text to speech (TTS) using OpenAI audio API and return an audio buffer
export const getTTS = async (recipe: ExtendedRecipe, userId: string): Promise<Buffer> => {
    try {
        const text = await getRecipeNarration(recipe, userId);
        if (!text) throw new Error('Unable to get text for recipe narration');
        // Randomly select a voice type from available options
        type voiceTypes = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        const voiceChoices: voiceTypes[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const voice = voiceChoices[Math.floor(Math.random() * voiceChoices.length)];
        console.info('Getting recipe narration audio from OpenAI...');
        const model = 'tts-1';
        const mp3 = await openai.audio.speech.create({
            model,
            voice,
            input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await saveOpenaiResponses({ userId, prompt: text, response: mp3, model });
        return buffer;
    } catch (error) {
        console.error('Failed to generate tts:', error);
        throw new Error('Failed to generate tts');
    }
};

// Generate tags for a recipe by sending a tagging prompt to OpenAI/Groq/Grok and updating the recipe document in the database
export const generateRecipeTags = async (recipe: ExtendedRecipe, userId: string): Promise<undefined> => {
    try {
        const prompt = getRecipeTaggingPrompt(recipe);
        const model = OPENAI_TEXT_MODEL;
        const response = await textClient.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_completion_tokens: 1500,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
        const [tagsObject] = response.choices;
        const rawTags = tagsObject.message?.content?.trim();
        let tagsArray: string[] = [];
        if (rawTags) {
            try {
                tagsArray = JSON.parse(rawTags);
                if (!Array.isArray(tagsArray) || tagsArray.some(tag => typeof tag !== 'string')) {
                    throw new Error('Invalid JSON structure: Expected an array of strings.');
                }
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.error('Received malformed JSON:', rawTags);
                throw new Error(`Failed to parse tags from OpenAI response. --> ${jsonError}`);
            }
        }
        if (tagsArray.length) {
            const tags = tagsArray.map((tag: string) => ({ tag: tag.toLowerCase() }));
            const update = { $set: { tags } };
            console.info(`Adding tags -> ${tagsArray} for new recipe -> ${recipe.name} from OpenAI api`);
            await recipeModel.findByIdAndUpdate(recipe._id, update);
        }
        return;
    } catch (error) {
        console.error('Failed to generate tags for the recipe:', error);
        throw new Error(`Failed to generate tags for the recipe --> ${error}`);
    }
};

// Generate a chat response by sending a message to OpenAI/Groq/Grok and returning the assistant's reply
export const generateChatResponse = async (
    message: string,
    recipe: ExtendedRecipe,
    history: any[],
    userId: string
): Promise<{ reply: string; totalTokens: number }> => {
    try {
        const model = OPENAI_TEXT_MODEL;
        const messages = [
            { role: 'system', content: getChatAssistantSystemPrompt(recipe) },
            ...history,
            { role: 'user', content: message },
        ];

        const response = await textClient.chat.completions.create({
            model,
            messages,
            max_completion_tokens: 1000,
        });

        const reply = response.choices?.[0]?.message?.content ?? 'Sorry, I had trouble responding.';
        const totalTokens = response.usage?.total_tokens ?? 0;

        // Save to DB only on first message
        if (history.length === 1) {
            await saveOpenaiResponses({
                userId,
                prompt: `Chat session started for recipe: ${recipe.name}, first message: ${message}`,
                response,
                model,
            });
        }

        return { reply, totalTokens };
    } catch (error) {
        console.error('Failed to generate chat response:', error);
        return { reply: 'Sorry, I had trouble responding.', totalTokens: 0 };
    }
};
