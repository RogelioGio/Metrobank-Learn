import { faCheckSquare, faChevronLeft, faChevronRight, faFileCirclePlus, faMagnifyingGlass, faSpinner, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Helmet } from "react-helmet"
import AddAssignCourseAdmin from "../modalsandprops/AddAssignCourseAdmin";
import { useEffect, useState } from "react";
import AddCertificateModal from "../modalsandprops/AddCertificateModal";
import CourseDetailsModal from "../modalsandprops/CourseDetailsModal";
import { useCourse } from "../contexts/Course";
import axios from "axios";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { format, set } from "date-fns";
// import WarningModal from "../modalsandprops/AuthoringTool/WarningModals";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import WarningModal from "../modalsandprops/WarningModal";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useCertificate } from "../contexts/CertificateContext";


export default function LearnerCertficates() {
    const [openCourseDetails, setOpenCourseDetails] = useState(false);
    const {setCourse, course} = useCourse();
    const [certificates, setCertificates] = useState([])
    const [certifcate, setCertifcate] = useState({})
    const [isLoading, setIsLoading] = useState()
    const [certType, setCertType] = useState(false);
    const {user} = useStateContext()
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const {setCertificate} = useCertificate();

    const handleSelect = (id) => {
        setSelected((prev) => {
            const existed = prev.find((item) => item.id === id);
            if(existed){
                return prev.filter((item) => item.id !== id);
            }
            return [...prev, {id}];
        })
    }

    const fetchSearch = () => {
        setIsLoading(true);
        axiosClient.get(`/search-certificates`, {
            params: {
                q: search,
                perPage: pageState.perPage,
                page: pageState.currentPage,
                type: certType
            }
        }).then(({data})=>{
            console.log(data)
            setIsLoading(false)
            setCertificates(data.data);
            pageChangeState('totalUsers', data.total)
            pageChangeState('currentPage', data.currentPage)
            pageChangeState('lastPage', data.last_page)
        })
        .catch(({err})=>{console.log(err)})
    }

    const getCertificates = () => {
        setIsLoading(true);
        axiosClient.get(`/certificates/${user.user_infos.id}/${certType}`, {
            params: {
                perPage: pageState.perPage,
                page: pageState.currentPage
            }
        }) //false - internal, true - external
        .then(({data})=>{
            console.log(data)
            setCertificates(data.data);
            pageChangeState('totalUsers', data.total)
            pageChangeState('currentPage', data.currentPage)
            pageChangeState('lastPage', data.last_page)
        }).catch(({err})=>{
            console.log(err)
        }).finally(()=>{setIsLoading(false)});
    }

    const handleDelete = () => {
        if(deleting) return;
        setDeleting(true);

        const archivingCertificates = () =>
        axiosClient.post('/inputs/bulk',{
            data: selected,
            type: 'externalcertificate',
            action: 'archive'
        }).then ((res)=>{
            setSelected([])
            getCertificates()
            setOpenDelete(false)
            setDeleting(false)
            return res.data}
        )


        toast.promise(
            archivingCertificates(),
            {
                loading: 'Deleting selected certificates...',
                success: (message) => `Certifcate Deleted`,
                error: 'Failed to delete selected certificates.'
            });
    }


    //Pagenation States
    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 12,
        totalUsers: 0,
        lastPage:10,
        startNumber: 0,
        endNumber: 0,
        currentPerPage:0
    });

    const pageChangeState = (key, value) => {
        setPagination ((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    useEffect(() => {
        pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
        pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalUsers))
    },[pageState.currentPage, pageState.perPage, pageState.totalUsers])

    // useEffect(()=>{
    //     fetchUsers()
    // },[pageState.currentPage, pageState.perPage])

    const back = () => {
        if (isLoading) return;
        if (pageState.currentPage > 1){
            pageChangeState("currentPage", pageState.currentPage - 1)
            pageChangeState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (isLoading) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    ///Current page change
    const pageChange = (page) => {
        if(isLoading) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }
    ///Dynamic Pagging numbering

    // for(let p = 1; p <= 10; p++){
    //     Pages.push(p)
    // }
    const getPages = () => {
        const pages = [];

        for(let i = 1; i <=  Math.min(3, pageState.lastPage); i++){
            pages.push(i);
        }

        if(pageState.currentPage > 5 ){
            pages.push('...');
        }

        for(
            let i = Math.max(4, pageState.currentPage - 1);
            i <= Math.min(pageState.lastPage - 3, pageState.currentPage + 1);
            i++
        ){
            if(i > 3 && i < pageState.lastPage - 2){
                pages.push(i);
            }
        }

        if(pageState.currentPage < pageState.lastPage - 4){
            pages.push('...');
        }

        for(let i = Math.max(pageState.lastPage - 2, 4); i <= pageState.lastPage; i++){
            pages.push(i);
        }
        return pages;
    }
    const Pages = getPages();

   useEffect(() => {
    // Prevent multiple API calls while typing
    const handler = setTimeout(() => {
        if (search.trim() === "") {
            // Empty search → fetch normal certificate list
            getCertificates();
        } else {
            // Has search query → perform search
            fetchSearch();
        }
    }, 800); // debounce delay (500–1000ms feels best)

        return () => clearTimeout(handler);
    }, [
        search,
        pageState.currentPage,
        pageState.perPage,
        certType,
    ]);

    return (
        <>
        <div className='grid grid-cols-4 grid-rows-[6.25rem_min-content_1fr_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Certificates</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-3 row-span-1 pr-5 border-b border-divider'>
                <h1 className='text-primary text-4xl font-header'>Certificates</h1>
                <p className='font-text text-sm text-unactive' >Displays all earned and uploaded certificates, allowing easy tracking and management of your learning achievements.</p>
            </div>

            {/* Add Certificates */}
                <div className='col-start-4 row-start-1 flex flex-col justify-center pl-5 mr-5 border-divider border-b'>
                    {
                        user.user_infos.permissions?.some((permission)=> permission.id === 21) && certType === true?
                        <button className='inline-flex flex-row shadow-md items-center justify-center bg-primary font-header text-white text-base p-4 rounded-full hover:bg-primaryhover hover:scale-105 transition-all ease-in-out'
                                onClick={() => setOpen(true)}>
                            <FontAwesomeIcon icon={faFileCirclePlus} className='mr-2'/>
                            <p>Add Certificates</p>
                        </button> : null
                    }
                </div>

            {/* <div className="flex flex-row items-center gap-2 mr-2 ">
                {
                    user.user_infos.permissions?.some((permission)=> permission.id === 21) && certType === true ?
                    <div className={`w-full justify-between flex flex-row bg-primary text-white py-3 px-4 rounded-md font-header text-sm ${selected.length === 0 ? "opacity-50":"hover:cursor-pointer hover:bg-primaryhover "} transition-all ease-in-out`}
                        onClick={()=>{
                            if(selected.length === 0) return;
                            setIsBulkInactiveWarningOpen(true)}}>
                        <div className='flex flex-row gap-2 items-center'>
                            <FontAwesomeIcon icon={faTrash} className=''/>
                            <p>Bulk Deletion</p>
                        </div>
                        <div>
                            {selected.length === 0 ? null : <p>{selected.length}</p>}
                        </div>
                    </div> : null
                }
            </div> */}


            <div className="py-2 flex items-center mr-2">
                {
                    user.user_infos.permissions?.some((permission)=> permission.id === 21) ?
                    <Select value={certType} onValueChange={(value) => setCertType(value)} disabled={isLoading}>
                        <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-fit bg-white text-base`}>
                            <SelectValue placeholder="Certificate Type" />
                        </SelectTrigger>
                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            <SelectItem value={false}>Internal Certificates</SelectItem>
                            <SelectItem value={true}>External Certificates</SelectItem>
                        </SelectContent>
                    </Select> : null
                }
            </div>

            <div className="py-2 col-start-3 pr-5 col-span-2">
                <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name='search'
                            value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                        />
                    <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                        onClick={() => {if(search){
                            setSearch("")
                            getCertificates()
                        }}}>
                        <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                    </div>
                </div>
            </div>

            <div className="col-span-4 row-span-2 pr-5 overflow-y-auto grid grid-cols-4 grid-rows-3 gap-2 pb-2">
            {
                isLoading ?
                Array.from({length: 12}).map((_, index) => (
                    <div className="w-full h-full bg-white border border-divider animate-pulse rounded-md shadow-md relative" key={index}>

                    </div>
                ))
                : certificates.length === 0 ?
                <div className="col-span-4 row-span-3 flex flex-col justify-center items-center gap-4">
                    <div>
                        <div className="w-32 h-32 rounded-full bg-primarybg text-7xl items-center justify-center flex text-primary">
                            <FontAwesomeIcon icon={faXmark}/>
                        </div>
                    </div>
                    <div className="flex items-center flex-col">
                        <p className="font-header text-3xl text-primary">No certificate</p>
                        <p className="font-text text-xs text-unactive">Complete a course or add and external certificate.</p>
                    </div>
                </div>
                :
                certificates.map((certificate) =>{
                    if(!certType && certificate?.certificate?.course){
                        return (
                            <div className="w-full h-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md shadow-md relative hover:cursor-pointer  overflow-hidden"
                            onClick={()=>{
                                if(certType === false){
                                    setOpenCourseDetails(true)
                                    setCourse(certificate.certificate.course)}
                                }
                            }>
                            {
                                certificate?.certificate?.course?.image_path !== null ?
                                <div className={`w-full h-full bg-cover rounded-t-md`}
                                    style={{ backgroundImage: `url(${certificate?.certificate?.course.image_path})` }}>
                                </div>
                                : null
                            }
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/80 to-transparent rounded-md shadow-md p-4">
                                <div className="flex flex-col justify-end h-full">
                                    <h1 className='font-header text-sm text-white'>{certificate?.certificate?.course?.courseName}</h1>
                                    {
                                        certificate?.certificate?.course ?
                                            <p className='font-text text-xs text-white'>{certificate.certificate.course.courseID} - ({certificate.certificate.course.categories.category_name} - {certificate.certificate.course.career_level.name} Level)</p>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                        )
                    }
                    else {
                        return (
                        <div className="w-full h-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md shadow-md relative hover:cursor-pointer  overflow-hidden"
                                onClick={()=> {
                                    navigate(`/learner/learnerCertificatePreview/${certificate.id}`)
                                    setCertificate(certificate)
                                }}>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/80 to-transparent rounded-md shadow-md p-4 flex flex-col items-between">
                                <div className="w-full flex justify-end"
                                    onClick={(e)=>{e.stopPropagation(); handleSelect(certificate.id)}}>
                                    <div className="text-white text-2xl">
                                        <FontAwesomeIcon icon={ selected.find((item) => item.id === certificate.id) ? faCheckSquare: faSquare}/>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end h-full">
                                    <h1 className='font-header text-sm text-white'>{certificate.external_certificate_name}</h1>
                                    <p className='font-text text-xs text-white'>Added at: {certificate.created_at ? format(certificate.created_at, "MMMM dd yyyy") : null}</p>

                                </div>
                            </div>
                        </div>
                    )
                    }

                })
            }
            </div>

            <div className="col-span-4 flex flex-row items-center justify-between mr-4 py-3 border-t border-divider">
                {/* Total number of entries and only be shown */}
                <div className='flex flex-row gap-2 font-text text-sm text-unactive items-center justify-center relative'>
                    {
                        selected.length > 0 ? (
                            <div className="flex flex-row gap-2 items-center justify-center">
                                <div className='flex flex-row gap-2 items-center '>
                                    <div className="text-red-900 px-4 w-fit h-9 border border-red-900 bg-red-300 flex gap-2 items-center justify-center rounded-md hover:cursor-pointer hover:text-white hover:bg-red-700"
                                        onClick={()=>{setOpenDelete(true)}}>
                                        <FontAwesomeIcon icon={faTrash} />
                                        <p>Delete All</p>
                                    </div>
                                </div>
                                <p className='text-sm font-text text-primary'>
                                    {selected.length} selected entries
                                </p>
                                <p className='text-sm font-text text-unactive hover:cursor-pointer hover:underline' onClick={()=>{setSelected([])}}>
                                    Clear all
                                </p>
                            </div>
                        )
                        : certificates?.length === 0 ? (
                            <p className='text-sm font-text text-unactive'>
                                Showing <span className='font-header text-primary'>0 results</span>
                            </p>
                        )
                        : !isLoading ? (
                            <p className='text-sm font-text text-unactive'>
                                Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                            </p>
                        )
                        : (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className='animate-spin'/>
                                <p className='text-sm font-text text-unactive'>
                                    Retrieving users.....
                                </p>
                            </>
                        )
                    }

                </div>
                {/* Paganation */}
                <div>
                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                        {/* Previous */}
                        <a
                            onClick={back}
                            className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </a>

                        {/* Current Page & Dynamic Paging */}
                        {
                            isLoading ? (
                                <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                ...</a>
                            ) : (
                                Pages.map((page)=>(
                                    <a
                                        key={page}
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                            ${
                                                page === pageState.currentPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } transition-all ease-in-out`}
                                            onClick={() => pageChange(page)}>
                                        {page}</a>
                                ))
                            )
                        }
                        <a
                            onClick={next}
                            className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </a>
                    </nav>

                </div>
            </div>
        </div>
        <AddCertificateModal open={open} close={()=>{setOpen(false)}} fetchCerts={()=>{getCertificates()}}/>
        <CourseDetailsModal open={openCourseDetails} close={()=>{setOpenCourseDetails(false)}} course={course}/>
        <WarningModal open={openDelete} close={()=>setOpenDelete(false)} proceed={()=>{handleDelete(); setOpenDelete(false)}} selected={selected} title={"Deleting Certificates?"} desc={"Are you sure to delete selected certificates"}/>
        </>

    )
}
