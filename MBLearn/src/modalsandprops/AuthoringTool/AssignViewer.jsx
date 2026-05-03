import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { faCheck, faBuildingUser, faChevronDown, faClapperboard, faClipboard, faD, faFileArrowUp, faFilter, faSearch, faSpinner, faUser, faUserCircle, faUserGroup, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from "formik"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react"
import axiosClient from "MBLearn/src/axios-client"
import SuccessModal from "./SuccessModal"
import ConfirmationModal from "./ConfirmationModal"
import nameSearch from "MBLearn/src/components/lib/nameSearch"

const AssignViewer = ({ open, close, course, onAssignSubmitted }) => {
    const [assigningViewer, setAssigningViewer] = useState([])
    const [assignedCount, setAssignedCount] = useState(0);

    // console.log("aslkd;fjh", course);
    // console.log("check mo to", assigningViewer);
    const [assinging, setAssigning] = useState(false)
    const [viewers, setViewers] = useState([])
    const [loading, setLoading] = useState(false)

    const [successOpen, setSuccessOpen] = useState(false);
    const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);

    const formik = useFormik({
        initialValues: {},
    })

    const getViewer = () => {
        setLoading(true)
        axiosClient.get('/getViewers')
        .then(({data})=>{ 
            setViewers(data)
            setLoading(false)
        })
        .catch((error)=>{
            setLoading(false)   
            console.log(error);
        })
    }

    const handleAddViewer = (viewer) => {
        setAssigningViewer((prev) =>  {

            const exists = prev.some(
                (item) => item.user_info_id === viewer.id
            );

            if(exists){
                return prev.filter((item) => item.user_info_id !== viewer.id);
            }else{
                return [...prev, {user_info_id: viewer.id, course_id: course.id}];
            }
        })
    }

    // const setCourseDraft = () => {
    //     axiosClient.put(`/setCourseDraft/${courseId}`).
    //     then(({data}) => {console.log("Course Draft Set: ", data);})
    //     .catch((error) => {
    //         console.error("Error setting course draft: ", error);
    //     });
    // }
    const setCourseReviewers = () => {
        setAssigning(true)
        axiosClient.post(`/assignViewers/${course.id}`, assigningViewer) // note: ikabit para bukas
        .then(({data})=>{
            // console.log("Course Reviewers Set: ", data);
            setAssigning(false)
            setAssignedCount(assigningViewer.length);
            setSuccessOpen(true);
            if (onAssignSubmitted) {
                onAssignSubmitted();
            }
            close();
            setAssigningViewer([]);
        })
        .catch((error)=>{
            setAssigning(false)
            console.error("Error setting course reviewers: ", error);
        })
    }

    const [searchTerm, setSearchTerm] = useState('');
    const { results, loading: searchLoading, search } = nameSearch('/searchSMEAvailableViewers');

    useEffect(() => {
        setViewers(results);
    }, [results]);

    useEffect(() => {
        if (open) {
            search('');
        } else {
            setSearchTerm('');
        }
    }, [open]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        search(value);
    };

    useEffect(() => {
        // console.log("Assigning Viewer: ", assigningViewer);
    }, [assigningViewer])

    return (
        <>
            <Dialog open={open} onClose={()=>{}}>
                <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                                w-[80vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Submit Course Draft</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Assign designated approver to the completed course to be reviewed and be ready to be publish</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={()=>{
                                                    setTimeout(()=>{formik.resetForm();setFormCompleted([])},1000)
                                                    setTimeout(()=>{setAssigningViewer([])},1000)
                                                    close()
                                                }}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 grid-rows-[min-content,1fr,min-content] py-2 px-4">
                                        {/* <div className="col-start-1 col-span-1">
                                            <div className="border-2 border-primary bg-white text-primary px-4 py-2 rounded-md shadow-md font-header flex flex-row items-center justify-center gap-x-2 cursor-pointer transition-colors ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white">
                                                <FontAwesomeIcon icon={faFilter}/>
                                                <p>Filter</p>
                                            </div>
                                        </div> */}
                                        <div className="col-start-3 col-span-2">
                                            <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                                                <input className='focus:outline-none text-sm px-4 w-full rounded-md bg-white'
                                                    type="text"
                                                    placeholder='Search. . .'
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSearchTerm(value);
                                                        search(value);
                                                    }}
                                                />
                                                <div className='bg-primary py-2 px-4 text-white'>
                                                    <FontAwesomeIcon icon={faSearch}/>
                                                </div>
                                            </div>
                                        </div>
                                        <ScrollArea className="col-span-4 bg-gray-50 rounded-md h-[calc(100vh-25rem)] border border-divider">
                                            <div className="grid grid-cols-3 gap-4 p-4">
                                                {
                                                    searchLoading ?
                                                    Array.from({ length: 6 }).map((_, index) => (
                                                        <div className="w-full h-24 bg-white border animate-pulse rounded-md" key={index}></div>
                                                    ))
                                                    :
                                                    viewers.map((v,index)=>(
                                                    <div
  className={`relative w-full rounded-md shadow-md p-4 flex flex-row gap-4 items-center text-center
    transition-all ease-in-out duration-150 transform hover:cursor-pointer hover:scale-[1.01]
    border-2 ${assigningViewer.some((item) => item.user_info_id === v.id)
      ? "border-green-500 bg-green-50 ring-2 ring-green-300"
      : "border-divider bg-white"}`}
  key={index}
  onClick={() => handleAddViewer(v)}
>
  {/* ✅ Checkmark badge */}
  {assigningViewer.some((item) => item.user_info_id === v.id) && (
    <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
      <FontAwesomeIcon icon={faCheck} size="sm" />
    </div>
  )}

  <div className="min-h-10 min-w-10 h-10 w-10 overflow-hidden rounded-full bg-primary">
    <img src={v.profile_image} alt="" className="object-cover w-full h-full" />
  </div>
  <div className="flex flex-col w-full items-start">
    <p className="font-header text-primary">
      {v.first_name} {v.middle_name || ""} {v.last_name}
    </p>
    <div className="w-full justify-between font-text text-unactive text-xs flex flex-row items-center gap-2">
      <p>ID: {v.employeeID}</p>
      <p>{v.user_credentials.MBemail}</p>
    </div>
  </div>
</div>

                                                ))
                                                }
                                            </div>
                                        </ScrollArea>
                                        <div className="col-span-3 col-start-1 py-2 px-1">
                                            <div className="flex flex-col overflow-x-auto">
                                                <p className="font-text text-unactive text-xs">Course to be submitted to:</p>
                                                <p className="font-header text-xl text-primary">{assigningViewer.length || 0} Approver Assigned </p>
                                            </div>
                                        </div>
                                        <div className="col-span-1 col-start-4">
                                            <div
                                                className={`flex flex-row bg-primary text-white font-header justify-center items-center gap-4 text-lg py-3 rounded-md transition-colors ease-in-out ${
                                                    assigningViewer.length === 0 || assinging
                                                    ? "opacity-50 hover:cursor-not-allowed"
                                                    : "hover:cursor-pointer hover:bg-primaryhover"
                                                }`}
                                                onClick={() => {
                                                    if (assigningViewer.length === 0 || assinging) return;
                                                    setConfirmAssignOpen(true);
                                                }}
                                                >
                                                {assinging ? (
                                                    <>
                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                    <p>Assigning...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                    <FontAwesomeIcon icon={faUserPlus} />
                                                    <p>Assign Approver</p>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
            </Dialog>

        <SuccessModal
            open={successOpen}
            close={() => setSuccessOpen(false)} 
            header="Assignment Successful"
            desc={`Successfully assigned ${assignedCount} approver(s) to the course.`}
            confirmLabel="Close"
        />
        <ConfirmationModal
            open={confirmAssignOpen}
            cancel={() => setConfirmAssignOpen(false)}
            confirm={() => {
                setConfirmAssignOpen(false);
                setCourseReviewers();
            }}
            header="Confirm Assignment"
            desc={`Are you sure you want to assign ${assigningViewer.length} approver(s) to this course?`}
            confirming={assinging}
        />
        </>
    )
}
export default AssignViewer
