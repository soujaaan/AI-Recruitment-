import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination) {
        return null;
    }

    const { page, totalPages, hasNextPage, hasPreviousPage } = pagination;

    return (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
            <span className="text-muted-foreground">
                Page <span className="text-foreground font-medium">{page}</span> of <span className="text-foreground font-medium">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!hasPreviousPage} 
                    onClick={() => onPageChange?.(page - 1)}
                    className="border-border hover:border-accent/50 hover:bg-accent/10"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!hasNextPage} 
                    onClick={() => onPageChange?.(page + 1)}
                    className="border-border hover:border-accent/50 hover:bg-accent/10"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;

