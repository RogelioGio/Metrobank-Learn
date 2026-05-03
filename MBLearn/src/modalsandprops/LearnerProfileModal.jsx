import { faUserPen, faTrash, faDotCircle, faEllipsis, faXmark, faCheckCircle, faXmarkCircle, faHourglass, faGraduationCap, faMugHot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import React, { useEffect, useMemo, useState } from 'react'
import axiosClient from '../axios-client'
import { InfinitySpin } from 'react-loader-spinner'
import EditUserModal from './EditUserModal'
import { useUser } from '../contexts/selecteduserContext'
import { use } from 'react'
import DeleteUserModal from './DeleteUserModal'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ScrollArea } from '../components/ui/scroll-area'
import { RingProgress } from '@mantine/core'


const LearnerProfileModal = ({ isOpen, onClose, selectedUser }) => {
    return (
        <Dialog open={isOpen} onClose={()=>""}>
                    <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30" />
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4 text center'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                                <div className=' grid grid-rows-[170px_min-content]
                                                w-[90vw]'>
                                    {/* Name Header */}
                                    <div className='bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)]'>
                                        <div className='bg-gradient-to-b from-transparent to-black p-5 h-full flex flex-row justify-between items-start w-full'>
                                            <div className='flex flex-col gap-3 items-center justify-center h-full'>
                                                <div className='flex flex-row items-center justify-center px-2
                                                                gap-4
                                                                md:px-5 md:gap-5 h-full'>
                                                    <div className='flex flex-row items-center justify-between p-1 rounded-full bg-white shadow-md
                                                                    w-20 h-20
                                                                    md:w-24 md:h-24'>
                                                        <img src={selectedUser?.profile_image} alt="" className='rounded-full'/>
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        <div className='flex flex-row gap-2'>
                                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{selectedUser?.roles ? selectedUser?.roles[0]?.role_name : "No Data" }</span>
                                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{selectedUser?.status || "No Data"}</span>
                                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{selectedUser?.title?.career_level?.name || "No Data"}</span>
                                                        </div>
                                                        <p className='font-header  text-white
                                                                    text-xl
                                                                    md:text-3xl'>{selectedUser?.first_name} {selectedUser?.middle_name} {selectedUser?.last_name}</p>
                                                        <p className='font-text text-xs text-white
                                                                    md:text-base'>ID: {selectedUser?.employeeID}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='grid grid-rows-[min-content_1fr] h-full'>
                                                <div className='flex flex-row items-end justify-end'>
                                                    <div className='h-8 w-8 text-white border-2 border-white rounded-full flex justify-center items-center hover:cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out' onClick={onClose}>
                                                        <FontAwesomeIcon icon={faXmark}/>
                                                    </div>
                                                </div>
                                                <div className='grid grid-cols-5 gap-5 h-full items-end justify-end text-white'>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className="text-xs text-white font-text">
                                                            Enrolled Courses
                                                        </p>
                                                        <div className='font-header text-xl text-white flex flex-row items-center gap-2'>
                                                            <FontAwesomeIcon icon={faGraduationCap}/>
                                                            <span>{selectedUser?.enrolled_courses?.filter((course) => course.pivot.enrollment_status === "enrolled").length || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className="text-xs text-white font-text">
                                                            Ongoing Courses
                                                        </p>
                                                        <div className='font-header text-xl text-white flex flex-row items-center gap-2'>
                                                            <FontAwesomeIcon icon={faHourglass}/>
                                                            <span>{selectedUser?.enrolled_courses?.filter((course) => course.pivot.enrollment_status === "ongoing").length || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className="text-xs text-white font-text">
                                                            Passed Courses
                                                        </p>
                                                        <div className='font-header text-xl text-white flex flex-row items-center gap-2'>
                                                            <FontAwesomeIcon icon={faCheckCircle}/>
                                                            <span>{selectedUser?.enrolled_courses?.filter((course) => course.pivot.enrollment_status === "finished").length || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className="text-xs text-white font-text">
                                                            Failed Courses
                                                        </p>
                                                        <div className='font-header text-xl text-white flex flex-row items-center gap-2'>
                                                            <FontAwesomeIcon icon={faXmarkCircle}/>
                                                            <span>{selectedUser?.enrolled_courses?.filter((course) => course.pivot.enrollment_status === "failed").length || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className="text-xs text-white font-text">
                                                            Past Due Courses
                                                        </p>
                                                        <div className='font-header text-xl text-white flex flex-row items-center gap-2'>
                                                            <FontAwesomeIcon icon={faHourglass}/>
                                                            <span>{selectedUser?.enrolled_courses?.filter((course) => course.pivot.enrollment_status === "past_due").length || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='p-4 flex flex-col gap-1'>
                                        <p className='font-text text-xs text-unactive'>Learning Journey:</p>
                                        <ScrollArea className="h-[50vh] border border-divider rounded-md bg-gray-50">
                                            <div className='p-4 flex flex-col gap-3'>
                                                {
                                                    selectedUser?.enrolled_courses?.length === 0 ?
                                                    <div className='w-full h-[45vh] flex flex-row items-center justify-center'>
                                                        <div className='flex flex-col gap-2 items-center justify-center'>
                                                            <div className='bg-primarybg w-24 aspect-square rounded-full flex items-center justify-center text-4xl text-primary'>
                                                                <FontAwesomeIcon icon={faMugHot} />
                                                            </div>
                                                            <p className='font-header text-xl text-primary'>Learner is vacant!</p>
                                                            <p className='text-unactive font-text text-xs text-center'>The learner doesnt have any enrolled or ongoing courses yet</p>
                                                        </div>
                                                    </div>
                                                    :
                                                    selectedUser?.enrolled_courses?.map((course, index) => (
                                                        <div key={index} className='grid grid-cols-2 border border-divider rounded-md bg-white shadow-md overflow-hidden'>
                                                            <div className=''>
                                                                {
                                                                    course.image_path !== "null" ?
                                                                    <div
                                                                        className="w-full h-full bg-center bg-cover bg-no-repeat flex items-center justify-center"
                                                                        style={{ backgroundImage: `url(${course.image_path})` }}
                                                                    >
                                                                        <div className={`bg-gray-950 bg-opacity-70 w-full h-full p-4 flex flex-col justify-center`}>

                                                                            <div>
                                                                                <h1 className='font-header text-white'>{course.courseName}</h1>
                                                                                <p className='font-text text-xs text-white'>Course ID: {course.courseID}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div> : null
                                                                }

                                                            </div>
                                                            <div className='grid grid-cols-5 gap-5 p-4'>
                                                                <div className='flex flex-col gap-1'>
                                                                    <p className='text-xs text-unactive font-text'>Enrollment Date</p>
                                                                    <div className='h-full flex flex-row items-center'>
                                                                        <p className='font-text text-xs'>{course.pivot.created_at ? format(new Date(course.pivot.created_at), 'MMM dd, yyyy') : 'Not Enrolled'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col gap-1'>
                                                                    <p className='text-xs text-unactive font-text'>Finished Date</p>
                                                                    <div className='h-full flex flex-row items-center'>
                                                                        {
                                                                            (course.pivot.enrollment_status === "finished" || course.pivot.enrollment_status === "late_finished") ?
                                                                            <p className='font-text text-xs'>{course.pivot.updated_at ? format(new Date(course.pivot.updated_at), 'MMM dd, yyyy') : null}</p>
                                                                            :
                                                                            <p className='font-text text-xs text-unactive'>Not Finished</p>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col gap-1'>
                                                                    <p className='text-xs text-unactive font-text'>Deadline Date</p>
                                                                    <div className='h-full flex flex-row items-center'>
                                                                        <p className='font-text text-xs'>{course.pivot.end_date ? format(new Date(course.pivot.end_date), 'MMM dd, yyyy') : 'No Deadline'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col gap-1'>
                                                                    <p className='text-xs text-unactive font-text'>Course Progress</p>
                                                                    <div className='flex flex-row gap-2 items-center'>
                                                                        <RingProgress
                                                                            size={40} // Diameter of the ring
                                                                            roundCaps
                                                                            thickness={7} // Thickness of the progress bar
                                                                            sections={[{ value: course.pivot.progress, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                                                            rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                                                        />
                                                                        <p className='font-text'>{course.pivot.progress}%</p>
                                                                    </div>
                                                                </div>
                                                                <div className='flex flex-col gap-1'>
                                                                    <p className='text-xs text-unactive font-text'>Remarks</p>
                                                                    <div className={`h-full font-header flex flex-row items-center ${(course.pivot.enrollment_status === "finished" || course.pivot.enrollment_status === "late_finished") ? 'text-green-900' : course.pivot.enrollment_status === "failed" ? 'text-red-900' : course.pivot.enrollment_status === "enrolled" ? 'text-primary' : 'text-yellow-600'}`}>
                                                                        <FontAwesomeIcon icon={(course.pivot.enrollment_status === "finished" || course.pivot.enrollment_status === "late_finished") ? faCheckCircle : course.pivot.enrollment_status === "failed" ? faXmarkCircle : course.pivot.enrollment_status === "enrolled" ? faGraduationCap : faHourglass} />
                                                                        <span className='ml-2 capitalize'>{course.pivot.enrollment_status.replace('_', ' ')}</span>
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
export default LearnerProfileModal
