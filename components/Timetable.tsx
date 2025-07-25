import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TimetableEntry } from '../types';

const Timetable: React.FC = () => {
    const { timetable, courses } = useAppContext();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`); // 8 AM to 7 PM

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

    const parseTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + minutes / 60;
    };

    const TimetableEntryCard: React.FC<{ entry: TimetableEntry }> = ({ entry }) => {
        const course = getCourse(entry.courseId);
        if (!course) return null;

        const start = parseTime(entry.startTime);
        const end = parseTime(entry.endTime);
        const duration = end - start;

        const top = (start - 8) * 4; // 4rem per hour, starting from 8am
        const height = duration * 4; // 4rem per hour

        const colorClasses: Record<string, string> = {
            blue: 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-800 dark:text-blue-200',
            red: 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-200',
            green: 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-200',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500 text-yellow-800 dark:text-yellow-200',
            purple: 'bg-purple-100 dark:bg-purple-900/50 border-purple-500 text-purple-800 dark:text-purple-200',
            indigo: 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-800 dark:text-indigo-200',
            pink: 'bg-pink-100 dark:bg-pink-900/50 border-pink-500 text-pink-800 dark:text-pink-200',
        };
        const colorClass = colorClasses[course.color] || colorClasses.blue;

        return (
            <div
                className={`absolute left-2 right-2 p-2 rounded-lg border-l-4 ${colorClass} overflow-hidden`}
                style={{ top: `${top}rem`, height: `${height}rem` }}
            >
                <p className="font-bold text-sm">{course.name}</p>
                <p className="text-xs">{entry.startTime} - {entry.endTime}</p>
                {entry.location && <p className="text-xs mt-1">📍 {entry.location}</p>}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6">Weekly Timetable</h1>
            <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr] bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                {/* Header Row */}
                <div className="p-2 border-r border-b border-slate-200 dark:border-slate-700"></div>
                {days.map(day => (
                    <div key={day} className="p-2 text-center font-medium border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0">{day}</div>
                ))}

                {/* Timetable Body */}
                <div className="relative col-start-1 col-end-2 row-start-2 row-end-[14]">
                    {timeSlots.map(time => (
                        <div key={time} className="h-16 flex items-start justify-end pr-2 text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">
                            {time}
                        </div>
                    ))}
                </div>

                {days.map((day, dayIndex) => (
                    <div key={day} className="relative col-start-2" style={{ gridColumnStart: dayIndex + 2, gridRowStart: 2, gridRowEnd: 14 }}>
                        {/* Grid lines */}
                        {timeSlots.map((_, index) => (
                           <div key={index} className="h-16 border-r border-b border-slate-200 dark:border-slate-700 last:border-b-0"></div>
                        ))}
                        {/* Entries */}
                        {timetable.filter(entry => entry.day === day).map(entry => (
                           <TimetableEntryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timetable;
