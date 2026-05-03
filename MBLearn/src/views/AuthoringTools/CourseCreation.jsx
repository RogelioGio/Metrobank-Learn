import { faAdd, faBook, faUserSlash, faHistory, faCheckCircle, faHourglass, faCertificate, faCircleInfo, faEye, faFile, faCircleCheck, faLink, faFilePen, faFolder, faTrashAlt, faFileLines, faKey, faArchive, faChalkboardTeacher, faClock, faTrashRestore, faGripVertical, faList, faPencil, faSave, faSpinner, faTrash, faTrashCanArrowUp, faUpload, faUndo, faUserPlus, faUsers, faVideo, faXmark, faSignature } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from "formik"
import * as Yup from "yup"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { Switch } from "MBLearn/src/components/ui/switch"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import FileAttachmentModal from "MBLearn/src/modalsandprops/AuthoringTool/FileAttachmentModal"
import VideoAttachmentModal from "MBLearn/src/modalsandprops/AuthoringTool/VideoAttachmentModal"
import { useEffect, useState, useRef, useCallback } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useNavigate } from "react-router"
import { useLocation } from 'react-router-dom';

import axiosClient from "MBLearn/src/axios-client"
import { useParams } from "react-router"
import InviteCollaborator from "MBLearn/src/modalsandprops/AuthoringTool/InviteCollaborator"
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext"
import { RingProgress } from "@mantine/core"
import CourseCreationProgress from "MBLearn/src/modalsandprops/AuthoringTool/CourseCreationProgress"
import EditCourseNameAndInformation from "MBLearn/src/modalsandprops/AuthoringTool/EditCourseNameAndInformation"
import { useLessonCanvas } from "MBLearn/src/contexts/LessonCanvasContext"
import { useAssessmentCanvas } from "MBLearn/src/contexts/AssessmentCanvasContext"
// import EditCourseNameAndInformation from "MBLearn/src/modalsandprops/AuthoringTool/EditCourseNameAndInformation"
import AssignViewer from "MBLearn/src/modalsandprops/AuthoringTool/AssignViewer"
import WarningModal from "MBLearn/src/modalsandprops/AuthoringTool/WarningModals"
import ConfirmationModal from "MBLearn/src/modalsandprops/AuthoringTool/ConfirmationModal"
import SuccessModal from "MBLearn/src/modalsandprops/AuthoringTool/SuccessModal"
import CertificateInputModal from "MBLearn/src/modalsandprops/AuthoringTool/CertificateInputModal"
import CourseDeleteModal from "MBLearn/src/modalsandprops/AuthoringTool/CourseDeleteModal"
import PublishOrAssignModal from "MBLearn/src/modalsandprops/AuthoringTool/PublishOrAssignModal"
import ReassignViewer from "MBLearn/src/modalsandprops/AuthoringTool/ReassignViewer"
import FileErrorModal from "MBLearn/src/modalsandprops/AuthoringTool/FileErrorModal"
import noImagePlaceholder from 'MBLearn/src/assets/no_image_placeholder.png';
import useCourseVersionUpdates from "MBLearn/src/modalsandprops/AuthoringTool/hooks/useCourseVersionUpdates"

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger } from "MBLearn/src/components/ui/sheet"
import CourseVersionHistorySheet from "MBLearn/src/modalsandprops/AuthoringTool/CourseVersionHistorySheet"
import CourseVersionHistoryModal from "MBLearn/src/modalsandprops/AuthoringTool/CourseVersionHistoryModal"
import RTECourseDetails from "MBLearn/src/modalsandprops/RTECourseDetails"
import CourseVersionHistoryTab from "MBLearn/src/modalsandprops/AuthoringTool/CourseVersionHistoryTab"

export function CourseCreation() {

    const {setPageTitle, setShowBack, setShouldConfirmBack, user} = useStateContext()

    const { courseId } = useParams();
    const [smePermissions, setSmePermissions] = useState([]);
    const [permissionError, setPermissionError] = useState(null);
    const fetchSMEPermissions = () => {
        if (!user?.id || !courseId) return;

        axiosClient.get(`/course/${courseId}/my-permissions?userInfoId=${user?.user_infos?.id}`)
            .then(response => {
                setSmePermissions(response.data.permissions || []);
            })
            .catch(error => {
                console.error("Failed to fetch SME permissions", error);
                setPermissionError("Could not load permissions");
            });
    };
    useEffect(() => {
        fetchSMEPermissions();
    }, [user?.id, user?.user_infos?.id, courseId]);


    const [tab, setTab] = useState('details');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlTab = params.get("tab");
        if (urlTab) {
            setTab(urlTab);
        }
    }, []);
    const handleTabChange = (newTab) => {
        setTab(newTab);

        const params = new URLSearchParams(location.search);
        params.set("tab", newTab);

        navigate({ search: params.toString() }, { replace: true });
    };

    const [changedOrder, setChangedOrder] = useState(false);
    const [videoAttachtmentModalOpen, setVideoAttachtmentModalOpen] = useState(false);
    const [fileAttachtmentModalOpen, setFileAttachtmentModalOpen] = useState(false);
    const [editCourseNameAndInformationModalOpen, setEditCourseNameAndInformationModalOpen] = useState(false)
    const [assignViewer, setAssignViewer] = useState(false);

    const navigate = useNavigate();
    const [openInvite, setOpenInvite] = useState(false);
    const {course, setCourse} = useCreateCourse();
    const {setLesson} = useLessonCanvas();
    const {setAssessment} = useAssessmentCanvas();
    const [loading, setLoading] = useState(false);
    const [published, setPublished] = useState(course?.CourseStatus === 'published');
    const [Openprogress, setOpenprogress] = useState(false);
    const [modules, setModules] = useState([]);


    // console.log(course);
    const [loadingModules, setLoadingModules] = useState(true);
    const [loadingCertificate, setLoadingCertificate] = useState(true);
    const [loadingCollaboration, setLoadingCollaboration] = useState(false);

    const [savingItems, setSavingItems] = useState(false)
    const [saving, setSaving]=useState ({
        overview: false,
        objective: false,
    })
    const handleSavingChange = (key, value) => {
    setSaving(prev => ({
        ...prev,
        [key]: value,
    }));
    };
    const [remove, setRemove] = useState({
        open: false,
        removing: false,
        module: {},
    })

    useEffect(() => {
        if (course) {
            setShowBack(true);
            setShouldConfirmBack(true);
            setPageTitle("COURSE CREATION");
        }
        return () => {
            setShouldConfirmBack(false);
            setShowBack(false);
        };
    }, [course]);

    const location = useLocation();
