import { faArrowLeft, faExclamationTriangle, faInfoCircle, faSpinner, faUserGroup, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { useNavigate } from "react-router";
import { useOption } from "../contexts/AddUserOptionProvider";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import { useEffect, useState } from "react";
import AddUserSuccessfully from "../modalsandprops/AddUserSuccessFully";
import ConfirmAddingUser from "../modalsandprops/ConfirmAddingUser";
import axiosClient from "../axios-client";
import * as Yup from "yup"
import AddUserModal from "../modalsandprops/AddUserModal";
import { useStateContext } from "../contexts/ContextProvider";
import { MBLearnEcho } from "MBLearn/MBLearnEcho";
import { toast } from "sonner";

export function AddUser() {
    const {cities,location,permission,career_level,divisions,roles} = useOption();
    const navigate = useNavigate();
    const [permissions, _setPermission] = useState()
    const [added, setAdded] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [bulk, setbulk] = useState(false)
    const [bulkadd,setbulkadd] = useState(false)
    const [adding, setAdding] = useState(false);
    const {token, user} = useStateContext();

    useEffect(()=>{
        {
            window.Echo = MBLearnEcho(token);
            const channelName = `App.Models.UserCredentials.${user?.id}`
            const channel = window.Echo.private(channelName);

            channel.notification((e)=>{
                setbulkadd(false);
                navigate(-1);
            })
        }
    },[token,user])

    const setPermissions = (id) => {
        _setPermission((prev) => {
            const exist = prev?.find((p) => p.permission_Id === id);

            if (exist) {
                return prev.filter((p) => p.permission_Id !== id);
            } else {
                return [...(prev || []), { permission_Id: id }];
            }
        })
    }

    useEffect(()=>{
        console.log("Permissions Set: ", permissions)
    },[permissions])

    const formik = useFormik({
        initialValues: {
            employeeID: '',
            lastname:'',
            firstname:'',
            middlename:'',
            suffix:'',
            department: 0,
            division: 0,
            title: 0,
            branch: 0,
            city: 0,
            role: 0,
            career_level: 0,
            status: 'Active',
            MBemail: '',
        },
        validationSchema: Yup.object({
            employeeID: Yup.string().required('required *').matches(/^\d+$/, 'Numbers only').length(11, 'Employee ID must be exactly 11 characters'),
            lastname: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            firstname: Yup.string().required('required *').matches(/^[A-Za-z.\s]+$/, 'Only letters are allowed'),
            middlename: Yup.string().matches(/^[A-Za-z]+\.?$/, 'Invalid Special Character'),
            title: Yup.string().required('required *'),
            city: Yup.string().required('required *'),
            branch: Yup.string().required('required *'),
            MBemail: Yup.string().required('required *').email('Invalid email address').matches(
                /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|live\.com|msn\.com|me\.com|mac\.com|metrobank\.com\.ph|company\.org|edu\.ph|org\.ph|novaliches\.sti\.edu\.ph)$/,
                'Only credible or official email domains are allowed'
            ),
            role: Yup.number().required('required *').test('not-zero', 'Please select a valid role', (value) => value !== 0),
        }),
        onSubmit: values => {
            console.log(values)
            handleAdding();
        }
    })



    const rolechange = () => {
        _setPermission([])
        roles.find(r => r.id === Number(formik.values.role))?.permissions.map((perms) => {
            setPermissions(perms.id)
        });
    }
    const isChecked = (id) => {
        return permissions?.some((p) => p.permission_Id === id);
    }
    useEffect(() => {
        rolechange()
    }, [formik.values.role])

    const handleAdding = () => {
        const payload = {
            employeeID: formik.values.employeeID,
            last_name: formik.values.lastname,
            first_name: formik.values.firstname,
            middle_name: formik.values.middlename,
            role_id: Number(formik.values.role),
            title_id: Number(formik.values.title),
            status: "Active",
            branch_id: Number(formik.values.branch),
            MBemail: formik.values.MBemail,
            password: `${formik.values.firstname?.replace(/\s+/g, '').trim()}_${formik.values?.employeeID}`,
            permissions: permissions
        }
        setAdding(true);
        setConfirm(false);
        axiosClient.post('add-user', payload)
        .then(({data})=>{
            setAdding(false);
            toast.success("User Added Successfully")
            navigate(-1);
        }).catch((err)=>{
            setAdding(false);
            toast.error(err.response?.data?.message || "Something went wrong, please try again later");
            console.log(err);
        })
    }


    return (
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] gap-2 w-full h-full">
            {/* Header */}
            <div className="col-span-2 flex gap-4 py-4 items-center">
                <div>
                    <div className="w-10 h-10 flex items-center justify-center text-primary border-primary border-2 rounded-full hover:cursor-pointer hover:bg-primary hover:text-white transition"
                        onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} className=''/>
                    </div>
                </div>
                <div className="leading-none">
                    <p className="font-header text-primary text-2xl">Add User</p>
                    <p className="font-text text-xs text-unactive">Fill the up the given required input filed for the user to be added in MBLearn</p>
                </div>
            </div>

            <div className="col-start-3 col-span-2 pr-4 flex flex-row justify-end items-center gap-2">
                <div className={`flex items-center justify-center text-primary bg-white border-primary border-2 rounded-md px-20 py-4 gap-2 hover:text-white hover:cursor-pointer hover:bg-blue-800 transition ${adding || bulkadd ? 'opacity-50  hover:cursor-not-allowed' : ''}`}
                    onClick={() => {
                        if(bulkadd || adding) return;
                        setbulk(true)}}>
                        {
                            bulkadd?
                            <>
                                <FontAwesomeIcon icon={faSpinner} className='animate-spin'/>
                                <p className="font-header">Bulk Add User</p>
                            </>
                            :
                            <>
                                <FontAwesomeIcon icon={faUserGroup} className=''/>
                                <p className="font-header">Bulk Add User</p>
                            </>
                        }
                </div>
                <div className={`flex items-center justify-center text-white bg-primary rounded-md px-20 py-4 gap-2 hover:cursor-pointer hover:bg-blue-800 transition ${adding || bulkadd || (!(formik.isValid && formik.dirty)) ? 'opacity-50  hover:cursor-not-allowed' : ''}`}
                    onClick={() => {
                        if(adding || adding || (!(formik.isValid && formik.dirty))) return;
                        setConfirm(true)
                    }}>
                        {
                            adding ?
                            <>
                                <FontAwesomeIcon icon={faSpinner} className='animate-spin'/>
                                <p className="font-header">Add user</p>
                            </>
                            :
                            <>
                                <FontAwesomeIcon icon={faUserPlus} className=''/>
                                <p className="font-header">Add user</p>
                            </>
                        }
                </div>
            </div>

            {/* Form */}
            <div className="col-span-2 flex flex-col gap-2 py-2 row-start-2">
                <form action="">
                    {/* Name */}
                    <div className="grid grid-cols-3 grid-rows-[min-content_min-content] gap-x-1">
                        <p className="col-span-3 text-xs font-text">Employee Full Name</p>
                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2">
                        <input type="text" name="firstname"
                                value={formik.values.firstname}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                maxLength={50}
                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                        <label htmlFor="name" className="text-unactive font-text  text-xs flex flex-row justify-between">
                            <p>First Name <span className="text-red-500">*</span></p>
                        </label>
                        {formik.touched.firstname && formik.errors.firstname ? (<div className="text-red-500 text-xs font-text">{formik.errors.firstname}</div>):null}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2">
                            <input type="text" name="middlename"
                                value={formik.values.middlename}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                maxLength={20}
                                className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                        <label htmlFor="name" className="text-unactive font-text  text-xs flex flex-row justify-between">
                            <p>Middle Name or Middle Initial</p>
                        </label>
                        {formik.touched.middlename && formik.errors.middlename ? (<div className="text-red-500 text-xs font-text">{formik.errors.middlename}</div>):null}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2">
                            <input type="text" name="lastname"
                                    value={formik.values.lastname}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    maxLength={50}
                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                            <label htmlFor="name" className="text-unactive font-text text-xs flex flex-row justify-between">
                                <p>Last Name <span className="text-red-500">*</span></p>
                            </label>
                            {formik.touched.lastname && formik.errors.lastname ? (<div className="text-red-500 text-xs font-text">{formik.errors.lastname}</div>):null}
                        </div>
                    </div>
                    {/* Employee ID */}
                    <div className="inline-flex flex-col gap-1 py-2 w-full">
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
                    {/* Division,Department & Career Level */}
                    <div className="grid grid-cols-3 gap-1">
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                            <label htmlFor="division" className="font-text text-xs flex">Division <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.division}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}>
                                    <option value="">Select Division</option>
                                    {
                                        divisions.length === 0 ?
                                        <option value="">No Division Available</option>
                                        : divisions.map((division) => (
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
                        <div className="inline-flex flex-col  gap-1 py-2">
                            <label htmlFor="department" className="font-text text-xs flex">Deparment <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.department}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.values.division === "" ? true : false}>
                                    <option value="">Select Department</option>
                                    {
                                        divisions.length === 0 && formik.values.division === '' ?
                                        <option value="">No Division Available</option>
                                        : divisions.find(div => div.id === Number(formik.values.division))?.departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                                        ))
                                    }
                                </select>
                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                                {formik.touched.department && formik.errors.department ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.department}</p></div>):null}
                        </div>
                        <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                            <label htmlFor="division" className="font-text text-xs flex">Career Level <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                <select id="career_level" name="career_level" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.career_level}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.values.department === "" && formik.values.division === "" ? true : false}>
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
                    {/* Title */}
                    <div className="inline-flex flex-col gap-1 col-span-2 py-2 w-full">
                        <label htmlFor="title" className="font-text text-xs">Position <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1">
                                <select id="title" name="title" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.values.department === "" || formik.values.division === "" || formik.values.career_level === "" ? true : false}>
                                <option value="">Select Posistion</option>
                                    {
                                        divisions.length === 0 && formik.values.division === '' ?
                                            <option value="">No Position Available</option>
                                        : divisions.find(div => div.id === Number(formik.values.division))?.departments.find(dept => dept.id === Number(formik.values.department))?.titles.filter(t => t.career_level_id === Number(formik.values.career_level)).map((title) => (
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
                    {/* Branch & Location */}
                    <div className="grid grid-cols-2 gap-1">
                        <div className="inline-flex flex-col gap-1  col-span-1 py-2">
                            <label htmlFor="city" className="font-text text-xs flex flex-row justify-between">City <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                    <select id="city" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
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
                        <div className="inline-flex flex-col gap-1 py-2">
                            <label htmlFor="branch" className="font-text text-xs">Location <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1">
                                    <select id="branch" name="branch" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                        value={formik.values.branch}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={formik.values.city === "" ? true : false}>
                                        <option value="">Select Location</option>
                                        {
                                        cities.length === 0 && formik.values.city === '' ?
                                        <option value="">No Location Available</option>
                                        : location.filter(l=> l.city_id === Number(formik.values.city)).map((location) => (
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
                    {/* Credentials */}
                    <div className="inline-flex flex-col gap-1 col-span-1 py-2 w-full">
                        <label htmlFor="name" className="font-text text-xs flex flex-row justify-between">
                            <p>MBLearn Email <span className="text-red-500">*</span></p>
                        </label>
                        <input type="text" name="MBemail"
                                value={formik.values.MBemail}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                maxLength={50}
                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                        {formik.touched.MBemail && formik.errors.MBemail ? (<div className="text-red-500 text-xs font-text">{formik.errors.MBemail}</div>):null}
                    </div>
                    <div className="inline-flex flex-col gap-1 col-span-1 py-2 w-full">
                        <label htmlFor="name" className="font-text text-xs flex flex-row justify-between">
                            <p>Account Initial Password</p>
                        </label>
                        <input type="text" name="lastname"
                                value={`${formik.values.firstname?.replace(/\s+/g, '').trim()}_${formik.values?.employeeID}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                maxLength={50}
                                disabled
                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                        {formik.touched.lastname && formik.errors.lastname ? (<div className="text-red-500 text-xs font-text">{formik.errors.lastname}</div>):null}
                    </div>
                </form>
            </div>

            <div className="flex flex-col gap-2 py-2 col-span-2 row-start-2 pr-4">
                <div className="inline-flex flex-col gap-1 col-span-3 pb-2">
                    <label htmlFor="role" className="font-header text-xs flex flex-row justify-between">
                        <p className="text-xs font-text">Account Role <span className="text-red-500">*</span></p>
                    </label>
                    <div className="grid grid-cols-1">
                        <select id="role" name="role" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}>
                            <option value={0} >Select Role</option>
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

                <p className="font-text text-xs">Account Permission</p>
                <ScrollArea className="h-[calc(100vh-13rem)] w-full border border-divider rounded-md bg-white">
                    <div className="p-4 flex flex-col gap-2">
                        {
                            permission.length === 0 ?
                            Array.from({length: 4}).map((_,i) => (
                                <div key={i} className="w-full h-20 animate-pulse border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">

                                </div>
                            ))
                            :
                            formik.values.role === '0' ?
                            <div className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className='text-primary mr-5'/>
                                <p className="font-text text-unactive text-sm">Please select a role to view permissions</p>
                            </div>
                            : formik.values.role === '2' ?
                            permission.slice(8,14).map((perm)=>(
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                </div>
                            ))
                            : formik.values.role === '3' ?
                            permission.slice(11,14).map((perm)=>(
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                </div>
                            ))
                            : formik.values.role === '4'?
                            permission.slice(14,29).map((perm)=>(
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                </div>
                            )):
                            formik.values.role === '5' || formik.values.role === '6' ?
                            <div className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-center">
                                <FontAwesomeIcon icon={faInfoCircle} className='text-primary mr-5'/>
                                <p className="font-text text-unactive text-sm">No Special Permission for the given role</p>
                            </div>
                            : permission.slice(0,14).map((perm)=>(
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                </div>
                            ))
                        }
                    </div>

                </ScrollArea>
            </div>

            <ConfirmAddingUser open={confirm} close={()=>setConfirm(false)} handleAdding={()=>handleAdding()} user={formik.values} permissions={permissions}/>
            <AddUserSuccessfully open={added} close={()=>{setAdded(false),navigate('/systemadmin/usermanagementmaintenance')}}/>
            <AddUserModal open={bulk} close={()=>{setbulk(false)}} setAdding={setbulkadd} adding={bulkadd}/>
        </div>
    )
}
