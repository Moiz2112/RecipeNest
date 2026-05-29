interface BarChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color?: string;
  maxValue?: number;
}

export const BarChart = ({ title, data, color = 'bg-brand-500', maxValue }: BarChartProps) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
      <h3 className="text-lg font-bold text-neutral-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.slice(0, 8).map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 truncate">{item.name}</span>
              <span className="text-sm font-bold text-neutral-900">{item.value}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500 rounded-full`}
                style={{ width: `${(item.value / max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LineChartProps {
  title: string;
  data: { [key: string]: number };
  color?: string;
}

export const LineChart = ({ title, data, color = 'bg-brand-500' }: LineChartProps) => {
  const entries = Object.entries(data).slice(-30);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
      <h3 className="text-lg font-bold text-neutral-900 mb-6">{title}</h3>
      <div className="flex items-end justify-center gap-1 h-48">
        {entries.map(([date, value], index) => (
          <div
            key={index}
            className="flex-1 group relative"
            style={{ height: `${max > 0 ? (value / max) * 100 : 0}%` }}
          >
            <div className={`w-full h-full ${color} rounded-t opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer relative group`}>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-xs text-neutral-500">
        <span>{entries[0]?.[0] || ''}</span>
        <span>{entries[entries.length - 1]?.[0] || ''}</span>
      </div>
    </div>
  );
};

interface PieChartProps {
  title: string;
  data: Array<{ name: string; value: number; color: string }>;
}

export const PieChart = ({ title, data }: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
      <h3 className="text-lg font-bold text-neutral-900 mb-6">{title}</h3>
      <div className="flex flex-col gap-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-neutral-900">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InventoryCharts = { BarChart, LineChart, PieChart };

export default InventoryCharts;
