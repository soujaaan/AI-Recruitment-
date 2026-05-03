import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, MoonStar, Search, SunMedium, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearAuth } from '@/redux/authSlice'
import { toast } from 'sonner'
import { useLogoutMutation } from '@/hooks/useAuthMutations'
import { useTheme } from 'next-themes'
import { Input } from '../ui/input'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const logoutMutation = useLogoutMutation();
    const { theme, setTheme } = useTheme();
    const [query, setQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoutHandler = async () => {
        try {
            const res = await logoutMutation.mutateAsync();
            dispatch(clearAuth());
            navigate("/");
            toast.success(res.message || "Logged out successfully");
        } catch (error) {
            // Force logout locally even if the backend returns 401
            dispatch(clearAuth());
            navigate("/");
            toast.error("Session cleared. Please log in again.");
        }
    }

    return (
        <div className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'border-border bg-[#0a0a0a]/90 backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 gap-4 px-4'>
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                        Hire<span className="text-accent">Sense</span>
                    </h1>
                </div>
                <div className='flex flex-1 items-center gap-4'>
                    <div className='hidden md:block w-full max-w-md'>
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search jobs, companies, AI insights..."
                            onKeyDown={(event) => event.key === "Enter" && navigate(`/browse?search=${encodeURIComponent(query)}`)}
                            className="pl-4 py-4 bg-surface border-border rounded-full text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                        />
                    </div>
                </div>
                <div className='flex items-center gap-6'>
                    <ul className='hidden md:flex font-medium items-center gap-5 text-foreground'>
                        {user ? (
                            <>
                                {user.role === 'candidate' ? (
                                    <>
                                        <li className="relative group">
                                            <Link to="/jobs" className="transition-colors hover:text-accent">Jobs</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                        <li className="relative group">
                                            <Link to="/applications" className="transition-colors hover:text-accent">Applications</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                        <li className="relative group">
                                            <Link to="/profile" className="transition-colors hover:text-accent">Profile</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="relative group">
                                            <Link to="/dashboard" className="transition-colors hover:text-accent">Dashboard</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                        <li className="relative group">
                                            <Link to="/admin/companies" className="transition-colors hover:text-accent">Companies</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                        <li className="relative group">
                                            <Link to="/admin/jobs" className="transition-colors hover:text-accent">Jobs</Link>
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                        </li>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <li className="relative group">
                                    <Link to="/" className="transition-colors hover:text-accent">Home</Link>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                </li>
                                <li className="relative group">
                                    <Link to="/jobs" className="transition-colors hover:text-accent">Jobs</Link>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                </li>
                                <li className="relative group">
                                    <Link to="/browse" className="transition-colors hover:text-accent">Browse</Link>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                </li>
                            </>
                        )}
                    </ul>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:bg-accent/10 hover:text-accent">
                        {theme === "dark" ? <SunMedium /> : <MoonStar />}
                    </Button>
                    {!user ? (
                        <div className='flex items-center gap-2'>
                            <Button
                                variant="outline"
                                className="border-border hover:border-accent/50 hover:bg-accent/10"
                                onClick={() => {
                                    const el = document.getElementById('auth-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Get Started
                            </Button>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer ring-2 ring-border hover:ring-accent transition-all duration-300">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-surface border-border">
                                <div>
                                    <div className='flex gap-3 space-y-2'>
                                        <Avatar className="cursor-pointer ring-2 ring-border">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                        </Avatar>
                                        <div>
                                            <h4 className='font-medium text-foreground'>{user?.fullname}</h4>
                                            <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                        </div>
                                    </div>
                                    <div className='flex flex-col my-2 text-muted-foreground'>
                                        {user && user.role === 'candidate' && (
                                            <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                                <User2 className="w-4 h-4" />
                                                <Button variant="link" className="text-muted-foreground hover:text-accent">
                                                    <Link to="/profile">View Profile</Link>
                                                </Button>
                                            </div>
                                        )}
                                        <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                            <Search className="w-4 h-4" />
                                            <Button variant="link" className="text-muted-foreground hover:text-accent">
                                                <Link to="/browse">Browse Jobs</Link>
                                            </Button>
                                        </div>
                                        <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                            <LogOut className="w-4 h-4" />
                                            <Button onClick={logoutHandler} variant="link" className="text-muted-foreground hover:text-accent">Logout</Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar

