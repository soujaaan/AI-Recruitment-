export const skillsData = {
    frontend: ['React', 'Vue', 'Angular', 'Tailwind', 'TypeScript', 'HTML5', 'CSS3', 'Next.js', 'Redux', 'Svelte', 'Bootstrap', 'Material-UI', 'Webpack', 'Babel', 'Jest', 'Cypress', 'GraphQL', 'Apollo', 'Framer Motion', 'Three.js'],
    backend: ['Node.js', 'Express', 'Django', 'Spring Boot', 'Flask', 'Ruby on Rails', 'ASP.NET', 'Laravel', 'Go', 'Rust', 'NestJS', 'GraphQL', 'REST APIs', 'Microservices', 'FastAPI', 'Koa', 'Socket.io', 'gRPC', 'Celery', 'RabbitMQ'],
    database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'Elasticsearch', 'DynamoDB', 'MariaDB', 'SQLite', 'Firebase', 'Supabase', 'Neo4j', 'CouchDB', 'Prisma', 'Sequelize', 'Mongoose', 'TypeORM', 'GraphQL', 'SQL Server', 'Oracle'],
    cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean', 'Cloudflare', 'Nginx', 'Apache', 'Linux'],
    ai_ml: ['TensorFlow', 'PyTorch', 'NLP', 'OpenCV', 'Scikit-learn', 'Keras', 'Pandas', 'NumPy', 'Jupyter', 'Hugging Face', 'Computer Vision', 'Deep Learning', 'Machine Learning', 'Data Science', 'Data Mining', 'Predictive Modeling', 'Time Series Analysis', 'Reinforcement Learning', 'Generative AI', 'LLMs'],
    data: ['Power BI', 'Tableau', 'SQL', 'Excel', 'Data Warehousing', 'ETL', 'Airflow', 'Snowflake', 'BigQuery', 'Redshift', 'Hadoop', 'Spark', 'Kafka', 'Data Visualization', 'Data Engineering', 'Google Analytics', 'Mixpanel', 'Amplitude', 'Segment', 'Looker'],
    soft_skills: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Adaptability', 'Time Management', 'Project Management', 'Agile', 'Scrum', 'Kanban', 'Mentoring', 'Public Speaking', 'Negotiation', 'Conflict Resolution', 'Emotional Intelligence', 'Creativity', 'Innovation', 'Decision Making', 'Work Ethic']
};

export const getAllSkills = () => {
    let all = [];
    Object.values(skillsData).forEach(arr => {
        all = all.concat(arr);
    });
    return all;
};
