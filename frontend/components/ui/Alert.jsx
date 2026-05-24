import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const variants = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: FiCheckCircle, iconColor: 'text-green-500' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: FiAlertTriangle, iconColor: 'text-yellow-500' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: FiXCircle, iconColor: 'text-red-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: FiInfo, iconColor: 'text-blue-500' },
};

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const v = variants[type];
  const Icon = v.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${v.bg} ${v.border}`}>
      <Icon className={`${v.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${v.text} flex-1`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`${v.iconColor} hover:opacity-70`}>
          <FiX />
        </button>
      )}
    </div>
  );
}
