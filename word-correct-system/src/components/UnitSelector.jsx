import React from 'react';
import { Loader } from 'lucide-react';
import { useChapterUnit } from '../hooks/useChapterUnit';

export function UnitSelect({ chapter, value, onChange }) {
  const { units, loading, error } = useChapterUnit(chapter);

  return (
    <div className="flex items-center">
      <span className="text-xs text-gray-400 w-6">單位</span>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-1">
          <Loader className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 text-sm text-red-500 py-1">
          Error loading units: {error}
        </div>
      ) : (
        <select
          className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={!chapter || units.length === 0}
        >
          <option value="">
            {chapter ? (value ? value : 'Select unit') : '請先選擇章節'}
          </option>
          {units.map(({ name, code }) => (
            <option key={code} value={code + '-' + name}>
              {code} - {name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
