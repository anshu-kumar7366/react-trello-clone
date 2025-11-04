import React from 'react';
import { Card as CardType } from '../types';
import { formatDate } from '../utils/helpers';

interface CardProps {
  card: CardType;
  listId: string;
  onOpenPanel: (state: { mode: 'edit'; listId: string; cardId: string }) => void;
  onDragEndCleanup: () => void;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const baseClasses = "px-2 py-1 rounded-md text-white font-bold text-xs";
  switch (priority) {
    case 'High': return <span className={`${baseClasses} bg-[#d64545]`}>H</span>;
    case 'Medium': return <span className={`${baseClasses} bg-[#e6a23c]`}>M</span>;
    case 'Low': return <span className={`${baseClasses} bg-[#4caf50]`}>L</span>;
    default: return null;
  }
};

const AttachmentPreview: React.FC<{ card: CardType }> = ({ card }) => {
  if (!card.attachment) {
    return null;
  }

  if (card.attachmentType?.startsWith('image')) {
    return (
      <div className="mt-2 rounded-md overflow-hidden max-h-32">
        <img src={card.attachment} alt="attachment" className="w-full object-cover" />
      </div>
    );
  }

  if (card.attachmentType?.startsWith('video')) {
    return (
      <div className="mt-2 p-2 bg-black/20 rounded-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
        <span className="text-xs text-gray-300 truncate">{card.attachmentName || 'Video Attached'}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-black/20 rounded-md flex items-center gap-2">
       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span className="text-xs text-gray-300 truncate">{card.attachmentName || 'File Attached'}</span>
    </div>
  );
}


const Card: React.FC<CardProps> = ({ card, listId, onOpenPanel, onDragEndCleanup }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id, listId }));
    e.currentTarget.classList.add('opacity-50', 'rotate-2');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'rotate-2');
    onDragEndCleanup();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenPanel({ mode: 'edit', listId, cardId: card.id })}
      className="bg-white/5 hover:bg-white/10 p-2.5 rounded-lg cursor-grab mb-2 shadow-lg"
      style={{ backgroundColor: card.color }}
      data-card-id={card.id}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-semibold">{card.text}</span>
        {card.priority && <PriorityBadge priority={card.priority} />}
      </div>

      {(card.labels && card.labels.length > 0) && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {card.labels.map((label, index) => (
            <span key={index} className="px-2 py-1 rounded-full text-xs h-2 w-8 block" style={{ backgroundColor: label }}></span>
          ))}
        </div>
      )}

      <AttachmentPreview card={card} />

      <div className="flex justify-between items-center mt-2.5 gap-2">
        <div className="flex gap-1.5 -space-x-2">
          {(card.members || []).map(m => (
            <div key={m.initials} className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-black/25 border-2 border-slate-700" title={m.name}>
              {m.initials}
            </div>
          ))}
        </div>
        {card.due && <div className="text-xs bg-black/25 px-2 py-1 rounded-md">{formatDate(card.due)}</div>}
      </div>
    </div>
  );
};

export default Card;