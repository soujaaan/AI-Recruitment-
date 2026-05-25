import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { interviewService } from '@/services/interview.service';

const ScheduleInterviewDialog = ({
    candidateId,
    jobId,
    applicationId,
    candidateName,
    onScheduled,
    trigger,
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        date: '',
        time: '',
        meetingLink: '',
        notes: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.date || !form.time) {
            toast.error('Date and time are required');
            return;
        }

        const scheduledAt = new Date(`${form.date}T${form.time}`);
        if (Number.isNaN(scheduledAt.getTime())) {
            toast.error('Invalid date or time');
            return;
        }

        setLoading(true);
        try {
            await interviewService.schedule({
                candidateId,
                jobId,
                applicationId,
                scheduledAt: scheduledAt.toISOString(),
                meetingLink: form.meetingLink,
                notes: form.notes,
            });
            toast.success(`Interview scheduled with ${candidateName || 'candidate'}`);
            setOpen(false);
            setForm({ date: '', time: '', meetingLink: '', notes: '' });
            onScheduled?.();
        } catch (err) {
            toast.error(err.message || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2">
                        <Calendar className="w-4 h-4" /> Schedule Interview
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-surface border-border sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                            <Input
                                type="time"
                                value={form.time}
                                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Meeting Link</label>
                        <Input
                            placeholder="https://meet.google.com/..."
                            value={form.meetingLink}
                            onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                        <textarea
                            className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                            placeholder="Interview focus, prep notes..."
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        />
                    </div>
                    <Button type="submit" className="w-full btn-neon" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Schedule
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleInterviewDialog;
