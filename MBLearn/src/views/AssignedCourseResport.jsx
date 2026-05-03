import { faUsers, faGears, faWrench, faBook, faClock, faCertificate, faChevronLeft, faChevronRight, faDownload, faFilePen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from "react"
import { Helmet } from "react-helmet"




export default function AssignedCourseReport() {
    const [tab, setTab] = useState("performance")

    return(
        <div className='grid grid-cols-4 grid-rows-[6.25rem_min-content_auto_auto_3.75rem] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Course-level Report</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-4 row-span-1 pr-5 mx-5'>
                <h1 className='text-primary text-4xl font-header'>Course-level Report</h1>
                <p className='font-text text-sm text-unactive' >Access the assigned course report panel to track progress and performance insights.</p>
            </div>

             {/* Tabs for report segments */}
            <div className="grid grid-cols-3 col-span-4 row-span-1 mx-5 border-divider">
                <div className={`gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "performance" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("performance")}>
                    <FontAwesomeIcon icon={faBook}/>
                    <p>Course Performance Reports</p>
                </div>
                <div className={`gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "timeline" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("timeline")}>
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <p>Course Timeline Reports</p>
                </div>
                <div className={`gap-2 flex items-center justify-center font-header text-unactive border-b py-2 hover:text-primary hover:border-b hover:border-primary transition-all ease-in-out border-divider ${tab === "certificate" ? "!text-primary border-b border-primary" : ""} hover:cursor-pointer`} onClick={() => setTab("certificate")}>
                    <FontAwesomeIcon icon={faCertificate} className="mr-2" />
                    <p>Certification Reports</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 col-span-4 row-span-2">
                {
                    tab === "performance" ? (
                        <>
                            <div className="pt-5 grid grid-cols-4 grid-rows-[min-content_1fr] h-[calc(100vh-8.75rem)]">
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        {/* <p className="text-xl font-header text-primary">System Change History Report</p> */}
                                        <p className="text-xs text-unactive font-text">Provides Course Admins with insights into learner progress, completion rates, assessment results, and overall course effectiveness, <br /> helping evaluate training impact and identify areas for improvement.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Reports */}
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
                                </div>
                            </div>
                            {/* Purpose: Evaluate overall course performance
                            Includes:

                            Course Title

                            Total Enrolled

                            Total Completed

                            Completion Rate (%)

                            Average Progress (%)

                            Average Time to Complete

                            Number of Learners who failed/passed

                            Retake Count (if enabled) */}
                        </>
                    )
                    : tab === "timeline" ? (
                        <>
                            <div className="pt-5 grid grid-cols-4 grid-rows-[min-content_1fr] h-[calc(100vh-8.75rem)]">
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        {/* <p className="text-xl font-header text-primary">System Change History Report</p> */}
                                        <p className="text-xs text-unactive font-text">Displays key course milestones, schedules, and learner activity timelines, enabling Course Admins to track deadlines, monitor participation trends, <br/> and manage course pacing effectively.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Reports */}
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
                                </div>
                            </div>
                            {/* Purpose: Track course timelines and overdue users
                            Includes:

                            Course Title

                            Start Date

                            End Date / Deadline

                            Users Past Deadline

                            Extension Granted (Yes/No)

                            Extended Date */}

                        </>
                    )
                    : tab === "certificate" ? (
                        <>
                        <div className="pt-5 grid grid-cols-4 grid-rows-[min-content_1fr] h-[calc(100vh-8.75rem)]">
                                {/* Header */}
                                <div className="flex flex-row justify-between gap-4 col-span-4">
                                    <div>
                                        {/* <p className="text-xl font-header text-primary">System Change History Report</p> */}
                                        <p className="text-xs text-unactive font-text">Shows a summary of learners who have earned certificates, including completion dates and certificate status, <br />allowing Course Admins to track certification rates and validate training accomplishments.</p>
                                    </div>
                                    <div className="border-2 border-primary py-2 px-10 rounded-md shadow-md font-header text-primary flex flex-row gap-2 items-center hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer">
                                        <FontAwesomeIcon icon={faFilePen}/>
                                        <p>Generate Report</p>
                                    </div>
                                </div>
                                {/* Reports */}
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
                                </div>
                            </div>
                            {/* Purpose: Track issued certificates
                            Includes:

                            Learner Name

                            Course Title

                            Certificate Issue Date

                            Certificate Expiry (if applicable)

                            Download Status (e.g., Downloaded/Not Yet Downloaded) */}
                        </>
                    )
                    : null
                }
            </div>
        </div>
    )
}

