import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GlassCard = ({ 
    children, 
    className = "", 
    hover = true,
    glow = false,
    animate = false,
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 40 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : false}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={cn(
                "relative rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-6 overflow-hidden",
                hover && "transition-all duration-300 hover:-translate-y-1 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]",
                glow && "shadow-[0_0_20px_rgba(0,255,136,0.1)]",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;

