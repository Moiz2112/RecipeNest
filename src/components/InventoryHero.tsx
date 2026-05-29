import { useRouter } from 'next/router';
import { SparklesIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-brand-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-brand-100/50 hover:border-brand-200 backdrop-blur-md">
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-brand-400/0 via-brand-400/5 to-brand-400/0 group-hover:from-brand-400/10 group-hover:via-brand-400/20 group-hover:to-brand-400/10 transition-all duration-500"></div>

    {/* Content */}
    <div className="relative z-10">
      <div className="mb-4 transform transition-transform group-hover:scale-110 group-hover:-translate-y-1 duration-300 text-3xl">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>

    {/* Animated border glow on hover */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-brand-400/20 via-transparent to-brand-400/20 pointer-events-none"></div>
  </div>
);

export default function InventoryHero() {
  const router = useRouter();

  const features = [
    {
      icon: '📦',
      title: 'Live Inventory Tracking',
      description: 'Monitor all your groceries in real-time'
    },
    {
      icon: '⏰',
      title: 'Expiry Monitoring',
      description: 'Never waste food again with smart alerts'
    },
    {
      icon: '🔔',
      title: 'Low Stock Alerts',
      description: 'Get notified when items are running low'
    },
    {
      icon: '📊',
      title: 'Consumption Analytics',
      description: 'Understand your usage patterns'
    },
    {
      icon: '🛒',
      title: 'Smart Restocking',
      description: 'AI-powered shopping recommendations'
    },
    {
      icon: '🍳',
      title: 'Recipe Ingredient Sync',
      description: 'Auto-deduct ingredients when cooking'
    }
  ];

  return (
    <div className="relative min-h-[700px] w-full overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100/30 animate-gradientMove" style={{
        backgroundSize: '200% 200%'
      }}></div>

      {/* Floating decoration elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-brand-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-40 left-20 w-72 h-72 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-brand-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="animate-fadeInUp mb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-brand-100/70 border border-brand-200/50 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-800 backdrop-blur-md mb-6 animate-float">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>New Feature</span>
          </div>

          {/* Main heading */}
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-neutral-900 leading-tight mb-4">
            Smart Kitchen <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700">Inventory</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl leading-relaxed text-neutral-600 max-w-2xl mx-auto">
            Manage your groceries, reduce waste, track usage, and never run out of ingredients again.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
              <FeatureCard
                icon={<span className="text-4xl">{feature.icon}</span>}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="animate-fadeInUp flex flex-col sm:flex-row gap-4 justify-center items-center pt-8" style={{ animationDelay: '600ms' }}>
          <button
            onClick={() => router.push('/inventory/dashboard')}
            className="group relative flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></span>
            <span className="relative flex items-center gap-2">
              Open Inventory Dashboard
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </button>

          <button
            onClick={() => router.push('/inventory/add-item')}
            className="group relative flex items-center justify-center rounded-xl border-2 border-brand-500 bg-transparent px-8 py-4 text-base font-bold text-brand-600 shadow-md hover:bg-brand-50 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="relative flex items-center gap-2">
              Add Your First Item
              <ArrowTrendingDownIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
}
