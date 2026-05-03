import { faArrowLeft, faCheckCircle, faCircleCheck, faExclamationTriangle, faInfoCircle, faKey, faSpinner, faUserPlus } from "@fortawesome/free-solid-svg-icons";
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
import { useUser } from "../contexts/selecteduserContext";
import { toast } from "sonner";


export default function EditUser() {
    const {setSelectedUser, selectedUser} = useUser()
    const {cities,location,permission,career_level,divisions,roles} = useOption();
    const navigate = useNavigate();
    const [permissions, _setPermission] = useState()
    const [confirm, setConfirm] = useState(false);
    const [Reset, setReset] = useState(false);
    const [reseting, setResetting] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [unsave, setUnsave] = useState(false)

    const formik = useFormik({
        initialValues: {
            MBemail: selectedUser?.MBemail || "",
            Password: "",
            Role: selectedUser?.user_infos?.roles[0]?.id || "",
        },
        validationSchema: Yup.object({
            MBemail: Yup.string().required('required *').email('Invalid email address').matches(
                /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|live\.com|msn\.com|me\.com|mac\.com|metrobank\.com\.ph|company\.org|edu\.ph|org\.ph|novaliches\.sti\.edu\.ph)$/,
                'Only credible or official email domains are allowed'
            ),
            Role: Yup.number().required('required *').test('not-zero', 'Please select a valid role', (value) => value !== 0),
        }),
        onSubmit: values => {
            handleUpdate()
        },
    })

    console.log(selectedUser);

    useEffect(()=>{
        if(Object.keys(selectedUser).length !== 0)
        {
            selectedUser?.user_infos.permissions.map((perms) => {
            setPermissions(perms.id)
            });
            return
        }
        navigate(-1)
    },[selectedUser])

    const rolechange = () => {
        _setPermission([])
        roles.find(r => r.id === Number(formik.values.Role))?.permissions.map((perms) => {
            setPermissions(perms.id)
        });
    }
    const isChecked = (id) => {
        return permissions?.some((p) => p.permission_Id === id);
    }
    useEffect(() => {
        rolechange()
    }, [formik.values.Role])

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

    const resetPassword = () => {
        // if(!Reset) {
        //     setResetting(true);
        //     setTimeout(()=>{
        //     setResetting(false)
        //     setReset(true)
        //     formik.setFieldValue("password", "")

        // },2000)
        // return}
        const reset_password = selectedUser?.user_infos.first_name.replace(/\s+/g, '').trim() + "_" +  selectedUser?.user_infos.employeeID
        formik.setFieldValue("Password", reset_password)
        setReset(true)
    }

    const handleUpdate = () => {
        if(updating) return;
        setUpdating(true)
        const payload = {
            MBemail: formik.values.MBemail,
            password: formik.values.Password,
            role_id: formik.values.Role,
            permissions: permissions || [],
        }

        axiosClient.put(`/update-user-credentials/${selectedUser.id}`, payload)
        .then(({data}) => {
            toast.success("User Updated Successfully")
            setTimeout(()=>{
                setUpdating(false)
                setUnsave(false)
            },2000)
            navigate(-1)
        })
        .catch((err) => {
            toast.success("Error Updating User")
            console.log(err);
            setUpdating(false)
        })
    }

        useEffect (()=>{
            const newValues = {}
            for(const key in formik.values){
                if(Object.prototype.hasOwnProperty.call(formik.values, key)){
                    newValues[key] = formik.values[key] !== formik.initialValues[key]
                }
            }
            const isChanged = Object.keys(formik.values).some(
             (key) => formik.values[key] !== formik.initialValues[key]
            ) || (permissions?.length !== selectedUser?.user_infos?.permissions?.length) || (permissions?.some(p => !selectedUser?.user_infos?.permissions?.some(sp => sp.id === p.permission_Id)))
            setUnsave(isChanged)
        },[formik.values, setPermissions])

        useEffect(()=>{
            console.log(formik.values.Role, typeof formik.values.Role);
        },[formik.values.Role])



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
                    <p className="font-header text-primary text-2xl">Edit User Credential</p>
                    <p className="font-text text-xs text-unactive">Edit necessary credentials and permission of the given user</p>
                </div>
            </div>
            <div className="col-start-4 pr-4 flex justify-end items-center">
                    <div className={`flex items-center justify-center text-white bg-primary rounded-md px-10 py-4 gap-2 hover:cursor-pointer hover:bg-blue-800 transition ${updating || !unsave ? 'opacity-50  hover:cursor-not-allowed' : ''}`}
                        onClick={() => {
                            if(!unsave) return
                            formik.handleSubmit()
                        }}>
                            {
                                updating ?
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className='animate-spin'/>
                                    <p className="font-header">Updating...</p>
                                </>
                                :
                                <>
                                    <FontAwesomeIcon icon={faUserPlus} className=''/>
                                    <p className="font-header">Update User Credentials</p>
                                </>
                            }
                    </div>
                </div>
                <div className="col-span-2 flex flex-col gap-4 py-2 row-start-2">
                    <div className="flex flex-col gap-1">
                        <p className="font-text text-xs text-unactive">Employee's Full Name:</p>
                        <p className="font-text">{selectedUser?.user_infos?.first_name} {selectedUser?.user_infos?.middle_name} {selectedUser?.user_infos?.last_name}</p>
                    </div>
                    <div className="flex flex-row justify-between gap-4">
                        <div className="flex flex-col gap-1 w-full">
                            <p className="font-text text-xs text-unactive">Division:</p>
                            <p className="font-text">{selectedUser?.user_infos?.title?.department?.division?.division_name|| "No Division"}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <p className="font-text text-xs text-unactive">Department:</p>
                            <p className="font-text">{selectedUser?.user_infos?.title?.department?.department_name || "No Department"}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <p className="font-text text-xs text-unactive">Career Level:</p>
                            <p className="font-text">{selectedUser?.user_infos?.title?.career_level?.name || "No Department"} Level</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-text text-xs text-unactive">Title:</p>
                        <p className="font-text">{selectedUser?.user_infos?.title?.title_name || "No Title" }</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col gap-1 w-full">
                            <p className="font-text text-xs text-unactive">City:</p>
                            <p className="font-text">{selectedUser?.user_infos?.city?.city_name || "No City"}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <p className="font-text text-xs text-unactive">Branch:</p>
                            <p className="font-text">{selectedUser?.user_infos?.branch?.branch_name || "No Branch"} </p>
                        </div>
                    </div>
                    <div className="inline-flex flex-col gap-1 w-full py-2">
                    <label htmlFor="MBemail" className="font-text text-xs flex flex-row justify-between">
                        <p>Employee's Email *</p>
                    </label>
                    <div className={`group border rounded-md font-text flex flex-row
                                    focus-within:outline focus-within:outline-2
                                    focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                    {/* ${changes?.MBEmail ? "border-2 border-primary" : "border-divider"} */}
                            <input type="text" name="MBemail"
                                value={formik.values.MBemail}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`font-text w-full rounded-md p-2 focus:outline-none border border-divider`}/>
                    </div>
                        {formik.touched.MBemail && formik.errors.MBemail ? (<div className="text-red-500 text-xs font-text">{formik.errors.MBemail}</div>):null}
                    </div>
                    <div className="pb-2 flex flex-col md:flex-row justify-between">
                        <div className="col-span-2 flex flex-col justify-center py-2">
                            <p className="font-text text-sm">Reset Employee Password</p>
                            <p className="text-xs text-unactive font-text">Reset the current password of the selected user</p>
                        </div>
                        <div className={`flex flex-row gap-2 justify-center items-center py-3 px-5 rounded-md transition-all ease-in-out shdaow-md bg-primary hover:cursor-pointer ${!Reset ? "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white":"text-white hover:bg-primaryhover"}`}
                            onClick={() =>{
                                resetPassword()
                                if(Reset) {
                                }
                            }}>
                            <FontAwesomeIcon icon={reseting || !Reset ? faKey : faCheckCircle}/>

                            <p className="font-header">{ !Reset && !reseting ? "Reset Password" : reseting ? "Reseting..." : "Initial Password Returned"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 py-2 col-span-2 row-start-2 pr-4">
                    <div className="inline-flex flex-col gap-1 col-span-3 pb-2">
                        <label htmlFor="role" className="font-header text-xs flex flex-row justify-between">
                            <p className="text-xs font-text">Account Role <span className="text-red-500">*</span></p>
                        </label>
                        <div className="grid grid-cols-1">
                            <select id="Role" name="Role" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                value={formik.values.Role}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}>
                                <option value='0'>Select Role</option>
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
                        {formik.touched.Role && formik.errors.Role ? (<div className="text-red-500 text-xs font-text">{formik.errors.Role}</div>):null}
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
                                (formik.values.Role === '0' || formik.values.Role === 0) ?
                                <div className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className='text-primary mr-5'/>
                                    <p className="font-text text-unactive text-sm">Please select a role to view permissions</p>
                                </div>
                                : (formik.values.Role === '2' || formik.values.Role === 2) ?
                                permission.slice(8,14).map((perm)=>(
                                    <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                        <label htmlFor={perm.id}>
                                            <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                            <p className="font-text text-unactive text-sm">{perm.description}</p>
                                        </label>
                                            <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                    </div>
                                ))
                                : (formik.values.Role === '3' || formik.values.Role === 3) ?
                                permission.slice(11,14).map((perm)=>(
                                    <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                        <label htmlFor={perm.id}>
                                            <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                            <p className="font-text text-unactive text-sm">{perm.description}</p>
                                        </label>
                                            <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                    </div>
                                ))
                                : (formik.values.Role === '4' || formik.values.Role === 4) ?
                                permission.filter(e => e.permission_name !== "Root").slice(14,29).map((perm) => (
                                    <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                        <label htmlFor={perm.id}>
                                            <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                            <p className="font-text text-unactive text-sm">{perm.description}</p>
                                        </label>
                                            <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() => {setPermissions(permission?.find(p => p.permission_name === perm.permission_name).id)}}/>
                                    </div>
                                )):
                                (formik.values.Role === '5' || formik.values.Role === 5) || (formik.values.Role === '6' || formik.values.Role === 6) ?
                                    <div className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-center">
                                        <FontAwesomeIcon icon={faInfoCircle} className='text-primary mr-5'/>
                                        <p className="font-text text-unactive text-sm">No Special Permission for the given role</p>
                                    </div>
                                :permission.filter(e => e.permission_name !== "Root").slice(0, 14).map((perm) => (
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
        </div>
    )
}
