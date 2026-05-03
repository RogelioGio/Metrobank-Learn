import React, { useRef, useState } from 'react'
import { useStateContext } from '../contexts/ContextProvider';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Navigation from '../views/Navigation';
import { useEffect } from 'react';
import axiosClient from '../axios-client';
import { use } from 'react';
import LogoutWarningmModal from '../modalsandprops/LogoutWarningModal';
import { SelectedUserProvider } from '../contexts/selecteduserContext';
import { OptionProvider } from '../contexts/AddUserOptionProvider';
import { faBars, faBell, faBurger, faClock, faEye, faEyeSlash, faKey, faSquareCheck, faSquareXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { set } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import smallLogo from "../assets/Small_Logo.svg";
import fullLogo from "../assets/Full_Logo.svg";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetOverlay, SheetPortal
} from './ui/sheet';
import { MBLearnEcho } from 'MBLearn/MBLearnEcho';
import UserAccoountLoginnedElseWhere from '../modalsandprops/UserAccountLoginnedElseWhere';
import { CertificateProvider } from '../contexts/CertificateContext';





export default function DefaultLayout() {

    const {token, role, setRole, setUser, setProfile, user, setToken, setEvents, setActivities,setUnread} = useStateContext();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true)
    const [ warning, setWarning ] = useState()
    const [unreadNotifications, setUnreadNotifications] = useState(false);
    const [breakpoint, setBreakpoint] = useState();
    const [elsewhere, setElsewhere] = useState(false);

    const Logout = () => {
        toast("Logging Out....",{
            description: "User account is logging out the system",
        }
        )
    }

    //viewport detection for responsive design
    const [viewport, setViewport] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
     useEffect(() => {
        const handleResize = () => {
        setViewport({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
     }, []);

    useEffect(() => {
    const { width } = viewport;

    if (width < 640) {
        setBreakpoint('base');
    } else if (width >= 640 && width < 768) {
        setBreakpoint('sm');
    } else if (width >= 768 && width < 1024) {
        setBreakpoint('md');
    } else if (width >= 1024 && width < 1280) {
        setBreakpoint('lg');
    } else if (width >= 1280 && width < 1536) {
        setBreakpoint('xl');
    } else {
        setBreakpoint('2xl');
    }

    //console.log(`Viewport: ${width}px — Tailwind Breakpoint: ${breakpoint}`);
}, [viewport]);

    const notification_toast = (name, shortdesc) => {
        toast(
            <>
                <p className='font-header text-primary'>{name}</p>
                <p className='font-text text-unactive text-xs'>{shortdesc}</p>
            </>
        )
    }


    //Laravel ECHO
    useEffect(() => {
        if(!token) {
            navigate('/login');
            return;
        };


        if(token){
            window.Echo = MBLearnEcho(token);
            const channelName = `App.Models.UserCredentials.${user?.id}`;
            const channel = window.Echo.private(channelName);

            channel.notification((notification) => {
                notification_toast(notification.name, notification.shortdesc);
                console.log('Notification received:', notification);
                setUnread(true);
            });

            channel.listen('.UserLoggedInElsewhere', (e) => {
                console.log('Event received:', e);
                setElsewhere(true);
            })

        }
    }, [user, token]);





    //User Activity handling
    const logout = () => {
        Logout();
        axiosClient.post('/logout')
            .then(() => {
                setRole('');
                setUser('');
                setToken(null);
                navigate('/login');
                toast("Log Out Successfully.", {
                    description: "User account is logged out of the system",
                });
            })
            .catch((error) => {
                console.error(error);
                toast.error("Failed to log out. Please try again.");
            });
    };

    const InactivityTimer = useRef(null);
    const IsInactive = useRef(false);


    useEffect(()=>{
        const handleActivity = () => {
            if(IsInactive.current){
                console.log('User is active again');
                IsInactive.current = false;
            }

            clearTimeout(InactivityTimer.current);

            InactivityTimer.current = setTimeout(() => {
                console.log('User is inactive');
                IsInactive.current = true;
                localStorage.setItem('LOGOUT_WARNING', 'true');
                setWarning(true)
            },1000*60*30)
        };

        const storedWarning = localStorage.getItem('LOGOUT_WARNING') === 'true'
        IsInactive.current = storedWarning;
        setWarning(storedWarning);

        const handleStorageChange = (e) => {
            if(e.key === "LOGOUT_WARNING"){
                const isInactive = e.newValue === "true";
                IsInactive.current = isInactive
                setWarning(true);
            }
        };


        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });
        window.addEventListener('storage',handleStorageChange);

        handleActivity();

        return () => {
            clearTimeout(InactivityTimer.current);
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            window.removeEventListener('storage', handleStorageChange);
        };
    },[])

    //fetching the logged in user
    useEffect(() => {
        if(!token){
            navigate('/login')
        }
        axiosClient
        .get('/user')
        .then(({data})=>{
            setWarning(false);
            localStorage.setItem('LOGOUT_WARNING', 'false');
            setUser(data.AuthenticatedUser);

            setEvents(data.events);
            setActivities(data.activities);

            if(data.unread_Notifications > 0) {
                setUnread(true);
            }else{
                setUnread(false)
            }

            // axiosClient.get('has-unread-notifications')
            // .then(({data})=>{
            //     //console.log('Has unread notifications:', data);
            //     setUnreadNotifications(data.has_unread);
            //     setLoading(false)
            // })
            // .catch((error) => {
            //     console.error('Error checking notifications:', error);
            //     navigate('/login');
            // })
            setLoading(false);
        }).catch((e)=>{
            setLoading(false)
            localStorage.clear();
            navigate('/login');
            // setToken(null);
        })
    },[])

    // useEffect(() => {
    //     console.log(user)
    // }, [user]);

    if(loading && role === "SME" || role === "SME-Creator" || role === "SME-Approver" || role === "SME-Distributor"){
        return <Navigate to={"/SubjectMatterExpert"}/>
    }


    if(loading){
        return (
            <div className='h-screen w-screen flex flex-col justify-center items-center bg-background'>
                <h1 className='font-header text-2xl sm:text-3xl xl:text-5xl text-primary'>"Loading your learning journey..."</h1>
                <p className='font-text text-xs sm:text-sm xl:text-base'>Empowering you with the knowledge to achieve your goals</p>
            </div>
        )
    }

    {
                    breakpoint === 'xl' ? (
                        <div className='flex flex-row items-center h-screen bg-background overflow-hidden'>
                            <Navigation unread_notfications={unreadNotifications} size={"xl"}/>
                            <SelectedUserProvider>
                                <OptionProvider>
                                    <Outlet />
                                </OptionProvider>
                            </SelectedUserProvider>
                            {/* Logout warning */}
                            <LogoutWarningmModal open={warning} close={close}/>
                        </div>
                    ) : breakpoint === 'lg' || breakpoint === 'md' ?
                    (
                        <div className='flex flex-row items-center h-screen bg-background overflow-hidden'>
                            <Navigation unread_notfications={unreadNotifications} size={"xl"}/>
                            <div className='w-full'>
                                <ScrollArea>
                                    {/* bg-[linear-gradient(to_bottom,_var(--DashboardBackground-Color)_0%,_var(--DashboardBackground-Color)_90%,_transparent_100%)] */}
                                    <div className='h-screen'>
                                        <SelectedUserProvider>
                                            <OptionProvider>
                                                    <Outlet />
                                            </OptionProvider>
                                        </SelectedUserProvider>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )
                    :(
                        <div className='grid h-screen bg-background overflow-hidden grid-cols-1 grid-rows-[min-content_1fr]'>
                            {/* Header */}
                            <ScrollArea>
                                {/* bg-[linear-gradient(to_bottom,_var(--DashboardBackground-Color)_0%,_var(--DashboardBackground-Color)_90%,_transparent_100%)] */}
                                {/* bg-gradient-to-b from-background to-transparent */}
                                <div className='h-screen'>
                                    <div className='sticky top-0 z-50 flex items-center justify-between'>
                                    <Sheet>
                                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all z-50"/>
                                        <SheetContent side='left' className='bg-background backdrop-blur-sm h-'>
                                            <Navigation unread_notfications={unreadNotifications} size={"sm"}/>
                                        </SheetContent>
                                    </Sheet>
                                        <div className='w-8 h-8'>
                                            <img src={smallLogo} alt="" />
                                        </div>
                                        <div className='flex items-center justify-center w-10 h-10 text-unactive'>
                                            <FontAwesomeIcon icon={faBell} className='text-2xl'/>
                                        </div>
                                    </div>
                                    <SelectedUserProvider>
                                        <OptionProvider>
                                                <Outlet />
                                        </OptionProvider>
                                    </SelectedUserProvider>
                                </div>
                            </ScrollArea>

                        </div>
                    )
                }
    return (
            <>

                    <div className='h-screen bg-background grid
                                    sm:grid-rows-[min-content_1fr] sm:grid-cols-1
                                    md:grid-cols-[min-content_1fr] md:grid-rows-1
                                    overflow-hidden
                                    '
                        >
                        {/* Navigation */}
                        <div className=' hidden flex-row justify-between px-3 py-2 md:p-0 md:flex'>
                            <Navigation unread_notfications={unreadNotifications} size={breakpoint} setLoading={setLoading}/>
                        </div>
                        <ScrollArea className='h-screen'>
                            <div className='flex flex-col h-screen'>
                                <div className='flex flex-row justify-between px-3 py-2 z-10
                                                backdrop-blur-md backdrop-saturate-150 bg-background/70
                                                top-0 sticky
                                                md:p-0 md:hidden'>
                                    <Navigation unread_notfications={unreadNotifications} size={breakpoint} setLoading={setLoading}/>
                                    <div className='w-8 h-8 block
                                        md:hidden
                                        xl:hidden'>
                                        <img src={smallLogo} alt="" />
                                    </div>
                                    <div className='flex items-center justify-center w-10 h-10 text-unactive
                                                md:hidden
                                                xl:hidden'>
                                        <FontAwesomeIcon icon={faBell} className='text-2xl'/>
                                    </div>
                                </div>
                                <SelectedUserProvider>
                                    <SelectedUserProvider>
                                        <OptionProvider>
                                            <CertificateProvider>
                                                <Outlet />
                                            </CertificateProvider>
                                        </OptionProvider>
                                    </SelectedUserProvider>
                                </SelectedUserProvider>
                            </div>
                        </ScrollArea>
                        {/* Logout warning */}
                        <LogoutWarningmModal open={warning} close={()=>logout()}/>
                        <UserAccoountLoginnedElseWhere open={elsewhere} close={()=>logout()}/>
                </div>
            </>
    )

}
