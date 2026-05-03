import { faKey, faSliders, faSquareXmark, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Switch } from "../components/ui/switch";

const AccountSettingModal = ({open, close, user}) => {
    const [tab, setTab] = useState('basicInfo');
    const formik = useFormik({
        initialValues: {
            employeeID: user.user_infos.employeeID,
            firstName: user.user_infos.first_name,
            middleName: user.user_infos.middle_name,
            lastName: user.user_infos.last_name,
            MBemail: user.MBemail,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        },
        validationSchema: null, // Define your validation schema here
        onSubmit: (values) => {
            console.log(values);
        }
    })

    const PasswordRule = ({passed, children}) => (
        <li className={`flex flex-row gap-4 items-center font-text text-xs ${passed ? 'text-primary' : 'text-unactive'}`}>
            <FontAwesomeIcon icon={passed ? faSquareCheck : faSquareXmark}/>
            {children}
        </li>
    )
    const [criteria, setCriteria] = useState({
                length: false,
                upper: false,
                lower: false,
                number: false,
                special: false,
            })

    useEffect(()=> {
        console.log(user.user_infos.employeeID)
    },[user])

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[60vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Account Settings</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Effortlessly manage and add users to ensure seamless access and control.</p>
                                </div>
                                <div className="">
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                        onClick={()=>{
                                            // setTimeout(()=>{formik.resetForm();setFormCompleted([])},1000)
                                            close()
                                        }}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 px-4 py-2">
                                <div className={`border-primary border-2 rounded-md py-2 px-5 font-header text-primary w-full flex items-center transition-all ease-in-out gap-x-2 flex-row ${tab === 'basicInfo' ? 'bg-primary text-white' : 'hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white'}`}
                                    onClick={() => setTab('basicInfo')}>
                                    <FontAwesomeIcon icon={faUser} />
                                    <p>Basic Information</p>
                                </div>
                                <div className={`border-primary border-2 rounded-md py-2 px-5 font-header text-primary w-full flex items-center  transition-all ease-in-out gap-x-2 flex-row ${tab === 'creds' ? 'bg-primary text-white' : 'hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white'}`}
                                    onClick={() => setTab('creds')}>
                                    <FontAwesomeIcon icon={faKey} />
                                    <p>Login Credentials</p>
                                </div>
                                <div className={`border-primary border-2 rounded-md py-2 px-5 font-header text-primary w-full flex items-center  transition-all ease-in-out gap-x-2 flex-row ${tab === 'other' ? 'bg-primary text-white' : 'hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white'}`}
                                    onClick={() => setTab('other')}>
                                    <FontAwesomeIcon icon={faSliders} />
                                    <p>Other Option</p>
                                </div>
                            </div>
                            <div className="px-4 py-2">
                                {
                                    tab === 'basicInfo' ?
                                        <div className="flex flex-row gap-4">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="flex items-center justify-center bg-white shadow-md border border-divider w-32 h-32 rounded-full">
                                                    <img src={user.user_infos.profile_image} alt="" className="w-28 h-28 rounded-full" />
                                                </div>
                                            </div>
                                            <div>
                                            <div className="inline-flex flex-col gap-1 row-start-2 col-span-1 py-2">
                                                <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Employee ID <span className="text-red-500">*</span></p>
                                                </label>
                                                <input type="text" name="employeeID"
                                                        value={formik.values.employeeID}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="flex flex-row gap-2">
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
                                            </div>
                                        </div>
                                        </div>
                                    : tab === 'creds' ?
                                        <div className="grid grid-cols-4 gap-2 gap-y-4 pb-2">
                                            <div className="inline-flex flex-col gap-1 col-span-2">
                                                <label htmlFor="MBLearnEmail" className="font-text text-xs flex flex-row justify-between">
                                                    <p>MBemail</p>
                                                </label>
                                                <input type="text" name="MBEmail"
                                                        value={formik.values.MBemail}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-2">
                                                <label htmlFor="MBLearnEmail" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Current Password</p>
                                                </label>
                                                <input type="text" name="MBLearnEmail"
                                                        value={formik.values.middleName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-2">
                                                <label htmlFor="MBLearnEmail" className="font-text text-xs flex flex-row justify-between">
                                                    <p>New Password</p>
                                                </label>
                                                <input type="text" name="MBLearnEmail"
                                                        value={formik.values.middleName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-2">
                                                <label htmlFor="MBLearnEmail" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Confirm New Password</p>
                                                </label>
                                                <input type="text" name="MBLearnEmail"
                                                        value={formik.values.middleName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="font-text text-xs flex flex-row justify-between pb-2">Password Criteria</p>
                                                <ul className='space-y-1'>
                                                    <PasswordRule passed={criteria.length}>At least 8 characters</PasswordRule>
                                                    <PasswordRule passed={criteria.upper}>At least one uppercase letter</PasswordRule>
                                                    <PasswordRule passed={criteria.lower}>At least one lowercase letter</PasswordRule>
                                                    <PasswordRule passed={criteria.number}>At least one number</PasswordRule>
                                                    <PasswordRule passed={criteria.special}>At least one special character</PasswordRule>
                                                </ul>
                                            </div>
                                        </div>
                                    : tab === 'other' ?
                                        <div className="flex flex-col gap-4 py-2">
                                            <div className="flex flex-row gap-4">
                                                <div className="py-1">
                                                    <Switch />
                                                </div>
                                                <div>
                                                    <p className="font-header text-primary">Push Notification</p>
                                                    <p className="font-text text-xs text-unactive">Real-time alerts sent to users about important updates, reminders, or actions, even when they’re not actively using the platform.</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="py-1">
                                                    <Switch />
                                                </div>
                                                <div>
                                                    <p className="font-header text-primary">Show Learning History</p>
                                                    <p className="font-text text-xs text-unactive">Displays a record of all completed courses, assessments, and certifications from different Learner .</p>
                                                </div>
                                            </div>
                                        </div>
                                    : null
                                }
                            </div>
                            <div className="px-4 flex flex-row justify-between gap-2 py-2">
                                <div className={`flex items-center justify-center font-header w-full py-3 bg-white text-primary rounded-md border-2 border-primary hover:border-primaryhover hover:bg-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out`}
                                    onClick={() => {
                                        close();
                                    }}>
                                    Cancel
                                </div>
                                <div className={`flex items-center justify-center font-header w-full bg-primary py-3 text-white rounded-md border-2 border-primary hover:border-primaryhover hover:bg-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out`}>
                                    Update
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default AccountSettingModal;
