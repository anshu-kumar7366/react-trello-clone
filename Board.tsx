
import React, { useRef } from 'react';
import { Board as BoardType, List as ListType, PanelState } from '../types';
import List from './List';

interface BoardProps {
  board: BoardType;
  onOpenPanel: (state: PanelState) => void;
  updateList: (listId: string, updates: Partial<ListType>) => void;
  deleteList: (listId: string) => void;
  moveList: (fromIndex: number, toIndex: number) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, toIndex: number) => void;
}

const getListDragAfterElement = (container: HTMLElement, x: number): HTMLElement | null => {
    const draggableElements = [...container.querySelectorAll('.list-container:not(.opacity-50)')] as HTMLElement[];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null as (HTMLElement | null) }).element;
};

const getCardDragAfterElement = (container: HTMLElement, y: number): HTMLElement | null => {
    const draggableElements = [...container.querySelectorAll('[data-card-id]:not(.opacity-50)')] as HTMLElement[];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null as (HTMLElement | null) }).element;
};


const Board: React.FC<BoardProps> = ({ board, onOpenPanel, updateList, deleteList, moveList, moveCard }) => {
  const listPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const cardPlaceholderRef = useRef<HTMLDivElement | null>(null);
  
  const cleanupListDrag = () => {
    if (listPlaceholderRef.current) {
        listPlaceholderRef.current.remove();
        listPlaceholderRef.current = null;
    }
    document.querySelectorAll('.list-container.opacity-50').forEach(el => el.classList.remove('opacity-50'));
  };

  const cleanupCardDrag = () => {
      cardPlaceholderRef.current?.remove();
      cardPlaceholderRef.current = null;
  }

  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>, toListId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData('application/json');
    const placeholder = cardPlaceholderRef.current;

    // Ensure we have the necessary data and the placeholder exists in the DOM
    if (!data || !placeholder || !placeholder.parentElement) {
      cleanupCardDrag();
      return;
    }

    const { cardId, fromListId } = JSON.parse(data);
    
    const cardsContainer = placeholder.parentElement;
    
    // The drop index is determined by the placeholder's final position.
    const children = Array.from(cardsContainer.children);
    const toIndex = children.indexOf(placeholder);
    
    // Clean up the placeholder from the DOM *before* React re-renders.
    cleanupCardDrag();

    if (toIndex !== -1) {
      moveCard(cardId, fromListId, toListId, toIndex);
    }
  };

  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const isCardDrag = e.dataTransfer.types.includes('application/json');
    if (!isCardDrag) return;
    e.preventDefault();
    e.stopPropagation();

    const cardsContainer = (e.target as HTMLElement).closest('.cards-container');
    if (!cardsContainer) {
        cleanupCardDrag();
        return;
    }

    const afterElement = getCardDragAfterElement(cardsContainer as HTMLElement, e.clientY);
    
    if (!cardPlaceholderRef.current) {
        const ph = document.createElement('div');
        ph.className = 'bg-white/10 rounded-lg mb-2';
        const draggingEl = document.querySelector('[data-card-id].opacity-50');
        if (draggingEl) {
             ph.style.height = `${draggingEl.clientHeight}px`;
        } else {
             ph.style.height = '60px'; // Fallback
        }
        cardPlaceholderRef.current = ph;
    }

    if (afterElement) {
        cardsContainer.insertBefore(cardPlaceholderRef.current, afterElement);
    } else {
        cardsContainer.appendChild(cardPlaceholderRef.current);
    }
  };


  const handleListDragStart = (e: React.DragEvent<HTMLDivElement>, fromIndex: number) => {
    e.dataTransfer.setData('application/trello-list-index', String(fromIndex));
  };

  const handleListDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const isListDrag = e.dataTransfer.types.includes('application/trello-list-index');
    if (!isListDrag) return;

    e.preventDefault();
    const container = e.currentTarget;
    const draggingEl = container.querySelector('.list-container.opacity-50') as HTMLElement;
    if (!draggingEl) return;

    if (!listPlaceholderRef.current) {
        const ph = document.createElement('div');
        ph.className = 'w-[300px] sm:w-[86%] md:w-[300px] flex-shrink-0 rounded-xl bg-black/20';
        ph.style.height = `${draggingEl.offsetHeight}px`;
        listPlaceholderRef.current = ph;
    }

    const afterElement = getListDragAfterElement(container, e.clientX);
    if (afterElement) {
        container.insertBefore(listPlaceholderRef.current, afterElement);
    } else {
        container.appendChild(listPlaceholderRef.current);
    }
  };

  const handleListDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const fromIndexStr = e.dataTransfer.getData('application/trello-list-index');
    if (!fromIndexStr) return;
    
    e.preventDefault();
    const fromIndex = parseInt(fromIndexStr, 10);
    
    if (listPlaceholderRef.current) {
      const container = e.currentTarget;
      const children = Array.from(container.children);
      let toIndex = children.indexOf(listPlaceholderRef.current);
      
      cleanupListDrag();

      if (toIndex === -1) return;
      
      const correctedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      
      if (fromIndex !== correctedToIndex) {
          moveList(fromIndex, correctedToIndex);
      }
    } else {
      cleanupListDrag();
    }
  };


  return (
    <div 
      className="flex gap-4 p-4 items-start h-full"
      onDrop={handleListDrop}
      onDragOver={handleListDragOver}
      onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              cleanupListDrag();
              cleanupCardDrag();
          }
      }}
    >
      {board.map((list, index) => (
        <List
          key={list.id}
          list={list}
          listIndex={index}
          boardSize={board.length}
          onOpenPanel={onOpenPanel}
          updateList={updateList}
          deleteList={deleteList}
          moveList={moveList}
          onCardDrop={(e) => handleCardDrop(e, list.id)}
          onCardDragOver={handleCardDragOver}
          onCardDragEndCleanup={cleanupCardDrag}
          onListDragStart={(e) => handleListDragStart(e, index)}
          onListDragEnd={cleanupListDrag}
        />
      ))}
    </div>
  );
};

export default Board;
