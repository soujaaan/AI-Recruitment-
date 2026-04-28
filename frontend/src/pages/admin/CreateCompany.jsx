import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Building2 } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { companyService } from "@/services/company.service";

const CreateCompany = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("description", form.description.trim());
            formData.append("website", form.website.trim());
            formData.append("location", form.location.trim());

            if (form.file) {
                formData.append("file", form.file);
            }

            const data = await companyService.createCompany(formData);

            if (data.success) {
                toast.success(data.message || "Company created successfully");
                navigate("/admin/companies");
            } else {
                toast.error(data.message || "Failed to create company");
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

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
                            Back to companies
                        </button>

                        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="section-label">Admin</p>
                                    <h1 className="font-display font-bold text-2xl text-foreground">
                                        Create Company
                                    </h1>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Aurum AI"
                                        required
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of the company"
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={form.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="City, Country or Remote"
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo</Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20 file:bg-surface file:border-0 file:text-foreground file:rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-border hover:bg-surface-elevated"
                                        onClick={() => navigate("/admin/companies")}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 btn-neon"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : "Create Company"}
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

export default CreateCompany;

