import { InputMask } from '@react-input/mask';

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  mask,
  icon: Icon,
  className = '',
  inputClassName = '',
}) {
  const baseInputClass = 'w-full bg-transparent outline-none text-gray-900 dark:text-white';
  const containerClass =
    'flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-amber-600';

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}

      <div className={`${containerClass}`}>
        {Icon && <Icon className="text-gray-400 mr-2" size={18} />}
        {mask ? (
          <InputMask
            mask={mask}
            replacement={{ _: /\d/ }}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseInputClass} ${inputClassName}`}
            required
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={`${baseInputClass} ${inputClassName}`}
            required
          />
        )}
      </div>
    </div>
  );
}
