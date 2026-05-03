import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { faCircleChevronLeft, faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import axiosClient from "MBLearn/src/axios-client"
import AssessmentPreview from "./AssessmentPreview";
import AttachmentPreview from "./AttachmentPreview";
import CourseOverviewCPL from "MBLearn/src/modalsandprops/courseComponents/courseOverviewCPL";
import CourseContentCPL from "MBLearn/src/modalsandprops/courseComponents/courseContentCPL";
import CourseCertificateCPL from "MBLearn/src/modalsandprops/courseComponents/courseCertificateCPL";

const CourseIncompletePreview = () => {
    const {setShowBack, setPageTitle} = useStateContext()
        
    const location = useLocation();
    const navigate = useNavigate();

    const { courseId, course } = location.state || {};
    const [modules, setModules] = useState([]);
    const [overview, setOverview] = useState([]);
    const [objective, setObjective] = useState([]);
    const [certificate, setCertificate] = useState([]);

    console.log("check mo to ", modules);
    const [steps, setSteps] = useState([]);
    const [stepsMeta, setStepsMeta] = useState([]);
    const [active, setActive] = useState(0);

    const isCompleted = active === steps.length;

    const fetchModuleItems = () => {
        axiosClient.get(`/fetchModuleItems/${courseId}`)
        .then(({ data }) => {
            setModules(data.modules);
            setOverview(data.overview);
            setObjective(data.objective);
            setCertificate(data.certificate);
        formik.setFieldValue('modules', data.modules);
        })
        .catch((error) => {
        console.log("The Error: ", error);
        });
    };

    console.log("MAHALAGA", course);

    useEffect(() => {
        setShowBack(true);
        setPageTitle("COURSE PREVIEW")
    }, [setShowBack]);

    useEffect(() => {
        if (modules.length === 0 && courseId) {
        fetchModuleItems();
        }
    }, [courseId]);

    useEffect(() => {
        if (!courseId || !modules || !course) {
            navigate("/dashboard");
            return;
        }

        const ContentSteps = [
            <div key="overview">
                <CourseOverviewCPL overview={overview} objective={objective} />
            </div>,
            ...modules.map((mod, index) => (
                <div key={index}>
                    {mod.type === "assessment" ? (
                        <AssessmentPreview assessment={mod.content} assessmentDescription={mod.TestDescription} />
                    ) : mod.type === "module" ? (
                        <CourseContentCPL course={mod.content} />
                    ) : (
                        <AttachmentPreview attachment={mod} />
                    )}
                </div>
            )),
            <div key="certificate">
                <CourseCertificateCPL certificate={certificate} />
            </div>
        ];

        const metadata = [
            {
                title: "Course Details",
                type: "overview",
            },
            ...modules.map((mod) => ({
                title: mod.title || "Untitled",
                type: mod.type || "Unknown",
            })),
            {
                title: "Course Certificate",
                type: "certificate",
            },
        ];

        setSteps(ContentSteps);
        setStepsMeta(metadata);
    }, [courseId, modules, course, navigate]);


    return (
    <>
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] w-full h-full gap-2 pb-4 pr-4">
            {/* Header */}
            <div className="col-span-4 w-full h-full">
                <div className="w-full h-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-lg shadow-md flex flex-col justify-between p-4">
                {/* Status and Controls Row */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-row gap-2 h-full">
                    </div>
                </div>

                {/* Course Info */}
                <div>
                    {course ? (
                    <>
                        <p className="font-text text-white text-xs">{course.CourseID}</p>
                        <p className="font-header text-xl text-white">{course.CourseName}</p>
                        <p className="font-text text-white text-xs">
                        {course.category?.category_name} - {course.career_level?.name} Level
                        </p>
                    </>
                    ) : (
                    <>
                        <div className="w-20 h-4 bg-gray-600 rounded animate-pulse mb-1"></div>
                        <div className="w-40 h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                        <div className="w-32 h-4 bg-gray-600 rounded animate-pulse"></div>
                    </>
                    )}
                </div>
                </div>
            </div>

            {/* Sidebar: Step List */}
            <div className="flex flex-col col-span-1">
                <p className="font-text text-unactive text-xs py-1">Course Content:</p>

                <ScrollArea className="h-[calc(100vh-17.5rem)] overflow-y-auto border border-divider rounded-md bg-white">
                <div className="p-4 flex flex-col gap-y-2">
                    {steps.length > 0 ? (
                    steps.map((_, index) => {
                        const isActive = index === active;

                        return (
                        <div
                            key={index}
                            className={`group grid grid-cols-[min-content_1fr] py-3 px-2 gap-2 hover:bg-primarybg transition-all rounded-md border-2 ${
                            isActive ? "border-primary" : "border-transparent"
                            }`}
                            onClick={() => setActive(index)}
                        >
                            <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                                isActive
                                ? "bg-primary text-white border-primary"
                                : "border-unactive text-unactive group-hover:text-primary group-hover:border-primary"
                            }`}
                            >
                            {index + 1}
                            </div>

                            <div className="font-text">
                            <h1
                                className={`font-header text-sm ${
                                isActive ? "text-primary" : "text-unactive"
                                }`}
                            >
                                {stepsMeta[index]?.title}
                            </h1>
                            <p className="text-xs text-unactive group-hover:text-primary">
                                {(() => {
                                const type = stepsMeta[index]?.type?.toLowerCase();

                                if (type === "module") return "Module";
                                if (type === "assessment") return "Assessment";
                                if (type === "file") return "File Attachment";
                                if (type === "video") return "Video Attachment";

                                return null;
                                })()}
                            </p>
                            </div>
                        </div>
                        );
                    })
                    ) : (
                    <div className="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded-md text-center">
                        No content available.
                    </div>
                    )}
                </div>
                </ScrollArea>
            </div>

            {/* Step Content */}
            <div className="flex flex-col gap-2 col-span-3">
                <div className="flex justify-between items-center">
                <div>
                    <p className="font-header text-primary text-lg">
                    Title: {stepsMeta[active]?.title || "Untitled"}
                    </p>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-2">
                    <div
                    className={`w-10 h-10 border-2 border-primary rounded-md bg-white flex items-center justify-center text-primary ${
                        active === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primaryhover hover:text-white cursor-pointer"
                    }`}
                    onClick={() => setActive((prev) => Math.max(prev - 1, 0))}
                    >
                    <FontAwesomeIcon icon={faCircleChevronLeft} />
                    </div>
                    <div
                    className={`w-10 h-10 border-2 border-primary rounded-md bg-white flex items-center justify-center text-primary ${
                        active >= steps.length - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primaryhover hover:text-white cursor-pointer"
                    }`}
                    onClick={() => setActive((prev) => Math.min(prev + 1, steps.length - 1))}
                    >
                    <FontAwesomeIcon icon={faCircleChevronRight} />
                    </div>
                </div>
                </div>

                {/* <ScrollArea className="h-[calc(100vh-19.2rem)] border border-divider bg-white rounded-md">
                    <div className="p-2">{isCompleted ? <p>Course completed!</p> : steps[active]}</div>
                </ScrollArea> */}

                <div className="h-[calc(100vh-19.2rem)] border border-divider bg-white rounded-md flex flex-col">
                    <div className="flex-1 p-2 overflow-auto">
                        {isCompleted ?
                        <p>Course completed!</p>
                        :
                        steps[active]
                        }
                    </div>
                </div>

            </div>
        </div>
    </>
    );

};

export default CourseIncompletePreview;
