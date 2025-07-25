import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Note, Course, NoteFolder } from '../types';
import Icon from './Icon';
import NoteEditor from './NoteEditor';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

const NoteCard: React.FC<{ note: Note, courseName?: string, onSelect: () => void, onDelete: () => void }> = ({ note, courseName, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white dark:bg-slate-800/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-48 group"
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-medium truncate mb-1 pr-2 flex-grow">{note.title}</h3>
            {courseName && <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full flex-shrink-0">{courseName}</span>}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 text-ellipsis whitespace-pre-wrap mt-1">{note.content}</p>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-slate-400">{note.lastModified}</span>
        <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete note ${note.title}`}>
          <Icon name="trash" />
        </button>
      </div>
    </div>
  )
}

const NotesGrid: React.FC<{
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (note: Note) => void;
  courseMap?: Map<string, Course>;
}> = ({ notes, onSelectNote, onDeleteNote, courseMap }) => {
  if (notes.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400 px-2">No notes in this section.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          courseName={note.courseId ? courseMap?.get(note.courseId)?.name : undefined}
          onSelect={() => onSelectNote(note.id)}
          onDelete={() => onDeleteNote(note)}
        />
      ))}
    </div>
  );
};


const Notes: React.FC = () => {
  const { notes, courses, addNote, updateNote, deleteNote, noteFolders, addNoteFolder, updateNoteFolder, deleteNoteFolder } = useAppContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<NoteFolder | null>(null);

  const handleCreateNote = (courseId?: string, folderId?: string) => {
    const newNote = addNote({ title: 'Untitled Note', content: '', tags: [], courseId, folderId });
    setSelectedNoteId(newNote.id);
  };
  
  const handleSaveNote = (updatedNote: Note) => updateNote(updatedNote);
  const selectedNote = notes.find(note => note.id === selectedNoteId);
  
  const { notesByCourse, personalNotesByFolder, uncategorizedPersonalNotes } = useMemo(() => {
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
  
  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  const handleFolderModalOpen = (folder?: NoteFolder) => {
    setEditingFolder(folder || null);
    setFolderName(folder?.name || '');
    setIsFolderModalOpen(true);
  }

  const handleFolderFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(folderName.trim()) {
      if(editingFolder) {
        updateNoteFolder(editingFolder.id, folderName.trim());
      } else {
        addNoteFolder(folderName.trim());
      }
      setIsFolderModalOpen(false);
    }
  }

  const handleConfirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleConfirmDeleteFolder = () => {
    if (folderToDelete) {
      deleteNoteFolder(folderToDelete.id);
      setFolderToDelete(null);
    }
  };

  if (selectedNote) {
    return <NoteEditor key={selectedNote.id} note={selectedNote} onSave={handleSaveNote} onBack={() => setSelectedNoteId(null)} />;
  }
  
  return (
    <>
      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDeleteNote}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
      <ConfirmationModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleConfirmDeleteFolder}
        title="Delete Folder"
        message={`Are you sure you want to delete the folder "${folderToDelete?.name}"? Notes inside will become uncategorized.`}
        confirmText="Delete"
      />
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
          <h1 className="text-2xl font-bold">Notes</h1>
          <button onClick={() => handleCreateNote()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
              <Icon name="plus" className="mr-2" /> New Note
          </button>
        </div>
        
        <div className="space-y-8">
          {Array.from(notesByCourse.entries()).map(([courseId, courseNotes]) => (
             <details open key={courseId} className="group">
              <summary className="flex items-center mb-4 cursor-pointer list-none">
                <Icon name="chevron-right" className="transition-transform group-open:rotate-90 mr-2"/>
                <h2 className="text-xl font-semibold">{courseMap.get(courseId)?.name || 'Course Notes'} ({courseNotes.length})</h2>
              </summary>
              <NotesGrid notes={courseNotes} onSelectNote={setSelectedNoteId} onDeleteNote={setNoteToDelete} courseMap={courseMap} />
            </details>
          ))}
          
          <details open className="group">
            <summary className="flex justify-between items-center mb-4 cursor-pointer list-none">
              <div className="flex items-center">
                <Icon name="chevron-right" className="transition-transform group-open:rotate-90 mr-2"/>
                <h2 className="text-xl font-semibold">Personal Notes</h2>
              </div>
              <button onClick={() => handleFolderModalOpen()} className="text-sm px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md"><Icon name="folder-plus" className="mr-2"/>New Folder</button>
            </summary>

            <div className="space-y-6 pl-5">
              {noteFolders.map(folder => (
                <details open key={folder.id} className="group/folder">
                   <summary className="flex items-center mb-4 cursor-pointer list-none">
                      <Icon name="chevron-right" className="transition-transform group-open/folder:rotate-90 mr-2 text-slate-500"/>
                      <h3 className="text-lg font-medium">{folder.name} ({(personalNotesByFolder.get(folder.id) || []).length})</h3>
                      <button onClick={(e) => {e.preventDefault(); handleFolderModalOpen(folder)}} className="ml-4 text-slate-400 hover:text-blue-500"><Icon name="edit"/></button>
                      <button onClick={(e) => {e.preventDefault(); setFolderToDelete(folder);}} className="ml-2 text-slate-400 hover:text-red-500"><Icon name="trash"/></button>
                   </summary>
                   <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                      <NotesGrid notes={personalNotesByFolder.get(folder.id) || []} onSelectNote={setSelectedNoteId} onDeleteNote={setNoteToDelete} />
                   </div>
                </details>
              ))}

              <details open className="group/folder">
                <summary className="flex items-center mb-4 cursor-pointer list-none">
                    <Icon name="chevron-right" className="transition-transform group-open/folder:rotate-90 mr-2 text-slate-500"/>
                    <h3 className="text-lg font-medium">Uncategorized ({uncategorizedPersonalNotes.length})</h3>
                </summary>
                <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                  <NotesGrid notes={uncategorizedPersonalNotes} onSelectNote={setSelectedNoteId} onDeleteNote={setNoteToDelete} />
                </div>
              </details>
            </div>
          </details>
        </div>

        {notes.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
              <Icon name="book" className="text-4xl mb-4" />
              <h3 className="text-lg font-medium">No Notes Yet</h3>
              <p className="text-sm">Click "New Note" to create your first one.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Notes;