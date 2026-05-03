import { faBook, faBookOpen, faBuilding, faCalendar, faChevronLeft, faChevronRight, faDownload, faFilePen, faGears, faPeopleGroup, faSpinner, faUserGroup, faUsers, faWrench, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { ScrollArea } from "../components/ui/scroll-area"
import { addDays, addMonths, addWeeks, differenceInDays, differenceInMonths, differenceInWeeks, format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import axiosClient from "../axios-client"
import axios from "axios"
import { exportToExcel } from "MBLearn/utils/exportToExcel"
import ReportGenerationModal from "../modalsandprops/ReportGenerationModal"

export default function SystemLevelReports() {
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState("masterList")
    const [date, setDate] = React.useState({
                from: new Date(),
                to: undefined,
            });
    const [reports, setReports] = useState([])
    const [generating, setGenerating] = useState(false)
    const [open, setOpen] = useState(false)

    const [type, setType] = useState("userList")


    const genReport = () => {
        setGenerating(true)
        axiosClient.post(`/report/${type}`,payload

        ).then((res)=>{
            setGenerating(false)
            console.log(res.data)})
    }

    const fetchReports = () => {
        setLoading(true)
        axiosClient.get('/reports')
        .then((res)=>{
            setReports(res.data)
            setLoading(false)
        })
        .catch((err)=>{console.log(err)})
    }

    const exportReport = (report) => {
        // const parsedData = JSON.stringify(report.data);
        // console.log(report)
        console.log(typeof(report.data) )
        console.log(Array.isArray(report.data));
        exportToExcel(report.data, report.title);
    }

    useEffect(()=>{
        if(generating) return
        fetchReports()
    },[generating])

    return (
        <>
            <div className='grid grid-cols-4 grid-rows-[6.25rem_min-content_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | System Level Reports </title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-4 row-span-1 pr-5 mr-5 border-divider border-b'>
                <h1 className='text-primary text-4xl font-header'>System Level Reports</h1>
                <p className='font-text text-sm text-unactive' >Generates comprehensive reports on system performance, usage, and security for analysis and decision-making.</p>
            </div>

            {/* Tabs for report segments */}
            {/* <div className="grid grid-cols-3 col-span-4 row-span-1 mx-5 border-divider">
                <div className={`text-base gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "userList" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("userList")}>
                    <FontAwesomeIcon icon={faUsers}/>
                    <p>User List Reports</p>
                </div>
                <div className={`gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "userActivity" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("userActivity")}>
                    <FontAwesomeIcon icon={faGears} className="mr-2" />
                    <p>System Access Reports</p>
                </div>
                <div className={`gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "AuditLog" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("AuditLog")}>
                    <FontAwesomeIcon icon={faWrench} className="mr-2" />
                    <p>Audit Log</p>
                </div>
            </div> */}
            <div className="row-span-3 col-span-1 border-r border-divider grid auto-rows-min px-3">
                <div className={`text-base gap-2 flex items-center font-text text-unactive pt-4 pb-2 transition-all ease-in-out border-divider`}>
                    <FontAwesomeIcon icon={faUsers}/>
                    <p>User List Reports</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'masterList' ? 'bg-primary text-white':''}`} onClick={()=> setTab('masterList')}>
                    <p>Master List Report</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'roleDistribution' ? 'bg-primary text-white':''}`} onClick={()=> setTab('roleDistribution')}>
                    <p>Role Distributions</p>
                </div>
                <div className={`text-base gap-2 flex items-center font-text text-unactive pt-4 pb-2 transition-all ease-in-out border-divider`}>
                    <FontAwesomeIcon icon={faGears}/>
                    <p>System Access Reports</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'accessLog' ? 'bg-primary text-white':''}`} onClick={()=> setTab('accessLog')}>
                    <p>User Access Logs</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'activity' ? 'bg-primary text-white':''}`} onClick={()=> setTab('activity')}>
                    <p>User Activity Report</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'accountStatus' ? 'bg-primary text-white':''}`} onClick={()=> setTab('accountStatus')}>
                    <p>Accounts Status Report</p>
                </div>
                <div className={`text-base gap-2 flex items-center font-text text-unactive pt-4 pb-2 transition-all ease-in-out border-divider`}>
                    <FontAwesomeIcon icon={faWrench}/>
                    <p>Audit Log</p>
                </div>
                <div className={`border-2 border-primary rounded-md font-header px-4 py-2 my-1 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 'changeHistory' ? 'bg-primary text-white':''}`} onClick={()=> setTab('changeHistory')}>
                    <p>System Change History Report</p>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="col-span-3 row-span-3 h-full">
                <div className="px-5 py-3 h-[calc(100vh-6.25rem)] grid grid-cols-4 grid-rows-[min-content_1fr_min-content]">
                    {
                        tab === 'masterList' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">User Master List Report</p>
                                        <p className="text-xs text-unactive font-text">Generates a comprehensive report of all registered users in the system, including their departments, statuses, and other key profile details for administrative oversight and record-keeping.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap "
                                        onClick={()=>{setOpen(true)}}>
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                {/* : reports.length === 0 ?  */}
                                                {
                                                    loading ? <tr>
                                                        <td colSpan={4} className="text-center py-4">
                                                            <div className="text-unactive flex flex-row items-center justify-center gap-x-2">
                                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                                <p className="font-text text-xs">Fetching Report</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    : reports.length === 0 ?
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-4">
                                                            <div className="text-unactive flex flex-row items-center justify-center gap-x-2">
                                                                <FontAwesomeIcon icon={faXmark}/>
                                                                <p className="font-text text-xs">No report generated yet</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    : reports.map((report) => (
                                                        <tr key={report.id} className={`font-text text-sm hover:bg-gray-200`}>
                                                            <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>{report.title}</td>
                                                            <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>{report.created_at ? format(new Date(report.created_at), "MMMM dd yyyy") : "No Date Given"}</td>
                                                            <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>{report.expire_at ? format(new Date(report.expire_at), "MMMM dd yyyy") : "No Date Given"}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out"
                                                                    onClick={() => exportReport(report)}>
                                                                    <FontAwesomeIcon icon={faDownload}/>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>



                                    </div>
                                </div>
                            </>
                        ) : tab === 'roleDistribution' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">User Role Distributions</p>
                                        <p className="text-xs text-unactive font-text">Displays the breakdown of users by assigned roles (e.g., Learner, Course Admin, System Admin), providing insights <br/> into role allocation and helping monitor access control across the platform.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap ">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                <tr className={`font-text text-sm hover:bg-gray-200`}>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>Report Name</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={faDownload}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        ) : tab === 'accessLog' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">User Access Logs Report</p>
                                        <p className="text-xs text-unactive font-text">Provides a detailed record of user login activities, including timestamps, user IDs and to monitor system usage, detect anomalies, and support security auditing.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap ">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                <tr className={`font-text text-sm hover:bg-gray-200`}>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>Report Name</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={faDownload}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        ) : tab === 'activity' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">User Activity Report</p>
                                        <p className="text-xs text-unactive font-text">Summarizes user interactions within the platform.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap ">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                <tr className={`font-text text-sm hover:bg-gray-200`}>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>Report Name</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={faDownload}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        ) : tab === 'accountStatus' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">User Account Status Report</p>
                                        <p className="text-xs text-unactive font-text">Displays the current status of user accounts, helping administrators monitor account activity and manage user access across the system.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap ">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                <tr className={`font-text text-sm hover:bg-gray-200`}>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>Report Name</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={faDownload}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        ) : tab === 'changeHistory' ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        <p className="text-xl font-header text-primary">System Change History Report</p>
                                        <p className="text-xs text-unactive font-text">Logs and tracks all significant changes made within the system, changes—to ensure transparency, accountability, and support for audit trails.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer whitespace-nowrap ">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="col-span-4 pt-4 flex-col flex justify-between">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4  w-2/6'>REPORT NAME</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE GENERATED</th>
                                                    <th className='py-4 px-4  w-2/6'>DATE EXPIRATION</th>
                                                    <th className='py-4 px-4  w-1/6'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                <tr className={`font-text text-sm hover:bg-gray-200`}>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>Report Name</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out text-unactive`}>00-00-00</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-8 aspect-square border-primary border-2 flex items-center justify-center rounded-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={faDownload}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Pagination */}
                                <div className='row-span-1 col-start-1 col-span-4 border-t border-divider py-3 flex flex-row items-center justify-between'>
                                    {/* Total number of entries and only be shown */}
                                    <div>
                                        {/* {
                                            !isLoading ? (
                                                <p className='text-sm font-text text-unactive'>
                                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                                </p>
                                            ) : (
                                                <p className='text-sm font-text text-unactive'>
                                                    Retrieving users.....
                                                </p>
                                            )
                                        } */}
                                        <p className='text-sm font-text text-unactive'>
                                            Retrieving users.....
                                        </p>
                                    </div>
                                    {/* Paganation */}
                                    <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                //onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {/* {
                                                isLoading ? (
                                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                                    ...</a>
                                                ) : (
                                                    Pages.map((page)=>(
                                                        <a
                                                            key={page}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    page === pageState.currentPage
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => pageChange(page)}>
                                                            {page}</a>
                                                    ))
                                                )
                                            } */}
                                            <a
                                                //onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        ) : null
                    }
                </div>
            </ScrollArea>

        </div>
        <ReportGenerationModal open={open} close={() => {setOpen(false)}} usedFor={tab} fetch={()=>{fetchReports()}}/>
        </>
    )
}
