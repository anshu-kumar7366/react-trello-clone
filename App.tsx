import React, { useState, useCallback, useMemo } from 'react';
import { Board as BoardType, Card as CardType, List as ListType, PanelState, DueDateFilter } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { genId, isPast, isToday, isWithinNextWeek } from './utils/helpers';
import Topbar from './components/Topbar';
import Board from './components/Board';
import CardPanel from './components/CardPanel';
import BottomNav from './components/BottomNav';
import InboxPanel from './components/InboxPanel';
import PlannerPanel from './components/PlannerPanel';

const defaultBoard: BoardType = [
  { id: genId(), title: 'Trello Starter Guide', color:'', members:[{name:'Anshu Kumar',initials:'AK'}], cards:[
      { id: genId(), text:'New to Trello? Start here', description:'Welcome', labels:['#80d8ff'], members:[{name:'Anshu Kumar',initials:'AK'}], due:'', priority:'Medium', color:'', attachment:null, attachmentType:'', attachmentName:'' }
  ]},
  { id: genId(), title: 'Today', color:'#7a5b0a', members:[], cards:[] },
  { id: genId(), title: 'This Week', color:'#125a44', members:[], cards:[] },
  { id: genId(), title: 'Later', color:'#0f0f0f', members:[], cards:[] }
];

