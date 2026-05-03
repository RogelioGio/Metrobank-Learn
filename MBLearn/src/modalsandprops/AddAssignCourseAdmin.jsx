import { faChevronCircleRight, faChevronDown, faChevronLeft, faChevronRight, faFilter, faSearch, faSpinner, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { useCourseContext } from "../contexts/CourseListProvider";
import { useFormik } from "formik";
import Course from "../views/Course";
import CourseAssigningProps from "./CourseAssigingProps";
import * as Yup from 'yup';
import AssignCourseAdminModalSuccessfully from "./AssignCourseAdminSuccessfullyModal";
import { useOption } from "../contexts/AddUserOptionProvider"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet";
import { set } from "date-fns";
import CancelAssigningModal from "./CancelAssigning";

const usePagination = (data, itemPerpage = 2) => {
    const [currentPage, setCurrentPage] = useState(1);

    const indexFirstItem = (currentPage - 1) * itemPerpage;
    const indexLastItem = Math.min(indexFirstItem + itemPerpage, data?.length);
    const currentPaginated = data?.slice(indexFirstItem, indexLastItem)
    const totalPage = Math.ceil(data?.length / itemPerpage)
    const totalitem = data?.length

    //Pagination Controll
    const goto = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPage) setCurrentPage(pageNum);
    }
    const next = () => {
        // setCurrentPage((prev) => Math.min(prev + 1, totalPage));
        if (currentPage < totalPage) setCurrentPage(currentPage + 1)
    };

    const back = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return {
        currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back
    }
}




