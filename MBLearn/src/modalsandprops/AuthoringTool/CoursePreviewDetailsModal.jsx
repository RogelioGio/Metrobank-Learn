import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import React from 'react';
import axiosClient from 'MBLearn/src/axios-client';

const CoursePreviewDetailsModal = ({open,close,classname,selectedCourse,role}) => {
    const [hover, setHover] = useState();

    useEffect(() => {
        setHover(false);
    },[])

    console.log("HHHHHHasdfHHHHHHHHHHHHHH", selectedCourse);
    
    console.log(role);

    const [resubmissionReason, setResubmissionReason] = useState(null);
    axiosClient.get(`/getCourseReApprovalReasonData/${selectedCourse?.id}`)
    .then(({ data }) => {
        setResubmissionReason(data.resubmission_reason);
    });

    return(
        <Dialog open={open} onClose={()=>{}} className={classname}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='w-[50rem] min-w-[50rem] max-w-[50rem] mx-auto transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className='bg-white rounded-md h-fit flex flex-col'>
                                {/* Thumbnail */}
                                <div className='bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md'>
                                    <div className="flex flex-col bg-gradient-to-b from-transparent to-black rounded-t-md gap-4">
                                        <div className='p-4 flex flex-col gap-y-4'>
                                            <div className='flex items-center justify-end'>
                                                <div className='border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base'
                                                    onClick={close}>
                                                    <FontAwesomeIcon icon={faXmark}/>
                                                </div>
                                            </div>
                                            <div className='px-4'>
                                                <h2 className='font-header text-white text-base md:text-2xl'>{selectedCourse?.CourseName}</h2>
                                                <p className='text-xs text-white font-text'>Course ID: {selectedCourse?.CourseID}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* 1st Row */}
                                <div className='px-8 pt-4 pb-2 flex flex-row flex-nowrap gap-10'>
                                  <div className='flex flex-col justify-center py-1 font-text w-1/4'>
                                    <p className='font-text text-xs text-unactive'>Training Type:</p>
                                    {selectedCourse?.TrainingType ?
                                      <p className='md:text-base text-xs'>{selectedCourse.TrainingType}</p>
                                    :
                                      <p className='md:text-base text-xs text-red-500 italic'>No training type provided.</p>
                                    }
                                  </div>

                                  <div className='flex flex-col justify-center py-1 font-text w-1/4'>
                                    <p className='font-text text-xs text-unactive'>Career Level:</p>
                                    {selectedCourse?.career_level?.name ?
                                      <p className='md:text-base text-xs'>{selectedCourse.career_level.name}</p>
                                    :
                                      <p className='md:text-base text-xs text-red-500 italic'>No career level provided.</p>
                                    }
                                  </div>

                                  <div className='flex flex-col justify-center py-1 font-text w-1/4'>
                                    <p className='font-text text-xs text-unactive'>Category:</p>
                                    {selectedCourse?.category?.category_name ? 
                                      <p className='md:text-base text-xs'>{selectedCourse.category.category_name}</p>
                                    :
                                      <p className='md:text-base text-xs text-red-500 italic'>No category provided.</p>
                                    }
                                  </div>

                                  <div className='flex flex-col justify-center py-1 font-text w-1/4'>
                                    <p className='font-text text-xs text-unactive'>Date Added:</p>
                                    {selectedCourse?.created_at ?  
                                      <p className='md:text-base text-xs'>{dayjs(selectedCourse.created_at).format("MMMM DD, YYYY")}</p>
                                    :
                                      <p className='md:text-base text-xs text-red-500 italic'>No date provided.</p>
                                    }
                                  </div>
                                </div>
                                {/* 2nd Row */}
                                <div className='px-8 py-2 flex flex-col md:flex-row md:gap-10'>
                                  <div className='md:w-1/2'>
                                    <p className='font-text text-xs text-unactive'>Objective:</p>
                                    {selectedCourse?.Objective ? 
                                      <p className='font-text md:text-base text-xs'>{selectedCourse?.Objective}</p>
                                    :
                                      <p className='font-text md:text-base text-xs text-red-500 italic'>No objective provided.</p>
                                    }
                                  </div>
                                  <div className='md:w-1/2'>
                                    <p className='font-text text-xs text-unactive'>Overview:</p>
                                    {selectedCourse?.Overview ?
                                      <p className='font-text md:text-base text-xs'>{selectedCourse?.Overview}</p>
                                    :
                                      <p className='font-text md:text-base text-xs text-red-500 italic'>No overview provided.</p>
                                    }
                                  </div>
                                </div>
                                <div className='px-8 pt-2 pb-5 flex flex-col md:flex-row gap-y-6 md:gap-x-10'>
                                  <div className='flex-1 flex flex-col items-start gap-y-2'>
                                    <p className='font-text text-xs text-unactive'>Course Collaborators:</p>
                                    {selectedCourse?.sme_permitted?.length > 0 ? (
                                      selectedCourse.sme_permitted.map((collab, index) => (
                                        <div
                                          key={index}
                                          className="w-full flex flex-row items-center border px-4 py-2 gap-2 rounded-md shadow-md bg-blue-50 border-blue-200"
                                        >
                                          <img
                                            src={
                                              collab.profile_image ||
                                              "https://ui-avatars.com/api/?name=User&color=ffffff&background=38bdf8&bold=true&size=40"
                                            }
                                            alt={`${collab.first_name || "User"} ${collab.last_name || ""}`}
                                            className="w-10 h-10 rounded-full object-cover"
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <p className="font-semibold font-text">
                                                {[
                                                  collab.first_name,
                                                  collab.middle_name,
                                                  collab.last_name,
                                                  collab.name_suffix,
                                                ]
                                                  .filter(Boolean)
                                                  .join(" ")}
                                              </p>
                                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-medium border border-blue-300">
                                                Contributor
                                              </span>
                                            </div>
                                            <p className="font-text text-xs text-unactive">
                                              ID: {collab.employeeID || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-500">No collaborators assigned.</p>
                                    )}
                                  </div>

                                  <div className='flex-1 flex flex-col items-start gap-y-2'>
                                    <p className='font-text text-xs text-unactive'>Course Author:</p>
                                    {selectedCourse?.user_info ? (
                                      <div className="w-full flex flex-row items-center border px-4 py-2 gap-2 rounded-md shadow-md bg-yellow-50 border-yellow-300">
                                        <img
                                          src={
                                            selectedCourse.user_info.profile_image ||
                                            "https://ui-avatars.com/api/?name=User&color=ffffff&background=ffbb00&bold=true&size=40"
                                          }
                                          alt={`${selectedCourse.user_info.first_name} ${selectedCourse.user_info.last_name}`}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold font-text">
                                              {[
                                                selectedCourse.user_info.first_name,
                                                selectedCourse.user_info.middle_name,
                                                selectedCourse.user_info.last_name,
                                                selectedCourse.user_info.name_suffix,
                                              ].filter(Boolean).join(" ")}
                                            </p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium border border-yellow-400">
                                              Creator
                                            </span>
                                          </div>
                                          <p className="font-text text-xs text-unactive">
                                            ID: {selectedCourse.user_info.employeeID || "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No author info</p>
                                    )}
                                  </div>
                                </div>
                            </div>

                            {resubmissionReason && selectedCourse.CourseStatus !== 'published' && role === 'SME-Approver' && (
                              <div className="px-8 pt-4 pb-6 mt-6">
                                <div className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-md shadow-md">
                                  <div className="flex items-center gap-2 bg-blue-200 bg-opacity-70 px-4 py-2 rounded-t-md border-b border-blue-400">
                                    <p className="font-header font-semibold text-blue-800 text-sm uppercase tracking-wide">
                                      Reason for Re-Approval Request
                                    </p>
                                  </div>
                                  <div className="p-4">
                                    <p className="font-text text-base text-blue-900 leading-relaxed whitespace-pre-line">
                                      {resubmissionReason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default CoursePreviewDetailsModal
