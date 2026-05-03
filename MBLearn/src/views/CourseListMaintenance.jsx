import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CourseListCard from '../modalsandprops/CourseListCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderPlus, faSearch,  faArrowUpWideShort, faArrowDownWideShort, faPlus, faMinus, faChevronUp, faChevronDown, faPenToSquare, faTrash, faChevronLeft, faChevronRight, faLaptopFile, faChalkboardTeacher, faCheck, faPen, faFloppyDisk, faArrowUpAZ, faSort, faArrowDownAZ, faArrowDownShortWide, faArrowDownZA, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { Menu, MenuButton, MenuItem, MenuItems, Disclosure, DisclosureButton, DisclosurePanel, Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react';
import AddCourseModal from '../modalsandprops/AddCourseModal';
import EditCourseModal from '../modalsandprops/EditCourseModal';
import DeleteCourseModal from '../modalsandprops/DeleteCourseModal';
import { useStateContext } from '../contexts/ContextProvider';
import CourseFilterProps from '../modalsandprops/CourseFilterProps';
import AssignCourseAdmin from '../modalsandprops/AssignCourseAdminModal';
import axiosClient from '../axios-client';
import CourseCardLoading from '../modalsandprops/CourseCardLoading';
import CourseLoading from "../assets/Course_Loading.svg"
import axios from 'axios';

