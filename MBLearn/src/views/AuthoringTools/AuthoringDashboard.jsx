import { faArrowUpRightFromSquare, faXmark, faBook, faBookBookmark, faClock, faEye, faFilePen, faHourglassStart, faPenNib, faPersonChalkboard, faSearch, faShapes, faShareFromSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosClient from "MBLearn/src/axios-client";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import SuccessModal from "MBLearn/src/modalsandprops/AuthoringTool/SuccessModal";
import WarningModal from "MBLearn/src/modalsandprops/AuthoringTool/WarningModals";
import AnnouncmentCarousel from "MBLearn/src/modalsandprops/dashboardComponents/AnnouncementCarousel";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ViewerDashboard } from "./ViewerDashboard";
import { DistributorDashboard } from "./DistributorDashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import { useFormik } from "formik";
import { Loader } from "lucide-react";
import noImagePlaceholder from 'MBLearn/src/assets/no_image_placeholder.png';
import globalSearch from "MBLearn/src/components/lib/globalSearch";

export default function AuthoringDashboard() {
    const {setPageTitle, setShowBack, user, role} = useStateContext();
    const AnnouncementSize = useRef();
    const [announcementHeight, setAnnouncementHeight] = useState(0);
    //const {categories} = useAuthoringTool();

    useEffect(()=>{
        if(!AnnouncementSize.current)return;

        const updatesize = () => {
            const rect = AnnouncementSize.current.getBoundingClientRect();
            setAnnouncementHeight(rect.height/16);
        }

        updatesize();

        const observer = new ResizeObserver(updatesize);
        observer.observe(AnnouncementSize.current);

        return () => observer.disconnect();
    },[])

    setPageTitle("DASHBOARD"); // Set the page title for the dashboard
    setShowBack(false); // Hide the back button on the dashboard

    // Axios Client Call
    // axiosClient.get('/dashboard') yung link yan that method
    // .then((response) => {
    //     console.log(response.data); ito namn response for the state or function na need i trigger, mostly lalagay ko lang dyan is loading states pero bala na kayo
    // })
    // .catch((error) => {console.error(error); }); // custom error handling
    const navigate = useNavigate();

    /// --------------------
    /// Fetch Dashboard Data
    /// --------------------
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [recent, setRecent] = useState([]);
    const [stats, setStats] = useState([]);
    const [content, setContent] = useState([]);

    // console.log("check this out yo", content);
    const pageRef = useRef(1);

    const fetchDashboardData = async () => {
        try {
            const [contentRes, recentRes, categoriesRes, statsRes] = await Promise.all([
                axiosClient.get('/fetchAllContent?page=1&limit=12'),
                axiosClient.get('/recentOpenedCourses'),
                axiosClient.get('/getCategories/created'),
                axiosClient.get('/courseStats'),
            ]);

            setContent(contentRes.data.data);
            setRecent(recentRes.data);
            setCategories(categoriesRes.data);
            setStats(statsRes.data);
            pageRef.current = 2;
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role !== "SME-Creator") return;
        fetchDashboardData();
    }, [role]);


    /// --------------------
    /// For Infinity Scrolling
    /// --------------------
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
    const { results: searchResults, loading: searchLoading, search } = globalSearch('/searchDashboardCourses');
    const loadingRef = useRef(false);

    const fetchMoreContent = async () => {
        if (loadingRef.current || searchLoading || !hasMore) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const currentPage = pageRef.current;
            const res = await axiosClient.get(`/fetchAllContent?page=${currentPage}&limit=12`);
            const { data: newContent, current_page, last_page } = res.data;

            setContent(prev => [...prev, ...newContent]);

            if (current_page >= last_page) {
                setHasMore(false);
            }
// console.log("Page:", currentPage);
// console.log("New content:", newContent.map((item) => item.id)); // or item.title
            pageRef.current = currentPage + 1;
        } catch (err) {
            console.error("Error fetching more content:", err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };


    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loadingRef.current) {
                    fetchMoreContent();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5,
            }
        );

        const currentLoader = loader.current;
        if (currentLoader) observer.observe(currentLoader);

        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        };
    }, [hasMore]);


    /// --------------------
    /// Search Courses
    /// --------------------
    const [searchedCourse, setSearchedCourse] = useState("");
    const maxLength = 50;
    const allowedRegex = /^[a-zA-Z0-9 ]*$/;

    const handleSearchChange = (e) => {
        const value = e.target.value;

        if (value.length <= maxLength && allowedRegex.test(value)) {
            setSearchedCourse(value);

            search({ search: value });
        }
    };
    useEffect(() => {
        if (searchedCourse.trim() === "") {
            // Reset content or fetch initial content if search input is empty
            fetchDashboardData();
            setHasMore(true);
            pageRef.current = 1;
        } else {
            setContent(searchResults);
            setHasMore(false);
            pageRef.current = 1;
        }
    }, [searchResults, searchedCourse]);


    /// --------------------
    /// Navigate to Content Banlk
    /// --------------------
    const handleClick = (selectedStatus) => {
        navigate(`/SubjectMatterExpert/contentBank?status=${selectedStatus}`);
    };

    return (
        <>
            <Helmet>{/* Title of the mark-up */}
                <title>CompELearn | Dashboard</title>
            </Helmet>
            {
                user?.user_infos.roles?.[0].role_name === "SME-Creator" ?
                <div className="grid h-full w-full grid-cols-4 grid-rows-[min-content_1fr] gap-2">
                    {/* Content */}
                    <div className="col-span-3 flex flex-col gap-2">
                        <div className="flex flex-row items-center justify-between gap-2">
                            {
                                loading ?
                                // true ?
                                Array.from({length: 4}).map((_,index) => (
                                    <div key={index} className="border bg-white h-20 rounded-md flex items-center justify-between shadow-md animate-pulse w-full"/>
                                ))
                                :
                                <>
                                <div className="border-primary border-2 bg-white shadow-md p-3 w-full rounded-md flex flex-col gap-1 cursor-pointer transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transition-colors duration-300 hover:bg-blue-100"
                                    onClick={() => handleClick('all')}
                                >
                                    <p className="font-text text-xs">My Total Courses</p>
                                    <div className="font-header text-2xl flex flex-row gap-2 items-center text-primary">
                                        <FontAwesomeIcon icon={faBook} />
                                        <p>{stats.total_courses} <span className="text-xs font-text">course</span></p>
                                    </div>
                                </div>
                                <div className="border-primary border-2 bg-white shadow-md p-3 w-full rounded-md flex flex-col gap-1 cursor-pointer transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transition-colors duration-300 hover:bg-blue-100"
                                    onClick={() => handleClick('draft')}
                                >
                                    <p className="font-text text-xs">For Review Course</p>
                                    <div className="font-header text-2xl flex flex-row gap-2 items-center text-yellow-500">
                                        <FontAwesomeIcon icon={faPenNib} />
                                        <p>{stats.review} <span className="text-xs font-text">course</span></p>
                                    </div>
                                </div>
                                <div className="border-primary border-2 bg-white shadow-md p-3 w-full rounded-md flex flex-col gap-1 cursor-pointer transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transition-colors duration-300 hover:bg-blue-100"
                                    onClick={() => handleClick('reviewed')}
                                >
                                    <p className="font-text text-xs">Reviewed Courses</p>
                                    <div className="font-header text-2xl flex flex-row gap-2 items-center text-orange-700">
                                        <FontAwesomeIcon icon={faThumbsUp} />
                                        <p>{stats.reviewed} <span className="text-xs font-text">course</span></p>
                                    </div>
                                </div>
                                <div className="border-primary border-2 bg-white shadow-md p-3 w-full rounded-md flex flex-col gap-1 cursor-pointer transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transition-colors duration-300 hover:bg-blue-100"
                                    onClick={() => handleClick('published')}
                                >
                                    <p className="font-text text-xs">Published Courses</p>
                                    <div className="font-header text-2xl flex flex-row gap-2 items-center text-green-900">
                                        <FontAwesomeIcon icon={faPersonChalkboard} />
                                        <p>{stats.published_courses} <span className="text-xs font-text">course</span></p>
                                    </div>
                                </div>
                                </>
                            }
                        </div>
                    </div>
                    <div className="row-span-2 flex flex-col gap-2 ">
                        <div className="flex flex-col justify-between items-left">
                            <div className="flex flex-row gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-primary text-xl"/>
                                <p className="font-header text-primary">Recently Modified</p>
                            </div>
                            <div>
                                <p className="font-text text-xs text-unactive">List of recently edited or view own courses</p>
                            </div>
                        </div>
                        <div className="mb-4 mr-4">
                            <ScrollArea className="border border-divider rounded-md bg-white shadow-md w-full h-[calc(100vh-9.5rem)]">
                                <div className="p-4 flex flex-col gap-2 ">
                                    {
                                        loading ?
                                        Array.from({length: 3}).map((_,index) => (
                                            <div key={index} className="border h-20 rounded-md flex items-center justify-between shadow-md animate-pulse"/>
                                        ))
                                        :
                                        recent.map((item, index) => (
                                            <div key={index} className="border border-primary p-4 rounded-md flex flex-col shadow-md gap-1 group hover:bg-primary hover:cursor-pointer transition-all ease-in-out"
                                                onClick={() => navigate(`/SubjectMatterExpert/coursecreation/${item.course_id}`)}>
                                                <span className="text-xs p-1 border-primary border bg-primarybg w-fit rounded-md text-primary group-hover:bg-gray-500 group-hover:border-white group-hover:text-white">{item?.trainingType?.charAt(0).toUpperCase()}{item?.trainingType?.slice(1)}</span>
                                                <p className="font-header text-primary group-hover:text-white text-sm">{item.courseName}</p>
                                                <p className="font-text text-xs text-unactive group-hover:text-white">{item.category}-{item.careerLevel} </p>
                                                <p className="pt-2 text-xs text-unactive group-hover:text-white">{item.last_opened_at}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <div className="col-span-3 ">
                        <div className="py-2 grid grid-cols-4 gap-2" >
                            <div className="flex flex-col gap-1 col-span-2">
                                <div className="flex flex-row gap-2 items-center text-xl">
                                    <FontAwesomeIcon icon={faShapes} className="text-primary"/>
                                    <p className="font-header text-primary">All Content</p>
                                </div>
                                <p className="text-xs text-unactive">List down all recent content that is on development and completed</p>
                            </div>
                            <div className="col-span-2">
                                <form className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full' 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        search({ search: searchedCourse });
                                    }}>
                                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                                        name="search"
                                        onChange={handleSearchChange}
                                        value={searchedCourse}
                                    />
                                    <button type="submit" className="bg-primary py-2 px-4 text-white">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </form>
                            </div>
                        </div>
                       <ScrollArea className="border border-divider rounded-md bg-white shadow-md w-full h-[calc(100vh-15.9rem)]">
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchLoading ? 
                                    Array.from({ length: 6 }).map((_, index) =>
                                        <div
                                        key={index}
                                        className="border bg-white h-40 rounded-md flex items-center justify-between shadow-md animate-pulse w-full"
                                        />
                                    )
                                    : content.length === 0 ?
                                    <div className="h-[calc(100vh-12rem)] w-full border col-span-3 flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 text-primary bg-primarybg rounded-full items-center justify-center flex mb-4">
                                        <FontAwesomeIcon icon={faXmark} className="text-5xl" />
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center">
                                        <p className="text-primary font-header text-2xl">No Course</p>
                                        <p className="text-xs">
                                            There is no course. . .
                                        </p>
                                        </div>
                                    </div>
                                : 
                                    content.map((item, index) => (
                                        <div
                                            key={index}
                                            className="shadow-md h-40 border rounded-md flex flex-col relative hover:cursor-pointer overflow-hidden"
                                            onClick={() => {
                                                if (item.CourseStatus === "created") {
                                                    navigate(`/SubjectMatterExpert/coursecreation/${item.id}`);
                                                } else {
                                                    navigate(`/SubjectMatterExpert/preview/${item.id}`);
                                                }
                                            }}

                                        >
                                            <div className="h-full w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md">
                                            <img
                                                src={item.ImagePath ? item.ImagePath : noImagePlaceholder}
                                                alt="Course Thumbnail"
                                                className="w-full h-full"
                                            />
                                            </div>
                                            <div className="absolute h-full w-full text-white rounded-md bg-gradient-to-b from-transparent to-black p-4 flex flex-col justify-between">
                                                <div className="px-4 py-2 flex items-center justify-center border border-white w-fit rounded-md">
                                                    <p className="font-text text-xs">
                                                        {item.CourseStatus === "created"
                                                            ? "Created"
                                                            : item.CourseStatus === "ondevelopment"
                                                            ? "On-Progress"
                                                            : item.CourseStatus === "draft"
                                                            ? "For Review"
                                                            : item.CourseStatus === "inactive"
                                                            ? "Inactive"
                                                            : item.CourseStatus === "reviewed"
                                                            ? "Reviewed"
                                                            : item.CourseStatus === "review"
                                                            ? "For Approval"
                                                            : item.CourseStatus === "published"
                                                            ? "Published"
                                                            : item.CourseStatus === "distributed"
                                                            ? "Distributed"
                                                            : item.CourseStatus === "archived"
                                                            ? "Archived"
                                                            : item.CourseStatus === "deleted"
                                                            ? "Deleted"
                                                            : item.course_review?.approval_status === "rejected"
                                                            ? "Rejected"
                                                            : item.course_review?.approval_status === "approved"
                                                            ? "Approved"
                                                            : null}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-text text-xs text-white">{item.CourseID}</p>
                                                    <p className="font-header text-sm">
                                                        {item.CourseName}{" "}
                                                        <span className="font-text text-xs">
                                                            ({item.category.category_name} - {item.career_level.name})
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                {!searchLoading && hasMore && searchedCourse === "" && (
                                <div ref={loader} className="col-span-full flex justify-center items-center h-24">
                                    <p className="text-sm text-gray-500">Loading Courses...</p>
                                </div>
                                )}
                            </div>
                        </ScrollArea>

                    </div>
                </div>
                :
                user?.user_infos.roles?.[0].role_name === "SME-Approver" ?
                <ViewerDashboard/>
                :  user?.user_infos.roles?.[0].role_name === "SME-Distributor" ?
                <DistributorDashboard/>
                :null
            }
        </>
    );
}
