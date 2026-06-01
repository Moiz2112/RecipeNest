import { useSession, getSession } from 'next-auth/react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Product from '../components/Hero_Sections/Product';
import Features from '../components/Hero_Sections/Features';
import Landing from '../components/Hero_Sections/Landing';
import ErrorPage from './auth/error';

// Navigation links for the header
const navigation = [
    { name: 'Product', key: 'product' },
    { name: 'Features', key: 'features' },
    { name: 'About', key: 'about' },
];

export default function Hero() {
    // State to manage the mobile menu open/close state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // State to manage the currently selected page
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    // Fetch the current session and status
    const { data: session, update } = useSession();

    // Function to render the content based on the selected page
    const renderContent = () => {
        switch (selectedPage) {
            case 'product':
                return (
                    <Product resetPage={() => setSelectedPage(null)} />
                );
            case 'features':
                return (
                    <Features resetPage={() => setSelectedPage(null)} />
                );
            case 'about':
                window.open('/About', '_blank');
                setSelectedPage(null);
                return (
                    <Landing />
                );
            default:
                return (
                    <Landing />
                );
        }
    };

    // Ensures the user does not navigate to the sign-in page if a valid session exists.
    // If a session is already active, it updates the client state instead of prompting sign-in.
    // Otherwise, it initiates the sign-in process.

    const onAuthenticate = async () => {
        const sessionIsValid = await getSession()
        if (!sessionIsValid) {
            signIn('google')
            return
        }
        update()
    }

    // If the user is logged in, show the error page
    if (session) return <ErrorPage message='Inaccessible Page' />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fffbf2] via-[#fffbf6] to-white relative overflow-hidden">
            {/* Header section (Translucent Floating Glass Navbar) */}
            <header className="fixed inset-x-0 top-4 z-header mx-auto max-w-5xl px-4">
                <nav className="flex items-center justify-between px-6 py-3 rounded-2xl glass-nav border border-white/60 shadow-lg" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <button onClick={() => setSelectedPage(null)} className="-m-1.5 p-1.5 flex items-center gap-2 hover:opacity-85 transition">
                            <span className="sr-only">Smart Recipe Generator</span>
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-500 flex items-center justify-center shadow-md">
                                <Image src="/recipe-nest-image1.png" alt="RecipeNest Logo" fill className="p-1 object-contain" />
                            </div>
                            <span className="font-extrabold text-lg text-neutral-800 tracking-tight font-heading">
                                Recipe<span className="text-brand-600">Nest</span>
                            </span>
                        </button>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-neutral-700 hover:bg-neutral-100 transition"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-8">
                        {navigation.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setSelectedPage(item.key)}
                                className={`text-sm font-semibold leading-6 transition duration-200 px-3 py-1.5 rounded-lg ${selectedPage === item.key ? 'text-brand-700 bg-brand-50' : 'text-neutral-600 hover:text-brand-600 hover:bg-neutral-50'}`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <button
                            className="text-sm font-bold leading-6 text-white bg-neutral-900 px-5 py-2.5 rounded-xl shadow-md hover:bg-neutral-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            onClick={onAuthenticate}
                        >
                            Log in with Google
                        </button>
                    </div>
                </nav>

                {/* Mobile menu dialog */}
                <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                    <div className="fixed inset-0 z-modal bg-neutral-900/20 backdrop-blur-sm" />
                    <DialogPanel className="fixed inset-y-0 right-0 z-modal w-full overflow-y-auto bg-[#fffbf2] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-neutral-900/10 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <button onClick={() => { setSelectedPage(null); setMobileMenuOpen(false); }} className="flex items-center gap-2">
                                <span className="sr-only">Smart Recipe Generator</span>
                                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-500 flex items-center justify-center">
                                    <Image src="/logo.svg" alt="RecipeNest Logo" fill className="p-1 object-contain" />
                                </div>
                                <span className="font-extrabold text-md text-neutral-800">RecipeNest</span>
                            </button>
                            <button
                                type="button"
                                className="-m-2.5 rounded-xl p-2.5 text-neutral-700 hover:bg-neutral-100 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-8 flow-root">
                            <div className="-my-6 divide-y divide-neutral-500/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                setSelectedPage(item.key);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 w-full text-left transition ${selectedPage === item.key ? 'text-brand-700 bg-brand-50' : 'text-neutral-700 hover:bg-neutral-50'}`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <button
                                        className="w-full flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3.5 text-base font-bold text-white shadow-md hover:bg-neutral-800 transition"
                                        onClick={onAuthenticate}
                                    >
                                        Log in with Google
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>

            {/* Main content section */}
            <div className="relative isolate px-6 pt-24 lg:px-8">
                {/* Visual Background Glow Shapes */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-15rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-accent-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulseGlow" />
                </div>

                <div className="mx-auto max-w-4xl py-12 sm:py-20 lg:py-24">
                    {selectedPage === null && (
                        <div className="hidden sm:mb-8 sm:flex sm:justify-center animate-fadeInUp">
                            <div className="relative rounded-full px-4 py-1.5 text-xs leading-6 text-neutral-600 ring-1 ring-neutral-200/80 bg-white/60 backdrop-blur-sm hover:ring-brand-300 transition duration-300">
                                Discover our brand new Groq AI generator.{' '}
                                <a href="/createRecipe" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 ml-1 hover:underline">
                                    Learn more <span aria-hidden="true">&rarr;</span>
                                </a>
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </div>

                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent-200 to-brand-200 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulseGlow" />
                </div>
            </div>
        </div>
    );
}
