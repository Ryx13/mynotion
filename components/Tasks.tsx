import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';
import Icon from './Icon';

const TaskItem: React.FC<{ task: Task, onToggle: () => void, onDelete: () => void }> = ({ task, onToggle, onDelete }) => {
  const { courses } = useAppContext();
  const course = courses.find(c => c.id === task.courseId);

  return (
    <div className="flex items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
      />
      <div className={`ml-3 flex-grow ${task.completed ? 'line-through text-slate-400' : ''}`}>
        <p className="font-medium">{task.title}</p>
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            {course && <span>{course.name}</span>}
            {course && (task.weight || task.dueDate) ? <span className="font-bold">&middot;</span> : null}
            {task.weight ? <span>Weight: {task.weight}%</span> : null}
            {task.weight && task.dueDate ? <span className="font-bold">&middot;</span> : null}
            {task.dueDate && <span>Due: {task.dueDate}</span>}
        </div>
      </div>
      <button onClick={onDelete} className="ml-4 text-slate-400 hover:text-red-500" aria-label={`Delete task ${task.title}`}>
        <Icon name="trash" />
      </button>
    </div>
  );
};

const Tasks: React.FC = () => {
  const { tasks, courses, addTask, updateTask, deleteTask } = useAppContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [weight, setWeight] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({ 
          title: newTaskTitle.trim(), 
          courseId: selectedCourseId || undefined,
          weight: weight ? parseFloat(weight) : undefined,
          dueDate: dueDate || undefined,
      });
      setNewTaskTitle('');
      setSelectedCourseId('');
      setWeight('');
      setDueDate('');
    }
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50 mb-6">
        <form onSubmit={handleAddTask} className="space-y-4">
            <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="task-course" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course (Optional)</label>
                    <select
                        id="task-course"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">No Course</option>
                        {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="task-weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (%)</label>
                    <input
                        id="task-weight"
                        type="number"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="e.g. 15"
                        disabled={!selectedCourseId}
                        className="w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                    />
                </div>
                 <div>
                    <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                <Icon name="plus" className="mr-2" /> Add Task
            </button>
        </form>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">To-Do ({incompleteTasks.length})</h2>
        {incompleteTasks.length > 0 ? (
          <div className="space-y-2">
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => updateTask(task.id, { completed: !task.completed })}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Nothing to do. All caught up!</p>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Completed ({completedTasks.length})</h2>
          <div className="space-y-2 mt-4">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => updateTask(task.id, { completed: !task.completed })}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;