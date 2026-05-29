import React from 'react';
import { signIn } from 'next-auth/react';
import { SparklesIcon, HeartIcon, BoltIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function Features({ resetPage }: { resetPage: () => void }) {
  const featureList = [
    {
      icon: <SparklesIcon className="h-7 w-7 text-brand-600" />,
      tagline: "ADVANCED REASONING ENGINE",
      title: "Llama 3.3 Culinary Brain",
      desc: "Instant recipe creation powered by Llama 3.3 through ultra-fast Groq APIs. The AI is trained to understand ingredient flavor harmony, moisture ratios, spice scaling, and culinary chemistry to ensure your generated meal is always gourmet."
    },
    {
      icon: <AdjustmentsHorizontalIcon className="h-7 w-7 text-accent-500" />,
      tagline: "HYPER-INDIVIDUALIZED NUTRITION",
      title: "Dynamic Dietary Precision",
      desc: "Take total control of your food. Filter recipes dynamically for standard diets like Vegan, Keto, or Gluten-Free, or specify exact nutritional targets, macro requirements, protein levels, and strict allergen filters."
    },
    {
      icon: <BoltIcon className="h-7 w-7 text-brand-500" />,
      tagline: "CONVERSATIONAL COOKING SUPPORT",
      title: "Real-Time Interactive Sous-Chef",
      desc: "Enjoy a personalized assistant at every step. While cooking, ask our contextual AI chef for safe ingredient substitutions, custom instruction adjustments, side dish pairings, or instant troubleshooting tips."
    },
    {
      icon: <HeartIcon className="h-7 w-7 text-accent-600" />,
      tagline: "CLOUD-SYNCED CULINARY ARCHIVE",
      title: "Premium Recipe Vault",
      desc: "Keep every successful experiment stored securely in your private cloud profile. Leave tasting notes, add personal ratings, organize your recipes into categories, and share them directly with other food lovers."
    }
  ];

  const stats = [
    { value: "< 200ms", label: "AI Response Speed" },
    { value: "10,000+", label: "Recognized Ingredients" },
    { value: "100%", label: "Zero-Waste Focus" },
    { value: "Unlimited", label: "Custom Generations" }
  ];

  return (
    <div className="animate-fadeInUp mx-auto flex max-w-6xl flex-col items-center gap-12 py-12 md:py-16 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 bg-accent-100/70 border border-accent-200/50 rounded-full px-4 py-1.5 text-xs font-bold text-accent-800 backdrop-blur-md">
          <span>🚀 CORE CAPABILITIES</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
          Features
        </h1>
        <p className="text-base md:text-lg text-neutral-600 max-w-2xl leading-relaxed">
          Explore what makes Smart Recipe Generator unique.
        </p>
      </div>

      {/* Feature list cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-4">
        {featureList.map((item, idx) => (
          <div 
            key={idx} 
            className="glass-card glass-card-hover p-6 rounded-2xl border border-white/60 shadow-md transition-all duration-300 relative group flex flex-col gap-4"
          >
            <div className="p-3 bg-brand-50 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <div>
              <span className="text-[10px] font-black text-accent-600 tracking-wider uppercase block mb-1">
                {item.tagline}
              </span>
              <h3 className="text-lg font-bold text-neutral-800 mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-white/60 text-center shadow-sm">
            <div className="text-3xl font-black text-brand-600 mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-neutral-500 tracking-wider uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Call to Actions */}
      <div className="flex gap-4 mt-4">
        <button
          className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-sm font-bold text-white shadow-lg glow-gold hover:from-brand-600 hover:to-brand-700 transition duration-300"
          onClick={() => signIn('google')}
        >
          Start Generating
        </button>
        <button
          className="rounded-xl bg-neutral-100 px-8 py-4 text-sm font-bold text-neutral-700 border border-neutral-200/60 hover:bg-neutral-200 transition duration-300"
          onClick={resetPage}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}