import React, { useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

type DateRange = {
  start: string;
  end: string;
};

type DateRangePickerProps = {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  presets?: Array<{
    label: string;
    value: DateRange;
  }>;
  className?: string;
};

const defaultPresets = [
  {
    label: 'Today',
    value: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  },
  {
    label: 'Yesterday',
    value: {
      start: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      end: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    }
  },
  {
    label: 'Last 7 days',
    value: {
      start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  },
  {
    label: 'Last 30 days',
    value: {
      start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  },
  {
    label: 'This month',
    value: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  },
  {
    label: 'Last month',
    value: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
    }
  }
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  presets = defaultPresets,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value || { start: '', end: '' });

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  const handlePresetClick = (preset: DateRange) => {
    setTempRange(preset);
    onChange(preset);
    setIsOpen(false);
  };

  const handleCustomRangeApply = () => {
    if (tempRange.start && tempRange.end) {
      onChange(tempRange);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempRange({ start: '', end: '' });
    onChange(undefined);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.start || !range.end) return 'Select date range';
    
    const startDate = new Date(range.start).toLocaleDateString();
    const endDate = new Date(range.end).toLocaleDateString();
    
    if (range.start === range.end) {
      return startDate;
    }
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDateRange(value || { start: '', end: '' })}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Select</h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset.value)}
                    className="px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Custom Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempRange.start}
                    onChange={(e) => setTempRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempRange.end}
                    onChange={(e) => setTempRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!tempRange.start || !tempRange.end}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
