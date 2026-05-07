import React, { useState, useEffect } from 'react';
import { UserProfile, Task, TaskPriority, TaskStatus } from '../types';
import { dbService } from '../services/dbService';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag,
  MoreHorizontal,
  X,
  PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Scheduler: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: TaskPriority.MEDIUM,
    dueDate: new Date()
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const result = await dbService.getTasks(profile.id);
    setTasks(result);
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    await dbService.addTask({
      ...newTask,
      status: TaskStatus.TODO,
      userId: profile.id,
      impact: 'AI Calculated'
    });

    setNewTask({ title: '', priority: TaskPriority.MEDIUM, dueDate: new Date() });
    setIsModalOpen(false);
    loadTasks();
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
    await dbService.updateTaskStatus(task.id, nextStatus);
    loadTasks();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === TaskStatus.COMPLETED && b.status !== TaskStatus.COMPLETED) return 1;
    if (a.status !== TaskStatus.COMPLETED && b.status === TaskStatus.COMPLETED) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Execution</h1>
          <p className="text-gray-500">Plan your day, grow your empire.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-black/10"
        >
          <PlusCircle size={20} /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-20 text-center opacity-30 animate-pulse">Loading actions...</div>
          ) : sortedTasks.map((task, idx) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "premium-card p-4 flex items-center gap-4 transition-all",
                task.status === TaskStatus.COMPLETED ? "opacity-50 grayscale bg-gray-50/50" : "hover:border-black/10"
              )}
            >
              <button 
                onClick={() => toggleStatus(task)}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  task.status === TaskStatus.COMPLETED ? "text-emerald-500" : "text-gray-300 hover:text-black"
                )}
              >
                {task.status === TaskStatus.COMPLETED ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-gray-900 truncate transition-all",
                  task.status === TaskStatus.COMPLETED && "line-through text-gray-400"
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                    task.priority === 'high' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                    <Flag size={10} /> {task.priority}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <Clock size={10} /> {format(task.dueDate, 'MMM dd')}
                  </span>
                </div>
              </div>

              <button className="text-gray-300 hover:text-black">
                <MoreHorizontal size={20} />
              </button>
            </motion.div>
          ))}
          {!loading && tasks.length === 0 && (
            <div className="text-center py-20 opacity-30 border-2 border-dashed border-gray-100 rounded-3xl">
              <Calendar size={48} className="mx-auto mb-4" />
              <p className="font-semibold text-lg">No tasks scheduled</p>
              <p className="text-sm">Your slate is clean. Ready to plan some growth?</p>
            </div>
          )}
        </div>

        {/* AI Scheduler Summary */}
        <div className="space-y-6">
          <div className="premium-card p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-200">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Calendar size={20} /> Today's Focus
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Cortex suggests prioritizing high-impact growth tasks before 11AM to maximize productivity based on your previous logs.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-200">
                <span>Daily Target</span>
                <span>80%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[80%] rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Urgent Deadlines</h3>
            <div className="space-y-4">
               {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3).map(t => (
                 <div key={t.id} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-rose-500" />
                   <p className="text-sm font-semibold text-gray-700 truncate">{t.title}</p>
                 </div>
               ))}
               {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length === 0 && (
                 <p className="text-xs text-gray-400 font-medium italic text-center py-4">No critical issues detected.</p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">New Action Item</h2>
              
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Task Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Follow up with prospective client"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all appearance-none bg-no-repeat bg-right text-sm font-semibold"
                    >
                      <option value={TaskPriority.LOW}>Low Intensity</option>
                      <option value={TaskPriority.MEDIUM}>Medium Impact</option>
                      <option value={TaskPriority.HIGH}>High Urgency</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Date</label>
                    <input 
                      type="date" 
                      value={format(newTask.dueDate, 'yyyy-MM-dd')}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all"
                >
                  Schedule Insight
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
