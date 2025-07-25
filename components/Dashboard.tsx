import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CardStatus, Note, Deck } from '../types';
import Icon from './Icon';
import { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const StatCard: React.FC<{ title: string, value: number | string, icon: string, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center">
        <div className={`w-12 h-12 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-${color}-600 dark:text-${color}-400 mr-4`}>
            <Icon name={icon} className="text-xl" />
        </div>
        <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
        </div>
    </div>
);

const RecentNoteCard: React.FC<{ note: Note, onNavigate: () => void }> = ({ note, onNavigate }) => (
    <div onClick={onNavigate} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium truncate pr-2">{note.title}</h4>
            <span className="text-xs text-slate-400 flex-shrink-0">{note.lastModified}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.content}</p>
    </div>
)

const PracticeDeckCard: React.FC<{ deck: Deck, onNavigate: () => void }> = ({ deck, onNavigate }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 text-slate-500`}>
                <Icon name={deck.icon} />
            </div>
            <span className="font-medium text-sm">{deck.name}</span>
        </div>
        <button onClick={onNavigate} className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">Practice</button>
    </div>
)


const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { notes, decks, flashcards, user, tasks, courses } = useAppContext();
  
  const firstName = user.name.split(' ')[0];
  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);
  
  const dashboardData = useMemo(() => {
    const cardsToReviewCount = flashcards.filter(f => f.status === CardStatus.Review).length;
    
    const recentNotes = [...notes]
      // A proper implementation would parse and sort dates, but for this mock data, assuming latest are first is fine.
      .slice(0, 3);
      
    const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

    const decksToReviewIds = new Set(flashcards.filter(f => f.status === CardStatus.Review).map(f => f.deckId));
    const decksToReview = decks.filter(d => decksToReviewIds.has(d.id));

    return {
      totalNotes: notes.length,
      totalDecks: decks.length,
      totalTasks: tasks.length,
      cardsToReview: cardsToReviewCount,
      recentNotes,
      incompleteTasks,
      decksToReview
    }
  }, [notes, decks, flashcards, tasks]);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {firstName}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Notes" value={dashboardData.totalNotes} icon="file-alt" color="blue" />
          <StatCard title="Total Decks" value={dashboardData.totalDecks} icon="layer-group" color="green" />
          <StatCard title="Total Tasks" value={dashboardData.totalTasks} icon="check-square" color="indigo" />
          <StatCard title="Cards to Review" value={dashboardData.cardsToReview} icon="bell" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Notes</h2>
                    <button onClick={() => onNavigate('notes')} className="text-sm text-blue-500 hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                    {dashboardData.recentNotes.length > 0 ? (
                        dashboardData.recentNotes.map(note => <RecentNoteCard key={note.id} note={note} onNavigate={() => onNavigate('notes')} />)
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">No recent notes.</p>
                    )}
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
                    <button onClick={() => onNavigate('tasks')} className="text-sm text-blue-500 hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                     {dashboardData.incompleteTasks.length > 0 ? (
                        dashboardData.incompleteTasks.map(task => (
                            <div key={task.id} className="flex items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 text-sm">
                                <Icon name="circle" className="text-xs text-slate-400 mr-3" />
                                <span className="flex-grow">{task.title}</span>
                                {task.courseId && <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full flex-shrink-0">
                                    {courseMap.get(task.courseId)?.name || 'Course'}
                                </span>}
                            </div>
                        ))
                     ) : (
                         <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">All tasks completed! ✨</p>
                     )}
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Practice Decks</h2>
                    <button onClick={() => onNavigate('flashcards')} className="text-sm text-blue-500 hover:underline">View all</button>
                </div>
                 <div className="space-y-3">
                    {dashboardData.decksToReview.length > 0 ? (
                        dashboardData.decksToReview.map(deck => <PracticeDeckCard key={deck.id} deck={deck} onNavigate={() => onNavigate('flashcards')} />)
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">No decks need review. Great job!</p>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;