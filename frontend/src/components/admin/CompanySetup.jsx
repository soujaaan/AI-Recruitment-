import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Building2 } from "lucide-react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import useGetCompanyById from "@/hooks/useGetCompanyById";
import { companyService } from "@/services/company.service";

const CompanySetup = () => {
    const params = useParams();
    const navigate = useNavigate();
    useGetCompanyById(params.id);
    const { singleCompany } = useSelector((store) => store.company);

    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null,
    });

    useEffect(() => {
        if (singleCompany) {
            setInput({
                name: singleCompany.name || "",
                description: singleCompany.description || "",
                website: singleCompany.website || "",
                location: singleCompany.location || "",
                file: null,
            });
        }
    }, [singleCompany]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", input.name);
            formData.append("description", input.description);
            formData.append("website", input.website);
            formData.append("location", input.location);
            if (input.file) formData.append("file", input.file);

            const data = await companyService.updateCompany(params.id, formData);
            if (data.success) {
                toast.success(data.message || "Company updated successfully");
                navigate("/admin/companies");
            } else {
                toast.error(data.message || "Failed to update company");
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
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
                                        Edit Company
                                    </h1>
                                </div>
                            </div>

                            <form onSubmit={submitHandler} className="space-y-5">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        name="name"
                                        value={input.name}
                                        onChange={changeEventHandler}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        name="description"
                                        value={input.description}
                                        onChange={changeEventHandler}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <Input
                                        name="website"
                                        value={input.website}
                                        onChange={changeEventHandler}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                        name="location"
                                        value={input.location}
                                        onChange={changeEventHandler}
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setInput({ ...input, file: e.target.files?.[0] })
                                        }
                                        className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20 file:bg-surface file:border-0 file:text-foreground file:rounded-lg"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-border hover:bg-surface-elevated"
                                        onClick={() => navigate("/admin/companies")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 btn-neon">
                                        Save Changes
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

export default CompanySetup;

