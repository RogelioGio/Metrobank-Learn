import { Helmet } from "react-helmet";
import { ScrollArea } from "../components/ui/scroll-area";
import { faSave, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useOption } from "../contexts/AddUserOptionProvider";
const AccountSettings = () => {
    const {user} = useStateContext();
    const {division, departments, section, cities, location} = useOption();

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: user.user_infos.first_name,
            middleName: user.user_infos.middle_name,
            lastName: user.user_infos.last_name,
            suffix: user.user_infos.name_suffix,
            employeeID: user.user_infos.employeeID,
            division: user.user_infos.division_id,
            department_id: user.user_infos.department_id,
            section: user.user_infos.section_id,
            city_id: user.user_infos.city.id,
            branch_id: user.user_infos.branch_id,
        },
        validationSchema: Yup.object({
            employeeID: Yup.string().required('required *').matches(/^\d+$/, 'Numbers only').length(11, 'Employee ID must be exactly 11 characters'),
        })
    })

    const [selectedBranches, setSelectedBranches] = useState();
    const handleBranchesOptions = (e, City) => {
        const city = e.target.value;

        formik.setFieldValue('city_id', city)
        formik.setFieldValue('branch_id', user.branch_id)
        //Filtering
        const filteredBranches = location.filter((branch) => branch.city_id.toString() === city)
        setSelectedBranches(filteredBranches)
    }


    return (
        <div className='grid  grid-cols-4 grid-rows-[6.25rem_min-content_auto_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Account Setting</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-3 row-span-1 border-b ml-5 border-divider'>
                <h1 className='text-primary text-4xl font-header'>Account Settings</h1>
                <p className='font-text text-sm text-unactive' >Manage your personal account settings here, update your information, preferences, and credentials with ease.</p>
            </div>

            {/* Save Button */}
            <div className="col-start-4 border-b border-divider mr-5 flex flex-col justify-center pl-5">
                <button className='inline-flex flex-row shadow-md items-center justify-center bg-primary font-header text-white text-base p-4 rounded-full hover:bg-primaryhover hover:scale-105 transition-all ease-in-out'>
                    <FontAwesomeIcon icon={faSave} className='mr-2'/>
                    <p>Save Changes</p>
                </button>
            </div>

            {/* <ScrollArea className="mx-5 h-[calc(100vh-6.25rem)] col-span-4"> */}
                <div className="grid grid-cols-4 grid-rows-4 col-span-4 mx-5 h-[calc(100vh-6.25rem)]">
                    {/* Account Name and PFP */}
                    <div className="border-b border-divider flex flex-col justify-center">
                        <p className="font-header text-primary">
                            Account Name and Profile Image
                        </p>
                        <p className="font-text text-unactive text-sm">
                            Update your account name and profile image
                        </p>
                    </div>
                    <div className="col-span-3 border-b border-divider flex flex-row gap-4 px-5">
                        <div className="flex flex-col justify-center">
                            <div className='bg-blue-500 h-20 w-20 rounded-full hover:cursor-pointer hover:ring-2 ring-primary hover:ring-offset-2 hover:ring-offset-white transition-all ease-in-out'>
                                {user ? <img src={user.user_infos.profile_image} alt="Profile" className='h-full w-full rounded-full'/> : null}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 w-full gap-x-2 pr-5">
                            <div className="inline-flex flex-col gap-1 row-start-2 col-span-1 py-2">
                                <label htmlFor="firstName" className="font-text text-xs flex flex-row justify-between">
                                    <p>First Name <span className="text-red-500">*</span></p>
                                </label>
                                <input type="text" name="firstName"
                                        value={formik.values.firstName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                            </div>
                            <div className="inline-flex flex-col gap-1 row-start-2 col-span-1 py-2">
                                <label htmlFor="middleName" className="font-text text-xs flex flex-row justify-between">
                                    <p>Middle Name</p>
                                </label>
                                <input type="text" name="middlename"
                                        value={formik.values.middleName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                            </div>
                            <div className="inline-flex flex-row gap-2 row-start-2 col-span-1 w-full">
                                <div className="w-3/4 gap-1 inline-flex flex-col py-2">
                                    <label htmlFor="lastName" className="font-text text-xs flex flex-row justify-between">
                                        <p>Last Name <span className="text-red-500">*</span></p>
                                    </label>
                                    <input type="text" name="lastName"
                                            value={formik.values.lastName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                </div>
                                <div className="w-1/4 gap-1 inline-flex flex-col py-2">
                                <label htmlFor="name_suffix" className="font-text text-xs flex flex-row justify-between">
                                    <p>Suffix</p>
                                </label>
                                <input type="text" name="name_suffix"
                                        value={formik.values.name_suffix}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                            </div>
                            </div>

                        </div>
                    </div>
                    {/* Employee ID */}
                    <div className="border-b border-divider flex flex-col justify-center">
                        <p className="font-header text-primary">
                            Emloyee ID
                        </p>
                        <p className="font-text text-unactive text-sm">
                            Set or update your Employee ID to ensure accurate identification
                        </p>
                    </div>
                    <div className="col-span-3 border-b border-divider flex flex-row gap-4 px-5">
                        <div className="inline-flex flex-col w-1/4 justify-center">
                            <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                <p>Employee ID Number <span className="text-red-500">*</span></p>
                            </label>
                            <input type="text" name="employeeID"
                                    value={formik.values.employeeID}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    maxLength={11}
                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                            {formik.touched.employeeID && formik.errors.employeeID ? (<div className="text-red-500 text-xs font-text">{formik.errors.employeeID}</div>):null}
                        </div>
                    </div>
                    {/* Division & Department & Section */}
                    <div className="border-b border-divider flex flex-col justify-center">
                        <p className="font-header text-primary">
                            Division, Department and Section
                        </p>
                        <p className="font-text text-unactive text-sm">
                        Configure your Division, Department, and Section to align your profile
                        </p>
                    </div>
                    <div className="col-span-3 border-b border-divider grid grid-cols-3 w-full gap-x-2 pl-5 pr-10">
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2 justify-center">
                            <label htmlFor="department" className="font-text text-xs flex">Division <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.division}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    >
                                    <option value="">Select Divison</option>
                                    {
                                        division?.map((division) => (
                                            <option key={division.id} value={division.id}>{division.division_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {/* {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text">{formik.errors.department}</div>):null} */}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2 justify-center">
                            <label htmlFor="department" className="font-text text-xs flex">Department <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.department_id}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    >
                                    <option value="">Select Department</option>
                                    {
                                        departments.map((department) => (
                                            <option key={department.id} value={department.id}>{department.department_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {/* {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text">{formik.errors.department}</div>):null} */}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2 justify-center">
                            <label htmlFor="department" className="font-text text-xs flex">Section <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="section" name="section" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.section}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    >
                                    <option value="">Select Section</option>
                                    {
                                        section.map((section) => (
                                            <option key={section.id} value={section.id}>{section.section_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {/* {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text">{formik.errors.department}</div>):null} */}
                        </div>
                    </div>
                    {/* City & Branch */}
                    <div className=" border-divider flex flex-col justify-center">
                        <p className="font-header text-primary">
                            City and Branch
                        </p>
                        <p className="font-text text-unactive text-sm">
                            Specify your City and Branch to reflect your exact work location
                        </p>
                    </div>
                    <div className="col-span-3  border-divider grid grid-cols-3 w-full gap-x-2 pl-5 pr-10">
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2 justify-center">
                            <label htmlFor="department" className="font-text text-xs flex">City <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="city_id" name="city_id" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.city_id}
                                    onChange={handleBranchesOptions}
                                    onBlur={formik.handleBlur}
                                    >
                                    <option value="">Select City</option>
                                    {
                                        cities.map((city) => (
                                            <option key={city.id} value={city.id}>{city.city_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {/* {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text">{formik.errors.department}</div>):null} */}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2 justify-center">
                            <label htmlFor="department" className="font-text text-xs flex">Branch <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    // value={formik.values.department}
                                    // onChange={formik.handleChange}
                                    // onBlur={formik.handleBlur}
                                    >
                                    <option value="">Select Branch</option>
                                    {
                                        selectedBranches?.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {/* {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text">{formik.errors.department}</div>):null} */}
                        </div>
                    </div>

                </div>


        </div>
    )
}
export default AccountSettings;
