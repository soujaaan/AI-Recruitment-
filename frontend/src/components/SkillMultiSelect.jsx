import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { skillsData } from '../data/skills';

const SkillMultiSelect = ({ selectedSkills = [], onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(0); // auto-highlight first
    
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const itemRefs = useRef([]);

    // Flatten all skills and attach category
    const allSkills = useMemo(() => {
        return skillsData.flatMap(cat => 
            cat.skills.map(skill => ({ name: skill, category: cat.category }))
        );
    }, []);

    // Filter, exclude selected, and group
    const filteredSkills = useMemo(() => {
        let matches = [];
        const unselected = allSkills.filter(s => !selectedSkills.includes(s.name));

        if (!searchTerm) {
            // Show a few from top categories as suggestions when empty
            matches = unselected.slice(0, 30);
        } else {
            const term = searchTerm.toLowerCase();
            matches = unselected.filter(s => 
                s.name.toLowerCase().includes(term) || 
                s.category.toLowerCase().includes(term)
            ).slice(0, 40); // Cap for performance
        }

        // Sort by category to allow grouping in UI while keeping 1D array for navigation
        return matches.sort((a, b) => a.category.localeCompare(b.category));
    }, [searchTerm, selectedSkills, allSkills]);

    // Reset focused index when search term changes to always highlight the first result
    useEffect(() => {
        setFocusedIndex(0);
        if (searchTerm && !isOpen) {
            setIsOpen(true);
        }
    }, [searchTerm]);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setFocusedIndex(0);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll to the focused item when using keyboard
    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [focusedIndex, isOpen]);

    const handleSelect = (skillName) => {
        if (!selectedSkills.includes(skillName)) {
            onChange([...selectedSkills, skillName]);
        }
        setSearchTerm('');
        setFocusedIndex(0);
        inputRef.current?.focus();
    };

    const handleRemove = (skillToRemove) => {
        onChange(selectedSkills.filter(skill => skill !== skillToRemove));
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && !searchTerm) {
            if (selectedSkills.length > 0) {
                handleRemove(selectedSkills[selectedSkills.length - 1]);
            }
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            if (isOpen && filteredSkills.length > 0) {
                e.preventDefault(); // Prevent tab from moving to next input or enter submitting form
                handleSelect(filteredSkills[focusedIndex].name);
            } else if (e.key === 'Enter') {
                e.preventDefault();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setFocusedIndex(prev => Math.min(prev + 1, filteredSkills.length - 1));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setFocusedIndex(prev => Math.max(prev - 1, 0));
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setFocusedIndex(0);
        }
    };

    return (
        <div className="relative w-full font-sans" ref={wrapperRef}>
            {/* Input Wrapper - Gmail / LinkedIn style */}
            <div 
                className={`flex flex-wrap items-center gap-2 p-2 min-h-[52px] bg-[#0f0f0f] border rounded-xl transition-all duration-300 cursor-text shadow-sm ${
                    isOpen || searchTerm 
                        ? 'border-[#00ff88]/50 shadow-[0_0_15px_rgba(0,255,136,0.1)]' 
                        : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                <AnimatePresence>
                    {selectedSkills.map((skill) => (
                        <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 text-sm font-medium hover:bg-[#00ff88]/20 transition-colors group select-none shadow-[0_0_10px_rgba(0,255,136,0.05)] hover:shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                        >
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(skill);
                                }}
                                className="p-0.5 rounded-md hover:bg-[#00ff88]/30 transition-colors focus:outline-none"
                            >
                                <X className="w-3 h-3 text-[#00ff88] opacity-70 group-hover:opacity-100" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Inline Input */}
                <div className="flex-1 min-w-[140px] relative">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground p-1 font-medium"
                        placeholder={selectedSkills.length === 0 ? "Type a skill (e.g. React, Node.js)..." : "Add another skill..."}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>
            </div>

            {/* Dropdown Palette */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#141414]/95 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl"
                    >
                        <div 
                            className="max-h-[300px] overflow-y-auto custom-scrollbar p-2" 
                            ref={listRef}
                        >
                            {filteredSkills.length > 0 ? (
                                filteredSkills.map((skill, index) => {
                                    const isFocused = focusedIndex === index;
                                    const prevSkill = filteredSkills[index - 1];
                                    const showCategoryHeader = !prevSkill || prevSkill.category !== skill.category;

                                    return (
                                        <React.Fragment key={`${skill.category}-${skill.name}`}>
                                            {showCategoryHeader && (
                                                <div className="px-3 py-1.5 mt-2 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest sticky top-0 bg-[#141414]/95 backdrop-blur z-10">
                                                    {skill.category}
                                                </div>
                                            )}
                                            <div
                                                ref={el => itemRefs.current[index] = el}
                                                className={`px-3 py-2.5 flex items-center justify-between rounded-lg cursor-pointer transition-all duration-200 ${
                                                    isFocused 
                                                        ? 'bg-[#00ff88]/15 text-[#00ff88] pl-5' 
                                                        : 'text-foreground/80 hover:bg-white/5 hover:text-foreground'
                                                }`}
                                                onClick={() => handleSelect(skill.name)}
                                                onMouseEnter={() => setFocusedIndex(index)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isFocused && (
                                                        <motion.div 
                                                            layoutId="activeIndicator"
                                                            className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)] absolute left-3"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    )}
                                                    <span className={`text-sm font-medium ${isFocused ? 'text-[#00ff88]' : ''}`}>
                                                        {skill.name}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-50">
                                                    {isFocused && <span className="mr-2 text-[#00ff88] font-semibold tracking-wider">TAB</span>}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                                    <Search className="w-8 h-8 mb-3 opacity-20" />
                                    <span className="text-sm font-medium text-foreground/70">No skills found</span>
                                    <span className="text-xs mt-1">Try a different search term</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillMultiSelect;
