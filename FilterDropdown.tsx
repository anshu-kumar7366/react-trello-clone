import React, { useState, useRef, useEffect } from 'react';

interface FilterDropdownProps {
  allLabels: string[];
  selectedLabels: string[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ allLabels, selectedLabels, setSelectedLabels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
      >
        Filter Labels {selectedLabels.length > 0 && `(${selectedLabels.length})`}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-gray-800 rounded-lg p-2 z-50 shadow-lg">
          {allLabels.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {allLabels.map(label => (
                <div 
                  key={label}
                  onClick={() => handleLabelToggle(label)}
                  style={{ backgroundColor: label }}
                  className={`h-8 w-full rounded cursor-pointer ${selectedLabels.includes(label) ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                ></div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm p-2">No labels found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;