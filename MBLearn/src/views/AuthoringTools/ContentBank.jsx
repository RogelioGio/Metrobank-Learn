import axiosClient from "MBLearn/src/axios-client";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { useNavigate } from "react-router";
import FontAwesome from "react-fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark, faCog, faC } from "@fortawesome/free-solid-svg-icons";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { useFormik } from "formik"
import DeletedCourseSettingsModal from "MBLearn/src/modalsandprops/AuthoringTool/DeletedCourseSettingsModal";
import noImagePlaceholder from 'MBLearn/src/assets/no_image_placeholder.png';
import globalSearch from "MBLearn/src/components/lib/globalSearch";

export default function ContentBank() {
    const {setPageTitle, setShowBack, user, role} = useStateContext();
    const [courses, setCourses] = useState([]);
    const params = new URLSearchParams(location.search);
    const urlStatus = params.get("status");
  

    const [option, setOption] = useState(() => {
        if (urlStatus) return urlStatus;
        if (role === "SME-Creator") return "all";
        if (role === "SME-Approver") return "pending";
        if (role === "SME-Distributor") return "published";
        return "draft";
    });

    useEffect(() => {
        courseSearch.setFieldValue('status', option);
    }, []);

    const handleValueChange = (val) => {
          console.log("handleValueChange called with:", val);
        setOption(val);
        courseSearch.setFieldValue('status', val);

        const params = new URLSearchParams(location.search);
        params.set("status", val);

        navigate({ search: params.toString() }, { replace: true });
    };
    

    const [showDeletedSettings, setShowDeletedSettings] = useState(false);

    // console.log("user: ", user.user_infos.roles[0].role_name)
    // console.log("role", role)
    const [loading, setLoading] = useState(false);
    const {setCourse} = useCreateCourse();
    const navigate = useNavigate();
    const [tab, setTab] = useState("all");
    
    const [categories, setCategories] = useState([]);


    setPageTitle("CONTENT BANK")

    useEffect(() => {
        setLoading(true);
        axiosClient.get(`/getCategories/${option}`)
        .then(({ data }) => {
            console.log("search", option);
            setCategories(data);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
        });
    }, [option]);

    useEffect(() => {
        setLoading(true);
        axiosClient.get(`/getCourse/${option}`)
        .then(({ data }) => {
            setCourses(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching courses:", error);
            setLoading(false);
        });
    }, [option]);

    /// --------------------
    /// Search Courses
    /// --------------------
    const searchEndpoint = role === 'SME-Approver'
        ? '/searchContentBankCourses/viewer'
        : role === 'SME-Creator'
            ? '/searchContentBankCourses/creator'
            : role === 'SME-Distributor'
                ? '/searchContentBankCourses/distributor'
                : null ;

    const { results, loading: searchLoading, search } = globalSearch(searchEndpoint);

    const [searchedCourse, setSearchedCourse] = useState("");
    const courseSearch = useFormik({
        enableReinitialize: true,
        initialValues: { search: '', status: option },
        onSubmit: (values) => {
            search(values);
        },
    });

    useEffect(() => {
        if (searchedCourse.trim() === "") {
            setLoading(true);
            axiosClient.get(`/getCourse/${option}`)
            .then(({ data }) => {
                setCourses(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [option, searchedCourse]);

    useEffect(() => {
        if (searchedCourse.trim() !== "") {
            setCourses(results);
        }
        }, [results, searchedCourse]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchedCourse(value);

        if (value.trim() === "") {
            setCourses([]);
        }
        search({ search: value, status: option });
    };

    const filteredCourses = tab === "all"
        ? courses
        : courses.filter(course => course.category && course.category.category_name === tab);

        console.log("test na maangas", filteredCourses);
        // console.log("test2", courses);

    function getHardDeleteDate(settingsUpdatedAt, retentionValue, retentionUnit) {
        if (!settingsUpdatedAt) return null;

        const baseDate = new Date(settingsUpdatedAt.replace(" ", "T"));
        if (isNaN(baseDate)) return null;

        const resultDate = new Date(baseDate);

        switch (retentionUnit.toLowerCase()) {
            case 'days':
            resultDate.setDate(resultDate.getDate() + retentionValue);
            break;
            case 'weeks':
            resultDate.setDate(resultDate.getDate() + retentionValue * 7);
            break;
            case 'months':
            resultDate.setMonth(resultDate.getMonth() + retentionValue);
            break;
            case 'years':
            resultDate.setFullYear(resultDate.getFullYear() + retentionValue);
            break;
            default:
            return baseDate;
        }

        return resultDate;
    }

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d)) return "Invalid date";

        // Array of short month names
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const month = months[d.getMonth()];
        const day = d.getDate();
        const year = d.getFullYear();

        return `${month} ${day} ${year}`;
    };

    return (
        <>
            <Helmet>{/* Title of the mark-up */}
                <title>CompELearn | Content Bank</title>
            </Helmet>
            <div className="w-full h-full grid grid-cols-4 grid-rows-[min-content_1fr] pb-4 pr-4 gap-2">
                <form className="contents" onSubmit={courseSearch.handleSubmit}>
                    <div className="col-span-1 ">
                    <Select value={option} onValueChange={handleValueChange} className="w-full">
                        <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white text-base">
                            <SelectValue placeholder="Select Content" />
                        </SelectTrigger>

                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            {role === "SME-Creator" ? (
                            <>
                                <SelectItem value="all">All Courses</SelectItem> 
                                <SelectItem value="draft">For Review</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                            </>
                            ) : role === "SME-Approver" ? (
                            <>
                                <SelectItem value="pending">To Be Reviewed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </>
                            ) : role === "SME-Distributor" ? (
                            <>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="distributed">Distributed</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </>
                            ) : null}
                        </SelectContent>
                    </Select>
                    </div>
                    <div className={`col-span-3 flex flex-row items-center border-divider gap-2 col-start-2 ${option === "deleted" ? "justify-between" : "justify-end"}`}>
                        {option === "deleted" && 
                            <div className="group border-2 border-primary bg-primary px-4 py-2 rounded-md shadow-md font-header text-white flex flex-row items-center justify-center gap-x-2 cursor-pointer transition-colors ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white"
                                onClick={() => {
                                    setShowDeletedSettings(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faCog} />
                                <p className="overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-[200px] transition-all duration-300 ease-in-out text-transparent group-hover:text-white origin-left transform -translate-x-2 group-hover:translate-x-0">
                                    Settings
                                </p>
                            </div>
                        }
                        <div className="inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-80">
                            <input className="focus:outline-none text-sm px-4 w-full rounded-md bg-white"
                                type="text"
                                placeholder="Search..."
                                name="search"
                                onChange={handleSearchChange}
                                value={searchedCourse}
                            />
                            <div className="bg-primary py-2 px-4 text-white">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </div>
                    </div>
                </form>
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
                                        <p className="text-xs">There is no course available right now, please try again later</p>
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
                <div className={`col-span-3 row-start-2 flex flex-col gap-2`}>
                    <ScrollArea className="h-[calc(100vh-9.4rem)] border border-divider rounded-md bg-white p-4">
                        <div className="w-full grid grid-cols-3 gap-2 ">
                            {
                                searchLoading || loading ?
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
                                        onClick={() => {
                                            setCourse(item);
                                            if (role === "SME-Creator" && (item.CourseStatus === "reviewed" || item.CourseStatus === "draft")) {
                                                navigate(`/SubjectMatterExpert/coursecreation/${item.id}`);
                                            } else {
                                                navigate(`/SubjectMatterExpert/preview/${item.id}`);
                                            }
                                        }}

                                        >
                                        <div className="h-full w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md">
                                            <img  src={item.ImagePath ? item.ImagePath : noImagePlaceholder} alt="" className="w-full h-full" />
                                        </div>
                                        {/* <div className="py-2 px-4 flex flex-col gap-2 text-sm">
                                            <p>{item.CourseName}</p>
                                        </div> */}

                                        <div className="absolute h-full w-full text-white rounded-md bg-gradient-to-b from-transparent to-black p-4 flex flex-col justify-between">
                                           <div className={`px-4 py-2 flex items-center justify-center border w-fit rounded-md 
                                            ${
                                                item.CourseStatus === "for_approval"
                                                ? "border-black text-black bg-indigo-200/80"
                                                : item.CourseStatus === "created"
                                                ? "border-gray-500 text-black bg-gray-200/80"
                                                : item.CourseStatus === "draft"
                                                ? "border-blue-500 text-black bg-blue-200/80"
                                                : item.CourseStatus === "reviewed"
                                                ? (
                                                    item.course_review?.some(r => r.approval_status === "rejected")
                                                        ? "border-red-500 text-red-600 bg-gradient-to-b from-red-200 to-indigo-200/80"
                                                        : item.course_review?.every(r => r.approval_status === "approved")
                                                        ? "border-yellow-400 text-indigo-600 bg-gradient-to-b from-yellow-200 to-indigo-200/80"
                                                        : "border-indigo-500 text-black bg-indigo-200/80"
                                                    )
                                                : item.CourseStatus === "published"
                                                ? "border-cyan-600 text-black bg-cyan-200/80"
                                                : item.CourseStatus === "distributed"
                                                ? "border-green-600 text-black bg-green-200/80"
                                                : item.CourseStatus === "archived"
                                                ? "border-gray-700 text-white bg-gray-500/40"
                                                : item.CourseStatus === "deleted"
                                                ? "border-red-600 text-white bg-red-500/40"
                                                : item.CourseStatus === "inactive"
                                                ? "border-yellow-500 text-black bg-yellow-200/80"
                                                : "border-white text-white bg-transparent"
                                            }`}
                                            >
                                                <p className="font-text text-xs">
                                                {item.CourseStatus === "created" && "Created"}            {/* bagong course */}
                                                {item.CourseStatus === "draft" && "For Review"}           {/* pinasa kay approver */}
                                                {item.CourseStatus === "reviewed" && (
                                                    item.course_review
                                                        ? item.course_review.some(r => r.approval_status === "rejected")
                                                        ? "Rejected"
                                                        : item.course_review.every(r => r.approval_status === "approved")
                                                        ? "Approved"
                                                        : "Reviewed"
                                                        : "Reviewed"
                                                    )}
                                                {item.CourseStatus === "published" && "Published"}       {/* napunta na sa distributor */}
                                                {item.CourseStatus === "distributed" && "Distributed"}   {/* napasa na sa mblearn */}
                                                {item.CourseStatus === "archived" && "Archived"}         {/* course removal */}
                                                {item.CourseStatus === "deleted" && "Deleted"}           {/* course removal */}
                                                {item.CourseStatus === "for_approval" && "For Re-Approval"} {/* binalik kay approver */}
                                                {item.CourseStatus === "inactive" && "Inactive"}         {/* si distributor nag archive ng published course */}
                                                </p>
                                            </div>
                                            <div className="">
                                                <p className="font-text text-xs text-white">{item.CourseID}</p>
                                                <p className="font-header text-sm">{item.CourseName}</p>

                                                {item.CourseStatus === "deleted" &&  item.retention_settings?.SettingsUpdatedAt && item.retention_settings?.RetentionValue && item.retention_settings?.RetentionUnit && 
                                                (
                                                    <p className="font-text text-xs mt-1">
                                                        Auto delete on:{" "}
                                                        {formatDate(
                                                        getHardDeleteDate(
                                                            item.retention_settings.SettingsUpdatedAt,
                                                            item.retention_settings.RetentionValue,
                                                            item.retention_settings.RetentionUnit
                                                        )
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                ))
                            }
                            </div>
                    </ScrollArea>
                </div>
            </div>
            <DeletedCourseSettingsModal
                open={showDeletedSettings}
                close={() => setShowDeletedSettings(false)}
                onDeleteSuccess={() => {
                    setShowDeletedSettings(false);
                    getCourse(option);
                }}
                // refreshSettings={getCourse}
            />
        </>
    )
}