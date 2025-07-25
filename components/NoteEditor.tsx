import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

interface NoteEditorProps {
  note: Note;
  onSave: (updatedNote: Note) => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onBack }) => {
  const { courses, noteFolders } = useAppContext();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  const [category, setCategory] = useState(() => {
    if (note.courseId) return `course-${note.courseId}`;
    if (note.folderId) return `folder-${note.folderId}`;
    return 'personal';
  });
  
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    let courseId = undefined;
    let folderId = undefined;

    if(category.startsWith('course-')) {
        courseId = category.replace('course-', '');
    } else if (category.startsWith('folder-')) {
        folderId = category.replace('folder-', '');
    }

    setSaveStatus('saving');
    const handler = setTimeout(() => {
      onSave({ ...note, title, content, courseId, folderId });
      setSaveStatus('saved');
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [title, content, category, note, onSave]);

  const getStatusIndicator = () => {
    switch(saveStatus) {
      case 'saving':
        return <><Icon name="save" className="mr-2 animate-pulse" /> Saving...</>;
      case 'saved':
        return <><Icon name="check-circle" className="mr-2 text-green-500" /> Saved</>;
      default:
        return null;
    }
  }

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <header className="flex items-center mb-6 flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Icon name="chevron-left" className="mr-2" />
          Back to Notes
        </button>
        <div className="ml-auto text-sm text-slate-400 flex items-center space-x-4">
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-48 px-3 py-1 text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="personal">Personal (Uncategorized)</option>
                <optgroup label="Courses">
                    {courses.map(c => <option key={c.id} value={`course-${c.id}`}>{c.name}</option>)}
                </optgroup>
                 <optgroup label="Personal Folders">
                    {noteFolders.map(f => <option key={f.id} value={`folder-${f.id}`}>{f.name}</option>)}
                </optgroup>
            </select>
            {getStatusIndicator()}
        </div>
      </header>

      <div className="flex-grow flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full p-0 mb-4"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="flex-grow w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-base resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};

export default NoteEditor;