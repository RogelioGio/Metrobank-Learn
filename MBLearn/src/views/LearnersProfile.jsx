import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Navigation from './Navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCross, faFilePen, faFilter, faMagnifyingGlass, faRotateLeft, faSearch, faSpinner, faTrash, faTrashCan, faUser, faUserPen, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Menu, MenuButton, MenuItem, MenuItems, Disclosure, DisclosureButton, DisclosurePanel, Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react';
import User from '../modalsandprops/UserEntryProp';
import UserEntryModal from '../modalsandprops/UserEntryModal';
import axiosClient from '../axios-client';
import AddUserModal from '../modalsandprops/AddUserModal';
import { TailSpin } from 'react-loader-spinner'
import UserListLoadingProps from '../modalsandprops/UserListLoadingProps';
import EditUserModal from '../modalsandprops/EditUserModal';
import DeleteUserModal from '../modalsandprops/DeleteUserModal';
import DeleteUserSuccessfully from '../modalsandprops/DeleteUserSuccessfully';
import UserManagemenFilterPopover from '../modalsandprops/UserManagementFilterPopover';
import { useOption } from '../contexts/AddUserOptionProvider';
import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import EditUserSuccessfully from '../modalsandprops/EditUserSuccesfuly';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"
// import echo from 'MBLearn/echo';
import { toast } from 'sonner';
import ReportGenerationModal from '../modalsandprops/ReportGenerationModal';
import ReportGeneratedModal from '../modalsandprops/ReportGeneratedModal';
import UserEntriesProps from '../modalsandprops/UserEntriesProps';
import UserFilterProps from '../modalsandprops/UserFilterProps';
import { DialogDescription } from '@radix-ui/react-dialog';
import {  Select,
            SelectTrigger,
            SelectValue,
            SelectContent,
            SelectItem
        } from '../components/ui/select';
import ReactivationAccountModal from '../modalsandprops/SystemSettingComponents.jsx/ReactivationAccountModal';
import { set } from 'date-fns';
import ConfirmationModal from '../modalsandprops/AuthoringTool/ConfirmationModal';
import ConfirmingDeletingUser from '../modalsandprops/ConfirmingDeletingUser';
import WarningModal from '../modalsandprops/WarningModal';
import { ScrollArea } from '../components/ui/scroll-area';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { transformValueTypes } from 'framer-motion';
import LearnerProfileModal from '../modalsandprops/LearnerProfileModal';


