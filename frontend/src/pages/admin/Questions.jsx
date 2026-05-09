import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import SectionHeader from '@/components/common/SectionHeader';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [newQuestion, setNewQuestion] = useState({
        role: "",
        question: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
        difficulty: "medium",
        skill: ""
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/v1/assessment/questions');
            setQuestions(res.data?.data?.questions || res.data?.questions || []);
        } catch (error) {
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await apiClient.delete(`/api/v1/assessment/questions/${id}`);
            toast.success("Question deleted");
            setQuestions(questions.filter(q => q._id !== id));
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newQuestion };
            if (payload.type === "mcq") {
                payload.options = payload.options.filter(o => o.trim() !== "");
            } else {
                delete payload.options;
                delete payload.correctAnswer;
            }

            const res = await apiClient.post('/api/v1/assessment/questions', payload);
            toast.success("Question created successfully");
            setIsAddModalOpen(false);
            setNewQuestion({
                role: "", question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1, difficulty: "medium", skill: ""
            });
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create question");
        }
    };

    const handleOptionChange = (idx, val) => {
        const newOpts = [...newQuestion.options];
        newOpts[idx] = val;
        setNewQuestion({ ...newQuestion, options: newOpts });
    };

    const filteredQuestions = questions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="01 — Admin"
                        title={<>Question <span className="gradient-text">Bank</span></>}
                        subtitle="Manage assessment questions for different roles."
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-surface border-border focus:border-accent focus:ring-accent/20"
                                placeholder="Search by question or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="btn-neon w-full sm:w-auto whitespace-nowrap">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-surface border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Question</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Role Target</label>
                                            <Input 
                                                required 
                                                placeholder="e.g. Frontend Developer" 
                                                value={newQuestion.role}
                                                onChange={e => setNewQuestion({...newQuestion, role: e.target.value})}
                                                className="bg-[#0a0a0a] border-border"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Skill Tag</label>
                                            <Input 
                                                required 
                                                placeholder="e.g. React" 
                                                value={newQuestion.skill}
                                                onChange={e => setNewQuestion({...newQuestion, skill: e.target.value})}
                                                className="bg-[#0a0a0a] border-border"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Question Text</label>
                                        <textarea 
                                            required 
                                            className="w-full h-24 bg-[#0a0a0a] border border-border rounded-md p-3 text-sm focus:border-accent outline-none resize-none"
                                            value={newQuestion.question}
                                            onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <select 
                                                className="w-full bg-[#0a0a0a] border border-border rounded-md h-10 px-3 text-sm"
                                                value={newQuestion.type}
                                                onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}
                                            >
                                                <option value="mcq">Multiple Choice</option>
                                                <option value="text">Short Answer</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Difficulty</label>
                                            <select 
                                                className="w-full bg-[#0a0a0a] border border-border rounded-md h-10 px-3 text-sm"
                                                value={newQuestion.difficulty}
                                                onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Points</label>
                                            <Input 
                                                type="number" min="1" required 
                                                value={newQuestion.points}
                                                onChange={e => setNewQuestion({...newQuestion, points: Number(e.target.value)})}
                                                className="bg-[#0a0a0a] border-border"
                                            />
                                        </div>
                                    </div>

                                    {newQuestion.type === "mcq" && (
                                        <div className="space-y-4 p-4 border border-border rounded-lg bg-[#0a0a0a]">
                                            <label className="text-sm font-medium">Options</label>
                                            {newQuestion.options.map((opt, i) => (
                                                <Input 
                                                    key={i}
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => handleOptionChange(i, e.target.value)}
                                                    className="bg-surface border-border mb-2"
                                                    required={i < 2} // require at least 2 options
                                                />
                                            ))}
                                            <div className="space-y-2 mt-4">
                                                <label className="text-sm font-medium text-accent">Correct Answer (Must match one option exactly)</label>
                                                <Input 
                                                    required 
                                                    placeholder="Paste correct option here"
                                                    value={newQuestion.correctAnswer}
                                                    onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                                                    className="bg-surface border-accent/50"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full btn-neon mt-4">Save Question</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>

                    {/* Questions List */}
                    <div className="mt-8 space-y-4">
                        {loading ? (
                            <p className="text-muted-foreground text-center py-10">Loading questions...</p>
                        ) : filteredQuestions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No questions found.</p>
                        ) : (
                            filteredQuestions.map((q) => (
                                <div key={q._id} className="p-5 bg-surface/60 border border-border rounded-xl flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">{q.role}</Badge>
                                            <Badge variant="secondary" className="text-xs">{q.skill}</Badge>
                                            <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'easy' ? 'green' : 'outline'} className="text-xs">
                                                {q.difficulty}
                                            </Badge>
                                        </div>
                                        <h4 className="text-foreground font-medium">{q.question}</h4>
                                        {q.type === "mcq" && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Answer: <span className="text-[#00ff88]">{q.correctAnswer}</span>
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{q.type} • {q.points} pts</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Questions;
