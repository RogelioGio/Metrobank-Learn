import { faChevronLeft, faChevronRight, faFilter, faSearch, faTrash, faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useState } from "react";
import axiosClient from "../axios-client";
import { useOption } from "../contexts/AddUserOptionProvider";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"
import EditCourseAdminPermissionModal from "./EditCourseAdminPermissionModal";

const CourseCourseAdminAssignmentProps = ({courseID}) => {
    const [assigned, setAssigned] = useState([])
    const [loading, setLoading] = useState()
    const {cities, departments, titles, location, division, section} = useOption();
    const [filter, setFilter] = useState(false)
    const [main, setMain] = useState([])
    const [editCoursePermission, setEditCoursePermission] = useState(false)
    const [courseAdmin, setCourseAdmin] = useState()

    // Function to get the assigned
    const fetchAssignedCourseAdmins = () => {
        setLoading(true)
        axiosClient.get(`assigned-course-admins/${courseID.id}`,
            {
                params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage
                }
            }
        )
        .then(({data}) => {
            setAssigned(data.data)
            setMain(data.main)
            pageChangeState('total', data.total)
                pageChangeState('lastPage', data.lastPage)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }

    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 5,
        total: 0,
        lastPage:1,
        startNumber: 0,
        endNumber: 0,
        currentPerPage:0
    });

    const pageChangeState = (key, value) => {
        setPagination ((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    useEffect(() => {
            pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
            pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.total))
        },[pageState.currentPage, pageState.perPage, pageState.total])

        //Next and Previous
        const back = () => {
            if (learnerLoading) return;
            if (pageState.currentPage > 1){
                pageChangeState("currentPage", pageState.currentPage - 1)
                pageChangeState("startNumber", pageState.perPage - 4)
            }
        }
        const next = () => {
            if (learnerLoading) return;
            if (pageState.currentPage < pageState.lastPage){
                pageChangeState("currentPage", pageState.currentPage + 1)
            }
        }

        const Pages = [];
        for(let p = 1; p <= pageState.lastPage; p++){
            Pages.push(p)
        }

        const pageChange = (page) => {
            if(learnerLoading) return;
            if(page > 0 && page <= pageState.lastPage){
                pageChangeState("currentPage", page)
            }
        }

    useEffect(()=>{
        fetchAssignedCourseAdmins()
    },[])

    return (
        <>
        <div className='grid grid-rows-[min-content_min-content_1fr_min-content] md:grid-rows-[min-content_1fr_min-content] grid-cols-4 md:pr-2 h-full'>
            {/* Header */}
            <div className='flex flex-col gap-1 pt-2 pb-3 col-span-4 px-3
                            lg:col-span-1
                            md:col-span-2 md:col-start-1 md:row-start-1 lg:px-0'>
                <p className='text-xs font-text text-unactive'>Main Course Admin:</p>
                <div className="flex flex-row gap-2 items-center">
                    {!loading ?
                    <>
                        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full overflow-hidden">
                            <img src={main[0]?.profile_image} alt=""  className="w-full"/>
                        </div>
                        <div>
                            <p className="font-header text-sm text-primary">{main[0]?.first_name} {main[0]?.middle_name || " "} {main[0]?.last_name}</p>
                            <p className="font-text text-unactive text-xs">ID: {main[0]?.employeeID}</p>
                        </div>
                    </>:<>
                        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full overflow-hidden animate-pulse"/>
                        <div>
                            <p className="font-header text-sm text-primary bg-gray-300 rounded-full w-40 h-4 animate-pulse"></p>
                            <p className="font-text text-unactive text-xs bg-gray-300 rounded-full w-20 h-3 mt-1 animate-pulse"></p>
                        </div>
                    </> }
                </div>
            </div>
            <div className='flex px-3 items-center col-start-1
                            md:justify-end md:col-start-3 md:pr-2'>
                <div className='w-10 h-10 bg-white border-2 border-primary rounded-md shadow-md flex items-center justify-center hover:cursor-pointer text-primary hover:bg-primary hover:text-white transition-all ease-in-out'>
                    <FontAwesomeIcon icon={faFilter} className='text-lg'/>
                </div>
            </div>
            <div className='col-start-3 col-span-2 flex flex-row justify-end items-center pt-1 pb-2 pr-3
                            md:col-span-1 md:col-start-4 md:p-0'>
                <div className='w-full'>
                    <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                    <div className='bg-primary py-2 px-4 text-white'>
                        <FontAwesomeIcon icon={faSearch}/>
                    </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="col-span-4 px-3
                            lg:px-0">
                <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                    <table className='w-full text-left'>
                        <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                            <tr>
                                <th className='py-4 px-4 flex items-center flex-row gap-4'>
                                    {/* Checkbox */}
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                                type="checkbox"
                                                // ref={selectAllRef}
                                                className="col-start-1 row-start-1 appearance-none border border-primary rounded checked:border-primary checked:bg-primary indeterminate:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                                // onChange={handleSelectAll}
                                                // checked={checkedUsers.length === users.length && users.length > 0}
                                                // disabled={isLoading}
                                            />
                                            {/* Custom Checkbox styling */}
                                            <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                                {/* Checked */}
                                                <path
                                                    d="M3 8L6 11L11 3.5"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="opacity-0 group-has-[:checked]:opacity-100"
                                                />
                                                {/* Indeterminate */}
                                                <path
                                                    d="M3 7H11"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                                    />
                                            </svg>
                                        </div>
                                        <p> EMPLOYEE NAME</p>
                                        </th>
                                        <th className='py-4 px-4 hidden lg:table-cell'>DIVISION</th>
                                        <th className='py-4 px-4 hidden lg:table-cell'>DEPARTMENT</th>
                                        <th className='py-4 px-4 hidden lg:table-cell'>SECTION</th>
                                        <th className='py-4 px-4 hidden lg:table-cell'></th>
                                    </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-divider">
                            {
                                loading ? (
                                    Array.from({length: 5}).map((_, index) => (
                                        <tr key={index} className={`animate-pulse font-text text-sm hover:bg-gray-200`}>
                                        <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out`}>
                                            <div className='flex items-center gap-2 flex-row'>
                                                {/* Checkbox */}
                                                <div className="group grid size-4 grid-cols-1">
                                                    <input type="checkbox"
                                                        className="col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                                        disabled
                                                    />
                                                    {/* Custom Checkbox styling */}
                                                </div>
                                                {/* User Image */}
                                                <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                                    {/* <img src={profile_url} alt="" className='rounded-full'/> */}
                                                </div>
                                                {/* Name and employee-id*/}
                                                <div className="flex flex-col">
                                                    <p className="font-header text-sm text-primary bg-gray-300 rounded-full w-40 h-4 animate-pulse"></p>
                                                    <p className="font-text text-unactive text-xs bg-gray-300 rounded-full w-20 h-3 mt-1 animate-pulse"></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell py-3 px-4">
                                            <p className="font-header text-sm text-primary bg-gray-300 rounded-full w-32 h-4 animate-pulse"></p>
                                            <p className="font-text text-unactive text-xs bg-gray-300 rounded-full w-16 h-3 mt-1 animate-pulse"></p>
                                        </td>
                                        <td className="hidden lg:table-cell py-3 px-4">
                                            <p className="font-header text-sm text-primary bg-gray-300 rounded-full w-32 h-4 animate-pulse"></p>
                                            <p className="font-text text-unactive text-xs bg-gray-300 rounded-full w-16 h-3 mt-1 animate-pulse"></p>
                                        </td>
                                        <td className="hidden lg:table-cell py-3 px-4">
                                            <p className="font-header text-sm text-primary bg-gray-300 rounded-full w-32 h-4 animate-pulse"></p>
                                            <p className="font-text text-unactive text-xs bg-gray-300 rounded-full w-16 h-3 mt-1 animate-pulse"></p>
                                        </td>
                                        <td className="hidden lg:table-cell py-3 px-4">
                                            <div className="flex flex-row item-center justify-end items-center gap-2 pr-3">
                                                <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
                                                <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
                                            </div>
                                        </td>
                                        </tr>
                                    ))
                                ): assigned.length === 0 ? (
                                    <tr className='font-text text-sm hover:bg-gray-200'>
                                        <td colSpan={5} className='text-center text-unactive py-3 px-4'>
                                            No Assigned Course Admin
                                        </td>
                                    </tr>
                                ): assigned.map((admin, index) => (
                                    <tr key={index} className={`font-text text-sm hover:bg-gray-200`}>
                                        <td className={`text-sm py-3 px-4 border-l-2 border-transparent transition-all ease-in-out`}>
                                            <div className='items-center gap-4 flex-row hidden lg:flex'>
                                                {/* Checkbox */}
                                                <div className="group grid size-4 grid-cols-1">
                                                    <input type="checkbox"
                                                        className="col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                                        // onClick={(e) => e.stopPropagation()}
                                                        // onChange={(e) => {
                                                        //     handleCheckbox(e, userID);
                                                        // }}
                                                        // checked={isChecked} // Updated this line
                                                    />
                                                    {/* Custom Checkbox styling */}
                                                    <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                                        {/* Checked */}
                                                        <path
                                                            d="M3 8L6 11L11 3.5"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                                        />
                                                        {/* Indeterminate */}
                                                        <path
                                                            d="M3 7H11"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                                            />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-row items-center gap-4">
                                                    <div className='h-10 w-10 rounded-full flex flex-col justify-center items-center'>
                                                        <img src={admin.profile_image} alt="" className='rounded-full w-full'/>
                                                    </div>
                                                    {/* Name and employee-id*/}
                                                    <div>
                                                        <p className='font-text'>{admin.first_name} {admin.middle_name} {admin.last_name} {admin.name_suffix}</p>
                                                        <p className='text-unactive text-xs'>ID: {admin.employeeID}</p>
                                                    </div>
                                                </div>
                                                {/* User Image */}
                                            </div>
                                            <div className='items-center gap-2 grid lg:hidden grid-cols-[min-content_auto_auto_auto] grid-rows-2'>
                                                <div className="group grid size-4 grid-cols-1">
                                                    <input type="checkbox"
                                                        className="col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                                        // onClick={(e) => e.stopPropagation()}
                                                        // onChange={(e) => {
                                                        //     handleCheckbox(e, userID);
                                                        // }}
                                                        // checked={isChecked} // Updated this line
                                                    />
                                                    {/* Custom Checkbox styling */}
                                                    <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                                        {/* Checked */}
                                                        <path
                                                            d="M3 8L6 11L11 3.5"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                                        />
                                                        {/* Indeterminate */}
                                                        <path
                                                            d="M3 7H11"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                                            />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-row gap-4 items-center col-span-2">
                                                    <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                                        <img src={admin.profile_image} alt="" className='rounded-full'/>
                                                    </div>
                                                    {/* Name and employee-id*/}
                                                    <div>
                                                        <p className='font-text'>{admin.first_name} {admin.middle_name} {admin.last_name} {admin.name_suffix}</p>
                                                        <p className='text-unactive text-xs'>ID: {admin.employeeID}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-start justify-end h-full gap-1">
                                                    <div className="flex justify-center items-center aspect-square p-2 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white"
                                                        onClick={()=>{setEditCoursePermission(true), setCourseAdmin(admin)}}>

                                                        <FontAwesomeIcon icon={faPenToSquare}/>
                                                    </div>
                                                    <div className="flex justify-center items-center aspect-square p-2 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white">
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                    </div>
                                                </div>



                                                <div className='col-start-2 flex flex-col justify-start'>
                                                    <p className='text-black text-xs'>{admin.division.division_name}</p>
                                                    <p className='text-xs font-text text-unactive'>Division</p>
                                                </div>
                                                <div className='col-start-3 flex flex-col justify-start'>
                                                    <p className='text-black text-xs '>{admin.department?.department_name}</p>
                                                    <p className='text-xs font-text text-unactive'>Department</p>
                                                </div>
                                                <div className='col-start-4 flex flex-col justify-start'>
                                                    <p className='text-black text-xs'>{admin.section?.section_name}</p>
                                                    <p className='text-xs font-text text-unactive'>Section</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <p className='text-unactive'>{admin.division.division_name}</p>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <p className='text-unactive'>{admin.department?.department_name}</p>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <p className='text-unactive'>{admin.section?.section_name}</p>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <div className="flex flex-row item-center justify-end h-full gap-1">
                                                <div className="flex justify-center items-center aspect-square p-2 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white"
                                                    onClick={()=>{setEditCoursePermission(true), setCourseAdmin(admin)}}>

                                                    <FontAwesomeIcon icon={faPenToSquare}/>
                                                </div>
                                                <div className="flex justify-center items-center aspect-square p-2 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white">
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                </div>
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
            <div className='flex flex-row items-center justify-between col-span-4 pb-2 pt-2 px-3'>
                <p className='text-sm font-text text-unactive'>
                    Showing <span className='font-header text-primary'>1</span> to <span className='font-header text-primary'>2</span> of <span className='font-header text-primary'>5</span> <span className='text-primary'>results</span>
                </p>
                <div>
                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                        {/* Previous */}
                        <a
                            onClick={back}
                            className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </a>

                        {/* Current Page & Dynamic Paging */}
                        {Pages.map((page)=>(
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
                        ))}
                        <a
                            onClick={next}
                            className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </a>
                    </nav>
                </div>
            </div>
        </div>

        <EditCourseAdminPermissionModal  open={editCoursePermission} onClose={()=>{setEditCoursePermission(false)}} courseAdmin={courseAdmin}/>
        </>
    )
}
export default CourseCourseAdminAssignmentProps;
