import { Helmet } from "react-helmet"
import { useStateContext } from "../contexts/ContextProvider"
import { format, set } from "date-fns"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCertificate, faChevronLeft, faChevronRight, faGear, faGraduationCap, faSpinner, faSwatchbook } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import LearningJourney from "../modalsandprops/UserProfileComponents.jsx/LearningJourney"
import AccountSettingModal from "../modalsandprops/AccountSettingModal"
import axiosClient from "../axios-client"
import CourseManagement from "../modalsandprops/UserProfileComponents.jsx/CourseManagement"

export default function UserProfile() {
    const {user} = useStateContext()
    const [tab, setTab] = useState("content");
    const [open, setOpen] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [courseType, setCourseType] = useState("myCourses");
    const [courseDuration, setCourseDuration] = useState("enrolled");
    const [contentItem, setContentItem] = useState([]);

    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 8,
        totalItem: 0,
        lastPage: 1,
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
    const Pages = [];
    for(let p = 1; p <= pageState.lastPage; p++){
        Pages.push(p)
    }

    const pageChange = (page) => {
        if(fetchin) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }
        const back = () => {
        if (fetchin) return;
        if (pageState.currentPage > 1){
            pageChangeState("currentPage", pageState.currentPage - 1)
            pageChangeState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (fetchin) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    const fetchCourseContent = (type) => {
        setFetching(true);
        if(type === "myCourses") {
            axiosClient.get(`/select-user-added-courses/${user.user_infos?.id}`,{
                params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage,
                }
            })
            .then(({data}) => {
                setFetching(false);
                setContentItem(data.data);
                pageChangeState("totalItem", data.total)
                pageChangeState("lastPage", data.lastPage)
            })
            .catch((err) => {
                console.log(err);
            })
        } else if(type === "assigned") {
            axiosClient.get(`/select-user-assigned-courses/${user.user_infos?.id}`,{
                    params: {
                        page: pageState.currentPage,
                        per_page: pageState.perPage,
                    }
                })
                .then(({ data }) => {
                    setFetching(false);
                    setContentItem(data.data);
                    pageChangeState("totalItem", data.total)
                    pageChangeState("lastPage", data.lastPage)
                })
                .catch((err) => {
                    console.log(err);
                })
        };
    }

    const fetchLearnerJourney  = (duration) => {
        setFetching(true);
        axiosClient.get(`/select-user-courses/${user.user_infos?.id}`,
                    {
                        params: {
                            page: pageState.currentPage,
                            perPage: pageState.perPage,
                        }
                    }
                )
                .then(({data}) => {
                    setContentItem(data.data);
                    setFetching(false)
                    pageChangeState("totalCourses", data.total)
                    pageChangeState("lastPage", data.lastPage)
                }).catch((err)=> {
                    console.log(err)
                })

    }

    const [sort, setSort] = useState({
        name : "none",
        created_at : "none",
    });

    useEffect(() => {
        pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
        pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalItem))
    },[pageState.currentPage, pageState.perPage, pageState.totalItems])

    useEffect(() =>{
        if(tab === "content") {
            fetchCourseContent(courseType);
        } else if(tab === "journey") {
            fetchLearnerJourney(courseDuration);
        }

        setSort({name:"none", created_at:"none"});
    },[tab,courseType,pageState.currentPage, pageState.perPage])

    useEffect(()=>{
        console.log("CourseType:", contentItem.length)
    },[contentItem])

        return (
        <>
             <Helmet>{/* Title of the mark-up */}
                <title>MBLearn | My Profile</title>
            </Helmet>

            {/* <div className="grid grid-cols-4 grid-rows-[min-content_1fr_1fr] h-full w-full"> */}
            <div className="grid px-3 h-full grid-cols-1
                            lg:grid-cols-4 lg:grid-rows-[min-content_1fr_min-content] lg:pl-0">
                {/* Profile Card */}
                <div className="lg::col-span-1 lg:row-span-3 bg-white rounded-xl shadow-md lg:my-5 grid grid-rows-[min-content_min-content_1fr_min-content]">
                    <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-xl h-32 p-4 justify-between flex flex-row ">
                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text h-fit">{user.user_infos.roles[0].role_name}</span>
                        <div className="flex items-center justify-center bg-gray-500 w-8 h-8 rounded-full text-white opacity-40 group transition-all ease-in-out hover:cursor-pointer"
                            onClick={() => setOpen(true)}>
                            <FontAwesomeIcon icon={faGear} className="opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                    </div>
                    <div className="flex flex-col items-center justify-center mt-[-3rem]">
                        <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center">
                            <img src={user.user_infos.profile_image} alt="" className="bg-primary w-28 h-28 rounded-full" />
                        </div>
                        <div className="flex flex-col items-center justify-center py-2">
                            <p className="font-header text-xl text-primary">{user.user_infos.first_name} {user.user_infos.middle_name || ""} {user.user_infos.last_name} {user.user_infos.suffix_name || ""}</p>
                            <p className="font-text text-sm text-unactive">ID: {user.user_infos.employeeID}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 grid-rows-2 gap-2
                                    lg:grid-rows-[min-content_min-content_min-content_min-content] lg:grid-cols-1 p-5">
                        <div>
                            <p className="font-text text-unactive text-xs">Division:</p>
                            <p className="font-header text-primary text-base">{user.user_infos.division.division_name || "No Assigned Division"}</p>
                        </div>
                        <div>
                            <p className="font-text text-unactive text-xs">Department & Title:</p>
                            <p className="font-header text-primary text-base">{user.user_infos.department.department_name || "No Assigned Department"}</p>
                            <p className="font-text text-primary text-sm">{user.user_infos.title.title_name|| "No Assigned Title"}</p>
                        </div>
                        <div>
                            <p className="font-text text-unactive text-xs">Section:</p>
                            <p className="font-header text-primary text-base">{user.user_infos.section.section_name || "No Assigned Section"}</p>
                        </div>
                        <div>
                            <p className="font-text text-unactive text-xs">Location:</p>
                            <p className="font-header text-primary text-base">{user.user_infos.city.city_name || "No Assigned City"}</p>
                            <p className="font-text text-primary text-sm">{user.user_infos.branch.branch_name || "No Assigned Title"}</p>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between p-5">
                        <div>
                            <p className="font-text text-unactive text-xs">Date-Added:</p>
                            <p className="font-header text-primary text-base">{format(user.user_infos.created_at,"MMMM dd yyyy")}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-text text-unactive text-xs">Account Status:</p>
                            <p className="font-header text-primary text-base">{user.user_infos.status}</p>
                        </div>
                    </div>
                </div>
                {/* User Detail Tab */}
                <div className="lg:flex hidden col-span-3 row-span-1 pt-5 pb-2 px-2 flex-row items-center gap-1">
                    <div className={`border-2 border-primary rounded-md flex flex-row items-center py-2 px-5 gap-2 text-primary font-header transition-all ease-in-out ${fetching ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"} ${tab === "content" ? "bg-primary text-white" : ""}`}
                        onClick={() => {
                            if(fetching) return
                                setFetching(true),
                                setTab("content")}}>
                        <FontAwesomeIcon icon={faSwatchbook} />
                        <p>Course Management</p>
                    </div>
                    <div className={`border-2 border-primary rounded-md flex flex-row items-center py-2 px-5 gap-2 text-primary font-header transition-all ease-in-out ${fetching ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"} ${tab === "journey" ? "bg-primary text-white" : ""}`}
                        onClick={() => {
                            if(fetching) return
                            setFetching(true),
                            setTab("journey")}}>
                        <FontAwesomeIcon icon={faGraduationCap} />
                        <p>Learning Journey</p>
                    </div>
                    <div className={`border-2 border-primary rounded-md flex flex-row items-center py-2 px-5 gap-2 text-primary font-header transition-all ease-in-out ${fetching ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"} ${tab === "certificates" ? "bg-primary text-white" : ""}`}
                        onClick={() => {
                            if(fetching) return
                            setFetching(true), setTab("certificates")}}>
                        <FontAwesomeIcon icon={faCertificate} />
                        <p>Certificates</p>
                    </div>
                </div>
                <div className="lg:hidden flex flex-row gap-1 border border-primary rounded-md shadow-md bg-white font-text text-primary text-xs justify-between p-1 h-fit my-2">
                    <div className={`w-full h-fit flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out ${tab === "content" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`} onClick={()=> {
                        if(fetching) return
                        setFetching(true),
                        setTab("content")}}>
                        Course Management
                    </div>
                    <div className={`w-full h-fit flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out ${tab === "journey" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`}
                        onClick={()=> {
                            if(fetching) return
                            setFetching(true),
                            setTab("journey")}}>
                        Learning Journey
                    </div>
                    <div className={`w-full h-fit flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out whitespace-nowrap ${tab === "certificates" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`}
                        onClick={()=> {
                            if(fetching) return
                            setFetching(true),
                            setTab("certificates")}}>
                        Certificates
                    </div>
                </div>
                <div className="
                                lg:col-span-3 lg:pl-2">
                    {
                        tab === "content" ?
                        <CourseManagement type={courseType} setType={setCourseType} sort={sort} setSort={setSort} courses={contentItem} fetching={fetching}/>
                        :tab === "journey" ?
                        <LearningJourney type={courseDuration} setType={setCourseDuration} sort={sort} setSort={setSort} courses={contentItem} fetching={fetching}/>
                        : null
                    }
                </div>

                <div className="pt-2 pb-5 flex flex-row justify-between lg:col-span-3 lg:pl-2">
                    <div className={`flex flex-row ${!fetching && contentItem.length === 0 ? "hidden" : ""}`}>
                        {
                            fetching ? <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-unactive"/>
                                <p className="font-text text-unactive text-xs">Fetching Items....</p>
                                </>
                            : <p className='text-sm font-text text-unactive'>
                                Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalItem}</span> <span className='text-primary'>results</span>
                            </p>
                        }
                    </div>
                    <div className={`${!fetching && contentItem.length === 0 ? "hidden":""}`}>
                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                            {/* Previous */}
                            <a
                                onClick={back}
                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </a>

                            {/* Current Page & Dynamic Paging */}
                            {
                                fetching ? (
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
            <AccountSettingModal open={open} close={()=>{setOpen(false)}} user={user}/>
        </>
    )

}


