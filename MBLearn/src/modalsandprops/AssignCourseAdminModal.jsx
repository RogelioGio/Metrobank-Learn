import { faChevronDown, faFilter, faTrashCan, faUserPen, faUserPlus, faCircleXmark as solidXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import AddAssignCourseAdmin from "./AddAssignCourseAdmin";
import { useCourseContext } from "../contexts/CourseListProvider";
import { faCircleXmark as regularXmark } from "@fortawesome/free-regular-svg-icons";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useCourse } from "../contexts/selectedcourseContext";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    } from "../components/ui/drawer"

const AssignCourseAdmin = ({courseID ,open, close}) => {
    const {departments, cities, branches, } = useCourseContext()
    //const {selectedCourse, selectCourse, isFetching} = useCourse();
    const [isLoading, setLoading] = useState(true);
    const [course, setCourse] = useState();
    const [AssignedCourseAdmins, setAssignedCourseAdmins] = useState([]);
    const [hover, setHover] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState([])

    const toggleState = (key, value) => {
        setState((prev) => ({
            ...prev,
            [key]: typeof value === "function" ? value(prev[key]) : value, // Support function-based updates
        }));
    };

    useEffect(() => {
        if (open && courseID) {
            if (selectedCourse?.id === courseID) {
                setLoading(false);

            } else {
                setLoading(true);
                selectCourse(courseID);
            }
        }
    }, [courseID, selectedCourse, open]);
    useEffect(() => {
        if (selectedCourse && !isFetching) {
            setLoading(false);
        }
    }, [selectedCourse, isFetching]);

    useEffect(() => {
        setLoading(isFetching);
    }, [isFetching]);

    useEffect(()=>{
        setCourse(selectedCourse)
        setAssignedCourseAdmins(selectedCourse?.assigned_course_admins)
    },[selectedCourse])

    //Add Course Admin
    const [isOpen, setIsOpen] = useState(false)

    // const fetchAssignedCourseAdmins = () => {
    //     setLoading(true)
    //     axiosClient.get(`assigned-course-admins/${courseID}`)
    //     .then(({data}) => {
    //         setAssignedCourseAdmins(data.data)
    //         setLoading(false);
    //         console.log(data.data)
    //     }).catch((err) => {
    //         console.log(err)
    //     })
    // }

    const handleBranchesOptions = (e) =>{
        const city = e.target.value;
        formik.setFieldValue('city', city)
        formik.setFieldValue('branch', '')

        //Filtering
        const filteredBranches = branches.filter((branch) => branch.city_id.toString() === city)
        setSelectedBranches(filteredBranches)
    }
    const formik = useFormik({
        initialValues: {
            department: '',
            branch: '',
            city: '',
        },
        validationSchema: Yup.object({
            department: Yup.string(),
            branch: Yup.string(),
            city: Yup.string(),
        }),
        onSubmit: (values) => {
            console.log(values)
        }
    })


    return (
        <>
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-10"/>
            <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md w-3/4 bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pt-6  pb-4 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header text-3xl">Assigned Course Admins</h1>
                                    <p className="text-unactive font-text text-md">Manage all current assigned course and add selected course admin to the selected course</p>
                                </div>
                                <div className={`text-primary border-2 border-primary h-full py-2 px-4 rounded-md shadow-md flex flex-row gap-2 items-center self-center transition-all ease-in-out hover:scale-105 hover:bg-primary hover:text-white ${isLoading ? 'cursor-progress':'cursor-pointer'}`} onClick={()=>{isLoading ? null : setIsOpen(true);}}>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <p className="font-header">Assign Course Admin</p>
                                </div>
                                {/* Close Button */}
                                <div className='absolute flex justify-end text-2xl right-5 top-5'>
                                    <FontAwesomeIcon icon={hover ? solidXmark:regularXmark} className='text-primary transition-all ease-in-out transform hover:scale-110 cursor-pointer' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={close}/>
                                </div>
                            </div>
                            {/* Selected Course */}
                            <div className="mx-4 py-2">
                                <p className="font-text text-unactive text-sm">Selected Course:</p>
                                <p className="font-header text-primary text-xl">{course?.name || "Loading.."}</p>
                                <p className="font-text text-xs text-primary">Course ID: </p>
                            </div>
                            {/* Content */}
                            <div className="grid mx-4 pb-4 space-y-2">
                                {/* Fiter Category */}
                                <div className="grid grid-rows-1 grid-cols-6 gap-2">
                                    {/* Header */}
                                    <Drawer>
                                        <DrawerTrigger asChild>
                                            <button className="py-2 font-header text-primary flex flex-row gap-2 justify-center items-center border-2 border-primary p-2 rounded-md shadow-md hover: cursor-pointer hover:scale-105 transition-all ease-in-out hover:bg-primaryhover hover:text-white">
                                                <FontAwesomeIcon icon={faFilter}/>
                                                <p>Filter</p>
                                            </button>
                                        </DrawerTrigger>
                                        <DrawerContent>
                                            <div className="mx-auto w-full p-5">
                                                <DrawerHeader className="pb-2">
                                                    <DrawerTitle>
                                                        <p className="font-header text-primary">
                                                            Course Admin Filter
                                                        </p>
                                                    </DrawerTitle>
                                                    <DrawerDescription>
                                                        <p className="text-xs font-text">
                                                            Select option to categorize and filter the given entries
                                                        </p>
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                <div>
                                                <form onSubmit={formik.handleSubmit} className="row-start-2 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-x-1">
                                                    {/* Division */}
                                                    <div class="grid grid-cols-1 w-full row-start-1">
                                                        <select id="division" name="division" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.division}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Division</option>
                                                        {/* {departments.map((department) => (
                                                            <option key={department.id} value={department.id}>{department.department_name}</option>
                                                        ))} */}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <label htmlFor="division" className="font-text text-unactive text-sm col-start-1 pb-4">Division</label>
                                                    {/* Department */}
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
                                                    <label htmlFor="department" className="font-text text-unactive text-sm col-start-2 pb-4">Department</label>
                                                    {/* Section */}
                                                    <div class="grid grid-cols-1 w-full row-start-1 ">
                                                        <select id="section" name="section" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                            value={formik.values.section}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        >
                                                        <option value="">Select a Section</option>
                                                        {/* {departments.map((department) => (
                                                            <option key={department.id} value={department.id}>{department.department_name}</option>
                                                        ))} */}
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <label htmlFor="department" className="font-text text-unactive text-sm col-start-3 pb-4">Section</label>
                                                    {/* City */}
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
                                                    <label htmlFor="department" className="font-text text-unactive text-sm col-start-4 row-start-2">Branch City</label>
                                                    {/* Location */}
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
                                                    <label htmlFor="department" className="font-text text-unactive text-sm col-start-5 row-start-2">Branch Location</label>
                                                    <button type="submit" className="aspect-square col-start-6 row-start-1  flex flex-row gap-2 justify-center items-center border-2 border-primary p-2 rounded-md shadow-md bg-primary hover: cursor-pointer hover:scale-105 transition-all ease-in-out hover:bg-primaryhover hover:text-white">
                                                        <FontAwesomeIcon icon={faFilter} className="text-white"/>
                                                    </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </DrawerContent>
                                    </Drawer>
                                </div>

                                <div>
                                    {/* Course Admin Table */}
                                    <div className="py-1">
                                        <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                            <table className='text-left w-full overflow-y-scroll'>
                                                <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                                    <tr>
                                                        <th className='py-4 px-4'>EMPLOYEE NAME</th>
                                                        <th className='py-4 px-4'>DEPARTMENT</th>
                                                        <th className='py-4 px-4'>BRANCH</th>
                                                        <th className='py-4 px-4'></th>
                                                    </tr>
                                                </thead>
                                                <tbody className='bg-white divide-y divide-divider'>
                                                    {
                                                        isLoading ? (
                                                            <tr className="font-text text-sm hover:bg-gray-200">
                                                            <td colSpan={4} className="text-center py-3 px-4 font-text text-primary">
                                                                Loading...
                                                            </td>
                                                            </tr>
                                                        ) : (
                                                                AssignedCourseAdmins?.map((courseadmins) => (
                                                                    <tr className='font-text text-sm hover:bg-gray-200'>
                                                            <td className='text-sm  py-3 px-4'>
                                                                <div className='flex items-center gap-2'>
                                                                    {/* User Image */}
                                                                    <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                                                        <img src={courseadmins?.profile_image} alt="" className='rounded-full'/>
                                                                    </div>
                                                                    {/* Name and employee-id*/}
                                                                    <div>
                                                                        <p className='font-text'>{`${courseadmins?.first_name} ${courseadmins?.middle_name} ${courseadmins?.last_name} ${courseadmins?.name_suffix || ""}`.trim()}</p>
                                                                        <p className='text-unactive text-xs'>ID: {courseadmins?.employeeID}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className='py-3 px-4'>
                                                                <div className='flex flex-col'>
                                                                    {/* Department */}
                                                                    <p className='text-unactive'>{courseadmins?.department?.department_name}</p>
                                                                    {/* Title */}
                                                                    <p className='text-unactive text-xs'>{courseadmins?.title?.title_name}</p>
                                                                </div>
                                                            </td>
                                                            <td className='py-3 px-4'>
                                                                <div className='flex flex-col'>
                                                                {/* Branch Location */}
                                                                <p className='text-unactive'>{courseadmins?.branch?.branch_name}</p>
                                                                {/* City Location */}
                                                                <p className='text-unactive text-xs'>{courseadmins?.branch?.city?.city_name}</p>
                                                                </div>
                                                            </td>
                                                            {/* Action */}
                                                            <td className='py-3 px-4 flex justify-end'>
                                                                    <FontAwesomeIcon icon={faTrashCan} className="p-3 border border-primary rounded-md text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all ease-in-out hover:cursor-pointer"/>
                                                            </td>

                                                        </tr>

                                                                ))


                                                        )
                                                    }

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
        <AddAssignCourseAdmin courseID={courseID} open={isOpen} close={()=> setIsOpen(false)}/>
        </>
    );
}
export default AssignCourseAdmin;
