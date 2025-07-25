import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CardStatus, Flashcard, Deck, Course, DeckFolder } from '../types';
import Icon from './Icon';
import FlashcardModal from './FlashcardModal';
import Modal from './Modal';
import FlashcardReview from './FlashcardReview';
import GenerateFlashcardsModal from './GenerateFlashcardsModal';
import ConfirmationModal from './ConfirmationModal';

const DeckCard: React.FC<{
  deck: Deck;
  cardCount: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ deck, cardCount, isSelected, onSelect }) => {
  const selectedClasses = 'ring-2 ring-blue-500 bg-white dark:bg-slate-800';
  const unselectedClasses = 'bg-white dark:bg-slate-800/50 hover:shadow-md hover:dark:bg-slate-800';
  
  return (
    <div
      onClick={onSelect}
      className={`rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center cursor-pointer transition-all group ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      <div className={`w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-4 text-slate-500 dark:text-slate-300 text-xl`}>
        <Icon name={deck.icon} />
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{deck.name}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{cardCount} card{cardCount !== 1 && 's'}</p>
      </div>
    </div>
  )
}

const DecksGrid: React.FC<{
    decks: Deck[];
    flashcards: Flashcard[];
    selectedDeckId: string | null;
    onSelectDeck: (deckId: string) => void;
    onDeleteDeck: (deck: Deck) => void;
}> = ({ decks, flashcards, selectedDeckId, onSelectDeck, onDeleteDeck }) => {
    if (decks.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400 px-2">No decks in this section.</p>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map(deck => (
            <div key={deck.id} className="relative group/deckcard">
                <DeckCard
                    deck={deck} 
                    cardCount={flashcards.filter(c => c.deckId === deck.id).length} 
                    isSelected={selectedDeckId === deck.id} 
                    onSelect={() => onSelectDeck(deck.id)}
                />
                <button onClick={() => onDeleteDeck(deck)} className="absolute top-1 right-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/deckcard:opacity-100 transition-opacity p-1 bg-white/50 dark:bg-slate-800/50 rounded-full" aria-label={`Delete deck ${deck.name}`}>
                    <Icon name="trash" />
                </button>
            </div>
            ))}
        </div>
    );
}

const Flashcards: React.FC = () => {
  const { decks, flashcards, courses, addDeck, deleteDeck, deleteFlashcard, deckFolders, addDeckFolder, updateDeckFolder, deleteDeckFolder } = useAppContext();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(decks[0]?.id || null);
  
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [deckCategory, setDeckCategory] = useState('');

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DeckFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deckFolderToDelete, setDeckFolderToDelete] = useState<DeckFolder | null>(null);

  useEffect(() => {
    const selectedDeckExists = decks.some(deck => deck.id === selectedDeckId);
    if (!selectedDeckExists && decks.length > 0) {
      setSelectedDeckId(decks[0].id);
    } else if (decks.length === 0) {
      setSelectedDeckId(null);
    }
  }, [decks, selectedDeckId]);

  const handleOpenCreateCardModal = () => {
    if (decks.length === 0) {
      setIsDeckModalOpen(true);
      return;
    }
    setEditingCard(null);
    setIsCardModalOpen(true);
  };
  
  const handleOpenEditCardModal = (card: Flashcard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };
  
  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeckName.trim()) {
      let courseId: string | undefined = undefined;
      let folderId: string | undefined = undefined;
      if(deckCategory.startsWith('course-')) {
        courseId = deckCategory.replace('course-', '');
      } else if (deckCategory.startsWith('folder-')) {
        folderId = deckCategory.replace('folder-', '');
      }

      const newDeck = addDeck(newDeckName.trim(), courseId, folderId);
      setSelectedDeckId(newDeck.id);
      setNewDeckName('');
      setDeckCategory('');
      setIsDeckModalOpen(false);
    }
  };

  const cardsInSelectedDeck = useMemo(() => flashcards.filter(card => card.deckId === selectedDeckId), [flashcards, selectedDeckId]);
  const selectedDeck = useMemo(() => decks.find(d => d.id === selectedDeckId), [decks, selectedDeckId]);
  
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
  

  const handleFolderModalOpen = (folder?: DeckFolder) => {
    setEditingFolder(folder || null);
    setFolderName(folder?.name || '');
    setIsFolderModalOpen(true);
  }

  const handleFolderFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(folderName.trim()) {
      if(editingFolder) {
        updateDeckFolder(editingFolder.id, folderName.trim());
      } else {
        addDeckFolder(folderName.trim());
      }
      setIsFolderModalOpen(false);
    }
  }

  const handleConfirmDeleteDeck = () => {
    if (deckToDelete) {
      deleteDeck(deckToDelete.id);
      setDeckToDelete(null);
    }
  };

  const handleConfirmDeleteDeckFolder = () => {
    if (deckFolderToDelete) {
      deleteDeckFolder(deckFolderToDelete.id);
      setDeckFolderToDelete(null);
    }
  };

  if (isReviewing) {
    return (
      <FlashcardReview 
        deckName={selectedDeck?.name || 'Review'}
        cards={cardsInSelectedDeck}
        onExit={() => setIsReviewing(false)}
      />
    );
  }

  const getStatusBadge = (status: CardStatus) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case CardStatus.Mastered:
        return <span className={`${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300`}>Mastered</span>;
      case CardStatus.Learning:
        return <span className={`${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300`}>Learning</span>;
      case CardStatus.Review:
        return <span className={`${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300`}>Review</span>;
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={!!deckToDelete}
        onClose={() => setDeckToDelete(null)}
        onConfirm={handleConfirmDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to permanently delete the deck "${deckToDelete?.name}" and all its cards?`}
        confirmText="Delete"
      />
      <ConfirmationModal
        isOpen={!!deckFolderToDelete}
        onClose={() => setDeckFolderToDelete(null)}
        onConfirm={handleConfirmDeleteDeckFolder}
        title="Delete Folder"
        message={`Are you sure you want to delete the folder "${deckFolderToDelete?.name}"? Decks inside will become uncategorized.`}
        confirmText="Delete"
      />

      <FlashcardModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} cardToEdit={editingCard} defaultDeckId={selectedDeckId}/>
      <GenerateFlashcardsModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} />
      
      <Modal isOpen={isDeckModalOpen} onClose={() => setIsDeckModalOpen(false)} title="Create New Deck">
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <div>
            <label htmlFor="new-deck-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deck Name</label>
            <input id="new-deck-name" type="text" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} placeholder="e.g., React Hooks" className="block w-full input" autoFocus/>
          </div>
          <div>
            <label htmlFor="deck-category-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select id="deck-category-select" value={deckCategory} onChange={e => setDeckCategory(e.target.value)} className="block w-full input">
              <option value="">Personal (Uncategorized)</option>
               <optgroup label="Courses">
                  {courses.map(c => <option key={c.id} value={`course-${c.id}`}>{c.name}</option>)}
              </optgroup>
              <optgroup label="Personal Folders">
                  {deckFolders.map(f => <option key={f.id} value={`folder-${f.id}`}>{f.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="flex justify-end mt-4"><button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Create</button></div>
        </form>
        <style>{`.input { border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: white; padding: 0.5rem 0.75rem; } html.dark .input { border-color: #4b5563; background-color: #1f2937; color: #d1d5db; }`}</style>
      </Modal>

      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title={editingFolder ? 'Rename Folder' : 'Create New Folder'}>
        <form onSubmit={handleFolderFormSubmit}>
          <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder Name" autoFocus className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          <div className="flex justify-end mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
              {editingFolder ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Flashcards</h1>
           <div className="flex items-center gap-2">
              <button onClick={() => setIsGenerateModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center"><Icon name="wand-magic-sparkles" className="mr-2"/> Generate</button>
              <button onClick={() => setIsReviewing(true)} disabled={cardsInSelectedDeck.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center disabled:opacity-50"><Icon name="play" className="mr-2"/> Start Review</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setIsDeckModalOpen(true)} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-sm"><Icon name="plus" className="mr-2"/> New Deck</button>
            <button onClick={handleOpenCreateCardModal} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-sm"><Icon name="plus-square" className="mr-2"/> New Card</button>
        </div>

        <div className="space-y-8">
            {Array.from(groupedDecks.decksByCourse.entries()).map(([courseId, courseDecks]) => (
                 <details open key={courseId} className="group">
                    <summary className="flex items-center mb-4 cursor-pointer list-none">
                        <Icon name="chevron-right" className="transition-transform group-open:rotate-90 mr-2"/>
                        <h2 className="text-xl font-semibold">{courseMap.get(courseId)?.name || 'Course Decks'} ({courseDecks.length})</h2>
                    </summary>
                    <DecksGrid decks={courseDecks} flashcards={flashcards} selectedDeckId={selectedDeckId} onSelectDeck={setSelectedDeckId} onDeleteDeck={setDeckToDelete} />
                </details>
            ))}
            
            <details open className="group">
                <summary className="flex justify-between items-center mb-4 cursor-pointer list-none">
                    <div className="flex items-center">
                        <Icon name="chevron-right" className="transition-transform group-open:rotate-90 mr-2"/>
                        <h2 className="text-xl font-semibold">Personal Decks</h2>
                    </div>
                    <button onClick={() => handleFolderModalOpen()} className="text-sm px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"><Icon name="folder-plus" className="mr-2"/>New Folder</button>
                </summary>
                <div className="space-y-6 pl-5">
                    {deckFolders.map(folder => (
                        <details open key={folder.id} className="group/folder">
                            <summary className="flex items-center mb-4 cursor-pointer list-none">
                                <Icon name="chevron-right" className="transition-transform group-open/folder:rotate-90 mr-2 text-slate-500"/>
                                <h3 className="text-lg font-medium">{folder.name} ({(groupedDecks.personalDecksByFolder.get(folder.id) || []).length})</h3>
                                <button onClick={(e) => {e.preventDefault(); handleFolderModalOpen(folder)}} className="ml-4 text-slate-400 hover:text-blue-500"><Icon name="edit"/></button>
                                <button onClick={(e) => {e.preventDefault(); setDeckFolderToDelete(folder);}} className="ml-2 text-slate-400 hover:text-red-500"><Icon name="trash"/></button>
                            </summary>
                            <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                <DecksGrid decks={groupedDecks.personalDecksByFolder.get(folder.id) || []} flashcards={flashcards} selectedDeckId={selectedDeckId} onSelectDeck={setSelectedDeckId} onDeleteDeck={setDeckToDelete} />
                            </div>
                        </details>
                    ))}
                    <details open className="group/folder">
                         <summary className="flex items-center mb-4 cursor-pointer list-none">
                            <Icon name="chevron-right" className="transition-transform group-open/folder:rotate-90 mr-2 text-slate-500"/>
                            <h3 className="text-lg font-medium">Uncategorized ({groupedDecks.uncategorizedPersonalDecks.length})</h3>
                        </summary>
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                           <DecksGrid decks={groupedDecks.uncategorizedPersonalDecks} flashcards={flashcards} selectedDeckId={selectedDeckId} onSelectDeck={setSelectedDeckId} onDeleteDeck={setDeckToDelete} />
                        </div>
                    </details>
                </div>
            </details>
        </div>

        {decks.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
            <Icon name="layer-group" className="text-4xl mb-4" />
            <h3 className="text-lg font-medium">No Decks Yet</h3>
            <p className="text-sm">Click "New Deck" to create your first one.</p>
          </div>
        )}

        {decks.length > 0 && selectedDeckId && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Cards in "{selectedDeck?.name || 'No Deck Selected'}"</h2>
            <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/30">
                  <tr>
                    <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Front</th>
                    <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Back</th>
                    <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-700 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {cardsInSelectedDeck.map(card => (
                    <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-4 text-sm truncate max-w-xs">{card.front}</td>
                      <td className="py-3 px-4 text-sm truncate max-w-xs">{card.back}</td>
                      <td className="py-3 px-4">{getStatusBadge(card.status)}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">
                        <button onClick={() => handleOpenEditCardModal(card)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3" aria-label={`Edit card ${card.front}`}><Icon name="edit" /></button>
                        <button onClick={() => deleteFlashcard(card.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" aria-label={`Delete card ${card.front}`}><Icon name="trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cardsInSelectedDeck.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {selectedDeckId ? "No flashcards in this deck." : "Select a deck to view its cards."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Flashcards;