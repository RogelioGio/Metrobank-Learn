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



export default function UserManagementMaintenance() {
    const {departments,cities,location, division, section} = useOption();
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const {user} = useStateContext();
    const [OpenReportGeneration, setOpenReportGeneration] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(true);
    const [users, setUsers] = useState([]) //Fetching the user list
    const [status, setStatus] = useState("Active")
    const [permDelete, setPermDelete] = useState(false)
    const [isBulkInactiveWarningOpen, setIsBulkInactiveWarningOpen] = useState(false)

    // useEffect(() => {
    //     setLoading(true);
    //     const handler = setTimeout(() => {
    //         if(search.trim() === ""){
    //             fetchUsers();
    //             pageChangeState('currentPage', 1);
    //         } else {
    //             fetchSearch();
    //         }
    //     },1000);

    //     return () => {clearTimeout(handler)};
    // },[search]);



    //Modal State
    const [modalState, setModalState] = useState({
        isOpen: false,
        isOpenAdd:false,
        isEdit:false,
        isEditSuccess: false,
        isDelete: false,
        isDeleteSuccess: false,
        isRestore: false,
        isRestoreSuccess: false,
        isConfirmDelete: false,
    });

    //Handle Checkbox
    const handleCheckbox = (e, id) => {
        e.stopPropagation();
        setCheckedUser((prev) => {
            if (!id) return;

            const exists = prev.some(
                (user) => user.Selected_ID === id
            );

            if (exists) {
                return prev.filter(
                    (user) => user.Selected_ID !== id
                );
            } else {
                return [...prev, { Selected_ID: id }];
            }
        });
    };

    // Handle Select All Checkbox
    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked);
        if (e.target.checked) {
            const allUserIds = users.map(user => ({ Selected_ID: user.id }));
            setCheckedUser(allUserIds);
        } else {
            setCheckedUser([]);
        }
    };

    // Function to count checked users
    const countCheckedUsers = () => {
        return checkedUsers.length;
    };

    //Modal state changes
    const toggleModal = (key,value) => {
        setModalState((prev => ({
            ...prev,
            [key]:value,
        })));
    }

    //Action User Button State
    const [userID, setUserID] = useState({
        isEdit:'',
        isDelete:'',
        isSelect:'',
        isDetail:'',

    })
    const toggleUserID = (key,value) => {
        setUserID((prev => ({
            ...prev,
            [key]:value,
        })));
    }

    //Pagenation States
    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 5,
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



    //Selected User Object
    const [selectedUser, setSelectedUser] = useState()

    //Open and Closing User Description
    const OpenDialog = (user) => {
        setSelectedUser(user);
        //setUserID(ID);
        toggleModal("isOpen",true);
    }
    const CloseDialog = () => {
        //setUserID('');
        toggleModal("isOpen",false);
    }

    //Close Add User Modal
    const CloseAddUser = () => {
        toggleModal("isOpenAdd", false)
        fetchUsers()
    }


    // Open and Close Edit User Modal
    const OpenEdit = (e, user) => {
        e.stopPropagation();
        //toggleUserID("isEdit", ID);
        setSelectedUser(user)
        toggleModal("isEdit", true);
    }
    const CloseEdit = () => {
        // setSelectedUser()
        toggleModal("isEdit", false);
    }

    // Open and Close Delete User Modal
    const OpenDelete = (e, user) => {
        e.stopPropagation();
        setSelectedUser(user)
        //toggleUserID("isDelete", EmployeeID);
        toggleModal("isDelete", true);
    }

    const CloseDelete = () => {
        toggleModal("isDelete", false);
    }


    const OpenConfirmationDelete = () => {
        toggleModal("isConfirmDelete", true);
    }

    const CloseConfirmationDelete = () => {
        toggleModal("isConfirmDelete", false);
    }

    //Close DeleteSuccess Modal
    const OpenSuccessFullyDelete = () => {
        toggleModal("isDeleteSuccess", true)
        pageChangeState("currentPage", 1);
    }

    const CloseSuccessFullyDelete = () => {
        toggleModal("isDeleteSuccess", false);
        fetchUsers()
    }

    //Close Edit Success
    const OpenSuccessFullyEdit = () => {
        toggleModal("isEditSuccess", true)
        pageChangeState("currentPage", 1);
    }
    const CloseSuccessFullyEdit = () => {
        toggleModal("isEditSuccess", false)
        fetchUsers()
    }

    //Open the user detail page
    const OpenDetailView = (e, id) => {
        e.stopPropagation()
        navigate(`/systemadmin/userdetail/${id}`)
    }

    //Open Restore

    const OpenRestore = (e, user) => {
        e.stopPropagation();
        setSelectedUser(user)
        toggleModal("isRestore", true);
    }

    //Fetching Users in the database using axios
    const fetchUsers = () => {
        setLoading(true)
        axiosClient.get(`/index-user/${status}`,{
            params: {
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        }).then(response => {;
            setUsers(response.data.data)
            pageChangeState("totalUsers", response.data.total)
            pageChangeState("lastPage", response.data.lastPage)
            setLoading(false)
        }).catch(err => {
            console.log(err)
        })
    }

    const fetchSearch = () => {
        setLoading(true)
        axiosClient.get(`/search-employee/${status}`,{
            params: {
                q: search,
                page: pageState.currentPage,
                per_page: pageState.perPage,
            }
        }).then((response)=>{
            setUsers(response.data.data)
            pageChangeState("totalUsers", response.data.total)
            pageChangeState("lastPage", response.data.lastPage)
            setLoading(false)
        }).catch((err)=>{
            console.log(err)
        })
    }

    useEffect(() => {
        pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
        pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalUsers))
    },[pageState.currentPage, pageState.perPage, pageState.totalUsers])

    useEffect(() => {
        setLoading(true);
        const handler = setTimeout(() => {
            if (search.trim() === "") {
                fetchUsers();
            } else {
                fetchSearch();
            }
        }, 800);

        return () => clearTimeout(handler);
    }, [search, pageState.currentPage, pageState.perPage, status]);



    //Next and Previous
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

    //Current page change
    const pageChange = (page) => {
        if(isLoading) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }
    //Dynamic Pagging numbering

    const getPages = () => {
        const {currentPage, lastPage} = pageState;
        const pages = [];

        const firstPages = 3; // always show first 3 pages
        const lastPages = 3;  // always show last 3 pages
        const windowSize = 3;

        for (let i = 1; i <= Math.min(firstPages, lastPage); i++) {
            pages.push(i);
        }

        let windowStart = Math.max(currentPage - 1, firstPages + 1);
        let windowEnd = Math.min(currentPage + 1, lastPage - lastPages);

        if (windowStart > firstPages + 1) {
            pages.push('...');
        }

        for (let i = windowStart; i <= windowEnd; i++) {
            pages.push(i);
        }

        if (windowEnd < lastPage - lastPages) {
            pages.push('...');
        }


        for (let i = Math.max(lastPage - lastPages + 1, firstPages + 1); i <= lastPage; i++) {
        pages.push(i);
        }

        return pages;

    }
    const Pages = getPages();


    const handleSelectUsers = (id) => {
        setSelected((prev) => {
            const existed = prev.find((item) => item.id === id);

            if (existed) {
                return prev.filter((item) => item.id !== id);
            }
            return [...prev, { id }];
        });
    }

    const handleBulkAction = () => {
        if(isLoading) return;
        setLoading(true);
        axiosClient.post('bulk-archive-restore-delete-users', {
            data: selected,
            action: status === "Active" ? "archive" : "restore"
        })
        .then(() => {
            setIsBulkInactiveWarningOpen(false);
            toast.success(`Successfully ${status === "Active" ? "inactivated" : "restored"} selected users.`);
            setLoading(false);
            setSelected([]);
            if(search === ""){
                fetchUsers();
                return
            };
            fetchSearch();
        })
        .catch((error) => {
            setIsBulkInactiveWarningOpen(false);
            toast.error("An error occurred while performing the bulk action.");
            console.error(error);
            setLoading(false);
        });
    }

    useEffect(()=>{
        console.log(selected)
    },[selected])

    return (
        <div className='grid grid-cols-4 h-full w-full
                        grid-rows-[6.25rem_min-content]
                        xl:grid-rows-[6.25rem_min-content_auto_auto_min-content]
                        sm:grid-rows-[6.25rem_min-content]'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | User Management Maintenance</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center row-span-1 border-b border-divider
                            col-start-1 row-start-1 col-span-3
                            xl:col-span-3
                            sm:col-span-3 sm:'>
                <h1 className='text-primary font-header
                                text-xl
                                sm:text-2xl
                                xl:text-4xl'>User Management Maintenance</h1>
                <p className='font-text text-unactive
                                text-xs
                                xl:text-sm
                                sm:text-xs'>Effortlessly manage and add users to ensure seamless access and control.</p>
            </div>


            {/* Add Button */}
            <div className='row-start-1 flex flex-col justify-center border-divider border-b
                            items-end mr-3
                            xl:col-start-4 xl:pl-5 xl:mr-5
                            sm:col-span-1 sm:col-start-4 sm:py-2 sm:mr-4'>
                {
                    user.user_infos.permissions?.some((permission)=> permission.id === 1) ? (
                        <>
                        <div className='relative group sm:w-full'>
                            <button className='inline-flex flex-row shadow-md items-center justify-center bg-primary font-header text-white text-base p-4 rounded-full hover:bg-primaryhover hover:scale-105 transition-all ease-in-out
                                            w-16 h-16
                                            sm:w-full'
                                onClick={() => {
                                    // toggleModal("isOpenAdd",true)
                                    navigate('/systemadmin/adduser')
                                }}>
                                <FontAwesomeIcon icon={faUserPlus} className='sm:mr-2'/>
                                <p className='hidden
                                            sm:block'>Add User</p>
                            </button>
                            <div className='absolute bottom-[-2.5rem] w-full bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap scale-0 group-hover:scale-100 block transition-all ease-in-out
                                            sm:hidden'>
                                <p>Add User</p>
                            </div>
                        </div>
                        </>
                    ) : (null)
                }
            </div>

            {/* Bulk Action */}
            {/* <div className='row-start-2 px-5 flex flex-row items-center gap-2'>
                {
                    user.user_infos.permissions?.some((permission)=> permission.id === 3) && status === "Active" ?
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
                    </div>:
                    <div className={`w-full justify-between flex flex-row bg-primary text-white py-3 px-4 rounded-md font-header text-sm ${selected.length === 0 ? "opacity-50":"hover:cursor-pointer hover:bg-primaryhover "} transition-all ease-in-out`}
                        onClick={()=>{
                            if(selected.length === 0) return;
                            setIsBulkInactiveWarningOpen(true)}
                            }>
                        <div className='flex flex-row gap-2 items-center'>
                            <FontAwesomeIcon icon={faRotateLeft} className=''/>
                            <p>Bulk Restore</p>
                        </div>
                        <div>
                            {selected.length === 0 ? null : <p>{selected.length}</p>}
                        </div>
                    </div>
                }
                {
                    selected.length > 0  ?
                    <div className={`flex flex-row items-center justify-center text-primary min-w-11 h-11 bg-white font-header text-sm border-2 border-primary rounded-md ${selected.length === 0 ? "opacity-50":"hover:text-white hover:cursor-pointer hover:bg-primaryhover "} transition-all ease-in-out`}
                        onClick={()=>setSelected([])}>
                        <FontAwesomeIcon icon={faXmark} className='text-lg'/>
                    </div> : null
                }
            </div> */}

            {/* Search bar */}
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
                                fetchUsers();
                            }}}>
                            <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                        </div>
                    </div>
            </div>


            {/* User Filter */}
            <div className='flex flex-row items-center col-start-1 justify-end'>
                <Select value={status} onValueChange={(value) => {setStatus(value); setSelected([])}} disabled={isLoading}>
                    <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full py-5 bg-white`}>
                        <SelectValue placeholder="Account Status" />
                    </SelectTrigger>
                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                        <SelectItem value="Active">Active Users</SelectItem>
                        <SelectItem value="Inactive">Inactive Users</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Userlist Table */}
            <div className='flex flex-col gap-2 row-start-3 row-span-2 col-start-1 col-span-4
                            xl:pr-5 xl:py-2'>
                <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                <table className='text-left w-full overflow-y-scroll'>
                    <thead className='font-header text-xs text-primary bg-secondaryprimary border-l-2 border-secondaryprimary'>
                        <tr>
                            <th className='py-4 px-4 flex items-center flex-row gap-4 w-2/7'>
                                    <p> EMPLOYEE NAME</p>
                            </th>
                            <th className='py-4 px-4  hidden lg:table-cell'>DIVISION</th>
                            <th className='py-4 px-4  hidden lg:table-cell'>DEPARTMENT</th>
                            <th className='py-4 px-4  hidden lg:table-cell'>TITLE</th>
                            <th className='py-4 px-4  hidden lg:table-cell'></th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-divider'>
                        {
                            //isLoading
                            isLoading ? (
                                <UserListLoadingProps className="z-10"/>
                            ) : users.length === 0 ? (
                                // <tr>
                                //     <td colSpan={6} className='flex items-center justify-center p-5 text-unactive font-text w-full'>
                                //         <p>There is no users that met the selected criteria</p>
                                //     </td>
                                // </tr>
                                <tr className="font-text text-sm">
                                    <td colSpan={5} className="text-center py-3 px-4 font-text text-unactive">
                                    There is no users that met the selected criteria
                                    </td>
                                </tr>
                            ):(
                                users.map((entry) => (
                                    <UserEntriesProps key={entry.id} users={entry} permission={""} profileCard={()=>OpenDialog(entry)} edit={OpenEdit} deleteUser={OpenDelete} status={status} restore={OpenRestore} handleSelect={()=>handleSelectUsers(entry.id)} selected={selected}/>
                                ))
                            )
                        }
                    </tbody>
                </table>
                </div>
            </div>

            {/* Sample Footer Pagenataion */}
            <div className='row-start-5 row-span-1 col-start-1 col-span-4 border-t border-divider mr-5 py-3 flex flex-row items-center justify-between'>
                {/* Total number of entries and only be shown */}
                <div className='flex flex-row gap-2 font-text text-sm text-unactive items-center justify-center relative'>

                    {
                        selected.length > 0 ? <>
                            {
                                user.user_infos.permissions?.some((permission)=> permission.id === 3) && status === "Active" ?
                                <div className="flex flex-row gap-2 items-center justify-center">
                                    <div className='flex flex-row gap-2 items-center '>
                                        <div className="text-red-900 px-4 w-fit h-9 border border-red-900 bg-red-300 flex gap-2 items-center justify-center rounded-md hover:cursor-pointer hover:text-white hover:bg-red-700"
                                            onClick={()=>{
                                                if(selected.length === 0) return;
                                                setIsBulkInactiveWarningOpen(true)
                                            }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                            <p>Inactive All</p>
                                        </div>
                                    </div>
                                    <p className='text-sm font-text text-primary'>
                                        {selected.length} selected entries
                                    </p>
                                    <p className='text-sm font-text text-unactive hover:cursor-pointer hover:underline' onClick={()=>{setSelected([])}}>
                                        Clear all
                                    </p>
                                </div>:
                                <div className="flex flex-row gap-2 items-center justify-center">
                                    <div className='flex flex-row gap-2 items-center '>
                                        <div className="text-primary px-4 w-fit h-9 border border-primary bg-primarybg flex gap-2 items-center justify-center rounded-md hover:cursor-pointer hover:text-white hover:bg-primaryhover"
                                            onClick={()=>{
                                                if(selected.length === 0) return;
                                                setIsBulkInactiveWarningOpen(true)
                                            }}>
                                            <FontAwesomeIcon icon={faRotateLeft} />
                                            <p>Restore All</p>
                                        </div>
                                    </div>
                                    <p className='text-sm font-text text-primary'>
                                        {selected.length} selected entries
                                    </p>
                                    <p className='text-sm font-text text-unactive hover:cursor-pointer hover:underline' onClick={()=>{setSelected([])}}>
                                        Clear all
                                    </p>
                                </div>
                            }
                        </>:!isLoading ? (
                            <>
                                 {
                                    user.user_infos.permissions?.some((permission)=> permission.id === 11) ?
                                    <div className='group'>
                                    <div className={`bg-white text-primary border-2 w-10 h-10 border-primary rounded-md shadow-md transition-all ease-in-out flex items-center justify-center
                                                    ${isLoading ? "cursor-not-allowed opacity-50" : "hover:cursor-pointer hover:bg-primary hover:text-white"}`}
                                        onClick={() => {
                                            if(!isLoading) {
                                                setOpenReportGeneration(true);
                                            }
                                        }}>
                                        <FontAwesomeIcon icon={faFilePen} />
                                    </div>
                                    <div className={`absolute w-fit top-[-2.3rem] bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap block transition-all ease-in-out
                                                    ${isLoading ? "scale-0" : "scale-0 group-hover:scale-100"}`}>
                                        <p>Generate Report</p>
                                    </div>
                                    </div>:null
                                }
                                <p className='text-sm font-text text-unactive'>
                                    Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                                </p>
                            </>
                        ) : (
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
                            Pages.map((page)=>(
                                    <a
                                        key={page}
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset hover:cursor-pointer
                                            ${
                                                page === pageState.currentPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } ${isLoading ? "opacity-50" : ""} transition-all ease-in-out `}
                                            onClick={() => pageChange(page)}>
                                        {page}</a>
                                ))
                        }
                        <a
                            onClick={next}
                            className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </a>
                    </nav>

                </div>
            </div>

                    {/* Generate Report */}
                    <ReportGenerationModal open={OpenReportGeneration} close={()=>{setOpenReportGeneration(false)}} usedFor={"masterList"} generated={()=>{setReportGenerated(true)}} setMessage={()=>setError()} setSuccess={()=>setReportSuccess(true)}/>
                    <ReportGeneratedModal open={reportGenerated} close={()=>{setReportGenerated(false)}} type={reportSuccess} message={error}/>

                    {/* User Profile Card */}
                    <UserEntryModal open={modalState.isOpen} close={CloseDialog} classname='relative z-10' ID={userID} selectedUser={selectedUser}/>

                    {/* Add User Modal */}
                    {/* <AddUserModal open={modalState.isOpenAdd} close={CloseAddUser} updateTable={fetchUsers}/> */}

                    {/* Edit User Modal */}
                    <EditUserModal open={modalState.isEdit} close={CloseEdit} ID={userID.isEdit} close_confirmation={OpenSuccessFullyEdit} selectedUser={selectedUser} fetch={()=>fetchUsers()}/>
                    <EditUserSuccessfully open={modalState.isEditSuccess} close={CloseSuccessFullyEdit}/>


                    {/* Delete User Modal */}
                    <DeleteUserModal open={modalState.isDelete} close={CloseDelete} EmployeeID={userID.isDelete} close_confirmation={OpenSuccessFullyDelete} selectedUser={selectedUser} active={status} permanent={OpenConfirmationDelete} handlePermDeleting={permDelete} resetPermDeleting={() => setPermDelete(false)}  fetchUser={()=>{fetchUsers()}}/>
                    <DeleteUserSuccessfully open={modalState.isDeleteSuccess} close={CloseSuccessFullyDelete}/>
                    <ConfirmingDeletingUser open={modalState.isConfirmDelete} close={CloseConfirmationDelete} selectedUser={selectedUser} handlePermDeleting={()=>{setPermDelete(true)}}/>
                    <WarningModal open={isBulkInactiveWarningOpen} close={()=>{setIsBulkInactiveWarningOpen(false)}} selected={selected} proceed={() => handleBulkAction()} loading={isLoading} fetchUsers={()=>{
                        if(search === ""){
                            fetchUsers()
                            return
                        };
                        fetchSearch()
                    }}

                    title={status === "Active" ? "Bulk Inactive Accounts" : "Bulk Restore Accounts"} desc={status === "Active" ? "The Learners chosen is about to be inactive" : "The Learners chosen is about to be active again"}/>

                    {/* Restore */}
                    <ReactivationAccountModal open={modalState.isRestore} close={()=>{toggleModal("isRestore", false)}} users={selectedUser}
                    fetchUsers={
                        ()=>{
                            if(search === ""){
                                fetchUsers()
                                return
                            };
                            fetchSearch()
                        }
                    }
                    status={status}/>

        </div>

    )
}
