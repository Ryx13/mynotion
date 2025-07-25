import React, { useState, useEffect, useMemo } from 'react';
import { Flashcard, Deck, Course, DeckFolder } from '../types';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: Flashcard | null;
  defaultDeckId?: string | null;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ isOpen, onClose, cardToEdit, defaultDeckId }) => {
  const { decks, courses, deckFolders, addFlashcard, updateFlashcard } = useAppContext();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [deckId, setDeckId] = useState(defaultDeckId || (decks.length > 0 ? decks[0].id : ''));
  
  const isEditing = !!cardToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFront(cardToEdit.front);
        setBack(cardToEdit.back);
        setDeckId(cardToEdit.deckId);
      } else {
        setFront('');
        setBack('');
        setDeckId(defaultDeckId || (decks.length > 0 ? decks[0].id : ''));
      }
    }
  }, [isOpen, cardToEdit, isEditing, defaultDeckId, decks]);
  
  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);
  
  const groupedDecks = useMemo(() => {
    const byCourse = new Map<string, Deck[]>();
    const personal = [];
    decks.forEach(deck => {
        if(deck.courseId && courses.some(c => c.id === deck.courseId)) {
            if(!byCourse.has(deck.courseId)) byCourse.set(deck.courseId, []);
            byCourse.get(deck.courseId)!.push(deck);
        } else {
            personal.push(deck);
        }
    });

    const personalByFolder = new Map<string, Deck[]>();
    const uncategorized = [];
    personal.forEach(deck => {
        if(deck.folderId && deckFolders.some(f => f.id === deck.folderId)) {
            if(!personalByFolder.has(deck.folderId)) personalByFolder.set(deck.folderId, []);
            personalByFolder.get(deck.folderId)!.push(deck);
        } else {
            uncategorized.push(deck);
        }
    });
    return { decksByCourse: byCourse, personalDecksByFolder: personalByFolder, uncategorizedPersonalDecks: uncategorized };
  }, [decks, courses, deckFolders]);


  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim() || !deckId) {
        alert('Please fill out all fields.');
        return;
    }
    
    if (isEditing) {
      updateFlashcard({ ...cardToEdit, front, back, deckId });
    } else {
      addFlashcard({ front, back, deckId });
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
            <Icon name="times" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deck</label>
            <select 
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <optgroup label="Courses">
                  {Array.from(groupedDecks.decksByCourse.entries()).map(([courseId, courseDecks]) =>
                    courseDecks.map(deck => <option key={deck.id} value={deck.id}>{courseMap.get(courseId)?.name} / {deck.name}</option>)
                  )}
              </optgroup>
              <optgroup label="Personal">
                 {groupedDecks.uncategorizedPersonalDecks.map(deck => <option key={deck.id} value={deck.id}>{deck.name}</option>)}
                 {Array.from(groupedDecks.personalDecksByFolder.entries()).map(([folderId, folderDecks]) => 
                    folderDecks.map(deck => <option key={deck.id} value={deck.id}>{deckFolders.find(f => f.id === folderId)?.name} / {deck.name}</option>)
                 )}
              </optgroup>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Front (Question)</label>
            <textarea 
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows={3}
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Back (Answer)</label>
            <textarea 
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows={4}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashcardModal;