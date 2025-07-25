import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { Note, Deck, Flashcard, CardStatus, Course, Task, TimetableEntry, ThemeColor, NoteFolder, DeckFolder, User } from '../types';
import { 
    NOTES, DECKS, FLASHCARDS, COURSES, TASKS, TIMETABLE, NOTE_FOLDERS, DECK_FOLDERS, USER,
    JSONBIN_API_KEY, JSONBIN_BIN_ID 
} from '../constants';
import Icon from '../components/Icon';

export interface CourseSchedule {
  day: TimetableEntry['day'];
  startTime: string;
  endTime: string;
  location?: string;
}

export interface CourseFormData {
  name: string;
  code: string;
  instructor: string;
  term: Course['term'];
  color: ThemeColor;
  schedules: CourseSchedule[];
}

interface AppContextType {
  user: User;
  notes: Note[];
  decks: Deck[];
  flashcards: Flashcard[];
  courses: Course[];
  tasks: Task[];
  timetable: TimetableEntry[];
  noteFolders: NoteFolder[];
  deckFolders: DeckFolder[];
  
  // Deck Folder actions
  addDeckFolder: (name: string) => void;
  deleteDeckFolder: (folderId: string) => void;
  updateDeckFolder: (folderId: string, name: string) => void;

  // Note Folder actions
  addNoteFolder: (name: string) => void;
  deleteNoteFolder: (folderId: string) => void;
  updateNoteFolder: (folderId: string, name: string) => void;
  
  // Deck actions
  addDeck: (name: string, courseId?: string, folderId?: string) => Deck;
  deleteDeck: (deckId: string) => void;

  // Note actions
  addNote: (noteData: Pick<Note, 'title' | 'content' | 'tags' | 'courseId' | 'folderId'>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;

  // Flashcard actions
  addFlashcard: (cardData: Pick<Flashcard, 'deckId' | 'front' | 'back'>) => void;
  addFlashcardsBatch: (cards: Pick<Flashcard, 'deckId' | 'front' | 'back'>[]) => void;
  updateFlashcard: (card: Flashcard) => void;
  deleteFlashcard: (cardId: string) => void;
  
  // Course actions
  addCourse: (courseData: CourseFormData) => void;
  updateCourse: (courseId: string, courseData: CourseFormData) => void;
  deleteCourse: (courseId: string) => void;

  // Task actions
  addTask: (taskData: Pick<Task, 'title' | 'courseId' | 'weight' | 'dueDate'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [notes, setNotes] = useState<Note[]>(NOTES);
  const [decks, setDecks] = useState<Deck[]>(DECKS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(FLASHCARDS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(TIMETABLE);
  const [noteFolders, setNoteFolders] = useState<NoteFolder[]>(NOTE_FOLDERS);
  const [deckFolders, setDeckFolders] = useState<DeckFolder[]>(DECK_FOLDERS);
  const isInitialLoad = useRef(true);

  // Load state from jsonbin.io on initial render
  useEffect(() => {
    const loadState = async () => {
      if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
        console.warn('jsonbin.io API Key or Bin ID not set in constants.tsx. Data will not be persisted.');
        setIsLoadingState(false);
        return;
      }

      try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
          method: 'GET',
          headers: { 'X-Master-Key': JSONBIN_API_KEY },
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                 console.log('jsonbin.io: Bin not found. Initializing with default data.');
            } else {
                throw new Error(`Failed to fetch state from jsonbin.io: ${response.statusText}`);
            }
        } else {
            const data = await response.json();
            const savedState = data.record;
            if (savedState && Object.keys(savedState).length > 0) {
              setNotes(savedState.notes || NOTES);
              setDecks(savedState.decks || DECKS);
              setFlashcards(savedState.flashcards || FLASHCARDS);
              setCourses(savedState.courses || COURSES);
              setTasks(savedState.tasks || TASKS);
              setTimetable(savedState.timetable || TIMETABLE);
              setNoteFolders(savedState.noteFolders || NOTE_FOLDERS);
              setDeckFolders(savedState.deckFolders || DECK_FOLDERS);
            }
        }
      } catch (error) {
        console.error('Error loading state from jsonbin.io:', error);
      } finally {
        setIsLoadingState(false);
      }
    };

    loadState();
  }, []);

  // Save state to jsonbin.io with debounce on any change
  useEffect(() => {
    if (isLoadingState) {
      return;
    }
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }

    if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
      return;
    }
    
