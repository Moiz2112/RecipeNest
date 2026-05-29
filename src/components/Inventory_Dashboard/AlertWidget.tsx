import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AlertWidgetProps {
  alerts: Array<{
    _id: string;
    itemName: string;
    alertType: string;
    severity: string;
    message: string;
  }>;
  onMarkRead?: (id: string) => void;
}

const severityConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', label: 'text-red-700' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', label: 'text-yellow-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', label: 'text-blue-700' }
};

const getSeverityIcon = (severity: string) => {
  if (severity === 'critical') return <ExclamationTriangleIcon className="w-5 h-5" />;
  if (severity === 'warning') return <ExclamationTriangleIcon className="w-5 h-5" />;
  return <InformationCircleIcon className="w-5 h-5" />;
};

export const AlertWidget = ({ alerts, onMarkRead }: AlertWidgetProps) => {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
        <h3 className="text-lg font-bold text-neutral-900 mb-6">Recent Alerts</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-neutral-600 font-medium">All clear!</p>
          <p className="text-neutral-500 text-sm">No active alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
      <h3 className="text-lg font-bold text-neutral-900 mb-6">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => {
          const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
          return (
            <div
              key={alert._id}
              className={`${config.bg} ${config.border} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 group`}
              onClick={() => onMarkRead?.(alert._id)}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${config.icon}`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${config.label} font-semibold text-sm`}>{alert.itemName}</p>
                  <p className="text-neutral-700 text-sm mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {alerts.length > 5 && (
        <button className="w-full mt-4 px-4 py-2 text-brand-600 font-semibold text-sm hover:bg-brand-50 rounded-lg transition-colors">
          View All Alerts ({alerts.length})
        </button>
      )}
    </div>
  );
};

export default AlertWidget;
