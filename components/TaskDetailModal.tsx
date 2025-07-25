import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './Modal';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task }) => {
    const { courses, updateTask } = useAppContext();
    const [formData, setFormData] = useState<Partial<Task>>({});
    
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                dueDate: task.dueDate || '',
                courseId: task.courseId || undefined,
                grade: task.grade,
                maxGrade: task.maxGrade,
                weight: task.weight,
            });
        }
    }, [task]);

    if (!task) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: Partial<Task> = {
            ...formData,
            grade: formData.grade != null && String(formData.grade) !== '' ? parseFloat(String(formData.grade)) : undefined,
            maxGrade: formData.maxGrade != null && String(formData.maxGrade) !== '' ? parseFloat(String(formData.maxGrade)) : undefined,
            weight: formData.weight != null && String(formData.weight) !== '' ? parseFloat(String(formData.weight)) : undefined,
            courseId: formData.courseId === '' ? undefined : formData.courseId,
        };
        updateTask(task.id, updates);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} className="block w-full input" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="courseId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                        <select id="courseId" name="courseId" value={formData.courseId || ''} onChange={handleChange} className="block w-full input">
                            <option value="">No Course</option>
                            {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                        <input id="dueDate" name="dueDate" type="date" value={formData.dueDate || ''} onChange={handleChange} className="block w-full input" />
                    </div>
                </div>
                <fieldset className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <legend className="text-sm font-medium px-2">Grading</legend>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="grade" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                            <input id="grade" name="grade" type="number" step="any" value={formData.grade || ''} onChange={handleChange} className="block w-full input" />
                        </div>
                        <div>
                            <label htmlFor="maxGrade" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Out of</label>
                            <input id="maxGrade" name="maxGrade" type="number" step="any" value={formData.maxGrade || ''} onChange={handleChange} className="block w-full input" />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (%)</label>
                            <input id="weight" name="weight" type="number" step="any" value={formData.weight || ''} onChange={handleChange} className="block w-full input" />
                        </div>
                    </div>
                </fieldset>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Save Changes</button>
                </div>
                <style>{`.input { border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: white; padding: 0.5rem 0.75rem; } html.dark .input { border-color: #4b5563; background-color: #1f2937; color: #d1d5db; }`}</style>
            </form>
        </Modal>
    );
};

export default TaskDetailModal;