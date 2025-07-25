

export interface NoteFolder {
  id: string;
  name: string;
}

export interface DeckFolder {
  id: string;
  name: string;
}

export type ThemeColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'indigo' | 'pink';

export const THEME_COLORS: ThemeColor[] = ['blue', 'red', 'green', 'yellow', 'purple', 'indigo', 'pink'];

export interface User {
  id: string;
  name: string;
  initials: string;
}

export interface Note {
  id:string;
  title: string;
  content: string; 
  tags: string[];
  lastModified: string;
  courseId?: string; 
  folderId?: string;
}

export enum CardStatus {
  Mastered = 'Mastered',
  Learning = 'Learning',
  Review = 'Review',
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  status: CardStatus;
  nextReviewDate: string;
}

export interface Deck {
  id: string;
  name: string;
  icon: string;
  courseId?: string;
  folderId?: string;
}

export interface Course {
    id: string;
    name: string;
    code: string; // e.g., "CS101"
    instructor: string;
    color: ThemeColor;
    term: 'Semester 1' | 'Semester 2' | 'Full Year';
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    courseId?: string; // Optional link to a course
    grade?: number;     // Grade received
    maxGrade?: number;  // Maximum possible grade
    weight?: number;    // Contribution to final grade in %
}

export interface TimetableEntry {
    id: string;
    courseId: string; // Links to a course
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string; // "HH:MM" format (24-hour)
    endTime: string;   // "HH:MM" format (24-hour)
    location?: string;
}