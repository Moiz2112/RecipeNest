import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { name, image } = req.body || {};

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (image !== undefined && typeof image !== 'string') {
            return res.status(400).json({ error: 'Image must be a string' });
        }

        await connectDB();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                $set: {
                    name: name.trim(),
                    ...(image !== undefined ? { image: image.trim() } : {}),
                },
            },
            { new: true }
        ).lean();

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            user: {
                id: String(updatedUser._id),
                name: updatedUser.name,
                image: updatedUser.image,
            },
        });
    } catch (error) {
        console.error('Failed to update profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
};

export default apiMiddleware(['PUT'], handler);