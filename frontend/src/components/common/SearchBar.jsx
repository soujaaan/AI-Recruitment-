import { Search } from "lucide-react";
import { Input } from "../ui/input";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                className="pl-9 bg-surface border-border focus:border-accent focus:ring-accent/20" 
                value={value} 
                onChange={(event) => onChange(event.target.value)} 
                placeholder={placeholder} 
            />
        </div>
    );
};

export default SearchBar;

