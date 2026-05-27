import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import GlassCard from './common/GlassCard'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import useGetJobFilters from '@/hooks/useGetJobFilters'

const FILTER_SECTIONS = [
    { filterType: "Location", key: "location", optionsKey: "locations" },
    { filterType: "Job Type", key: "jobType", optionsKey: "jobTypes" },
    { filterType: "Experience", key: "experienceLevel", optionsKey: "experienceLevels" },
    { filterType: "Category", key: "category", optionsKey: "categories" },
    { filterType: "Salary", key: "salary", optionsKey: "salaries" },
];

const EMPTY_FILTERS = {
    location: "",
    jobType: "",
    salary: "",
    experienceLevel: "",
    category: "",
};

const FilterCard = () => {

    const dispatch = useDispatch();
    const { data: filterOptions, isLoading } = useGetJobFilters();

    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const filterData = useMemo(() => {
        if (!filterOptions) return [];

        return FILTER_SECTIONS
            .map((section) => ({
                filterType: section.filterType,
                key: section.key,
                array: filterOptions[section.optionsKey] || [],
            }))
            .filter((section) => section.array.length > 0);
    }, [filterOptions]);

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: prev[type] === value ? "" : value
        }));
    };

    const resetFilters = () => {
        setFilters(EMPTY_FILTERS);
    };

    useEffect(() => {
        dispatch(setSearchedQuery(filters));
    }, [filters, dispatch]);

    const activeFiltersCount = Object.values(filters)
        .filter(Boolean)
        .length;

    return (
        <GlassCard animate>

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

            <div className="space-y-5">

                {isLoading && (
                    <p className="text-sm text-muted-foreground">
                        Loading filters…
                    </p>
                )}

                {!isLoading && filterData.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No filter options available yet.
                    </p>
                )}

                {filterData.map((data) => (

                    <div key={data.key}>

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

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">

                            {data.array.map((item) => {

                                const isSelected =
                                    filters[data.key] === item;

                                return (

                                    <button
                                        key={`${data.key}-${item}`}
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

                                        <div className={`
                                            w-4 h-4
                                            rounded-full
                                            border
                                            flex
                                            items-center
                                            justify-center
                                            transition-all
                                            shrink-0
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

                                        <span className="text-sm font-medium truncate">
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
