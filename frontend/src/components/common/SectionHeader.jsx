import { motion } from "framer-motion";

const SectionHeader = ({ label, title, subtitle, align = "left", className = "" }) => {
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
                    typeof title === 'string' && title.length < 30 
                        ? "text-4xl md:text-5xl lg:text-6xl" 
                        : "text-3xl md:text-4xl lg:text-5xl"
                } tracking-tight leading-tight`}>
                    {title}
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

