import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { NOSUnit } from '../../types/document';
import { useTheme } from '../../context/ThemeContext';

interface NOSUnitAccordionProps {
  unit: NOSUnit;
}

export function NOSUnitAccordion({ unit }: NOSUnitAccordionProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const borderClass = theme === 'dark' ? 'border-green-900/30' : 'border-gray-200';
  const borderSubtle = theme === 'dark' ? 'border-green-900/20' : 'border-gray-200';

  return (
    <div className={`border ${borderClass} rounded-xl overflow-hidden`}>
      <motion.button
        whileHover={{ backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.03)' }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <span className="font-mono text-sm text-green-500">{unit.unit_code}</span>
          <h4 className="font-medium theme-text-heading">{unit.unit_title}</h4>
          <span className="text-sm theme-text-muted">{unit.criteria.length} criteria</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-t ${borderSubtle}`}
          >
            <div className="p-4 space-y-2">
              {unit.criteria.map((criterion) => (
                <div key={criterion.id} className="flex gap-3 text-sm">
                  <span className="font-mono text-green-500 shrink-0">{criterion.criterion_code}</span>
                  <span className="theme-text-secondary">{criterion.criterion_text}</span>
                  {criterion.page_reference && (
                    <span className="theme-text-muted shrink-0">p.{criterion.page_reference}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
