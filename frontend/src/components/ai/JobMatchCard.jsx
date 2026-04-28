import { Badge } from "../ui/badge";
import GlassCard from "../common/GlassCard";

const JobMatchCard = ({ match }) => {
    if (!match) {
        return null;
    }

    const matchScore = match.matchScore ?? match.score ?? 0;

    return (
        <GlassCard glow className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Job match</p>
                    <h3 className="font-display font-bold text-4xl text-accent mt-1">{matchScore}%</h3>
                </div>
                <Badge variant="green">Match %</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Matched</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(match.matchedSkills || []).map((skill) => <Badge key={skill}>{skill}</Badge>)}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Missing</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(match.missingSkills || []).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                </div>
            </div>
            {match.rationale ? <p className="mt-4 text-sm text-muted-foreground">{match.rationale}</p> : null}
        </GlassCard>
    );
};

export default JobMatchCard;

