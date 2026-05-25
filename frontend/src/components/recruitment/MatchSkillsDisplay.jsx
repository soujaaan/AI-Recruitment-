import { Check, X } from 'lucide-react';

const MatchSkillsDisplay = ({ matchScore, matchedSkills = [], missingSkills = [], compact = false }) => {
    const scoreColor =
        matchScore >= 75 ? 'text-[#00ff88]' : matchScore >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Match Score</span>
                <span className={`font-bold ${compact ? 'text-lg' : 'text-xl'} ${scoreColor}`}>
                    {matchScore ?? 0}%
                </span>
            </div>

            {matchedSkills.length > 0 && (
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Matched</p>
                    <ul className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((skill) => (
                            <li
                                key={skill}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20"
                            >
                                <Check className="w-3 h-3" /> {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {missingSkills.length > 0 && (
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Missing</p>
                    <ul className="flex flex-wrap gap-1.5">
                        {missingSkills.map((skill) => (
                            <li
                                key={skill}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-red-500/10 text-red-400 border border-red-500/20"
                            >
                                <X className="w-3 h-3" /> {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MatchSkillsDisplay;
