import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

/**
 * Middleware to handle HTTP method validation and authentication
 * @param allowedMethods - Array of allowed HTTP methods (e.g., ['POST'])
 * @param handler - The API route handler function
 */
export function apiMiddleware(allowedMethods: string[], handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Validate HTTP method
            if (!allowedMethods.includes(req.method!)) {
                res.setHeader('Allow', allowedMethods);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
            }

            // Authenticate the user
            const session = await getServerSession(req, res, authOptions);
            if (!session) {
                console.warn('[apiMiddleware] No session found - user not authenticated');
                return res.status(401).json({ error: 'You must be logged in.' });
            }

            console.info('[apiMiddleware] User authenticated:', session.user?.id || (session.user as any)?._id);

            // Proceed with the actual handler
            await handler(req, res, session);
        } catch (error) {
            console.error('[apiMiddleware] Error:', error);
            console.error('[apiMiddleware] Error message:', (error as Error).message);
            console.error('[apiMiddleware] Error stack:', (error as Error).stack);
            
            // Only send error response if headers haven't been sent yet
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Internal Server Error',
                    details: (error as Error).message
                });
            }
        }
    };
}
