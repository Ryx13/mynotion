import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Course, Task } from '../types';
import Icon from './Icon';
import Modal from './Modal';

const EditGradeModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    task: Task | null
}> = ({ isOpen, onClose, task }) => {
    const { updateTask } = useAppContext();
    const [grade, setGrade] = useState('');
    const [maxGrade, setMaxGrade] = useState('');
    const [weight, setWeight] = useState('');

    React.useEffect(() => {
        if (task) {
            setGrade(task.grade?.toString() || '');
            setMaxGrade(task.maxGrade?.toString() || '');
            setWeight(task.weight?.toString() || '');
        }
    }, [task]);

    if (!task) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: Partial<Task> = {
            grade: grade ? parseFloat(grade) : undefined,
            maxGrade: maxGrade ? parseFloat(maxGrade) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
        };
        updateTask(task.id, updates);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit: ${task.title}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                        <input id="grade" type="number" value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g., 85" className="block w-full input" />
                    </div>
                    <div>
                        <label htmlFor="maxGrade" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Out of</label>
                        <input id="maxGrade" type="number" value={maxGrade} onChange={e => setMaxGrade(e.target.value)} placeholder="e.g., 100" className="block w-full input" />
                    </div>
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (%)</label>
                    <input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g., 15" className="block w-full input" />
                </div>
                <div className="flex justify-end mt-6">
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Save Changes
                    </button>
                </div>
                 <style>{`.input { border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: white; padding: 0.5rem 0.75rem; } html.dark .input { border-color: #4b5563; background-color: #1f2937; color: #d1d5db; }`}</style>
            </form>
        </Modal>
    )
}

const CoursePerformanceCard: React.FC<{ course: Course }> = ({ course }) => {
    const { tasks, updateTask } = useAppContext();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const courseTasks = useMemo(() => tasks.filter(t => t.courseId === course.id), [tasks, course.id]);

    const performanceData = useMemo(() => {
        const gradedTasks = courseTasks.filter(t => t.grade != null && t.maxGrade != null && t.weight != null);
        const totalWeightedScore = gradedTasks.reduce((sum, task) => sum + (task.grade! / task.maxGrade!) * task.weight!, 0);
        const totalWeightOfGradedItems = gradedTasks.reduce((sum, task) => sum + task.weight!, 0);

        const currentGrade = totalWeightOfGradedItems > 0 ? (totalWeightedScore / totalWeightOfGradedItems) * 100 : 0;
        
        return {
            currentGrade,
            totalWeightCompleted: totalWeightOfGradedItems,
        };
    }, [courseTasks]);
    
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700/50">
            {editingTask && 
                <EditGradeModal isOpen={!!editingTask} onClose={() => setEditingTask(null)} task={editingTask} />
            }
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{course.name} <span className="text-sm font-medium text-slate-400">({course.code})</span></h3>
                    <p className="text-sm text-slate-500">{course.instructor}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Current Grade</div>
                    <div className={`text-3xl font-bold text-slate-800 dark:text-slate-100 ${performanceData.currentGrade >= 80 ? 'text-green-500' : performanceData.currentGrade >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {performanceData.currentGrade.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1 text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{performanceData.totalWeightCompleted}% of 100%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className={`bg-${course.color}-500 h-2.5 rounded-full`} style={{ width: `${performanceData.totalWeightCompleted}%` }}></div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold text-sm mt-4 mb-2">Assignments</h4>
                {courseTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="flex items-center">
                             <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => updateTask(task.id, { completed: !task.completed })}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`ml-3 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400 w-24 text-center">
                                {task.grade != null && task.maxGrade != null ? `${task.grade} / ${task.maxGrade}`: 'Not Graded'}
                            </span>
                             <span className="text-sm text-slate-500 dark:text-slate-400 w-16 text-center">{task.weight || 0}%</span>
                             <button onClick={() => setEditingTask(task)} className="text-slate-400 hover:text-blue-500" aria-label={`Edit grade for ${task.title}`}>
                                <Icon name="edit"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}


const Performance: React.FC = () => {
    const { courses } = useAppContext();

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6">Performance Overview</h1>
            
            {courses.length > 0 ? (
                <div className="space-y-6">
                    {courses.map(course => (
                        <CoursePerformanceCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                    <Icon name="chart-line" className="text-4xl mb-4" />
                    <h3 className="text-lg font-medium">No Performance Data</h3>
                    <p className="text-sm">Add courses and tasks to track your performance.</p>
                </div>
            )}
        </div>
    );
};

export default Performance;