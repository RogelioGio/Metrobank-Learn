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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "MBLearn/src/components/ui/tooltip";
import { forwardRef, useImperativeHandle, useState } from "react";

const Calendar = forwardRef(({events = []}, ref) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    //Expose Methods to parent component
    useImperativeHandle(ref, () => ({
        goToNextMonth: () => setCurrentMonth((prev)=> addMonths(prev, 1)),
        goToPreviousMonth: () => setCurrentMonth((prev)=> subMonths(prev, 1)),
        goToToday: () => setCurrrentMonth(new Date()),
        getCurrentMonth: () => currentMonth,
        setSelectedDate,
    }))

    const renderDays = () => (
        <div className="grid grid-cols-7 bg-primary text-center py-1 text-white font-header text-sm">
            {daysOfWeek.map((d)=> (
                <div key={d}>{d}</div>
            ))}
        </div>
    )

    const eventDates = events.reduce((acc, event)=> {
        const key = format(parseISO(event.date), "yyyy-MM-dd");
        const type = event.event_type || "Event";

        if(!acc[key]) acc[key] = {};
        if(!acc[key][type]) acc[key][type] = 0;

        acc[key][type] += 1;
        return acc;
    },{})

    const renderCells = () => {
        const startDate = startOfWeek(startOfMonth(currentMonth));
        const days = [];
        let day = startDate;

        //normalize the event dates to read string to dates
        // const eventDates = events.map((e) => (
        //     typeof e.date === "string" ? format(parseISO(e.date), "yyyy-MM-dd") :  format(e.date, "yyyy-MM-dd")
        // ))

        //6 weeks
        for(let i=0; i<42; i++){
            const formattedDate = format(day, "d");
            const cloneDay = day;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            //event identifiers
            // const dayKey = format(day, "yyyy-MM-dd");
            // //const hasEvent = eventDates.includes(dayKey)
            //const hasEvent = dayKey in eventDates;
            //const eventTypes = eventDates[dayKey] || {};

            const event = events.filter(entry => isSameDay(entry.date, day))
            const hasEvent = event.length > 0;


            days.push(
                <TooltipProvider key={format(day, "yyyy-MM-dd")}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className={`font-text flex items-center justify-center border border-division ${!isCurrentMonth ? "!text-gray-300" : ""}`}>
                                <div className={`text-sm w-8 h-7 flex items-center justify-center ${isToday && !isSameDay(day, selectedDate) ? "bg-primary text-white rounded-md shadow-md hover:text-white" : ""} ${hasEvent ? "border-2 border-primary text-primary font-header":""} transition-all hover:border hover:cursor-pointer hover:text-primary border-primary rounded-md`}>{formattedDate}</div>
                            </button>
                        </TooltipTrigger>
                        {
                            hasEvent &&
                            <TooltipContent>
                                <div className="flex flex-col gap-1 text-unactive font-text">
                                    {
                                        event.some(e => e.type === "enrollment") &&
                                        <div className='flex flex-row items-center gap-2 whitespace-nowrap'>
                                        <div className='w-4 aspect-square rounded-md bg-primary'/>
                                        <p className='font-text text-xs'>Enrollment - { event.filter(e => e.type === 'enrollment').length}</p>
                                        </div>
                                    }
                                    {
                                        event.some(e => e.type === "deadline") &&
                                        <div className='flex flex-row items-center gap-2 whitespace-nowrap'>
                                        <div className='w-4 aspect-square rounded-md bg-primarybg'/>
                                        <p className='font-text text-xs'>Deadline - { event.filter(e => e.type === 'deadline').length}</p>
                                        </div>
                                    }
                                </div>
                            </TooltipContent>
                        }
                    </Tooltip>
                </TooltipProvider>
            )
            day = addDays(day, 1);
        }

        const rows = [];
        for(let i=0; i<days.length; i+=7){
            rows.push(
                <div key={i} className="grid grid-cols-7 h-full">
                    {days.slice(i, i+7)}
                </div>
            )
        }
        return <div className="h-full flex flex-col justify-between">{rows}</div>

    }




    return(
        <>
            <div className="flex flex-col h-full">
                {renderDays()}
                {renderCells()}
            </div>
        </>
    )
})
export default Calendar;

