import React, { useEffect, useState } from 'react';
import { Loader2, Target } from 'lucide-react';
import { apiClient } from '@/lib/api';
import MatchSkillsDisplay from './MatchSkillsDisplay';

const JobMatchCard = ({ jobId, userRole }) => {
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!jobId || userRole !== 'candidate') return;

        const fetchMatch = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/api/v1/application/match/${jobId}`);
                const data = res.data?.data || res.data;
                setMatch(data);
            } catch {
                setMatch(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [jobId, userRole]);

    if (userRole !== 'candidate') return null;

    return (
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Your Job Match
            </h3>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating match...
                </div>
            ) : match ? (
                <MatchSkillsDisplay
                    matchScore={match.matchScore}
                    matchedSkills={match.matchedSkills}
                    missingSkills={match.missingSkills}
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    Build your ATS profile with skills to see how you match this role.
                </p>
            )}
        </div>
    );
};

export default JobMatchCard;
