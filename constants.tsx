import { User, Note, Deck, Flashcard, CardStatus, Course, Task, TimetableEntry, NoteFolder, DeckFolder } from './types';

// IMPORTANT: To enable data persistence, create a free account at jsonbin.io,
// create a new JSON bin, and paste your API Key and the Bin ID here.
export const JSONBIN_API_KEY = '$2a$10$mkJixj86OGhG86LqPcEOGukIrddONhgzGzUMmNcAUOaqwo80vZY2e'; // e.g. '$2b$10$xyz...'
export const JSONBIN_BIN_ID = '6882d369ae596e708fbb5263'; // e.g. '60f8b1a3a4b4d44e4a3b1c2d'

export const LOGIN_CREDENTIALS = {
  username: 'ryx13',
  password: 'bambino@1305'
};

export const USER: User = {
  id: 'user-1',
  name: 'Ryan Dube',
  initials: 'RD',
};

export const NOTE_FOLDERS: NoteFolder[] = [
    { id: 'nf-1', name: 'Personal Projects' },
    { id: 'nf-2', name: 'Goals' },
];

export const NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Project Ideas',
    folderId: 'nf-1',
    content: `Feature Requests
- Calendar integration for better planning
- Task prioritization system with drag-and-drop interface
- Dark mode toggle for better night-time usage
- Export notes to PDF or Markdown format
- Voice input for creating notes on the go

Code Example
function toggleDarkMode() {
  const isDarkMode = document.body.classList.contains('dark');
  if (isDarkMode) {
    document.body.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
  }
}`,
    tags: ['ideas', 'projects'],
    lastModified: '2 days ago',
  },
  {
    id: 'note-2',
    title: 'Reading List',
    content: 'Books to read:\n- "Atomic Habits" by James Clear\n- "Deep Work" by Cal Newport\n- "The Psychology of Money" by Morgan Housel.',
    tags: ['books', 'personal'],
    lastModified: 'Yesterday',
  },
  {
    id: 'note-3',
    title: 'CS 101 Lecture Notes',
    courseId: 'course-1',
    content: 'Team sync: Discussed Q3 goals, assigned tasks for the new feature rollout, and reviewed customer feedback from last release.',
    tags: ['work', 'meetings'],
    lastModified: 'Today',
  },
];

export const DECK_FOLDERS: DeckFolder[] = [
    { id: 'df-1', name: 'Language Learning' },
];

export const DECKS: Deck[] = [
  { id: 'deck-1', name: 'JavaScript Basics', icon: 'code', courseId: 'course-1' },
  { id: 'deck-2', name: 'Biology Terms', icon: 'leaf' },
  { id: 'deck-3', name: 'Spanish Vocabulary', icon: 'language', folderId: 'df-1' },
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    front: 'What is a closure in JavaScript?',
    back: "A closure is a function that has access to its own scope, the outer function's scope, and the global scope. It preserves the outer function's scope even after the outer function has returned.",
    status: CardStatus.Mastered,
    nextReviewDate: 'In 7 days',
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    front: 'What is the difference between let and var?',
    back: "let is block-scoped while var is function-scoped. let doesn't allow redeclaration and isn't hoisted to the top of its scope.",
    status: CardStatus.Learning,
    nextReviewDate: 'Tomorrow',
  },
  {
    id: 'card-3',
    deckId: 'deck-1',
    front: 'Explain the event loop in JavaScript.',
    back: 'The event loop is a mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded, by offloading operations to the system kernel whenever possible.',
    status: CardStatus.Review,
    nextReviewDate: 'Today',
  },
  {
    id: 'card-4',
    deckId: 'deck-2',
    front: 'What is photosynthesis?',
    back: 'The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigment.',
    status: CardStatus.Mastered,
    nextReviewDate: 'In 5 days',
  },
  {
    id: 'card-5',
    deckId: 'deck-3',
    front: 'Hola',
    back: 'Hello',
    status: CardStatus.Learning,
    nextReviewDate: 'Today',
  },
];

export const COURSES: Course[] = [
    { id: 'course-1', name: 'Intro to Computer Science', code: 'CS 101', instructor: 'Dr. Alan Turing', color: 'blue', term: 'Semester 1' },
    { id: 'course-2', name: 'Calculus I', code: 'MATH 150', instructor: 'Dr. Isaac Newton', color: 'red', term: 'Semester 1' },
    { id: 'course-3', name: 'World History', code: 'HIST 210', instructor: 'Dr. Herodotus', color: 'yellow', term: 'Full Year' },
];

export const TASKS: Task[] = [
    { id: 'task-1', title: 'Homework 1', completed: true, courseId: 'course-1', dueDate: '2024-06-03', grade: 85, maxGrade: 100, weight: 10 },
    { id: 'task-2', title: 'Homework 2', completed: true, courseId: 'course-1', dueDate: '2024-06-09', grade: 95, maxGrade: 100, weight: 10 },
    { id: 'task-3', title: 'Midterm Exam', completed: false, courseId: 'course-1', weight: 30, dueDate: '2024-06-20' },
    { id: 'task-4', title: 'Quiz 1', completed: true, courseId: 'course-2', dueDate: '2024-06-04', grade: 8, maxGrade: 10, weight: 5 },
    { id: 'task-5', title: 'Quiz 2', completed: false, courseId: 'course-2', weight: 5, dueDate: '2024-06-11' },
    { id: 'task-6', title: 'Read Chapter 3', completed: true, courseId: 'course-3', weight: 0 },
    { id: 'task-7', title: 'Schedule dentist appointment', completed: false },
];

export const TIMETABLE: TimetableEntry[] = [
    { id: 'tt-1', courseId: 'course-1', day: 'Monday', startTime: '10:00', endTime: '11:30', location: 'Hall A' },
    { id: 'tt-2', courseId: 'course-2', day: 'Monday', startTime: '13:00', endTime: '14:30', location: 'Hall B' },
    { id: 'tt-3', courseId: 'course-1', day: 'Wednesday', startTime: '10:00', endTime: '11:30', location: 'Hall A' },
    { id: 'tt-4', courseId: 'course-3', day: 'Wednesday', startTime: '15:00', endTime: '17:00', location: 'Hall C' },
    { id: 'tt-5', courseId: 'course-2', day: 'Friday', startTime: '13:00', endTime: '14:30', location: 'Hall B' },
];