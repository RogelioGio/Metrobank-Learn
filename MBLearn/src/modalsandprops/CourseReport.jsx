import { faArrowCircleLeft, faArrowRotateBack, faArrowTurnUp, faBars, faBook, faBookOpenReader, faCalendar, faCalendarCheck, faCalendarXmark, faCertificate, faChartSimple, faCheckCircle, faCircleCheck, faCircleXmark, faClipboard, faClock, faFileArrowDown, faFilter, faGraduationCap, faHourglass, faPaste, faRotate, faSpinner, faTimesCircle, faTriangleExclamation, faUserCheck, faUserPlus, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RingProgress } from "@mantine/core";
import {  ChartContainer,
        ChartLegend,
        ChartLegendContent,
        ChartTooltip,
        ChartTooltipContent, } from '../components/ui/chart';
import {Label, Area, AreaChart, CartesianGrid, XAxis, PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  YAxis,} from 'recharts';
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import ReportGenerationModal from "./ReportGenerationModal";
import { useEffect, useState } from "react";
import ReportGeneratedModal from "./ReportGeneratedModal";
import axiosClient from "../axios-client";
import { format, isBefore, isEqual, parseISO, set } from "date-fns";
import AssessmentOverviewModal from "./AssessmentOverviewModal";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useFormik } from "formik";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { useOption } from "../contexts/AddUserOptionProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import { useStateContext } from "../contexts/ContextProvider";