const App: React.FC = () => {
  const [board, setBoard] = useLocalStorage<BoardType>('trello_clone_complete_v1', defaultBoard);
  const [panelState, setPanelState] = useState<PanelState | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');


  const handleAddList = useCallback(() => {
    const title = prompt('List title:');
    if (title) {
      const newList: ListType = { id: genId(), title, color: '', members: [], cards: [] };
      setBoard(prevBoard => [...prevBoard, newList]);
    }
  }, [setBoard]);
  
  const handleClearStorage = useCallback(() => {
    if(window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('trello_clone_complete_v1');
        window.location.reload();
    }
  }, []);

  const handleOpenPanel = useCallback((state: PanelState) => {
    setPanelState(state);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelState(null);
  }, []);

  const handleOpenInbox = useCallback(() => {
    setIsInboxOpen(true);
  }, []);

  const handleCloseInbox = useCallback(() => {
    setIsInboxOpen(false);
  }, []);

  const handleOpenPlanner = useCallback(() => {
    setIsPlannerOpen(true);
  }, []);

  const handleClosePlanner = useCallback(() => {
    setIsPlannerOpen(false);
  }, []);

  const handleSaveCard = useCallback((cardData: CardType, listId: string) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const listIndex = newBoard.findIndex(l => l.id === listId);
      if (listIndex === -1) return prevBoard;

      const list = { ...newBoard[listIndex] };
      const cardIndex = list.cards.findIndex(c => c.id === cardData.id);

      if (cardIndex > -1) { // Edit existing card
        list.cards[cardIndex] = cardData;
      } else { // Add new card
        list.cards.push(cardData);
      }
      
      // Ensure all assigned members are in the list members
      cardData.members?.forEach(member => {
          if (!list.members.find(m => m.initials === member.initials)) {
              list.members.push(member);
          }
      });

      newBoard[listIndex] = list;
      return newBoard;
    });
    handleClosePanel();
  }, [setBoard, handleClosePanel]);

  const handleDeleteCard = useCallback((cardId: string, listId: string) => {
    if (window.confirm('Delete this card?')) {
        setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            const listIndex = newBoard.findIndex(l => l.id === listId);
            if (listIndex === -1) return prevBoard;

            const list = { ...newBoard[listIndex] };
            list.cards = list.cards.filter(c => c.id !== cardId);
            newBoard[listIndex] = list;
            return newBoard;
        });
        handleClosePanel();
    }
  }, [setBoard, handleClosePanel]);

  const updateList = useCallback((listId: string, updates: Partial<ListType>) => {
      setBoard(prevBoard => {
          return prevBoard.map(list => list.id === listId ? {...list, ...updates} : list);
      });
  }, [setBoard]);

  const deleteList = useCallback((listId: string) => {
      if(window.confirm('Delete this list and all its cards?')) {
          setBoard(prevBoard => prevBoard.filter(list => list.id !== listId));
      }
  }, [setBoard]);
  
  const moveList = useCallback((fromIndex: number, toIndex: number) => {
      setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          const [movedList] = newBoard.splice(fromIndex, 1);
          newBoard.splice(toIndex, 0, movedList);
          return newBoard;
      });
  }, [setBoard]);

  const moveCard = useCallback((cardId: string, fromListId: string, toListId: string, toIndex: number) => {
    setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        const fromListIndex = newBoard.findIndex(l => l.id === fromListId);
        const toListIndex = newBoard.findIndex(l => l.id === toListId);

        if (fromListIndex === -1 || toListIndex === -1) {
            return prevBoard;
        }

        const fromList = { ...newBoard[fromListIndex] };
        fromList.cards = [...fromList.cards]; // Create a mutable copy
        const cardIndex = fromList.cards.findIndex(c => c.id === cardId);

        if (cardIndex === -1) {
            return prevBoard;
        }

        const [movedCard] = fromList.cards.splice(cardIndex, 1);

        if (fromListId === toListId) {
            // Dragging within the same list
            fromList.cards.splice(toIndex, 0, movedCard);
            newBoard[fromListIndex] = fromList;
        } else {
            // Dragging to a different list
            const toList = { ...newBoard[toListIndex] };
            toList.cards = [...toList.cards]; // Create a mutable copy
            toList.cards.splice(toIndex, 0, movedCard);
            
            newBoard[fromListIndex] = fromList;
            newBoard[toListIndex] = toList;
        }

        return newBoard;
    });
  }, [setBoard]);


  const getCardAndList = (panelState: PanelState | null) => {
    if (!panelState) return { list: null, card: null };
    const list = board.find(l => l.id === panelState.listId) || null;
    if (!list) return { list: null, card: null };
    if (panelState.mode === 'edit' && panelState.cardId) {
      const card = list.cards.find(c => c.id === panelState.cardId) || null;
      return { list, card };
    }
    return { list, card: null };
  };

  const { list, card } = getCardAndList(panelState);

  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    board.forEach(list => {
        list.cards.forEach(card => {
            card.labels?.forEach(label => labels.add(label));
        });
    });
    return Array.from(labels);
  }, [board]);

  const filteredBoard = useMemo(() => {
    const hasFilters = searchQuery || selectedLabels.length > 0 || dueDateFilter !== 'all';
    if (!hasFilters) {
        return board;
    }

    return board.map(list => ({
        ...list,
        cards: list.cards.filter(card => {
            const searchMatch = searchQuery
                ? (card.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                   (card.members && card.members.some(m => 
                     m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     m.initials.toLowerCase().includes(searchQuery.toLowerCase())
                   )))
                : true;

            const labelMatch = selectedLabels.length > 0
                ? card.labels?.some(label => selectedLabels.includes(label))
                : true;

            const dueDateMatch = (() => {
                if (!card.due || dueDateFilter === 'all') return true;
                const cardDate = new Date(card.due + 'T00:00:00');
                switch (dueDateFilter) {
                    case 'overdue': return isPast(cardDate);
                    case 'today': return isToday(cardDate);
                    case 'week': return isWithinNextWeek(cardDate);
                    default: return true;
                }
            })();

            return searchMatch && labelMatch && dueDateMatch;
        })
    })).filter(list => hasFilters ? list.cards.length > 0 : true); // Optionally hide empty lists when filtering
  }, [board, searchQuery, selectedLabels, dueDateFilter]);

  const handleClearFilters = () => {
      setSearchQuery('');
      setSelectedLabels([]);
      setDueDateFilter('all');
  }

  return (
    <div className="flex flex-col h-screen bg-cover bg-center">
      <Topbar 
        onAddList={handleAddList} 
        onClearStorage={handleClearStorage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allLabels={allLabels}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
        onClearFilters={handleClearFilters}
      />
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-20">
        <Board 
          board={filteredBoard}
          onOpenPanel={handleOpenPanel}
          updateList={updateList}
          deleteList={deleteList}
          moveList={moveList}
          moveCard={moveCard}
        />
      </div>
      <CardPanel
        isOpen={!!panelState}
        onClose={handleClosePanel}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        list={list}
        card={card}
      />
      <InboxPanel isOpen={isInboxOpen} onClose={handleCloseInbox} />
      <PlannerPanel isOpen={isPlannerOpen} onClose={handleClosePlanner} />
      <BottomNav onOpenInbox={handleOpenInbox} onOpenPlanner={handleOpenPlanner} />
    </div>
  );
};

export default App;