useEffect(() => {
    setLoading(true);
    fetchCourse();
    fetchModuleItems();
}, [courseId]);

    const fetchModuleItems = () => {
        setLoadingModules(true);
        axiosClient.get(`/fetchModuleItems/${courseId}`)
        .then(({ data }) => {
            // console.log("asdasdasd", data);
            setModules(data.modules);
            setLoadingModules(false);
        formik.setFieldValue('modules', data.modules);
        })
        .catch((error) => {
        console.log("The Error: ", error);
        });
    };

    const DevelopmentPercentage = (course) => {
        let percent = 0

        if(modules.some(item => item.type === "module")) percent++
        if(modules.some(item => item.type === "assessment")) percent++
        const hasCreditorSignature = course?.certificates?.some(cert => cert.creditors?.some(c => c.SignatureURL_Path));
        if (hasCreditorSignature) { percent++; }
        if(course?.Objective && course.Objective.trim() !== "") percent++
        if(course?.Overview && course.Overview.trim() !== "") percent++
        if(course?.ImagePath && course.ImagePath.trim() !== "") percent++

        return Math.round((percent / 6) * 100)
    }

    // const getCourseDevelopment = () => {
    //     axiosClient.get(`/getCourseDevelopment/${courseId}`)
    //     .then(({data}) => {
    //         if(data.module > 0){
    //             addDevelopmentPercentage(20)
    //         }

    //         if(data.test > 0) {
    //             addDevelopmentPercentage(20)
    //         }

    //         if(data.certification > 0) {
    //             addDevelopmentPercentage(20)
    //         }

    //         if(data.objective === true){
    //             addDevelopmentPercentage(20)
    //         }

    //         if(data.overview === true){
    //             addDevelopmentPercentage(20)
    //         }

    //     })
    //     .catch((error) => {
    //         console.error("Error fetching course development: ", error);
    //     });
    // }


    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reordered = Array.from(formik.values.modules);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);

        formik.setFieldValue("modules", reordered);

        //const items = Array.from(modules);
        //const [reordered] = items.splice(result.source.index, 1);
        //items.splice(result.destination.index, 0, reordered);

        setModules(reordered);
        setChangedOrder(true);
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { modules },
        validationSchema: Yup.object().shape({
            modules: Yup.array().of(
            Yup.object().shape({
                title: Yup.string().required('Content Name is required'),
                type: Yup.string().required('Content Type is required'),
            })
            )
        }),
        onSubmit: async (values) => {
            const modulesWithOrder = values.modules.map((module, index) => ({
                ...module,
                currentOrderPosition: index,
            }));

            const payload = { modules: modulesWithOrder, courseId };
            setSavingItems(true);
            try {
                const response = await axiosClient.post(`/postModuleItem/${courseId}`, payload);

                setSavingItems(false);
                setChangedOrder(false);

                const savedModules = response.data.modules;
                const updatedModules = savedModules.map(m => ({ ...m, unsave: false }));
                setModules(updatedModules);
                fetchModuleItems();

                const firstNewModule = savedModules[0];  
                if (firstNewModule) {
                    if (firstNewModule.type === "module") {
                        navigate(`/SubjectMatterExpert/lessonCanvas/${firstNewModule.id}`);
                    } else if (firstNewModule.type === "assessment") {
                        navigate(`/SubjectMatterExpert/assessmentCanvas/${firstNewModule.id}`);
                    }
                }

            } catch (error) {
                console.error("Error submitting form:", error);
                setSavingItems(false);
            }
        }
    });

    /// --------------------
    /// Image Thumbnail Upload
    /// --------------------
    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [thumbnailLoad, setThumbnailLoad] = useState(false);
    const [updateThumbnailSuccessModal, setUpdateThumbnailSuccessModal] = useState(false);
    const [fileErrorModalOpen, setFileErrorModalOpen] = useState(false);

    const handleUploadImageBanner = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            setFileErrorModalOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('ImagePath', file);

        let simulatedProgress = 0;
        let progressInterval;

        const startSimulatedProgress = () => {
            progressInterval = setInterval(() => {
                simulatedProgress += 1;
                setUploadProgress(simulatedProgress);
                if (simulatedProgress >= 99) {
                    clearInterval(progressInterval);
                }
            }, 30);
        };

        try {
            setThumbnailLoad(true);
            startSimulatedProgress();

            const response = await axiosClient.post(`/uploadImageBanner/${courseId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const realPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (realPercent >= 99) {
                        clearInterval(progressInterval);
                        setUploadProgress(realPercent);
                    }
                }
            });

            setUploadProgress(100);
            setTimeout(() => {
                setImageUrl(response.data.path);
                setUpdateThumbnailSuccessModal(true);
            }, 300);

        } catch (error) {
            console.error('Upload failed:', error.response?.data || error.message);
        } finally {
            setTimeout(() => {
                setUploadProgress(0);
                setThumbnailLoad(false);
            }, 1000);
        }
    };



    /// --------------------
    /// Update Course Details
    /// --------------------
    const [editing, setEditing] = useState(false);
    const [editOverview, setEditOverview] = useState(false);
    const [editObjectives, setEditObjectives] = useState(false);
    const [currentSavingField, setCurrentSavingField] = useState(null);
    const [updateDetailsSuccessModal, setUpdateDetailsSuccessModal] = useState(false);

    const OverviewForm = useFormik({
        enableReinitialize: true,
        initialValues: { overview: course?.Overview || "" },
        validationSchema: Yup.object({ overview: Yup.string().required('Overview is required') }),
        onSubmit: (values) => {
            handleSavingChange('overview', true);
            // console.log("sample", values);
            axiosClient.put(`/updateCourseDetails/${course.id}`, { Overview: values.overview })
            .then(() => {
                setCourse(prev => ({ ...prev, Overview: values.overview }));
                handleSavingChange('overview', false);
                setEditOverview(false);
                setUpdateDetailsSuccessModal(true);
            })
            .catch(console.error);
        }
    });
    const ObjectiveForm = useFormik({
        enableReinitialize: true,
        initialValues: { objective: course?.Objective || "" },
        validationSchema: Yup.object({ objective: Yup.string().required('Objective is required') }),
        onSubmit: (values) => {
        handleSavingChange('objective', true);
        axiosClient.put(`/updateCourseDetails/${course.id}`, { Objective: values.objective })
            .then(() => {
            setCourse(prev => ({ ...prev, Objective: values.objective }));
            handleSavingChange('objective', false);
            setEditObjectives(false);
            setUpdateDetailsSuccessModal(true);
            })
            .catch(console.error);
        }
    });

    /// --------------------
    /// Confirmation Modal
    /// --------------------
    const [showDetailConfirm, setShowDetailConfirm] = useState({
        overview: false,
        objective: false,
    });

    /// --------------------
    /// Delete Items
    /// --------------------
    const handleDelete = async (item) => {
        // console.log("Deleting item: ", item);
        setRemove(prev => ({...prev, removing: true}))
        try {
            const response = await axiosClient.post(`/deleteItem/${courseId}`, {
                id: item.id,
                type: item.type
            });
            setRemove({open: false});
            setTimeout(() => {
                setRemove(prev => ({...prev, removing: false}))
            },500);
            fetchModuleItems();
        } catch (error) {
            console.error("Delete error:", error.response?.data || error.message);
        }
    };

    const [selectedAttachmentId, setSelectedAttachmentId] = useState(null);

    /// --------------------
    /// Certificate
    /// --------------------
    const [showCertificateInputModal, setShowCertificateInputModal] = useState(false);
    const [certificateUrl, setCertificateUrl] = useState('');

    const loadCertificate = async () => {
        setLoadingCertificate(true);
        try {
            const response = await axiosClient.get(
            `https://api.mb-authoringtool.online/api/certificateCreditorCredentials/${course?.certificates?.[0]?.id}`
            );

            if (response.status === 200) {
                setCertificateUrl(`https://api.mb-authoringtool.online/api/certificateCreditorCredentials/${course?.certificates?.[0]?.id}?t=${Date.now()}`);
            } else {
                console.error("Failed to fetch certificate");
            }
        } catch (err) {
            console.error("Error loading certificate:", err);
        } finally {
            setLoadingCertificate(false);
        }
    };

    useEffect(() => {
        if (course?.certificates?.[0]?.id) {
            loadCertificate();
        }
    }, [course?.certificates?.[0]?.id]);
    // console.log("certificate url: ", certificateUrl);
    // console.log("certificate id: ", course?.certificates?.[0]?.id);    

    /// --------------------
    /// Trash Bin
    /// --------------------
    const [activeTab, setActiveTab] = useState("modules");
    const [itemToRestore, setItemToRestore] = useState(null);
    const [showRestoreContentConfirm, setShowRestoreContentConfirm] = useState(false);

    const handleRestoreItem = async (item) => {
        try {
            const typeMap = {
            modules: 'module',
            assessments: 'assessment',
            files: 'file',
            videos: 'video',
            };

            const type = typeMap[activeTab];

            if (!type) {
                console.error("Invalid tab type for restore:", activeTab);
                return;
            }

            const response = await axiosClient.post('/restoreTrashedItem', {
                id: item.id,
                type: type
            });

            // console.log(response);

            fetchTrashedItems
            ();

        } catch (error) {
            console.error("Failed to restore item:", error);
        }
    };


    const TRASH_CATEGORIES = [
        { label: "Lessons", key: "modules", icon: faChalkboardTeacher },
        { label: "Assessments", key: "assessments", icon: faList },
        { label: "Files", key: "files", icon: faFile },
        { label: "Videos", key: "videos", icon: faVideo },
    ];

    /// --------------------
    /// Fetch Trashed Items
    /// --------------------
    const [deletedItems, setDeletedItems] = useState({
        modules: [],
        assessments: [],
        files: [],
        videos: [],
    });

    const fetchTrashedItems = async () => {
        try {
            const response = await axiosClient.get(`/fetchTrashedItems/${courseId}`);
            setDeletedItems(response.data);
            // console.log("asdfsadsadsdaf", response.data);
        } catch (error) {
            console.error('Failed to fetch trashed items:', error);
        }
    };
    useEffect(() => {
        fetchTrashedItems();
    }, []);


    /// --------------------
    /// Content Items
    /// --------------------
    const [addingItem, setAddingItem] = useState(false);
    const handleAddItem = (count) => {
        const item = {
            id: `${count}`,
            title: "",
            type: "",
            unsave: true
        };

        const updatedModules = [...formik.values.modules, item];

        formik.setFieldValue("modules", updatedModules);
        setModules(updatedModules);
    };
    const handleModuleTypeChange = (index, value) => {
        const count = formik.values.modules.filter(m => m.type === value).length + 1;

        const autoTitle =
            value === "module" ? `Lesson ${count}` :
            value === "assessment" ? `Assessment ${count}` :
            value === "file" ? `File ${count}` :
            value === "video" ? `Video ${count}` : "";

        const updatedModules = [...formik.values.modules];
        updatedModules[index] = {
            ...updatedModules[index],
            type: value,
            title: autoTitle,
            tempTitle: autoTitle,
            unsave: true,
        };

        formik.setFieldValue("modules", updatedModules);
        setModules(updatedModules);
    };


    const handleModuleTitleChange = (index, value) => {
        const updatedModules = [...formik.values.modules];
        updatedModules[index] = {
            ...updatedModules[index],
            title: value,
            tempTitle: value,
            unsave: true,
        };

        formik.setFieldValue("modules", updatedModules);
        setModules(updatedModules);
    };



    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        //Logs
        axiosClient.post(`/logOpenCourse/${courseId}`,).then(({data}) => {
            // console.log("Logged Open Course: ", data);
        }).catch((error) => {
            console.error("Error logging open course: ", error);
        })
    },[])

    useEffect(() => {
        if (tab === 'certificate') {
            setLoadingCertificate(true);
        }
    }, [tab]);
    
    const fetchCourse = () => {
        axiosClient.get(`/getCreatingCourse/${courseId}`).then(({data}) => {
            // console.log("Fetched Course: ", data);
            setCourse(data);
            setLoading(false);
            setImageUrl(data.ImagePath);
        }).catch((error) => {
            console.error("Error fetching course: ", error);
            setLoading(false);
        })
    }


    // const setCousePublished = () => {
    //     axiosClient.put(`/setCoursePublished/${courseId}`).
    //     then(({data}) => {
    //         // console.log("Course Published Set: ", data)
    //         setPublished(true)
    //     ;})
    //     .catch((error) => {
    //         console.error("Error setting course published: ", error);
    //     });
    // }


    useEffect(() => {
        setCourse(null);
        setPublished(false);
        setLoading(true);
        fetchCourse();
        fetchModuleItems();
    }, [courseId]);

    useEffect(() => {
        if (course) {
            DevelopmentPercentage(course);
        }
    }, [course]);


    //Fetching neccessary component
    useEffect(()=>{
        if(tab === 'modules') {
            fetchModuleItems();
        } else if (tab === 'trash') {
            fetchTrashedItems();
        }
    },[tab])
    
    /// --------------------
    /// Unsaved Changes upon Changing Tabs
    /// --------------------
    const [pendingTab, setPendingTab] = useState(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const hasUnsavedChanges = editOverview || editObjectives || changedOrder;
    function trySetTab(newTab) {
        if (loading) return; 
        if (newTab === tab) return; 

        if (hasUnsavedChanges) {
            setPendingTab(newTab);
            setShowUnsavedModal(true);
        } else {
            handleTabChange(newTab);
        }
    }

    function confirmTabChange() {
        setShowUnsavedModal(false);

        if (pendingTab) {
            setEditOverview(false);
            setEditObjectives(false);
            setChangedOrder(false);
            OverviewForm.resetForm();
            ObjectiveForm.resetForm();

            handleTabChange(pendingTab);
            setPendingTab(null);
        }
    }

    function cancelTabChange() {
        setShowUnsavedModal(false);
        setPendingTab(null);
    }

    const getUnsavedMessage = () => {
        let messages = [];

        if (editOverview) messages.push("Overview");
        if (editObjectives) messages.push("Objectives");
        if (changedOrder) messages.push("Content Order Positions");

        return `You have unsaved changes in ${messages.join(", ")}. Are you sure you want to switch tabs and discard them?`;
    };


    /// --------------------
    /// Archive Course Modal
    /// --------------------
    const [showArchiveCourseModal, setShowArchiveCourseModal] = useState(false);
    const [showSuccessArchiveModal, setShowSuccessArchiveModal] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const handleArchiveCourse = async () => {
        setIsArchiving(true);
        try {
            await axiosClient.delete(`/archiveCourse/${courseId}`); 
            setShowArchiveCourseModal(false);
            setShowSuccessArchiveModal(true);
        } catch (error) {
            console.error("archive failed:", error);
        alert("Failed to archive course.");
        } finally {
            setIsArchiving(false);
        }
    };

    /// --------------------
    /// Delete Course Modal
    /// --------------------
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
    const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteCourse = async () => {
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/deleteCourse/${courseId}`); 
            setShowDeleteCourseModal(false);
            setShowSuccessDeleteModal(true);
        } catch (error) {
            console.error("Delete failed:", error);
        alert("Failed to delete course.");
        } finally {
            setIsDeleting(false);
        }
    };



    const handleExport = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axiosClient.get(`/course/${courseId}/softcopy`, {
            responseType: 'text',
            });

            const html = response.data;

            const blob = new Blob([html], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Course_${course.CourseName}_SoftCopy.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert('Error exporting course: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    /// --------------------
    /// Fetch Invited SMEs
    /// --------------------
    const [invitedUsers, setInvitedUsers] = useState([]);
    // console.log("inbayt inbayt", invitedUsers);
    const fetchInvitedUsers = async () => {
        try {
            const response = await axiosClient.get(`/fetchInvitedSMECreator/${courseId}`);
            setInvitedUsers(response.data.data || []);
            setLoadingCollaboration(false);
        } catch (error) {
            console.error("Failed to fetch invited users:", error);
            setLoadingCollaboration(false);
        }
    };

    useEffect(() => {
        if (tab === 'collaboration') {
            setLoadingCollaboration(true);
            fetchInvitedUsers();
        }
    }, [tab]);

    /// --------------------
    /// Set SME Permissions
    /// --------------------
    const [rolePermissions, setRolePermissions] = useState([]); // <-- make sure it's []
    const [selectedRolePermissions, setSelectedRolePermissions] = useState ([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // console.log("permissions", selectedRolePermissions);
    // console.log("selected user", selectedUser);

    function handlePermissionToggle(permission, isChecked) {
        setSelectedRolePermissions((prevPermissions) => {
            if (isChecked) {
            if (!prevPermissions.includes(permission)) {
                return [...prevPermissions, permission];
            }
            return prevPermissions;
            } else {
            return prevPermissions.filter((perm) => perm !== permission);
            }
        });
    }
    

    /// --------------------
    /// Permissions State HAndlers
    /// --------------------
    const [showConfirmAddPermissionModal, setShowConfirmAddPermissionModal] = useState(false);
    const [isConfirmingPermission, setIsConfirmingPermission] = useState(false);
    const [showSuccessAddPermissionsModal, setShowSuccessAddPermissionsModal] = useState(false);

    const handleAddPermissions = async () => {
        setIsConfirmingPermission(true)
        const payload = {
            userId: selectedUser.id,
            permissions: selectedRolePermissions,
        };

        try {
            const response = await axiosClient.put(`/assignCoursePermissions/${courseId}`, payload);
            // console.log("Permissions assigned to user:", response.data);
            setRolePermissions(selectedRolePermissions);
            setShowConfirmAddPermissionModal(false);
            setShowSuccessAddPermissionsModal(true);
        } catch (error) {
            console.error("Error assigning permissions:", error);
        } finally {
            setIsConfirmingPermission(false);
        }
    };

    const [showConfirmRevokePermissionModal, setShowConfirmRevokePermissionModal] = useState(false);
    const [isConfirmingRevokePermission, setIsConfirmingRevokePermission] = useState(false);
    const [showSuccessRevokePermissionsModal, setShowSuccessRevokePermissionsModal] = useState(false);

    const revokeCourseInvitation = async () => {
        setIsConfirmingRevokePermission(true);

        const payload = {
            userId: selectedUser.id,
            permissions: selectedRolePermissions,
        };
        // Log the payload before sending
        // console.log("Payload to send:", payload);

        try {
            const response = await axiosClient.post(`/revokeCourseInvitation/${courseId}`, payload);
            // console.log("Permissions revoked for user:", response.data);

            setRolePermissions((prev) =>
                prev.filter((perm) => !selectedRolePermissions.includes(perm))
            );

            setSelectedRolePermissions([]);
            setSelectedUser(null);
            setSelectedRolePermissions([]);
            fetchInvitedUsers();

            setShowConfirmRevokePermissionModal(false);
            setShowSuccessRevokePermissionsModal(true);
        } catch (error) {
            console.error("Validation errors:", error.response.data.errors);
        } finally {
            setIsConfirmingRevokePermission(false);
        }
    };



    
    const handleUserClick = async (user) => {
        if (selectedUser?.id === user.id) {
            setSelectedUser(null);
            setSelectedRolePermissions([]);
        } else {
            setSelectedUser(user);
            setSelectedRolePermissions([]);

            try {
                const response = await axiosClient.get(`/fetchSMEPermissions/${courseId}`, {
                    params: { userId: user.id }
                });
                setSelectedRolePermissions(response.data.permissions || []);
                // console.log("Fetched permissions for user:", user.id, response.data.permissions);
            } catch (error) {
                console.error("Failed to fetch permissions", error);
                setSelectedRolePermissions([]);
            }
        }
    };
    
    /// --------------------
    /// Publish or Submit for Re-Approval
    /// --------------------
    const [showPublishOrAssignModal, setShowPublishOrAssignModal] = useState(false);
    const [confirmPublishOpen, setShowConfirmPublish] = useState(false);
    const [successOpen, setShowSuccessPublish] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const handlePublishRequest = () => {
        setShowConfirmPublish(true);
    };

    const handlePublishCourse = () => {
        setPublishing(true);
        axiosClient.put(`/setCoursePublished/${course.id}`)
        .then(() => {
            setPublishing(false);
            setShowConfirmPublish(false);
            setShowSuccessPublish(true);
            fetchCourse();
        })
        .catch((error) => {
            setPublishing(false);
            console.error("Publishing failed:", error);
        });
    };

    const [showReAssignModal, setShowReAssignModal] = useState(false);

    /// --------------------
    /// Checker for Status
    /// --------------------
    const hasRejected = course?.course_review?.some(review => review.approval_status === 'rejected');
    const hasApproved = course?.course_review?.some(review => review.approval_status === 'approved');

    const plainTextLength = OverviewForm.values.overview.replace(/<[^>]+>/g, "").length;

    /// --------------------
    /// Version History Sheet
    /// --------------------
    const [showVersionHistorySheet, setShowVersionHistorySheet] = useState(false);
    const [showCourseVersionHistoryModal, setShowCourseVersionHistoryModal] = useState(false);
    const [selectedChange, setSelectedChange] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);

    const openCourseVersionHistoryModal = (version, formattedVersion, change) => {
        setShowVersionHistorySheet(false);
        setSelectedVersion({...version, formattedVersion});
        setSelectedChange(change);
        setShowCourseVersionHistoryModal(true);
    };

    const closeCourseVersionHistoryModal = () => {
        setShowVersionHistorySheet(true);
        setShowCourseVersionHistoryModal(false);
        setSelectedChange(null);
        setSelectedVersion(null);
    };

    /// --------------------
    /// Fill Up the Version Sheet
    /// --------------------
    const [versionHistory, setVersionHistory] = useState([]);

    const fetchVersionHistory = useCallback(() => {
        axiosClient.get(`/fetchCourseVersionHistory/${courseId}`)
        .then((res) => setVersionHistory(res.data))
        .catch((error) => {
            console.error("Error fetching version history:", error);
        });
    }, [courseId]);

    useEffect(() => {
        if (showVersionHistorySheet) {
        fetchVersionHistory();
        }
    }, [showVersionHistorySheet, fetchVersionHistory]);

    const handleVersionUpdate = useCallback(() => {

    if (showVersionHistorySheet) {
        fetchVersionHistory();
    }
    }, [showVersionHistorySheet, fetchVersionHistory]);

    useCourseVersionUpdates(courseId, handleVersionUpdate, showVersionHistorySheet);

    /// --------------------
    /// Revoke Course Approval
    /// --------------------
    const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
    const [successRevokeOpen, setSuccessRevokeOpen] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const handleRevokeCourse = async () => {
        setRevoking(true);
        try {
            await axiosClient.post(`/revokeApproval/${courseId}`, {
            });

            setSuccessRevokeOpen(true);
            fetchCourse();
        } catch (error) {
            alert('Failed to revoke approval. Please try again.');
        } finally {
            setRevoking(false);
            setConfirmRevokeOpen(false);
        }
    };

    const handleSelectVersion = (version, formattedVersion) => {
        setSelectedVersion({ ...version, formattedVersion });
        setShowVersionHistorySheet(false);
    };


    return (
        <>
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] w-full h-full gap-x-4">
            <div className="col-span-1 row-span-2 pb-4">
                <div className="bg-white justify-between rounded-lg shadow-md h-full flex flex-col">
                    <div className="flex flex-col gap-y-4">
                        {/* Course Name */}
                        <div className="py-4 mx-4 border-b border-divider flex flex-col gap-2">
                            {
                                loading ? (
                                    <>
                                    <div className="flex flex-col gap-2 h-5 w-1/6 rounded-full bg-gray-500 animate-pulse" />
                                    <div className="flex flex-col gap-2 animate-pulse">
                                        <div className="flex flex-col gap-2 h-7 w-full rounded-md bg-gray-500" />
                                        <div className="flex flex-col gap-2 h-4 w-2/3 rounded-md bg-gray-500" />
                                    </div>
                                    </>
                                ) : (
                                    <>
                                    <div className="flex items-center justify-between text-unactive">
                                        <span className="px-4 py-1 w-fit bg-primarybg border border-primary rounded-full font-text text-xs text-primary">
                                            {course?.TrainingType?.charAt(0).toUpperCase()}
                                            {course?.TrainingType?.slice(1)}
                                        </span>

                                        {((smePermissions.includes('EditCourseDetails') || user?.user_infos?.id === course?.user_info_id) &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                            <div
                                            className="hover:text-primary hover:cursor-pointer"
                                            onClick={() => setEditCourseNameAndInformationModalOpen(true)}
                                            >
                                            <FontAwesomeIcon icon={faPencil} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-header text-primary text-lg leading-tight">{course?.CourseName}</p>
                                        <p className="text-xs mb-2">
                                            {course?.category?.category_name} - {course?.career_level?.name} Level
                                        </p>

                                          <div className="flex justify-between items-center">
                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                                                course?.CourseStatus === "created"
                                                ? "bg-blue-100 text-blue-800 border-blue-400"
                                                : course?.CourseStatus === "for_approval"
                                                ? "bg-yellow-100 text-yellow-800 border-yellow-400"
                                                : course?.CourseStatus === "published"
                                                ? "bg-green-800 text-white border-green-800"
                                                : course?.course_review?.some(review => review.approval_status === "rejected")
                                                ? "bg-red-100 text-red-800 border-red-400"
                                                : course?.course_review?.some(review => review.approval_status === "approved")
                                                ? "bg-green-100 text-green-800 border-green-400"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-400"
                                            }`}
                                            >
                                            {course?.CourseStatus === "created"
                                                ? "Created"
                                                : course?.CourseStatus === "for_approval"
                                                ? "For Approval"
                                                : course?.CourseStatus === "published"
                                                ? "Published"
                                                : course?.course_review?.some(review => review.approval_status === "rejected")
                                                ? "Rejected"
                                                : course?.course_review?.some(review => review.approval_status === "approved")
                                                ? "Approved"
                                                : "Pending"}
                                            </span>

                                            <div className="inline-block bg-blue-100 text-blue-800 text-xs md:text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                                                Division: {course?.Division}
                                            </div>
                                        </div>

                                            <Sheet open={showVersionHistorySheet} onOpenChange={setShowVersionHistorySheet}>
                                                <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                                                <SheetContent className="h-full flex-col flex">
                                                    <SheetHeader>
                                                        <SheetTitle className="font-header text-2xl text-primary mb-1 sr-only">
                                                        Version History
                                                        </SheetTitle>
                                                        <SheetDescription className="text-sm text-unactive mb-5 sr-only">
                                                        Detailed version history of the course
                                                        </SheetDescription>
                                                    </SheetHeader>

                                                    <CourseVersionHistorySheet versions={versionHistory} onSelectVersion={handleSelectVersion} />

                                                    <SheetClose className="mt-6 inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none">
                                                        Close
                                                    </SheetClose>
                                                </SheetContent>
                                            </Sheet>
                                    </div>
                                    </>
                                )
                            }
                        </div>
                        {/* Course Aspects */}
                        <div className="px-4 flex flex-col gap-y-2">
                            <div className={`border-2 border-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center gap-x-2  transition-colors ease-in-out cursor-pointer ${loading ? "opacity-50 hover:cursor-not-allowed text-primary hover:bg-white hover:text-primary" :tab === 'details' ? 'bg-primary text-white' : 'text-primary bg-white hover:bg-primary hover:text-white'}`}
                                onClick={() => {
                                    if(!course) return;
                                    trySetTab('details');
                                    }}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                                <p>Details</p>
                            </div>
                            <div className={`border-2 border-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center gap-x-2  transition-colors cursor-pointer ${loading ? "opacity-50 hover:cursor-not-allowed text-primary hover:bg-white hover:text-primary" :tab === 'modules' ? 'bg-primary text-white' : 'text-primary bg-white hover:bg-primary hover:text-white'}`}
                                onClick={() => {
                                    if(!course) return;
                                    trySetTab('modules')
                                    }}>
                                <FontAwesomeIcon icon={faFolder} />
                                <p>Modules</p>
                            </div>
                            <div className={`border-2 border-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center gap-x-2  transition-colors duration-200 cursor-pointer ${loading ? "opacity-50 hover:cursor-not-allowed text-primary hover:bg-white hover:text-primary" :tab === 'certificate' ? 'bg-primary text-white' : 'text-primary bg-white hover:bg-primary hover:text-white'}`}
                                onClick={() => {
                                    if(!course) return;
                                    trySetTab('certificate')}}>
                                <FontAwesomeIcon icon={faCertificate} />
                                <p>Certificate</p>
                            </div>
                            <div className={`border-2 border-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center gap-x-2 transition-colors duration-200 cursor-pointer ${loading ? "opacity-50 hover:cursor-not-allowed text-primary hover:bg-white hover:text-primary" :tab === 'collaboration' ? 'bg-primary text-white' : 'text-primary bg-white hover:bg-primary hover:text-white'}`}
                                onClick={() => {
                                    if(!course) return;
                                    trySetTab('collaboration')}}>
                                <FontAwesomeIcon icon={faUsers} />
                                <p>Collaboration</p>
                            </div>
                            <div className={`border-2 border-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center gap-x-2 transition-colors duration-200 cursor-pointer ${loading ? "opacity-50 hover:cursor-not-allowed text-primary hover:bg-white hover:text-primary" :tab === 'trash' ? 'bg-primary text-white' : 'text-primary bg-white hover:bg-primary hover:text-white'}`}
                                onClick={() => {
                                    if(!course) return;
                                    trySetTab('trash')}}>
                                <FontAwesomeIcon icon={faTrashCanArrowUp} />
                                <p>Trash Bin</p>
                            </div>
                        </div>
                    </div>
                        {/* Created - Primary */}
                        {/* On-Development - Orange */}
                        {/* Draft - Yellow */}
                        {/* Reviewed - Purple */}
                        {/* Published - Green */}
                    <div className="p-4 flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between gap-x-2 border-2 border-transparent hover:border-primary hover:shadow-md p-2 rounded-md transition-all ease-in-out cursor-pointer w-full"
                            onClick={() => {setOpenprogress(true)}}>
                            <div className="flex flex-row items-center">
                                <RingProgress
                                    size={55}
                                    thickness={10}
                                    sections={[{ value: loading ? 0 : DevelopmentPercentage(course), color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                    rootColor="hsl(210, 14%, 83%)"
                                    />
                                <div className="flex flex-col w-full">
                                    <p className="font-text text-xs"> Course Creation Progress: </p>
                                    <div className="flex flex-row items-center justify-between gap-x-2">

                                        {
                                            loading ?
                                            <div className="flex flex-col gap-2 h-8 w-2/3 rounded-full bg-gray-500 animate-pulse"/>
                                            :
                                            <>
                                                <p className="font-header text-2xl text-primary">{DevelopmentPercentage(course) || 0}%</p>
                                                <span className="bg-blue-300 text-blue-900 py-1 px-5 text-xs rounded-full border-primary border">{course?.CourseStatus.charAt(0).toUpperCase()}{course?.CourseStatus.slice(1)}  </span>
                                            </>
                                        }
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div
                            className={`
                                border-2 border-primary bg-white px-4 py-2 rounded-md shadow-md font-header text-primary flex flex-row items-center justify-center gap-x-2 
                                ${loading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-colors ease-in-out'}
                            `}
                            onClick={() => {
                                if (!loading) {
                                navigate(`/SubjectMatterExpert/authoring-tool/course-incomplete-preview/${courseId}`, { state: { courseId, course } });
                                }
                            }}
                        >
                        <FontAwesomeIcon icon={faEye} />
                        Preview Course
                        </div>

                        <div className={`border-2 border-primary bg-white px-4 py-2 rounded-md shadow-md font-header text-primary flex flex-row items-center justify-center gap-x-2 
                                ${loading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-colors ease-in-out'}
                            `}
                            onClick={() => {
                                trySetTab("history");
                                setShowVersionHistorySheet(true);
                            }}
                        >
                        <FontAwesomeIcon icon={faHistory} />
                            View Version History
                        </div>

                        {
                            course?.CourseStatus === 'draft' ? (
                                <div className="border-2 border-primary bg-white px-4 py-2 rounded-md shadow-md font-header text-primary flex flex-row items-center justify-center gap-x-2 cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-colors ease-in-out"
                                    onClick={() => setConfirmRevokeOpen(true)}
                                >
                                <FontAwesomeIcon icon={faUndo} />
                                    <p>Revoke Course Approval</p>
                                </div>
                            ) : course?.CourseStatus === 'for_approval' ? (
                                <div
                                className={`border-2 border-blue-600 bg-blue-100 px-4 py-2 rounded-md shadow-md font-header text-blue-900 flex flex-row items-center justify-center gap-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-200 hover:border-blue-700 hover:text-blue-900 transition-colors ease-in-out'}`}
                                onClick={() => {
                                    if (loading) return;
                                    if (DevelopmentPercentage(course) !== 100) {
                                    setOpenprogress(true);
                                    return;
                                    }
                                    setShowReAssignModal(true);
                                }}
                                >
                                <FontAwesomeIcon icon={faBook} />
                                <p>Submit for Re-Approval</p>
                                </div>
                            ) : course?.CourseStatus === 'published' || published ? (
                            <div className="bg-green-900 px-4 py-2 rounded-md shadow-md font-header text-white flex flex-row items-center justify-center gap-x-2">
                                <p>Published</p>
                            </div>
                            ) : course?.course_review?.some(review => review.approval_status === 'rejected') ? (
                                (smePermissions.includes("CompleteCourse") || user?.user_infos?.id === course?.user_info_id) &&
                                (['created', 'reviewed', 'for_approval'].includes(course?.CourseStatus)) && (
                                <div
                                    className={`border-2 border-red-600 bg-red-100 px-4 py-2 rounded-md shadow-md font-header text-red-900 flex flex-row items-center justify-center gap-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-red-200 hover:border-red-700 hover:text-red-900 transition-colors ease-in-out'}`}
                                    onClick={() => {
                                    if (loading) return;
                                    if (DevelopmentPercentage(course) !== 100) {
                                        setOpenprogress(true);
                                        return;
                                    }
                                    setShowReAssignModal(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBook} />
                                    <p>Submit for Re-Approval</p>
                                </div>
                                )
                            ) : course?.course_review?.length > 0 && course?.course_review.every(review => review.approval_status === 'approved') ? (
                                <div className={`border-2 border-green-600 bg-green-100 px-4 py-2 rounded-md shadow-md font-header text-green-900 flex flex-row items-center justify-center gap-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-green-200 hover:border-green-700 hover:text-green-900 transition-colors ease-in-out'}`}
                                onClick={() => {
                                    if (loading) return;
                                    setShowPublishOrAssignModal(true);
                                }}
                                >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <p>Publish or Submit for Re-Approval</p>
                                </div>
                            ) : (
                                (smePermissions.includes("CompleteCourse") || user?.user_infos?.id === course?.user_info_id) &&
                                ['created', 'reviewed', 'for_approval'].includes(course?.CourseStatus) &&
                                !course?.course_review?.some(review => review.approval_status === 'approved') && (
                                <div
                                    className="border-2 border-primary bg-primary px-4 py-2 rounded-md shadow-md font-header text-white flex flex-row items-center justify-center gap-x-2 cursor-pointer transition-colors ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white"
                                    onClick={() => {
                                    if (DevelopmentPercentage(course) !== 100) {
                                        setOpenprogress(true);
                                        return;
                                    }
                                    setAssignViewer(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBook} />
                                    <p>Submit for Approval</p>
                                </div>
                                )
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="col-span-3 row-span-2 mb-4 mr-4">
                {
                    tab === 'details' ?
                        <div className="grid grid-cols-4 grid-rows-[min-content_min-content_1fr] gap-4 w-full h-full ">
                            <div className="flex flex-col gap-1 col-span-4">
                                <div className="flex flex-row justify-between items-center w-full">
                                    <div className="flex flex-row items-center gap-x-2 text-primary text-2xl">
                                        <FontAwesomeIcon icon={faCircleInfo} />
                                        <p className="font-header text-primary">Course Details</p>
                                    </div>

                                    <div className="flex flex-row gap-x-2">
                                        {user?.user_infos?.id === course?.user_info_id &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) &&
                                        !course?.course_review?.some(r => r.approval_status === 'approved'))) && (
                                            <div
                                            className="group py-2 px-5 text-lg bg-red-600 text-white rounded-md shadow-md flex items-center justify-center hover:bg-red-700 transition-colors ease-in-out cursor-pointer select-none"
                                            onClick={() => setShowDeleteCourseModal(true)}
                                            >
                                            <p className="font-header overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-[200px] group-hover:-translate-x-2 transition-all duration-300 ease-in-out">
                                                Delete Course
                                            </p>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                            </div>
                                        )}

                                        {user?.user_infos?.id === course?.user_info_id &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) &&
                                        !course?.course_review?.some(r => r.approval_status === 'approved'))) && (
                                            <div
                                            className="group py-2 px-5 text-lg bg-amber-500 text-white rounded-md shadow-md flex items-center justify-center hover:bg-amber-600 transition-colors ease-in-out cursor-pointer select-none"
                                            onClick={() => setShowArchiveCourseModal(true)}
                                            >
                                            <p className="font-header overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-[200px] group-hover:-translate-x-2 transition-all duration-300 ease-in-out">
                                                Archive Course
                                            </p>
                                            <FontAwesomeIcon icon={faArchive} />
                                            </div>
                                        )} 
                                    </div>
                                </div>
                                <p className="text-xs font-text">This entails the basic information that the learner needs to know about the course.</p>
                            </div>
                            <div className="col-span-4 flex flex-col gap-y-2">
                                <div className="flex flex-row justify-between items-center">
                                    <div>
                                        <p className="font-header text-primary text-base">Course Thumbnail</p>
                                        <p className="font-text text-xs">
                                            A visual preview image representing the course, used to make content easily identifiable and engaging for learners.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-2">
                                    <div className="relative w-full h-40 bg-white border-2 border-primary rounded-md shadow-md flex items-center justify-center overflow-hidden">
                                        {loading || thumbnailLoad ? (
                                            <div className="w-full h-full animate-pulse" />
                                        ) : imageUrl ? (
                                            <img
                                            src={`${imageUrl}`}
                                            alt="Course Thumbnail"
                                            className="w-full h-full object-cover rounded-md"
                                            />
                                        ) : (
                                            <p className="text-primary font-text">Course Thumbnail Placeholder</p>
                                        )}

                                        {/** Calculate permission OR creator status */}
                                        <div className={`absolute inset-0 rounded-md flex items-center justify-center transition-opacity ease-in-out gap-2 ${ loading || thumbnailLoad ||
                                            !((smePermissions.includes("EditCourseDetails") || user?.user_infos?.id === course?.user_info_id) &&
                                                (course?.CourseStatus === 'for_approval' || (
                                                ['created', 'reviewed'].includes(course?.CourseStatus) &&
                                                !course?.course_review?.some(r => r.approval_status === 'approved'))))
                                                
                                                ? "bg-primary bg-opacity-50 opacity-60 cursor-not-allowed pointer-events-none"
                                                : "bg-primary bg-opacity-50 opacity-0 hover:opacity-80 cursor-pointer text-white pointer-events-auto"
                                            }
                                        `}
                                        onClick={
                                            !thumbnailLoad &&
                                            (smePermissions.includes("EditCourseDetails") || user?.user_infos?.id === course?.user_info_id) &&
                                            (course?.CourseStatus === 'for_approval' || (
                                            ['created', 'reviewed'].includes(course?.CourseStatus) &&
                                            !course?.course_review?.some(r => r.approval_status === 'approved')))
                                                ? handleUploadImageBanner
                                                : undefined
                                        }
                                        >
                                        {((smePermissions.includes("EditCourseDetails") || user?.user_infos?.id === course?.user_info_id) && 
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved')))) && (
                                            <>
                                            <FontAwesomeIcon icon={faUpload} className="text-white text-2xl" />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                                accept="image/*"
                                                disabled={thumbnailLoad}
                                            />
                                            <p>{thumbnailLoad ? "Uploading..." : "Upload or edit course thumbnail"}</p>
                                            </>
                                        )}
                                        </div>
                                    </div>

                                    {uploadProgress > 0 && 
                                    <div className="w-full bg-white bg-opacity-70 p-2 rounded-md shadow-sm">
                                        <p className="text-sm text-gray-700 mb-1">
                                            {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing thumbnail upload...'}
                                        </p>
                                        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-2 transition-all duration-200"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    }
                                </div>
                            </div>

                        {/* Overview Section */}
                            <div className="col-span-2 flex flex-col gap-y-2">
                                <div className="flex flex-row justify-between items-center">
                                    <div>
                                    <p className="font-header text-primary text-base">Overview</p>
                                    <p className="font-text text-xs">A brief description of the course content.</p>

                                    {OverviewForm.touched.overview && OverviewForm.errors.overview && (
                                        <p className="text-red-500 text-xs font-text py-2">
                                        {OverviewForm.errors.overview}
                                        </p>
                                    )}
                                    </div>
                                    {editOverview ? (
                                    <div className="w-8 h-8 bg-white border-2 text-primary border-primary rounded-md shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer">
                                        {saving.overview ? (
                                        <div>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        </div>
                                        ) : (
                                        <div
                                            onClick={() => {
                                            setCurrentSavingField("overview");
                                            setShowDetailConfirm((prev) => ({ ...prev, overview: true }));
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSave} />
                                        </div>
                                        )}
                                    </div>
                                    ) : (
                                        (
                                        (smePermissions.includes('EditCourseDetails') || user?.user_infos?.id === course?.user_info_id) &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved'))) && (
                                        <div
                                            className={`w-8 h-8 bg-white border-2 text-primary border-primary rounded-md shadow-md flex items-center justify-center transition-all ease-in-out cursor-pointer ${
                                            loading ? "opacity-50 hover:cursor-not-allowed" : "hover:bg-primary hover:text-white"
                                            }`}
                                            onClick={() => {
                                            if (loading) return;
                                            setEditOverview(true);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </div>
                                        )
                                    ))}
                                </div>
                                <div className="w-full h-full relative">
                                    {loading ? (
                                    <div className="w-full h-full bg-white border border-divider rounded-md shadow-md flex flex-col animate-pulse" />
                                    ) : (
                                    <div className="w-full h-full bg-white border border-divider rounded-md shadow-md flex flex-col overflow-y-auto max-h-[540px]">
                                        <form className="w-full h-full relative" onSubmit={OverviewForm.handleSubmit}>
                                            <RTECourseDetails
                                                value={OverviewForm.values.overview}
                                                onChange={(val) => OverviewForm.setFieldValue("overview", val)}
                                                disabled={saving.overview || !editOverview}
                                            />
                                            <p className="absolute bottom-2 right-4 text-xs text-gray-500 select-none">
                                            {plainTextLength} / 500
                                            </p>
                                        </form>
                                    </div>
                                    )}
                                </div>
                            </div>

                            {/* Objectives Section */}
                            <div className="col-span-2 flex flex-col gap-y-2">
                                <div className="flex flex-row justify-between items-center">
                                    <div>
                                    <p className="font-header text-primary text-base">Course Objectives</p>
                                    <p className="font-text text-xs">A list of goals that the course aims to achieve</p>

                                    {ObjectiveForm.touched.objective && ObjectiveForm.errors.objective && (
                                        <p className="text-red-500 text-xs font-text py-2">
                                        {ObjectiveForm.errors.objective}
                                        </p>
                                    )}
                                    </div>
                                    {editObjectives ? (
                                    <div className="w-8 h-8 bg-white border-2 text-primary border-primary rounded-md shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer">
                                        {saving.objective ? (
                                        <div>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        </div>
                                        ) : (
                                        <div
                                            onClick={() => {
                                            setCurrentSavingField("objective");
                                            setShowDetailConfirm((prev) => ({ ...prev, objective: true }));
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSave} />
                                        </div>
                                        )}
                                    </div>
                                    ) : (                                    
                                        (smePermissions.includes('EditCourseDetails') || user?.user_infos?.id === course?.user_info_id) &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved'))) && (
                                        <div
                                            className={`w-8 h-8 bg-white border-2 text-primary border-primary rounded-md shadow-md flex items-center justify-center transition-all ease-in-out cursor-pointer ${
                                            loading ? "opacity-50 hover:cursor-not-allowed" : "hover:bg-primary hover:text-white"
                                            }`}
                                            onClick={() => {
                                            if (loading) return;
                                            setEditObjectives(true);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </div>
                                        )
                                    )}
                                </div>
                                <div className="w-full h-full relative">
                                    {loading ? (
                                    <div className="w-full h-full bg-white border border-divider rounded-md shadow-md flex flex-col animate-pulse" />
                                    ) : (
                                    <div className="w-full h-full bg-white border border-divider rounded-md shadow-md flex flex-col overflow-y-auto max-h-[540px]">
                                        <form className="w-full h-full relative" onSubmit={ObjectiveForm.handleSubmit}>
                                            <RTECourseDetails
                                                value={ObjectiveForm.values.objective}
                                                onChange={(val) => ObjectiveForm.setFieldValue("objective", val)}
                                                disabled={saving.objective || !editObjectives}
                                            />
                                            <p className="absolute bottom-2 right-4 text-xs text-gray-500 select-none">
                                            {plainTextLength} / 500
                                            </p>
                                        </form>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    :tab === 'modules' ?
                        <form onSubmit={formik.handleSubmit} className="grid grid-cols-4 grid-rows-[min-content_1fr] gap-4 w-full h-full ">
                            <div className="flex flex-row justify-between col-span-4 items-center">
                                <div className="flex flex-col gap-1 ">
                                <div className="col-span-4 flex flex-row items-center gap-x-2 text-primary text-2xl">
                                    <FontAwesomeIcon icon={faFolder}/>
                                    <p className="font-header text-primary">Modules</p>
                                </div>
                                <p className="text-xs font-text">This is the component that builds the course as well as what is the learner will be learning</p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    {
                                        changedOrder &&
                                        <button className={`gap-4 py-2 px-4 text-lg bg-primary text-white rounded-md shadow-md flex items-center justify-center transition-all ease-in-out cursor-pointer ${
                                            savingItems
                                                ? "opacity-50 hover:cursor-not-allowed"
                                                : "hover:border-primaryhover hover:bg-primaryhover hover:text-white"
                                            }`}
                                            type="submit"
                                            onClick={() => {
                                            if (savingItems) return;
                                            }}
                                        >
                                            {savingItems ? (
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-base" />
                                            ) : (
                                            <>
                                                <p className="font-header">Save Changes</p>
                                                <FontAwesomeIcon icon={faSave} className="text-base" />
                                            </>
                                            )}
                                        </button>

                                    }
                                    {
                                        (smePermissions.includes('CreateItems') || user?.user_infos?.id === course?.user_info_id) &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved'))) && (
                                            
                                        <div className={`gap-4 py-2 px-4 text-lg bg-primary text-white rounded-md shadow-md flex items-center justify-center transition-all ease-in-out cursor-pointer ${loadingModules || savingItems || formik.values.modules.some(m => m.unsave) ? "opacity-50 pointer-events-none" : "hover:bg-primaryhover hover:text-white"}`}
                                            onClick={() => {
                                                if (
                                                    loadingModules || 
                                                    savingItems || 
                                                    formik.values.modules.some(m => m.unsave)
                                                ) return;

                                                handleAddItem(formik.values.modules.length + 1);
                                                setChangedOrder(true);
                                            }}
                                            >
                                            {
                                                loadingModules || savingItems ?
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            : 
                                                formik.values.modules.some(m => m.unsave) ?
                                                <FontAwesomeIcon icon={faHourglass} className="text-xl" />
                                            :
                                                <>
                                                    <p className="font-header">Add Content</p>
                                                    <FontAwesomeIcon icon={faAdd} />
                                                </>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-4">
                                {
                                    loadingModules ?
                                        <div className="border border-divider rounded-md bg-white shadow-md h-[calc(100vh-10.3rem)] flex  flex-col gap-2 p-4">
                                            {
                                                Array.from({length: 5}).map((_,index) => (
                                                    <div key={index} className="w-full h-16 border rounded-md shadow-md animate-pulse"/>
                                                ))
                                            }
                                        </div>
                                    : modules.length === 0 ?
                                        <div className="border border-divider rounded-md bg-white shadow-md h-[calc(100vh-10.3rem)] flex  flex-col gap-2 items-center justify-center">
                                            <div className="bg-primarybg w-24 h-24 flex items-center justify-center rounded-full text-primary">
                                                <FontAwesomeIcon icon={faXmark}  className="text-5xl"/>
                                            </div>
                                            <p className="font-text text-xs text-unactive text-center">The course doesn't have any lesson item, <br/> Create one and develop learning</p>
                                        </div>
                                    :
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="modules">
                                        {(provided) => (
                                            <ScrollArea className="border border-divider rounded-md bg-white shadow-md h-[calc(100vh-10.3rem)]">
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 rounded-lg h-full flex flex-col gap-y-2">
                                                {formik.values.modules.map((item, index) =>
                                                    item.unsave ? (
                                                        <div  key={index} className="w-full flex flex-col py-2 px-4 border border-primary rounded-md shadow-md justify-between bg-white">
                                                            <div className="flex flex-row w-full justify-between">
                                                                <div className="flex flex-col">
                                                                    <p className="font-header text-primary">Create Content</p>
                                                                    <p className="font-text text-xs">Identify the content name and content type to be created in the course</p>
                                                                </div>
                                                                <div onClick={()=>{formik.setFieldValue("modules", formik.values.modules.filter((m)=> m.id !== item.id)); setModules(formik.values.modules.filter((m)=> m.id !== item.id))}} className="text-unactive hover:text-primary hover:cursor-pointer">
                                                                    <FontAwesomeIcon icon={faXmark}/>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-row gap-2">
                                                                <div className="inline-flex flex-col gap-1 w-full py-2">
                                                                    <input
                                                                        type="text"
                                                                        name={`modules[${index}].title`}
                                                                        value={
                                                                            formik.values.modules[index]?.unsave
                                                                                ? formik.values.modules[index]?.tempTitle
                                                                                : formik.values.modules[index]?.title || ""
                                                                        }
                                                                        onChange={(e) => handleModuleTitleChange(index, e.target.value)}
                                                                        maxLength={50}
                                                                        className="font-text border border-divider rounded-md p-2 bg-gray-100 focus-within:outline-none"
                                                                    />
                                                                    <label htmlFor={`modules[${index}].title`} className="font-text text-xs flex flex-row justify-between">
                                                                        <p>Content Name <span className="text-red-500">*</span></p>
                                                                    </label>
                                                                </div>

                                                                <div className="inline-flex flex-col gap-1 w-full py-2">
                                                                    <div className="grid grid-cols-1">
                                                                        <select className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                            name={`modules[${index}].type`}
                                                                            value={formik.values.modules[index].type}
                                                                            onChange={(e) => handleModuleTypeChange(index, e.target.value)}
                                                                            onBlur={formik.handleBlur}
                                                                        >
                                                                            <option value="" disabled hidden>Select Content Type</option>
                                                                            <option value="module">Lesson Canvas</option>
                                                                            <option value="assessment">Assessment Canvas</option>
                                                                            <option value="file">File Attachment</option>
                                                                            <option value="video">Video Attachment</option>
                                                                        </select>

                                                                        <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
                                                                        </svg>
                                                                    </div>
                                                                    <label htmlFor={`modules[${index}].type`} className="font-text text-xs flex">
                                                                        Content Type <span className="text-red-500">*</span>
                                                                    </label>

                                                                    {formik.touched.modules?.[index]?.type && formik.errors.modules?.[index]?.type && (
                                                                        <div className="text-red-500 text-xs font-text">{formik.errors.modules[index].type}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ):(
                                                        <Draggable key={item.id} draggableId={`${item.id}`} index={index}   isDragDisabled={ !((smePermissions.includes("EditItems") || user?.user_infos?.id === course?.user_info_id) && course?.CourseStatus !== 'draft')}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps}
                                                                className="w-full flex flex-row justify-between items-center gap-1 h-full"
                                                                style={provided.draggableProps.style}>
                                                                <div className="group w-full flex flex-row items-center py-2 px-4 border border-primary rounded-md shadow-md justify-between text-primary bg-white">
                                                                <div className="flex flex-row items-center gap-x-4 w-full">
                                                                    <FontAwesomeIcon icon={ item.type === "module" ? faFilePen : item.type === "assessment" ? faList : item.type === "file" ? faFile : item.type === "video" ? faVideo : faFile }
                                                                        className="text-xl w-6 h-6"
                                                                        fixedWidth
                                                                    />
                                                                        <div>
                                                                            <p className="font-header">{item.title}</p>
                                                                            <p className="font-text text-xs text-unactive">
                                                                                {item.type === "module" ? "Lesson Canvas" : item.type === "assessment" ? "Assessment Canvas" : item.type === "file" ? "File Attachment" : item.type === "video" ? "Video" : null}
                                                                            </p>

                                                                            {/* Metadata for Lessson */}
                                                                            {
                                                                                item.type === "module" &&
                                                                                <div className="mt-1 flex flex-col gap-y-1 text-xs text-gray-500">
                                                                                    {
                                                                                        item.LessonDuration &&
                                                                                        <p className="flex items-center gap-x-1 text-gray-600">
                                                                                            <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                            <span>Suggested Duration: {item.LessonDuration} min</span>
                                                                                        </p>
                                                                                    }
                                                                                    {
                                                                                        item.content &&
                                                                                        <p className="flex items-start gap-x-1">
                                                                                            <FontAwesomeIcon icon={faFileLines} className="w-3 h-3 text-gray-400 mt-0.5" fixedWidth />
                                                                                            <span>
                                                                                                Lesson Content: "{item.contentHTML.replace(/<[^>]+>/g, '').slice(0, 100)}
                                                                                                {item.content.replace(/<[^>]+>/g, '').length > 100 ? '...' : ''}"
                                                                                            </span>
                                                                                        </p>
                                                                                    }
                                                                                    {
                                                                                        !item.content &&
                                                                                        <p className="flex items-start gap-x-1 text-gray-500">
                                                                                            <FontAwesomeIcon icon={faFileLines} className="w-3 h-3 text-gray-400 mt-0.5" fixedWidth />
                                                                                            <span>No lesson content available</span>
                                                                                        </p>
                                                                                    }
                                                                                </div>
                                                                            }

                                                                            {/* Metadata for Assessment */}
                                                                            {item.type === "assessment" && (
                                                                                <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500">
                                                                                    {
                                                                                        item.AssessmentDuration &&
                                                                                        <p className="flex items-center gap-x-1 text-gray-600">
                                                                                            <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                            <span>Suggested Duration: {item.AssessmentDuration} min</span>
                                                                                        </p>
                                                                                    }
                                                                                    {
                                                                                        item.blockCounts && Object.values(item.blockCounts).some(count => count > 0) &&
                                                                                        <>
                                                                                            <p className="font-medium text-gray-600">Assessment Content:</p>
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                            {Object.entries(item.blockCounts).map(([key, count]) => (
                                                                                                <span
                                                                                                key={key}
                                                                                                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                                                                                                >
                                                                                                <FontAwesomeIcon
                                                                                                    icon={ key === "Multiple Choices"? faList : key === "True or False" ? faCheckCircle : key === "Identification" ? faSignature : key === "Fill in The Blanks" ? faFilePen : key === "Likert Scale" ? faCircleCheck : faCircleInfo }
                                                                                                    className="w-3 h-3 text-gray-500"
                                                                                                    fixedWidth
                                                                                                />
                                                                                                <span>{key}: {count}</span>
                                                                                                </span>
                                                                                            ))}
                                                                                            </div>
                                                                                        </>
                                                                                    }
                                                                                    {
                                                                                        (!item.blockCounts || Object.values(item.blockCounts).every(count => count === 0)) &&
                                                                                        <p className="flex items-start gap-x-1 text-gray-500">
                                                                                            <FontAwesomeIcon icon={faFileLines} className="w-3 h-3 text-gray-400 mt-0.5" fixedWidth />
                                                                                            <span>No assessment content available</span>
                                                                                        </p>
                                                                                    }
                                                                                </div>
                                                                            )}

                                                                            {/* Metadata for File & Video Attachments */}
                                                                            {(item.type === "file" || item.type === "video") && (
                                                                                <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500">
                                                                                    {
                                                                                        item.type === "file" &&
                                                                                        <>
                                                                                            <p className="flex items-center gap-x-1">
                                                                                                <FontAwesomeIcon icon={faFileLines} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                <span>Attachment Type: {item.attachmentType === "link" ? "Link"  : item.attachmentType === "upload" ? "Upload" : "Not Set"}</span>
                                                                                            </p>
                                                                                            <p className="flex items-center gap-x-1">
                                                                                                <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                <span>Suggested Duration: {item.AttachmentDuration ? `${item.AttachmentDuration} min` : "Not set"}</span>
                                                                                            </p>
                                                                                            <p className="flex items-center gap-x-1 break-all">
                                                                                                <FontAwesomeIcon icon={faLink} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                {
                                                                                                    item.filePath ?
                                                                                                    <a href={item.filePath} target="_blank" className="text-blue-600 underline">
                                                                                                        {item.filePath.slice(0, 50)}
                                                                                                        {item.filePath.length > 50 ? "..." : ""}
                                                                                                    </a>
                                                                                                :
                                                                                                    <span className="text-gray-400 italic">No link available</span>
                                                                                                }
                                                                                            </p>
                                                                                        </>
                                                                                    }

                                                                                    {
                                                                                        item.type === "video" &&
                                                                                        <>
                                                                                            <p className="flex items-center gap-x-1">
                                                                                                <FontAwesomeIcon icon={faVideo} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                <span>Video Source: {item.attachmentType === "link" ? "Link"  : item.attachmentType === "upload" ? "Upload" : "Not Set"}</span>
                                                                                            </p>
                                                                                            <p className="flex items-center gap-x-1">
                                                                                                <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                <span>Suggested Duration: {item.AttachmentDuration ? `${item.AttachmentDuration} min` : "Not set"}</span>
                                                                                            </p>
                                                                                            <p className="flex items-center gap-x-1 break-all">
                                                                                                <FontAwesomeIcon icon={faLink} className="w-3 h-3 text-gray-400" fixedWidth />
                                                                                                {   
                                                                                                    item.videoPath ?
                                                                                                    <a href={item.videoPath} target="_blank" className="text-blue-600 underline">
                                                                                                        {item.videoPath.slice(0, 50)}
                                                                                                        {item.videoPath.length > 50 ? "..." : ""}
                                                                                                    </a>
                                                                                                :
                                                                                                    <span className="text-gray-400 italic">No link available</span>
                                                                                                }
                                                                                            </p>

                                                                                            <p className="text-gray-500">
                                                                                                Description: "{item.AttachmentDescription ? item.AttachmentDescription : 'No description available'}"
                                                                                            </p>
                                                                                        </>
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-row gap-1">
                                                                        {(  
                                                                        (smePermissions.includes('EditItems') || user?.user_infos?.id === course?.user_info_id) &&
                                                                        (course?.CourseStatus === 'for_approval' || (
                                                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                                                        !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                                                            <div className="w-8 h-8 border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md text-primary hover:bg-primaryhover hover:text-white transition-all ease-in-out cursor-pointer hover:border-primaryhover"
                                                                                onClick={() => {
                                                                                    if (item.type === "module") {
                                                                                        navigate(`/SubjectMatterExpert/lessonCanvas/${item.id}`);
                                                                                    } else if (item.type === "assessment") {
                                                                                        navigate(`/SubjectMatterExpert/assessmentCanvas/${item.id}`);
                                                                                        setAssessment(item);
                                                                                    } else if (item.type === "file") {
                                                                                        setSelectedAttachmentId(item.id);
                                                                                        setFileAttachtmentModalOpen(true);
                                                                                    } else if (item.type === "video") {
                                                                                        setSelectedAttachmentId(item.id);
                                                                                        setVideoAttachtmentModalOpen(true);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faPencil} className="text-sm" />
                                                                            </div>
                                                                        )}
                                                                        {( 
                                                                        (smePermissions.includes('DeleteItems') || user?.user_infos?.id === course?.user_info_id) &&
                                                                        (course?.CourseStatus === 'for_approval' || (
                                                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                                                        !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                                                            <div
                                                                                className="w-8 h-8 border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md text-primary hover:bg-primaryhover hover:text-white transition-all ease-in-out cursor-pointer hover:border-primaryhover"
                                                                                onClick={() => setRemove({ open: true, module: item })}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {( 
                                                                (smePermissions.includes('EditItems') || user?.user_infos?.id === course?.user_info_id) &&
                                                                (course?.CourseStatus === 'for_approval' || (
                                                                ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                                                !course?.course_review?.some(r => r.approval_status === 'approved')))) && (
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="border border-primary self-stretch flex items-center justify-center p-2 rounded-md shadow-md hover:bg-primaryhover hover:text-white transition-all ease-in-out cursor-pointer text-primary bg-white"
                                                                    >
                                                                        <FontAwesomeIcon icon={faGripVertical} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        </Draggable>
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </div>
                                            </ScrollArea>
                                        )}
                                        </Droppable>
                                    </DragDropContext>
                                }
                            </div>
                        </form>
                    :tab === 'certificate' ?
                        <div className="grid grid-cols-4 grid-rows-[min-content_min-content_1fr] gap-4 w-full h-full ">
                            <div className="flex flex-row justify-between col-span-4 items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-x-2 text-primary text-2xl">
                                    <FontAwesomeIcon icon={faCertificate} />
                                    <p className="font-header text-primary">Certificate Customization</p>
                                    </div>
                                    <p className="text-xs font-text">Input parameters to customize course certifications</p>
                                </div>
                                {( 
                                (smePermissions.includes('AddSignatures') || user?.user_infos?.id === course?.user_info_id) &&
                                (course?.CourseStatus === 'for_approval' || (
                                ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                    <div
                                        className={`gap-4 py-2 px-4 text-lg bg-primary text-white rounded-md shadow-md flex items-center justify-center transition-all ease-in-out cursor-pointer
                                        ${loadingCertificate ? "opacity-50 pointer-events-none" : "hover:bg-primaryhover hover:text-white"}`}
                                        onClick={() => {
                                        if (loadingCertificate) return;
                                        setShowCertificateInputModal(true);
                                        }}
                                    >
                                        {loadingCertificate ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        ) : (
                                        
                                            <>
                                                <p className="font-header">Add Signature</p>
                                                <FontAwesomeIcon icon={faSignature} />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-4 flex flex-col gap-y-2 border border-divider rounded-md w-full bg-white h-[calc(100vh-11.5rem)] justify-center items-center relative">
                                {loadingCertificate && (
                                    <div
                                        className="absolute top-0 left-0 w-full h-full bg-gray-200 animate-pulse rounded-md"
                                        style={{ zIndex: 10 }}
                                    />
                                )}

                                {certificateUrl && (
                                    <iframe
                                        src={certificateUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none" }}
                                        title="Certificate PDF"
                                        onLoad={() => setLoadingCertificate(false)}
                                    />
                                )}
                            </div>
                        </div>
                    :tab === 'collaboration' ?
                        <div className="grid grid-cols-4 grid-rows-[min-content_min-content_1fr] gap-4 w-full h-full ">
                            <div className="flex flex-row justify-between col-span-4 items-center">
                                <div className="flex flex-col gap-1 col-span-4">
                                    <div className="col-span-4 flex flex-row items-center gap-x-2 text-primary text-2xl">
                                        <FontAwesomeIcon icon={faUsers}/>
                                        <p className="font-header text-primary">Collaborations</p>
                                    </div>
                                    <p className="text-xs font-text">Manage different other subject matter expert to help on create your course</p>
                                </div>
                                    {( 
                                    (smePermissions.includes('PermissionControl') || user?.user_infos?.id === course?.user_info_id) &&
                                    (course?.CourseStatus === 'for_approval' || (
                                    ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                    !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                        <div
                                            className="gap-4 py-2 px-4 text-lg bg-primary text-white rounded-md shadow-md flex items-center justify-center hover:bg-primaryhover hover:text-white transition-all ease-in-out cursor-pointer"
                                            onClick={() => setOpenInvite(true)}
                                        >
                                            <p className="font-header">Invite</p>
                                            <FontAwesomeIcon icon={faUserPlus} />
                                        </div>
                                    )}
                            </div>

                            <ScrollArea className="flex flex-col gap-y-2 row-span-2 col-span-2 h-[calc(100vh-11.8rem)] overflow-y-auto">
                                <p className="font-text text-xs">Course Creator</p>
                                <div className="mb-4">
                                    {course?.user_info ? (
                                    (() => {
                                        const creator = course.user_info;

                                        return (
                                        <div
                                            className="w-full flex flex-row items-center border px-4 py-2 gap-2 rounded-md shadow-md bg-yellow-50 border-yellow-300"
                                            key={creator.id}
                                        >
                                            <img
                                            src={
                                                creator.profile_image ||
                                                "https://ui-avatars.com/api/?name=User&color=ffffff&background=ffbb00&bold=true&size=40"
                                            }
                                            alt={`${creator.first_name} ${creator.last_name}`}
                                            className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{creator.first_name} {creator.last_name}</p>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium border border-yellow-400">
                                                Creator
                                                </span>
                                            </div>
                                            <p className="font-text text-xs text-unactive">{creator.employeeID}</p>
                                            </div>
                                        </div>
                                        );
                                    })()
                                    ) : (
                                    <p className="text-sm text-gray-500">No creator info</p>
                                    )}
                                </div>

                                <p className="font-text text-xs">People with access</p>
                                <div className="flex flex-col gap-y-2">
                                    {loadingCollaboration ? (
                                    Array.from({ length: 10 }).map((_, index) => (
                                        <div
                                        key={index}
                                        className="w-full flex flex-row items-center border border-gray-200 px-4 py-2 gap-2 rounded-md shadow-sm animate-pulse bg-white"
                                        >
                                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                        <div className="flex flex-col space-y-1 w-full">
                                            <div className="w-1/3 h-3 bg-gray-300 rounded"></div>
                                            <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
                                        </div>
                                        </div>
                                    ))
                                    ) : invitedUsers.length === 0 ? (
                                    <div className="w-full flex flex-row items-center border border-gray-200 px-4 py-2 gap-2 rounded-md shadow-sm animate-pulse bg-white">
                                        <p className="text-sm text-gray-500">No invited users yet</p>
                                    </div>
                                    ) : (
                                    invitedUsers
                                        .filter(record => record.user?.id !== course.user_info.id) // tanggalin mo si kreator
                                        .map((record) => {
                                        const invitedUser = record.user;
                                        if (!invitedUser) return null;

                                        const isSelected = selectedUser?.id === invitedUser.id;

                                        return (
                                            <div
                                            className={`w-full flex flex-row items-center border px-4 py-2 gap-2 rounded-md shadow-md cursor-pointer ${
                                                isSelected ? "bg-blue-200 border-blue-700" : "border-primary"
                                            }`}
                                            key={invitedUser.id}
                                            onClick={() => handleUserClick(invitedUser)}
                                            >
                                            <img
                                                src={
                                                invitedUser.profile_image ||
                                                "https://ui-avatars.com/api/?name=User&color=ffffff&background=03045e&bold=true&size=40"
                                                }
                                                alt={`${invitedUser.first_name} ${invitedUser.last_name}`}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />

                                            <div className="flex-1">
                                                <p>
                                                {invitedUser.first_name} {invitedUser.last_name}
                                                </p>
                                                <p className="font-text text-xs text-unactive">{invitedUser.employeeID}</p>
                                            </div>

                                            {isSelected && ( 
                                            (smePermissions.includes('PermissionControl') || user?.user_infos?.id === course?.user_info_id) &&
                                            (course?.CourseStatus === 'for_approval' || (
                                            ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                            !course?.course_review?.some(r => r.approval_status === 'approved')))) && (

                                                <button className="border border-blue-600 bg-secondary text-white hover:bg-primaryhover hover:text-white p-2 rounded-md shadow-md transition-all ease-in-out"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowConfirmRevokePermissionModal(true);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                                                </button>
                                            )}
                                            </div>
                                        );
                                        })
                                    )}
                                </div>
                            </ScrollArea>

                            {!selectedUser ? (
                            <div className="col-span-2 row-span-2 flex flex-col">
                                <p className="font-text text-xs mb-2">Permissions</p>
                                <div className="border border-primary rounded-md bg-white shadow-md h-[calc(100vh-11.8rem)] flex items-center justify-center">
                                <div className="flex flex-col items-center text-center px-6 py-8">
                                    <FontAwesomeIcon icon={faUserSlash} className="text-4xl text-gray-300 mb-4" />
                                    <p className="text-sm font-header text-primary mb-1">No User Selected</p>
                                    <p className="text-xs text-gray-500 max-w-xs">
                                    Please select a user to view and assign permissions.
                                    </p>
                                </div>
                                </div>
                            </div>
                            ) : (
                                <div className="col-span-2 gap-y-2 row-span-2 flex flex-col">
                                    <p className="font-text text-xs">Permissions</p>
                                    <ScrollArea className="border border-divider rounded-md bg-white shadow-md h-[calc(100vh-16rem)]">
                                        <div className="flex flex-col gap-y-2 p-4">
                                            {loadingCollaboration ? (
                                                Array.from({ length: 3 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="w-full border border-gray-200 rounded-md shadow-sm p-4 space-y-3 animate-pulse"
                                                >
                                                    <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
                                                    <div className="flex flex-row justify-between items-center">
                                                        <div className="w-2/5 h-3 bg-gray-200 rounded"></div>
                                                        <div className="w-10 h-5 bg-gray-300 rounded-full"></div>
                                                    </div>
                                                    <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
                                                </div>
                                                ))
                                            ) : (
                                            <>
                                                <div className="w-full flex flex-col gap-y-2">
                                                    <p className="text-xs">Course Creation Management</p>
                                                    <div className="w-full border border-primary rounded-md shadow-md flex flex-col p-4 gap-4">
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Export Change Report </p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("ExportCourse")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("ExportCourse", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Enables the SME to extract and download all course reports in PDF format.</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Authorize Submission</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("CompleteCourse")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("CompleteCourse", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Grants the SME the ability to submit the course for approval on behalf of the owner.</p>
                                                        </div>
                                                        {/* <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Delete Course</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("DeleteCourse")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("DeleteCourse", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Grants the SME the ability to schedule a course for permanent deletion.</p>
                                                        </div> */}
                                                        {/* <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Archive Course</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("ArchiveCourse")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("ArchiveCourse", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Grants the SME the ability to archive a course, removing it from active listings without permanent deletion.</p>
                                                        </div> */}
                                                    </div>

                                                    <p className="text-xs">Content Management</p>
                                                    <div className="w-full border border-primary rounded-md shadow-md flex flex-col p-4 gap-4">
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Edit Course Information and Details</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("EditCourseDetails")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("EditCourseDetails", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Permission to update the general course information, such as title, description, or objectives, and details such as course name.</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Create Course Item</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("CreateItems")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("CreateItems", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Grants the SME the ability to add new items, such as lessons or assessments.</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary"> Edit Course Item</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("EditItems")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("EditItems", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Allows opening and modifying existing lessons, modules, or assessments.</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center  mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Delete Course Items</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("DeleteItems")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("DeleteItems", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs"> Ability to remove specific lessons, modules, or assessments.</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-row justify-between items-center  mb-1">
                                                                <div>
                                                                    <p className="text-header font-header text-sm text-primary">Add Certificate Signatures</p>
                                                                </div>
                                                                <Switch
                                                                    id="access1-switch"
                                                                    checked={selectedRolePermissions.includes("AddSignatures")}
                                                                    onCheckedChange={(checked) => handlePermissionToggle("AddSignatures", checked)}
                                                                />
                                                            </div>
                                                            <p className="text-xs">Grants the ability to add signatures to certificates issued by the platform.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full flex flex-col gap-y-2">
                                                    <p className="text-xs">Collaboration Management</p>
                                                    <div className="w-full border border-primary rounded-md shadow-md flex flex-col p-4 gap-4">
                                                    <div>
                                                        <div className="flex flex-row justify-between items-center mb-1">
                                                            <div>
                                                                <p className="text-header font-header text-sm text-primary">Permission Control</p>
                                                            </div>
                                                            <Switch
                                                                id="access1-switch"
                                                                checked={selectedRolePermissions.includes("PermissionControl")}
                                                                onCheckedChange={(checked) => handlePermissionToggle("PermissionControl", checked)}
                                                            />
                                                        </div>
                                                        <p className="text-xs">Allows the SME to manage or assign related permissions for other SMEs.</p>
                                                    </div>
                                                </div>

                                            </div>
                                            </>
                                            )}
                                        </div>
                                    </ScrollArea>
                                        {(
                                        (smePermissions.includes('PermissionControl') || user?.user_infos?.id === course?.user_info_id) &&
                                        (course?.CourseStatus === 'for_approval' || (
                                        ['created', 'reviewed'].includes(course?.CourseStatus) && 
                                        !course?.course_review?.some(r => r.approval_status === 'approved')))) && (
                                            <div
                                                className="gap-4 py-2 px-4 text-lg bg-primary text-white rounded-md shadow-md flex items-center justify-center hover:bg-primaryhover hover:text-white transition-all ease-in-out cursor-pointer mt-2"
                                                onClick={() => setShowConfirmAddPermissionModal(true)}
                                            >
                                                <p className="font-header">Update Permissions</p>
                                                <FontAwesomeIcon icon={faKey} />
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    :tab === "trash" ? 
                        <div className="flex flex-col gap-4 w-full h-full">
                            {/* Header */}
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-x-2 text-primary text-2xl">
                                    <FontAwesomeIcon icon={faFolder} />
                                    <p className="font-header text-primary">Trash Bin</p>
                                    </div>
                                    <p className="text-xs font-text">
                                    Restore deleted course items organized by type.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex flex-row gap-2 border-b border-divider pb-2">
                            {TRASH_CATEGORIES.map((cat) => (
                                <button
                                key={cat.key}
                                onClick={() => setActiveTab(cat.key)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === cat.key
                                    ? "bg-primary text-white shadow"
                                    : "bg-white text-primary hover:bg-primaryhover hover:text-white border border-primary"
                                }`}
                                >
                                <FontAwesomeIcon icon={cat.icon} className="mr-2" />
                                {cat.label} ({(deletedItems[cat.key] || []).length})
                                </button>
                            ))}
                            </div>

                            <ScrollArea className="border border-divider rounded-md bg-white shadow-md h-[calc(95vh-11.8rem)]">
                                <div className="p-4">
                                    {(deletedItems[activeTab] || []).length === 0 ? 
                                    <div className="flex flex-col items-center justify-center h-full text-unactive text-center gap-2">
                                        <div className="bg-primarybg w-20 h-20 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faXmark} className="text-3xl text-primary" />
                                        </div>
                                        <p className="font-text text-sm">
                                        No deleted {activeTab.toLowerCase()} found.
                                        </p>
                                    </div>
                                    :
                                    <div className="flex flex-col gap-4">
                                        {deletedItems[activeTab].map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-row justify-between items-center border border-primary rounded-md p-4 bg-white shadow-sm"
                                        >
                                            <div className="flex flex-col">
                                                <p className="font-header text-primary">{item.title}</p>
                                                <p className="text-xs text-unactive font-text">
                                                    Deleted on{item.deletedAt}
                                                </p>
                                            </div>
                                            <button
                                            className="w-10 h-10 text-lg bg-primary border-2 text-white border-primary rounded-md shadow-md flex items-center justify-center transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover"
                                            onClick={() => {
                                                setItemToRestore(item);
                                                setShowRestoreContentConfirm(true);
                                            }}
                                            >
                                            <FontAwesomeIcon icon={faTrashRestore} />
                                            </button>
                                        </div>
                                        ))}
                                    </div>
                                    }
                                </div>
                            </ScrollArea>
                        </div>
                    :tab === "history" ? 
                        <div className="flex flex-col gap-4 w-full h-full">
                            {/* Header */}
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-x-2 text-primary text-2xl">
                                    <FontAwesomeIcon icon={faHistory} />
                                    <p className="font-header text-primary">Version History</p>
                                    </div>
                                    <p className="text-xs font-text">
                                    View the version history of your entire course.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs */}

                            <ScrollArea className="border border-divider rounded-md bg-white shadow-md h-[calc(95vh-7.5rem)]">
                                <div className="p-4 h-full">

                                    {!selectedVersion ? (
                                    <div className="flex flex-col items-center justify-center h-full text-unactive text-center gap-2">
                                        <div className="bg-primarybg w-20 h-20 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faXmark} className="text-3xl text-primary" />
                                        </div>
                                        <p className="font-text text-sm">
                                        Please select a version first.
                                        </p>
                                    </div>
                                    ) : (
                                    <CourseVersionHistoryTab version={selectedVersion} />
                                    )}

                                </div>
                            </ScrollArea>
                        </div>
                    :null
                }
            </div>
        </div>

        <EditCourseNameAndInformation open={editCourseNameAndInformationModalOpen} close={()=>{setEditCourseNameAndInformationModalOpen(false)}} course={course || {}}
            fetchCourse={fetchCourse}
        />
        <CourseCreationProgress open={Openprogress} close={()=>{setOpenprogress(false)}} course={course} progress={DevelopmentPercentage(course)} module={modules}/>
        <InviteCollaborator open={openInvite} close={()=>{setOpenInvite(false)}} courseId={courseId}
            onSubmitRefresh={fetchInvitedUsers}
        />
        <AssignViewer 
            open={assignViewer} 
            close={()=>{setAssignViewer(false)}}
            course={course}
            onAssignSubmitted={fetchCourse}
         />
        <CertificateInputModal 
            open={showCertificateInputModal}
            onClose={() => {setShowCertificateInputModal(false); loadCertificate()}}
            certificateId={course?.certificates?.[0]?.id}
            onSubmitSuccess={() => {
                loadCertificate();
            }}
            onSignatureUpdate={fetchCourse}
            courseId={courseId}
        />

        {/* Attachment Modal */}
        <VideoAttachmentModal open={videoAttachtmentModalOpen} close={()=>{setVideoAttachtmentModalOpen(false)}}
            attachmentId={selectedAttachmentId}
            onSubmit={fetchModuleItems}
        />
        <FileAttachmentModal open={fileAttachtmentModalOpen} close={()=>{setFileAttachtmentModalOpen(false)}}
            attachmentId={selectedAttachmentId}
            onSubmit={fetchModuleItems}
        />

        {/* Warning Modal */}
        <WarningModal open={remove.open} proceed={()=>{handleDelete(remove.module)}} cancel={()=>{setRemove(prev => ({...prev, open: false}))}} header="Delete Module?" desc={`Are you sure you want to delete module item`} deleting={remove.removing}/>
        
        {/* Confirmation Modal */}
        <ConfirmationModal
            open={showDetailConfirm.overview}
            cancel={() => setShowDetailConfirm(prev => ({ ...prev, overview: false }))}
            header="Save Overview?"
            desc="Are you sure you want to save changes to the overview section?"
            confirming={saving.overview}
            confirm={() => {
                setShowDetailConfirm(prev => ({ ...prev, overview: false }));
                OverviewForm.handleSubmit();
            }}
        />
        <ConfirmationModal
            open={showDetailConfirm.objective}
            cancel={() => setShowDetailConfirm(prev => ({ ...prev, objective: false }))}
            header="Save Objective?"
            desc="Are you sure you want to save changes to the objective section?"
            confirming={saving.objective}
            confirm={() => {
                setShowDetailConfirm(prev => ({ ...prev, objective: false }));
                ObjectiveForm.handleSubmit();
            }}
        />
        <ConfirmationModal
            open={showUnsavedModal}
            cancel={cancelTabChange}
            confirm={confirmTabChange}
            header="Unsaved Changes"
            desc={getUnsavedMessage()}
        />
        <ConfirmationModal
            open={showRestoreContentConfirm}
            cancel={() => setShowRestoreContentConfirm(false)}
            header="Restore Content?"
            desc="Are you sure you want to restore this trashed content?"
            confirm={() => {
                setShowRestoreContentConfirm(false);
                if (itemToRestore) {
                handleRestoreItem(itemToRestore);
                setItemToRestore(null);
                }
            }}
        />

        {/* Success Modal */}
        <SuccessModal
            open={updateThumbnailSuccessModal}
            close={() => setUpdateThumbnailSuccessModal(false)}
            header="Success!"
            desc="Course thumbnail updated successfully."
            confirmLabel="Close"
        />
        <SuccessModal
            open={updateDetailsSuccessModal}
            close={() => {setUpdateDetailsSuccessModal(false)}}
            header="Success!"
            desc="Course details updated successfully."
            confirmLabel="Close"
        />
        <SuccessModal 
            open={showSuccessDeleteModal} 
            close={() => {
                setShowSuccessDeleteModal(false);
                navigate(-1);
            }} 
            header="Course Deleted successfully!"
            desc="The course has been removed from your list."
            confirmLabel="Close"
        />
        <SuccessModal 
            open={showSuccessArchiveModal} 
            close={() => {
                setShowSuccessArchiveModal(false);
                navigate(-1);
            }} 
            header="Course Archived successfully!"
            desc="The course has been removed from your list."
            confirmLabel="Close"
        />

        {/* Remove Course Modal */}
        <ConfirmationModal 
            open={showDeleteCourseModal}
            cancel={() => setShowDeleteCourseModal(false)}
            confirm={handleDeleteCourse}
            header="Delete Course?"
            desc="This action cannot be undone. Please confirm."
        />
        <ConfirmationModal 
            open={showArchiveCourseModal}
            cancel={() => setShowArchiveCourseModal(false)}
            confirm={handleArchiveCourse}
            header="Archive Course?"
            desc="This action cannot be undone. Please confirm."
        />

        {/* Add Permission Modal */}
        <ConfirmationModal
            open={showConfirmAddPermissionModal}
            cancel={() => setShowConfirmAddPermissionModal(false)}
            confirm={handleAddPermissions}
            header="Confirm Add Permissions"
            desc="Are you sure you want to assign these permissions to the selected user?"
            confirming={isConfirmingPermission}
        />
        <SuccessModal
            open={showSuccessAddPermissionsModal}
            close={() => setShowSuccessAddPermissionsModal(false)}
            header="Permissions assigned successfully!"
            desc="The user's permission has been updated successfully."
            confirmLabel="Close"
        />

        {/* Revokje Permission Modal */}
        <ConfirmationModal
            open={showConfirmRevokePermissionModal}
            cancel={() => setShowConfirmRevokePermissionModal(false)}
            confirm={revokeCourseInvitation}
            header="Revoke Permissions?"
            desc="Are you sure you want to revoke the selected permissions for this user? This action cannot be undone."
            confirming={isConfirmingRevokePermission}
        />
        <SuccessModal
            open={showSuccessRevokePermissionsModal}
            close={() => setShowSuccessRevokePermissionsModal(false)}
            header="Permissions revoked successfully!"
            desc="The permissions have been removed from the user."
            confirmLabel="Close"
        />

        {/* Pub or Ass */}
        <PublishOrAssignModal
            open={showPublishOrAssignModal}
            close={() => setShowPublishOrAssignModal(false)}
            course={course}
            onPublishRequest={handlePublishRequest}
            onReapprovalSubmitted={fetchCourse}
        />

        <ConfirmationModal
            open={confirmPublishOpen}
            cancel={() => setShowConfirmPublish(false)}
            confirm={handlePublishCourse}
            confirming={publishing}
            header="Confirm Publish"
            desc="Are you sure you want to publish this course?"
        />
        <SuccessModal
            open={successOpen}
            close={() => setShowSuccessPublish(false)}
            header="Course Published"
            desc="The course has been successfully published and is now available to learners."
            confirmLabel="Close"
        />

        <ReassignViewer
            open={showReAssignModal}
            close={() => setShowReAssignModal(false)}
            course={course}
            onReassignSubmitted={fetchCourse}
        />


        <FileErrorModal
            open={fileErrorModalOpen}
            onClose={() => setFileErrorModalOpen(false)}
            header="Invalid File Type"
            desc="Please upload a valid image (JPEG, PNG, etc.)."
        />

        <CourseVersionHistoryModal
            isOpen={showCourseVersionHistoryModal}
            onClose={closeCourseVersionHistoryModal}
            change={selectedChange}
            version={selectedVersion}
        />

        <ConfirmationModal
            open={confirmRevokeOpen}
            cancel={() => setConfirmRevokeOpen(false)}
            confirm={handleRevokeCourse}
            confirming={revoking}
            header="Confirm Revoke"
            desc="Are you sure you want to revoke this course approval?"
        />

        <SuccessModal
            open={successRevokeOpen}
            close={() => setSuccessRevokeOpen(false)}
            header="Course Approval Revoked"
            desc="The course approval has been successfully revoked."
            confirmLabel="Close"
        />
        </>
    )
}

