import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  color: 'orange' | 'red' | 'blue' | 'green' | 'purple';
}

const colorMap = {
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600'
};

export const StatCard = ({ icon, label, value, unit, trend, color }: StatCardProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 hover:shadow-xl transition-all duration-300">
    {/* Gradient background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-5`}></div>

    {/* Content */}
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            <span className="text-xs font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <p className="text-neutral-600 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
        {unit && <span className="text-neutral-500 text-sm">{unit}</span>}
      </div>
    </div>
  </div>
);

export default StatCard;