export default function LearnersProfile() {
    const [search, setSearch] = useState("");
    const [selectedLearner, setSelectedLearner] = useState({});
    const [openLearnerProfile, setOpenLearnerProfile] = useState (false);

    const obeserverRef = useRef();
    const sentinelRef = useRef();
    const [hasMore, setHasMore] = useState(true);
    const [learners, setLearners] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //initial loading state
    const [loadingMore, setLoadingMore] = useState (false);


    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
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

    const next = () => {
        if (loadingMore || isLoading || !hasMore) return;
        setLoadingMore(true);
        setPagination((prev) => ({
            ...prev,
            currentPage: prev.currentPage + 1
        }))
    }


    useEffect(() => {
        if(isLoading) return;
        if(!hasMore) return;

        if(obeserverRef.current) obeserverRef.current.disconnect();

        obeserverRef.current = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                next();
            }
        });

        const current = sentinelRef.current;
        if(current) obeserverRef.current.observe(current);
        return () => {
            if(obeserverRef.current) obeserverRef.current.disconnect();
        };

    }, [hasMore, isLoading, loadingMore]);

    const fetchingLearners = () => {
        axiosClient.get('/getLearners',{
            params: {
                page: pageState.currentPage,
                perPage: pageState.perPage
            }
        })
        .then((data) => {
            setLearners((prevLearners) => ([...prevLearners, ...data.data.data]));
            setIsLoading(false);
            setLoadingMore (false);

            pageChangeState("totalUsers", data.data.total);

            console.log(pageState.currentPage, data.data.lastPage);
            if(pageState.currentPage >= data.data.lastPage) {
                setHasMore (false);
            }

        }).catch((err)=> {
            setIsLoading(false);
            console.log(err);
        })
    }

    const fetchSearch = () => {
        axiosClient.get('/searchLearners',{
            params: {
                q: search,
                page: pageState.currentPage,
                perPage: pageState.perPage
            }
        }).then((data) => {
            setLearners((prevLearners) => ([...prevLearners, ...data.data.data]));
            setIsLoading(false);
            setLoadingMore (false);

            pageChangeState("totalUsers", data.data.total);
            if(pageState.currentPage >= data.data.lastPage) {
                setHasMore (false);
            }

        }).catch((err)=> {
            setIsLoading(false);
            console.log(err);
        })
    }

    // 1️⃣ Reset pagination and learners when search changes
    useEffect(() => {
        pageChangeState("currentPage", 1); // reset to first page
        setIsLoading(true);             // set loading state
        setLearners([]);                  // clear old results
        setHasMore(true);                 // allow more results
    }, [search]);

    // 2️⃣ Fetch either normal or search results
    useEffect(() => {
        const handler = setTimeout(() => {
            if (search.trim() === "") {
                fetchingLearners();
            } else {
                fetchSearch();
            }
        }, 800);

        return () => clearTimeout(handler);
    }, [search, pageState.currentPage]);

    useEffect(() => {
        console.log("Current Page Changed: ", pageState.currentPage);
    },[pageState.currentPage]);

    return (
        <>
        <div className='grid grid-cols-4 h-full w-full
                        grid-rows-[6.25rem_min-content]
                        xl:grid-rows-[6.25rem_min-content_auto_auto_min-content]
                        sm:grid-rows-[6.25rem_min-content]'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Learners Profile</title>
            </Helmet>

            <div className='flex flex-col justify-center row-span-1 border-b border-divider
                        col-start-1 row-start-1 col-span-3
                        xl:col-span-4 xl:mr-4
                        sm:col-span-3 sm:'>
            <h1 className='text-primary font-header
                            text-xl
                            sm:text-2xl
                            xl:text-4xl'>Learner Profile</h1>
            <p className='font-text text-unactive
                            text-xs
                            xl:text-sm
                            sm:text-xs'>List down all learners that is taking the course and see thier own progress.</p>
            </div>


            <div className='inline-flex items-center justify-end row-start-2 py-3 gap-3
                            col-span-3 col-start-2 h-full w-full pr-3
                            sm:col-start-3 sm:col-span-2 sm:pr-4
                            xl:col-start-3 xl:col-span-2 xl:pr-5 xl:pl-3'>
                <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name='search'
                            value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                        />
                        <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                            onClick={() => {if(search){
                                setSearch("")
                                // fetchUsers();
                            }}}>
                            <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                        </div>
                    </div>
            </div>

            <div className='flex flex-col gap-2 row-start-3 row-span-2 col-start-1 col-span-4
                            xl:pr-5 xl:py-2'>
                <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                    <table className='text-left w-full overflow-y-scroll table-fixed'>
                    <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                        <tr>
                            <th className='py-4 px-4 flex items-center flex-row gap-4'>
                                    <p> EMPLOYEE NAME</p>
                            </th>
                            <th className='py-4 px-4 lg:table-cell'>DIVISION</th>
                            <th className='py-4 px-4 lg:table-cell'>DEPARTMENT</th>
                            <th className='py-4 px-4 lg:table-cell'>ROLE</th>
                        </tr>
                    </thead>
                    </table>
                    <ScrollArea className='w-full h-[calc(100vh-15rem)] bg-white'>
                        <table className='text-left w-full overflow-y-scroll table-fixed'>
                            <tbody className='bg-white divide-y divide-divider'>
                                {
                                    isLoading ?
                                    <>
                                    {
                                    Array(10).fill(0).map((_, index) => (
                                    <tr key={index} className='font-text text-sm hover:bg-gray-200 z-10'>
                                        <td className='py-3 px-4'>
                                            <div className='flex items-center gap-2'>
                                                {/* User Image */}
                                                <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                                    <div className='animate-pulse bg-gray-300 h-10 w-10 rounded-full'></div>
                                                </div>
                                                {/* Name and employee-id*/}
                                                <div className="flex flex-col gap-1">
                                                    <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                                                    <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <div className='flex flex-col gap-1'>
                                                {/* Department */}
                                                <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                                                {/* Title */}
                                                <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <div className='flex flex-col gap-1'>
                                                {/* Department */}
                                                <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                                                {/* Title */}
                                                <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 hidden lg:table-cell'>
                                            <div className='flex flex-col gap-1'>
                                            {/* Branch Location */}
                                            <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                                            {/* City Location */}
                                            <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                                            </div>
                                        </td>
                                    </tr>))
                                    }
                                    {/* <tr>
                                        <td ref={sentinelRef} colSpan={5}>
                                            <div className='flex items-center justify-center p-4 text-xs text-unactive'>
                                                {
                                                    hasMore ?
                                                    <p><FontAwesomeIcon icon={faSpinner} className='animate-spin mr-3'/> Loading entries</p>
                                                    :
                                                    <p>
                                                        {`---Display ${pageState.totalUsers} all entries with the given criteria---`}
                                                    </p>
                                                }
                                            </div>
                                        </td>
                                    </tr> */}
                                    </>
                                    : learners.length === 0 ?
                                    <tr>
                                        <td colSpan={4}>
                                            <div className='w-full p-4'>
                                                <p className='text-center text-unactive text-xs'>No Data for the given criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                    :
                                    <>
                                        {
                                            learners.map((users, index) => (
                                                <tr className="hover:bg-gray-50 border-b cursor-pointer transition-all ease-in-out" onClick={()=>{setSelectedLearner(users); setOpenLearnerProfile(true)}} key={index}>
                                                    <td className={`text-sm py-3 px-4`}>
                                                        <div className="flex items-center gap-3 flex-row">
                                                            <div className="flex flex-row gap-4 items-center">
                                                                {
                                                                    users.profile_image !== null ?
                                                                    <div className="w-10 h-10 bg-primary rounded-full overflow-hidden">
                                                                        <img src={users.profile_image} alt="" className="w-full h-full object-cover"/>
                                                                    </div> :
                                                                    <div className="w-10 h-10 bg-primary rounded-full overflow-hidden"/>
                                                                }
                                                            </div>
                                                            <div>
                                                                <p className="font-text">{`${users.first_name} ${users.middle_name ? users.middle_name.charAt(0) + '.' : ''} ${users.last_name}` || "No Name Given"}</p>
                                                                <p className="text-unactive text-xs font-text">ID: {users.employeeID}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="font-text py-3 px-4">
                                                        <p className="text-unactive text-xs">{users.title?.department?.division?.division_name ?? "No Division"}</p>
                                                    </td>
                                                    <td className="font-text py-3 px-4">
                                                        <p className="text-unactive text-xs">{users.title?.department?.department_name ?? " No Department"}</p>
                                                    </td>
                                                    <td className="font-text py-3 px-4">
                                                        <p className="text-unactive text-xs">{users.title?.title_name ?? "No Title"}</p>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        <tr>
                                            <td ref={sentinelRef} colSpan={4}>
                                                <div className='flex items-center justify-center p-4 text-xs text-unactive'>
                                                    {
                                                        hasMore ?
                                                        <p><FontAwesomeIcon icon={faSpinner} className='animate-spin mr-3'/> Loading entries</p>
                                                        :
                                                        <p>
                                                            {`---Display ${pageState.totalUsers} all entries with the given criteria---`}
                                                        </p>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    </>

                                    // : users?.length === 0 ? (
                                    //     <tr className="font-text text-sm">
                                    //         <td colSpan={5} className="text-center py-3 px-4 font-text text-unactive">
                                    //         There is no users that met the selected criteria
                                    //         </td>
                                    //     </tr>
                                    // ):(
                                    //     <>
                                    //     {
                                    //         users.map((entry) => (
                                    //             //<UserEntriesProps key={entry.id} users={entry} permission={""} profileCard={()=>OpenDialog(entry)} edit={OpenEdit} deleteUser={OpenDelete} status={status} restore={OpenRestore} handleSelect={()=>handleSelectUsers(entry.id)} selected={selected}/>
                                    //             <div></div>
                                    //         ))
                                    //     }
                                    //     </>
                                    // )
                                }

                            </tbody>
                        </table>
                    </ScrollArea>
                </div>
            </div>
        </div>

        <LearnerProfileModal isOpen={openLearnerProfile} onClose={()=>setOpenLearnerProfile(false)} selectedUser={selectedLearner}/>
        </>
    )
}
