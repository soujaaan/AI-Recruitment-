import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';
import SectionHeader from './common/SectionHeader';

const categories = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer",
    "DevOps Engineer",
    "Product Manager",
    "UI/UX Designer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    align="center"
                    label="02 — Categories"
                    title={<>Explore by <span className="gradient-text">Role</span></>}
                    className="mb-12"
                />

                <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                        {categories.map((cat, index) => (
                            <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div
                                    className="group h-full min-h-[140px] rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] flex flex-col items-center justify-center"
                                    onClick={() => searchJobHandler(cat)}
                                >
                                    <span className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
                                        {cat}
                                    </span>
                                    <span className="mt-2 text-xs text-muted-foreground uppercase tracking-wider">
                                        Browse jobs
                                    </span>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex gap-3 justify-center mt-8">
                        <CarouselPrevious className="static translate-y-0 w-12 h-12 bg-surface border-border hover:border-accent/50 hover:bg-accent/10 text-foreground hover:text-accent transition-all" />
                        <CarouselNext className="static translate-y-0 w-12 h-12 bg-surface border-border hover:border-accent/50 hover:bg-accent/10 text-foreground hover:text-accent transition-all" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default CategoryCarousel;

