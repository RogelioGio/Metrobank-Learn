import { faBookBookmark, faArchive, faInfoCircle, faPeopleGroup, faSearch, faUserPlus, faTrashArrowUp, faTrashCan, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axiosClient from "MBLearn/src/axios-client"
//import { Step } from "MBLearn/src/components/ui/addCourseStepper"
import { Stepper, Step } from "MBLearn/src/components/ui/courseStepper"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import { useCourse } from "MBLearn/src/contexts/Course"
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext"
import CourseAssesmentManagement from "MBLearn/src/modalsandprops/CourseAssesmentManagement"
import CourseAssesment from "MBLearn/src/modalsandprops/courseComponents/courseAssesment"
import CourseVideo from "MBLearn/src/modalsandprops/courseComponents/courseVideo"
import { useRef } from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom";
import AssessmentPreview from "./AssessmentPreview"
import { Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger } from "MBLearn/src/components/ui/sheet"
import ApproveSheet from "MBLearn/src/modalsandprops/AuthoringTool/ApproveSheet"
import PublishingSheet from "MBLearn/src/modalsandprops/AuthoringTool/PublishingSheet"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import CoursePreviewDetailsModal from "MBLearn/src/modalsandprops/AuthoringTool/CoursePreviewDetailsModal"
import SuccessModal from "MBLearn/src/modalsandprops/AuthoringTool/SuccessModal"
import AttachmentPreview from "./AttachmentPreview"
import WarningModal from "MBLearn/src/modalsandprops/AuthoringTool/WarningModals"
import ConfirmationModal from "MBLearn/src/modalsandprops/AuthoringTool/ConfirmationModal"
import CourseAssignedAdminDetailsModal from "MBLearn/src/modalsandprops/AuthoringTool/CourseAssignedAdminDetails"
import CourseContentCPL from "MBLearn/src/modalsandprops/courseComponents/courseContentCPL"
import ArchiveCourseWithCourseAdmins from "MBLearn/src/modalsandprops/AuthoringTool/ArchiveCourseWithCourseAdmins"
import CourseOverviewCPL from "MBLearn/src/modalsandprops/courseComponents/courseOverviewCPL"
import CourseCertificateCPL from "MBLearn/src/modalsandprops/courseComponents/courseCertificateCPL"

export function CoursePreview () {
    const {setShowBack, setPageTitle, role, user} = useStateContext()
    const [activeStepMeta, setActiveMeta] = useState({title: "", desc: "", stepID:""})
    const {setCourse, course} = useCreateCourse()
    const [modules, setModules] = useState([])
    const [overview, setOverview] = useState([]);
    const [objective, setObjective] = useState([]);
    const [certificate, setCertificate] = useState([]);
    const [loading, setLoading] = useState(true)
    const stepperRef = useRef(null)
    const {id,mblearn} = useParams()
    const [publishCreator, setPublishCreator] = useState(false)
    const [approveViewer, setApproveViewer] = useState(false)
    const [distribute, setDistribute] = useState(false)
    const [availableAdmins, setAvailableAdmins] = useState([])
    const [courseAdmins, setCourseAdmins] = useState([])
    const [showSheet, setShowSheet] = useState(true);
    const navigate = useNavigate();
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successApproveModalOpen, setSuccessApproveModalOpen] = useState(false);
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);

    // play it safe
    // useEffect(() => {
    //     if (!course || !user?.user_infos) return;

    //     const isNotCreator = course.user_info_id !== user.user_infos.id;
    //     const isCreatedStatus = course.CourseStatus === 'created';

    //     if (isNotCreator && isCreatedStatus) {
    //         navigate(`/authoring-tool/course-incomplete-preview/${id}`);
    //     }
    // }, [course, user, id, navigate]);



    useEffect(() => {
        setShowBack(true);
        setPageTitle("COURSE PREVIEW")
    }, [setShowBack]);

    const fetchModuleItems = () => {
        setLoading(true);
        axiosClient.get(`/fetchModuleItems/${id}`)
        .then(({ data }) => {
            setModules(data.modules)
            setOverview(data.overview);
            setObjective(data.objective);
            setCertificate(data.certificate);
            setLoading(false);
        })
        .catch((error) => {
        console.log("The Error: ", error);
        })
    };

    const fetchCourse = () => {
        axiosClient.get(`/getCreatingCourse/${id}`).then(({data}) => {
            console.log("Fetched Course: ", data);
            setCourse(data);
            setLoading(false);
            //setImageUrl(data.ImagePath);
        }).catch((error) => {
            console.error("Error fetching course: ", error);
            setLoading(false);
        })
    }
    const getAvailableCourseAdmins = () => {
        axiosClient.get(`/get-available-course-admins/${id}`).then(({data}) => {
            console.log("Available Course Admins: ", data);
            setAvailableAdmins(data.data);
        }).catch((error) => {
            console.error("Error fetching available course admins: ", error);
        })
    }

    /// --------------------
    /// Course Status Updates
    /// --------------------
    const [selectedAction, setSelectedAction] = useState(null);
    const [confirmResponseModalOpen, setConfirmResponseModalOpen] = useState(false);
    const [pendingResponse, setPendingResponse] = useState({ action: null, feedback: '' });

    const approveCourse = ({ action, feedback } = {}) => {
        if (action && feedback !== undefined) {
            if (!action) {
                setWarningModalOpen(true);
                return;
            }
            setPendingResponse({ action, feedback });
            setApproveViewer(false);
            setConfirmResponseModalOpen(true);
        } else {
            setConfirming(true);
            axiosClient.post(`/approveResponse/${id}`, {
                response: pendingResponse.action,
                feedback: pendingResponse.feedback,
            })
            .then(({ data }) => {
                console.log("Response: ", data);
                setSuccessApproveModalOpen(true);
                setConfirmResponseModalOpen(false);
                setConfirming(false);
                setCourse((prev) => ({ ...prev, CourseStatus: "reviewed" }));
            })
            .catch((error) => {
                console.error("Error submitting response: ", error);
                setConfirming(false);
                setConfirmResponseModalOpen(false);
            });
        }
    };

    const [successPublishModalOpen, setSuccessPublishModalOpen] = useState(false);
    const [confirmPublishModalOpen, setConfirmPublishModalOpen] = useState(false);
    const publishCourse = (confirmed = false) => {
        if (!confirmed) {
            setConfirmPublishModalOpen(true);
            setPublishCreator(false);  
            return;
        }
        setConfirming(true);
        axiosClient.put(`/setCoursePublished/${id}`)
            .then(({ data }) => {
                setSuccessPublishModalOpen(true);
                setConfirmPublishModalOpen(false);
                setConfirming(false);
                setCourse((prev) => ({ ...prev, CourseStatus: "published" }));
            })
            .catch((error) => {
                console.error("Error publishing course: ", error);
            })
            .finally(() => {
                setConfirming(false);
            });
    };

    /// --------------------
    /// Delete Archived Courses
    /// --------------------
    const [showDeleteArchivedCourseModal, setShowDeleteArchivedCourseModal] = useState(false);
    const [deletingArchivedCourse, setDeletingArchivedCourse] = useState(false);
    const [showSuccessDeleteArchivedCourse, setShowSuccessDeleteArchivedCourse] = useState(false);

    const handleDeleteArchivedCourse = async () => {
        setDeletingArchivedCourse(true);
        axiosClient.post(`/deleteArchivedCourse/${id}`)
        .then(({ data }) => {
            setShowDeleteArchivedCourseModal(false);
            setShowSuccessDeleteArchivedCourse(true);
        })
        .catch((error) => {
            console.error('Error deleting archived course:', error);
        })
        .finally(() => {
            setDeletingArchivedCourse(false);
        });
    };

    /// --------------------
    /// Hard Delete Courses
    /// --------------------
    const [showHardDeleteCourseModal, setShowHardDeleteCourseModal] = useState(false);
    const [hardDeletingCourse, setHardDeletingCourse] = useState(false);
    const [showSuccessHardDeleteCourse, setShowSuccessHardDeleteCourse] = useState(false);

    const [successHardDeleteModalOpen, setSuccessHardDeleteModalOpen] = useState(false);
    const [confirmHardDeleteModalOpen, setConfirmHardDeleteModalOpen] = useState(false);

    const handleHardDeleteCourse = async () => {
        setHardDeletingCourse(true);

        try {
            const { data } = await axiosClient.post(`/hardDeleteCourse/${id}`);

            const html = data.html;
            const blob = new Blob([html], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Course_${id}_SoftCopy.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setShowHardDeleteCourseModal(false);
            setShowSuccessHardDeleteCourse(true);

        } catch (error) {
            console.error('Error deleting archived course:', error);
            alert('Error deleting course: ' + (error.response?.data?.message || error.message));
        } finally {
            setHardDeletingCourse(false);
        }
    };


    /// --------------------
    /// Restore Courses
    /// --------------------
    const [showRestoreCourseModal, setShowRestoreCourseModal] = useState(false);
    const [restoringCourse, setRestoringCourse] = useState(false);
    const [showSuccessRestoreModalOpen, setShowSuccessRestoreModalOpen] = useState(false);
    const handleRestoreCourse = async () => {
        setRestoringCourse(true);
        axiosClient.post(`/restoreCourse/${id}`)
        .then(({data}) =>{
            setShowRestoreCourseModal(false);
            setShowSuccessRestoreModalOpen(true);
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            setRestoringCourse(false);
        })
    };

    const [showAdminDetails, setShowAdminDetails] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const handleAdminDetailsIconClick = (e, admin) => {
        setSelectedAdmin(admin);
        setShowAdminDetails(true);
    };

    /// --------------------
    /// Assign Admins
    /// --------------------
    const confirmAssignAdmin = () => {
        setConfirming(true);
        handleAssigingCourseAdmin()

        .then(() => {
        setConfirmationModalOpen(false);
        setConfirming(false);
        })
        .catch(() => {
        setConfirming(false);
        });
    };

    const cancelAssignAdmin = () => {
    if (confirming) return;
        setConfirmationModalOpen(false);
    };

    const handleAssignCourseAdmin = (adminId) => {
        setCourseAdmins((prev) => {
            const exist = prev.some((item) => item.user_id === adminId);

            if (exist) {
                return prev.filter((item) => item.user_id !== adminId);
            }
            return [...prev, { user_id: adminId }];
        })
    }
    const handleAssigingCourseAdmin = () => {
        if (courseAdmins.length === 0) return Promise.resolve();
        return axiosClient.post(`/assign-course-admin/${id}`,
            {
                data: courseAdmins,
                distributor_id: user.user_infos.id
            }
        )
        .then(({data}) => {
            getAvailableCourseAdmins();
            setCourseAdmins([]);
            fetchAssignedAdmins();
            console.log("Assigned Course Admins: ", data);
        })
        .catch((error) => {
            console.error("Error assigning course admins: ", error);
        })
    }

    const [assignedAdmins, setAssignedAdmins] = useState([]);

    const fetchAssignedAdmins = async () => {
        try {
            const response = await axiosClient.get(`/get-assigned-course-admins/${id}`);
            setAssignedAdmins(response.data.data);
            console.log("Assigned Admins:", response.data);
        } catch (error) {
            console.error("Failed to fetch assigned course admins", error);
        }
    };

    useEffect(() => {
        if (distribute && course?.CourseID) {
            fetchAssignedAdmins();
            getAvailableCourseAdmins();
        }
    }, [distribute, course?.CourseID]);


    useEffect(() => {
        fetchCourse();
        fetchModuleItems();
    }, []);

    /// --------------------
    /// Assign Admins
    /// --------------------
    const [showArchiveCourseWithCourseAdmins, setShowArchiveCourseWithCourseAdmins] = useState(false);

    const approvalStatus = course?.course_review?.find(
        (review) => review.user_info_id === user.user_infos.id
    )?.approval_status;

    const formattedStatus = approvalStatus
        ? approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)
        : 'No Status';

    // useEffect(() => {
    //     console.log("Course Admins: ", courseAdmins);
    // }, [courseAdmins])

    /// --------------------
    /// Course Details Modal
    /// --------------------
    const [openDetails, setOpenDetails] = useState(false);

    
    /// --------------------
    /// Course Details Modal
    /// --------------------
    const [showRestoreInactiveCourseModal, setShowRestoreInactiveCourseModal] = useState(false);
    const [restoringInactiveCourse, setRestoringInactiveCourse] = useState(false);
    const [showSuccessRestoreInactiveModalOpen, setShowSuccessRestoreInactiveModalOpen] = useState(false);
    const handleRestoreInactiveCourse = async () => {
        setRestoringInactiveCourse(true);
        axiosClient.post(`/restoreInactiveCourse/${id}`)
        .then(({data}) =>{
            setShowRestoreInactiveCourseModal(false);
            setShowSuccessRestoreInactiveModalOpen(true);
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            setRestoringInactiveCourse(false);
        })
    };

    console.log("check", course);
    // console.log("checjksdaljf", assignedAdmins);
    return (
        <>
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] w-full h-full gap-2 pb-4 pr-4">
            {/* Header */}
            <div className="col-span-4 w-full h-full">
                <div className="w-full h-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-lg shadow-md flex items-center justify-between">
                    {/* Image */}
                    <div className="abosoulte  bg-gradient-to-b from-transparent to-black p-4 rounded-lg shadow-md flex flex-col w-full h-full gap-4">
                        <div className="flex justify-between items-start">
                            <div className="w-fit h-fit border-white border-2 rounded-md  py-2 px-4 ">
                                <p className="text-white font-text text-xs">
                                    {course?.CourseStatus === "draft" ? "For Review" :
                                    course?.CourseStatus === "created" ? "Created" :
                                    course?.CourseStatus === "reviewed" ? "Reviewed" :
                                    course?.CourseStatus === "published" ? "Published" :
                                    course?.CourseStatus === "distributed" ? "Distributed" :
                                    course?.CourseStatus === "for_approval" ? "For Approval"  :
                                    course?.CourseStatus === "archived" ? "Archived" :
                                    course?.CourseStatus === "deleted" ? "Deleted"  :
                                    course?.CourseStatus === "inactive" ? "Inactive" :
                                    "Loading . . ."}</p>  {/* Tinanggal ko yung Archived dito pansamantala */}
                            </div>

                            <div className="flex flex-row gap-2 h-full">
                                {
                                    role === "SME-Approver" && course?.CourseStatus === "draft"  &&
                                    <Sheet open={approveViewer} onOpenChange={setApproveViewer}>
                                        <SheetTrigger>
                                            <div className="flex space-x-4">
                                                {approvalStatus === 'approved' && (
                                                    <div className="w-fit h-10 border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header"
                                                        onClick={() => {
                                                            setSelectedAction('rejected');
                                                            setApproveViewer(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                                        <p>Change Response to Reject</p>
                                                    </div>
                                                    
                                                )}
                                                {approvalStatus === 'rejected' && (
                                                    <div className="w-fit h-10 border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header"
                                                        onClick={() => {
                                                            setSelectedAction('approved');
                                                            setApproveViewer(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                        <p>Change Response to Approve</p>
                                                    </div>
                                                )}
                                                {approvalStatus === 'pending' && (
                                                    <>
                                                        <div className="w-fit h-10 border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header"
                                                            onClick={() => {
                                                                setSelectedAction('rejected');
                                                                setApproveViewer(true);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                                            <p>Reject</p>
                                                        </div>
                                                        <div className="w-fit h-10 border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header"
                                                            onClick={() => {
                                                                setSelectedAction('approved');
                                                                setApproveViewer(true);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                            <p>Approve</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </SheetTrigger>
                                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                                        <SheetContent className="h-full flex-col flex">
                                            <SheetTitle className="font-header text-2xl text-primary mb-1 sr-only">Approval</SheetTitle>
                                            <SheetDescription className="text-sm text-unactive mb-5 sr-only">Approval Statuses</SheetDescription>
                                            <ApproveSheet response={approveCourse} initialResponseType={selectedAction} courseId={course.id} />
                                        </SheetContent>
                                    </Sheet>
                                }
                                {
                                    role === "SME-Creator" && course?.CourseStatus === "reviewed" && course?.user_info_id === user?.user_infos?.id && 
                                    <Sheet open={publishCreator} onOpenChange={setPublishCreator}>
                                        <SheetTrigger>
                                            <div className="w-fit h-full border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header">
                                                <FontAwesomeIcon icon={faBookBookmark} className="mr-2" />
                                                <p>Publish</p>
                                            </div>
                                        </SheetTrigger>
                                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                                        <SheetContent className="h-full flex-col flex">
                                            <SheetTitle className="font-header text-2xl text-primary mb-1 sr-only">Publishing</SheetTitle>
                                            <SheetDescription className="text-sm text-unactive mb-5 sr-only">Publishing Statuses</SheetDescription>
                                            <PublishingSheet publishCourse={publishCourse} />
                                        </SheetContent>
                                    </Sheet>
                                }
                                {
                                    role === "SME-Creator" && course?.CourseStatus === "archived" && 
                                    <div 
                                        className={`w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header ${distribute ? "bg-white text-primary" : " text-white "}`}
                                        onClick={() => setShowDeleteArchivedCourseModal(true)}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} className="mr-2" />
                                        <p>Delete Course</p>
                                    </div>
                                }
                                {
                                    role === "SME-Creator" && (course?.CourseStatus === "archived" || course?.CourseStatus === "deleted") && 
                                    <>
                                    <div className={`w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header ${distribute ? "bg-white text-primary" : " text-white "}`}
                                        onClick={() => setShowRestoreCourseModal(true)}
                                    >
                                        <FontAwesomeIcon icon={faTrashArrowUp} className="mr-2" />
                                        <p>Restore Course</p>
                                    </div>
                                    <div className={`w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header ${distribute ? "bg-white text-primary" : " text-white "}`}
                                        onClick={() => setShowHardDeleteCourseModal(true)}
                                    >
                                        <FontAwesomeIcon icon={faTrashArrowUp} className="mr-2" />
                                        <p>Permanently Delete Course</p>
                                    </div>
                                    </>
                                }
                                {
                                    role === "SME-Distributor" &&
                                    <>
                                    {(course?.CourseStatus === "published" || course?.CourseStatus === "distributed") &&
                                        <>
                                            <div className={`w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header text-white`}
                                                onClick={() => setShowArchiveCourseWithCourseAdmins(true)}
                                            >
                                                <FontAwesomeIcon icon={faArchive} className="mr-2" />
                                                <p>Archive Course</p>
                                            </div>

                                            <div className={`w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header ${ distribute ? "bg-white text-primary" : "text-white" }`}
                                                onClick={() => setDistribute(!distribute)}
                                            >
                                                <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
                                                <p>Distribute</p>
                                            </div>
                                        </>
                                    }
                                    {course?.CourseStatus === "inactive" &&
                                        <div className="w-fit h-full border-white border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out px-4 font-header text-white"
                                            onClick={() => {setShowRestoreInactiveCourseModal(true)}}
                                        >
                                        <FontAwesomeIcon icon={faTrashArrowUp} className="mr-2" />
                                        <p>Restore Course</p>
                                        </div>
                                    }
                                    </>
                                }

                                <div className="w-10 h-10 border-white border-2 rounded-md flex items-center text-white justify-center cursor-pointer hover:bg-white hover:text-primary transition-all ease-in-out "
                                    onClick={() => setOpenDetails(true)}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle}/>
                                </div>
                            </div>
                        </div>
                        <div>
                        {course ?   
                            <div className="flex justify-between items-start w-full">
                                <div>
                                    <p className="font-text text-white text-xs">{course.CourseID}</p>
                                    <p className="font-header text-xl text-white">{course.CourseName}</p>
                                    <p className="font-text text-white text-xs">
                                    {course.category?.category_name} - {course.career_level?.name} Level
                                    </p>
                                </div>

                                {role === "SME-Approver" && course?.CourseStatus === "draft" && (
                                    <div className="bg-white text-primary text-xs font-header px-4 py-2 mt-4 rounded-full shadow-md">
                                        Your Response is:{' '}
                                        <span
                                            className={
                                                approvalStatus === 'pending'
                                                ? 'text-yellow-500'
                                                : approvalStatus === 'rejected'
                                                ? 'text-red-600'
                                                : approvalStatus === 'approved'
                                                ? 'text-green-600'
                                                : 'text-gray-700'
                                            }
                                        >
                                        {formattedStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        :
                            <>
                            <div className="w-20 h-4 bg-gray-600 rounded animate-pulse mb-1"></div>
                            <div className="w-40 h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                            <div className="w-32 h-4 bg-gray-600 rounded animate-pulse"></div>
                            </>
                        }
                        </div>

                    </div>
                </div>
            </div>
            <div className="col-span-4 row-span-1 w-full h-full grid grid-cols-4 grid-rows-[min-content_1fr] gap-2">
                {
                    distribute ?
                    <>
                        <div className="col-span-1 row-span-2 w-full h-full font-text text-unactive text-xs flex flex-col">
                            <p className="py-2">Assigned Course Admins</p>
                            <div className="w-full h-full border border-divider p-4 rounded-md bg-white overflow-y-auto space-y-2">
                                <ScrollArea className="h-[calc(100vh-320px)] overflow-auto p-3">
                                    {assignedAdmins?.length > 0 ? (
                                        assignedAdmins.map((admin, index) => (
                                        <div key={index} className="p-2 border border-divider rounded-md bg-gray-50 flex space-x-4">
                                            <img 
                                                src={admin.profile_image} 
                                                alt={`${admin.first_name} ${admin.last_name}`} 
                                                className="w-12 h-12 rounded-full object-cover"
                                            />

                                            <div>
                                            <p className="font-header text-sm text-primary">
                                                {admin.first_name} {admin.middle_name ?? ''} {admin.last_name} {admin.name_suffix ?? ''}
                                            </p>

                                            <p className="font-text text-xs text-unactive">ID: {admin.employeeID}</p>

                                            <p className="font-text text-xs text-unactive">
                                                Roles: {admin.roles?.map(role => role.role_name).join(', ') || 'N/A'}
                                            </p>

                                            <p className="font-text text-xs text-unactive">
                                                Title: {admin.title?.title_name || 'N/A'}
                                            </p>

                                            <p className="font-text text-xs text-unactive">
                                                Department: {admin.department?.department_name || 'N/A'}
                                            </p>

                                            <p className="font-text text-xs text-unactive">
                                                Branch: {admin.branch?.branch_name || 'N/A'}, City: {admin.city?.city_name || 'N/A'}
                                            </p>
                                            </div>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-unactive font-text">No course admins assigned yet.</p>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                        <div className="col-start-2 col-span-2 flex flex-col justify-center">
                            <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                                <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                                <div className='bg-primary py-2 px-4 text-white'>
                                    <FontAwesomeIcon icon={faSearch}/>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-md flex flex-row items-center justify-center h-full p-4 gap-2 bg-primary text-white cursor-pointer hover:bg-primaryhover transition-all ease-in-out col-start-4"
                              onClick={() => {
                                if (courseAdmins.length === 0) return;
                                setConfirmationModalOpen(true);
                            }}>
                            <FontAwesomeIcon icon={faUserPlus} />
                            <p className="font-header">Assign Course Admin</p>
                        </div>
                        <ScrollArea className="col-span-3 border border-divider bg-white rounded-md h-[calc(100vh-19.8rem)]">
                            <div className="p-4 grid grid-cols-3 gap-2">
                                {availableAdmins?.map((item, index) => {
                                const isSelected = courseAdmins.some((admin) => admin.user_id === item.id);
                                return (
                                        <div className={`relative col-span-1 border rounded-md p-4 flex flex-row items-center shadow-sm gap-2 transition-all transform duration-150 ease-in-out hover:border-green-500 hover:scale-[1.01] hover:cursor-pointer ${isSelected ? "border-green-500 border-2 bg-green-50 ring-2 ring-green-300" : "border-divider"}`}
                                            key={index}
                                            onClick={() => handleAssignCourseAdmin(item.id)}
                                        >
                                        {isSelected && (
                                            <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
                                            <FontAwesomeIcon icon={faCheck} size="sm" />
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 w-10 h-10 bg-white text-primary border-primary border-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAdminDetailsIconClick(e, item);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                        </div>

                                        <img className="w-10 h-10 rounded-full object-cover"
                                            src={item.profile_image}
                                            alt={`${item.first_name} ${item.last_name}`}
                                        />
                                        <div>
                                            <p className="font-header text-primary text-sm">
                                            {item.first_name} {item.middle_name || ""} {item.last_name}
                                            </p>
                                            <p className="font-text text-unactive text-xs">ID {item.employeeID}</p>
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        </ScrollArea>
                    </>
                    :
                    <div className="col-span-4 row-span-2 w-full h-full">
                        <Stepper initialStep={0} enableStepClick={true} ref={stepperRef} loading={loading}>
                            {(overview || objective) &&
                            <Step stepTitle="Course Overview" stepType="overview" key="overview">
                                <CourseOverviewCPL overview={overview} objective={objective} />
                            </Step>
                            }

                            {modules.map((item, index) => {
                                let content;
                                switch (item?.type) {
                                    case "module":
                                        content = <CourseContentCPL course={item.content} />;
                                        break;
                                    case "file":
                                    case "video":
                                        content = <AttachmentPreview attachment={item} />;
                                        break;
                                    case "assessment":
                                        content = <AssessmentPreview assessment={item.content} />;
                                        break;
                                    default:
                                        content = (
                                            <div className="w-full h-full flex items-center justify-center">
                                            <p className="font-text text-primary text-sm">No Content Available</p>
                                            </div>
                                        );
                                }
                                return (
                                    <Step key={index} stepTitle={item?.title} stepType={item?.type}>
                                        {content}
                                    </Step>
                                );
                            })}

                            {certificate && (
                            <Step stepTitle="Course Certificate" stepType="certificate" key="certificate">
                                <CourseCertificateCPL certificate={certificate} />
                            </Step>
                            )}
                        </Stepper>
                    </div>
                }
            </div>
        </div>
        <CoursePreviewDetailsModal open={openDetails} close={() => setOpenDetails(false)}  selectedCourse={course} role={role}/>
        <SuccessModal open={successModalOpen} close={() => setSuccessModalOpen(false)} header="Success!" desc="The course has been published successfully" confirmLabel="Close"/>
        <WarningModal open={warningModalOpen} proceed={() => setWarningModalOpen(false)} cancel={() => setWarningModalOpen(false)} header="Approval Response Required" desc="Please choose an Approval Response before submitting." />
        <ConfirmationModal open={confirmationModalOpen} confirm={confirmAssignAdmin} cancel={cancelAssignAdmin} header="Confirm Assigning Course Admin" desc={`Are you sure you want to assign ${courseAdmins.length} selected admin(s)?`} confirming={confirming}/>

        <CourseAssignedAdminDetailsModal
            open={showAdminDetails}
            close={() => setShowAdminDetails(false)}
            className="z-[100]"
            selectedAdmin={selectedAdmin}
        />

        {/* Course Restoration Modal */}
        <ConfirmationModal
            open={showRestoreCourseModal}
            confirm={() => {
                handleRestoreCourse();
            }}
            cancel={() => setShowRestoreCourseModal(false)}
            header="Restore Course?"
            desc="Are you sure you want to restore this course? It will be moved back to active status."
            confirming={restoringCourse}
        />
        {/* Course Delete Archive Modal */}
        <ConfirmationModal
            open={showDeleteArchivedCourseModal}
            confirm={() => {
                handleDeleteArchivedCourse();
            }}
            cancel={() => setShowDeleteArchivedCourseModal(false)}
            header="Delete Archived Course?"
            desc="Are you sure you want to delete this course?"
            confirming={deletingArchivedCourse}
        />
        <SuccessModal
            open={showSuccessRestoreModalOpen}
            close={() => {
                setShowSuccessRestoreModalOpen(false);
                navigate(-1);
            }}
            header="Success!"
            desc="The course has been restored successfully"
            confirmLabel="Close"
        />
        <SuccessModal
            open={showSuccessDeleteArchivedCourse}
            close={() => {
                setShowSuccessDeleteArchivedCourse(false);
                navigate(-1);
            }}
            header="Success!"
            desc="The course has been deleted successfully"
            confirmLabel="Close"
        />

        {/* Course Approval / Rejection Response */}
        <SuccessModal 
            open={successApproveModalOpen} 
            close={() => {
                setSuccessApproveModalOpen(false);
                navigate(-1);
            }} 
            header="Success!" 
            desc="Your response has been submitted successfully."
            confirmLabel="Close"
        />
        <ConfirmationModal
            open={confirmResponseModalOpen}
            confirm={() => { approveCourse(); }}
            cancel={() => setConfirmResponseModalOpen(false)}
            header="Confirm Your Action"
            desc={`Are you sure you want the course to be ${selectedAction}?`}
            confirming={confirming}
        />

        {/* Course Publish Response */}
        <SuccessModal 
            open={successPublishModalOpen} 
            close={() => setSuccessPublishModalOpen(false)} 
            header="Success!" 
            desc="Course has been published successfully."
        />
        <ConfirmationModal
            open={confirmPublishModalOpen}
            confirm={() => { publishCourse(true); }}
            cancel={() => setConfirmPublishModalOpen(false)}
            header="Confirm Publish"
            desc="Are you sure you want to publish this course?"
            confirming={confirming}
        />

        <SuccessModal 
            open={showSuccessHardDeleteCourse} 
            close={() => {
                setShowSuccessHardDeleteCourse(false);
                navigate(-1);
            }}
            header="Success!" 
            desc="Course has been deleted permanently. A Soft Copy has been automatically exported."
            confirmLabel="Close"
        />
        <ConfirmationModal
            open={showHardDeleteCourseModal}
            confirm={handleHardDeleteCourse}
            cancel={() => setShowHardDeleteCourseModal(false)}
            header="Confirm Delete"
            desc="Are you sure you want to permanently delete this course?"
            confirming={hardDeletingCourse}
        />

        <ArchiveCourseWithCourseAdmins 
            open={showArchiveCourseWithCourseAdmins}
            close={() => setShowArchiveCourseWithCourseAdmins(false)}
            course={course}
        />

        <ConfirmationModal
            open={showRestoreInactiveCourseModal}
            confirm={() => {
                handleRestoreInactiveCourse();
            }}
            cancel={() => setShowRestoreInactiveCourseModal(false)}
            header="Restore Course?"
            desc="Are you sure you want to restore this course? It will be moved back to its original status."
            confirming={restoringInactiveCourse}
        />
        </>
    )
}

