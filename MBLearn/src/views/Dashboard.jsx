import React, { useEffect, useRef, useState } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from '../axios-client';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookBookmark, faBookOpenReader, faClock, faEye, faFilePen, faGraduationCap, faHeartPulse, faPenFancy, faPenToSquare, faPeopleGroup, faSpinner, faSquare, faSquarePen, faSwatchbook, faTimeline, faTimes, faU, faUser, faUserGear, faUserLock, faUserShield } from '@fortawesome/free-solid-svg-icons';
import AnnouncmentCarousel from '../modalsandprops/dashboardComponents/AnnouncementCarousel';
import LearnerDashboard from './Dashboards/LearnerDashboard';
import { CarouselPrevious, CarouselNext } from '../components/ui/carousel';
import CourseAdminDashboard from './Dashboards/CourseAdminDashboard';
import {Label, Area, AreaChart, CartesianGrid, XAxis, PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  YAxis,} from 'recharts';
import {  ChartContainer,
        ChartLegend,
        ChartLegendContent,
        ChartTooltip,
        ChartTooltipContent, } from '../components/ui/chart';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, set } from 'date-fns';
import './../index.css';
import { ArrowLeft, ArrowRight } from "lucide-react"
import Calendar from '../modalsandprops/dashboardComponents/Calendar';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import CalendarModal from '../modalsandprops/dashboardComponents/CalendarModal';
import { useNavigate } from 'react-router';
import Course from './Course';
import { CourseProvider } from '../contexts/Course';
import { Center, RingProgress } from "@mantine/core";
import ReportGenerationModal from '../modalsandprops/ReportGenerationModal';
import ReportGeneratedModal from '../modalsandprops/ReportGeneratedModal';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../components/ui/select';
import { SelectValue } from '@radix-ui/react-select';


// Sample configs for chart
const chartConfig = {
    visitors: {
    label: "Visitors",
  },
  SystemAdmin: {
    label: "System Admin",
    color: "hsl(218, 97%, 26%)",
  },
  CourseAdmin: {
    label: "Course Admin",
    color: "hsl(218, 97%, 35%)",
  },
  Learner: {
    label: "Learner",
    color: "hsl(218, 97%, 50%)",
  },
}

const chartConfig2 = {
  SystemAdmin: {
    label: "System Admin",
    color: "hsl(218, 97%, 26%)",
  },
  CourseAdmin: {
    label: "Course Admin",
    color: "hsl(218, 97%, 35%)",
  },
  Learner: {
    label: "Learner",
    color: "hsl(218, 97%, 50%)",
  },
}