const CourseReport = ({course}) => {
    const {user} = useStateContext();
    const [openReportGenerationModal, setOpenReportGenerationModal] = useState(false);
    const {departments, divisions} = useOption();
    const [reportType, setSetReportType] = useState("");
    const [generated, setGenerated] = useState(false);
    const [success, setSuccess] = useState(false);
    const [completedLearners, setCompletedLearners] = useState([]);
    const [assessment, setAssessment] = useState([]);
    const [assessmentItem, setAssessmentItem] = useState({});
    const [assessmentLoading, setAssessmentLoading] = useState(false);
    const [totalLearners, setTotalLearners] = useState(0);
    const [gettingData, setGettingData] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const {id} = useParams()
    const [tab, setTab] = useState("performance");
    const [filtering, setFiltering] = useState(false);
    const [dateRange, setDateRange] = useState({
        "start": new Date(),
        "end": undefined,
    });
    const [filteredCompletionData, setFilteredCompletionData] = useState([]);
    const [timelineData, setTimelineData] = useState([]);
    const [filteredTimelineData, setFilteredTimelineData] = useState([]);
    const [reportGenerating, setGenerating] = useState(false);

    const samplechartData = [{course: 'Course A', passed: 80, failed: 70},]
    const completionRateConfig = {
        passed: {
            label: 'Passed',
            color: 'hsl(146, 61%, 20%)',
        },
        failed: {
            label: 'Failed',
            color: 'hsl(0, 63%, 31%)',
        }
    };
    const engagementChartConfig = {
        engagement: {
            label: "engagement",
            color: 'hsl(218, 97%, 26%)',
        }
    }

    const chartConfig = {
        passed: {label: "Passed", color: "hsl(152, 61%, 20%)"},
        failed: {label: "Failed", color: "hsl(0, 63%, 31%)"},
    }

    const chartConfig2 = {
        desktop: {label: "Passed", color: "hsl(152, 61%, 20%)"},
    }

    const chartData3 = [
        { date: "2024-06-27", engagement: 448 },
        { date: "2024-06-28", engagement: 149 },
        { date: "2024-06-29", engagement: 103 },
        { date: "2024-06-30", engagement: 446 },
    ]

    const fetchCompletedLearners = () => {
        setGettingData(true);
        axiosClient.get(`/getLearnersCompletedStatistic/${course?.id || id}`)
        .then(({data}) => {
            console.log(data);
            setCompletedLearners(data);
            setFilteredCompletionData(data);
        })
        .catch((err) => {
            console.log(err);
            toast.error("You are not assigned to this course.")
            navigate('/');
        })
    };


    const fetchTimelineData = () => {
        setFiltering(true);
        axiosClient.get(`/getLearningTimelineStatistic/${course?.id || id}`)
        .then(({data}) => {
            setFiltering(false);
            console.log(data);
            setTimelineData(data);
            setFilteredTimelineData(data);
        }).catch((err) => {
            console.log(err);
        })
    }

    const fetchTimelineDataFiltered = () => {
        if(filtering) return;
        setFiltering(true)
        axiosClient.get(`getLearningTimelineStatistic/${course?.id || id}?department_id=${filterFormik.values.department || ""}&division_id=${filterFormik.values.division || ""}&start_date=${filterFormik.values.from || ""}&end_date=${filterFormik.values.to && filterFormik.values.from ? filterFormik.values.to : ""}`)
        .then(({data}) => {
            console.log(data);
            setFiltering(false)
            setFilteredTimelineData(data);
        })
        .catch((err) => {
            console.log(err);
            setFiltering(false)
        })

    }

    const fetchCourseAssessment = () => {
        if(assessmentLoading) return;
        setAssessmentLoading(true);
        axiosClient.get(`getAssessmentStatistic/${course?.id || id}?department_id=${filterFormik.values.department || ""}&division_id=${filterFormik.values.division || ""}&start_date=${filterFormik.values.from || ""}&end_date=${filterFormik.values.to && filterFormik.values.from ? filterFormik.values.to : ""}`)
        .then(({data}) => {
            console.log(data);
            setAssessment(data.assessments);
            setAssessmentLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setAssessment([]);
            setAssessmentLoading(false);
        })
    }
    const fetchCourseAssessmentFiltered = (testId) => {
        if(filtering) return;
        setFiltering(true);
        axiosClient.get(`filteredAssessmentStatistic/${course?.id || id}/${testId}?department_id=${filterFormik.values.department || ""}&division_id=${filterFormik.values.division || ""}&start_date=${filterFormik.values.from || ""}&end_date=${filterFormik.values.to && filterFormik.values.from ? filterFormik.values.to : ""}`)
        .then(({data}) => {
            console.log(data);
            setAssessmentItem(data)
            setFilteredCompletionData(data);
            setFiltering(false)
        }).catch((err) => {
            console.log(err);
            setFiltering(false)
        })
    }

    const fetchCourseCompletionFiltered = () => {
        if(filtering) return;
        setFiltering(true)
        axiosClient.get(`/courses/completionrates/${course?.id || id}?department_id=${filterFormik.values.department || ""}&division_id=${filterFormik.values.division || ""}&start_date=${filterFormik.values.from || ""}&end_date=${filterFormik.values.to && filterFormik.values.from ? filterFormik.values.to : ""}`)
        .then(({data}) => {
            console.log(data);
            setFiltering(false)
            setFilteredCompletionData(data);
        }).catch((err) => {
            console.log(err);
            setFiltering(false)
        })
    }



    useEffect(()=>{
        fetchCourseAssessment();
        fetchCompletedLearners();
        fetchTimelineData();
    },[])

    const chartData = [{assessment: 15, passed: 12, failed: 3}]

    const filterFormik = useFormik({
        initialValues: {
            from: "",
            to: "",
            division: "",
            department: "",
        },
        onSubmit: (values) => {
            console.log(values);
        }
    })
    const reportEntriesDateChange = () => (range) => {
        const start = range.from;
        const end = range.to ?? range.from;

        filterFormik.setFieldValue('from', format(new Date(start), 'MMMM dd, yyyy'));
        filterFormik.setFieldValue('to', format(new Date(end), 'MMMM dd, yyyy'));
        setDateRange(range)
    }

    const handleReportGeneration = () => {
        const endPoint = tab === "performance" ? "courseCompletion" : tab === "timeline" ? "courseTimeline" : "assessmentresults";
        setGenerating(true);

        axiosClient.post(`report/${endPoint}`,{
            course_id: course.id,
            start_date: filterFormik.values.from,
            end_date: filterFormik.values.to,
            division_id: filterFormik.values.division,
            department_id: filterFormik.values.department,
            user_name: user.user_infos.first_name,
            test_id: assessmentItem ? assessmentItem?.id : "",
        },{responseType: 'blob'})
        .then((res) => {
            setGenerating(false);
            toast.success("Report generated successfully.");

            let fileName = '';
            const disposition = res.headers['content-disposition'];
            if (disposition && disposition.includes('filename=')) {
                fileName = disposition
                    .split('filename=')[1]
                    .replace(/['"]/g, '') // remove quotes if any
                    .trim();
            }

            const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
        }).catch( async (err) => {
                // generated();
                // setGenerating(false);
                //setMessage(err.response?.data?.message || "An error occurred while generating the report.");
                // console.log("Error generating report:", err);

                setGenerating(false);
                generated();

                try {
                    if (err.response?.data instanceof Blob) {
                        const text = await err.response.data.text(); // convert Blob → string
                        const json = JSON.parse(text);               // string → JSON
                        toast.error(json.message || "An error occurred while generating the report.");
                        } else {
                        toast.error(err.response?.data?.message || "An error occurred while generating the report.");
                    }
                } catch (parseError) {
                    console.error("Error parsing blob response:", parseError);
                    toast.error("An error occurred while generating the report.");
                }
        })
    }

    return (
        <>
        <div className="w-full h-full grid grid-cols-4">
            {/* List of report */}
            <div className="px-2 flex flex-col gap-2">
                <div className={`w-full border-2 border-primary rounded-md px-4 py-2 flex flex-row items-center text-primary gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out ${tab === "performance" ? "bg-primary text-white" : "bg-white text-primary"}`}
                    // onClick={() => {setOpenReportGenerationModal(true); setSetReportType("coursePerformance")}}
                    onClick={()=>{
                        if(filtering) return
                        setTab("performance"); filterFormik.resetForm();}}>
                    <FontAwesomeIcon icon={faBook} />
                    <p className="font-header">Course Completion</p>
                </div>
                <div className={`w-full border-2 border-primary rounded-md px-4 py-2 flex flex-row items-center text-primary gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out ${tab === "timeline" ? "bg-primary text-white" : "bg-white text-primary"}`}
                    //onClick={() => {setOpenReportGenerationModal(true); setSetReportType("courseTimelinelokollll")}}
                    onClick={()=>{
                        if(filtering) return
                        setTab("timeline"); filterFormik.resetForm();}}
                    >
                    <FontAwesomeIcon icon={faClock} />
                    <p className="font-header">Learning Timeline</p>
                </div>
                <div className="flex flex-col h-full gap-2">
                    <p className="font-text text-xs">Assessment Result Reviews</p>
                    {/* <div className="bg-white border border-divider rounded-md h-full">

                    </div> */}
                    <ScrollArea className="border rounded-md bg-white h-[calc(100vh-14rem)] border-divider ">
                        <div className="p-4 flex flex-col gap-2">
                            {
                                assessmentLoading ?
                                Array.from({length: 3}).map((_, index) => (
                                    <div className="h-20 animate-pulse border border-divider rounded-md shadow-md">

                                    </div>
                                ))
                                : assessment.length === 0 ?
                                <div className="w-full h-[calc(100vh-18rem)] flex flex-col justify-center items-center gap-2">
                                    <div className="w-32 h-32 bg-primarybg rounded-full flex flex-row justify-center items-center text-primary text-6xl">
                                        <FontAwesomeIcon icon={faClipboard}/>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-1">
                                        <p className="font-header text-primary text-xl">No Assessments Yet</p>
                                        <p className="font-text text-xs text-unactive">No assessments available for this course</p>
                                    </div>
                                </div>
                                :
                                assessment.map((item, index) => (
                                    <div className={`w-full border border-divider p-4 shadow-md rounded-md hover:border-primary hover:cursor-pointer transition-all ease-in-out mb-2 ${tab === "assessment" && assessmentItem?.id === item.id ? "border-primary" : "border-divider"}`}
                                        key={index}
                                        onClick={() => {setTab("assessment"); setAssessmentItem(item); filterFormik.resetForm();}}>
                                        <p className="text-xs font-text text-unactive">Assessement No. {index + 1}</p>
                                        <p className="font-header text-primary text-sm">{item.TestName}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <div className="col-span-3">
                {tab === "performance" ?
                    <div className="w-full h-full grid grid-cols-4 grid-rows-[min-content_min-content_min-content_1fr] gap-2 pl-2 pb-2">
                        <div className="col-span-2">
                            <p className="font-header text-primary text-xl">Course Completion Report</p>
                            <p className="font-text text-xs">Learners' passing rate and completion rate</p>
                        </div>
                        <div className="col-start-4 flex flex-row items-center justify-end">
                            <div className={`flex flex-row px-4 py-2 bg-primary border-primary border-2 font-header hover:text-white  text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${reportGenerating || filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                onClick={()=>{
                                    if(reportGenerating || filtering) return;
                                    handleReportGeneration()}}>
                                    {
                                        reportGenerating ?
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3"/>
                                            <p>Exporting Report</p>
                                        </> : <>
                                            <FontAwesomeIcon icon={faFileArrowDown}/>
                                            <p>Export Report</p>
                                        </>
                                    }
                            </div>
                        </div>
                        <div className="row-start-2 col-span-4 flex-col gap-2 flex">
                            <form className="grid grid-cols-4 gap-1 w-full">
                                <div className="flex flex-row gap-2 col-span-2 w-full justify-between">
                                    <div className="w-full">
                                    <input type="text" name="from"
                                        readOnly
                                        value={filterFormik.values.from}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">Starting Date</p>
                                        {/* {formik.touched.reportEntriesStartDate && formik.errors.reportEntriesStartDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesStartDate}</div>):null} */}
                                    </div>
                                </div>
                                <div className="w-full">
                                    <input type="text" name="to"
                                        readOnly
                                        value={filterFormik.values.to}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">End Date</p>
                                        {/* {formik.touched.reportEntriesEndDate && formik.errors.reportEntriesEndDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesEndDate}</div>):null} */}
                                    </div>
                                </div>
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="group relative">
                                                <div className={`w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md transition-all ease-in-out hover:cursor-pointer hover:bg-primaryhover hover:text-white`}>
                                                    <FontAwesomeIcon icon={faCalendar}/>
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit p-2">
                                            {/* side={popOverState.side} sideOffset={popOverState.sideOffset} */}
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                numberOfMonths={2}
                                                defaultMonth={dateRange.start}
                                                selected={dateRange}
                                                onSelect={reportEntriesDateChange()}
                                                disabled={{ after: new Date() }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Select
                                    value={filterFormik.values.division?.toString() || ""}
                                    onValueChange={(value) => {
                                        filterFormik.setFieldValue("division", value);
                                    }}
                                    disabled={false}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-fit bg-white text-base">
                                        <SelectValue placeholder="Select Division" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        ?.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                            {d.division_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Divisions<span className="text-red-500">*</span></p>

                                </div>
                                <div>
                                    <Select
                                    value={filterFormik.values.department?.toString() || ""}
                                    onValueChange={(value) => filterFormik.setFieldValue("department", value)}
                                    disabled={filterFormik.values.division === ""}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-fit bg-white text-base">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        .find((d) => d.id?.toString() === filterFormik.values.division?.toString())
                                        ?.departments
                                        ?.filter((dep) => dep.archived === false)
                                        ?.map((dep) => (
                                            <SelectItem key={dep.id} value={dep.id.toString()}>
                                            {dep.department_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Department<span className="text-red-500">*</span></p>
                                </div>
                            </form>
                            <div className="flex flex-row gap-2 justify-end items-center text-primary font-header">
                                <div className={`border-2 border-primary flex flex-row px-4 py-2 bg-primary text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{fetchCourseCompletionFiltered()}}>
                                    <FontAwesomeIcon icon={faFilter} className="mr-2"/>
                                    <p>Filter</p>
                                </div>
                                <div className={`flex flex-row px-4 py-2 bg-white border-primary border-2 text-primary  hover:text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{
                                        if(filtering) return;
                                        filterFormik.resetForm(); setFilteredCompletionData(completedLearners);}
                                    }>
                                    <FontAwesomeIcon icon={faArrowRotateBack} className="mr-2"/>
                                    <p>Clear</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 flex flex-row gap-2">
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Passed Learners</p>
                                    <p className="font-header">{filteredCompletionData.passed_count || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faXmarkCircle} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Failed Learner</p>
                                    <p className="font-header">{filteredCompletionData.failed_count || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">On-time Completers</p>
                                    <p className="font-header">{filteredCompletionData.on_time || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faCalendarXmark} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Late Completers</p>
                                    <p className="font-header">{filteredCompletionData.late || 0} Learners</p>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className="col-span-4 border border-divider rounded-md bg-white shadow-md h-[calc(100vh-22.6em)] w-full overflow-x-auto whitespace-nowrap ">
                            <div className="p-4 flex flex-col gap-2">
                                {
                                    filtering ?
                                        Array.from({length: 5}).map((_, index) => (
                                            <div key={index} className="w-full h-24 bg-divider rounded-md animate-pulse"/>
                                        ))
                                    : filteredCompletionData?.enrollments?.length === 0 || filteredCompletionData.length === 0 ? null
                                    : filteredCompletionData?.enrollments?.map((item, index) => (
                                        <div className="p-4 rounded-md shadow-md border border-divider w-full grid grid-cols-[1fr_min-content_min-content_min-content] gap-10">
                                            <div className='flex flex-row gap-2 items-center'>
                                                <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                                    <img src={item.enrolled_user.profile_image} alt="" />
                                                </div>
                                                <div className='leading-tight'>
                                                    <p className='text-sm font-text text-primary'>{item.enrolled_user.first_name} {item.enrolled_user.middle_name || ""} {item.enrolled_user.last_name}</p>
                                                    <p className='text-xs font-text text-unactive'>ID: {item.enrolled_user.employeeID}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-start gap-1">
                                                <p className="text-xs text-unactive">Completion Date</p>
                                                <div className="flex flex-row gap-2 items-center text-green-900">
                                                    <FontAwesomeIcon icon={item.enrollment_status !== "late_finish" ? faCircleCheck : faXmarkCircle}/>
                                                    <p className="font-header">{item.updated_at ? format(new Date(item.updated_at), 'MM-dd-yyyy') : null}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-start gap-1">
                                                <p className="text-xs text-unactive">Deadline Date</p>
                                                <p className="font-header text-primary">{item.end_date ? format(new Date(item.end_date), 'MM-dd-yyyy') : null}</p>
                                            </div>
                                            <div className="flex flex-col justify-center items-start gap-1">
                                                <p className="text-xs text-unactive">Remarks</p>
                                                <div className={`flex flex-row items-center ${item.enrollment_status === "finished" ? "text-green-900" : item.enrollment_status === "failed" ? "text-red-900" : item.enrollment_status === "late_finish" ? "text-yellow-600" : "text-blue-900" }`}>
                                                    <FontAwesomeIcon icon={item.enrollment_status === "finished" ? faCircleCheck : item.enrollment_status === "failed" ? faCircleXmark : item.enrollment_status === "late_finish" ? faHourglass : faClock} className={`mr-2`}/>
                                                    <p className="font-header">{item.enrollment_status === "finished" ? "Passed" : item.enrollment_status === "failed" ? "Failed" : item.enrollment_status === "late_finish" ? "Completed Late" : "In Progress"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </ScrollArea>
                    </div>
                : tab === "timeline" ?
                    <div className="w-full h-full grid grid-cols-4 grid-rows-[min-content_min-content_min-content_1fr] gap-2 pl-2 pb-2">
                        <div className="col-span-2">
                            <p className="font-header text-primary text-xl">Learning Timeline Report</p>
                            <p className="font-text text-xs">Learners' learning time and current remarkts</p>
                        </div>
                        <div className="col-start-4 flex flex-row items-center justify-end">
                            <div className={`flex flex-row px-4 py-2 bg-primary border-primary border-2 font-header hover:text-white  text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${reportGenerating || filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                onClick={()=>{
                                    if(reportGenerating || filtering) return;
                                    handleReportGeneration()}}>
                                    {
                                        reportGenerating ?
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3"/>
                                            <p>Exporting Report</p>
                                        </> : <>
                                            <FontAwesomeIcon icon={faFileArrowDown}/>
                                            <p>Export Report</p>
                                        </>
                                    }
                            </div>
                        </div>
                        <div className="row-start-2 col-span-4 flex-col gap-2 flex">
                            <form className="grid grid-cols-4 gap-1 w-full">
                                <div className="flex flex-row gap-2 col-span-2 w-full justify-between">
                                    <div className="w-full">
                                    <input type="text" name="from"
                                        readOnly
                                        value={filterFormik.values.from}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">Starting Date</p>
                                        {/* {formik.touched.reportEntriesStartDate && formik.errors.reportEntriesStartDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesStartDate}</div>):null} */}
                                    </div>
                                </div>
                                <div className="w-full">
                                    <input type="text" name="to"
                                        readOnly
                                        value={filterFormik.values.to}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">End Date</p>
                                        {/* {formik.touched.reportEntriesEndDate && formik.errors.reportEntriesEndDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesEndDate}</div>):null} */}
                                    </div>
                                </div>
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="group relative">
                                                <div className={`w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md transition-all ease-in-out hover:cursor-pointer hover:bg-primaryhover hover:text-white`}>
                                                    <FontAwesomeIcon icon={faCalendar}/>
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit p-2">
                                            {/* side={popOverState.side} sideOffset={popOverState.sideOffset} */}
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                numberOfMonths={2}
                                                defaultMonth={dateRange.start}
                                                selected={dateRange}
                                                onSelect={reportEntriesDateChange()}
                                                disabled={{ after: new Date() }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Select
                                    value={filterFormik.values.division?.toString() || ""}
                                    onValueChange={(value) => {
                                        filterFormik.setFieldValue("division", value);
                                    }}
                                    disabled={false}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-fit bg-white text-base">
                                        <SelectValue placeholder="Select Division" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        ?.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                            {d.division_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Divisions<span className="text-red-500">*</span></p>

                                </div>
                                <div>
                                    <Select
                                    value={filterFormik.values.department?.toString() || ""}
                                    onValueChange={(value) => filterFormik.setFieldValue("department", value)}
                                    disabled={filterFormik.values.division === ""}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-fit bg-white text-base">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        .find((d) => d.id?.toString() === filterFormik.values.division?.toString())
                                        ?.departments
                                        ?.filter((dep) => dep.archived === false)
                                        ?.map((dep) => (
                                            <SelectItem key={dep.id} value={dep.id.toString()}>
                                            {dep.department_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Department<span className="text-red-500">*</span></p>
                                </div>
                            </form>
                            <div className="flex flex-row gap-2 justify-end items-center text-primary font-header">
                                <div className={`border-2 border-primary flex flex-row px-4 py-2 bg-primary text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{fetchTimelineDataFiltered()}}>
                                    <FontAwesomeIcon icon={faFilter} className="mr-2"/>
                                    <p>Filter</p>
                                </div>
                                <div className={`flex flex-row px-4 py-2 bg-white border-primary border-2 text-primary  hover:text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{
                                        if(filtering) return;
                                        filterFormik.resetForm(); setFilteredTimelineData(timelineData);}}>
                                    <FontAwesomeIcon icon={faArrowRotateBack} className="mr-2"/>
                                    <p>Clear</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 flex flex-row gap-2">
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Enrolled Learners</p>
                                    <p className="font-header">{filteredTimelineData?.enrolled_count || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faBookOpenReader} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">On-going Learners</p>
                                    <p className="font-header">{filteredTimelineData?.ongoing_count || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faHourglass} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Past Deadline Learners</p>
                                    <p className="font-header">{filteredTimelineData?.past_due_count || 0} Learners</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faClock} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Due soon Learners</p>
                                    <p className="font-header">{filteredCompletionData.due_soon_count || 0} Learners</p>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className="col-span-4 border border-divider rounded-md bg-white shadow-md h-[calc(100vh-22.6rem)] w-full overflow-x-auto whitespace-nowrap ">
                            <div className="p-4 flex flex-col gap-2">
                                {
                                    filtering ?
                                            Array.from({length: 5}).map((_, index) => (
                                                <div key={index} className="w-full h-24 bg-divider rounded-md animate-pulse"/>
                                            ))
                                        : filteredTimelineData?.enrollments?.length === 0 || filteredTimelineData.length === 0 ? null
                                        : filteredTimelineData?.enrollments?.map((item, index) => (
                                            <div className="p-4 rounded-md shadow-md border border-divider w-full grid grid-cols-[1fr_min-content_min-content_min-content] gap-10">
                                                <div className='flex flex-row gap-2 items-center'>
                                                    <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                                        <img src={item.enrolled_user.profile_image} alt="" />
                                                    </div>
                                                    <div className='leading-tight'>
                                                        <p className='text-sm font-text text-primary'>{item.enrolled_user.first_name} {item.enrolled_user.middle_name || ""} {item.enrolled_user.last_name}</p>
                                                        <p className='text-xs font-text text-unactive'>ID: {item.enrolled_user.employeeID}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-start gap-1">
                                                    <p className="text-xs text-unactive">Enrollment Date</p>
                                                    <p className="font-header text-primary">{item.start_date ? format(new Date(item.start_date), 'MM-dd-yyyy') : null}</p>
                                                </div>
                                                <div className="flex flex-col justify-center items-start gap-1">
                                                    <p className="text-xs text-unactive">Deadline Date</p>
                                                    <p className="font-header text-primary">{item.end_date ? format(new Date(item.end_date), 'MM-dd-yyyy') : null}</p>
                                                </div>
                                                <div className="flex flex-col justify-center items-start gap-1">
                                                    <p className="text-xs text-unactive">Remarks</p>
                                                    <div className={`flex flex-row items-center ${item.enrollment_status === "enrolled" ? "text-primary" : item.enrollment_status === "past-due" ? "text-red-900" : item.enrollment_status === "due-soon" ? "text-yellow-600" : "text-blue-900" }`}>
                                                        <FontAwesomeIcon icon={item.enrollment_status === "enrolled" ? faGraduationCap : item.enrollment_status === "past_due" ? faTriangleExclamation : item.enrollment_status === "due-soon" ? faHourglass : faBookOpenReader} className={`mr-2`}/>
                                                        <p className="font-header">{item.enrollment_status === "enrolled" ? "Enrolled" : item.enrollment_status === "past_due" ? "Past Due" : item.enrollment_status === "due-soon" ? "Due Soon" : "In Progress"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                }
                            </div>

                        </ ScrollArea>
                    </div>
                : tab === "assessment" ?
                    <div className="w-full h-full grid grid-cols-4 grid-rows-[min-content_min-content_min-content_1fr] gap-2 pl-2 pb-2">
                        <div className="col-span-2">
                            <p className="font-text text-xs text-unactive">Assessment Results Review</p>
                            <p className="font-header text-primary text-xl">{assessmentItem?.TestName}</p>
                        </div>
                        <div className="col-start-4 flex flex-row items-center justify-end">
                            <div className={`flex flex-row px-4 py-2 bg-primary border-primary border-2 font-header hover:text-white  text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${reportGenerating || filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                onClick={()=>{
                                    if(reportGenerating || filtering) return;
                                    handleReportGeneration()}}>
                                    {
                                        reportGenerating ?
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3"/>
                                            <p>Exporting Report</p>
                                        </> : <>
                                            <FontAwesomeIcon icon={faFileArrowDown}/>
                                            <p>Export Report</p>
                                        </>
                                    }
                            </div>
                        </div>
                        {/* Filter */}
                        <div className="row-start-2 col-span-4 flex-col gap-2 flex">
                            <form className="grid grid-cols-4 gap-1 w-full">
                                <div className="flex flex-row gap-2 col-span-2 w-full justify-between">
                                    <div className="w-full">
                                    <input type="text" name="from"
                                        readOnly
                                        value={filterFormik.values.from}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">Starting Date</p>
                                        {/* {formik.touched.reportEntriesStartDate && formik.errors.reportEntriesStartDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesStartDate}</div>):null} */}
                                    </div>
                                </div>
                                <div className="w-full">
                                    <input type="text" name="to"
                                        readOnly
                                        value={filterFormik.values.to}
                                        onChange={filterFormik.handleChange}
                                        className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="font-text text-xs pt-1">End Date</p>
                                        {/* {formik.touched.reportEntriesEndDate && formik.errors.reportEntriesEndDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesEndDate}</div>):null} */}
                                    </div>
                                </div>
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="group relative">
                                                <div className={`w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md transition-all ease-in-out hover:cursor-pointer hover:bg-primaryhover hover:text-white`}>
                                                    <FontAwesomeIcon icon={faCalendar}/>
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit p-2">
                                            {/* side={popOverState.side} sideOffset={popOverState.sideOffset} */}
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                numberOfMonths={2}
                                                defaultMonth={dateRange.start}
                                                selected={dateRange}
                                                onSelect={reportEntriesDateChange()}
                                                disabled={{ after: new Date() }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                </div>

                                <div className="flex flex-col">
                                    <Select
                                    value={filterFormik.values.division?.toString() || ""}
                                    onValueChange={(value) => {
                                        filterFormik.setFieldValue("division", value);
                                    }}
                                    disabled={false}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white text-base">
                                        <SelectValue placeholder="Select Division" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        ?.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                            {d.division_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Divisions<span className="text-red-500">*</span></p>

                                </div>
                                <div className="flex flex-col">
                                    <Select
                                    value={filterFormik.values.department?.toString() || ""}
                                    onValueChange={(value) => filterFormik.setFieldValue("department", value)}
                                    disabled={filterFormik.values.division ? false : true}
                                    >
                                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white text-base">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>

                                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                        {divisions
                                        .filter((div) => div.archived === false)
                                        .find((d) => d.id?.toString() === filterFormik.values.division?.toString())
                                        ?.departments
                                        ?.filter((dep) => dep.archived === false)
                                        ?.map((dep) => (
                                            <SelectItem key={dep.id} value={dep.id.toString()}>
                                            {dep.department_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <p className="font-text text-xs pt-1">Department<span className="text-red-500">*</span></p>
                                </div>
                            </form>
                            <div className="flex flex-row gap-2 justify-end items-center text-primary font-header">
                                <div className={`border-2 border-primary flex flex-row px-4 py-2 bg-primary text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{fetchCourseAssessmentFiltered(assessmentItem.id)}}>
                                    <FontAwesomeIcon icon={faFilter} className="mr-2"/>
                                    <p>Filter</p>
                                </div>
                                <div className={`flex flex-row px-4 py-2 bg-white border-primary border-2 text-primary  hover:text-white rounded-md items-center gap-2 hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${filtering ? "opacity-50 hover:cursor-not-allowed" : ""}`}
                                    onClick={()=>{
                                        if(filtering) return;
                                        filterFormik.resetForm(); setAssessmentItem(assessment.find(a => a.id === assessmentItem.id));}}>
                                    <FontAwesomeIcon icon={faArrowRotateBack} className="mr-2"/>
                                    <p>Clear</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 flex flex-row gap-2">
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Passed Learners</p>
                                    <p className="font-header">{assessmentItem?.passed} Learner/s</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faXmarkCircle} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Failed Learners</p>
                                    <p className="font-header">{assessmentItem?.failed} Learner/s</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faClipboard} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Total Assessment Takers</p>
                                    <p className="font-header">{assessmentItem?.total_takers} Learner/s</p>
                                </div>
                            </div>
                            <div className="flex text-primary flex-row  items-center gap-3 border w-full border-primary shadow-md bg-white rounded-md p-4">
                                <FontAwesomeIcon icon={faPaste} className="text-2xl text-primary mr-2"/>
                                <div>
                                    <p className="text-xs">Average Attempt Taken</p>
                                    <p className="font-header">{assessmentItem?.average_attemptCount} Attempt/s</p>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className="col-span-4 border border-divider rounded-md bg-white shadow-md h-[calc(100vh-22.6rem)] w-full overflow-x-auto whitespace-nowrap ">
                            <div className="p-4 flex flex-col gap-2">
                                {
                                    filtering ?
                                    Array.from({length: 5}).map((_, index) => (
                                        <div key={index} className="w-full h-24 bg-divider rounded-md animate-pulse"/>
                                    ))
                                    : assessmentItem.takers.length === 0 ? null
                                    : assessmentItem.takers.map((taker, index) => (
                                        <div className="p-4 rounded-md shadow-md border border-divider w-full grid grid-cols-[1fr_min-content_min-content_min-content] gap-5">
                                            <div className='flex flex-row gap-2 items-center'>
                                                <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                                    <img src={taker.user.profile_image} alt="" />
                                                </div>
                                                <div className='leading-tight'>
                                                    <p className='text-sm font-text text-primary'>{taker.user.first_name} {taker.user.middle_name || ""} {taker.user.last_name}</p>
                                                    <p className='text-xs font-text text-unactive'>ID: {taker.user.employeeID}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-start">
                                                <p className="text-xs text-unactive">Best Score Attempt</p>
                                                <p className="text-sm text-primary">{taker.best_score} point/s</p>
                                            </div>
                                            <div className="flex flex-col justify-center items-start">
                                                <p className="text-xs text-unactive">Assessment Remarks</p>
                                                <div className={`flex flex-row gap-2 items-center  ${taker.status === "Passed" ? "text-green-900" : "text-red-900"}`}>
                                                    <p className="text-header font-header">{taker.status === "Passed" ? "Passed" : "Failed"}</p>
                                                    <FontAwesomeIcon icon={taker.status === "Passed" ? faCheckCircle : faXmarkCircle} className=""/>
                                                </div>
                                            </div>
                                            <div className="border-l border-divider px-4 whitespace-nowrap flex flex-col justify-center items-start w-fit gap-2">
                                                <p className="text-xs text-unactive">Attempt Review</p>
                                                <div className="grid grid-flow-col gap-4">
                                                    {
                                                        taker.questions.map((q, idx) => (
                                                            <div key={idx} className="flex flex-col items-center gap-1">
                                                                <FontAwesomeIcon icon={q.pivot.correct ? faCheckCircle : faXmarkCircle} className={`${q.pivot.correct ? "text-green-900" : "text-red-900"}`}/>
                                                                <p className="text-xs text-unactive">Question {idx + 1}</p>
                                                            </div>
                                                        ))

                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <ScrollBar orientation="horizontal"/>
                        </ScrollArea>
                    </div>
                : null
                }

            </div>
        </div>

        <ReportGenerationModal open={openReportGenerationModal} close={()=>{setOpenReportGenerationModal(false)}} usedFor={reportType} courseToReport={course} generated={()=>setGenerated(true)} setSuccess={()=>setSuccess(true)}/>
        <ReportGeneratedModal open={generated} close={()=>{setGenerated(false); setTimeout(() => setSuccess(false), 5000)}} type={success}/>


        {
            assessmentItem && Object.keys(assessmentItem).length === 0 ? null :
            <AssessmentOverviewModal open={open} close={()=>{setOpen(false)}} assessment={assessmentItem}/>
        }
        </>
    )
}
export default CourseReport;
