import React from 'react';

const NavItem = ({ icon, label, isActive = false, onClick }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick?: () => void }) => {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors duration-200 relative ${
                isActive 
                ? 'bg-blue-600/40 text-blue-200' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
            {isActive && <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-400 rounded-full"></div>}
        </button>
    );
};

interface BottomNavProps {
  onOpenInbox: () => void;
  onOpenPlanner: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenInbox, onOpenPlanner }) => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-lg p-2 rounded-full shadow-2xl border border-white/10">
                <NavItem 
                    onClick={onOpenInbox}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><polyline points="21 7 12 13 3 7"></polyline></svg>} 
                    label="Inbox" 
                />
                <NavItem 
                    onClick={onOpenPlanner}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} 
                    label="Planner" 
                />
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <NavItem 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="3" height="18" rx="1"></rect><rect x="10.5" y="3" width="3" height="18" rx="1"></rect><rect x="15" y="3" width="3" height="18" rx="1"></rect></svg>}
                    label="Board"
                    isActive={true}
                />
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <NavItem 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>} 
                    label="Switch boards" 
                />
            </div>
        </div>
    );
};

export default BottomNav;
