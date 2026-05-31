import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, MoonStar, Search, SunMedium, User2 } from 'lucide-react';
import MessageButton from "@/components/navbar/MessageButton";
import useChatStore from "@/store/chatStore";
import MessageDropdown from "@/components/navbar/MessageDropdown";
import NotificationBell from "@/components/navbar/NotificationBell";
import NotificationDropdown from "@/components/navbar/NotificationDropdown";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, setAuthState } from '@/redux/authSlice';
import { toast } from 'sonner';
import { useLogoutMutation, useLoginMutation } from '@/hooks/useAuthMutations';
import { useTheme } from 'next-themes';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const logoutMutation = useLogoutMutation();
    const { theme, setTheme } = useTheme();

    const [navEmail, setNavEmail] = useState("");
    const [navPassword, setNavPassword] = useState("");
    const [isNavLoggingIn, setIsNavLoggingIn] = useState(false);
    const loginMutation = useLoginMutation();

    const handleNavbarLogin = async (e) => {
        e.preventDefault();
        setIsNavLoggingIn(true);
        try {
            const result = await loginMutation.mutateAsync({ email: navEmail, password: navPassword });
            const user = result?.user || result?.data?.user || null;
            const token = result?.token || result?.data?.token || "";
            
            dispatch(setAuthState({ user, token }));
            
            if (token) {
                localStorage.setItem("token", token);
            }
            toast.success(result?.message || "Welcome back!");
            
            if (user?.role === "recruiter" || user?.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/jobs");
            }
        } catch (error) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsNavLoggingIn(false);
        }
    };

    const [scrolled, setScrolled] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

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
            dispatch(clearAuth());

            navigate("/");

            toast.error("Session cleared. Please log in again.");
        }
    };

    return (
        <div
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'border-border bg-[#0a0a0a]/90 backdrop-blur-xl'
                    : 'border-transparent bg-transparent'
            }`}
        >
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-6'>

                {/* Logo */}
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                        Hire<span className="text-accent">Sense</span>
                    </h1>
                </div>

                {/* Navigation */}
                <div className='flex items-center gap-4 md:gap-6'>

                    {/* Messages */}
                    {user && (
                        <div className="relative">
                            <MessageButton
                                onToggleDropdown={(open) => {
                                    useChatStore.getState().setDropdownOpen(open);
                                    if (open) setNotifDropdownOpen(false);
                                }}
                            />
                            {useChatStore((s) => s.dropdownOpen) && (
                                <MessageDropdown
                                    onClose={() => useChatStore.getState().setDropdownOpen(false)}
                                />
                            )}
                        </div>
                    )}

                    {/* Notifications */}
                    {user && (
                        <div className="relative">
                            <NotificationBell
                                isOpen={notifDropdownOpen}
                                onToggle={(open) => {
                                    setNotifDropdownOpen(open);
                                    if (open) useChatStore.getState().setDropdownOpen(false);
                                }}
                            />
                            {notifDropdownOpen && (
                                <NotificationDropdown
                                    onClose={() => setNotifDropdownOpen(false)}
                                />
                            )}
                        </div>
                    )}

                    {!user && (
                        <form onSubmit={handleNavbarLogin} className="hidden lg:flex items-center gap-2 border-l border-border/40 pl-4 ml-2">
                            <input
                                type="email"
                                placeholder="Email"
                                value={navEmail}
                                onChange={(e) => setNavEmail(e.target.value)}
                                required
                                className="h-9 px-2.5 text-sm bg-[#0d0d0d] border border-border/70 focus:border-accent rounded-md text-foreground placeholder:text-muted-foreground/45 outline-none w-36 transition-all"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={navPassword}
                                onChange={(e) => setNavPassword(e.target.value)}
                                required
                                className="h-9 px-2.5 text-sm bg-[#0d0d0d] border border-border/70 focus:border-accent rounded-md text-foreground placeholder:text-muted-foreground/45 outline-none w-36 transition-all"
                            />
                            <Button
                                type="submit"
                                disabled={isNavLoggingIn}
                                className="h-9 px-3.5 text-sm font-semibold rounded-md bg-accent text-black hover:brightness-110 transition-all shrink-0"
                            >
                                {isNavLoggingIn ? "..." : "Log In"}
                            </Button>
                        </form>
                    )}

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="hover:bg-accent/10 hover:text-accent"
                    >
                        {theme === "dark" ? <SunMedium /> : <MoonStar />}
                    </Button>


                    {/* User Menu */}
                    {user && (
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
                                            <h4 className='font-medium text-foreground'>
                                                {user?.fullname}
                                            </h4>

                                            <p className='text-sm text-muted-foreground'>
                                                {user?.profile?.bio}
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex flex-col my-2 text-muted-foreground'>

                                        {user.role === 'candidate' && (
                                            <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                                <User2 className="w-4 h-4" />

                                                <Button
                                                    variant="link"
                                                    className="text-muted-foreground hover:text-accent"
                                                >
                                                    <Link to="/profile">
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                            <Search className="w-4 h-4" />

                                            <Button
                                                variant="link"
                                                className="text-muted-foreground hover:text-accent"
                                            >
                                                <Link to="/browse">
                                                    Browse Jobs
                                                </Link>
                                            </Button>
                                        </div>

                                        <div className='flex w-fit items-center gap-2 cursor-pointer hover:text-accent transition-colors'>
                                            <LogOut className="w-4 h-4" />

                                            <Button
                                                onClick={logoutHandler}
                                                variant="link"
                                                className="text-muted-foreground hover:text-accent"
                                            >
                                                Logout
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;