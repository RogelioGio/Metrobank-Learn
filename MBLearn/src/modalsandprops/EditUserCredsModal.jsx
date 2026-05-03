import { faCheckCircle, faEye, faEyeSlash, faKey, faMinusCircle, faPlusCircle, faRotateRight, faTurnDown, faUserGroup, faUserLock, faUserPen, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useUser } from "../contexts/selecteduserContext";
import { useEffect, useState } from "react";
import { useOption } from "../contexts/AddUserOptionProvider";
import { useFormik } from "formik";
import axiosClient from "../axios-client";
import EdituserErrorModal from "./EdituserErrorModal";
import AccountPermissionProps from "./AccountPermissionsProps"
import { DatabaseZap, Edit } from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";
import { parse } from "date-fns";
import EditAccountPermProps from "./EditAccountPermProps";
import UnsavedEditUserPromptModal from "./UnsaveEditUserPromptModal";


const EditUserCredsModal = ({open, close, User, ID, editSuccess}) => {
    const {user} = useStateContext()
    const [isLoading, setLoading] = useState(true);
    const {cities=[], titles=[], location=[], roles=[], departments=[], permission=[]} = useOption();
    const [tab, setTab] = useState(1)
    const [updating, setUpdating] = useState(false)
    const [Role, setRoles] = useState([])
    const [selectedUser, setSelectedUser] = useState()
    const [accountPerm, setAccountPerm] =useState([])
    const [reseting, setResetting] = useState(false)
    const [Reset, setReset] = useState(false);
    const [unsave,setUnsave] = useState(false)
    const [changes, setChanges] = useState({});
    const [selectedUserPermission, setSelectedUserPermissions] = useState([])
    const [initialPerms, setInitialPerms] = useState([])
    const [addedPerms, setAddedPerms] = useState()
    const [removedPerms, setRemovedPerms] = useState()
    const [unsavePromt, setUnsavePrompt] = useState(false)

    //Permission Check
    const hasPermission = (user, perms = []) => {
        return user?.user_infos?.permissions?.some(permission =>
            perms.includes(permission.permission_name)
        );
    };

    useEffect(() => {
        setSelectedUser(User)
        setSelectedUserPermissions(User?.user_infos?.permissions.map(p => ({id: p.id, permission_name: p.permission_name})))
        setInitialPerms(User?.user_infos?.permissions.map(p => ({id: p.id, permission_name: p.permission_name})))
    },[User])
    //Handle Password

    useEffect(() => {
        formik.resetForm();
        setReset(true)
        setUpdating(false)
    },[])

    //Must Seperate the formik from the modal
    const formik = useFormik({
        enableReinitialize: true,
        initialValues:
        tab === 1 ? {
            MBEmail: selectedUser?.MBemail.split('@')[0] || "Loading...",
            password: selectedUser?.password,
        }:{
            role: selectedUser?.user_infos.roles?.[0].id || "Loading",
        },

        onSubmit: (values) => {
            setUpdating(true);

            if (tab === 1) {
                const payload = {
                MBemail: values.MBEmail.toLowerCase()+"@mbtc.com",
                password: values.password,
                };

                axiosClient.put(`/update-user-creds/${ID}`, payload)
                .then((res) => {
                    console.log(res);
                    close();
                    editSuccess();
                    setTimeout(() => {
                        setTab(1);
                        setUpdating(false);
                        formik.resetForm();
                        setunsave(false);
                    },500);

                })
                .catch((err) => {
                    setErrorMessage({
                        message: err.response?.data?.message,
                        errors: err.response?.data?.errors,
                    });
                    setError(true);
                    setUpdating(false);
                });
            } else {
                const payload = {
                    role: values.role,
                    permissions: selectedUserPermission.map(p => ({permissionId: p.id}))
                }

                axiosClient.put(`/updatetest/${selectedUser.id}`,payload)
                .then((res)=>{
                    close();
                    editSuccess();
                    setTimeout(() => {
                        setTab(1);
                        setUpdating(false);
                        formik.resetForm();
                    },500);
                })
            }
        }
    })

    //reset
    const resetPassword = () => {
        if(!Reset) {
            setResetting(true);
            setTimeout(()=>{
            setResetting(false)
            setReset(true)
            formik.setFieldValue("password", "")

        },2000)
        return}

        setResetting(true);
        const reset_password = User?.user_infos.first_name.replace(/\s+/g, '').trim() + "_" +  User?.user_infos.employeeID
        formik.setFieldValue("password", reset_password)
        setTimeout(()=>{
            setResetting(false)
            setReset(false)
        },2000)
    }

    //Update Error
    const [OpenError, setError] = useState(false)
    //Data
        const [errorMessage, setErrorMessage] = useState({
            message: '',
            errors: {}
        })

    // useEffect(() => {
    //     if (formik.values.role) {
    //         console.log("Selected Role ID:", formik.values.role);
    //         console.log("Permissions:", permission);
    //     }
    // }, [formik.values.role, permission]);

    const content = (section) => {
        return section === 1 ? (
            <>
                <div className="px-4 grid grid-cols-1 gap-y-2 py-2
                                md:grid-cols-3">
                    <div>
                        <p className="font-text text-xs text-unactive">Employee's Full Name:</p>
                        <p className="font-text">{selectedUser?.user_infos.first_name} {selectedUser?.user_infos.middle_name} {selectedUser?.user_infos.last_name}</p>
                    </div>
                    <div>
                        <p className="font-text text-xs text-unactive">Department & Title:</p>
                        <p className="font-text">{selectedUser?.user_infos.department?.department_name}</p>
                        <p className="font-text text-xs">{selectedUser?.user_infos.title?.title_name}</p>
                    </div>
                    <div>
                        <p className="font-text text-xs text-unactive">Metrobank Branch:</p>
                        <p className="font-text">{selectedUser?.user_infos.branch.branch_name}</p>
                        <p className="font-text text-xs">{selectedUser?.user_infos.city?.city_name}</p>
                    </div>
                </div>
                <div className="inline-flex flex-col gap-1 w-full px-4 py-2">
                    <label htmlFor="MBEmail" className="font-text text-xs text-unactive flex flex-row justify-between">
                        <p>Employee's Metrobank Email *</p>
                    </label>
                    <div className={`group border rounded-md font-text flex flex-row
                                    focus-within:outline focus-within:outline-2
                                    focus-within:-outline-offset-2 focus-within:outline-primary
                                    ${changes?.MBEmail ? "border-2 border-primary" : "border-divider"}`}>
                        <input type="text" name="MBEmail"
                            value={formik.values.MBEmail}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`font-text w-full rounded-md p-2 focus:outline-none`}/>
                        <div className={`py-2 px-5 rounded-r-xs group-focus-within:bg-primary group-focus-within:text-white ${changes?.MBEmail ? "bg-primary text-white" : "bg-divider"}`}>
                            @mbtc.com
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-2 flex flex-col md:flex-row justify-between">
                    <div className="col-span-2 flex flex-col justify-center py-2">
                        <p className="font-text text-unactive text-xs">Reset Employee Password</p>
                        <p className="text-xs text-unactive font-text">Reset the current password of the selected user</p>
                    </div>
                    <div className={`flex flex-row gap-2 justify-center items-center py-3 px-5 rounded-md transition-all ease-in-out shdaow-md bg-primary hover:cursor-pointer ${!Reset ? "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white":"text-white hover:bg-primaryhover"}`}
                        onClick={() =>{
                            resetPassword()
                            if(Reset) {
                            }
                        }}>
                        <FontAwesomeIcon icon={!Reset ? faCheckCircle : faKey}/>

                        <p className="font-header">{!Reset && reseting ? "Returning Password" : reseting ? "Reseting....": !Reset ? "Password Reset" :"Reset Password"}</p>
                    </div>
                </div>
            </>
        ):section === 2 ? (
            <>
            <div className="inline-flex flex-col gap-1 py-2 px-4 w-full">
                <label htmlFor="role" className="font-header text-xs flex flex-row justify-between">
                    <p className="text-xs font-text">Employee's Account Role <span className="text-red-500">*</span></p>
                </label>
                <div className="grid grid-cols-1">
                    <select id="role" name="role" className={`appearance-none font-text col-start-1 row-start-1 border rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.role ? "border-2 border-primary" : "border-divider"}`}
                        value={formik.values.role}
                        onChange={(e)=>{
                            formik.setFieldValue('role',parseInt(e.target.value)||"")
                        }}

                        onBlur={formik.handleBlur}
                        disabled={!hasPermission(user, ["EditUserRoles"])}
                        >
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
                <div className="px-4">
                    <div>
                        <div>
                            <p className="font-text text-xs">Account Role Permissions</p>
                            <p className="font-text text-xs text-unactive">This is the given account permissions for the selected role.</p>
                        </div>
                        <div className="grid grid-cols-3 py-2">
                            {
                                addedPerms > 0 ?
                                <div className="flex flex-row items-center">
                                    <p className="font-text text-xs text-primary
                                                    md:text-base"><span className="text-sm"><FontAwesomeIcon icon={faPlusCircle}/></span>  Added: {addedPerms}</p>
                                </div> : null
                            }
                            {
                                removedPerms > 0 ?
                                <div className="flex flex-row items-center">
                                    <p className="font-text text-xs text-primary
                                                    md:text-base"><span className="text-sm"><FontAwesomeIcon icon={faMinusCircle}/></span>  Removed: {removedPerms}</p>
                                </div>  : null
                            }
                            {
                                removedPerms > 0 || addedPerms > 0 ?
                                <div className="col-start-3 flex flex-row justify-end items-center gap-2">
                                    <div className="border-2 border-primary rounded-md flex items-center justify-center text-white bg-primary hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out
                                                    md:py-2 md:px-3 md:w-full
                                                    w-10 h-10 text-base"
                                        onClick={()=>{
                                            setSelectedUserPermissions(initialPerms)

                                            if(formik.initialValues.role !== formik.values.role){
                                                formik.setFieldValue('role', selectedUser?.user_infos.roles?.[0].id || "")
                                            }
                                            }}>
                                        <p className="font-header md:block hidden">Reset Changes</p>
                                        <p className="md:hidden"><FontAwesomeIcon icon={faRotateRight}/></p>
                                    </div>
                                </div>
                                : null
                            }

                        </div>
                    </div>
                    <EditAccountPermProps initialRole={selectedUser?.user_infos.roles?.[0].id} selectedRole={formik.values.role} referencePermission={permission} roleWithPermission={roles} currentPermission={selectedUserPermission} setCurrentPermission={setSelectedUserPermissions}/>
                    <div className="py-2"/>

                </div>
            }
            </>
        ) : null
    }

    useEffect (()=>{
        const newValues = {}
        for(const key in formik.values){
            if(Object.prototype.hasOwnProperty.call(formik.values, key)){
                newValues[key] = formik.values[key] !== formik.initialValues[key]
            }
        }
        setChanges(newValues)
        const isChanged = Object.keys(formik.values).some(
            (key) => formik.values[key] !== formik.initialValues[key]
        )
        setUnsave(isChanged)
    },[formik.values, selectedUserPermission])
    useEffect(()=>{
        const initialPerms = User?.user_infos?.permissions.map(p => ({id: p.id, permission_name: p.permission_name}))
        if (!Array.isArray(initialPerms) || !Array.isArray(selectedUserPermission)) return;

        const ids1 = initialPerms.map(p=>p.id).sort()
        const ids2 = selectedUserPermission.map(p=>p.id).sort()

        setAddedPerms(ids2.filter(id => !ids1.includes(id)).length)
        setRemovedPerms(ids1.filter(id => !ids2.includes(id)).length)

        const permChanges = ids1.length === ids2.length && ids1.every((id, index) => id === ids2[index])
        setUnsave(!permChanges)
    },[selectedUserPermission])
    return(
        <>
        <Dialog open={open} onClose={()=>{isLoading ? close : null}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        lg:w-[60vw]'>
                        <div className='bg-white rounded-md h-full w-full p-5 flex flex-col justify-center'>
                            {/* Header */}
                            <div className="py-4 mx-4 border-b border-divider flex flex-row justify-between item-center gap-4">
                                <div>
                                    <h1 className="text-primary font-header
                                                    text-base
                                                    md:text-2xl">Edit User Credentials & System Access</h1>
                                    <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-sm">Enables administrators to update and modify user credentials and account details.</p>
                                </div>
                                <div className="">
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                        onClick={()=>{if(updating) return;
                                        if(unsave) {
                                            setUnsavePrompt(true)
                                            return;
                                        }
                                        close(),setTimeout(()=>{formik.resetForm(),setReset(true),setTab(1),setSelectedUserPermissions(initialPerms)},500)}}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>
                            {/* Tab for Editing */}
                            {
                                hasPermission(user, ["EditUserCredentials"]) &&  hasPermission(user, ["EditUserCredentials"]) ? (
                                    <div className='row-start-2 col-span-4 w-auto mx-5 py-3 gap-3'>
                                        <div className="w-full flex flex-row rounded-md shadow-md hover:cursor-pointer">
                                            <span className={`w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary rounded-l-md py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 1 ? 'bg-primary text-white' : ''}
                                                            text-xs gap-1 justify-center
                                                            md:text-base md:gap-5 md:px-5 md:justify-start`} onClick={() =>{setTab(1)}}>
                                                <FontAwesomeIcon icon={faUserLock}/>
                                                Account Credentials
                                            </span>
                                            <span className={`w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary rounded-r-md px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 2 ? 'bg-primary text-white' : ''}
                                                            text-xs gap-1 justify-center px-0
                                                            md:text-base md:gap-5 md:px-5 md:justify-start`} onClick={() =>{setTab(2)}}>
                                                <FontAwesomeIcon icon={faUserGroup}/>
                                                Roles and Permission
                                            </span>
                                        </div>
                                    </div>
                                ) : null
                            }
                            <form onSubmit={formik.handleSubmit}>
                                {
                                    hasPermission(user, ["EditUserCredentials"]) && hasPermission(user, ["EditUserRoles"] ) ? (
                                        content(tab)
                                    ) : hasPermission(user, ["EditUserCredentials"]) ? (
                                        <>
                                        <div className="px-4 grid grid-cols-1 gap-y-2 py-2
                                                    md:grid-cols-3">
                                        <div>
                                            <p className="font-text text-xs text-unactive">Employee's Full Name:</p>
                                            <p className="font-text">{selectedUser?.user_infos.first_name} {selectedUser?.user_infos.middle_name} {selectedUser?.user_infos.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="font-text text-xs text-unactive">Department & Title:</p>
                                            <p className="font-text">{selectedUser?.user_infos.department?.department_name}</p>
                                            <p className="font-text text-xs">{selectedUser?.user_infos.title?.title_name}</p>
                                        </div>
                                        <div>
                                            <p className="font-text text-xs text-unactive">Metrobank Branch:</p>
                                            <p className="font-text">{selectedUser?.user_infos.branch.branch_name}</p>
                                            <p className="font-text text-xs">{selectedUser?.user_infos.city?.city_name}</p>
                                        </div>
                                        </div>
                                        <div className="inline-flex flex-col gap-1 w-full px-4 py-2">
                                        <label htmlFor="MBEmail" className="font-text text-xs text-unactive flex flex-row justify-between">
                                            <p>Employee's Metrobank Email *</p>
                                        </label>
                                        <div className={`group border rounded-md font-text flex flex-row
                                                        focus-within:outline focus-within:outline-2
                                                        focus-within:-outline-offset-2 focus-within:outline-primary
                                                        ${changes?.MBEmail ? "border-2 border-primary" : "border-divider"}`}>
                                            <input type="text" name="MBEmail"
                                                value={formik.values.MBEmail}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`font-text w-full rounded-md p-2 focus:outline-none`}/>
                                            <div className={`py-2 px-5 rounded-r-xs group-focus-within:bg-primary group-focus-within:text-white ${changes?.MBEmail ? "bg-primary text-white" : "bg-divider"}`}>
                                                @mbtc.com
                                            </div>
                                        </div>
                                        </div>
                                        <div className="px-4 pb-2 flex flex-col md:flex-row justify-between">
                                        <div className="col-span-2 flex flex-col justify-center py-2">
                                            <p className="font-text text-unactive text-xs">Reset Employee Password</p>
                                            <p className="text-xs text-unactive font-text">Reset the current password of the selected user</p>
                                        </div>
                                        <div className={`flex flex-row gap-2 justify-center items-center py-3 px-5 rounded-md transition-all ease-in-out shdaow-md bg-primary hover:cursor-pointer ${!Reset ? "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white":"text-white hover:bg-primaryhover"}`}
                                            onClick={() =>{
                                                resetPassword()
                                                if(Reset) {
                                                }
                                            }}>
                                            <FontAwesomeIcon icon={!Reset ? faCheckCircle : faKey}/>

                                            <p className="font-header">{!Reset && reseting ? "Returning Password" : reseting ? "Reseting....": !Reset ? "Password Reset" :"Reset Password"}</p>
                                        </div>
                                        </div>
                                        </>
                                    ) : hasPermission(user, ["EditUserRoles"] ) ? (
                                        //<AccountPermissionProps refPermissions={permission} selectedRole={formik.values.role} role={roles} setAccountPerm={setAccountPerm} currentPerm={selectedUser.user_infos.permissions} originalRole={selectedUser.user_infos.roles[0].id}/>
                                        <>
                                        <div className="inline-flex flex-col gap-1 py-2 px-4 w-full">
                                            <label htmlFor="role" className="font-header text-xs flex flex-row justify-between">
                                                <p className="text-xs font-text">Employee's Account Role <span className="text-red-500">*</span></p>
                                            </label>
                                            <div className="grid grid-cols-1">
                                                <select id="role" name="role" className={`appearance-none font-text col-start-1 row-start-1 border rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.role ? "border-2 border-primary" : "border-divider"}`}
                                                    value={formik.values.role}
                                                    onChange={(e)=>{
                                                        formik.setFieldValue('role',parseInt(e.target.value)||"")
                                                    }}

                                                    onBlur={formik.handleBlur}
                                                    disabled={!hasPermission(user, ["EditUserRoles"])}
                                                    >
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

                                        <div className="px-4">
                                            <div>
                                                <div>
                                                    <p className="font-text text-xs">Account Role Permissions</p>
                                                    <p className="font-text text-xs text-unactive">This is the given account permissions for the selected role.</p>
                                                </div>
                                                <div className="grid grid-cols-3 py-2">
                                                    {
                                                        addedPerms > 0 ?
                                                        <div className="flex flex-row items-center">
                                                            <p className="font-text text-xs text-primary
                                                                            md:text-base"><span className="text-sm"><FontAwesomeIcon icon={faPlusCircle}/></span>  Added: {addedPerms}</p>
                                                        </div> : null
                                                    }
                                                    {
                                                        removedPerms > 0 ?
                                                        <div className="flex flex-row items-center">
                                                            <p className="font-text text-xs text-primary
                                                                            md:text-base"><span className="text-sm"><FontAwesomeIcon icon={faMinusCircle}/></span>  Removed: {removedPerms}</p>
                                                        </div>  : null
                                                    }
                                                    {
                                                        removedPerms > 0 || addedPerms > 0 ?
                                                        <div className="col-start-3 flex flex-row justify-end items-center gap-2">
                                                            <div className="border-2 border-primary rounded-md flex items-center justify-center text-white bg-primary hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out
                                                                            md:py-2 md:px-3 md:w-full
                                                                            w-10 h-10 text-base"
                                                                onClick={()=>{
                                                                    setSelectedUserPermissions(initialPerms)

                                                                    if(formik.initialValues.role !== formik.values.role){
                                                                        formik.setFieldValue('role', selectedUser?.user_infos.roles?.[0].id || "")
                                                                    }
                                                                    }}>
                                                                <p className="font-header md:block hidden">Reset Changes</p>
                                                                <p className="md:hidden"><FontAwesomeIcon icon={faRotateRight}/></p>
                                                            </div>
                                                        </div>
                                                        : null
                                                    }

                                                </div>
                                                </div>
                                                    <EditAccountPermProps initialRole={selectedUser?.user_infos.roles?.[0].id} selectedRole={formik.values.role} referencePermission={permission} roleWithPermission={roles} currentPermission={selectedUserPermission} setCurrentPermission={setSelectedUserPermissions}/>
                                                    <div className="py-2"/>

                                                </div>

                                        </>
                                    ) : null
                                }
                            </form>
                            <div className="flex flex-row justify-between gap-2 mx-4 py-2">
                                <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                    onClick={()=>{
                                        if(updating) return;
                                        if(unsave) {
                                            setUnsavePrompt(true)
                                            return;
                                        }
                                        close(),setTimeout(()=>{formik.resetForm(),setReset(true),setTab(1),setSelectedUserPermissions(initialPerms)},500)}
                                    }>
                                    <p className="font-header">Cancel</p>
                                </div>
                                <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white transition-all ease-in-out ${updating ? "opacity-50 hover:cursor-not-allowed" : !unsave ? "opacity-50 hover:cursor-not-allowed":"hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover"}`}
                                    onClick={()=>{
                                            if(updating || !unsave) return;
                                            formik.handleSubmit()
                                        }}>
                                    <p className="font-header">{updating ? "Updating...": "Update"}</p>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>

        </Dialog>
        <EdituserErrorModal error={OpenError} close={()=>setError(false)} message={errorMessage.message} desc={errorMessage.errors}/>
        <UnsavedEditUserPromptModal open={unsavePromt} close={()=>setUnsavePrompt(false)} discardChanges={()=>{close(),setUnsavePrompt(false),setTimeout(()=>{formik.resetForm(),setReset(true),setTab(1),setSelectedUserPermissions(initialPerms)},500)}}/>

        </>
    )
}
export default EditUserCredsModal
