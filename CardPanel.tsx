import React, { useState, useEffect } from 'react';
import { Card, List } from '../types';
import { genId, readFileAsDataURL, LABEL_COLORS, CARD_COLORS } from '../utils/helpers';

interface CardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card, listId: string) => void;
  onDelete: (cardId: string, listId: string) => void;
  list: List | null;
  card: Card | null;
}

const CardPanel: React.FC<CardPanelProps> = ({ isOpen, onClose, onSave, onDelete, list, card }) => {
  const [formData, setFormData] = useState<Partial<Card>>({});
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentInfo, setAttachmentInfo] = useState<{ type: string; name: string } | null>(null);

  const mode = card ? 'edit' : 'add';

  useEffect(() => {
    // Sync form state when the panel is opened
    if (isOpen && list) {
      if (card) {
        // Edit mode: populate form with card data
        setFormData({ ...card });
        if (card.attachment) {
          setAttachmentPreview(card.attachment);
          setAttachmentInfo({ type: card.attachmentType || '', name: card.attachmentName || '' });
        } else {
          setAttachmentPreview(null);
          setAttachmentInfo(null);
        }
      } else {
        // Add mode: reset to a clean slate
        setFormData({ labels: [], members: [] });
        setAttachmentPreview(null);
        setAttachmentInfo(null);
      }
    }
  }, [isOpen, list, card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleLabelToggle = (color: string) => {
    const currentLabels = formData.labels || [];
    if (currentLabels.includes(color)) {
      setFormData(prev => ({ ...prev, labels: currentLabels.filter(l => l !== color) }));
    } else {
      setFormData(prev => ({ ...prev, labels: [...currentLabels, color] }));
    }
  };

  const handleMemberAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!list) return;
      const initials = e.target.value;
      if (!initials) return;
      const member = list.members.find(m => m.initials === initials);
      const currentMembers = formData.members || [];
      if (member && !currentMembers.find(m => m.initials === initials)) {
          setFormData(prev => ({...prev, members: [...currentMembers, member]}));
      }
      e.target.value = ""; // Reset select
  }

  const handleMemberRemove = (initials: string) => {
      setFormData(prev => ({...prev, members: (prev.members || []).filter(m => m.initials !== initials)}));
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Please upload files smaller than 1MB to avoid storage issues.`);
        e.target.value = ''; // Clear the selected file
        return;
      }
      const dataUrl = await readFileAsDataURL(file);
      setAttachmentPreview(dataUrl);
      setAttachmentInfo({ type: file.type, name: file.name });
    }
  };

  const handleSave = () => {
    if (!list) return;
    if (!formData.text?.trim()) {
      alert('Title is required.');
      return;
    }
    const finalCard: Card = {
      id: card?.id || genId(),
      text: formData.text,
      description: formData.description || '',
      labels: formData.labels || [],
      members: formData.members || [],
      due: formData.due || '',
      priority: formData.priority || '',
      color: formData.color || '',
      attachment: attachmentPreview,
      attachmentType: attachmentInfo?.type || '',
      attachmentName: attachmentInfo?.name || '',
    };
    onSave(finalCard, list.id);
  };

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
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[rgba(12,12,15,0.96)] backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} p-5 text-gray-200`}
      >
        {/* Render content only when data is available to prevent errors during closing animation */}
        {list && (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:bg-white/10">✕</button>
            <div className="h-full overflow-y-auto pr-2">
                <h2 className="text-xl font-bold mb-4">{mode === 'edit' ? 'Edit Card' : 'Add Card'}</h2>

                <label htmlFor="text" className="block text-sm text-gray-400 mb-1 mt-4">Title *</label>
                <input type="text" id="text" value={formData.text || ''} onChange={handleChange} className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white" />

                <label htmlFor="description" className="block text-sm text-gray-400 mb-1 mt-4">Description</label>
                <textarea id="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white min-h-[90px] resize-y"></textarea>

                <label className="block text-sm text-gray-400 mb-1 mt-4">Labels</label>
                <div className="flex flex-wrap gap-2">
                    {LABEL_COLORS.map(color => (
                        <div key={color} onClick={() => handleLabelToggle(color)} style={{ backgroundColor: color }} className={`w-9 h-6 rounded cursor-pointer ${formData.labels?.includes(color) ? 'ring-2 ring-white' : 'ring-2 ring-transparent'}`}></div>
                    ))}
                </div>

                <label htmlFor="members" className="block text-sm text-gray-400 mb-1 mt-4">Assign Member</label>
                <select id="members" onChange={handleMemberAssign} className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white">
                    <option value="">-- Choose Member --</option>
                    {list.members.map(m => <option key={m.initials} value={m.initials}>{m.name} ({m.initials})</option>)}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.members || []).map(m => (
                        <div key={m.initials} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/25 font-bold text-sm">{m.initials}</div>
                            <span className="text-sm">{m.name}</span>
                            <button onClick={() => handleMemberRemove(m.initials)} className="text-red-400 hover:text-red-300">✕</button>
                        </div>
                    ))}
                </div>

                <label htmlFor="due" className="block text-sm text-gray-400 mb-1 mt-4">Due Date</label>
                <input type="date" id="due" value={formData.due || ''} onChange={handleChange} className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white" />

                <label htmlFor="priority" className="block text-sm text-gray-400 mb-1 mt-4">Priority</label>
                <select id="priority" value={formData.priority || ''} onChange={handleChange} className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white">
                    <option value="">-- None --</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                
                <label className="block text-sm text-gray-400 mb-1 mt-4">Card Color</label>
                <div className="flex flex-wrap gap-2">
                    {CARD_COLORS.map(color => (
                        <div key={color} onClick={() => setFormData(p => ({...p, color}))} style={{ backgroundColor: color }} className={`w-9 h-9 rounded-lg cursor-pointer ${formData.color === color ? 'ring-2 ring-white' : 'ring-2 ring-transparent'}`}></div>
                    ))}
                     <div onClick={() => setFormData(p => ({...p, color: ''}))} className={`w-9 h-9 rounded-lg cursor-pointer flex items-center justify-center bg-gray-600 ${!formData.color ? 'ring-2 ring-white' : 'ring-2 ring-transparent'}`}>X</div>
                </div>

                <label htmlFor="attachment" className="block text-sm text-gray-400 mb-1 mt-4">Attachment</label>
                <input type="file" id="attachment" onChange={handleFileChange} accept="image/*,video/*,.pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                {attachmentPreview && (
                    <div className="mt-2 rounded-lg overflow-hidden max-h-64">
                        {attachmentInfo?.type.startsWith('image') ? <img src={attachmentPreview} alt="preview" /> :
                         attachmentInfo?.type.startsWith('video') ? <video src={attachmentPreview} controls /> :
                         <div className="p-4 bg-white/5">📄 {attachmentInfo?.name}</div>}
                    </div>
                )}
                 <div className="text-xs text-gray-500 mt-2">Attachments are stored locally. For best performance, use files under 1MB.</div>

                <div className="flex gap-2 mt-6">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">{mode === 'add' ? 'Create Card' : 'Save Changes'}</button>
                    {mode === 'edit' && card && list && <button onClick={() => onDelete(card.id, list.id)} className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-white">Delete</button>}
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CardPanel;
