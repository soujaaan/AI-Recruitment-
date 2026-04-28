import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../common/EmptyState'
import { Building2, MapPin, ExternalLink } from 'lucide-react'

const CompaniesTable = ({ filter = "" }) => {
    const { companies } = useSelector(store => store.company);
    const navigate = useNavigate();

    const filteredCompanies = companies.filter((company) =>
        !filter || company?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-3">
            {filteredCompanies?.length <= 0 ? (
                <EmptyState title="No companies found" description="Create your first company to get started." />
            ) : (
                filteredCompanies.map((company, index) => (
                    <div
                        key={company._id}
                        onClick={() => navigate(`/admin/companies/${company._id}`)}
                        className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain rounded" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                        {company.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                        {company.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {company.location}
                                            </span>
                                        )}
                                        <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {company.website ? "Active" : "Draft"}
                                </span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all" />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default CompaniesTable

