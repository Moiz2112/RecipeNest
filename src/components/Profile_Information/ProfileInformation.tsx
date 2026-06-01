import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@headlessui/react';
import { call_api } from '../../utils/utils';

interface ProfileInformationProps {
    onSaved?: () => void;
}

function ProfileInformation({ onSaved }: ProfileInformationProps) {
    const { data: session, update } = useSession();
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const user = session?.user;

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setImage(user.image || '');
    }, [user]);

    if (!session || !user) return null;

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setStatusMessage('');

            const result = await call_api({
                address: '/api/update-profile',
                method: 'put',
                payload: { name, image },
            });

            await update({
                ...session,
                user: {
                    ...session.user,
                    name: result.user.name,
                    image: result.user.image,
                },
            });

            setStatusMessage('Profile updated successfully.');
            onSaved?.();
        } catch (error) {
            console.error('Failed to save profile', error);
            setStatusMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-xl shadow-rose-100">
            <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-rose-100 to-amber-50 px-8 py-10">
                    <Image
                        src={image || user.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                        width={120}
                        height={120}
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                        alt={`profile-${user.name}`}
                    />
                    <h5 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h5>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <p className="mt-3 max-w-xs text-center text-sm leading-6 text-gray-600">
                        Update your display name and profile picture from one simple card.
                    </p>
                </div>

            <div className="px-6 py-8 md:px-8 md:py-10">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">Profile settings</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">Edit your details</h3>
                </div>

                <div className="space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Name</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                            placeholder="Your name"
                        />
                    </label>

            </div>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Profile picture URL</span>
                        <input
                            value={image}
                            onChange={(event) => setImage(event.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                            placeholder="https://..."
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !name.trim()}
                            className="inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Save profile'}
                        </Button>
                        {statusMessage && (
                            <span className="text-sm font-medium text-gray-600">{statusMessage}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileInformation;
