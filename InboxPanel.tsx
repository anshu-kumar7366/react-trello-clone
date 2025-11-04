import React from 'react';

interface InboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const InboxPanel: React.FC<InboxPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      onClick={onClose}
      className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-black/60 opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 left-0 w-full sm:w-[480px] bg-[rgba(12,12,15,0.96)] backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} p-5 text-gray-200`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:bg-white/10">✕</button>
        <div className="h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-bold mb-4">Gmail Inbox</h2>
            <p className="text-gray-400 mb-6 max-w-sm">
                For your security, Google prevents Gmail from being embedded in other applications.
            </p>
            <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
                Open Gmail in New Tab
            </a>
        </div>
      </div>
    </div>
  );
};

export default InboxPanel;
