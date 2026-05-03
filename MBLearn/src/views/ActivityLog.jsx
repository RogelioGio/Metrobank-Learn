import { faArrowUpAZ, faArrowDownZA, faSort, faArrowUpWideShort, faArrowDownShortWide, faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet"
import axiosClient from "../axios-client";
import dayjs from "dayjs";
import React from "react";


export default function ActivityLog() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);

    useEffect(()=> {
        axiosClient.get('/index-logs')
        .then(({data}) => {
            setLogs(data)
            setLoading(false)
        })
        .catch((err) => {console.log(err)})
    },[])

    // Fetching Activities
    return (
        <div className='grid  grid-cols-4 grid-rows-[6.25rem_min-content_auto_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Activity Log</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-4 row-span-1 border-b mx-5 border-divider'>
                <h1 className='text-primary text-4xl font-header'>Activity Log</h1>
                <p className='font-text text-sm text-unactive' >A detailed record of user actions and system events for monitoring and auditing purposes..</p>
            </div>

            {/* Record Sorter, Filter & Search */}
            <div className='row-start-2 col-start-1  col-span-4 inline-flex flex-row justify-between items-center px-5 py-3 h-fit gap-3'>
                <div>
                    <div className={`flex flex-row items-center border-2 border-primary py-2 px-4 font-header bg-secondarybackground rounded-md text-primary gap-2 w-fit hover:bg-primary hover:text-white hover:scale-105 hover:cursor-pointer transition-all ease-in-out shadow-md `}>
                        <p>Record Date</p>
                        <FontAwesomeIcon icon={faSort}/>
                    </div>
                </div>
                <div>
                    <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                        <div className='bg-primary py-2 px-4 text-white'>
                            <FontAwesomeIcon icon={faSearch}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Record Table */}
            <div className='flex flex-col gap-2 row-start-3 row-span-2 col-start-1 col-span-4 px-5 py-2'>
                <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                <table className='text-left w-full overflow-y-scroll'>
                    <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                        <tr>
                            <th className='w-1/4 py-4 px-4 uppercase'>Time Stamp</th>
                            <th className='w-1/4 py-4 px-4 uppercase'>User in-charge</th>
                            <th className='w-2/4 py-4 px-4 uppercase'>Action Description</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-divider'>
                        {
                            loading ? (
                                // Skeleton
                                Array.from({length: 8}).map((_, i)=> (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-3 px-4">
                                        <div className="h-5 bg-gray-300 rounded-full w-3/4"></div>
                                        </td>
                                        <td className="py-3 px-4">
                                        <div className="h-5 bg-gray-300 rounded-full w-3/4"></div>
                                        </td>
                                        <td className="py-3 px-4">
                                        <div className="h-5 bg-gray-300 rounded-full w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) :
                            (
                                logs.map(logEntry => {
                                    return (
                                        <tr key={logEntry.id} className="font-text text-sm hover:bg-gray-200">
                                            <td className="text-sm text-unactive py-3 px-4">{dayjs(logEntry.created_at).format('MMMM D, YYYY - HH:mm:ss')}</td>
                                            <td className="text-sm text-unactive py-3 px-4">Name - Employee ID</td>
                                            <td className="text-sm text-unactive py-3 px-4">{logEntry?.description} - {logEntry?.target}</td>
                                        </tr>
                                    );
                                })
                            )
                        }
                    </tbody>
                </table>

                </div>
            </div>

            {/* Pagenation */}
            <div className='row-start-4 row-span-1 col-start-1 col-span-4 border-t border-divider mx-5 py-3 flex flex-row items-center justify-between'>
                {/* Total number of entries and only be shown */}
                <div>
                    <p className='text-sm font-text text-unactive'>
                        Showing <span className='font-header text-primary'>1</span> to <span className='font-header text-primary'>2</span> of <span className='font-header text-primary'>3</span> <span className='text-primary'>results</span>
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
                        <a
                            //onClick={next}
                            className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    )
}
