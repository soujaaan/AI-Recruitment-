import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import GlassCard from './common/GlassCard'
import { SlidersHorizontal } from 'lucide-react'

const filterData = [
    {
        filterType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Remote"]
    },
    {
        filterType: "Job Type",
        array: ["Full-time", "Part-time", "Contract", "Internship"]
    },
    {
        filterType: "Salary",
        array: ["0 - 5 LPA", "5 - 10 LPA", "10 - 20 LPA", "20+ LPA"]
    }
];

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();

    const changeHandler = (value) => {
        setSelectedValue(value);
    }

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue, dispatch]);

    return (
        <GlassCard animate>
            <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold text-lg text-foreground">Filters</h3>
            </div>

            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                {filterData.map((data, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                            {data.filterType}
                        </p>
                        <div className="space-y-2">
                            {data.array.map((item, idx) => {
                                const itemId = `id${index}-${idx}`;
                                return (
                                    <div key={itemId} className="flex items-center space-x-3">
                                        <RadioGroupItem
                                            value={item}
                                            id={itemId}
                                            className="border-border text-accent data-[state=checked]:border-accent"
                                        />
                                        <Label
                                            htmlFor={itemId}
                                            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                        >
                                            {item}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </RadioGroup>
        </GlassCard>
    )
}

export default FilterCard

