import React, { useState, useEffect } from 'react';
import { useAppContext, CourseFormData, CourseSchedule } from '../context/AppContext';
import { Course, THEME_COLORS, ThemeColor } from '../types';
import Icon from './Icon';
import Modal from './Modal';

const CourseCard: React.FC<{ course: Course, onEdit: () => void, onDelete: () => void }> = ({ course, onEdit, onDelete }) => {
    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    }
    
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between group h-36">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 pr-2 flex-1">{course.name}</h3>
                <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full flex-shrink-0">{course.code}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
            <p className="text-xs text-slate-400 mt-1">{course.term}</p>
        </div>
        <div className="mt-2 flex justify-between items-center">
            <span className={`w-4 h-4 rounded-full mr-auto bg-${course.color}-500`}></span>
            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleAction(e, onEdit)} className="text-slate-400 hover:text-blue-500" aria-label={`Edit course ${course.name}`}>
                    <Icon name="edit" />
                </button>
                <button onClick={(e) => handleAction(e, onDelete)} className="text-slate-400 hover:text-red-500" aria-label={`Delete course ${course.name}`}>
                    <Icon name="trash" />
                </button>
            </div>
        </div>
        </div>
    );
};

const Courses: React.FC = () => {
    const { courses, timetable, addCourse, updateCourse, deleteCourse } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const initialSchedule: CourseSchedule = { day: 'Monday', startTime: '09:00', endTime: '10:00', location: '' };
    const initialFormState: CourseFormData = {
        name: '',
        code: '',
        instructor: '',
        term: 'Semester 1',
        color: 'blue',
        schedules: [initialSchedule],
    };
    const [formState, setFormState] = useState<CourseFormData>(initialFormState);

    useEffect(() => {
        if (isModalOpen && editingCourse) {
            const courseSchedules = timetable
                .filter(tt => tt.courseId === editingCourse.id)
                .map(({ day, startTime, endTime, location }) => ({ day, startTime, endTime, location }));
            
            setFormState({
                name: editingCourse.name,
                code: editingCourse.code,
                instructor: editingCourse.instructor,
                term: editingCourse.term,
                color: editingCourse.color,
                schedules: courseSchedules.length > 0 ? courseSchedules : [initialSchedule]
            });
        } else {
            setFormState(initialFormState);
        }
    }, [isModalOpen, editingCourse, timetable]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleScheduleChange = (index: number, field: keyof CourseSchedule, value: string) => {
        const newSchedules = [...formState.schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setFormState({ ...formState, schedules: newSchedules });
    };
    
    const addSchedule = () => setFormState({ ...formState, schedules: [...formState.schedules, initialSchedule] });
    const removeSchedule = (index: number) => setFormState({ ...formState, schedules: formState.schedules.filter((_, i) => i !== index) });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, code, instructor } = formState;
        if (name.trim() && code.trim() && instructor.trim()) {
            if (editingCourse) {
                updateCourse(editingCourse.id, formState);
            } else {
                addCourse(formState);
            }
            handleCloseModal();
        } else {
            alert("Please fill in all required course details.");
        }
    };

    const handleOpenEditModal = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    return (
        <>
        <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingCourse ? 'Edit Course' : 'Create New Course'}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4">
                <legend className="text-md font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Course Details</legend>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                    <input id="name" name="name" type="text" value={formState.name} onChange={handleFormChange} required placeholder="e.g., Advanced React" className="block w-full input" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                        <input id="code" name="code" type="text" value={formState.code} onChange={handleFormChange} required placeholder="e.g., CS 301" className="block w-full input" />
                    </div>
                    <div>
                        <label htmlFor="term" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Term</label>
                        <select id="term" name="term" value={formState.term} onChange={handleFormChange} className="block w-full input">
                            <option>Semester 1</option>
                            <option>Semester 2</option>
                            <option>Full Year</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructor</label>
                    <input id="instructor" name="instructor" type="text" value={formState.instructor} onChange={handleFormChange} required placeholder="e.g., Dr. Jane Doe" className="block w-full input" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
                    <div className="flex space-x-3">
                        {THEME_COLORS.map(c => (
                            <button
                                type="button"
                                key={c}
                                onClick={() => setFormState({ ...formState, color: c })}
                                className={`w-8 h-8 rounded-full bg-${c}-500 transition-all ${formState.color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : ''}`}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-md font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Weekly Schedule</legend>
                {formState.schedules.map((schedule, index) => (
                    <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg space-y-3 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Day</label>
                                <select value={schedule.day} onChange={e => handleScheduleChange(index, 'day', e.target.value)} className="block w-full input-sm">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <input type="text" value={schedule.location} onChange={e => handleScheduleChange(index, 'location', e.target.value)} placeholder="e.g., Hall A" className="block w-full input-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                                <input type="time" value={schedule.startTime} onChange={e => handleScheduleChange(index, 'startTime', e.target.value)} required className="block w-full input-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                                <input type="time" value={schedule.endTime} onChange={e => handleScheduleChange(index, 'endTime', e.target.value)} required className="block w-full input-sm" />
                            </div>
                        </div>
                        {formState.schedules.length > 1 && (
                            <button type="button" onClick={() => removeSchedule(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-sm font-bold">&times;</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSchedule} className="w-full text-sm px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">Add Another Session</button>
            </fieldset>

            <div className="flex justify-end mt-6">
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
            </div>
            </form>
            <style>{`.input, .input-sm, select { border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: white; padding: 0.5rem 0.75rem; } .input-sm { font-size: 0.875rem; padding: 0.25rem 0.5rem; } html.dark .input, html.dark .input-sm, html.dark select { border-color: #4b5563; background-color: #1f2937; color: #d1d5db; }`}</style>
        </Modal>

        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Courses</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
            >
                <Icon name="plus" className="mr-2" />
                New Course
            </button>
            </div>
            {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map(course => (
                <CourseCard
                    key={course.id} 
                    course={course}
                    onEdit={() => handleOpenEditModal(course)}
                    onDelete={() => deleteCourse(course.id)}
                />
                ))}
            </div>
            ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                <Icon name="graduation-cap" className="text-4xl mb-4" />
                <h3 className="text-lg font-medium">No Courses Yet</h3>
                <p className="text-sm">Click "New Course" to add your first one.</p>
            </div>
            )}
        </div>
        </>
    );
};

export default Courses;
