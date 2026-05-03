import { faArrowLeft, faCalendar, faClock, faGraduationCap, faMugHot, faStar, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';
import {
   startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  set,
} from "date-fns";
import { ArrowLeft, ArrowRight, Scroll } from "lucide-react"
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from '../axios-client';


export default function Calendar() {
    const navigate = useNavigate();
    const {user, events} = useStateContext();
        const [currentMonth, setCurrentMonth] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState(null);
        const [notInPresent, setNotInPresent] = useState(false);
        const [eventsDates, setEventsDates] = useState(events);
        const [eventsType, setEventsType] = useState("all");
        const [loading, setLoading] = useState(false);

        const goToNextMonth = () => {
            setCurrentMonth((prev) => addMonths(prev, 1));
        }
        const goToPreviousMonth = () => {
            setCurrentMonth((prev) => subMonths(prev, 1));
        }
        const goToToday = () => {
            setCurrentMonth(new Date());
        }
        useEffect(() => {
            const today = new Date();
            if (isSameMonth(today, currentMonth)) {
                setNotInPresent(false);
            } else {
                setNotInPresent(true);
            }
        },[currentMonth]);

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const renderCells = () => {
            const startDate = startOfWeek(startOfMonth(currentMonth));
            const days = [];
            let day = startDate;

            //6 weeks grid
            for (let i=0; i<42; i++){
                const formattedDate = format(day, "d");
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                const event = events.filter(entry => isSameDay(entry.date, day))
                const hasPin = event.length > 0;

                days.push(
                    <div className='group relative'>
                        <div key={format(day, "yyyy-MM-dd")} className={`group font-text flex items-start justify-between border border-division w-full h-full ${!isCurrentMonth ? "!text-gray-300" : ""} transition-all ease-in-out hover:cursor-pointer hover:!text-primary`}>
                            <div className={`text-sm w-8 h-8 flex items-center justify-center m-2 ${isToday && !isSameDay(day, selectedDate) ? "bg-primary text-white rounded-full shadow-md hover:text-white font-header" : ""} group-hover:border rounded-full border-primary transition-all ease-in-out`}>
                                {formattedDate}
                            </div>
                            {
                                hasPin &&
                                <div className='p-2 flex flex-col gap-2 items-center justify-center'>
                                    {
                                        event.some(e => e.type === 'enrollment') &&
                                        <FontAwesomeIcon icon={faGraduationCap} className='text-lg' />
                                    }
                                    {
                                        event.some(e => e.type === 'deadline') &&
                                        <FontAwesomeIcon icon={faClock} className='text-lg' />
                                    }
                                </div>
                            }
                        </div>
                        {
                            hasPin &&
                            <div className='absolute -top-10 scale-0 group-hover:scale-100 transition-all ease-in-out duration-200 bg-white shadow-md border-primary border rounded-md p-2 text-xs z-10 flex flex-col gap-1 w-fit'>
                                {
                                    event.some(e => e.type === 'enrollment') &&
                                    <div className='flex flex-row items-center gap-2 whitespace-nowrap'>
                                        <div className='w-4 aspect-square rounded-md bg-primary'/>
                                        <p className='font-text text-xs'>Enrollment - { event.filter(e => e.type === 'enrollment').length}</p>
                                    </div>
                                }
                                {
                                    event.some(e => e.type === 'deadline') &&
                                    <div className='flex flex-row items-center gap-2 whitespace-nowrap'>
                                        <div className='w-4 aspect-square rounded-md bg-primary'/>
                                        <p className='font-text text-xs'>Deadline - { event.filter(e => e.type === 'deadline').length}</p>
                                    </div>
                                }

                            </div>
                        }
                    </div>
                )
                day = addDays(day, 1);
            }

            const rows = [];
            for (let i = 0; i < 7; i++) {
                rows.push(
                    <div key={i} className="grid grid-cols-7">
                        {days.slice(i * 7, i * 7 + 7)}
                    </div>
                );
            }
            return rows;
        }

        // useEffect(() => {
        //     setLoading(true);
        //     axiosClient.get(`/getUserEvents`)
        //     .then((res) => {
        //         setLoading(false);
        //         setEvents([
        //             ...res.data.enrollements.map((event) => ({
        //                 type: 'enrollment',
        //                 date: format(event.start_date, "yyyy-MM-dd"),
        //                 courseName: event.course.name,
        //             })),
        //             ...res.data.deadlines.map((event) => ({
        //                 type: 'deadline',
        //                 date: format(event.end_date, "yyyy-MM-dd"),
        //                 courseName: event.course.name,
        //             })),
        //         ])
        //     })
        //     .catch((e) => {
        //         console.log(e)
        //         setLoading(false);
        //     })
        //     },[])

            const handleEvents = () => {
                setLoading(true);
                axiosClient.get('/userEvents',{
                params: {
                    type: eventsType,
                }}).then(({data}) => {
                    console.log(data);
                    setEventsDates(data.events);
                    setLoading(false);
                }).catch((err) => {
                    console.log(err);
                })
            }

            useEffect(() => {
                console.log("Events: ", events);
                handleEvents();
            },[eventsType])
    return (
        <>
            <Helmet><title>MBLearn | Calendar</title></Helmet>
            <div className="grid grid-cols-4 grid-rows-[6.25rem_1fr] h-full w-full">
                {/* Header */}
                <div className='flex flex-row items-center gap-x-4 col-span-4 row-span-1 mr-5 border-b border-divider justify-between'>
                    <div className='flex flex-row items-center gap-x-5'>
                        <div>
                            <div className='border-2 border-primary rounded-full w-8 h-8 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out' onClick={() => navigate(-1)}>
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </div>
                        </div>
                        <div>
                            <p className='font-text text-xs'>Good Day {user.user_infos.first_name}, Today is</p>
                            <p className='font-header text-4xl text-primary'>{format(new Date(), "EEEE, MMMM dd yyyy")}</p>
                            <p className='font-text text-xs text-unactive'>Current Date</p>
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-x-5'>
                        <div className='text-right'>
                            <p className='font-header text-2xl text-primary'>Calendar</p>
                            <p className='text-xs font-text text-unactive'>Displays dates that is relevant to the user;</p>
                        </div>
                        <div className='flex flex-row items-center justify-center bg-primarybg aspect-square w-16 rounded-full'>
                            <FontAwesomeIcon icon={faCalendar} className='text-primary text-2xl'/>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className='py-3 col-span-3 pr-4 flex flex-col gap-2'>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div>
                            <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                            onClick={()=> {goToPreviousMonth()}}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                        </div>
                        <div className='flex flex-row items-center justify-center gap-2 '>
                            <p className='font-header text-lg text-primary'>{format(currentMonth, "MMMM, yyyy")}</p>
                            {
                                notInPresent &&
                                <div className='group relative'>
                                    <div className='w-8 aspect-square flex items-center justify-center bg-white rounded-md border-2 border-primary text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'>
                                        <FontAwesomeIcon icon={faClock} className='text-sm' onClick={()=> {goToToday()}}/>
                                    </div>
                                    <div className={`absolute w-fit bottom-[-2.3rem] left-1/2 -translate-x-1/2 bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap block transition-all ease-in-out scale-0 group-hover:scale-100`}>
                                        <p>Return to the present</p>
                                    </div>
                                </div>
                            }
                        </div>
                        <div>
                            <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                            onClick={()=> {goToNextMonth()}}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    <div className='border-2 border-primary rounded-md shadow-sm flex flex-col h-full bg-white'>
                        <div>
                            <div className="grid grid-cols-7 bg-primary text-center py-2 text-white font-header text-sm">
                            {daysOfWeek.map((d)=> (
                                <div key={d}>{d}</div>
                            ))}
                            </div>
                        </div>
                        <div className='grid grid-rows-6 h-full relative'>
                            {renderCells()}
                        </div>
                    </div>
                </div>
                {/* Event Feeds */}
                <div className='col-start-4 h-full mr-5 py-3 flex flex-col gap-2'>
                    <div className='flex flex-col gap-1 text-xs font-text text-unactive'>
                        <p>Event Type:</p>
                        <Select onValueChange={(value) => {setEventsType(value);}} value={eventsType} disabled={loading}>
                            <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full bg-white">
                                <SelectValue placeholder="Select Event Type" />
                            </SelectTrigger>
                            <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                                    <SelectItem value="all">All Events</SelectItem>
                                                    <SelectItem value="enrollment">Enrolled</SelectItem>
                                                    <SelectItem value="deadline">Deadline</SelectItem>
                                                </SelectContent>
                        </Select>
                    </div>
                    <ScrollArea className='h-full max-h-[calc(100vh-11.75rem)] border-divider border rounded-md bg-white'>
                        <div className='p-4 flex flex-col gap-2 h-full'>
                            {
                                loading ?
                                Array.from({length: 5}).map((_, index) => (
                                    <div key={index} className='border p-3 rounded-md shadow-xl bg-white flex flex-row gap-2 items-center animate-pulse'>
                                        <div className='flex items-center justify-center aspect-square w-10 h-10 bg-gray-300 rounded-full'>
                                        </div>
                                    </div>
                                ))
                                : events.length === 0 ?
                                <>
                                    <div className='bg-white flex flex-col items-center justify-center h-[calc(100vh-13.75rem)] '>
                                        <div>
                                            <div className='bg-primarybg w-24 aspect-square rounded-full flex items-center justify-center text-4xl text-primary'>
                                                <FontAwesomeIcon icon={faMugHot} />
                                            </div>
                                        </div>

                                        <p className='font-header text-xl text-primary'>You are vacant!</p>
                                        <p className='text-unactive font-text text-xs text-center'>You dont have any upcoming or ongoing events yet</p>
                                    </div>
                                </>
                                :
                                eventsDates.map((e, index) => (
                                    <div key={index} className='border-2 border-primary p-3 rounded-md shadow-xl bg-white flex flex-row gap-2 items-center'>
                                        <div className='w-full flex flex-col gap-2'>
                                            <div className='flex items-center justify-between'>
                                                <p className='font-header text-primary'>
                                                    <FontAwesomeIcon icon={e.type === 'enrollment' ? faGraduationCap : faClock} className='text-primary text-base mr-2' />
                                                    {
                                                        e.type === 'enrollment' ?
                                                        'Enrolled' :
                                                        'Deadline'
                                                    }
                                                </p>
                                                <p className='text-xs font-text'>{format(e.date, "MM-dd-yyyy")}</p>
                                            </div>
                                            <div>
                                                <p className='font-text text-xs'>
                                                    {
                                                        e.type === 'enrollment' ?
                                                        `You have enrolled in ${e.course}` :
                                                        `${e.course}, Course ends`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </>
    )
}
