import { Loader2 } from "lucide-react";

const LoadingScreen = ({ label = "Loading..." }) => {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-3 shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
            </div>
        </div>
    );
};

export default LoadingScreen;

