import { motion } from "framer-motion";

const SectionHeader = ({ label, title, subtitle, align = "left", className = "" }) => {
    const isStructured = typeof title === 'object' && title !== null && ('normal' in title || 'highlight' in title);
    
    const titleLength = isStructured
        ? ((title.normal || title.prefix || '') + (title.highlight || '') + (title.suffix || '')).length
        : (typeof title === 'string' ? title.length : 0);

    const isShort = titleLength > 0 && titleLength < 30;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`${align === "center" ? "text-center" : ""} ${className}`}
        >
            {label && (
                <p className="section-label">{label}</p>
            )}
            {title && (
                <h2 className={`font-display font-bold text-foreground ${
                    isShort 
                        ? "text-4xl md:text-5xl lg:text-6xl" 
                        : "text-3xl md:text-4xl lg:text-5xl"
                } tracking-tight leading-tight`}>
                    {isStructured ? (
                        <>
                            {title.normal || title.prefix}{" "}
                            {title.highlight && (
                                <span className="gradient-text">{title.highlight}</span>
                            )}
                            {title.suffix && ` ${title.suffix}`}
                        </>
                    ) : (
                        title
                    )}
                </h2>
            )}
            {subtitle && (
                <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
};

export default SectionHeader;

