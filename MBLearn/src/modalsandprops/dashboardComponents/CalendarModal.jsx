import { faClock, faGraduationCap, faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
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
} from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react"
import React, { useState } from "react";

const CalendarModal = ({open, close}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

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

            days.push(
                <div className={`group font-text flex items-start justify-start border border-division w-full h-14 ${!isCurrentMonth ? "!text-gray-300" : ""} transition-all ease-in-out hover:cursor-pointer hover:!text-primary`}>
                    <div className={`text-sm w-8 h-8 flex items-center justify-center m-2 ${isToday && !isSameDay(day, selectedDate) ? "bg-primary text-white rounded-full shadow-md hover:text-white" : ""} group-hover:border rounded-full border-primary transition-all ease-in-out`}>
                        {formattedDate}
                    </div>
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



    return(
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40'>
                            <div className='bg-white rounded-md h-full p-5 grid grid-row-5 grid-cols-[1fr_20rem] w-[90vw]'>
                                {/* Header */}
                                <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-10 col-span-2 justify-between">
                                    <div>
                                        <h1 className="text-primary font-header text-3xl">Calendar</h1>
                                        <p className="text-unactive font-text text-xs">Displays a user’s upcoming events, training schedules, deadlines, and course-related events, helping them stay organized and on track with their learning activities.</p>
                                    </div>
                                    <div className="flex items-start justify-center">
                                        <div className="rounded-full w-8 h-8 border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer" onClick={close}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </div>
                                    </div>
                                </div>
                                {/* Calendar */}
                                <div className="ml-4 pr-4">
                                    {/* Calendar header */}
                                    <div className="py-2 flex flex-row justify-between items-center">
                                        <div>
                                            <p className="text-unactive font-text text-xs">Current Month & Date:</p>
                                            {/* Will be change later on */}
                                            <p className="text-primary font-header text-xl">{format(currentMonth, "MMMM dd yyyy")}</p>
                                        </div>
                                        <div className="flex flex-row gap-1">
                                            <div>
                                                <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                                                //onClick={()=> {calendarRef.current?.goToPreviousMonth(), setTimeout(updateMonthLabel, 0)}}
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                                                //onClick={()=> {calendarRef.current?.goToNextMonth(), setTimeout(updateMonthLabel, 0)}}
                                                >
                                                <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-md border-2 border-primary">
                                        <div className="bg-primary flex flex-row items-center justify-between text-white py-2 px-5 border-b border-white uppercase font-header">
                                            <p>{format(currentMonth, "MMMM")}</p>
                                            <p>{format(currentMonth, "yyyy")}</p>
                                        </div>
                                        <div>
                                                <div className="grid grid-cols-7 bg-primary text-center py-2 text-white font-header text-sm">
                                                {daysOfWeek.map((d)=> (
                                                    <div key={d}>{d}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            {renderCells()}
                                        </div>
                                    </div>
                                </div>
                                {/* Events */}
                                <div className="border-l border-divider flex flex-col">
                                    <p className="px-4 py-2 font-text text-xs text-unactive">Date Events:</p>
                                    <div className="grid grid-cols-1 grid-rows-7 gap-2 px-4 h-full">
                                        <div className="flex flex-row gap-4 border-2 border-primary rounded-md shadow-sm p-2 items-center">
                                            <div className="w-10 h-10 bg-primarybg rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faClock} className="text-primary text-lg" />
                                            </div>
                                            <div className="flex flex-col">
                                                {/* Event Title */}
                                                <p className="font-header text-primary text-sm">Sample Date Event</p>
                                                <p className="font-text text-primary text-xs">DEADLINE 00-00-0000</p>
                                                {/* Event Type - Event Date */}
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-4 border-2 border-primary rounded-md shadow-sm p-2 items-center">
                                            <div className="w-10 h-10 bg-primarybg rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-lg" />
                                            </div>
                                            <div className="flex flex-col">
                                                {/* Event Title */}
                                                <p className="font-header text-primary text-sm">Sample Date Event</p>
                                                <p className="font-text text-primary text-xs">ENROLLED 00-00-0000</p>
                                                {/* Event Type - Event Date */}
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-4 border-2 border-primary rounded-md shadow-sm p-2 items-center">
                                            <div className="w-10 h-10 bg-primarybg rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faStar} className="text-primary text-lg" />
                                            </div>
                                            <div className="flex flex-col">
                                                {/* Event Title */}
                                                <p className="font-header text-primary text-sm">Sample Date Event</p>
                                                <p className="font-text text-primary text-xs">Custom 00-00-0000</p>
                                                {/* Event Type - Event Date */}
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>


        </Dialog>
    )
}
export default CalendarModal;
