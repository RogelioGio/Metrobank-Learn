import { faAddressCard, faBuildingUser, faChevronDown, faClapperboard, faClipboard, faD, faFileArrowUp, faSuitcase, faUser, faUserCircle, faUserGroup, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { faCircleUser as faUserRegular, faCircleCheck as faCircleCheckRegular, faAddressCard as faAddressCardRegular,  faBuilding as faBuildingRegular, faIdBadge as faIdBadgeRegular}  from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import axiosClient from "../axios-client"
import * as Yup from "yup"
import { useFormik } from "formik"
import axios from "axios"
import UserAddedSuccessfullyModal from "./UserAddedSuccessfullyModal"
import AddUserErrorModal from "./AdduserErrorModal"
//import { Stepper } from '@mantine/core';
import { useOption } from "../contexts/AddUserOptionProvider"
import AddMultipleUserProps from "./AddMultipleUserProps"
import AccountPermissionProps from "./AccountPermissionsProps"
import { ScrollArea } from "../components/ui/scroll-area"
import { AddUser, Step, StepperCompleted } from "../components/ui/addUserStepper"



const AddUserModal = ({open, close, updateTable, adding, setAdding}) => {
    //Option Context
    const {cities,departments,location,titles,roles,permission,career_level} = useOption();
    const [selectedBranches, setSelectedBranches] = useState([])
    const [generatedEmail, setGeneratedEmail] = useState('')
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [role, setRoles] = useState([])
    const [accountPerm, setAccountPerm] = useState([])
    const [done,setDone] = useState()

    const stepperRef = useRef(null);


    const handleBranchesOptions = (e) =>{
        const city = e.target.value;
        formik.setFieldValue('city', city)
        formik.setFieldValue('branch', '')

        //Filtering
        const filteredBranches = location.filter((branch) => branch.city_id.toString() === city)
        setSelectedBranches(filteredBranches)
    }


    // Modals state(subject to change)
    const [OpenError, setError] = useState(false)
    const reset = () => {
        close();
        formik.resetForm();
        toggleState("steps",0);
    }

    //Data
    const [errorMessage, setErrorMessage] = useState({
        message: '',
        errors: {}
    })


    //Loading
    const [loading, setLoading] = useState(false);

    //payload and validation schema
    const formik = useFormik({
        //references
        initialValues: {
            employeeID: '',
            lastname:'',
            firstname:'',
            middlename:'',
            suffix:'',
            department: '',
            division: '',
            title: '',
            branch: '',
            city: '',
            role: '',
            career_level: '',
            status: 'Active',
        },
        //validation
        validationSchema: Yup.object({

            //employeeID: Yup.string().required('required *').matches(/^\d+$/, 'Numbers only').length(11, 'Employee ID must be exactly 11 characters'),
            //lastname: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            //firstname: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            //middlename: Yup.string().matches(/^[A-Za-z]+\.?$/, 'Invalid Special Character'),
            title: Yup.string().required('required *'),
            city: Yup.string().required('required *'),
            //branch: Yup.string().required('required *'),
            role: Yup.string().required('required *'),
        }),
        //submission
        onSubmit:(values) => {
            setLoading(true)
            const payload = {
                employeeID: values.employeeID,
                first_name: values.firstname.charAt(0).toUpperCase() + values.firstname.slice(1),
                last_name: values.lastname.charAt(0).toUpperCase() + values.lastname.slice(1),
                middle_name: values.middlename.charAt(0).toUpperCase() + values.middlename.slice(1),
                name_suffix: values.suffix.charAt(0).toUpperCase() + values.suffix.slice(1),
                title_id: values.title,
                branch_id: values.branch,
                role_id: values.role,
                status: "Active",
                MBemail: `${values.firstname.replace(/\s+/g, '').trim()}.${values.lastname.replace(/\s+/g, '').trim()}@outlook.com`.toLowerCase(),
                password: `${values.firstname.replace(/\s+/g, '').trim()}_${values.employeeID}`,
                permissions:accountPerm
            }

            // setTimeout(()=>{setLoading(false)},2000)
            // setTimeout(()=>{navigateForm("next")},3000)

            axiosClient.post('/add-user',payload).
            then((res) => {
                //console.log(res)
                setDone(true)
                setLoading(false);
                navigateForm("next");
                setTimeout(()=>{setFormCompleted([]),formik.resetForm()},1000)
            })
            .catch((err)=>{
                setErrorMessage({
                    message: err.response.data.message,
                    errors: err.response.data.errors
                })
                setError(true)
                setLoading(false);
            })
            console.log(payload)
        }

    })

//     useEffect(()=>{console.log("Account Permissions",accountPerm)
//         console.log(formik.values.role)
// },[accountPerm])

    //Field Checker per step


    //UseState
    const [state, setState] = useState({
        tab: "single",
        steps: 0,
    })
    const toggleState = (key,value) => {
        setState((prev => ({
            ...prev,
            [key]:value,
        })));
    }

    useEffect(() => {
        setRoles(roles)
    },[])

    const stepFieldsMap = {
    0: ["lastname", "firstname", "employeeID"],
    1: ["department","title","city",'location'],
    2: ["role"]
    }


    const [formCompleted, setFormCompleted] = useState([])
    const navigateForm = async (direction) => {
        if(!direction) return

        const currentStepIndex = stepperRef.current?.activeStep;
        const { stepsMeta } = stepperRef.current

        const stepFields = stepFieldsMap[currentStepIndex] || [];
        const errors =  await formik.validateForm();
        const stepErrors = stepFields.some((field) => errors[field]);



        if(direction === 'next') {
            if(stepErrors) {
                formik.setTouched(stepFields.reduce((acc, key) => ({ ...acc, [key]: true }), {}))
                console.log("Error:")
                return
            }

            const currentStepID = stepsMeta?.[currentStepIndex]?.stepID;

            setFormCompleted((prev) => {
                if(!currentStepID || prev.includes(currentStepID)) return prev
                return [...prev, currentStepID]
            })

            stepperRef.current?.next()
        }else if(direction === 'back'){
            const currentStepID = stepsMeta?.[currentStepIndex]?.stepID;
            if(currentStepID === formCompleted[0]){
                const restart = setTimeout(()=>{setFormCompleted([]);formik.resetForm()},1000)
                close()
            }
            stepperRef.current?.back()
        }

    }

    useEffect(()=>{
        console.log(formik.values.division)
    },[formik.values])



    return(
        <>
        <Dialog open={open} onClose={()=>{}}>
            <Dialog open={open} onClose={()=>{}}></Dialog><DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[50vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Add Multiple Users</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Create and register new users with defined roles</p>
                                </div>
                                <div className="">
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                        onClick={()=>{
                                            setTimeout(()=>{formik.resetForm();setFormCompleted([])},1000)
                                            close()
                                        }}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs to add user by import or form */}



                            {/* Add User by Form */}
                            {
                                false ? (
                                    <>
                                    <form onSubmit={formik.handleSubmit}>
                                        <AddUser ref={stepperRef} initialValues={0} formProgress={formCompleted} enableStepClick={true}>
                                            <Step stepTitle="Employee Information" stepDesc="User personal information" stepID="user-info" icon={faUserCircle}>
                                                <div className="grid gap-x-2
                                                                grid-cols-1
                                                                md:grid-cols-3">
                                                    {/* EmployeeID */}
                                                    <div className="inline-flex flex-col gap-1 py-2
                                                                    md:col-span-3">
                                                        <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                                            <p>Employee ID Number <span className="text-red-500">*</span></p>
                                                        </label>
                                                        <input type="text" name="employeeID"
                                                                value={formik.values.employeeID}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                maxLength={11}
                                                                inputMode="numeric"
                                                                pattern="\d*"
                                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                        {formik.touched.employeeID && formik.errors.employeeID ? (<div className="text-red-500 text-xs font-text">{formik.errors.employeeID}</div>):null}
                                                    </div>
                                                    {/* First Name */}
                                                    <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                    <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                        <p>First Name <span className="text-red-500">*</span></p>
                                                    </label>
                                                    <input type="text" name="firstname"
                                                            value={formik.values.firstname}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            maxLength={50}
                                                            className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {formik.touched.firstname && formik.errors.firstname ? (<div className="text-red-500 text-xs font-text">{formik.errors.firstname}</div>):null}
                                                    </div>
                                                    {/* Middle Name */}
                                                    <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                        <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                        <p>Middle Name or Middle Initial</p>
                                                        </label>
                                                        <input type="text" name="middlename"
                                                            value={formik.values.middlename}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            maxLength={20}
                                                            className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                            {formik.touched.middlename && formik.errors.middlename ? (<div className="text-red-500 text-xs font-text">{formik.errors.middlename}</div>):null}
                                                    </div>
                                                    {/* Last Name */}
                                                    <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                        <label htmlFor="name" className="font-text text-xs flex flex-row justify-between">
                                                            <p>Last Name <span className="text-red-500">*</span></p>
                                                        </label>
                                                        <input type="text" name="lastname"
                                                                value={formik.values.lastname}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                maxLength={50}
                                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                        {formik.touched.lastname && formik.errors.lastname ? (<div className="text-red-500 text-xs font-text">{formik.errors.lastname}</div>):null}
                                                    </div>
                                                    {/* <div className="row-start-2 flex flex-row gap-x-2">
                                                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                        <label htmlFor="name" className="font-text text-xs flex flex-row justify-between">
                                                            <p>Last Name <span className="text-red-500">*</span></p>
                                                        </label>
                                                        <input type="text" name="lastname"
                                                                value={formik.values.lastname}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                maxLength={50}
                                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                        {formik.touched.lastname && formik.errors.lastname ? (<div className="text-red-500 text-xs font-text">{formik.errors.lastname}</div>):null}
                                                        </div>
                                                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                        <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                        <p>Suffix</p>
                                                        </label>
                                                        <input type="text" name="suffix"
                                                            value={formik.values.suffix}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            maxLength={4}
                                                            className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full"/>
                                                            {formik.touched.suffix && formik.errors.suffix ? (<div className="text-red-500 text-xs font-text">{formik.errors.suffix}</div>):null}
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </Step>
                                            <Step stepTitle="Status and Location" stepDesc="Select department and branch location" stepID="user-details" icon={faBuildingUser}>
                                                <div className="grid gap-x-2
                                                                grid-cols-1
                                                                md:grid-cols-2"
                                                                >
                                                    <div className="grid gap-x-2
                                                                grid-cols-1
                                                                md:grid-cols-3 md:col-span-2">
                                                        {/*Department*/}
                                                        <div className="inline-flex flex-col  gap-1 py-2">
                                                            <label htmlFor="department" className="font-text text-xs flex">Deparment <span className="text-red-500">*</span></label>
                                                            <div className="grid grid-cols-1">
                                                                <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                    value={formik.values.department}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}>
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
                                                                {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.department}</p></div>):null}
                                                        </div>
                                                        {/*Division*/}
                                                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                            <label htmlFor="division" className="font-text text-xs flex">Division <span className="text-red-500">*</span></label>
                                                            <div className="grid grid-cols-1">
                                                                <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                    value={formik.values.division}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    disabled={formik.values.department === "" ? true : false}>
                                                                    <option value="">Select Division</option>
                                                                    {
                                                                        departments.find(dept => dept.id === Number(formik.values.department))?.divisions.map((division) => (
                                                                            <option key={division.id} value={division.id}>{division.division_name}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                                </svg>
                                                            </div>
                                                                {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null}
                                                        </div>
                                                        {/* CareerLevel */}
                                                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                                            <label htmlFor="division" className="font-text text-xs flex">Career Level <span className="text-red-500">*</span></label>
                                                            <div className="grid grid-cols-1">
                                                                <select id="career_level" name="career_level" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                    value={formik.values.career_level}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    disabled={formik.values.department === "" ? true : false}>
                                                                    <option value="">Select Career Level</option>
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
                                                                {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null}
                                                        </div>
                                                    </div>
                                                    {/* Employee Posistion */}
                                                    <div className="inline-flex flex-col gap-1 col-span-2  py-2">
                                                    <label htmlFor="title" className="font-text text-xs">Position <span className="text-red-500">*</span></label>
                                                    <div className="grid grid-cols-1">
                                                            <select id="title" name="title" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                value={formik.values.title}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                disabled={formik.values.department === "" || formik.values.division === "" || formik.values.career_level === "" ? true : false}>
                                                            <option value="">Select Posistion</option>
                                                                {
                                                                    departments.find(dept => dept.id === Number(formik.values.department))?.divisions.find(div => div.id === Number(formik.values.division))?.titles.filter(t => t.career_level_id === Number(formik.values.career_level)).map((title) => (
                                                                        <option key={title.id} value={title.id}>{title.title_name}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                            </svg>
                                                    </div>
                                                        {formik.touched.title && formik.errors.title ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.title}</p></div>):null}
                                                    </div>

                                                    {/* Branch City Location */}
                                                    <div className="inline-flex flex-col gap-1  col-span-1 py-2">
                                                    <label htmlFor="city" className="font-text text-xs flex flex-row justify-between">City <span className="text-red-500">*</span></label>
                                                    <div className="grid grid-cols-1">
                                                            <select id="city" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                            value={formik.values.city}
                                                            onChange={handleBranchesOptions}
                                                            onBlur={formik.handleBlur}>
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
                                                    {formik.touched.city && formik.errors.city ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end">{formik.errors.city}</div>):null}
                                                    </div>
                                                     {/* Branch Location */}
                                                    <div className="inline-flex flex-col gap-1 py-2">
                                                        <label htmlFor="branch" className="font-text text-xs">Location <span className="text-red-500">*</span></label>
                                                        <div className="grid grid-cols-1">
                                                                <select id="branch" name="branch" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                    value={formik.values.branch}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}>
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
                                                        {formik.touched.location && formik.errors.location ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.location}</p></div>):null}
                                                    </div>
                                                </div>
                                            </Step>
                                            <Step stepTitle=" Account Role" stepDesc="Select system role and access" stepID="account-permissions" icon={faAddressCard}>
                                                <div className="grid grid-cols-3 grid-rows-[1fr_auto] gap-2">
                                                    <div className="inline-flex flex-col gap-1 col-span-3 py-2">
                                                        <label htmlFor="role" className="font-header text-xs flex flex-row justify-between">
                                                            <p className="text-xs font-text">Account Role <span className="text-red-500">*</span></p>
                                                        </label>
                                                        <div className="grid grid-cols-1">
                                                            <select id="role" name="role" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                value={formik.values.role}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}>
                                                                <option value=''>Select Role</option>
                                                                {
                                                                    roles.map((role) => (
                                                                        <option key={role.id} value={role.id}>{role.role_name}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        {formik.touched.role && formik.errors.role ? (<div className="text-red-500 text-xs font-text">{formik.errors.role}</div>):null}
                                                    </div>
                                                    {
                                                        formik.values.role ? (
                                                            <div className="col-span-3">
                                                                <AccountPermissionProps refPermissions={permission} selectedRole={formik.values.role} role={role} setAccountPerm={setAccountPerm}/>
                                                            </div>
                                                        ) : (null)
                                                    }
                                                </div>
                                            </Step>
                                            <Step stepTitle="Review" stepDesc="Review information" stepID="review" icon={faClipboard}>
                                                <div className="grid grid-cols-3 gap-y-2 p-2">
                                                    <div className="flex flex-col col-span-2 border-b border-divider py-1 gap-1">
                                                        <p className="font-text text-xs text-unactive">Name:</p>
                                                        <p className="font-text">{formik.values.firstname.charAt(0).toUpperCase() + formik.values.firstname.slice(1)} {formik.values.middlename.charAt(0).toUpperCase() + formik.values.middlename.slice(1)} {formik.values.lastname.charAt(0).toUpperCase() + formik.values.lastname.slice(1)}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 border-b border-divider py-1">
                                                        <p className="font-text text-xs text-unactive">Employee ID Number:</p>
                                                        <p className="font-text">{formik.values.employeeID}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 leading-tight pt-2
                                                                    col-span-3
                                                                    lg:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Department:</p>
                                                        <p className="font-text">{departments.find(department => department.id === Number(formik.values.department))?.department_name || "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 pt-2
                                                                    col-span-3
                                                                    lg:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Division:</p>
                                                        <p className="font-text">{departments.find(department => department.id === Number(formik.values.department))?.divisions.find(division => division.id === Number(formik.values.division))?.division_name|| "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 pt-2
                                                                    col-span-3
                                                                    lg:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Title:</p>
                                                        <p className="font-text">{departments.find(department => department.id === Number(formik.values.department))?.divisions.find(division => division.id === Number(formik.values.division))?.titles.find(t => t.id === Number(formik.values.title))?.title_name || "Not selected"}</p>
                                                        <p className="font-text text-xs">{career_level.find(level => level.id === Number(formik.values.career_level))?.name || "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 border-divider pb-2
                                                                    col-span-3
                                                                    lg:col-span-1 lg:border-b">
                                                        <p className="font-text text-xs text-unactive">City:</p>
                                                        <p className="font-text">{cities.find(city => city.id === Number(formik.values.city))?.city_name || "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 border-b border-divider pb-2
                                                                    col-span-3
                                                                    lg:col-span-2">
                                                        <p className="font-text text-xs text-unactive">Location:</p>
                                                        <p className="font-text">{location.find(location => location.id === Number(formik.values.branch))?.branch_name || "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 pt-2
                                                                    col-span-3
                                                                    lg:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Account Role:</p>
                                                        <p className="font-text">{roles.find(role => role.id === Number(formik.values.role))?.role_name || "Not selected"}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 pt-2
                                                                    col-span-3
                                                                    lg:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Email:</p>
                                                        <p className="font-text"> {`${formik.values.firstname.replace(/\s+/g, '').trim()}.${formik.values.lastname.replace(/\s+/g, '').trim()}@mbtc.com`.toLowerCase()}</p>

                                                    </div>
                                                    <div className="flex flex-col gap-1 pt-2
                                                                    col-span-3
                                                                    md:col-span-1">
                                                        <p className="font-text text-xs text-unactive">Initial Password:</p>
                                                        <p className="font-text">{`${formik.values.firstname.replace(/\s+/g, '').trim()}_${formik.values.employeeID}`}</p>
                                                    </div>
                                                </div>
                                            </Step>
                                            <StepperCompleted>
                                                <div className="flex flex-col items-center justify-center py-2">
                                                    <div className="bg-primarybg w-24 h-24 rounded-full flex items-center justify-center text-3xl text-primary">
                                                        <FontAwesomeIcon icon={faUserPlus}/>
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center py-2">
                                                        <p className="text-2xl font-header text-primary">User Added</p>
                                                        <p className="text-sm font-text text-unactive">The employee is successfuly added in the system</p>
                                                    </div>
                                                </div>
                                            </StepperCompleted>
                                        </AddUser>
                                    </form>
                                        <div className="flex flex-row justify-between gap-2 mx-4 py-2">
                                            {
                                            formCompleted.length !== 4 &&
                                            (<div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                                onClick={()=>{
                                                    if(formCompleted.length <= 0){
                                                        close()
                                                    } else {
                                                        navigateForm("back")
                                                    }
                                                }}>
                                                <p className="font-header">{formCompleted.length <= 0 ? "Cancel" : "Back"}</p>
                                            </div>) }
                                            <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out ${loading ? "opacity-50 hover:cursor-not-allowed" : null}`}
                                                onClick={()=>{
                                                        const currentSteps = stepperRef.current?.activeStep;
                                                        if(loading) return
                                                        if(currentSteps === 3){
                                                            formik.handleSubmit()
                                                        }else if(currentSteps === 4){
                                                            setTimeout(()=>{formik.resetForm();setFormCompleted([])},1000)
                                                            close()
                                                        }
                                                        else if (formCompleted.length === 3 && currentSteps <= 2 ){
                                                            stepperRef.current?.goTo(3);
                                                        }else{
                                                            navigateForm("next")
                                                        }
                                                    }}>
                                                <p className="font-header">{loading ? "Loading" : formCompleted.length === 3 ? "Submit"  :formCompleted.length === 4 ? "Confirm":"Next"}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : true ? (
                                    // <div>
                                    //     {/* Add user by Import file */}
                                    //     <div className="py-3 mx-4">
                                    //         <div className="flex flex-col gap-3 justify-center items-center rounded-lg border-2 border-dashed border-unactive px-6 py-10 h-full w-full">
                                    //             <FontAwesomeIcon icon={faFileArrowUp} className="text-4xl text-unactive"/>
                                    //             <p className="font-text text-center text-xs text-unactive">Upload .csv file to add multiple user in the system</p>
                                    //         </div>
                                    //     </div>
                                    //      {/* Action Buttons */}
                                    //     <div className="flex flex-row gap-2 mx-4 py-3">
                                    //         <div
                                    //         className="font-header text-center text-primary border-2 border-primary w-1/2 py-2 rounded-md shadow-md  hover: cursor-pointer hover:scale-105 transition-all ease-in-out hover:bg-primaryhover hover:text-white">Cancel</div>
                                    //         <div className="font-header text-center text-white border-2 border-primary w-1/2 py-2 rounded-md shadow-md bg-primary hover: cursor-pointer hover:scale-105 transition-all ease-in-out hover:bg-primaryhover hover:text-white">Next</div>
                                    //     </div>
                                    // </div>
                                    <AddMultipleUserProps onClose={close} adding={adding} setAdding={setAdding}/>
                                ) : null
                            }

                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>

        {/* Error Message*/}
        <AddUserErrorModal error={OpenError} close={()=>setError(false)} message={errorMessage.message} desc={errorMessage.errors}/>
        </>
    )
}

export default AddUserModal
