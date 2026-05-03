import React from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, MapPin, Briefcase } from 'lucide-react'
import GlassCard from './common/GlassCard'

const Job = ({ job }) => {
    const navigate = useNavigate();

    return (
        <GlassCard
            animate={false}
            className="cursor-pointer flex flex-col h-full group"
            onClick={() => navigate(`/jobs/${job?._id}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{job?.company?.name}</p>
                    <h3 className="font-display font-bold text-xl text-foreground mt-1 group-hover:text-accent transition-colors">
                        {job?.title}
                    </h3>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all duration-300" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {job?.description}
            </p>

            <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job?.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job?.experienceLevel}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="green">{job?.jobType}</Badge>
                    <Badge variant="secondary">{job?.salary}</Badge>
                    <Badge variant="outline">{job?.experienceLevel}</Badge>
                </div>

                <Button 
                    className="w-full btn-neon-outline" 
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/description/${job?._id}`);
                    }}
                >
                    View Details
                </Button>
            </div>
        </GlassCard>
    )
}

export default Job

