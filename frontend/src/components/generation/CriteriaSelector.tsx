import { useState } from 'react';
import { motion } from 'framer-motion';
import type { NOSUnit } from '../../types/document';

interface CriteriaSelectorProps {
  nosUnits: NOSUnit[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function CriteriaSelector({ nosUnits, selectedIds, onSelectionChange }: CriteriaSelectorProps) {
  const allCriteriaIds = nosUnits.flatMap((u) => u.criteria.map((c) => c.id));
  const allSelected = allCriteriaIds.length > 0 && allCriteriaIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : allCriteriaIds);
  };

  const toggleCriterion = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id],
    );
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded text-purple-500" />
        <span className="font-medium text-gray-700">Select All ({allCriteriaIds.length} criteria)</span>
      </label>

      {nosUnits.map((unit) => (
        <div key={unit.id} className="ml-4 space-y-1">
          <p className="font-medium text-sm text-purple-600">{unit.unit_code} - {unit.unit_title}</p>
          {unit.criteria.map((c) => (
            <motion.label
              key={c.id}
              whileHover={{ x: 3 }}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 ml-4"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(c.id)}
                onChange={() => toggleCriterion(c.id)}
                className="w-3.5 h-3.5 rounded text-purple-500"
              />
              <span className="font-mono text-purple-400">{c.criterion_code}</span>
              <span className="truncate">{c.criterion_text}</span>
            </motion.label>
          ))}
        </div>
      ))}
    </div>
  );
}
