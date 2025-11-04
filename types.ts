export interface Member {
  name: string;
  initials: string;
}

export interface Card {
  id: string;
  text: string;
  description?: string;
  labels?: string[];
  members?: Member[];
  due?: string;
  priority?: 'High' | 'Medium' | 'Low' | '';
  color?: string;
  attachment?: string | null;
  attachmentType?: string;
  attachmentName?: string;
}

export interface List {
  id: string;
  title: string;
  color: string;
  members: Member[];
  cards: Card[];
}

export type Board = List[];

export type PanelState = {
    mode: 'add';
    listId: string;
} | {
    mode: 'edit';
    listId: string;
    cardId: string;
};

export type DueDateFilter = 'all' | 'overdue' | 'today' | 'week';