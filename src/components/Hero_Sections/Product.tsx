import { signIn } from 'next-auth/react';
import { SparklesIcon, CursorArrowRaysIcon, BookmarkSquareIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';

export default function Product({ resetPage }: { resetPage: () => void }) {
  const steps = [
    {
      icon: <CursorArrowRaysIcon className="h-7 w-7 text-brand-600" />,
      step: "Step 1",
      tagline: "ZERO WASTE COOKING",
      title: "Smart Pantry Input",
      desc: "Simply enter the ingredients remaining in your fridge or pantry. Our intelligent autocompletion system recognizes thousands of items, spices, and proteins, allowing you to maximize ingredients and eliminate food waste."
    },
    {
      icon: <SparklesIcon className="h-7 w-7 text-accent-500" />,
      step: "Step 2",
      tagline: "TAILORED TO YOUR BODY",
      title: "Hyper-Personalized Filtering",
      desc: "Configure your exact dietary goals and restrictions. Whether you follow a strict Keto regimen, Low-FODMAP, high-protein muscle building, or have specific allergen limitations, the engine structures recommendations to fit."
    },
    {
      icon: <BookmarkSquareIcon className="h-7 w-7 text-brand-500" />,
      step: "Step 3",
      tagline: "LLAMA 3.3 & GROQ AI",
      title: "Instant AI Generation",
      desc: "Watch as our real-time AI analyzes your ingredients and creates three tailored recipes. Each generation includes exact preparation times, caloric and macronutrient breakdowns, precise measurements, and plating tips."
    },
    {
      icon: <HandThumbUpIcon className="h-7 w-7 text-accent-600" />,
      step: "Step 4",
      tagline: "YOUR VIRTUAL SOUS CHEF",
      title: "Interactive Kitchen Guide",
      desc: "Follow clear, easy-to-read cooking steps. Save your favorite culinary creations to your cloud-sync profile, leave cooking notes for next time, or ask the real-time AI Sous-Chef chat assistant for substitutions."
    }
  ];

  return (
    <div className="animate-fadeInUp mx-auto flex max-w-6xl flex-col items-center gap-12 py-12 md:py-16 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 bg-brand-100/70 border border-brand-200/50 rounded-full px-4 py-1.5 text-xs font-bold text-brand-800 backdrop-blur-md">
          <span>🍳 THE INTELLIGENT CULINARY ENGINE</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
          Our Product
        </h1>
        <p className="text-base md:text-lg text-neutral-600 max-w-2xl leading-relaxed">
          Learn how Smart Recipe Generator makes meal planning effortless.
        </p>
      </div>

      {/* Grid Layout of steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
        {steps.map((item, idx) => (
          <div 
            key={idx} 
            className="flex flex-col p-6 glass-card glass-card-hover rounded-2xl border border-white/60 shadow-md transition-all duration-300 relative group"
          >
            {/* Step Number Badge */}
            <div className="absolute top-4 right-4 bg-brand-50 text-brand-700 text-xs font-black px-2.5 py-1 rounded-full border border-brand-100">
              {item.step}
            </div>

            {/* Icon Container with subtle glow */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-neutral-100/80 w-fit flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-accent-600 tracking-wider uppercase block mb-1">
                  {item.tagline}
                </span>
                <h3 className="text-lg font-bold text-neutral-800 tracking-tight leading-snug mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Under the Hood technical spotlight */}
      <div className="w-full glass-card p-8 rounded-2xl border border-white/60 shadow-md text-left mt-4 flex flex-col md:flex-row items-center gap-8">
        <div className="text-5xl md:text-6xl flex-shrink-0 animate-bounce">⚡</div>
        <div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Under the Hood: The Llama 3.3 Culinary Brain</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Every time you search, our system connects directly to the Llama 3.3 model via high-speed Groq API endpoints. Instead of static mock data or simple keyword matching, the AI evaluates ingredient flavor compatibility, cooking chemistry, and preparation logistics dynamically in under 200 milliseconds to construct custom recipes.
          </p>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="flex gap-4 mt-4">
        <button
          className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-sm font-bold text-white shadow-lg glow-gold hover:from-brand-600 hover:to-brand-700 transition duration-300"
          onClick={() => signIn('google')}
        >
          Get Started Now
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
