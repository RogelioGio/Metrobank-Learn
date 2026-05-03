import { useOption } from "MBLearn/src/contexts/AddUserOptionProvider";
import React, { useEffect, useState } from "react";
import UserSecEntyProps from "../UserSecEntyProps";
import axiosClient from "MBLearn/src/axios-client";
import UserCredentialsLoadingProps from "../UserCredentialsLoadingProps";
import UserReactivationProps from "./UserReactivationProps";
import { faChevronLeft, faChevronRight, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactivationAccountModal from "./ReactivationAccountModal";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";

const ReactivationAccountSetting = () => {
    const {departments, titles, cities, location} = useOption();
    const [loading, setLoading] = useState()
    const [users, setUnactiveUsers] = useState([])
    const [reactivate, setReactivate] = useState(false)
    const [user, setUsers] = useState()


    useEffect(() => {
        // fetchUsers()
    },[])


     //Pagenation States
    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 5,
        totalUsers: 0,
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
            pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalUsers))
        },[pageState.currentPage, pageState.perPage, pageState.totalUsers])


    useEffect(() => {
        // fetchUsers()
    },[pageState.currentPage, pageState.perPage])

    // const openReActivation = (id) => {
    //     if (id) {
    //         setUsers(id)
    //         setReactivate(true)
    //     }
    // };

    const back = () => {
        if (loading) return;
        if (pageState.currentPage > 1){
            pageChangeState("currentPage", pageState.currentPage - 1)
            pageChangeState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (loading) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    //Current page change
    const pageChange = (page) => {
        if(loading) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }
    //Dynamic Pagging numbering
    const Pages = [];
    for(let p = 1; p <= pageState.lastPage; p++){
        Pages.push(p)
    }

    // const fetchUsers = () => {
    //     setLoading(true)
    //     axiosClient.get('/index-user-creds/inactive',{
    //         params: {
    //             page: pageState.currentPage,
    //             perPage: pageState.perPage
    //         }
    //     })
    //     .then((response) => {
    //         setUnactiveUsers(response.data.data)
    //         setLoading(false)
    //         pageChangeState("totalUsers", response.data.total)
    //         pageChangeState("lastPage", response.data.lastPage)
    //     }).catch((e)=>{
    //         console.log(e)
    //     })
    // }
    // useEffect(()=>{console.log(users)},[users])


    return(
        <>
        <div className="grid grid-cols-4 row-start-1">
            <div className="col-span-1 flex flex-col justify-center pb-4">
                {/* <div className="h-10 w-10 font-header text-primary flex flex-row gap-2 justify-center items-center border-2 border-primary rounded-md shadow-md hover: cursor-pointer transition-all ease-in-out hover:bg-primaryhover hover:text-white
                                md:w-1/2 md:h-full md:py-4">
                    <FontAwesomeIcon icon={faFilter}/>
                    <p className="md:block hidden">Filter</p>
                </div> */}
                <div className= {`flex flex-row items-center justify-center bg-white text-primary gap-2 border-2 border-primary w-fit rounded-md hover:text-white hover:bg-primary transition-all ease-in-out hover:cursor-pointer
                                    h-11 aspect-square
                                    sm:py-2 sm:px-4`}>
                    <FontAwesomeIcon icon={faFilter}/>
                    <p className='font-header text-sm hidden
                                sm:block'>Filter</p>
                </div>
            </div>
            <div className="col-start-3 col-span-2 pb-4">
                <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                    <div className='bg-primary py-2 px-4 text-white'>
                        <FontAwesomeIcon icon={faSearch}/>
                    </div>
                </div>
            </div>
        </div>
        {/* Table */}
        <div className='row-start-2 col-start-1'>
        <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
            <table className='text-left min-w-full table-layout-fixed'>
                <thead className='font-header text-xs text-primary bg-secondaryprimary uppercase'>
                    <tr>
                        <th className='p-4 w-2/7'>EMPLOYEE NAME</th>
                        <th className='p-4 w-2/7 md:table-cell hidden'>Branch & Location</th>
                        <th className='p-4 w-2/7 md:table-cell hidden'>Division & Section</th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-divider'>
                    {
                        loading ? (
                            Array.from({length: pageState.perPage}).map((_,index) => (
                                <tr className='font-text text-sm hover:bg-gray-200 hover:cursor-pointer animate-pulse'>
                                    <td className='text-sm py-3 px-4'>
                                        <div className='flex items-center gap-2'>
                                            {/* User Image */}
                                            <div className='bg-blue-500 h-10 w-10 rounded-full'>

                                            </div>
                                            {/* Name */}
                                            <div className="flex flex-col gap-1">
                                                <div className="h-4 w-40 bg-gray-200 rounded-full"></div>
                                                <div className="h-4 w-8 bg-gray-200 rounded-full"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-3 px-4 md:table-cell hidden'>
                                        <div className='flex flex-col gap-1'>
                                            <div className="h-4 w-1/2 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 w-8 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </td>
                                    <td className='py-3 px-4 md:table-cell hidden'>
                                        <div className='flex flex-col gap-1'>
                                            <div className="h-4 w-1/2 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 w-8 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            users.map(user => (
                                <UserReactivationProps
                                key={user.id}
                                id={user.user_infos.id}
                                image={user.user_infos?.profile_image}
                                name={[user.user_infos?.first_name, user.user_infos?.middle_name, user.user_infos?.last_name].join(" ")}
                                MBEmail={user.MBemail}
                                branch={user.user_infos?.branch_id}
                                city={user.user_infos?.city_id}
                                _division={user.user_infos?.division_id}
                                _section={user.user_infos?.section_id}
                                _department={user.user_infos?.department_id}
                                login_time_stamp={user?.last_logged_in}
                                selected={()=>{setUsers(user),setReactivate(true)}}/>
                            ))
                        )


                    }
                </tbody>
            </table>
            </div>
        </div>
        <div className="row-start-3 flex flex-row items-center justify-between pt-4">
            {
                !loading ?
                <>
                    <div>
                        <p className='text-sm font-text text-unactive'>
                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                        </p>
                    </div>
                    {/* Paganation */}
                    <div>
                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs cursor-pointer'>
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
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                            ${
                                                page === pageState.currentPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } transition-all ease-in-out`}
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
                </>:<>
                <div className="flex flex-col">
                    <p className="font-text text-xs text-unactive py-4"> Loading Items...</p>
                </div>
                </>
            }
        </div>
        <ReactivationAccountModal open={reactivate} close={() => setReactivate(false)} refresh={()=>fetchUsers()} users={user}/>
        </>
    )
}
export default ReactivationAccountSetting