const AddAssignCourseAdmin = ({courseID ,open, close,}) => {

    const [loading, setLoading] = useState(false)
    const [cancelAssigning, setCancelAssigning] = useState(false)
    const [selectedBranches, setSelectedBranches] = useState([])
    const [filteredEmployee, setFilteredEmployee] = useState([])
    const [selectedCourseAdmin, setSelectedCourseAdmin] = useState([])
    const [result, setResults] = useState([])
    const [assiging, setAssigning] = useState(false)
    const [assigned, setAssigned] = useState(false)
    const [number, setNumber] = useState(0)
    const [openFilter, setOpenFilter] = useState(false)

    const {currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back} = usePagination(filteredEmployee,5)

    useEffect(()=>{
        setIsFiltered(false)
    },[])

    const [state, setState] = useState({
            departments:[],
            cities:[],
            branches:[]
        })
    const toggleState = (key, value) => {
        setState((prev) => ({
            ...prev,
            [key]: typeof value === "function" ? value(prev[key]) : value, // Support function-based updates
        }));
    };

    const formik = useFormik({
        initialValues: {
            division: '',
            department: '',
            section: '',
            branch: '',
            city: '',
        },
        onSubmit: (values) => {
            setLoading(true)
            console.log(values)
            axiosClient.get(`/get-available-course-admins/${courseID}?department_id[eq]=${values.department}&branch_id[eq]=${values.branch}&division_id[eq]=${values.division}&section_id[eq]=${values.section}`)
            .then((response) => {
                console.log(response.data.data)
                setFilteredEmployee(response.data.data)
                setLoading(false)
                setIsFiltered(true)
                setOpenFilter(false)
            })


            // setTimeout(() => {
            //     formik.handleSubmit();
            // }, 0);
        }
    })
    //Must be filter first
    const[isfiltered, setIsFiltered] = useState(false);

    // useEffect(()=>{
    //     formik.resetForm()
    //     setIsFiltered(false)
    //     setFilteredEmployee([])
    //     setSelectedCourseAdmin([])
    //     setLoading(false)
    // },[close])

    const handleBranchesOptions = (e) =>{
        const city = e.target.value;
        formik.setFieldValue('city', city)
        formik.setFieldValue('branch', '')
        console.log(city)
        console.log(location.city_id)


        //Filtering
        setSelectedBranches(location?.filter((l) => String(l.city_id) === String(city)));
    }

    const handleSelectedCourseAdmin = (e, user) => {
         // If event came from a checkbox, don't let it bubble to <tr>

        // We check manually if the item is already selected
        setSelectedCourseAdmin((prev) => {
            const exist = prev.some(
                (entry) => entry.user_id === user.id
            );

            if(exist) {
                return prev.filter((entry) => entry.user_id !== user.id);
            }else {
                return [...prev, {user_id: user.id}];
            }
        });

        setResults((prev) => {
            const exist = prev.some(
                (entry) => entry.id === user.id
            )
            if(exist) {
                return prev.filter((entry) => entry.id !== user.id);
            }else {
                return [...prev, user];
            }
        })
    }


    const handleAssigningCourseAdmin = () => {
        setAssigning(true)
        // axiosClient.post(`/assign-course-admin/${courseID}`, formattedData)
        // .then((response) => {
        //     console.log(response.data)
        //     setAssigning(false)
        //     setAssigned(true)
        //     setNumber(selectedCourseAdmin.length)
        // })
        // .catch((error) => {console.log(error)})
        //assign-course-admin/{course}'

        setTimeout(() => {
            setAssigning(false)
            setAssigned(true)
            setNumber(selectedCourseAdmin.length)
        },2000)
        console.log(selectedCourseAdmin);
        console.log(result)
    }

    const handleClose = () => {
        setAssigned(false)
        close();
        setTimeout(() => {
            setSelectedCourseAdmin([])
            setFilteredEmployee([])
            setResults([])
        },500)
    }

    const items = () => {
        return (
                                            <div className="flex flex-row items-center justify-end md:col-start-4">
                                    <Sheet open={openFilter} onOpenChange={setOpenFilter}>
                                        <SheetTrigger className="h-full">
                                            <div className="group relative h-full">
                                                <div className={`w-10 h-10 border-2 border-primary rounded-md flex items-center justify-center hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                                md:w-fit md:h-full md:px-4 md:flex gap-2
                                                                ${filteredEmployee.length > 0 ? "bg-primary text-white" : "bg-white text-primary"}`}>
                                                    <FontAwesomeIcon icon={faFilter} className="text-lg" />
                                                    <p className="font-header text-base hidden md:block">Filter</p>
                                                </div>
                                                <div className={`md:hidden scale-0 group-hover:scale-100 whitespace-nowrap font-text text-xs p-2 rounded bg-tertiary text-white absolute left-1/2 -translate-x-1/2 -bottom-9 shadow-md transition-all ease-in-out`}>
                                                    <p>Filter</p>
                                                </div>
                                            </div>
                                        </SheetTrigger>
                                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                                        <SheetContent className="h-full flex-col flex">
                                            <SheetTitle className="text-primary font-header text-lg">Course Admin Filter</SheetTitle>
                                            <SheetDescription className="text-unactive font-text text-xs">Select option to categorize and filter the given entries</SheetDescription>

                                            <>
                                            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(e); }} className="flex flex-col gap-2">
                                                {/* Division */}
                                                <div>
                                                    <label htmlFor="division" className="font-text text-xs col-start-1">Division</label>
                                                    <div class="grid grid-cols-1 w-full row-start-1">
                                                        <select id="division" name="division" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.division}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Division</option>
                                                        {division?.map((division) => (
                                                            <option key={division.id} value={division.id}>{division.division_name}</option>
                                                        ))}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="department" className="font-text text-xs">Department</label>
                                                    <div class="grid grid-cols-1 w-full row-start-1 ">
                                                        <select id="department" name="department" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.department}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Department</option>
                                                        {departments.map((department) => (
                                                            <option key={department.id} value={department.id}>{department.department_name}</option>
                                                        ))}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="section" className="font-text text-xs">Section</label>
                                                    <div class="grid grid-cols-1 w-full row-start-1 ">
                                                        <select id="section" name="section" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.section}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Section</option>
                                                        {section?.map((section) => (
                                                            <option key={section.id} value={section.id}>{section.section_name}</option>
                                                        ))}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="city" className="font-text text-xs">Branch City</label>
                                                    <div class="grid grid-cols-1 w-full col-start-4 row-start-1 ">
                                                        <select id="city" name="city" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.city}
                                                            onChange={handleBranchesOptions}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Branch City</option>
                                                                {cities.map((city) => (
                                                                    <option key={city.id} value={city.id}>{city.city_name}</option>
                                                                ))}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="department" className="font-text text-xs">Branch Location</label>
                                                    <div class="grid grid-cols-1 w-full col-start-5 row-start-1">
                                                        <select id="branch" name="branch" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.branch}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Branch Location</option>
                                                                {selectedBranches.map((branch) => (
                                                                    <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                                                ))}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </form>
                                            <div className={`font-header bg-primary text-white border-2 border-primary rounded-md p-3 mt-4 flex flex-row gap-2 justify-center items-center  transition-all ease-in-out
                                                            ${loading ? "opacity-50 hover:cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white"}`}
                                                onClick={() => {
                                                        if(loading) return;
                                                        formik.handleSubmit()
                                                    }}>
                                                {
                                                    loading ?
                                                    <div className="flex flex-row items-center gap-2">
                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                                        <p>Filtering</p>
                                                    </div>:
                                                    <p>Filter</p>
                                                }

                                            </div>
                                            </>

                                        </SheetContent>
                                    </Sheet>
                                </div>
        )
    }

    return(
        <>
        <Dialog open={open} onClose={()=>{}}>
        <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-20"/>
            <div className='fixed inset-0 z-20 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[80vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                           {/* Header */}
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Add Assigned Course Admins</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Manage all current assigned course and add selected course admin to the selected course</p>
                                </div>
                                <div>
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                                    onClick={() => {
                                                        if(selectedCourseAdmin.length > 0) {
                                                            setCancelAssigning(true);
                                                            return
                                                        }
                                                        close();
                                                        setTimeout(() => {
                                                            formik.resetForm();
                                                            setFilteredEmployee([]);
                                                        },500)
                                                    }}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2 px-4 grid grid-cols-4 gap-2">
                                <div className="col-span-3
                                                md:col-span-2">
                                    <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                                        <div className='bg-primary py-2 px-4 text-white'>
                                            <FontAwesomeIcon icon={faSearch}/>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Table */}
                            <div className="px-4">
                                <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                    <table className='text-left w-full overflow-y-scroll'>
                                        <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                            <tr>
                                                <th className='py-4 px-4'>EMPLOYEE NAME</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>DIVISION</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>DEPARTMENT</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>SECTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-divider'>
                                            {
                                                loading ? (
                                                    <tr className="font-text text-sm hover:bg-gray-200">
                                                        <td colSpan={6} className="text-center py-3 px-4 font-text text-primary">
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2"/>
                                                            Loading Eligable Course Admins...
                                                        </td>
                                                    </tr>
                                                ) : filteredEmployee.length > 0 ?
                                                    currentPaginated.map((employee) => (
                                                        <CourseAssigningProps
                                                                    key={employee.id}
                                                                    isfiltered={isfiltered}
                                                                    id = {employee.id}
                                                                    handleInput={handleSelectedCourseAdmin}
                                                                    name={`${employee.first_name} ${employee.middle_name || ""} ${employee.last_name} ${employee.name_suffix || ""}`.trim()}
                                                                    loading={loading}
                                                                    employeeID={employee.employeeID || "Not Available"}
                                                                    division={employee.division?.division_name || "Not Available"}
                                                                    department={employee.department?.department_name || "Not Available"}
                                                                    section={employee.section?.section_name || "Not Available"}
                                                                    title={employee.title?.title_name || "Not Available"}
                                                                    branch={employee.branch?.branch_name || "Not Available"}
                                                                    city={employee.city?.city_name || "Not Available"}
                                                                    profile_image={employee?.profile_image || "Not Available"}
                                                                    selectedCourseAdmin={selectedCourseAdmin.some((entry) => entry.user_id === employee.id)}
                                                                    user={employee}
                                                                />
                                                    ))
                                                :
                                                <tr className="font-text text-xs md:text-sm hover:bg-gray-200">
                                                    <td colSpan={6} className="text-center md:py-3 md:px-4 font-text text-primary
                                                                                py-5">
                                                        Filter first the course admin you want to add for the course
                                                    </td>
                                                </tr>

                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Pagination */}
                            {
                                filteredEmployee.length === 0 ? null :
                                <div className="px-4 py-2 flex flex-row justify-between items-center">
                                                <div className='flex flex-row items-center gap-2'>
                                                    {
                                                        loading ?
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-primary" />
                                                            <p className='text-sm font-text text-unactive'>
                                                                Retrieving Course Admins...
                                                            </p>
                                                        </>:
                                                        <p className='text-sm font-text text-unactive'>
                                                            Showing <span className='font-header text-primary'>{indexFirstItem + 1}</span> to <span className='font-header text-primary'>{indexLastItem}</span> of <span className='font-header text-primary'>{totalitem}</span> <span className='text-primary'>results</span>
                                                        </p>
                                                    }
                                                </div>
                                                    <div>
                                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                                            {/* Previous */}
                                                            <a
                                                                onClick={back}
                                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                                            </a>

                                                            {/* Current Page & Dynamic Paging */}
                                                            {
                                                                Array.from({length: totalPage}, (_, i) => (
                                                                    <a key={i}
                                                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                            ${
                                                                                currentPage === i+1
                                                                                ? 'bg-primary text-white'
                                                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                            } transition-all ease-in-out`}
                                                                            onClick={() => goto(i+1)}>
                                                                        {i+1}</a>
                                                                ))
                                                            }


                                                            <a
                                                                onClick={next}
                                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                                <FontAwesomeIcon icon={faChevronRight}/>
                                                            </a>
                                                        </nav>
                                                    </div>
                                            </div>
                            }

                            {/* Action */}
                            <div className={`flex flex-row justify-between gap-2 mx-4 ${filteredEmployee.length === 0 ? "py-2" : "pb-2"}`}>
                                <div className={`font-header border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary transition-all ease-in-out ${assiging ? "opacity-50 hover:cursor-not-allowed" : "hover:border-primaryhover hover:bg-primaryhover"}`}
                                    onClick={() => {
                                        if(assigning) return;
                                        handleClose();
                                    }}>
                                    <p>Cancel</p>
                                </div>
                                <div className={`items-center justify-center font-header border-2 border-primary rounded-md py-3 w-full flex flex-row shadow-md bg-primary text-white transition-all ease-in-out ${selectedCourseAdmin.length === 0 || assiging ? "opacity-50 hover:cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover "}`}
                                    onClick={() => {
                                        if(selectedCourseAdmin.length === 0) return;
                                        handleAssigningCourseAdmin();
                                    }}>
                                    {
                                        assiging ?
                                        <>
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        <p>Assigning...</p>
                                        </>
                                        : <p>Assign</p>
                                    }

                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
    </Dialog>
    <AssignCourseAdminModalSuccessfully open={assigned} close={handleClose} number={number} result={result}/>
    <CancelAssigningModal open={cancelAssigning} close={() => setCancelAssigning(false)} discardChanges={()=>{setCancelAssigning(false), handleClose()}}/>
    </>
    )
};

export default AddAssignCourseAdmin;
