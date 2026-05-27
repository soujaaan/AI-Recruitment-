export const ROLE_CATEGORIES = [
    { slug: "frontend", label: "Frontend Developer" },
    { slug: "backend", label: "Backend Developer" },
    { slug: "data-science", label: "Data Science" },
    { slug: "designer", label: "Graphic Designer" },
    { slug: "fullstack", label: "FullStack Developer" },
    { slug: "devops", label: "DevOps Engineer" },
    { slug: "product", label: "Product Manager" },
    { slug: "ui-ux", label: "UI/UX Designer" },
];

/** Map slug to a DB filter label when available (for sidebar highlight). */
export const slugToFilterCategory = (slug, dbCategories = []) => {
    if (!slug) return "";
    const lower = slug.toLowerCase();
    const exact = dbCategories.find((c) => c.toLowerCase() === lower);
    if (exact) return exact;

    const slugHints = {
        frontend: "Frontend",
        backend: "Backend",
        "data-science": "Data",
        designer: "Graphic",
        fullstack: "Full",
        devops: "DevOps",
        product: "Product",
        "ui-ux": "UI",
    };
    const hint = slugHints[lower];
    if (!hint) return slug;

    return dbCategories.find((c) => c.toLowerCase().startsWith(hint.toLowerCase())) || slug;
};
