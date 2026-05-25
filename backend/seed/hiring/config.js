/** Hiring simulation targets and distributions */
export const HIRING_TARGETS = {
    jobsMin: 750,
    jobsMax: 900,
    applicationsMin: 2500,
    applicationsMax: 4000,
};

export const RECRUITER_TIERS = [
    { type: "inactive", count: 15, jobsMin: 0, jobsMax: 0 },
    { type: "small", count: 30, jobsMin: 4, jobsMax: 6 },
    { type: "medium", count: 20, jobsMin: 10, jobsMax: 14 },
    { type: "aggressive", count: 10, jobsMin: 28, jobsMax: 45 },
];

export const APPLICATION_STATUS_WEIGHTS = [
    { status: "applied", weight: 45 },
    { status: "under review", weight: 25 },
    { status: "shortlisted", weight: 15 },
    { status: "interview scheduled", weight: 8 },
    { status: "interview completed", weight: 3 },
    { status: "hired", weight: 2 },
    { status: "rejected", weight: 2 },
];

export const CANDIDATE_BEHAVIORS = [
    { type: "passive", share: 0.1, minApps: 2, maxApps: 5 },
    { type: "active", share: 0.3, minApps: 18, maxApps: 28 },
    { type: "aggressive", share: 0.25, minApps: 42, maxApps: 62 },
    { type: "selective", share: 0.25, minApps: 10, maxApps: 16 },
    { type: "fresher-focused", share: 0.1, minApps: 12, maxApps: 22 },
];

export const INDUSTRY_JOB_PROFILES = {
    AI: {
        maturity: "growth",
        roles: [
            { title: "ML Engineer", skills: ["Python", "TensorFlow", "PyTorch", "LLMs"], level: "Senior" },
            { title: "Backend Engineer", skills: ["Python", "FastAPI", "PostgreSQL", "Docker"], level: "Mid" },
            { title: "Prompt Engineer", skills: ["NLP", "LLMs", "Python", "Generative AI"], level: "Mid" },
            { title: "MLOps Engineer", skills: ["Kubernetes", "AWS", "Python", "CI/CD"], level: "Senior" },
        ],
    },
    SaaS: {
        maturity: "growth",
        roles: [
            { title: "React Developer", skills: ["React", "TypeScript", "Redux", "REST APIs"], level: "Mid" },
            { title: "Product Designer", skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"], level: "Mid" },
            { title: "QA Engineer", skills: ["Jest", "Cypress", "Selenium", "Agile"], level: "Mid" },
            { title: "Full Stack Engineer", skills: ["Node.js", "React", "PostgreSQL", "AWS"], level: "Senior" },
        ],
    },
    FinTech: {
        maturity: "mature",
        roles: [
            { title: "Backend Engineer", skills: ["Java", "Spring Boot", "PostgreSQL", "Microservices"], level: "Senior" },
            { title: "Security Engineer", skills: ["Cyber Security", "OAuth", "AWS", "Compliance"], level: "Senior" },
            { title: "Data Analyst", skills: ["SQL", "Python", "Power BI", "Excel"], level: "Mid" },
        ],
    },
    Cybersecurity: {
        maturity: "mature",
        roles: [
            { title: "Security Engineer", skills: ["SIEM", "Penetration Testing", "AWS", "Linux"], level: "Senior" },
            { title: "DevSecOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"], level: "Mid" },
        ],
    },
    "Cloud Engineering": {
        maturity: "enterprise",
        roles: [
            { title: "DevOps Engineer", skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"], level: "Senior" },
            { title: "Cloud Architect", skills: ["AWS", "Azure", "Networking", "Security"], level: "Senior" },
            { title: "Site Reliability Engineer", skills: ["Linux", "Prometheus", "Kubernetes", "Go"], level: "Senior" },
        ],
    },
    Healthcare: {
        maturity: "enterprise",
        roles: [
            { title: "Full Stack Developer", skills: ["React", "Node.js", "HIPAA", "PostgreSQL"], level: "Mid" },
            { title: "Data Engineer", skills: ["Python", "ETL", "SQL", "Airflow"], level: "Mid" },
        ],
    },
    EdTech: {
        maturity: "growth",
        roles: [
            { title: "Frontend Developer", skills: ["React", "JavaScript", "CSS3", "Accessibility"], level: "Mid" },
            { title: "Content Platform Engineer", skills: ["Node.js", "MongoDB", "AWS", "REST APIs"], level: "Mid" },
        ],
    },
    "E-commerce": {
        maturity: "mature",
        roles: [
            { title: "Backend Engineer", skills: ["Node.js", "Redis", "PostgreSQL", "Microservices"], level: "Mid" },
            { title: "Mobile Developer", skills: ["React Native", "TypeScript", "REST APIs", "Firebase"], level: "Mid" },
        ],
    },
    IT: {
        maturity: "mature",
        roles: [
            { title: "Software Engineer", skills: ["Java", "Spring Boot", "SQL", "Agile"], level: "Mid" },
            { title: "Technical Lead", skills: ["System Design", "Java", "Leadership", "Microservices"], level: "Senior" },
        ],
    },
    Consulting: {
        maturity: "enterprise",
        roles: [
            { title: "Business Analyst", skills: ["SQL", "Excel", "Communication", "Agile"], level: "Mid" },
            { title: "Solutions Architect", skills: ["AWS", "System Design", "Leadership", "REST APIs"], level: "Senior" },
        ],
    },
    default: {
        maturity: "growth",
        roles: [
            { title: "Software Engineer", skills: ["JavaScript", "Node.js", "React", "SQL"], level: "Mid" },
            { title: "Data Analyst", skills: ["SQL", "Python", "Excel", "Tableau"], level: "Junior" },
            { title: "DevOps Engineer", skills: ["Docker", "AWS", "Linux", "CI/CD"], level: "Senior" },
        ],
    },
};

export const ROUND_TYPES = ["HR", "Technical", "Final"];
export const RECOMMENDATIONS = ["strong hire", "hire", "neutral", "reject"];
