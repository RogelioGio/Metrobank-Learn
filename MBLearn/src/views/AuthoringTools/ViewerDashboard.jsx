import { faBookBookmark, faFileCircleXmark, faFilePen, faHourglass, faHourglass2, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosClient from "MBLearn/src/axios-client";
import { useFormik } from "formik"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import { useOption } from "MBLearn/src/contexts/AddUserOptionProvider";
import useAssignmentUpdates from "MBLearn/src/modalsandprops/AuthoringTool/hooks/useAssignmentUpdates";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

export function ViewerDashboard() {

    const {setPageTitle, user} = useStateContext();
    setPageTitle("COURSE DASHBOARD");

    const {setCourse} = useCreateCourse();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [dept, setDept] = useState();
    const [tab, setTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([])

    console.log(categories);
    const filteredCourses = tab === "all"
        ? courses
        : courses.filter(course => course.category_id === tab);

    const getCategoroies = () => {
        setLoading(true)
        axiosClient.get("/getCategories/draft").then(({data})=>{
            setCategories(data)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }

    const getPending = () => {
        axiosClient.get("/toReview").then(({data})=>
            {
                setCourses(data)
                console.log(data)
            }
        )
    }

    const [searchedCourse, setSearchedCourse] = useState("");

    const courseSearch = useFormik({
        initialValues: { search: ''},
        onSubmit: (values) => {
            // console.log("asdzxc", values);
            setLoading(true);
            axiosClient.get('/searchViewerCourses', { params: values })
            .then(({ data }) => {
                // console.log("123123123123123213zxc",data);
                setCourses(data);
                setLoading(false);
                setSearchedCourse(values.search);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
        }
    });

    console.log(categories);

    const [reviewCounts, setReviewCounts] = useState({
        toBeReviewed: 0,
        approved: 0,
        rejected: 0,
        published: 0
    });
    const getCourseReviewStatus = () => {
        axiosClient.get('/getCourseReviewStatus')
            .then(({ data }) => {
                setReviewCounts({
                    toBeReviewed: data.toBeReviewed.length,
                    approved: data.approved.length,
                    rejected: data.rejected.length,
                    published: data.published.length,
                });
                // console.log("asd",data);
            })
            .catch(err => {
                console.error('Error fetching course review status:', err);
            });
    };
    useEffect(()=>{
        getCourseReviewStatus()
        getCategoroies()
        getPending()
    },[])

    // console.log("asdasdasd", courses);

    /// --------------------
    /// Navigate to Content Banlk
    /// --------------------
    const handleClick = (selectedStatus) => {
        navigate(`/SubjectMatterExpert/contentBank?status=${selectedStatus}`);
    };

    /// --------------------
    /// Real Time Update for Course Assignment
    /// --------------------
    const refetchCourses = useCallback(() => {
        // console.log('refetchCourses called!');
        getPending();
        getCategoroies();
        getCourseReviewStatus();
    }, []); 
    // console.log("userInfoId from user context:", user?.user_infos?.id);

    useAssignmentUpdates(user?.user_infos?.id, refetchCourses);

    return <div className="grid grid-cols-4 gap-2 grid-rows-[min-content_min-content_1fr] mr-4">
        <div className="w-full bg-white rounded-md shadow-md border-primary border-2 p-4 flex flex-col gap-2 cursor-pointer transition-transform transition-shadow transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100"
            onClick={() => handleClick('pending')}
        >
            <p className="text-xs text-primary">To be Reviewed</p>
            <div className="flex flex-row gap-2 text-3xl items-center font-header text-yellow-600">
                <FontAwesomeIcon icon={faHourglass2}/>
                <p>{reviewCounts.toBeReviewed} <span className="font-text text-xs">courses</span></p>
            </div>
        </div>

        <div className="w-full bg-white rounded-md shadow-md border-primary border-2 p-4 flex flex-col gap-2 cursor-pointer transition-transform transition-shadow transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100"
            onClick={() => handleClick('approved')}
        >
            <p className="text-xs text-primary">Approved</p>
            <div className="flex flex-row gap-2 text-3xl items-center font-header text-green-800">
                <FontAwesomeIcon icon={faBookBookmark}/>
                <p>{reviewCounts.approved} <span className="font-text text-xs">courses</span></p>
            </div>
        </div>

        <div className="w-full bg-white rounded-md shadow-md border-primary border-2 p-4 flex flex-col gap-2 cursor-pointer transition-transform transition-shadow transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100"
            onClick={() => handleClick('rejected')}
        >
            <p className="text-xs text-primary">Rejected</p>
            <div className="flex flex-row gap-2 text-3xl items-center font-header text-red-600">
                <FontAwesomeIcon icon={faFileCircleXmark}/>
                <p>{reviewCounts.rejected} <span className="font-text text-xs">courses</span></p>
            </div>
        </div>

        <div className="w-full bg-white rounded-md shadow-md border-primary border-2 p-4 flex flex-col gap-2 cursor-pointer transition-transform transition-shadow transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100"
            onClick={() => handleClick('published')}
        >
            <p className="text-xs text-primary">Published</p>
            <div className="flex flex-row gap-2 text-3xl items-center font-header text-primary">
                <FontAwesomeIcon icon={faFilePen}/>
                <p>{reviewCounts.published} <span className="font-text text-xs">courses</span></p>
            </div>
        </div>
<form className="contents" onSubmit={courseSearch.handleSubmit}>
        <div className="col-start-4">
            <div className="col-span-2 flex flex-row justify-between items-center border-divider gap-2">
                <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                        name="search"
                        onChange={courseSearch.handleChange}
                        value={courseSearch.values.search}
                    />
                    <div className='bg-primary py-2 px-4 text-white'>
                        <FontAwesomeIcon icon={faSearch}/>
                    </div>
                </div>
            </div>
        </div>
</form>
        <div className="col-span-1 row-start-2 row-span-2 flex flex-col gap-2">
            <p className="font-text text-unactive text-xs">Categories</p>
            <ScrollArea className="h-[calc(100vh-14.2rem)] border border-divider rounded-md bg-white">
                <div className="h-full rounded-md p-4 flex flex-col gap-2">
                    {
                        categories.length === 0 ?
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-14 w-full border rounded-md text-primary font-text text-sm animate-pulse shadow-md"/>

                        ))
                        : false ?
                        <div className="h-[calc(100vh-13rem)] w-full text-unactive flex flex-col items-center justify-center">
                            <div className="w-24 h-24 text-primary bg-primarybg rounded-full items-center justify-center flex mb-4">
                                <FontAwesomeIcon icon={faXmark} className="text-5xl" />
                            </div>
                            <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-primary font-header text-2xl">No Course yet</p>
                                <p className="text-xs">There is no course created, click add course to start developing future</p>
                            </div>
                        </div>
                        :
                        <>
                            <div className={`p-2 border-2 border-primary rounded-md text-primary font-text text-sm hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${"all" === tab ? "bg-primary text-white":""}`}
                                onClick={() => {setTab("all")}}>
                                All Courses
                            </div>
                        {
                            categories.map((item,index)=>(
                                <div key={index} className={`p-2 border-2 border-primary rounded-md text-primary font-text text-sm hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out ${item.category_name === tab ? "bg-primary text-white":""}`}
                                onClick={() => {setTab(item.id)}}>
                                    {item.category_name}
                                </div>
                            ))
                        }
                        </>

                    }
                </div>
            </ScrollArea>
        </div>

        <div className="col-span-3 ">
            <ScrollArea className="h-[calc(100vh-16rem)] border border-divider rounded-md bg-white p-4">
                <div className="w-full grid grid-cols-3 gap-2 ">
                    {
                        loading ?
                        Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="shadow-md h-40 border rounded-md flex flex-col animate-pulse">
                            <div className="bg-gray-400 rounded-t-md h-full"/>
                            <div className="p-2 flex flex-col gap-1">
                                <div className="h-5"/>
                            </div>
                        </div>
                        )):
                        filteredCourses.length === 0 ?
                        <div className="h-[calc(100vh-16.9rem)] w-full col-span-3 flex flex-col items-center justify-center">
                            <div className="w-24 h-24 text-primary bg-primarybg rounded-full items-center justify-center flex mb-4">
                                <FontAwesomeIcon icon={faXmark} className="text-5xl" />
                            </div>
                            <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-primary font-header text-2xl">No Course yet</p>
                                <p className="text-xs">There is no course to be reviewed</p>
                            </div>
                        </div>
                        :
                        filteredCourses.map((item,index)=>(
                            <div key={index} className="shadow-md h-40 border rounded-md flex flex-col relative hover:cursor-pointer"
                                onClick={()=>{navigate(`/SubjectMatterExpert/preview/${item.id}`); setCourse(item)}}>
                                    <div className="h-full w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md">
                                        <img  src={`${item.ImagePath}`} alt="" className="w-full h-full" />
                                    </div>
                                    {/* <div className="py-2 px-4 flex flex-col gap-2 text-sm">
                                        <p>{item.CourseName}</p>
                                    </div> */}

                                    <div className="absolute h-full w-full text-white rounded-md bg-gradient-to-b from-transparent to-black p-4 flex flex-col justify-between">
                                        <div className="px-4 py-2 flex items-center justify-center border border-white w-fit rounded-md">
                                            <p className="font-text text-xs">
                                                {item.CourseStatus === "created" ? "Created"
                                                : item.CourseStatus === "ondevelopment" ? "On-Progress"
                                                : item.CourseStatus === "draft" ? "For Review" : null}</p>
                                        </div>
                                        <div className="">
                                            <p className="font-text text-xs text-white">{item.CourseID}</p>
                                            <p className="font-header text-sm">{item.CourseName}</p>
                                        </div>
                                    </div>
                                </div>
                        ))
                    }
                </div>
            </ScrollArea>
        </div>



    </div>
}

