import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import mongoose from 'mongoose';
import Recipe from '../../models/recipe';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';
import User from '../../models/user';
import aigenerated from '../../models/aigenerated';

/**
 * API handler for fetching user activity (created and liked recipes).
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    const { userId } = req.query;

    // validate query
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    try {
        await connectDB();

        // Fetch user basic info
        const user = await User.findById(userId).select('name image createdAt').lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Extract joined date from user document or from ObjectId if valid
        const joinedDate = mongoose.Types.ObjectId.isValid(userId)
            ? new Date(new mongoose.Types.ObjectId(userId).getTimestamp())
            : (user as any).createdAt ? new Date((user as any).createdAt) : new Date();

        const createdRecipes = await Recipe.find({ owner: userId })
            .populate(['owner', 'likedBy', 'comments.user'])
            .sort({ createdAt: -1 })
            .lean() as unknown as ExtendedRecipe[]

        const likedRecipes = await Recipe.find({ likedBy: userId })
            .populate(['owner', 'likedBy', 'comments.user'])
            .sort({ createdAt: -1 })
            .lean() as unknown as ExtendedRecipe[];

        const totalGeneratedCount = await aigenerated.countDocuments({ userId: session.user.id }).exec();
        const AIusage = Math.min(Math.round((totalGeneratedCount / Number(process.env.API_REQUEST_LIMIT)) * 100), 100);

        return res.status(200).json({
            user: {
                name: user.name,
                image: user.image,
                joinedDate: joinedDate.toISOString(),
            },
            createdRecipes: filterResults(createdRecipes, session.user.id),
            likedRecipes: filterResults(likedRecipes, session.user.id),
            AIusage,
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);