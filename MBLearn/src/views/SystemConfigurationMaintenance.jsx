import { faBars, faBook, faBookAtlas, faBookOpen, faChevronLeft, faChevronRight, faFileSignature, faFolderClosed, faRotateLeft, faSliders, faTrash, faUserClock, faUserLock, faUsers, faUsersLine, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Helmet } from "react-helmet"
import axiosClient from "../axios-client"
import { act, useEffect, useRef, useState } from "react"
import RoleManagementSetting from "../modalsandprops/SystemSettingComponents.jsx/RoleManagementSetting"
import FormInputSetting from "../modalsandprops/SystemSettingComponents.jsx/FormInputSetting"
import ReactivationAccountSetting from "../modalsandprops/SystemSettingComponents.jsx/ReactivationAccountSetting"
import { useStateContext } from "../contexts/ContextProvider"
import Test_Notfications from "./Test"
import ArchiveAndAuditingSetting from "../modalsandprops/SystemSettingComponents.jsx/ArchiveAndAuditingSetting"
import CourseFormInputSetting from "../modalsandprops/SystemSettingComponents.jsx/CourseFormInputSetting"
import SystemContentSetting from "../modalsandprops/SystemSettingComponents.jsx/SystemContentSetting"
import React from "react"
import { ScrollArea } from "../components/ui/scroll-area"
import { Sheet, SheetContent, SheetOverlay, SheetTrigger } from "../components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import DeletedFormInput from "../modalsandprops/SystemSettingComponents.jsx/DeletedFormInput"
import { toast } from "sonner"
import { useOption } from "../contexts/AddUserOptionProvider"
import { set } from "date-fns"
import DeleteCourseFormInput from "../modalsandprops/SystemSettingComponents.jsx/DeletedCourseFormInput"
import DeletedCourseFormInput from "../modalsandprops/SystemSettingComponents.jsx/DeleteCourseFormInputs"


