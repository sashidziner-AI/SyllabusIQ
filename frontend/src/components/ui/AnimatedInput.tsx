import { motion } from 'framer-motion';
import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const { theme } = useTheme();
    const inputBg = theme === 'dark'
      ? 'bg-[#0a0f0a] text-gray-200 placeholder-gray-500 border-gray-700'
      : 'bg-gray-50 text-gray-700 placeholder-gray-400 border-gray-300';

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium theme-text-secondary mb-1">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 focus:border-green-500 outline-none transition-colors',
            inputBg,
            error ? 'border-red-500' : '',
            className,
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);
AnimatedInput.displayName = 'AnimatedInput';
