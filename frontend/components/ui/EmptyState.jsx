import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon: Icon = FiInbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="text-gray-400 text-3xl" />
      </div>
      <h3 className="font-semibold text-gray-700 text-lg mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
