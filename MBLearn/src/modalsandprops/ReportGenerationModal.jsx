import { faBookReader, faCalendar, faCircleCheck, faFilter, faGraduationCap, faSliders, faSpinner, faUserGear, faUserShield, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import * as Yup from "yup"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetOverlay, SheetPortal } from "../components/ui/sheet";
import { useOption } from "../contexts/AddUserOptionProvider";
import { useStateContext } from "../contexts/ContextProvider";
import UserFilterProps from "./UserFilterProps";
import { toast } from "sonner";



const ReportGenerationModal = ({open, close, usedFor, generated, userToReport, setSuccess, setMessage, courseToReport}) => {
    const {departments,cities,location, division, section, roles} = useOption()
    const {user} = useStateContext()
    const [generating, setGenerating] = useState(false);
    const [dateRange, setDateRange] = useState({
        "start": new Date(),
        "end": undefined,
    });
    const [filtered, setFiltered] = useState(false);
    const [numberOfFiltered, setNumberOfFiltered] = useState(0);
    const date = format(new Date(), 'MMMM dd, yyyy');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [openSheet, setOpenSheet] = useState(false);

    const filter = useFormik({
        initialValues: {
            division: '',
            department: '',
            careerLevel: '',
            title: '',
            city: '',
            branch: '',
        }
    })

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            reportEntriesStartDate: '',
            reportEntriesEndDate: '',
            user_name: user.user_infos.last_name+" "+user.user_infos.first_name,
            ...(usedFor === "roleDistribution" && { role_selected: [] }),
            ...(usedFor === "accountStatus" && { role: '' }),
            ...(usedFor === "userLogs" && {id: userToReport?.user_infos?.id }),
            ...((usedFor === "coursePerformance" || usedFor === "courseTimeline" || usedFor === "courseCertification")  && { course_id: courseToReport.id }),
        },
        // validationSchema: Yup.object({
        //     reportEntriesStartDate: Yup.string()
        //         .required("required"),
        //     reportEntriesEndDate: Yup.string()
        //         .required("required"),
        // }),
        onSubmit: (values) => {
            console.log("Form Values:", values);
            generate()
        }
    })

    const reportEntriesDateChange = () => (range) => {
        const start = range.from;
        const end = range.to ?? range.from;

        formik.setFieldValue('reportEntriesStartDate', format(new Date(start), 'MMMM dd, yyyy'));
        formik.setFieldValue('reportEntriesEndDate', format(new Date(end), 'MMMM dd, yyyy'));
        setDateRange(range)
    }

    const title = (usedFor) => {
        switch (usedFor) {
            case 'masterList':
                return "Master List";
                break;
            case 'roleDistribution':
                return "Role Distribution";
                break;
            case 'accountStatus':
                return "Account Status";
                break;
            case 'userLogs':
                return "User Logs";
                break;
            case 'coursePerformance':
                return "Course Performance";
                break;
            case 'courseTimeline':
                return "Course Timeline";
                break;
            case 'courseCertification':
                return "Course Certification";
                break;
            default:
                return "Report";
                break;
        }
    }

    const handleSelectRole = (role) => {
        const role_array = formik.values.role_selected;
        const isSelected = role_array.includes(role);

        if (isSelected) {
            formik.setFieldValue('role_selected', role_array.filter(r => r !== role));
        }
        else {
            formik.setFieldValue('role_selected', [...role_array, role]);
        }
    }
    const includedRoles = (role) => {
        if (!formik.values.role_selected) return false;
        return formik.values.role_selected.includes(role);
    }


    const type = () => {
        switch (usedFor) {
            case 'masterList':
                return 'userList';
            case 'roleDistribution':
                return 'roleDistribution';
            case 'accountStatus':
                return 'accountStatus';
            case 'userLogs':
                return 'userLogs'
            case 'coursePerformance':
                return 'coursePerformance';
            case 'courseTimeline':
                return 'courseTimeline';
            case 'courseCertification':
                return 'courseCertification';
            default:
                return '';
        }
    }

    const filterValues = () => {
        if( usedFor === 'masterList' || usedFor === 'roleDistribution' || usedFor === 'accountStatus') {
            return `?division_id[eq]=${filter.values.division}&department_id[eq]=${filter.values.department}`
        } else {
            return ""
        }
    }
    //division_id[eq]=${filter.values.division}&department_id[eq]=${filter.values.department}&section_id[eq]=${filter.values.section}&branch_id[eq]=${filter.values.branch}
    const generate = () => {
        setGenerating(true);
        axiosClient.post(`/report/${type()}${filterValues()}`,
            formik.values,
            {responseType: 'blob'}
            ).then((res) => {
                setGenerating(false);
                setTimeout(()=>{
                    formik.resetForm();
                    filter.resetForm();
                    setDateRange({
                        "start": new Date(),
                        "end": undefined,
                    });
                },1000)
                setSuccess();
                generated();
                close();
                console.log("Report generated successfully:", res);
                //Link to download
                let fileName = '';
                const disposition = res.headers['content-disposition'];
                if (disposition && disposition.includes('filename=')) {
                    fileName = disposition
                        .split('filename=')[1]
                        .replace(/['"]/g, '') // remove quotes if any
                        .trim();
                }
                //console.log("Content-Disposition header:", fileName);


                const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                // const blob = new Blob([res.data], { type: 'application/pdf' });
                // const url = window.URL.createObjectURL(blob);

                // // Open PDF in a new browser tab
                // window.open(url, '_blank');

                // // Optional: revoke after a delay so the PDF has time to load
                // setTimeout(() => {
                // window.URL.revokeObjectURL(url);
                // }, 1000);

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
            });
    }

    useEffect(() => {
        const HashChanged = Object.keys(filter.initialValues).some(
            key => filter.values[key] !== filter.initialValues[key]
        );
        const changes = Object.keys(filter.initialValues).filter(
            key => filter.values[key] !== filter.initialValues[key]
        ).length;

        setNumberOfFiltered(changes);
        setFiltered(HashChanged);

    },[filter.values])

    useEffect(() => {
        // console.log("Selected Columns:", cols);
        //console.log("Dates:", formik.values.expiration);
        // console.log("Filter Values:", filter.values);
        // console.log("City ID Filter:", filter.values?.city);
        //console.log("Selected Roles:", selectedRoles);
        //console.log("Used For:", usedFor);
    },[usedFor])


    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[100vw]
                                                            md:w-[50vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Generate {title(usedFor)} Report</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Enter the proper parameter for the following to generate an accurate report</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={()=>{
                                                    setTimeout(()=>{
                                                        formik.resetForm();
                                                        filter.resetForm();
                                                        setDateRange({
                                                            "start": new Date(),
                                                            "end": undefined,
                                                        });
                                                    },1000)
                                                    close()
                                                }}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <form className="px-4 py-1 grid grid-cols-4" onSubmit={formik.handleSubmit}>
                                        {
                                            usedFor === 'roleDistribution' ?
                                            <div className="py-2 col-span-4 flex flex-col gap-1">
                                                <p className="font-text text-xs flex flex-row justify-between row-start-1 col-start-3">Roles to be reported</p>
                                                <div className="grid grid-cols-2 grid-rows-2 gap-2 ">
                                                    <div className={`flex flex-row items-center text-primary font-header px-4 py-2 w-full h-full border-primary border-2 rounded-md  shadow-md hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out
                                                                    ${includedRoles('1') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                                                        onClick={() => handleSelectRole('1')}>
                                                        <FontAwesomeIcon icon={faUserShield} className="mr-2"/>
                                                        <p>System Admin</p>
                                                    </div>
                                                    <div className={`flex flex-row items-center text-primary font-header px-4 py-2 w-full h-full border-primary border-2 rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out
                                                                    ${includedRoles('2') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                                                        onClick={() => handleSelectRole('2')}>
                                                        <FontAwesomeIcon icon={faBookReader} className="mr-2"/>
                                                        <p>Course Admin</p>
                                                    </div>
                                                    <div className={`flex flex-row items-center text-primary font-header px-4 py-2 w-full h-full border-primary border-2 rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out
                                                                    ${includedRoles('3') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                                                        onClick={() => handleSelectRole('3')}>
                                                        <FontAwesomeIcon icon={faGraduationCap} className="mr-2"/>
                                                        <p>Learner</p>
                                                    </div>
                                                    <div className={`flex flex-row items-center text-primary font-header px-4 py-2 w-full h-full border-primary border-2 rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out
                                                                    ${includedRoles('4') ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                                                        onClick={() => handleSelectRole('4')}>
                                                        <FontAwesomeIcon icon={faUserGear} className="mr-2"/>
                                                        <p>Subject Matter Expert</p>
                                                    </div>

                                                </div>
                                            </div> : null
                                        }
                                        {
                                            usedFor === 'accountStatus' ? <>
                                            <div className="py-2 col-span-4 flex flex-col gap-1">
                                                <p className="font-text text-xs flex flex-row justify-between row-start-1 col-start-3">Account Status</p>
                                                <div className="inline-flex flex-col gap-1">
                                                    <div className="grid grid-cols-1">
                                                        <select id="role" name="role" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                            value={formik.values.role}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            >
                                                            <option value=''>Select Account Role</option>
                                                            {/* <option value='1'>System Admin</option>
                                                            <option value='2'>Course Admin</option>
                                                            <option value='3'>Learner</option>
                                                            <option value='4'>Subject Matter Expert</option> */}
                                                            {
                                                                roles.map((role) => (
                                                                    <option key={role.id} value={role.id}>{role.role_name}</option>
                                                                ))
                                                            }
                                                        </select>
                                                        <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            </>
                                            : usedFor === 'userLogs' ? <>
                                            <div className="py-2 col-span-4 flex flex-col gap-1">
                                                <p className="font-text text-xs flex flex-row justify-between row-start-1 col-start-3">Selected User Logs of</p>
                                                <div className="flex flex-row justify-between items-center">
                                                    <div>
                                                        <p className="font-header text-primary">{userToReport?.user_infos?.first_name} {userToReport?.user_infos?.middle_name ? userToReport?.user_infos?.middle_name : ""} {userToReport?.user_infos?.last_name}</p>
                                                        <p className="font-text text-xs">ID: {userToReport?.user_infos?.employeeID} | {userToReport?.MBemail}</p>
                                                    </div>
                                                    <div>
                                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{userToReport?.user_infos?.roles?.[0]?.role_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            </>
                                            : usedFor === 'coursePerformance' || usedFor === 'courseTimeline' || usedFor === 'courseCertification' ?
                                            <div className="py-2 col-span-4 flex flex-col gap-1">
                                                <p className="font-text text-xs flex flex-row justify-between row-start-1 col-start-3">Selected Course:</p>
                                                <div className="flex flex-row justify-between items-center">
                                                    <div>
                                                        <p className="font-header text-primary">{courseToReport.courseName}</p>
                                                        <p className="font-text text-xs">{courseToReport.courseID} </p>
                                                    </div>
                                                    <div>
                                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{courseToReport.training_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            : <>
                                            <div className="py-2 col-span-4 flex flex-col gap-1">
                                                <p className="font-text text-xs flex flex-row justify-between row-start-1 col-start-3">Report Filter</p>
                                                <div className="col-span-2 row-start-2 col-start-3">
                                                    <Sheet onOpenChange={setOpenSheet} open={openSheet}>
                                                        <SheetTrigger className="w-full">
                                                            <div className={`flex flex-row items-center gap-2 border-2 border-primary px-4 py-2 rounded-md font-header text-primary hover:bg-primaryhover hover:cursor-pointer transition-all ease-in-out hover:text-white hover:border-primaryhover
                                                                            ${filtered ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary"}`}>
                                                                {
                                                                    filtered ? <>
                                                                        <div className="flex flex-row items-center gap-2 justify-between w-full">
                                                                            <div className="flex flex-row items-center gap-2">
                                                                                <FontAwesomeIcon icon={faFilter}/>
                                                                                <p>Filtered</p>
                                                                            </div>
                                                                            <div>
                                                                                <p>{numberOfFiltered}</p>
                                                                            </div>
                                                                        </div>
                                                                    </>:
                                                                    <>
                                                                        <FontAwesomeIcon icon={faFilter}/>
                                                                        <p>Select Filter</p>
                                                                    </>
                                                                }
                                                            </div>
                                                        </SheetTrigger>
                                                        <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                                                        <SheetContent>
                                                            <SheetTitle className="font-header text-primary sr-only">Filter Entries</SheetTitle>
                                                            <SheetDescription className="font-text text-xs sr-only">Filter entries to be selected in the report</SheetDescription>
                                                            <UserFilterProps formik={filter} used_to={"report"} close={()=>setOpenSheet(false)}/>

                                                        </SheetContent>
                                                    </Sheet>
                                                </div>
                                            </div>
                                            </>
                                        }
                                        <div className="py-2 col-span-4 grid-cols-[1fr_1fr_min-content] grid gap-x-2">
                                            <p className="font-text text-xs flex flex-row justify-between col-span-3">Report Entries Scopes</p>
                                            <div className="">
                                                <input type="text" name="reportEntriesStartDate"
                                                    readOnly
                                                    value={formik.values.reportEntriesStartDate}
                                                    onChange={formik.handleChange}
                                                    className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                                <div className="flex flex-row justify-between items-center">
                                                    <p className="font-text text-xs pt-1">Starting Date<span className="text-red-500">*</span></p>
                                                    {formik.touched.reportEntriesStartDate && formik.errors.reportEntriesStartDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesStartDate}</div>):null}
                                                </div>
                                            </div>
                                            <div className="">
                                                <input type="text" name="reportEntriesStartDate"
                                                    readOnly
                                                    value={formik.values.reportEntriesEndDate}
                                                    onChange={formik.handleChange}
                                                    className={`font-text border border-divider rounded-md p-2 w-full `}/>
                                                <div className="flex flex-row justify-between items-center">
                                                    <p className="font-text text-xs pt-1">Ending Date<span className="text-red-500">*</span></p>
                                                    {formik.touched.reportEntriesEndDate && formik.errors.reportEntriesEndDate ? (<div className="text-red-500 text-xs font-text">{formik.errors.reportEntriesEndDate}</div>):null}
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
                                    </form>

                                    {/* Action */}
                                    <div className="flex flex-row justify-between items-center gap-2 px-4">
                                        <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                            onClick={()=>{close()}}>
                                            <p className="font-header">Cancel</p>
                                        </div>
                                        <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white transition-all ease-in-out ${generating || (formik.values.reportEntriesStartDate === '' && formik.values.reportEntriesEndDate === "") ? "opacity-50 hover:cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white"}`}
                                            onClick={() => {
                                                if(generating || (formik.values.reportEntriesStartDate === '' && formik.values.reportEntriesEndDate === "")) return;
                                                formik.handleSubmit()}}>
                                            {
                                                generating ? <div className="flex flex-row items-center justify-center">
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2"/>
                                                    <p className="font-header">Generating...</p>
                                                </div> : <>
                                                    <p className="font-header">Generate</p>
                                                </>
                                            }
                                        </div>
                                    </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    );
}
export default ReportGenerationModal;
