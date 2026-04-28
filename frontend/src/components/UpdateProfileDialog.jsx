import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { useProfileMutation } from '@/hooks/useAuthMutations'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const profileMutation = useProfileMutation();

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.map(skill => skill) || "",
        file: user?.profile?.resume || ""
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const result = await profileMutation.mutateAsync(formData);
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] bg-surface border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl">Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input
                            name="fullname"
                            value={input.fullname}
                            onChange={changeEventHandler}
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                            name="email"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <Input
                            name="phoneNumber"
                            value={input.phoneNumber}
                            onChange={changeEventHandler}
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Bio</Label>
                        <Input
                            name="bio"
                            value={input.bio}
                            onChange={changeEventHandler}
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Skills</Label>
                        <Input
                            name="skills"
                            value={input.skills}
                            onChange={changeEventHandler}
                            placeholder="Comma separated"
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Resume</Label>
                        <Input
                            type="file"
                            accept="application/pdf"
                            onChange={fileChangeHandler}
                            className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20 file:bg-surface file:border-0 file:text-foreground file:rounded-lg"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 border-border hover:bg-surface-elevated" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 btn-neon" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateProfileDialog

