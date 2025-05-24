// src/components/CorrectionSelect.jsx
import React from 'react';
import { Loader } from 'lucide-react';
import { useChildItems } from '../hooks/useChildItems';
import uniqBy from 'lodash/uniqBy';

export function CorrectionSelect({
  index,
  value,
  chapter,
  parentName,
  parentDigit,
  parentGroup,
  chapterNames,
  onChange,
}) {
  const isFirstLevel = index === 0;
  const { childItems, loading, error } = useChildItems(chapter, index, parentName);
  // Only disable for levels > 0 when no parentCode
  const disabled = !isFirstLevel && !parentName;

  // remove duplicate options
  const options = uniqBy(childItems.filter(item => {
    return item.name === parentName && (item.digit === parseInt(parentDigit) || !parentDigit) && 
      (item.group === parseInt(parentGroup) || !parentGroup)
  }), item => `${item.child_name}-${item.child_digit}-${item.child_group}`)

  if (!isFirstLevel && options.length === 0) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center">
        <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
        <div className="flex-1 text-sm text-red-500 py-1">
          Error loading options: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="text-xs text-gray-400 w-6">{isFirstLevel ? '前5碼' : `第${index + 5}碼`}.</span>
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-1">
          <Loader className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      ) : (
        <select
          className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">
            {isFirstLevel ? 'Select chapter' : value ? value : 'Select item'}
          </option>
          {isFirstLevel
            ? chapterNames?.map((item, idx) => (
                <option key={idx} value={`${item.chapter}-${item.name}`}>
                  {item.chapter} - {item.name}
                </option>
              ))
            : options.map((item, idx) => {
                return (
                  <option key={idx} value={`${item.child_code}-${item.child_name}-${item.child_digit}-${item.child_group}`}>
                    {item.child_code} - {item.child_name}
                  </option>
                )
              })}
        </select>
      )}
    </div>
  );
}
