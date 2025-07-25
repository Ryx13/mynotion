import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';
import Icon from './Icon';
import TaskDetailModal from './TaskDetailModal';

const Schedule: React.FC = () => {
  const { tasks, courses, updateTask } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c.code])), [courses]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    
    const daysInMonth = [];
    // Add padding for days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
        daysInMonth.push(null);
    }
    // Add days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        daysInMonth.push(new Date(year, month, i));
    }
    
    return daysInMonth;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
        if (task.dueDate) {
            const dateKey = task.dueDate; // YYYY-MM-DD
            if(!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)!.push(task);
        }
    });
    return map;
  }, [tasks]);

  const TaskPill: React.FC<{task: Task, onSelect: (task: Task) => void}> = ({task, onSelect}) => {
    const course = task.courseId ? courses.find(c => c.id === task.courseId) : null;
    const color = course?.color || 'blue';
    
    const colorClasses: Record<string, string> = {
        base: `bg-${color}-100 dark:bg-${color}-900/50 text-${color}-800 dark:text-${color}-200`,
        completed: `bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 line-through`,
    };

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening
        updateTask(task.id, { completed: !task.completed });
    };

    return (
        <div 
            onClick={() => onSelect(task)}
            title={task.title}
            className={`text-xs p-1 rounded-md mb-1 w-full flex items-center truncate cursor-pointer transition-colors ${task.completed ? colorClasses.completed : colorClasses.base}`}
        >
            <span onClick={handleToggleComplete} className="flex items-center justify-center h-5 w-5">
              <Icon name={task.completed ? "check-circle" : "circle"} className="text-base align-middle" />
            </span>
            <span className="truncate ml-1">
                {course && <span className="font-bold">{course.code}: </span>}
                {task.title}
            </span>
        </div>
    );
  };

  return (
    <>
      <TaskDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold w-36 text-center">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center">
                  <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="chevron-left" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="text-sm px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">Today</button>
                  <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="chevron-right" /></button>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {/* Calendar Header */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{day}</div>
          ))}

          {/* Calendar Body */}
          {calendarData.map((day, index) => {
            const isToday = day && day.toDateString() === new Date().toDateString();
            const dayKey = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` : '';
            const dayTasks = day ? tasksByDate.get(dayKey) || [] : [];
            
            return (
              <div key={index} className="relative min-h-[8rem] bg-white dark:bg-slate-900/70 p-1.5">
                {day && (
                  <>
                    <span className={`absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center text-sm rounded-full ${isToday ? 'bg-blue-500 text-white font-bold' : ''}`}>
                      {day.getDate()}
                    </span>
                    <div className="mt-8 space-y-1">
                        {dayTasks.map(task => <TaskPill key={task.id} task={task} onSelect={setSelectedTask} />)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Schedule;