import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

const ErrorState = ({ title = "Something went wrong", message, onRetry }) => {
    return (
        <div className="flex min-h-[28vh] flex-col items-center justify-center rounded-2xl border border-red-900/30 bg-red-950/20 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground font-display">{title}</h3>
            {message ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p> : null}
            {onRetry ? (
                <Button className="mt-6 btn-neon-outline" onClick={onRetry}>
                    Retry
                </Button>
            ) : null}
        </div>
    );
};

export default ErrorState;

