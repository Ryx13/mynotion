import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../context/AppContext';
import { Note, Deck, Course, NoteFolder, DeckFolder } from '../types';
import Modal from './Modal';
import Icon from './Icon';

interface GenerateFlashcardsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GenerateFlashcardsModal: React.FC<GenerateFlashcardsModalProps> = ({ isOpen, onClose }) => {
    const { notes, courses, decks, noteFolders, deckFolders, addFlashcardsBatch } = useAppContext();
    const [selectedNoteId, setSelectedNoteId] = useState('');
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedNoteId(notes[0]?.id || '');
            setSelectedDeckId(decks[0]?.id || '');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, notes, decks]);
    
    const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

    const groupedNotes = useMemo(() => {
        const byCourse = new Map<string, Note[]>();
        const personal = [];
        notes.forEach(note => {
          if (note.courseId && courses.some(c => c.id === note.courseId)) {
            if (!byCourse.has(note.courseId)) byCourse.set(note.courseId, []);
            byCourse.get(note.courseId)!.push(note);
          } else {
            personal.push(note);
          }
        });
        const personalByFolder = new Map<string, Note[]>();
        const uncategorized = [];
        personal.forEach(note => {
          if(note.folderId && noteFolders.some(f => f.id === note.folderId)) {
            if (!personalByFolder.has(note.folderId)) personalByFolder.set(note.folderId, []);
            personalByFolder.get(note.folderId)!.push(note);
          } else {
            uncategorized.push(note);
          }
        });
        return { notesByCourse: byCourse, personalNotesByFolder: personalByFolder, uncategorizedPersonalNotes: uncategorized };
    }, [notes, courses, noteFolders]);

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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNoteId || !selectedDeckId) {
            setError("Please select a note and a destination deck.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is not configured.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const noteToProcess = notes.find(n => n.id === selectedNoteId);
            if (!noteToProcess || !noteToProcess.content.trim()) {
                throw new Error("Selected note is empty or could not be found.");
            }
            
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        front: {
                            type: Type.STRING,
                            description: "The question or front side of the flashcard. Should be concise."
                        },
                        back: {
                            type: Type.STRING,
                            description: "The answer or back side of the flashcard. Should be a clear and direct answer to the question."
                        }
                    },
                    required: ["front", "back"]
                }
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze the following text and generate a set of flashcards from it. Each flashcard should be a clear question and answer pair. Focus on key concepts, definitions, and important facts.\n\nText:\n${noteToProcess.content}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const generatedCards = JSON.parse(response.text);
            
            if (Array.isArray(generatedCards) && generatedCards.length > 0) {
                const newCardsBatch = generatedCards.map(card => ({
                    front: card.front,
                    back: card.back,
                    deckId: selectedDeckId
                }));
                addFlashcardsBatch(newCardsBatch);
                onClose();
            } else {
                setError("No flashcards were generated. The note might not have enough content.");
            }

        } catch (err: any) {
            console.error("Error generating flashcards:", err);
            setError(err.message || "Failed to generate flashcards. Please check the API key and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Flashcards from Note">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="note-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source Note</label>
                    <select
                        id="note-select"
                        value={selectedNoteId}
                        onChange={e => setSelectedNoteId(e.target.value)}
                        className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {notes.length === 0 && <option disabled>No notes available</option>}
                        <optgroup label="Courses">
                             {Array.from(groupedNotes.notesByCourse.entries()).map(([courseId, courseNotes]) =>
                                courseNotes.map(note => <option key={note.id} value={note.id}>{courseMap.get(courseId)?.name} / {note.title}</option>)
                            )}
                        </optgroup>
                        <optgroup label="Personal">
                            {groupedNotes.uncategorizedPersonalNotes.map(note => <option key={note.id} value={note.id}>{note.title}</option>)}
                            {Array.from(groupedNotes.personalNotesByFolder.entries()).map(([folderId, folderNotes]) => 
                                folderNotes.map(note => <option key={note.id} value={note.id}>{noteFolders.find(f=>f.id===folderId)?.name} / {note.title}</option>)
                            )}
                        </optgroup>
                    </select>
                </div>
                 <div>
                    <label htmlFor="deck-select-gen" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destination Deck</label>
                    <select
                        id="deck-select-gen"
                        value={selectedDeckId}
                        onChange={e => setSelectedDeckId(e.target.value)}
                        className="block w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {decks.length === 0 && <option disabled>No decks available</option>}
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

                {error && (
                    <div className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                        disabled={isLoading || !selectedNoteId || !selectedDeckId}
                    >
                        {isLoading ? (
                            <Icon name="spinner" className="animate-spin mr-2" />
                        ) : (
                            <Icon name="wand-magic-sparkles" className="mr-2" />
                        )}
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default GenerateFlashcardsModal;