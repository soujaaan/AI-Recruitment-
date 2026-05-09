import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import GlassCard from './common/GlassCard'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'

const filterData = [
    {
        filterType: "Location",
        key: "location",
        array: [
            "Delhi NCR",
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Kolkata",
            "Remote"
        ]
    },
    {
        filterType: "Job Type",
        key: "jobType",
        array: [
            "Full-time",
            "Part-time",
            "Contract",
            "Internship"
        ]
    },
    {
        filterType: "Salary",
        key: "salary",
        array: [
            "0 - 5 LPA",
            "5 - 10 LPA",
            "10 - 20 LPA",
            "20+ LPA"
        ]
    }
];

const FilterCard = () => {

    const dispatch = useDispatch();

    const [filters, setFilters] = useState({
        location: "",
        jobType: "",
        salary: ""
    });

    // Handle filter change
    const handleFilterChange = (type, value) => {

        setFilters((prev) => ({
            ...prev,
            [type]: prev[type] === value ? "" : value
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            location: "",
            jobType: "",
            salary: ""
        });
    };

    // Send filters to redux
    useEffect(() => {
        dispatch(setSearchedQuery(filters));
    }, [filters, dispatch]);

    // Count active filters
    const activeFiltersCount = Object.values(filters)
        .filter(Boolean)
        .length;

    return (
        <GlassCard animate>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-2">

                    <SlidersHorizontal className="w-5 h-5 text-accent" />

                    <h3 className="font-display font-bold text-lg text-foreground">
                        Filters
                    </h3>

                    {activeFiltersCount > 0 && (
                        <span className="
                            w-6 h-6
                            rounded-full
                            bg-accent
                            text-black
                            text-xs
                            flex items-center justify-center
                            font-bold
                        ">
                            {activeFiltersCount}
                        </span>
                    )}

                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="
                            text-muted-foreground
                            hover:text-accent
                            transition-colors
                        "
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                )}

            </div>

            {/* Filters */}
            <div className="space-y-5">

                {filterData.map((data, index) => (

                    <div key={index}>

                        {/* Section Title */}
                        <p className="
                            text-xs
                            text-muted-foreground
                            uppercase
                            tracking-wider
                            mb-2
                            font-semibold
                        ">
                            {data.filterType}
                        </p>

                        {/* Filter Options */}
                        <div className="space-y-2">

                            {data.array.map((item, idx) => {

                                const isSelected =
                                    filters[data.key] === item;

                                return (

                                    <button
                                        key={idx}
                                        onClick={() =>
                                            handleFilterChange(
                                                data.key,
                                                item
                                            )
                                        }
                                        className={`
                                            w-full
                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            border
                                            px-3 py-2
                                            text-left
                                            transition-all
                                            duration-300
                                            group
                                            ${
                                                isSelected
                                                    ? `
                                                        border-accent
                                                        bg-accent/10
                                                        text-accent
                                                        shadow-[0_0_20px_rgba(0,255,140,0.12)]
                                                    `
                                                    : `
                                                        border-border
                                                        text-muted-foreground
                                                        hover:border-accent/30
                                                        hover:bg-accent/5
                                                        hover:text-foreground
                                                    `
                                            }
                                        `}
                                    >

                                        {/* Radio Circle */}
                                        <div className={`
                                            w-4 h-4
                                            rounded-full
                                            border
                                            flex
                                            items-center
                                            justify-center
                                            transition-all
                                            ${
                                                isSelected
                                                    ? "border-accent"
                                                    : "border-border"
                                            }
                                        `}>

                                            {isSelected && (
                                                <div className="
                                                    w-2 h-2
                                                    rounded-full
                                                    bg-accent
                                                " />
                                            )}

                                        </div>

                                        {/* Label */}
                                        <span className="text-sm font-medium">
                                            {item}
                                        </span>

                                    </button>
                                );
                            })}

                        </div>

                    </div>
                ))}

            </div>

        </GlassCard>
    )
}

export default FilterCard