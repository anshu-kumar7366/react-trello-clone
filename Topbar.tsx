import React, { useState, useRef, useEffect } from 'react';
import { DueDateFilter } from '../types';
import FilterDropdown from './FilterDropdown';

interface TopbarProps {
  onAddList: () => void;
  onClearStorage: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allLabels: string[];
  selectedLabels: string[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
  dueDateFilter: DueDateFilter;
  setDueDateFilter: (filter: DueDateFilter) => void;
  onClearFilters: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ 
  onAddList, 
  onClearStorage,
  searchQuery,
  setSearchQuery,
  allLabels,
  selectedLabels,
  setSelectedLabels,
  dueDateFilter,
  setDueDateFilter,
  onClearFilters
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const hasActiveFilters = searchQuery || selectedLabels.length > 0 || dueDateFilter !== 'all';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-auto md:h-16 flex flex-col md:flex-row items-center justify-between gap-2 px-4 py-2 bg-black/25 flex-shrink-0">
      <div className="flex gap-3 items-center">
        <div className="font-bold text-lg hidden lg:block">React Trello Clone</div>
        
      </div>
      <div className="flex-grow flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full md:w-auto">
        <input 
          type="text"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-auto bg-white/10 text-white placeholder-gray-400 px-3 py-1.5 rounded-lg text-sm border-2 border-transparent focus:border-blue-500 outline-none"
        />
        <FilterDropdown
          allLabels={allLabels}
          selectedLabels={selectedLabels}
          setSelectedLabels={setSelectedLabels}
        />
        <select
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)}
          className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm border-2 border-transparent focus:border-blue-500 outline-none appearance-none"
        >
          <option value="all">All Due Dates</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="week">Due This Week</option>
        </select>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="text-blue-300 hover:text-blue-200 text-sm">Clear Filters</button>
        )}
      </div>
      <div className="relative" ref={profileRef}>
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg hover:bg-blue-700">
          AK
        </button>
        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-lg p-2 z-50 shadow-lg flex flex-col gap-1">
            <a href="#" className="text-left p-2 rounded hover:bg-white/10 w-full block text-sm">View Profile</a>
            <a href="#" className="text-left p-2 rounded hover:bg-white/10 w-full block text-sm">Settings</a>
            <hr className="border-white/10 my-1"/>
            <button onClick={onClearStorage} className="text-left p-2 rounded hover:bg-red-500/50 w-full text-red-300 text-sm">Clear Storage</button>
            <a href="#" className="text-left p-2 rounded hover:bg-white/10 w-full block text-sm">Logout</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;