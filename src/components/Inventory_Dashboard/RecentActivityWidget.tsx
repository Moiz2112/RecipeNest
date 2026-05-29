import { formatDistance } from 'date-fns';

interface ActivityItem {
  _id: string;
  type: string;
  quantity: number;
  source: string;
  createdAt: string | Date;
}

interface RecentActivityWidgetProps {
  activities: ActivityItem[];
}

const getActivityIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    add: '➕',
    update: '✏️',
    consume: '🍴',
    'recipe-deduction': '🍳',
    delete: '🗑️'
  };
  return icons[type] || '📝';
};

const getActivityColor = (type: string) => {
  const colors: { [key: string]: string } = {
    add: 'text-green-600 bg-green-50',
    update: 'text-blue-600 bg-blue-50',
    consume: 'text-orange-600 bg-orange-50',
    'recipe-deduction': 'text-brand-600 bg-brand-50',
    delete: 'text-red-600 bg-red-50'
  };
  return colors[type] || 'text-neutral-600 bg-neutral-50';
};

export const RecentActivityWidget = ({ activities }: RecentActivityWidgetProps) => {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
        <h3 className="text-lg font-bold text-neutral-900 mb-6">Activity History</h3>
        <p className="text-neutral-500 text-center py-8">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
      <h3 className="text-lg font-bold text-neutral-900 mb-6">Activity History</h3>
      <div className="space-y-4">
        {activities.slice(0, 8).map((activity) => (
          <div key={activity._id} className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-b-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 capitalize">
                {activity.type === 'recipe-deduction' ? 'Recipe Deduction' : activity.type}
              </p>
              <p className="text-xs text-neutral-500">{activity.source}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold text-neutral-900">{activity.quantity}</p>
              <p className="text-xs text-neutral-500">
                {formatDistance(new Date(activity.createdAt), new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityWidget;