//One Dashboard Component for 3 different roles
const DashboardLayout = ({role,name,user}) => {
    const [uptime, setUptime] = useState("00:00:00");
    const calendarRef = useRef()
    const [monthLabel, setMonthLabel] = useState("")
    const [openCalendarModal, setOpenCalendarModal] = useState(false);
    const [dailyLogins, setDailyLogins] = useState([])
    const [range, setRange] = useState("7 days");
    const [filteredDailies, setFilteredDailies] = useState()
    const updateMonthLabel = () => {
        const current = calendarRef.current?.getCurrentMonth();
        if (current) {
        setMonthLabel(format(current, "MMMM yyyy"));
        }
    };
    useEffect(() => {
        updateMonthLabel(); // set initial label
    }, []);


    //System Uptime
    useEffect(() => {
        // const fetchUptime = () => {
        //     axiosClient.get('/system-uptime')
        //     .then((res) => {
        //         setUptime(res.data.uptime);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });
        // };

        // fetchUptime(); // Initial fetch
        // const interval = setInterval(fetchUptime, 10000); // Fetch every minute
        //  return () => clearInterval(interval); // Cleanup on unmount
    },[])

    const [reportGen, setReportGen] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);


    const navigate = useNavigate();
    const [openReportGenerationModal, setOpenReportGenerationModal] = useState(false);
    const [user_stat, setUser_stat] = useState([])
    const [fetch, setFetching] = useState(false);
    const [gettingDailies, setGettingDailies] = useState(false);

    useEffect(()=>{
        if(role !== 'System Admin') return;
        setFetching(true);
        setGettingDailies(true);


        //Fetch User Stats
        axiosClient.get('/fetch_stats')
        .then((res)=>{
            setFetching(false)
            setUser_stat(res.data)
        }).catch((err)=>{
            console.log(err)
        })

        //Fetch Daily Logins
        axiosClient.get('/dailies')
        .then((res)=>{
            setDailyLogins(res.data)
            setFilteredDailies(fiteredDailies(res.data, 7))
            setGettingDailies(false)
        })
        .catch((err)=>{
            console.log(err)
        })
    },[])

    useEffect(() => {
        console.log("User Stat", user_stat);
    },[user_stat])

    const dailiesConfig = {
        logins: {
            label: "Logins",
            color: "hsl(218, 97%, 50%)",
        }
    }

    const fiteredDailies = (data, days) => {
        const now = new Date();
        const startDate = new Date();

        startDate.setDate(now.getDate() - days);
        return data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= now;
        })
    }

    const handleDailyFilter = (value) => {
        setRange(value);

        if(value === "7 days"){
            setFilteredDailies(fiteredDailies(dailyLogins, 7))
        }else if(value === "14 days"){
            setFilteredDailies(fiteredDailies(dailyLogins, 14))
        }else if(value === "30 days"){
            setFilteredDailies(fiteredDailies(dailyLogins, 30))
        }else if(value === "60 days"){
            setFilteredDailies(fiteredDailies(dailyLogins, 60))
        } else {
            setFilteredDailies(dailyLogins)
        }
    }


    switch(role){
        //System admin Dasboard
        case 'System Admin':
            return (
                <>

            <div className="grid h-full w-full grid-cols-4
                            grid-rows-[6.25rem_auto]
                            sm:grid-rows-[6.25rem_min-content_1fr]">
                <Helmet>{/* Title of the mark-up */}
                    <title>MBLearn | System Admin Dashboard</title>
                </Helmet>

                <div className='flex flex-col justify-center col-span-2 row-span-1  border-b border-divider
                                ml-3
                                xl:pr-5
                                sm:ml-0'>
                    <p className='text-xs text-unactive'>Good Day!  </p>
                    <p className='font-header text-primary text-3xl'>{name}</p>
                    <p className='font-text text-xs text-unactive'>{user.user_infos.employeeID} | {user.user_infos.roles[0].role_name}</p>
                    {/* <p className='font-text text-unactive
                                    text-xs
                                    xl:text-sm
                                    sm:text-xs'>System Admin Dashboard, A centralized hub for system administrators to manage users, monitor system activity.</p> */}
                </div>
                <div className='border-b border-divider  flex flex-row justify-end items-center col-span-2 gap-4
                                mr-3
                                sm:mr-4'>
                    <div className='flex-col justify-end items-end flex leadeing-tigth'>
                        <p className='font-header text-primary'>System Admin Dashboard</p>
                        <p className='font-text text-xs text-unactive'>A centralized hub for system administration.</p>
                    </div>
                    <div className='aspect-square bg-secondaryprimary rounded-full flex justify-center items-center
                                    w-16 h-16
                                    xl:w-20 xl:h-20 xl:mr-5
                                    sm:w-16 sm:h-16'>
                        <FontAwesomeIcon icon={faUserShield} className='text-primary text-xl xl:text-2xl sm:text-xl'/>
                    </div>
                </div>

                {/* Announcement */}
                <div className='row-span-1 py-2 w-full
                                col-span-4 px-4
                                xl:col-span-3 xl:row-span-1 xl:h-full xl:px-0 xl:pr-2
                                sm:col-span-4 sm:row-span-1 sm:h-full '>
                    <AnnouncmentCarousel/>
                </div>

                <div className='grid grid-rows-[min-content_1fr] row-span-2 mr-4 ml-2 gap-1 pt-2 pb-4'>
                    {/* <div className='border-2 border-primary p-4 bg-white rounded-md shadow-md col-span-2 flex flex-col gap-1 justify-between h-fit'>
                        <p className='font-text text-xs text-primary'>System Uptime:</p>
                        <div className='flex flex-row gap-2 items-center'>
                            <FontAwesomeIcon icon={faClock} className='text-2xl'/>
                            <p className='font-header text-2xl'>00:00:00</p>
                        </div>
                    </div> */}
                    <div className=''>
                        <p className='font-header text-primary text-base'>MBLearn Users</p>
                        <p className='font-text text-xs text-unactive'>Current number of MBLearn users</p>
                    </div>

                    <div className='grid grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2 w-full'>
                        {
                            fetch ?  Array.from({ length: 6 }).map((_, index) => (
                                <div className='animate-pulse border bg-white rounded-md p-4 flex flex-row items-center gap-1 justify-between shadow-md'/>
                            )):
                            <>
                                <div className='border border-primary bg-white rounded-md px-4 py-2 flex flex-row items-center gap-1 justify-between shadow-md'>
                                    <FontAwesomeIcon icon={faUserShield} className='text-3xl text-primary'/>
                                    <div className='flex flex-col items-end '>
                                        <p className="font-header text-primary">System Admin</p>
                                        <p className='font-header text-primary text-sm'>{user_stat.System_Admin ? user_stat.System_Admin : 0} <span className='font-text text-unactive text-xs'>{user_stat.System_Admin === 1 ? "User" : user_stat.System_Admin > 1 ? "Users" : null}</span></p>
                                    </div>
                                </div>
                                <div className='border border-primary bg-white rounded-md px-4 py-2 flex flex-row items-center gap-1 justify-between shadow-md'>
                                    <FontAwesomeIcon icon={faBookOpenReader} className='text-3xl text-primary'/>
                                    <div className='flex flex-col items-end'>
                                        <p className="font-header text-primary">Course Admin</p>
                                        <p className='font-header text-primary text-sm'>{user_stat.Course_Admin ? user_stat.Course_Admin : 0} <span className='font-text text-unactive text-xs'>{user_stat.Course_Admin === 1 ? "User" : user_stat.Course_Admin > 1 ? "Users" : null}</span></p>
                                    </div>
                                </div>
                                <div className='border border-primary bg-white rounded-md px-4 py-2 flex flex-row items-center gap-1 justify-between shadow-md'>
                                    <FontAwesomeIcon icon={faGraduationCap} className='text-3xl text-primary'/>
                                    <div className='flex flex-col items-end'>
                                        <p className="font-header text-primary">Learner</p>
                                        <p className='font-header text-primary text-sm'>{user_stat.Learner ? user_stat.Learner : 0} <span className='font-text text-unactive text-xs'>{user_stat.Learner === 1 ? "User" : user_stat.Learner > 1 ? "Users" : null}</span></p>
                                    </div>
                                </div>
                                <div className='border border-primary bg-white rounded-md p-4 flex flex-row items-center gap-1 justify-between shadow-md'>
                                    <FontAwesomeIcon icon={faPenFancy} className='text-3xl text-primary'/>
                                    <div className='flex flex-col items-end'>
                                        <p className="font-header text-primary">SME-Creator</p>
                                        <p className='font-header text-primary text-sm'>{user_stat.SME_Creator ? user_stat.SME_Creator : 0} <span className='font-text text-unactive text-xs'>{user_stat.SME_Creator === 1 ? "User" : user_stat.SME_Creator > 1 ? "Users" : null}</span></p>
                                    </div>
                                </div>
                                <div className='border border-primary bg-white rounded-md p-4 flex flex-row items-center gap-1 justify-between shadow-md'>
                                <FontAwesomeIcon icon={faSwatchbook} className='text-3xl text-primary'/>
                                <div className='flex flex-col items-end'>
                                    <p className="font-header text-primary">SME-Approver</p>
                                    <p className='font-header text-primary text-sm'>{user_stat.SME_Viewer ? user_stat.SME_Viewer : 0} <span className='font-text text-unactive text-xs'>{user_stat.SME_Viewer === 1 ? "User" : user_stat.SME_Viewer > 1 ? "Users" : null}</span></p>
                                </div>
                                </div>
                                <div className='border border-primary bg-white rounded-md p-4 flex flex-row items-center gap-1 justify-between shadow-md'>
                                    <FontAwesomeIcon icon={faBookBookmark} className='text-3xl text-primary'/>
                                    <div className='flex flex-col items-end'>
                                        <p className="font-header text-primary">SME-Distributor</p>
                                        <p className='font-header text-primary text-sm'>{user_stat.SME_Distributor ? user_stat.SME_Distributor : 0} <span className='font-text text-unactive text-xs'>{user_stat.SME_Distributor === 1 ? "User" : user_stat.SME_Distributor > 1 ? "Users" : null}</span></p>
                                    </div>
                                </div>
                            </>
                        }
                    </div>

                </div>


                {/* Changing Content */}
                <div className='row-start-3 gap-2 col-span-3 pb-3 pr-2'>
                    {
                        //gettingDailies ?
                        gettingDailies ?
                        <div className='animate-pulse border-2 bg-white rounded-md p-4  h-full justify-between grid grid-rows-[min-content_1fr] gap-2'>

                        </div>:
                        <div className='border-primary border bg-white rounded-md py-4 h-fit justify-betweenp grid grid-rows-[min-content_1fr] gap-2'>
                            <div className='flex flex-row justify-between items-center px-4 gap-4'>
                                <div className='flex flex-row justify-between items-center w-full'>
                                    <div className='flex flex-col'>
                                        <p className='font-header text-primary text-base'>Daily Login Count</p>
                                        <p className='font-text text-xs text-unactive'>Charted number of users login per day</p>
                                    </div>
                                        <Select onValueChange={handleDailyFilter} value={range}>
                                            <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary py-5 bg-white w-60`} >
                                                <SelectValue placeholder="Time Span" className='w-32 text-xs'/>
                                            </SelectTrigger>
                                                <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                                    <SelectItem value="7 days" className='text-xs'>Last 7 days</SelectItem>
                                                    <SelectItem value="14 days" className='text-xs'>Last 14 days</SelectItem>
                                                    <SelectItem value="30 days" className='text-xs'>Last 30 days</SelectItem>
                                                    <SelectItem value="60 days" className='text-xs'>Last 60 days</SelectItem>
                                                </SelectContent>
                                        </Select>
                                </div>
                            </div>
                            <div>
                                <ChartContainer config={dailiesConfig}  className="min-h-[calc(100vh-35rem)] max-h-[calc(100vh-35rem)] w-full rounded-md overflow-hidden">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={filteredDailies ? filteredDailies : dailyLogins}
                                        margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(218, 97%, 50%)" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="hsl(218, 97%, 50%)" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false}/>
                                            <XAxis dataKey="date" tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    minTickGap={32}
                                                    reversed
                                                    tickFormatter={(v) => {
                                                        const date = new Date(v);
                                                        return format(date, "MMM d");
                                                    }}
                                            />
                                            {/* <YAxis domain={['auto', 'auto']} /> */}
                                            <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    })
                                                }}
                                                indicator="dot"
                                                />}/>
                                            <Area
                                                dataKey="logins"
                                                type="natural"
                                                fill="url(#colorLogins)"
                                                stroke="hsl(218, 100%, 50%)"
                                                stackId="a"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </div>
                    }
                </div>


                {/* Stats */}
            </div>



            <CalendarModal open={openCalendarModal} close={()=>setOpenCalendarModal(false)}/>
            <ReportGenerationModal open={openReportGenerationModal} close={()=>{setOpenReportGenerationModal(false)}} usedFor={"roleDistribution"} generated={()=>{setReportGen(true)}} setSuccess={()=>setReportSuccess(true)}/>
            <ReportGeneratedModal open={reportGen} close={()=>{setReportGen(false)}} type={reportSuccess}/>
            </>
            )
        //Course Admin Dashboard
        case 'Course Admin':
            return (
                <>
                    <Helmet>{/* Title of the mark-up */}
                    <title>MBLearn | Course Admin Dashboard</title>
                    </Helmet>
                        <CourseAdminDashboard name={name} user={user}/>
                </>

            )
        //Learner Dashboard
        case 'Learner':
            return (
                <>
                    <Helmet>{/* Title of the mark-up */}
                    <title>MBLearn | Learner Dashboard</title>
                    </Helmet>
                    <LearnerDashboard name={name} user={user}/>

                </>
            )
    }

}

export default function Dashboard()
{
    const {user, role, token} = useStateContext();
    if(!token){
        console.log("wlang token")
        // return navigate('/login'); // Redirect to login if no token
    }
    if (!user) {
        return <div>Loading...</div>;
    }

    const EnrolledCourses = ([])
    // useEffect(() => {
    //     if(!role === 'Learner')return

    //     axiosClient.get(`/select-user-courses/${user.id}`).then(({data}) => {console.log(data)}).catch((err) => {console.log(err)});
    // }, [role])

    return (
        <>
            <DashboardLayout role={role} name={user.user_infos.first_name} user={user}/>

        </>
    )

}
