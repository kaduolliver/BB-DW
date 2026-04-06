import { CheckCircle, XCircle } from 'lucide-react';

export default function PasswordCriteria({ senha, criteria }) {
  return (
    <ul className="text-sm mt-2 space-y-1">
      {Object.entries(criteria).map(([key, crit]) => {
        const passed = crit.test(senha);
        return (
          <li key={key} className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {crit.label}
          </li>
        );
      })}
    </ul>
  );
}