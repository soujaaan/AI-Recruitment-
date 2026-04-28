import { Badge } from "../ui/badge";
import GlassCard from "../common/GlassCard";

const ResumeScoreCard = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    const score = analysis.atsScore ?? analysis.score ?? 0;

    return (
        <GlassCard glow className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Resume score</p>
                    <h3 className="font-display font-bold text-4xl text-accent mt-1">{score}%</h3>
                </div>
                <Badge variant="green">AI Score</Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{analysis.summary || "Resume analysis available."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                {(analysis.skills || []).slice(0, 6).map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
            </div>
        </GlassCard>
    );
};

export default ResumeScoreCard;

