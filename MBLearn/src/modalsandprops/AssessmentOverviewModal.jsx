import { faAddressCard, faBuildingUser, faCheckCircle, faChevronDown, faCircleCheck, faCircleXmark, faClapperboard, faClipboard, faD, faFileArrowUp, faFilePen, faGraduationCap, faMagnifyingGlass, faSuitcase, faUser, faUserCircle, faUserGroup, faUserPlus, faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons"
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


const AssessmentOverviewModal = ({open, close, assessment }) => {
    console.log(assessment.TestName);
    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[70vw]'>
                        <div className='bg-white rounded-md h-full flex flex-col w-full'>
                            <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] w-full">
                                <div className='bg-gradient-to-b from-transparent to-black p-5 grid grid-rows-[min-content_1fr] h-full gap-5'>
                                    <div className="w-full flex justify-end">
                                        <div className="border border-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-white hover:bg-white hover:text-primary" onClick={close}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center">
                                        <div>
                                            <p className="font-text text-white text-xs">Assessment Name</p>
                                            <p className="text-2xl font-header text-white">{assessment.TestName}</p>
                                        </div>
                                        <div className="flex flex-row gap-10">
                                            <div className="flex flex-col">
                                                <p className="font-text text-white text-xs">Failed Taker</p>
                                                <div className="flex flex-row gap-2 items-center justify-end text-white text-2xl">
                                                    <p className="font-header">{assessment.failed}</p>
                                                    <FontAwesomeIcon icon={faCircleXmark}/>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-text text-white text-xs">Passed Taker</p>
                                                <div className="flex flex-row gap-2 items-center justify-end text-white text-2xl">
                                                    <p className="font-header">{assessment.passed}</p>
                                                    <FontAwesomeIcon icon={faCircleCheck}/>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-text text-white text-xs">Total Taker</p>
                                                <div className="flex flex-row gap-2 items-center justify-end text-white text-2xl">
                                                    <p className="font-header">{assessment.total_takers}</p>
                                                    <FontAwesomeIcon icon={faGraduationCap}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 grid-rows-[min-content_1fr] gap-2 p-4">
                                <ScrollArea className="col-span-4 row-span-1 h-[50vh] border border-divider rounded-md bg-slate-100">
                                    <div className="flex flex-col gap-2 p-4">
                                        {
                                            assessment.takers.map((item)=>(
                                                <div className="p-4 bg-white border border-divider rounded-md flex flex-row justify-between items-center">
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <div className="bg-primary w-11 h-11 rounded-full flex items-center justify-center text-white">
                                                            <img src={item.user.profile_image} alt="" className='rounded-full'/>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="font-text text-xs text-unactive">{item.user.title.department.department_name}</p>
                                                            <div className="flex flex-row gap-2 items-center">
                                                                <p className="font-header text-primary">{item.user.first_name} {item.user.middle_name ? item.user.middle_name : ""} {item.user.last_name}</p>
                                                                <p className="font-text text-xs text-unactive">ID: {item.user.employeeID}</p>
                                                            </div>
                                                            <p className="font-text text-xs text-unactive">{item.user.title.title_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row gap-5">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-text text-xs text-unactive">Learner Highest Score</p>
                                                            <div className="text-xl flex flex-row justify-end items-center gap-2 text-primary">
                                                                <p className="text-header font-header">{item.best_score || 0}</p>
                                                                <FontAwesomeIcon icon={faClipboard} className=""/>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-text text-xs text-unactive">Assessment Remarks</p>
                                                            <div className={`text-xl flex flex-row justify-end items-center gap-2  ${item.status === "Passed" ? "text-green-900" : "text-red-900"}`}>
                                                                <p className="text-header font-header">{item.status === "Passed" ? "Passed" : "Failed"}</p>
                                                                <FontAwesomeIcon icon={item.status === "Passed" ? faCheckCircle : faXmarkCircle} className=""/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }

                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default AssessmentOverviewModal
