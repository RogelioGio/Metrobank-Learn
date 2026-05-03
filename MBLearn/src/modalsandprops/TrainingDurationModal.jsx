import { faCalendar, faClock, faSpinner, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import * as React from "react"
import { useState } from "react";
import { addDays, addMonths, addWeeks, differenceInDays, differenceInMonths, differenceInWeeks, format } from "date-fns"
import { useEffect } from "react";
import { useFormik } from "formik";
import { use } from "react";
import CancelEnrollmentModal from "./CancelEnrollmentModal";
import axiosClient from "../axios-client";
import { toast } from "sonner";

function normalizationDuration(values, setField) {
    let months = parseInt(values.months) || 0;
    let weeks = parseInt(values.weeks) || 0;
    let days = parseInt(values.days) || 0;

    if (weeks >= 4) {
        const addMonths = Math.floor(weeks / 4);
        months += addMonths;
        weeks = weeks % 4;
    }

    if (days >= 7) {
        const addWeeks = Math.floor(days / 7);
        weeks += addWeeks;
        days = days % 7;
    }

    if (weeks >= 4) {
        const addMonths = Math.floor(weeks / 4);
        months += addMonths;
        weeks = weeks % 4;
    }

    setField('months', months > 0 ? months : '');
    setField('weeks', weeks > 0 ? weeks : '');
    setField('days', days > 0 ? days : '');
}

const TraningDurationModal = ({ open, close, enrollment, fetchUser, closeInfo}) => {
    const [date, setDate] = useState({
        from: enrollment.start_date ? new Date(enrollment.start_date) :  "",
        to: enrollment.end_date ? new Date(enrollment.end_date) : "",
    })
    const [extending, setExtending] = useState(false);

    useEffect(()=>{
        setDate({
            from: enrollment.start_date ? new Date(enrollment.start_date) :  "",
            to: enrollment.end_date ? new Date(enrollment.end_date) : "",
        });
    },[enrollment])


    const dates = useFormik({
        enableReinitialize: true,
        initialValues: {
            date_from: date?.from,
            date_to: date?.to,
        },
        onSubmit: (values) => {
            console.log(values)
        }
    });
    // const [duration, setDuration] = useState({
    //     months: 0,
    //     weeks: 0,
    //     days: 0,
    // })

    // const [cancelEnrollment, setCancelEnrollment] = useState(false);

    // useEffect(() => {
    //     if (!course) return
    //     setDuration ((d) => ({
    //         months: 0,
    //         weeks: 0,
    //         days: 0
    //     }))
    // }, [course])



    // const calculateDuration = (fromDate, duration) => {
    //     let result = fromDate;
    //     result = addMonths(result, duration.months)
    //     result = addWeeks(result, duration.weeks)
    //     result = addDays(result, duration.days)
    //     return result
    // }

    // const formik = useFormik({
    //     initialValues:{
    //         months: duration.months,
    //         weeks: duration.weeks,
    //         days: duration.days
    //     },
    //     onSubmit:(values) => {
    //         console.log(values)
    //     }
    // })

    // const handleDateChange = (newDate) => {

    //     _setDate(newDate);

    //     if (!newDate?.from || !newDate?.to) {
    //         setDuration({
    //             months: 0,
    //             weeks: 0,
    //             days: 0,
    //         });
    //     } else {

    //         const { from, to } = newDate;

    //         const months = differenceInMonths(to, from);
    //         const weeks = differenceInWeeks(to, addMonths(from, months));
    //         const days = differenceInDays(to, addMonths(addWeeks(from, weeks), months));

    //         setDuration({
    //             months,
    //             weeks,
    //             days,
    //         });

    //     };
    // };

    // useEffect(() => {
    //     if (!open) return;
    //     setDuration ((d) => ({
    //         months: course?.months,
    //         weeks: course?.weeks,
    //         days: course?.days,
    //     }))
    //     _setDate((d) => ({
    //         from: d?.from,
    //         to: calculateDuration(d?.from, duration),
    //     }));
    //     }, [open, course]);

    // useEffect(() => {
    //     formik.setFieldValue('months', duration.months);
    //     formik.setFieldValue('weeks', duration.weeks);
    //     formik.setFieldValue('days', duration.days);
    // }, [duration]);


    // useEffect(()=>{
    //     console.log("to",date?.to)
    //     console.log("from",date?.from)
    //     console.log(duration)
    // },[date])

    const [breakpoint, setBreakpoint] = useState(window.innerWidth >= 768);
    useEffect(()=>{
        const resize = () => {
            setBreakpoint(window.innerWidth >= 768);

        }
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    },[])

    const handleChangeDuration = () => {
        setExtending(true);
        axiosClient.put(`/enrollment/move-end-date/${enrollment.id}`, {
            end_date: format(new Date(dates.values.date_to), "yyyy-MM-dd HH:mm:ss")
        }).then(({data}) => {
            console.log("✅ success:", data);
            toast.success("Enrollment duration extended successfully");
            setExtending(false);
            closeInfo();
            fetchUser();
            close()
        })
        .catch((error) => {
            console.error("❌ error:", error);
            setExtending(false);
            toast.error("An error occurred while extending the enrollment duration");
        })
    }

    return (
        <>
            <Dialog open={open} onClose={close}>
                <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                    <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4 text center'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[50vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                    text-base
                                                    md:text-2xl">Extend Enrollment Duration</h1>
                                            <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-xs">Set a customized training period for learners, helping them manage their course timelines effectively.</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={()=>{
                                                    extending ? null : close();
                                                }}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Default Duration */}

                                    {/* Start Date and End Date */}
                                    {/* <div className="col-span-2 flex flex-row gap-4 w-full px-4">
                                    <div className="flex-col gap-2 flex w-full">
                                        <p className="text-xs font-text">Start Date and End Date</p>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="flex flex-row justify-between items-center font-text border border-divider rounded-md py-2 px-4 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                                                    <p>{
                                                        date?.from instanceof Date && !isNaN(date?.from) ? (
                                                            date?.to instanceof Date && !isNaN(date?.to) ? (
                                                            <>
                                                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                                            </>
                                                            ) : (
                                                            format(date.from, "LLL dd, y")
                                                            )
                                                        ) : (
                                                            "Pick a Date"
                                                        )
                                                        }</p>
                                                    <FontAwesomeIcon icon={faCalendar} className="text-primary text-lg"/>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-fit">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={date?.from}
                                                    selected={date}
                                                    disabled={{ before: new Date() }}
                                                    numberOfMonths={breakpoint ? 2 : 1}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    </div> */}
                                    <div className="flex flex-row gap-2 p-4 items-end">
                                        <form className="w-full flex flex-row justify-between gap-2">
                                            <div className="inline-flex flex-col w-full">
                                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text">Starting Date</p>
                                                </label>
                                                <input type="text" name="day_from"
                                                    value={dates.values.date_from ? format(new Date(dates.values.date_from), "LLL dd, y") : ""}
                                                    onChange={dates.handleChange}
                                                    readOnly
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="inline-flex flex-col w-full">
                                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text">Due Date</p>
                                                </label>
                                                <input type="text" name="day_to"
                                                    value={dates.values.date_to ? format(new Date(dates.values.date_to), "LLL dd, y") : "Select New Duration"}
                                                    onChange={dates.handleChange}
                                                    readOnly
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                        </form>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div className="w-10 h-10 border-2 flex flex-row items-center font-text border-primary bg-white justify-center text-primary rounded-md py-2 px-4 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out">
                                                    <FontAwesomeIcon icon={faCalendar}/>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-fit'>
                                                <Calendar
                                                    initialFocus
                                                    mode="single"
                                                    defaultMonth={date.from}
                                                    selected={dates.values.date_to ? new Date(dates.values.date_to) : null}
                                                    onSelect={(selectedDate) => {
                                                        dates.setFieldValue('date_to', selectedDate || null);
                                                    }}
                                                    disabled={{ before: date.to || new Date() }}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {/* Save and Cancel */}
                                    <div className="col-span-2 flex flex-row gap-2 px-4">
                                        <div className={`p-4 flex items-center justify-center bg-white border-2 border-primary rounded-md font-header uppercase text-primary text-xs transition-all ease-in-out w-full ${extending ? "opacity-50 cursor-not-allowed": "hover:bg-primaryhover hover:text-white hover:border-primaryhover"}`}
                                        onClick={()=>{
                                                if (extending) return;
                                                 extending ? null : close();
                                            }}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`p-4 flex justify-center items-center bg-primary rounded-md font-header uppercase text-white text-xs transition-all ease-in-out w-full ${extending ? "opacity-50 cursor-not-allowed": "hover:cursor-pointer hover:bg-primaryhover"}`}
                                            onClick={()=>{
                                                if (extending) return;
                                                handleChangeDuration();
                                            }}>

                                            {!extending ?
                                                <>
                                                <p>Extend</p>
                                                </>:<>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-lg"/>
                                                <p className="ml-2">Extending...</p>
                                                </>}
                                        </div>

                                        </div>

                                    </div>
                            </DialogPanel>
                        </div>
                    </div>
            </Dialog>
            {/* <CancelEnrollmentModal open={cancelEnrollment} close={()=>{setCancelEnrollment(false)}} discardChanges={()=>{close(), setCancelEnrollment(false)}}/> */}
        </>

    )
}

export default TraningDurationModal