export default function SystemConfiguration() {
    const {user} = useStateContext();
    const [tab, setTab] = useState(1)
    const [breakpoint, setBreakpoint] = useState();
    const [open, setOpen] = useState(false)
    const [inputs, setInputs] = useState("division");
    const [viewport, setViewport] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [selected, setSelected] = useState([]);
    const [processing, setProcessing] = useState(false);
    const {fetchOptions} = useOption();
    const [action, setAction] = useState("");

    useEffect(()=> {
        const savedTab = localStorage.getItem('systemConfigTab');
        if (savedTab) {
            setTab(Number(savedTab));
        }

        return () => {
            localStorage.removeItem('systemConfigTab');
        }
    },[])
    useEffect(() => {
        localStorage.setItem('systemConfigTab', tab);
        setSelected([])
        if(tab === 2 || tab === 5){
            setInputs("division")
        }
    }, [tab]);

    useEffect(() => {
        const handleResize = () => {
        setViewport({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        const { width } = viewport;

        if (width < 640) {
            setBreakpoint('base');
        } else if (width >= 640 && width < 768) {
            setBreakpoint('sm');
        } else if (width >= 768 && width < 1024) {
            setBreakpoint('md');
        } else if (width >= 1024 && width < 1280) {
            setBreakpoint('lg');
        } else if (width >= 1280 && width < 1536) {
            setBreakpoint('xl');
        } else {
            setBreakpoint('2xl');
        }
    }, [viewport]);
    useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            setOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    }, []);


    const handleAction = (action, entryType) => {
        if(processing) return;
        const payload = {
            data: selected,
            type: inputs,
            action: action
        }
        setProcessing(true);
        axiosClient.post('/inputs/bulk', payload)
        .then(({data}) => {
            setProcessing(false);
            setSelected([]);
            fetchOptions();
            toast.success(data.message || "Action completed successfully.")
        })
        .catch((error) => {
             setProcessing(false);
            toast.error(error.response.data.message || "An error occurred. Please try again.")
        })
    }



    return (
        <div className='grid grid-cols-4 h-full w-full
                        grid-rows-[6.25rem_min-content]
                        xl:grid-rows-[6.25rem_min-content_auto_auto_min-content]
                        sm:grid-rows-[6.25rem_min-content]'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | System Configuration Maintenance</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center row-span-1 border-b border-divider
                            col-start-1 row-start-1 col-span-4 mx-3
                            xl:col-span-4
                            sm:col-span-4 sm:mx-4'>
                <h1 className='text-primary font-header
                                text-xl
                                sm:text-2xl
                                xl:text-4xl'>System Configuration Maintenance</h1>
                <p className='font-text text-unactive
                                text-xs
                                xl:text-sm
                                sm:text-xs'>Module for managing and customizing system settings to ensure optimal performance and functionality.</p>
            </div>
            {/* Settings Tabs */}
            <div className="col-start-1 col-span-1 row-span-3 border-r border-divider px-3 py-3  items-center flex-col gap-1 hidden
                            lg:flex">
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 1 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(1)}>
                        <FontAwesomeIcon icon={faUsersLine}/>
                        <h1 className="uppercase font-text">Role Management</h1>
                    </div>
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 2 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(2)}>
                        <FontAwesomeIcon icon={faFileSignature}/>
                        <h1 className="uppercase font-text">Form Input Setting</h1>
                    </div>
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 5 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(5)}>
                        <FontAwesomeIcon icon={faTrash}/>
                        <h1 className="uppercase font-text">Deleted Form Input Setting</h1>
                    </div>
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 3 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(3)}>
                        <FontAwesomeIcon icon={faBook}/>
                        <h1 className="uppercase font-text">Course Form Input Settings</h1>
                    </div>
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 6 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(6)}>
                            <FontAwesomeIcon icon={faTrash}/>
                            <h1 className="uppercase font-text">Deleted Course Form Inputs</h1>
                    </div>
                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 4 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(4)}>
                        <FontAwesomeIcon icon={faSliders}/>
                        <h1 className="uppercase font-text">System Content Settings</h1>
                    </div>
            </div>

            {/* Mobile */}
            <div className="flex col-span-4 lg:hidden py-2 mx-3 gap-4 items-center">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger>
                            <div onClick={()=>setOpen(true)} className="flex items-center justify-center w-10 h-10 border-2 border-primary rounded-md text-xl shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out">
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </div>
                        </SheetTrigger>
                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all z-50"/>
                        <SheetContent side='left' className='bg-background backdrop-blur-sm'>
                            <div className=''>
                                <h1 className='font-header text-xl text-primary'>System Configuration Modules</h1>
                            </div>
                            <div className="py-3 flex flex-col gap-y-2">
                                <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 1 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(1)}>
                                    <FontAwesomeIcon icon={faUsersLine}/>
                                    <h1 className="uppercase font-text">Role Management</h1>
                                </div>
                                <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 2 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(2)}>
                                    <FontAwesomeIcon icon={faFileSignature}/>
                                    <h1 className="uppercase font-text">Form Input Setting</h1>
                                </div>

                                {
                                    user.user_infos.permissions?.some((permission)=> permission.permission_name === "AccountReactivation") ?
                                    <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 3 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(3)}>
                                    <FontAwesomeIcon icon={faUserClock}/>
                                    <h1 className="uppercase font-text">Re-Activation Account</h1>
                                    </div>:null
                                }
                                <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 4 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(4)}>
                                    <FontAwesomeIcon icon={faBook}/>
                                    <h1 className="uppercase font-text">Course Form Input Settings</h1>
                                </div>
                                <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 5 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(5)}>
                                    <FontAwesomeIcon icon={faSliders}/>
                                    <h1 className="uppercase font-text">System Content Settings</h1>
                                </div>
                                <div className= {`flex flex-row  items-center w-full px-3 py-3 gap-4 text-sm text-unactive hover:text-primary hover:bg-divider rounded-md cursor-pointer transition-all ease-in-out ${tab === 6 ? '!bg-divider !text-primary':null}`} onClick={() => setTab(6)}>
                                    <FontAwesomeIcon icon={faFolderClosed}/>
                                    <h1 className="uppercase font-text">Archive and Auditing Settings</h1>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    {
                        tab === 1 ?
                        <div>
                            <h1 className="font-header text-primary text-xl">Role Management</h1>
                            <p className="font-text text-unactive text-xs">Create and manage roles function and permission in the system</p>
                        </div>
                        : tab === 2 ?
                        <div>
                            <h1 className="font-header text-primary text-xl">Form-Input Setting</h1>
                            <p className="font-text text-unactive text-xs">Manage all available inputs that are going to be used in several forms in the system</p>
                        </div>
                        : tab === 3 ?
                        <div>
                            <h1 className="font-header text-primary text-xl">Re-Activation Account Management</h1>
                            <p className="font-text text-unactive text-xs">Manage and list all available inactive employee accounts in the system for reactivation</p>
                        </div>
                        :tab === 4 ?
                        <div>
                            <h1 className="font-header text-primary text-xl">Course Form Inputs</h1>
                            <p className="font-text text-unactive text-xs">Defines the fields and input options required when creating or editing a course</p>
                        </div>
                        :tab === 5 ?
                        <div>
                            <h1 className="font-header text-primary text-xl">System Content Setting</h1>
                            <p className="font-text text-unactive text-xs">Settings that handle on system content customizations</p>
                        </div>
                        :null


                    }
                </div>

            {/* Mobile */}
            <div className="col-span-4 mx-3 pt-2 pb-5 lg:hidden">
                {
                    tab === 1 ? (
                        <RoleManagementSetting/>
                    ) : tab === 2 ? (
                        <FormInputSetting/>
                    ) : tab === 3 ? (
                        <ReactivationAccountSetting/>
                    ) : tab === 4 ? (
                        <CourseFormInputSetting/>
                    ): tab === 5 ? (
                        <SystemContentSetting/>
                    )
                    : null
                }
            </div>

            {/* Wide-Screen */}
            <div className="col-span-3 hidden row-span-3
                            lg:flex flex-col relative">
                <ScrollArea className="col-span-3 row-span-3 overflow-visible h-[calc(100vh-6.25rem)] flex flex-col">
                    <div className="px-4 h-[calc(100vh-6.25rem)]">
                        {
                        tab === 1 ?
                        <div className="py-5">
                            <h1 className="font-header text-primary text-xl">Role Management</h1>
                            <p className="font-text text-unactive text-xs">Create and manage roles function and permission in the system</p>
                        </div>
                        : tab === 2 ?
                        <div className="py-5 flex flex-row items-center justify-between ">
                            <div className="flex-col flex">
                                <h1 className="font-header text-primary text-xl">Form-Input Setting</h1>
                                <p className="font-text text-unactive text-xs">Manage all available inputs that are going to be used in several forms in the system</p>
                            </div>
                            <Select value={inputs} onValueChange={(value) => setInputs(value)}>
                                <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-60 h-full bg-white text-base`}>
                                    <SelectValue placeholder="Select Input Type" />
                                </SelectTrigger>
                                <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        <SelectItem value="division">Division</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                        <SelectItem value="title">Title</SelectItem>
                                        <SelectItem value="city">Cities</SelectItem>
                                        <SelectItem value="branch">Branch</SelectItem>
                                </SelectContent>

                            </Select>
                        </div>
                        // : tab === 3 ?
                        // <div className="py-5">
                        //     <h1 className="font-header text-primary text-xl">Re-Activation Account Management</h1>
                        //     <p className="font-text text-unactive text-xs">Manage and list all available inactive employee accounts in the system for reactivation or permanent deletion</p>
                        // </div>
                        : tab === 3 ?
                        <div className="py-5">
                            <h1 className="font-header text-primary text-xl">Course Form Inputs</h1>
                            <p className="font-text text-unactive text-xs">Defines the fields and input options required when creating or editing a course,that is also neccessary course setup and management.</p>
                        </div>
                        : tab === 4 ?
                        <div className="py-5">
                            <h1 className="font-header text-primary text-xl">System Content Setting</h1>
                            <p className="font-text text-unactive text-xs">Settings that handle on system content customizations</p>
                        </div>
                        : tab === 5  ?
                        <div className="py-5 flex flex-row items-center justify-between ">
                            <div className="flex-col flex">
                                <h1 className="font-header text-primary text-xl">Deleted Form-Input Setting</h1>
                                <p className="font-text text-unactive text-xs">Manage all available inputs that are going to be used in several forms in the system</p>
                            </div>
                            <Select value={inputs} onValueChange={(value) => setInputs(value)}>
                                <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-60 h-full bg-white text-base`}>
                                    <SelectValue placeholder="Select Input Type" />
                                </SelectTrigger>
                                <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        <SelectItem value="division">Division</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                        <SelectItem value="title">Title</SelectItem>
                                        <SelectItem value="city">Cities</SelectItem>
                                        <SelectItem value="branch">Branch</SelectItem>
                                </SelectContent>

                            </Select>
                        </div>
                        : tab === 6  ?
                        <div className="py-5 flex flex-row items-center justify-between ">
                            <div className="flex-col flex">
                                <h1 className="font-header text-primary text-xl">Deleted Form-Input Setting</h1>
                                <p className="font-text text-unactive text-xs">Manage all available inputs that are going to be used in several forms in the system</p>
                            </div>
                        </div>
                        : null
                    }

                    <div className="pb-5 ">
                    {
                        tab === 1 ? (
                            <RoleManagementSetting/>
                        ) : tab === 2 ? (
                            <FormInputSetting inputs={inputs} selected={selected} setSelected={setSelected} action={action} setAction={setAction}/>
                        ) : tab === 3 ? (
                            <CourseFormInputSetting selected={selected} setSelected={setSelected} action={action} setAction={setAction}/>
                        ) : tab === 4 ? (
                            <SystemContentSetting/>
                        ) : tab === 5 ? (
                            <DeletedFormInput inputs={inputs} selected={selected} setSelected={setSelected} action={action} setAction={setAction}/>
                        ) : tab === 6 ? (
                            <DeletedCourseFormInput selected={selected} setSelected={setSelected} action={action} setAction={setAction}/>

                        )
                        : null
                    }
                    </div>

                    </div>

                </ScrollArea>
                {
                    selected.length > 0 ?
                    <div className="absolute bottom-0 right-0 w-fit h-fit p-4 flex flex-row justify-end">
                        <div className="py-4 px-6 border border-primary rounded-md bg-white shadow-lg w-fit flex flex-row gap-14 items-center">
                            <p className="text-sm font-header text-primary">{selected.length} Selected Entry</p>
                            <div className="flex flex-row gap-2 ">
                                <div className="shadow-sm border-2 border-primary px-4 py-2 gap-2 text-primary rounded-md flex flex-row justify-center items-center cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                    onClick={()=>{setSelected([])}}>
                                    <FontAwesomeIcon icon={faXmark}/>
                                    <p className="text-sm font-header">Clear Selected</p>
                                </div>

                                {
                                    tab === 5  || tab === 6?
                                    <>
                                    <div className="shadow-sm border-2 border-primary gap-2 px-4 py-2 text-white bg-primary rounded-md flex flex-row justify-center items-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out"
                                        onClick={()=>setAction("restore")}>
                                        <FontAwesomeIcon icon={faRotateLeft}/>
                                        <p className="text-sm font-header">Restore All</p>
                                    </div> 
                                     <div className="shadow-sm border-2 border-red-900 gap-2 px-4 py-2 text-red-900 bg-red-400 rounded-md flex flex-row justify-center items-center cursor-pointer hover:bg-red-900 hover:text-white transition-all ease-in-out"
                                        onClick={()=>{setAction("delete")}}>
                                        <FontAwesomeIcon icon={faTrash}/>
                                        <p className="text-sm font-header">Delete All</p>
                                    </div>
                                    </>
                                    :
                                    <div className="shadow-sm border-2 border-red-900 gap-2 px-4 py-2 text-red-900 bg-red-400 rounded-md flex flex-row justify-center items-center cursor-pointer hover:bg-red-900 hover:text-white transition-all ease-in-out"
                                        onClick={()=>{setAction("delete")}}>
                                        <FontAwesomeIcon icon={faTrash}/>
                                        <p className="text-sm font-header">Delete All</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div> : null
                }
            </div>

                {/* {
                    tab === 1 ? (
                        <RoleManagementSetting/>
                    ) : tab === 2 ? (
                        <FormInputSetting/>
                    ) : tab === 3 ? (
                        <ReactivationAccountSetting/>
                    ) : tab === 4 ? (
                        <CourseFormInputSetting/>
                    ): tab === 5 ? (
                        <SystemContentSetting/>
                    ): tab === 6 ? (
                        <ArchiveAndAuditingSetting/>
                    ):
                    (null)
                } */}
        </div>
    )
}
