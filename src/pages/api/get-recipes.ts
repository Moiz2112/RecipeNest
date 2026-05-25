import type { NextApiRequest, NextApiResponse } from 'next';
// Intentionally not requiring auth for public recipe listing in development
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { filterResults, paginationQueryHelper } from '../../utils/utils';
import { ExtendedRecipe, PaginationQueryType } from '../../types';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { PipelineStage } from 'mongoose';

const aggreagteHelper = (sortOption: string, skip: number, limit: number): PipelineStage[] => {
  const base: PipelineStage[] = [
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } }, // Fetch owner details
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } }, // Convert `owner` from an array to a single object
    { $lookup: { from: "users", localField: "likedBy", foreignField: "_id", as: "likedBy" } }, // Populate likedBy array
    { $lookup: { from: "comments", localField: "comments.user", foreignField: "_id", as: "comments.user" } }, // Populate comments with user details
    { $skip: skip }, // Pagination applied after lookups and sorting
    { $limit: limit },
  ];

  if (sortOption === 'popular') {
    return [
      { $set: { likeCount: { $size: { $ifNull: ["$likedBy", []] } } } },  // Compute `likeCount` dynamically
      { $sort: { likeCount: -1, _id: 1 } },
      ...base
    ];
  }

  return [
    { $sort: { createdAt: -1, _id: -1 } }, // Sort by creation date, field already exists no need for $set
    ...base
  ];
};

/**
 * API handler for fetching paginated and sorted recipes.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    console.info('[get-recipes] Starting...');
    console.info('[get-recipes] Session user:', session?.user?.id || 'NO USER');
    
    // Connect to the database
    try {
      await connectDB();
      console.info('[get-recipes] ✓ Connected to MongoDB');
    } catch (dbError) {
      console.error('[get-recipes] ✗ MongoDB connection failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed', details: (dbError as Error).message });
    }

    const { page, limit, sortOption, skip } = paginationQueryHelper(req.query as unknown as PaginationQueryType);
    console.info(`[get-recipes] Params: page=${page}, limit=${limit}, sortOption=${sortOption}, skip=${skip}`);
    
    // Execute all queries in parallel using Promise.all()
    let allRecipes, popularTags, totalRecipes;
    try {
      [allRecipes, popularTags, totalRecipes] = await Promise.all([
        // Query 1: Fetch sorted & paginated recipes
        (async () => {
          const recipes = await Recipe.aggregate(aggreagteHelper(sortOption, skip, limit)) as unknown as ExtendedRecipe[];
          console.info(`[get-recipes] ✓ Fetched ${recipes.length} recipes`);
          return recipes;
        })(),

        // Query 2: Compute the most common tags from `tags.tags`
        (async () => {
          const tags = await Recipe.aggregate([
            { $unwind: "$tags" }, // Unwind `tags` sub-document first
            { $unwind: "$tags.tag" }, // Then unwind `tags.tags` array inside it
            { $group: { _id: "$tags.tag", count: { $sum: 1 } } }, // Count occurrences of each tag
            { $sort: { count: -1 } }, // Sort tags by frequency (descending)
            { $limit: 20 } // Get the top 20 most popular tags
          ]);
          console.info(`[get-recipes] ✓ Fetched ${tags.length} popular tags`);
          return tags;
        })(),

        // Query 3: Get total number of recipes for pagination
        (async () => {
          const count = await Recipe.countDocuments();
          console.info(`[get-recipes] ✓ Total recipes in DB: ${count}`);
          return count;
        })()
      ]);
    } catch (queryError) {
      console.error('[get-recipes] ✗ Query execution failed:', queryError);
      console.error('[get-recipes] Error message:', (queryError as Error).message);
      return res.status(500).json({ 
        error: 'Failed to fetch recipes',
        details: (queryError as Error).message
      });
    }

    // Filter results based on user session before responding
    try {
      const userId = session?.user?.id || null;
      const filteredRecipes = filterResults(allRecipes, userId);
      console.info(`[get-recipes] ✓ Filtered ${filteredRecipes.length} recipes for user: ${userId}`);

      const response = {
        recipes: filteredRecipes,
        totalRecipes,
        totalPages: Math.ceil(totalRecipes / limit),
        currentPage: page,
        popularTags
      };

      console.info('[get-recipes] ✓ Returning response');
      return res.status(200).json(response);
    } catch (filterError) {
      console.error('[get-recipes] ✗ Filter/response failed:', filterError);
      return res.status(500).json({ 
        error: 'Failed to filter results',
        details: (filterError as Error).message
      });
    }

  } catch (error) {
    // 🔴 Handle any errors that occur during fetching recipes
    console.error('[get-recipes] ✗ UNEXPECTED ERROR:', error);
    console.error('[get-recipes] Error message:', (error as Error).message);
    console.error('[get-recipes] Stack:', (error as Error).stack);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to fetch recipes',
        details: (error as Error).message
      });
    }
  }
};

// Choose export based on environment flag so we can require auth in prod
const allowPublic = String(process.env.ALLOW_PUBLIC_RECIPES).toLowerCase() === 'true';

const exportedHandler = allowPublic ? handler : apiMiddleware(['GET'], handler);

export default exportedHandler;