import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Ingredient from '../../models/ingredient';
import aigenerated from '../../models/aigenerated';
import { IngredientDocumentType } from '../../types';

// Define the possible shapes of the API response
type Data = IngredientDocumentType[] | {
    error: string
} | {
    [key: string]: any;
};

// Default ingredients list in case MongoDB is unavailable
const DEFAULT_INGREDIENTS = [
    { _id: '1', name: 'Chicken' }, { _id: '2', name: 'Beef' }, { _id: '3', name: 'Fish' }, { _id: '4', name: 'Egg' },
    { _id: '5', name: 'Onion' }, { _id: '6', name: 'Garlic' }, { _id: '7', name: 'Tomato' }, { _id: '8', name: 'Pepper' },
    { _id: '9', name: 'Salt' }, { _id: '10', name: 'Olive Oil' }, { _id: '11', name: 'Butter' }, { _id: '12', name: 'Milk' },
    { _id: '13', name: 'Cheese' }, { _id: '14', name: 'Rice' }, { _id: '15', name: 'Pasta' }, { _id: '16', name: 'Bread' },
    { _id: '17', name: 'Potato' }, { _id: '18', name: 'Carrot' }, { _id: '19', name: 'Lettuce' }, { _id: '20', name: 'Cucumber' },
];

// Export the default async handler function for the API route
async function handler(req: NextApiRequest, res: NextApiResponse<Data>, session: any) {
    try {
        const userId = session?.user?.id || session?.user?._id;
        let totalGeneratedCount = 0;
        let allIngredients: IngredientDocumentType[] = DEFAULT_INGREDIENTS as unknown as IngredientDocumentType[];

        // Try to connect to MongoDB
        try {
            await connectDB();

            // Count the number of AI-generated entries associated with the user's ID
            if (userId) {
                totalGeneratedCount = await aigenerated.countDocuments({ userId }).exec();
            }

            // Check if the user has exceeded the API request limit
            if (totalGeneratedCount >= Number(process.env.API_REQUEST_LIMIT || 50)) {
                res.status(200).json({
                    reachedLimit: true,
                    ingredientList: allIngredients
                });
                return;
            }

            // Retrieve all ingredients from the database, sorted alphabetically by name
            const dbIngredients = await Ingredient.find().sort({ name: 1 }).exec() as unknown as IngredientDocumentType[];
            if (dbIngredients && dbIngredients.length > 0) {
                allIngredients = dbIngredients;
            }
        } catch (dbError) {
            // MongoDB connection failed, use default ingredients
            console.warn('MongoDB unavailable, using default ingredients:', dbError);
        }

        // Respond with the list of ingredients and reachedLimit flag as false
        res.status(200).json({
            reachedLimit: totalGeneratedCount >= Number(process.env.API_REQUEST_LIMIT || 50),
            ingredientList: allIngredients
        });
    } catch (error) {
        // Log any errors to the server console for debugging
        console.error('Error in get-ingredients:', error);
        
        // Respond with default ingredients even on error
        res.status(200).json({
            reachedLimit: false,
            ingredientList: DEFAULT_INGREDIENTS
        });
    }
}
export default apiMiddleware(['GET'], handler);