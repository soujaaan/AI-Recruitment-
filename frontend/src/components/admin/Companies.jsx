import React from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useGetCompaniesQuery } from '@/hooks/useCompanyMutations';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import { Avatar, AvatarImage } from '../ui/avatar';

const Companies = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useGetCompaniesQuery();
    const companies = data?.companies || [];

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="font-display font-bold text-3xl text-foreground">Your Companies</h1>
                                <p className="text-muted-foreground mt-1">Manage your registered companies</p>
                            </div>
                            <Button onClick={() => navigate("/admin/companies/create")} className="btn-neon flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New Company
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="text-center py-20 bg-surface/50 rounded-2xl border border-border">
                                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h2 className="text-xl font-semibold text-foreground mb-2">No Companies Found</h2>
                                <p className="text-muted-foreground mb-6">You haven't registered any companies yet.</p>
                                <Button onClick={() => navigate("/admin/companies/create")} variant="outline" className="border-accent text-accent hover:bg-accent/10">
                                    Register your first company
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {companies.map((company) => (
                                    <div key={company._id} className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-16 h-16 border border-border">
                                                <AvatarImage src={company.logo || "https://github.com/shadcn.png"} alt={company.name} />
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-lg text-foreground line-clamp-1">{company.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{company.description || "No description provided."}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Companies;
