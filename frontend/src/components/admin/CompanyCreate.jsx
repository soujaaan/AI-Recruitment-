import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useCompanyMutations } from '@/hooks/useCompanyMutations';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';

const CompanyCreate = () => {
    const navigate = useNavigate();
    const { registerCompany } = useCompanyMutations();
    const [companyName, setCompanyName] = useState('');
    const [file, setFile] = useState(null);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("companyName", companyName);
            if (file) {
                formData.append("file", file);
            }

            await registerCompany.mutateAsync(formData);
            toast.success("Company registered successfully!");
            navigate("/admin/companies");
        } catch (error) {
            toast.error(error.message || "Failed to register company");
        }
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="section-label">Admin</p>
                                    <h1 className="font-display font-bold text-2xl text-foreground">Register Company</h1>
                                </div>
                            </div>

                            <form onSubmit={submitHandler} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input 
                                        type="text" 
                                        value={companyName} 
                                        onChange={(e) => setCompanyName(e.target.value)} 
                                        placeholder="Enter your company name" 
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                        required 
                                    />
                                    <p className="text-xs text-muted-foreground">You can't change this later.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Company Logo (Optional)</Label>
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setFile(e.target.files?.[0])}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20 cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1 border-border hover:bg-surface-elevated" onClick={() => navigate("/admin/companies")}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 btn-neon" disabled={registerCompany.isPending || !companyName.trim()}>
                                        {registerCompany.isPending ? "Registering..." : "Register Company"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default CompanyCreate;
