import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  const { theme } = useTheme();
  const cardClass = theme === 'dark'
    ? 'bg-[#111a11]/80 border-green-900/30'
    : 'bg-white/90 border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl backdrop-blur-lg border shadow-xl ${cardClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
