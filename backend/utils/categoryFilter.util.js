/**
 * Role category slugs for landing-page navigation and public job filtering.
 * Matches aiMetadata.category when present; falls back to title regex.
 */
export const CATEGORY_SLUG_MAP = {
    frontend: {
        metadataValues: ["Frontend"],
        titlePattern: /frontend/i,
    },
    backend: {
        metadataValues: ["Backend"],
        titlePattern: /backend/i,
    },
    "data-science": {
        metadataValues: ["Data", "ML"],
        titlePattern: /(data\s*(science|analyst|engineer)|machine\s*learning|ml\s*engineer)/i,
    },
    designer: {
        metadataValues: ["Graphic", "Product"],
        titlePattern: /(graphic|visual)\s*design/i,
    },
    fullstack: {
        metadataValues: ["Full"],
        titlePattern: /full\s*stack/i,
    },
    devops: {
        metadataValues: ["DevOps", "Cloud", "Site"],
        titlePattern: /(devops|devsecops|site\s*reliability|sre|cloud\s*architect)/i,
    },
    product: {
        metadataValues: ["Product", "Business"],
        titlePattern: /product\s*manager/i,
    },
    "ui-ux": {
        metadataValues: ["UI", "Product"],
        titlePattern: /(ui\/?ux|ux\s*design|product\s*design)/i,
    },
};

export const buildCategoryQuery = (categoryParam) => {
    const raw = String(categoryParam || "").trim();
    if (!raw || raw === "All") {
        return null;
    }

    const slugDef = CATEGORY_SLUG_MAP[raw.toLowerCase()];
    if (slugDef) {
        return {
            $or: [
                { "aiMetadata.category": { $in: slugDef.metadataValues } },
                { title: slugDef.titlePattern },
            ],
        };
    }

    return {
        $or: [
            { "aiMetadata.category": raw },
            { title: { $regex: raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        ],
    };
};
