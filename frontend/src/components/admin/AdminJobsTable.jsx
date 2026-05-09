import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../common/EmptyState'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Briefcase, Building2, Users, ArrowRight, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useJobMutations } from '@/hooks/useJobMutations'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const AdminJobsTable = ({ filter = '' }) => {
    const { allAdminJobs } = useSelector(store => store.job);
    const navigate = useNavigate();
    const { deleteJob } = useJobMutations();
    const [deletingId, setDeletingId] = useState(null);

    const filteredJobs = allAdminJobs.filter((job) =>
        !filter || job?.title?.toLowerCase().includes(filter.toLowerCase())
    );

    const handleDelete = async (jobId) => {
        setDeletingId(jobId);
        try {
            await deleteJob.mutateAsync(jobId);
            toast.success('Job deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete job');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className='space-y-3'>
            {filteredJobs?.length <= 0 ? (
                <EmptyState
                    title='No jobs posted'
                    description='Create your first job posting to get started.'
                />
            ) : (
                filteredJobs.map((job) => {
                    const applicantsCount = job.applications?.length || 0;

                    return (
                        <motion.div
                            key={job._id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => navigate('/admin/jobs/' + job._id + '/applicants')}
                            className='group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:bg-surface transition-all cursor-pointer duration-300'
                        >
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>

                                {/* LEFT SECTION */}
                                <div
                                    className='flex items-center gap-4 flex-1'
                                >
                                    <div className='w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0'>
                                        <Briefcase className='w-5 h-5 text-muted-foreground' />
                                    </div>

                                    <div>
                                        <h4 className='font-display font-semibold text-foreground group-hover:text-accent transition-colors'>
                                            {job.title}
                                        </h4>

                                        <div className='flex items-center gap-3 mt-1 text-sm text-muted-foreground'>
                                            <span className='flex items-center gap-1'>
                                                <Building2 className='w-3.5 h-3.5' />
                                                {job.company?.name}
                                            </span>

                                            <span className='flex items-center gap-1'>
                                                <Users className='w-3.5 h-3.5' />
                                                {applicantsCount} applicants
                                            </span>
                                        </div>
                                    </div>
                                </div> {/* ✅ FIX 1 */}

                                {/* RIGHT SECTION */}
                                <div className='flex items-center gap-2'>
                                    <Badge variant='green'>{job.jobType}</Badge>
                                    <Badge variant='outline'>{job.status || 'active'}</Badge>

                                    <div className='flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/admin/jobs/' + job._id + '/applicants');
                                            }}
                                            title='View Applicants'
                                        >
                                            <Users className='w-4 h-4' />
                                        </Button>

                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.info('Edit functionality coming soon');
                                            }}
                                            title='Edit Job'
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10'
                                                    onClick={(e) => e.stopPropagation()}
                                                    title='Delete Job'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className='bg-surface border-border text-foreground'>
                                                <DialogHeader>
                                                    <DialogTitle className='text-foreground'>
                                                        Delete Job
                                                    </DialogTitle>
                                                    <DialogDescription className='text-muted-foreground'>
                                                        Are you sure you want to delete{' '}
                                                        <span className='text-accent font-medium'>
                                                            {job.title}
                                                        </span>
                                                        ? This action cannot be undone and will remove all associated applications.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className='flex gap-3 justify-end mt-4'>
                                                    <Button
                                                        variant='outline'
                                                        className='border-border'
                                                    >
                                                        Cancel
                                                    </Button>

                                                    <Button
                                                        variant='destructive'
                                                        onClick={() => handleDelete(job._id)}
                                                        disabled={deletingId === job._id}
                                                    >
                                                        {deletingId === job._id ? (
                                                            <>
                                                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                                                Deleting...
                                                            </>
                                                        ) : 'Delete'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <ArrowRight
                                        className='w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all cursor-pointer'
                                        onClick={() => navigate('/admin/jobs/' + job._id + '/applicants')}
                                    />
                                </div>

                            </div> {/* ✅ FIX 2 */}
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

export default AdminJobsTable;