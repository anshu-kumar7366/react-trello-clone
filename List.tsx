
import React, { useState, useRef, useEffect } from 'react';
import { List as ListType, Member } from '../types';
import Card from './Card';

interface ListProps {
  list: ListType;
  listIndex: number;
  boardSize: number;
  onOpenPanel: (state: { mode: 'add' | 'edit'; listId: string; cardId?: string }) => void;
  updateList: (listId: string, updates: Partial<ListType>) => void;
  deleteList: (listId: string) => void;
  moveList: (fromIndex: number, toIndex: number) => void;
  onCardDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardDragEndCleanup: () => void;
  onListDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onListDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const List: React.FC<ListProps> = ({ list, listIndex, boardSize, onOpenPanel, updateList, deleteList, moveList, onCardDrop, onCardDragOver, onCardDragEndCleanup, onListDragStart, onListDragEnd }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberInitials, setNewMemberInitials] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsAddingMember(false); // Also reset form view
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTitleBlur = () => {
    if (titleRef.current && titleRef.current.innerText !== list.title) {
      updateList(list.id, { title: titleRef.current.innerText });
    }
  };
  
  const handleColorChange = () => {
    const color = prompt('Enter a new color (e.g., #7a5b0a) or leave blank for default:', list.color);
    if (color !== null) {
      updateList(list.id, { color });
    }
    setDropdownOpen(false);
  }
  
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberInitials.trim()) {
      alert('Both name and initials are required.');
      return;
    }

    const newMember: Member = { 
      name: newMemberName.trim(), 
      initials: newMemberInitials.trim().toUpperCase() 
    };

    if (list.members.find(m => m.initials.toLowerCase() === newMember.initials.toLowerCase())) {
        alert('Member with these initials already exists in this list.');
    } else {
        updateList(list.id, { members: [...list.members, newMember] });
        setNewMemberName('');
        setNewMemberInitials('');
        setIsAddingMember(false);
        setDropdownOpen(false);
    }
  };

  const handleMoveList = () => {
    const direction = prompt(`Type "L" to move left, "R" to move right, or a position number (1-${boardSize})`);
    if (!direction) return;

    if (direction.toUpperCase() === 'L') {
        moveList(listIndex, Math.max(0, listIndex - 1));
    } else if (direction.toUpperCase() === 'R') {
        moveList(listIndex, Math.min(boardSize - 1, listIndex + 1));
    } else {
        const pos = parseInt(direction, 10);
        if (!isNaN(pos) && pos >= 1 && pos <= boardSize) {
            moveList(listIndex, pos - 1);
        } else {
            alert('Invalid input.');
        }
    }
    setDropdownOpen(false);
  }
  
  const handleListDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const isCardDrag = (e.target as HTMLElement).closest('[data-card-id]');
    if (isCardDrag) {
      return;
    }
    onListDragStart(e);
    e.currentTarget.classList.add('opacity-50');
  };

  return (
    <div
      draggable
      onDragStart={handleListDragStart}
      onDragEnd={onListDragEnd}
      className="list-container w-[300px] sm:w-[86%] md:w-[300px] flex-shrink-0 rounded-xl p-3 shadow-2xl h-fit max-h-[calc(100%-1rem)] flex flex-col"
      style={{ backgroundColor: list.color || 'rgba(0,0,0,0.26)' }}
    >
      <div className="list-header flex justify-between items-start gap-2 mb-3 flex-shrink-0 cursor-grab">
        <div>
           <div 
             ref={titleRef}
             contentEditable
             suppressContentEditableWarning
             onBlur={handleTitleBlur}
             className="font-bold text-lg outline-none focus:bg-white/10 rounded px-1"
           >{list.title}</div>
            <div className="flex gap-1.5 items-center mt-2">
                {(list.members || []).slice(0, 5).map(m => (
                    <div key={m.initials} className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-black/25" title={m.name}>
                        {m.initials}
                    </div>
                ))}
            </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1.5 rounded-md hover:bg-white/10 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-black/80 backdrop-blur-sm rounded-lg p-2 z-40 flex flex-col gap-1">
              {isAddingMember ? (
                <form onSubmit={handleAddMemberSubmit}>
                  <h4 className="font-semibold text-center mb-2">Add New Member</h4>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full p-1.5 rounded bg-white/10 text-white mb-2 text-sm"
                    autoFocus
                  />
                  <input 
                    type="text" 
                    placeholder="Initials (e.g., AK)"
                    value={newMemberInitials}
                    onChange={(e) => setNewMemberInitials(e.target.value.substring(0,2).toUpperCase())}
                    maxLength={2}
                    className="w-full p-1.5 rounded bg-white/10 text-white mb-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-sm">Add</button>
                    <button type="button" onClick={() => setIsAddingMember(false)} className="flex-1 p-1.5 rounded bg-gray-600 hover:bg-gray-700 text-sm">Back</button>
                  </div>
                </form>
              ) : (
                <>
                  <button onClick={() => { onOpenPanel({ mode: 'add', listId: list.id }); setDropdownOpen(false); }} className="text-left p-2 rounded hover:bg-white/10 w-full">+ Add Card</button>
                  <button onClick={handleColorChange} className="text-left p-2 rounded hover:bg-white/10 w-full">🎨 Change Color</button>
                  <button onClick={() => setIsAddingMember(true)} className="text-left p-2 rounded hover:bg-white/10 w-full">👤 Assign Member</button>
                  <button onClick={handleMoveList} className="text-left p-2 rounded hover:bg-white/10 w-full">↔️ Move List</button>
                  <button onClick={() => deleteList(list.id)} className="text-left p-2 rounded hover:bg-red-500/50 w-full text-red-300">🗑️ Delete List</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="cards-container -mx-1 px-1 flex-1 overflow-y-auto min-h-[20px]" onDrop={onCardDrop} onDragOver={onCardDragOver}>
        {list.cards.map(card => (
          <Card key={card.id} card={card} listId={list.id} onOpenPanel={onOpenPanel} onDragEndCleanup={onCardDragEndCleanup} />
        ))}
      </div>
    </div>
  );
};

export default List;
