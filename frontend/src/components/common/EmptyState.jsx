import { Inbox } from "lucide-react";
import { Button } from "../ui/button";

const EmptyState = ({ title, description, actionLabel, onAction }) => {
    return (
        <div className="flex min-h-[28vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground font-display">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            {actionLabel ? (
                <Button className="mt-6 btn-neon-outline" onClick={onAction}>
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    );
};

export default EmptyState;

