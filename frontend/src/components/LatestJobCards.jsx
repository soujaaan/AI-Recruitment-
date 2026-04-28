import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const LatestJobCards = ({ job, index }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => navigate(`/description/${job._id}`)}
            className="group relative rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] flex flex-col h-full"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-accent font-display font-bold text-sm">
                    0{index + 1}
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all duration-300" />
            </div>

            <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{job?.company?.name}</p>
                <h3 className="font-display font-bold text-xl text-foreground mt-1 group-hover:text-accent transition-colors">
                    {job?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {job?.description}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                <Badge variant="green">{job?.jobType}</Badge>
                <Badge variant="secondary">{job?.salary}</Badge>
            </div>
        </motion.div>
    )
}

export default LatestJobCards