export default function CourseListMaintenance() {
const {user} = useStateContext()

//Modal State mounting
const [isOpen, setIsOpen] = useState(false);
const [selectedCourse, setSelectedCourse] = useState(null)

//Modal Open and Close Function
const OpenDialog = (course) => {
    toggleModal('openCard', true)
    setSelectedCourse(course)
}
const CloseDialog = () => {
    toggleModal('openCard', false)
    setIsOpen(false)
}

const [modalState, setModalState] = useState({
        openCard: false,
        openAddCourse: false,
        openFilterEditor: false,// open edit mode for filter
        insertNewCategory: false,
        openEditCourse: false,
        openDeleteCourse: false,
        editFilter: false,
        assignCourseAdmin:false,
        CourseID: null,
        loading: true,
    });

const [sort, setSort] = useState({
    name : "none",
    created_at : "none",
});

//Modal State
const toggleModal = (key,value) => {
    setModalState((prev => ({
        ...prev,
        [key]:value,
    })));
}

//setOrder state
const toggleSort = (key,value) => {
    setSort((prev => ({
        ...prev,
        [key]:value,
    })));
}
const setOrder = (key) => {
    toggleModal('loading', true)
    const order = sort[key] === "none" ? "asc" : sort[key] === "asc" ? "desc" : "none";
    toggleSort(key, order);
    axiosClient.get(`/courses?${key}[${order}]=true`)
    .then(({ data }) => {
        setCourses(data.data);
        console.log(data);
        toggleModal('loading', false)
    })
}

// Action Button
const handleAction = (e,key,ID) => {
    e.stopPropagation();
    toggleModal(key, true);
    toggleModal("CourseID", ID);
}


// Checkbox Change state functions
const [isfilter, isSetfilter] = useState({});
const handleFilter = (sectionId, value) => {
    isSetfilter((prev) => ({
        ...prev,
        [sectionId]: prev[sectionId] === value ? undefined : value
    }));
}

//API Calls for the courses
const [courses, setCourses] = useState([])
const fetchCourses = () => {
    toggleModal('loading', true)
    axiosClient.get(`/select-user-added-course/${user.id}`)
    .then(({data}) => {
        setCourses(data.data)
        pageChangeState("totalCourses", data.total)
        pageChangeState("lastPage", data.lastPage)
        toggleModal('loading', false)
    }).catch((err) => {
            console.log(err);
        });
}


//Pagenation States
const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 3,
        totalCourses: 0,
        lastPage:1,
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
            pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalCourses))
        },[pageState.currentPage, pageState.perPage, pageState.totalCourses])

        useEffect(()=>{
            fetchCourses()
        },[pageState.currentPage, pageState.perPage])

        //Next and Previous
        const back = () => {
            if (modalState.loading) return;
            if (pageState.currentPage > 1){
                pageChangeState("currentPage", pageState.currentPage - 1)
                pageChangeState("startNumber", pageState.perPage - 4)
            }
        }
        const next = () => {
            if (modalState.loading) return;
            if (pageState.currentPage < pageState.lastPage){
                pageChangeState("currentPage", pageState.currentPage + 1)
            }
        }

        const Pages = [];
        for(let p = 1; p <= pageState.lastPage; p++){
            Pages.push(p)
        }

        const pageChange = (page) => {
            if(modalState.loading) return;
            if(page > 0 && page <= pageState.lastPage){
                pageChangeState("currentPage", page)
            }
        }

    return (
        <div className='grid  grid-cols-4 grid-rows-[6.25rem_min-content_1fr_min-content] h-full w-full overflow-hidden'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | My Courses Maintenance</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-3 row-span-1 pr-5 border-b ml-5 border-divider'>
            <h1 className='text-primary text-4xl font-header'>My Courses Maintenance</h1>
            <p className='font-text text-sm text-unactive'>Easily manage and add courses to streamline learning opportunities.</p>
            </div>

            {/* Add Button */}
            <div className='col-start-4 row-start-1 flex flex-col justify-center pl-5 mr-5 border-divider border-b'>
            <button className='inline-flex flex-row shadow-md items-center justify-center bg-primary font-header text-white text-base p-4 rounded-full hover:bg-primaryhover hover:scale-105 transition-all ease-in-out' onClick={()=>toggleModal('openAddCourse',true)}>
                <FontAwesomeIcon icon={faFolderPlus} className='mr-2'/>
                <p>Add Course</p>
            </button>
            </div>

            {/* Small Sorter */}
            <div className='row-start-2 col-start-1  col-span-2 inline-flex items-center px-5 py-3 h-fit gap-3'>
                {/* Sort by Name */}
                <div className={`flex flex-row items-center border-2 border-primary py-2 px-4 font-header bg-secondarybackground rounded-md text-primary gap-2 w-fit hover:bg-primary hover:text-white hover:scale-105 hover:cursor-pointer transition-all ease-in-out shadow-md ${sort.nameOrder === "asc" ? '!bg-primary !text-white' : sort.nameOrder === "desc" ? '!bg-primary !text-white': 'bg-secondarybackground' }`} onClick={() => setOrder("name")}>
                    <p>Course Name</p>
                    <FontAwesomeIcon icon={sort.name === "asc" ? faArrowUpAZ : sort.name === "desc" ? faArrowDownZA : faSort}/>
                </div>
                {/* Sort By Date-Added */}
                <div className={`flex flex-row items-center border-2 border-primary py-2 px-4 font-header bg-secondarybackground rounded-md text-primary gap-2 w-fit hover:bg-primary hover:text-white hover:scale-105 hover:cursor-pointer transition-all ease-in-out shadow-md ${sort.dateOrder === "asc" ? '!bg-primary !text-white' : sort.dateOrder === "desc" ? '!bg-primary !text-white': 'bg-secondarybackground' }`} onClick={() => setOrder("created_at")}>
                    <p>Date-Added</p>
                    <FontAwesomeIcon icon={sort.created_at === "asc" ? faArrowUpWideShort : sort.created_at === "desc" ? faArrowDownShortWide : faSort}/>
                </div>
            </div>

            {/* Search bar */}
            <div className='inline-flex items-center col-start-3 row-start-2 pl-5 py-3 h-fit'>
                <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                    <div className='bg-primary py-2 px-4 text-white'>
                        <FontAwesomeIcon icon={faSearch}/>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className='row-start-2 col-start-4 inline-flex justify-between items-center flex-row mx-5'>
                {/* Filter Header */}
                    <div>
                        <h1 className='font-header text-2xl text-primary'>Course Filter</h1>
                        <p className='text-md font-text text-unactive text-sm'>Categorize courses</p>
                    </div>
                    <div>
                    {/* Course Button */}
                    {
                        user.user_infos.roles[0]?.role_name === "System Admin" ? (

                                !modalState.editFilter ?
                                <div className='relative group aspect-square w-10 rounded-full flex items-center justify-center bg-primarybg text-primary cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out' onClick={()=>toggleModal('editFilter',true)}>
                                    <FontAwesomeIcon icon={faPen}/>
                                    <p className='absolute w-auto top-12 z-10 bg-tertiary text-white p-2 rounded-md text-xs scale-0 font-text group-hover:scale-100'>Edit</p>
                                </div> :
                                <div className='relative group aspect-square w-10 rounded-full flex items-center justify-center bg-primarybg text-primary cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out' onClick={()=>toggleModal('editFilter',false)}>
                                    <FontAwesomeIcon icon={faFloppyDisk}/>
                                    <p className='absolute w-auto top-12 z-10 bg-tertiary text-white p-2 rounded-md text-xs scale-0 font-text group-hover:scale-100'>Save</p>
                                </div>
                        ):null
                    }
                    </div>
            </div>
            <div className='row-start-3 row-span-3 col-start-4 flex flex-col h-full'>
                <CourseFilterProps isEdit={modalState.editFilter}/>
            </div>

            {/* Sample Card for course display */}
            {
                modalState.loading ? (
                    <div className=" row-start-3 col-span-3 flex flex-col gap-4 items-center justify-center text-center h-full">
                                <img src={CourseLoading} alt="" className="w-80"/>
                                <p className="text-sm font-text text-primary">Hang tight! 🚀 Loading courses for — great things take a second!</p>
                            </div>
                ) : (
                    <CourseListCard courseList={courses} classname='row-start-3 row-span-1 col-start-1 col-span-3 w-full pl-5 py-2 flex flex-col gap-2' onclick={OpenDialog} action={handleAction}/>
                )
            }

            {/* Sample Footer Pagenataion */}
            <div className='row-start-4 row-span-1 col-start-1 col-span-3 border-t border-divider mx-5 py-3 flex flex-row items-center justify-between'>
                {/* Total number of entries and only be shown */}
                <div>
                    <p className='text-sm font-text text-unactive'>
                        Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalCourses}</span> <span className='text-primary'>results</span>
                    </p>
                </div>
                {/* Paganation */}
                <div>
                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                        {/* Previous */}
                        <a href="#" className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out' onClick={back}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </a>
                        {Pages.map((page)=>(
                            <a
                                key={page}
                                className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset hover:cursor-pointer
                                    ${
                                        page === pageState.currentPage
                                        ? 'bg-primary text-white'
                                        : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                    } transition-all ease-in-out`}
                                    onClick={() => pageChange(page)}>
                                {page}</a>
                        ))}
                        {/* Next */}
                        <a href="#" className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out' onClick={next}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </a>
                    </nav>
                </div>
            </div>

            {/* Dialog box */}
            {/* <CourseCardModal open={modalState.openCard} close={CloseDialog} classname='relative z-10' selectedCourse={selectedCourse}/> */}
            {/* Add Modal */}
            <AddCourseModal open={modalState.openAddCourse} onClose={()=>toggleModal('openAddCourse',false)}/>
            {/* Edit */}
            <EditCourseModal open={modalState.openEditCourse} close={()=>toggleModal('openEditCourse', false)} id={modalState.CourseID}/>
            {/* Delete */}
            <DeleteCourseModal open={modalState.openDeleteCourse} close={()=>toggleModal('openDeleteCourse', false)}/>
            {/* Assign Course Admin */}
            <AssignCourseAdmin courseID={modalState.CourseID} open={modalState.assignCourseAdmin} close={()=>toggleModal('assignCourseAdmin',false)}/>
        </div>

    )
}
