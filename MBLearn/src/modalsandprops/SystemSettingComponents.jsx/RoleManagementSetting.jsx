import { faBookBookmark, faBookOpenReader, faFileSignature, faGraduationCap, faPenFancy, faRightToBracket, faSave, faSpinner, faSwatchbook, faUserClock, faUserLock, faUsers, faUserShield, faUsersLine } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useForm } from "@inertiajs/vue3"
import { useFormik } from "formik"
import axiosClient from "MBLearn/src/axios-client"
import { Switch } from "MBLearn/src/components/ui/switch"
import { act, useEffect, useMemo, useRef, useState } from "react"
import UnsavedWarningModal from "./UnsavedWarningModal"
import { set } from "date-fns"
import { toast } from "sonner"
import SystemAdminPermissionProps from "./SystemAdminPermssionProps"
import CourseAdminPermissionProps from "./CourseAdminPermissionProps"
import CourseLoading from "../../assets/Course_Loading.svg";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area" // Ensure styles are imported
import LearnerPermissionProps from "./LearnerPermissionProps"
const RoleManagementSetting = () => {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState(0)
    const [_selectedRole, _setSelectedRole] = useState(1)
    const [permission, setPermissions] = useState([])
    const [refPermission, setRefPermission] = useState([])
    const [saved, setSaved] = useState(true);
    const [warning, setWarning] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
    if (!loading && roles.length > 0) {
        const savedTab = localStorage.getItem('selectedRoleTab');
        if (savedTab) {
        changeRoles(Number(savedTab));
        } else {
        // default to first role
        changeRoles(1);
        }
    }
    }, [loading, roles]);
    useEffect(() => {
    if (selectedRole !== null && !loading) {
        localStorage.setItem('selectedRoleTab', selectedRole);
    }
    }, [selectedRole]);
    useEffect(() => {
        return () => {
            localStorage.removeItem('selectedRoleTab');
        }
    }, [])


    // Fetch Roles
    const fetchRoles = () => {
        setLoading(true)
        axiosClient.get('/roles')
        .then(({data}) => {
            setRoles(data.roles)
            setRefPermission(data.permissions)
            setLoading(false)
        })
        .catch(error =>
            {
                setLoading(false)
                toast.error("Failed to fetch roles and permissions")
            }
        );
    }

    useEffect(() => {
        fetchRoles()
    },[])

    //permision handling
    // const availablePermission = () => {
    //     const selected = roles.find((role) => role.id === selectedRole);
    //     if (selected) {
    //         setPermissions(selected.permissions);  // Set permissions if the role is found
    //     } else {
    //         setPermissions([]); // Reset permissions if no role found
    //     }
    // }

    const changeRoles = (id) => {
        if(loading) return
        setSaved(true)
        _setSelectedRole(id)
        setSelectedRole(id)
        const role = roles.find(r => r.id === id)
        const defaultPermission = role.permissions.map((i) => (
            {permission_id: i.id}
        ))
        setPermissions(defaultPermission)
    }

    const isChecked = (id) => {
        return permission?.some(p => p.permission_id === id);
    };

    const permissionswitch = (id,perm_id,permission_name ,checked) => {
        setPermissions((prev) => {
            const exist = prev.find((p) => p.permission_id === id);

            if(exist) {
                return prev.filter((p) => p.permission_id !== id);
            } else {
                return [...prev, {permission_id: id}];
            }
        })
    }

    // Continue Unsaved
    const continueUnsaved = () => {
        // setSaved(true);        // Mark changes as saved
        // setSelectedRole(_selectedRole); // Proceed with the role change
    };

    useEffect(()=>{
        // console.log(permission)
        //console.log(refPermission)
        // console.log(saved)
        //console.log(saving)
        // if(roles.length === 0) return
        // changeRoles(1);
    },[roles])

    // Save Changes
    const saveChanges = () => {
        // const payload = permission.map(({id:permission_Id}) => ({
        //     permission_Id
        // }));
        setSaving(true);
        // API
        axiosClient.post(`/updateRolePermission/${selectedRole}`, permission)
        .then(({data}) => {
            setPermissions(data.message.permissions);
            toast.success("Role Permission Updated", {
                description: "Changes are applied for the selected role"
            });
            setSaved(true);
            fetchRoles();
        })
        .catch((err) => {
            toast.error("Failed to update role permissions");
        })
        .finally(() => {
            setSaving(false);
        });
    };

    const saveStatus = () => {
        if(permission.length === 0) return

        const savedPermissions = roles.find((i) => i.id === selectedRole).permissions.map(p => p.id);
        const unsavedPermissions = permission.map(p => p.permission_id);

        const isSame = savedPermissions.length === unsavedPermissions.length && savedPermissions.every(id => unsavedPermissions.includes(id))


        setSaved(isSame);
    }

    useEffect(() => {
        saveStatus()
    }, [selectedRole, permission]);


    return (
        <>
            {/* Available Role*/}
            <div className="row-span-1 col-span-2 grid gap-2 grid-cols-3 grid-rows-[min-content_auto_auto]">
                <div className="col-span-2
                                md:col-span-3">
                    <p className="text-unactive font-text text-xs">Avaliable Roles:</p>
                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 1 ? "!bg-primary text-white":"bg-white"}`} onClick={()=>changeRoles(1)}>
                    <div>
                        <p className="font-header">System Admin</p>
                        <p className="font-text text-xs">Personnels that mange users</p>
                    </div>
                    <FontAwesomeIcon icon={faUserShield} className="text-4xl"/>
                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 2 ? "!bg-primary text-white":"bg-white"}`} onClick={()=>changeRoles(2)}>
                    <div>
                        <p className="font-header">Course Admin</p>
                        <p className="font-text text-xs">Personnels that manage enrollments</p>
                    </div>
                    <FontAwesomeIcon icon={faBookOpenReader} className="text-4xl"/>
                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 3 ? "!bg-primary text-white":"bg-white"}`} onClick={()=>changeRoles(3)}>
                    <div>
                        <p className="font-header">Learners</p>
                        <p className="font-text text-xs">Personnels that take the courses</p>
                    </div>
                    <FontAwesomeIcon icon={faGraduationCap} className="text-4xl"/>
                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 4 ? "!bg-primary text-white":"bg-white"}`} onClick={()=> changeRoles(4)}>
                    <div>
                        <p className="font-header">SME-Creator</p>
                        <p className="font-text text-xs">Personnels that create courses</p>
                    </div>
                    <FontAwesomeIcon icon={faPenFancy} className="text-4xl"/>

                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 5 ? "bg-primary text-white":"bg-white"}`} onClick={()=> changeRoles(5)}>
                    <div>
                        <p className="font-header">SME-Approver</p>
                        <p className="font-text text-xs">Personnel that approves the courses</p>
                    </div>
                    <FontAwesomeIcon icon={faSwatchbook} className="text-4xl"/>

                </div>
                <div className={`hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out border-2 border-primary rounded-md shadow-md p-4 text-primary flex flex-row justify-between items-center gap-x-2 ${selectedRole === 6 ? "!bg-primary text-white":"bg-white"}`} onClick={()=> changeRoles(6)}>
                    <div>
                        <p className="font-header">SME-Distributor</p>
                        <p className="font-text text-xs">Personnels that distributes the courses</p>
                    </div>
                    <FontAwesomeIcon icon={faBookBookmark} className="text-4xl"/>

                </div>
            </div>

            {/* Permision Settings */}
            <div className="row-span-1 col-span-2 flex flex-col">
                <div className="row-span-1 col-span-2 flex flex-row justify-between items-center pt-5 pb-2">
                    <div>
                        <h1 className="font-header text-primary text-base">
                            {
                                selectedRole === 1 ? "System Admin "
                                : selectedRole === 2 ? "Course Admin "
                                : selectedRole === 3 ? "Learner "
                                : selectedRole === 4 ? "Subject Matter Experts - Creator "
                                : selectedRole === 5 ? "Subject Matter Experts - Approver "
                                : selectedRole === 6 ? "Subject Matter Experts - Distributor "
                                : null
                            }
                            Default Role Permission</h1>
                        <p className="font-text text-unactive text-xs">Cutomize the selected role's permission to the system funtionalities</p>
                    </div>
                    <div className="md:block hidden">
                        {
                            !saved ? (
                                <div className={`flex flex-row justify-center items-center border-2 border-primary py-2 px-8 font-header bg-secondarybackground rounded-md text-primary gap-5 w-full ${saving ? null : "hover:bg-primary hover:text-white"} hover:cursor-pointer transition-all ease-in-out shadow-md`} onClick={!saving ? saveChanges : null}>
                                    {
                                        saving ? (
                                            <p>Saving Changes...</p>
                                        ) : (<>
                                            <FontAwesomeIcon icon={faSave}/>
                                            <p>Save Changes</p>
                                        </>)
                                    }

                                </div>
                            ) : (null)
                        }
                    </div>
                    <div className="group md:hidden block relative">
                        {
                            !saved ? (
                                <>
                                    <div className={`w-10 h-10 flex items-center justify-center border-primary border-2 rounded-md text-xl text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out shadow-md ${saving ? null : "hover:bg-primary hover:text-white"}`}
                                        onClick={!saving ? saveChanges : null}>
                                        <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`${saving ? "animate-spin":null}`}/>
                                    </div>
                                    <div className="absolute top-12 bg-tertiary text-white font-text text-xs p-2 rounded-md shadow-md scale-0 group-hover:scale-100 transition-all ease-in-out">
                                        Save
                                    </div>
                                </>
                            ) : (null)
                        }
                    </div>
                </div>

                {
                    loading ? (
                        // Loading
                        <div className="flex flex-col gap-2">
                            {
                                Array.from({length: 3}).map((i)=> (
                                    <div className="h-16 w-full rounded-md border border-divider shadow-md bg-white animate-pulse" />
                                ))
                            }
                        </div>
                    ) :
                    <div className="flex flex-col gap-2">
                        {
                            selectedRole === 2 ?
                            refPermission.filter(e => e.permission_name !== "Root").slice(8,14).map((perm) => (
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() =>  permissionswitch(perm.id)}/>
                                </div>
                            ))
                            : selectedRole === 3 ?
                            refPermission.filter(e => e.permission_name !== "Root").slice(11,14).map((perm) => (
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() =>  permissionswitch(perm.id)}/>
                                </div>
                            ))
                            : selectedRole === 4 ?
                            refPermission.filter(e => e.permission_name !== "Root").slice(14,29).map((perm) => (
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() =>  permissionswitch(perm.id)}/>
                                </div>
                            )) :
                            selectedRole === 5 || selectedRole === 6 ?
                            <div className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-center">
                                <p className="font-text text-unactive text-sm">No available permission to set for this role</p>
                            </div>
                            :
                            refPermission.filter(e => e.permission_name !== "Root").slice(0,14).map((perm) => (
                                <div key={perm.id} className="w-full border border-divider rounded-md bg-white shadow-md p-4 flex flex-row items-center justify-between">
                                    <label htmlFor={perm.id}>
                                        <h1 className="font-header text-primary text-base">{perm.label}</h1>
                                        <p className="font-text text-unactive text-sm">{perm.description}</p>
                                    </label>
                                        <Switch id={perm.id} checked={isChecked(perm.id)} onCheckedChange={() =>  permissionswitch(perm.id)}/>
                                </div>
                            ))
                        }
                    </div>
                }

                </div>
            {/* UnsavedWarningModal */}
            <UnsavedWarningModal isOpen={warning} close={() => setWarning(false)} onContinue={continueUnsaved}/>
            </>
    );
}
export default RoleManagementSetting;
