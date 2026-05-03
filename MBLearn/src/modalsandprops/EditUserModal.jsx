import { faBuilding, faBuildingUser, faTruckMonster, faUserCircle, faUserPen, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { Formik, useFormik } from "formik"
import { use, useEffect, useState } from "react"
import * as Yup from "yup"
import axiosClient from "../axios-client"
import { useOption } from "../contexts/AddUserOptionProvider"
import { useUser } from "../contexts/selecteduserContext"
import AddUserErrorModal from "./AdduserErrorModal"
import EditUserCredsModal from "./EditUserCredsModal"
import EdituserErrorModal from "./EdituserErrorModal"
import UnsavedEditUserPromptModal from "./UnsaveEditUserPromptModal"
import { toast } from "sonner"

const EditUserModal = ({open, close, classname, ID, close_confirmation, selectedUser, fetch}) =>{
    const { departments = [], location = [], cities = [], career_level,divisions } = useOption() || {};
    // const {selectedUser, selectUser, isFetching} = useUser();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState();
    const [selectedBranches, setSelectedBranches] = useState([])
    const [editing, setEditing] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [tab, setTab] = useState("EmployeeInformation")
    const [unsave, setUnsave] = useState(false);
    const [unsavePromt, setUnsavePrompt] = useState(false)
    const [changes, setChanges] = useState({});

    const handleBranchesOptions = (e) => {
        const city = e.target.value;
        formik.setFieldValue('city', city)
        formik.setFieldValue('branch_id', selectedUser.branch_id)
        //Filtering
        const filteredBranches = location.filter((branch) => branch.city_id.toString() === city)
        setSelectedBranches(filteredBranches)
    }

    useEffect(() => {

        if(selectedUser?.city?.id){
            const city = selectedUser?.city?.id.toString();
            const filteredBranches = location.filter((branch) => branch.city_id.toString() === city)
            setSelectedBranches(filteredBranches)
        }
    },[selectedUser])

    // useEffect(() => {
    //         if (open && ID) {
    //             if (selectedUser?.id === ID) {
    //                 setLoading(false);
    //             } else {
    //                 setLoading(true);
    //                 selectUser(ID);
    //             }
    //         }
    //     }, [ID, selectedUser, open]);
    //     useEffect(() => {
    //         if (selectedUser && !isFetching) {
    //             setLoading(false);
    //         }
    //     }, [selectedUser, isFetching]);

    // useEffect(() => {
    //     setLoading(isFetching);
    // }, [isFetching]);

    //payload and validation schema
    const formik = useFormik({
        //references
        enableReinitialize: true,
        initialValues: loading
            ? {
                employeeID: 'Loading...',
                first_name: 'Loading...',
                middle_name: 'Loading...',
                last_name: 'Loading...',
                department_id: 'Loading...',
                division: 'loading...',
                careerLevel_id: 'Loading...',
                title_id: 'Loading...',
                branch_id: 'Loading...',
                city: 'Loading...',
                name_suffix: 'Loading...',
                status: 'Active',
            }
            : {
                employeeID: selectedUser?.employeeID ?? '',
                first_name: selectedUser?.first_name ?? '',
                middle_name: selectedUser?.middle_name ?? '',
                last_name: selectedUser?.last_name ?? '',
                department_id: selectedUser?.title?.department?.id ?? '',
                division_id: selectedUser?.title?.department?.division?.id ?? '',
                careerLevel_id: selectedUser?.title?.career_level_id ?? '',
                title_id: selectedUser?.title?.id ?? '',
                branch_id: selectedUser?.branch_id ?? '',
                city: selectedUser?.city?.id ?? '',
                status: 'Active',
            },
        //validation
        validationSchema: Yup.object({
            employeeID: Yup.string().required('required *').matches(/^\d+$/, 'Numbers only').length(11, 'Employee ID must be exactly 11 characters'),
            last_name: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            first_name: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            middle_name: Yup.string().matches(/^[A-Za-z]+\.?$/, 'Invalid Special Character'),
            title_id: Yup.string().required('required *'),
            branch_id: Yup.string().required('required *'),
            city: Yup.string().required('required *'),
        }),
        onSubmit: (values) => {
            handleUpdate()
        }
    })

    const handleUpdate = () => {
        setUpdating(true)
            axiosClient.put(`/update-user-info/${selectedUser.id}`,formik.values)
            .then((response) => {console.log(response)
                    setUpdating(false)
                    toast.success("User Information Updated Successfully")
                    fetch()
                    close()
                    setTimeout(()=>{
                        formik.resetForm(), setTab("EmployeeInformation")
                    },500)
            })
            .catch((err) => {
                setErrorMessage({
                    message: err.response.data.message,
                    errors: err.response.data.errors
                })
                setError(true)
                setLoading(false);
            })
    }

    //Update Error
    const [OpenError, setError] = useState(false)
    const reset = () => {
        close();
        formik.resetForm();
    }
    //Data
        const [errorMessage, setErrorMessage] = useState({
            message: '',
            errors: {}
        })
    //Change Detector
    useEffect(()=>{
        const  newChanges= {}
        for(const key in formik.values){
            if(Object.prototype.hasOwnProperty.call(formik.values, key)){
                newChanges[key] = formik.values[key] !== formik.initialValues[key];
            }
        }
        setChanges(newChanges)
        const isChanged = Object.keys(formik.values).some(
            (key) => formik.values[key] !== formik.initialValues[key]
        )
        setUnsave(isChanged)
    },[formik.values])

    return (
        <>
        <Dialog open={open} onClose={()=>{}} className={classname}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30" />
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[100vw]
                                                            lg:w-[70vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                                <div className="py-4 mx-4 border-b border-divider flex flex-row justify-between item-center gap-4">
                                    <div>
                                        <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Edit User Infomation</h1>
                                        <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Enables administrators to update and modify user information and account details.</p>
                                    </div>
                                    <div className="">
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                        w-5 h-5 text-xs
                                                        md:w-8 md:h-8 md:text-base"
                                            onClick={()=>{
                                                if(unsave) {
                                                    setUnsavePrompt(true)
                                                    return
                                                }

                                                close()
                                                setTimeout(()=>{formik.resetForm(), setTab("EmployeeInformation")},500)

                                            }}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>

                                </div>
                                <div className={`p-4 flex flex-row gap-2 justify-between`}>
                                    <div className={`group flex flex-col gap-2 border-2 text-primary border-primary w-full p-3 rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${tab === "EmployeeInformation" ? "bg-primary text-white":null}
                                                    md:flex-row`}
                                        onClick={()=>{setTab("EmployeeInformation")}}>
                                        <div className={`w-10 h-10 bg-primarybg rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-primaryhover text-primary ${tab === "EmployeeInformation" ? "bg-white":null}`}>
                                            <FontAwesomeIcon icon={faUserCircle} className="text-xl"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-header">Employee Information</p>
                                            <p className="text-xs font-text">User personal information</p>
                                        </div>
                                    </div>
                                    <div className={`group flex flex-col gap-2 border-2 text-primary border-primary w-full p-3 rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${tab === "StatusandLocation" ? "bg-primary text-white":null}
                                                    md:flex-row`}
                                        onClick={()=>{setTab("StatusandLocation")}}>
                                        <div className={`w-10 h-10 bg-primarybg rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-primaryhover text-primary ${tab === "StatusandLocation" ? "bg-white":null}`}>
                                            <FontAwesomeIcon icon={faBuildingUser} className="text-lg"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-header">Status and Location</p>
                                            <p className="text-xs font-text">Select department and branch location</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mx-4">
                                    <form onSubmit={formik.handleSubmit}>
                                    {
                                        loading ? (
                                            <p className="px-40 py-32 self-center font-text text-unactive">Loading User Information....</p>
                                        )
                                        : tab === "EmployeeInformation" ?
                                        (
                                            <div className="grid grid-cols-3 gap-y-2
                                                            md:gap-x-2">
                                                <div className="inline-flex flex-col col-start-1 gap-1
                                                                col-span-3">
                                                    <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Employee ID:</p>
                                                    </label>
                                                    <input type="text" name="employeeID"
                                                            maxLength={11}
                                                            value={formik.values.employeeID}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.employeeID ? "border-2 border-primary":""}`}/>
                                                    {formik.touched.employeeID && formik.errors.employeeID ? (<div className="text-red-500 text-xs font-text">{formik.errors.employeeID}</div>):null}
                                                </div>

                                                <div className="inline-flex flex-col justify-between gap-1
                                                                col-span-3
                                                                md:col-span-1">
                                                    <label htmlFor="first_name" className="font-text text-xs flex flex-row justify-between">
                                                        <p>First Name: </p>
                                                    </label>
                                                    <input type="text" name="first_name"
                                                            value={formik.values.first_name}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.first_name ? "border-2 border-primary":""}`}/>
                                                    {formik.touched.first_name && formik.errors.first_name ? (<div className="text-red-500 text-xs font-text">{formik.errors.first_name}</div>):null}
                                                </div>

                                                <div className="inline-flex flex-col justify-between gap-1
                                                                col-span-3
                                                                md:col-span-1">
                                                    <label htmlFor="middle_name" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Middle Name or Middle Initials: </p>
                                                    </label>
                                                    <input type="text" name="middle_name"
                                                            value={formik.values.middle_name}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.middle_name ? "border-2 border-primary":""}`}/>
                                                </div>

                                                <div className="inline-flex flex-col justify-between gap-1
                                                                md:col-span-1
                                                                col-span-3">
                                                    <label htmlFor="last_name" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Last Name: </p>
                                                    </label>
                                                    <input type="text" name="last_name"
                                                            value={formik.values.last_name}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.last_name ? "border-2 border-primary":""}`}/>
                                                        {formik.touched.last_name && formik.errors.last_name ? (<div className="text-red-500 text-xs font-text">{formik.errors.last_name}</div>):null}
                                                </div>
                                            </div>
                                        )
                                        : tab === "StatusandLocation" ? (
                                            <div className="grid grid-cols-3 gap-y-2
                                                            md:grid-cols-2
                                                            md:gap-x-2">
                                                <div className="col-span-3 flex flex-col gap-2
                                                                md:col-span-2 md:flex-row">
                                                    <div className="inline-flex flex-col gap-1 w-full">
                                                        <label htmlFor="division" className="font-text text-xs flex">Division:</label>
                                                        <div className="grid grid-cols-1">
                                                                    <select id="division_id" name="division_id" className={`${changes?.division_id ? "border-2 border-primary":""} appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                        value={formik.values.division_id}
                                                                        onChange={formik.handleChange}
                                                                        onBlur={formik.handleBlur}
                                                                        disabled={loading}>
                                                                        <option value="">Select Division</option>
                                                                        {
                                                                            divisions.map((division) => (
                                                                                <option key={division.id} value={division.id}>{division.division_name}</option>
                                                                            ))
                                                                        }
                                                                    </select>
                                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            {formik.touchdivision_id && formik.errors.division_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.division_id}</div>):null}
                                                    </div>
                                                    <div className="inline-flex flex-col gap-1 w-full">
                                                        <label htmlFor="department" className="font-text text-xs flex">Deparment:</label>
                                                        <div className="grid grid-cols-1">
                                                                    <select id="department_id" name="department_id" className={`${changes?.department_id ? "border-2 border-primary":""} appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                        value={formik.values.department_id}
                                                                        onChange={formik.handleChange}
                                                                        onBlur={formik.handleBlur}
                                                                        disabled={loading || !formik.values.division_id}>
                                                                        <option value="">Select Department</option>
                                                                        {
                                                                            divisions.length === 0 && formik.values.division_id === '' ?
                                                                            <option value="">No Division Available</option>
                                                                            : divisions.find(div => div.id === Number(formik.values.division_id))?.departments.map((dept) => (
                                                                                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                                                                            ))
                                                                                                            }
                                                                    </select>
                                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            {formik.touched.department_id && formik.errors.department_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.department_id}</div>):null}
                                                    </div>
                                                    <div className="inline-flex flex-col gap-1 w-full">
                                                    {/* Must be dropdown */}
                                                    <label htmlFor="section_id" className="font-text text-xs flex">Career Level:</label>
                                                    <div className="grid grid-cols-1">
                                                                <select id="careerLevel_id" name="careerLevel_id" className={`${changes?.careerLevel_id ? "border-2 border-primary":""}  appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                    value={formik.values.careerLevel_id}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    disabled={loading || !formik.values.division_id || !formik.values.department_id}>
                                                                    <option value="">Select Level</option>
                                                                    {
                                                                        career_level.map((level) => (
                                                                            <option key={level.id} value={level.id}>{level.name}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        {formik.touchsection_id && formik.errors.section_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.section_id}</div>):null}
                                                    </div>
                                                </div>
                                                <div className="inline-flex flex-col gap-1
                                                                col-span-3
                                                                md:col-span-2">
                                                    {/* Must be dropdown */}
                                                    <label htmlFor="title" className="font-text text-xs">Title:</label>
                                                    <div className="grid grid-cols-1">
                                                                <select id="title_id" name="title_id" className={`${changes?.title_id ? "border-2 border-primary":""} appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                    value={formik.values.title_id}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    disabled={loading}>
                                                                <option value="">Select Posistion</option>
                                                                    {
                                                                           divisions.length === 0 && formik.values.division === '' ?
                                                                            <option value="">No Position Available</option>
                                                                            : divisions.find(div => div.id === Number(formik.values.division_id))?.departments.find(dept => dept.id === Number(formik.values.department_id))?.titles.filter(t => t.career_level_id === Number(formik.values.careerLevel_id)).map((title) => (
                                                                                <option key={title.id} value={title.id}>{title.title_name}</option>
                                                                            ))
                                                                    }
                                                                </select>
                                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                </svg>
                                                        </div>
                                                        {formik.touched.title_id && formik.errors.title_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.title_id}</div>):null}
                                                </div>


                                                <div className="inline-flex flex-col gap-1
                                                                col-span-3
                                                                md:col-span-1 ">
                                                    <label htmlFor="city" className="font-text text-xs flex flex-row justify-between">
                                                        <p>City:</p>
                                                        {formik.touched.city && formik.errors.city ? (<div className="text-red-500 text-xs font-text">{formik.errors.city}</div>):null}
                                                    </label>
                                                    <div className="grid grid-cols-1">
                                                                <select id="city" name="city" className={`${changes?.city_id ? "border-2 border-primary":""} appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                value={formik.values.city}
                                                                onChange={handleBranchesOptions}
                                                                onBlur={formik.handleBlur}
                                                                disabled={loading}>
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
                                                    {formik.touched.city && formik.errors.city ? (<div className="text-red-500 text-xs font-text">{formik.errors.city}</div>):null}
                                                </div>

                                                <div className="inline-flex flex-col gap-1
                                                                col-span-3
                                                                md:col-span-1">
                                                    <label htmlFor="branch" className="font-text text-xs">Branch Location:</label>
                                                    <div className="grid grid-cols-1">
                                                                    <select id="branch_id" name="branch_id" className={`${changes?.branch_id ? "border-2 border-primary":""}  appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}
                                                                        value={formik.values.branch_id}
                                                                        onChange={formik.handleChange}
                                                                        onBlur={formik.handleBlur}
                                                                        disabled={loading}>
                                                                        <option value="">Select Location</option>
                                                                        {
                                                                        selectedBranches.map((location) => (
                                                                            <option key={location.id} value={location.id}>{location.branch_name}</option>
                                                                        ))
                                                                        }
                                                                    </select>
                                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                    </svg>
                                                        </div>
                                                        {formik.touched.branch_id && formik.errors.branch_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.branch_id}</div>):null}
                                                </div>


                                            </div>
                                        )
                                        : (
                                            <p className="px-40 py-32 self-center font-text text-unactive">Something had an error....</p>

                                        )

                                    }
                                    </form>
                                </div>
                                <div className="flex flex-row justify-between gap-2 mx-4 py-2 pt-4">
                                    <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                        onClick={()=>{
                                                if(unsave) {
                                                    setUnsavePrompt(true)
                                                    return
                                                }

                                                setTimeout(()=>{formik.resetForm(), setTab("EmployeeInformation")},500)
                                                close()
                                            }}>
                                        <p className="font-header">
                                            {/* {formCompleted.length <= 0 ? "Cancel" : "Back"} */}
                                            Cancel
                                        </p>
                                    </div>
                                    <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out ${!unsave || !(formik.isValid) ? "opacity-50 !hover:cursor-not-allowed" : ""} ${updating ? "opacity-50 hover:cursor-not-allowed" : null}`}
                                        onClick={()=>{
                                            if(unsave){
                                                if(updating) return;
                                                formik.handleSubmit()
                                                return
                                            }
                                        }}>
                                        <p className="font-header">
                                            {/* {loading ? "Loading" : formCompleted.length === 3 ? "Submit"  :formCompleted.length === 4 ? "Confirm":"Next"} */}
                                            {
                                                updating ? "Updating..." : "Update"
                                            }
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
        <EdituserErrorModal error={OpenError} close={()=>setError(false)} message={errorMessage.message} desc={errorMessage.errors}/>
        <UnsavedEditUserPromptModal open={unsavePromt} close={()=>{setUnsavePrompt(false)}} discardChanges={()=>{setTimeout(()=>{formik.resetForm(), setTab("EmployeeInformation")},500),close(),setUnsavePrompt(false)}}/>
        </>
    )
}

export default EditUserModal