    const handler = setTimeout(async () => {
      const stateToSave = {
        notes, decks, flashcards, courses, tasks, timetable, noteFolders, deckFolders,
      };

      try {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY,
          },
          body: JSON.stringify(stateToSave),
        });
      } catch (error) {
        console.error('Error saving state to jsonbin.io:', error);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [notes, decks, flashcards, courses, tasks, timetable, noteFolders, deckFolders, isLoadingState]);

  // --- Note Folder Management ---
  const addNoteFolder = (name: string) => {
    const newFolder: NoteFolder = { id: `nf-${Date.now()}`, name };
    setNoteFolders(prev => [...prev, newFolder]);
  };
  const updateNoteFolder = (folderId: string, name: string) => {
    setNoteFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  };
  const deleteNoteFolder = (folderId: string) => {
    setNoteFolders(prev => prev.filter(f => f.id !== folderId));
    setNotes(prev => prev.map(n => n.folderId === folderId ? { ...n, folderId: undefined } : n));
  };

  // --- Deck Folder Management ---
  const addDeckFolder = (name: string) => {
    const newFolder: DeckFolder = { id: `df-${Date.now()}`, name };
    setDeckFolders(prev => [...prev, newFolder]);
  };
  const updateDeckFolder = (folderId: string, name: string) => {
    setDeckFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  };
  const deleteDeckFolder = (folderId: string) => {
    setDeckFolders(prev => prev.filter(f => f.id !== folderId));
    setDecks(prev => prev.map(d => d.folderId === folderId ? { ...d, folderId: undefined } : d));
  };


  // --- Deck Management ---
  const addDeck = (name: string, courseId?: string, folderId?: string): Deck => {
    const icons = ['code', 'leaf', 'language', 'atom', 'music', 'book', 'film', 'robot', 'graduation-cap'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      icon: randomIcon,
      courseId,
      folderId,
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    setFlashcards(prev => prev.filter(card => card.deckId !== deckId));
  };

  // --- Note Management ---
  const addNote = (noteData: Pick<Note, 'title' | 'content' | 'tags' | 'courseId' | 'folderId'>): Note => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      lastModified: 'Just now',
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    return newNote;
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id ? { ...updatedNote, lastModified: 'Just now' } : note
      )
    );
  };
  
  const deleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  // --- Flashcard Management ---
  const addFlashcard = (cardData: Pick<Flashcard, 'deckId' | 'front' | 'back'>) => {
    const newCard: Flashcard = {
      ...cardData,
      id: `card-${Date.now()}`,
      status: CardStatus.Review,
      nextReviewDate: 'Today',
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  const addFlashcardsBatch = (cards: Pick<Flashcard, 'deckId' | 'front' | 'back'>[]) => {
    const newCards: Flashcard[] = cards.map(cardData => ({
      ...cardData,
      id: `card-${Date.now()}-${Math.random()}`,
      status: CardStatus.Review,
      nextReviewDate: 'Today',
    }));
    setFlashcards(prev => [...newCards, ...prev]);
  };
  
  const updateFlashcard = (updatedCard: Flashcard) => {
    setFlashcards(prev => prev.map(card => card.id === updatedCard.id ? updatedCard : card));
  };

  const deleteFlashcard = (cardId: string) => {
    setFlashcards(prevFlashcards => prevFlashcards.filter(card => card.id !== cardId));
  };

  // --- Course Management ---
  const addCourse = (courseData: CourseFormData) => {
    const newCourseId = `course-${Date.now()}`;
    const { schedules, ...courseDetails } = courseData;
    
    const newCourse: Course = {
      id: newCourseId,
      ...courseDetails
    };
    setCourses(prev => [newCourse, ...prev]);

    const newTimetableEntries: TimetableEntry[] = schedules.map((schedule, index) => ({
        id: `tt-${newCourseId}-${index}`,
        courseId: newCourseId,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
    }));

    setTimetable(prev => [...prev, ...newTimetableEntries]);
  };

  const updateCourse = (courseId: string, courseData: CourseFormData) => {
    const { schedules, ...courseDetails } = courseData;
    setCourses(prev => prev.map(c => 
        c.id === courseId 
        ? { id: courseId, ...courseDetails }
        : c
    ));
    const otherTimetableEntries = timetable.filter(tt => tt.courseId !== courseId);
    const newTimetableEntries: TimetableEntry[] = schedules.map((schedule, index) => ({
        id: `tt-${courseId}-${index}-${Date.now()}`,
        courseId: courseId,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
    }));
    setTimetable([...otherTimetableEntries, ...newTimetableEntries]);
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setTasks(prev => prev.filter(t => t.courseId !== courseId));
    setTimetable(prev => prev.filter(tt => tt.courseId !== courseId));
    setNotes(prev => prev.map(n => n.courseId === courseId ? {...n, courseId: undefined} : n));
    setDecks(prev => prev.map(d => d.courseId === courseId ? {...d, courseId: undefined} : d));
  };

  // --- Task Management ---
  const addTask = (taskData: Pick<Task, 'title' | 'courseId' | 'weight' | 'dueDate'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  if (isLoadingState && JSONBIN_API_KEY && JSONBIN_BIN_ID) {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center">
                <Icon name="spinner" className="animate-spin text-4xl text-blue-500" />
                <p className="mt-4 text-slate-500 dark:text-slate-400">Syncing data...</p>
            </div>
        </div>
    );
  }

  const value = {
    user: USER,
    notes,
    decks,
    flashcards,
    courses,
    tasks,
    timetable,
    noteFolders,
    deckFolders,
    addDeckFolder,
    updateDeckFolder,
    deleteDeckFolder,
    addNoteFolder,
    updateNoteFolder,
    deleteNoteFolder,
    addDeck,
    deleteDeck,
    addNote,
    updateNote,
    deleteNote,
    addFlashcard,
    addFlashcardsBatch,
    updateFlashcard,
    deleteFlashcard,
    addCourse,
    updateCourse,
    deleteCourse,
    addTask,
    updateTask,
    deleteTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};