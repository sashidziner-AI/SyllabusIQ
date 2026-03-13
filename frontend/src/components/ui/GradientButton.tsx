import { motion } from 'framer-motion';
import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function GradientButton({
  children,
  variant = 'primary',
  isLoading,
  className,
  ...props
}: GradientButtonProps) {
  const variants = {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-gray-600 to-gray-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </motion.button>
  );
}
