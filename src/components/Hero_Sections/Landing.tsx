import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function Landing() {
    return (
        <div className="animate-fadeInUp mx-auto flex max-w-3xl flex-col items-center text-center gap-8 py-16 md:py-24 px-4">
            {/* Floating pill badge */}
            <div className="inline-flex items-center space-x-2 bg-brand-100/70 border border-brand-200/50 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-800 backdrop-blur-md animate-float">
                <span>✨ Supercharged by Groq AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-neutral-900 leading-tight">
                Whip Up <span className="text-gradient-gold">Culinary Magic</span>
            </h1>
            
            <p className="text-lg leading-relaxed text-neutral-600 max-w-xl">
                Instantly transform the ingredients in your fridge into mouthwatering, personalized recipes. Perfect meals, tailored by AI.
            </p>
            
            <button
                className="group relative flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-base font-bold text-white shadow-xl glow-gold hover:from-brand-600 hover:to-brand-700 transition duration-300 transform hover:-translate-y-0.5"
                onClick={() => signIn('google')}
            >
                Get started
                <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
        </div>
    );
}