import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import { faPlus, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import CreateCategoryModal from "MBLearn/src/modalsandprops/AuthoringTool/CreateCategoryModal";
import CreateCourseModal from "MBLearn/src/modalsandprops/AuthoringTool/CreateCourseModal";
import { useNavigate, useParams } from "react-router";
import { useFormik } from "formik"
import { useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext";
import { use } from "react";
import axiosClient from "MBLearn/src/axios-client";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { set } from "date-fns";
import { array } from "zod";
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { useCategories } from "MBLearn/src/contexts/CategoriesFetchContext";
import noImagePlaceholder from 'MBLearn/src/assets/no_image_placeholder.png';
import globalSearch from "MBLearn/src/components/lib/globalSearch";

export default function ContentHub() {
    const navigate = useNavigate()
    const {category} = useParams()
    const {setPageTitle, setShowBack, user} = useStateContext();

    const { categories, getCategories } = useCategories();
    const [loading, setLoading] = useState(false);

    const [createCourse, setCreateCourse] = useState(false);

    const [tab, setTab] = useState(category ? category : "all");
    const [option, setOption] = useState("all");
    const [courses, setCourses] = useState([]);

    setPageTitle("CONTENT HUB"); // Set the page title for the dashboard
    setShowBack(false); // Hide the back button on the dashboard

    // const fetchCourse = () => {
    //     setLoading(true);
    //     axiosClient.get('/fetchCourse')
    //     .then(({data}) => {
    //         setLoading(false);
    //         setCourse(data)
    //     }).catch((error) => {
    //         console.log("The Error: ", error);
    //     })
    // },
    // We will be using "/createCourse" to fetch the user along with the created course
    const [imageUrl, setImageUrl] = useState(null);

    const fetchUser2 = () => {
        setLoading(true);
        axiosClient.get('/createCourse').then(({data}) => {
            console.log("The Data: ", data);
            setCourses(data);
            setImageUrl(data.ImagePath);
            setLoading(false);
        }).catch((error) => {
            console.log("The Error: ", error);
        })
    }

    const fetchSharedCourses = () => {
        setLoading(true);
        axiosClient.get('/sharedCourses')
        .then(({ data }) => {
            setCourses(data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
        });
    }

    console.log("shared?", courses)

    useEffect(() => {
        setLoading(true);
        setCourses([]);

        if (option === "shared") {
            fetchSharedCourses();
            getCategories("shared");
        } else {
            fetchUser2();
            getCategories("all");
        }
    }, [option]);


    useEffect(()=>{
        // console.log("categories:" + )
        // console.log("courses:" + )

        if(courses.length !== 0 && categories.length !== 0)
            {
                setLoading(false)
            }
    },[categories, courses])


    const filteredCourses = tab === "all" 
        ? courses 
        : courses.filter(course => course.category.category_name === tab);

        console.log("check this out yo 2", filteredCourses);
    const filteredSharedCourse = tab === "shared" 
        ? courses 
        : courses.filter(course => course.category.category_name === tab);
        
    /// --------------------
    /// Search Courses
    /// --------------------
    const { results, loading: searchLoading, search } = globalSearch('/searchContentHubCourses');

    useEffect(() => {
        setCourses(results);
    }, [results]);

    const courseSearch = useFormik({
        initialValues: { search: '' },
        onSubmit: (values) => {
            search({ search: values.search, option });
        },
    });

    const handleSearchChange = (e) => {
        courseSearch.handleChange(e);
        search({ search: e.target.value, option });
    };

    return (
        <>
            <Helmet>
                <title>CompELearn | Content Hub</title>
            </Helmet>
            <div className="grid h-full w-full grid-cols-4 grid-rows-[min-content_1fr] gap-2">
                {/* Headers */}
                <div className="col-span-1 ">
                    <Select value={option} onValueChange={setOption} className="w-full">
                        <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white text-base`}>
                            <SelectValue placeholder="Select Content" />
                        </SelectTrigger>
                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            <SelectItem value="all">My Content</SelectItem>
                            <SelectItem value="shared">Shared Content</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <form onSubmit={courseSearch.handleSubmit} className="col-span-2 flex flex-row justify-between items-center border-divider gap-2">
                    <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name="search"
                            value={courseSearch.values.search}
                            onChange={handleSearchChange}
                        />
                        <button type="submit" className="bg-primary py-2 px-4 text-white">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                </form>
                <div className="mr-4">
                    {option !== "shared" && (
                        <div
                            className="px-4 py-2 gap-3 h-full flex flex-row w-full items-center justify-between rounded-md text-white bg-primary hover:bg-primaryhover cursor-pointer transition-all ease-in-out"
                            onClick={() => setCreateCourse(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-white" />
                            <p className="font-header text-white">Create Course</p>
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="col-span-1 row-start-2 flex flex-col gap-2">
                    <p className="font-text text-unactive text-xs">Categories</p>
                    <ScrollArea className="h-[calc(100vh-10.8rem)] border border-divider rounded-md bg-white">
                        <div className="h-full rounded-md p-4 flex flex-col gap-2">
                            {
                                loading ?
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-14 w-full border rounded-md text-primary font-text text-sm animate-pulse shadow-md"/>

                                ))
                                : courses.length === 0 ?
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
                                        onClick={() => {setTab(item.category_name)}}>
                                            {item.category_name}
                                        </div>
                                    ))
                                    }
                                </>
                            }
                        </div>
                    </ScrollArea>
                </div>

                {/* Contents */}
                <div className={`col-span-3 mr-4 row-start-2 flex flex-col gap-2 ${tab === "shared" ? "col-span-4" : ""}`}>
                    <ScrollArea className="h-[calc(100vh-9.4rem)] border border-divider rounded-md bg-white p-4">
                        <div className="w-full grid grid-cols-3 gap-2 ">
                            {
                                searchLoading ?
                                Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="shadow-md h-40 border rounded-md flex flex-col animate-pulse">
                                    <div className="bg-gray-400 rounded-t-md h-full"/>
                                    <div className="p-2 flex flex-col gap-1">
                                        <div className="h-5"/>
                                    </div>
                                </div>
                                )):
                                filteredCourses.length === 0 ?
                                <div className="h-[calc(100vh-12rem)] w-full border col-span-3 flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 text-primary bg-primarybg rounded-full items-center justify-center flex mb-4">
                                        <FontAwesomeIcon icon={faXmark} className="text-5xl" />
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <p className="text-primary font-header text-2xl">No Course yet</p>
                                        <p className="text-xs">There is no course created, click add course to start developing future</p>
                                    </div>
                                </div>
                                :
                                filteredCourses.map((item,index)=>(
                                    <div key={index} className="shadow-md h-40 border rounded-md flex flex-col relative hover:cursor-pointer"
                                    onClick={()=>{navigate(`/SubjectMatterExpert/coursecreation/${item.id}`); setCourses(item)}}>
                                            <div className="h-full w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md">
                                                <img
                                                    src={item.ImagePath ? item.ImagePath : noImagePlaceholder}
                                                    alt=""
                                                    className="w-full h-full"
                                                />
                                            </div>
                                       <div className="absolute h-full w-full text-white rounded-md bg-gradient-to-b from-transparent to-black p-4 flex flex-col justify-between">
                                        <div
                                            className={`px-4 py-2 flex items-center justify-center w-fit rounded-md border ${
                                            item.CourseStatus === "reviewed" && item.course_review?.some(review => review.approval_status === "rejected")
                                                ? "border-red-500 text-red-500"
                                                : "border-white text-white"
                                            }`}
                                        >
                                            <p className="font-text text-xs">
                                            {
                                                item.CourseStatus === "created" ? "Created" :
                                                item.CourseStatus === "for_approval" ? "For Approval" :
                                                item.CourseStatus === "ondevelopment" ? "On-Progress" :
                                                item.CourseStatus === "reviewed" && item.course_review?.some(review => review.approval_status === "rejected") ? "Rejected" : null
                                            }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-text text-xs text-white">{item.CourseID}</p>
                                            <p className="font-header text-sm">
                                            {item.CourseName} <span className="font-text text-xs">({item.category.category_name} - {item.career_level.name})</span>
                                            </p>
                                        </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Modals */}
            {/* <CreateCategoryModal open={createCategory} close={()=>{setCreateCategory(false)}}/> */}
            <CreateCourseModal open={createCourse} close={()=>{setCreateCourse(false)}}
                getCategories={getCategories} 
                fetchUser2={fetchUser2}    
            />
        </>
    )
}
