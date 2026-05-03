import { faGear, faPencil, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import CourseAssesmentManagementItems from "./CourseAssesmentManagementItems";
import CourseAssesmentManagementModal from "./CourseAssessmentManagementModal";




const CourseAssesmentManagement = ({assessmentItem, refresh}) => {
    const [assessment, setAssesment] = useState(assessmentItem.content);
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);

    // useEffect(() => {
    //     console.log("Anskey toggled:", showAnswerKey);
    // }, [showAnswerKey]);

    // Setting must includes:
    // - Passing Average - toggle and perccentage
    // - Time Limit - toggle and time in must be in selector and have max
    // - Max Attempts - toggle and number of attempts or unlimited
    // - Shows Attempts History - toggle and show history of attempts
    // - Show Answer Key - toggle and show answer key when the attempt history is toggled


    // const division = () => {
    //     return (
    //         <>
    //             <div className="group">
    //                         <div className="min-h-10 h-10 w-10 rounded-md border-primary border-2 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer"
    //                             onClick={() => {setOpenSetting(true)}}>
    //                             <FontAwesomeIcon icon={faSliders}/>
    //                         </div>
    //                         <div className="w-fit mt-1 absolute whitespace-nowrap bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center text-center scale-0 group-hover:scale-100 block transition-all ease-in-out">
    //                             <p>Course Assesment Setting</p>
    //                         </div>
    //                     </div>
    //                 <div className="grid grid-cols-[1fr_1fr_1fr] justify-between w-full">
    //                     <div className="w-full whitespace-nowrap">
    //                         <p className="text-xs font-text text-unactive">Total Questions:</p>
    //                         <p className="font-header text-primary">{assessment.assesmentItems.length} {assessment.assesmentItems.length === 1 ? "Question" : "Questions" }</p>
    //                     </div>
    //                     <div className="w-full whitespace-nowrap">
    //                         <p className="text-xs font-text text-unactive">Total Points:</p>
    //                         <p className="font-header text-primary">{assessment.assesmentItems.reduce((acc, i) => acc + i.points,0)} {assessment.assesmentItems.reduce((acc, i) => acc + i.points,0) === 1 ? "Point" : "Points" }</p>

    //                     </div>
    //                     <div className="w-full whitespace-nowrap">
    //                         <p className="text-xs font-text text-unactive">Passing Average:</p>
    //                         <p className="font-header text-primary">{assessment.passing}% Average</p>
    //                     </div>
    //                     <div className="w-full whitespace-nowrap">
    //                         <p className="text-xs font-text text-unactive">Max Attempt:</p>
    //                         <p className="font-header text-primary">{assessment.maxAttempts} {assessment.maxAttempts === 1 ? "Attempt" : "Attempts"}</p>

    //                     </div>
    //                     <div className="w-full whitespace-nowrap">
    //                         <p className="text-xs font-text text-unactive">Time Limit:</p>
    //                         <p className="font-header text-primary">{formatTime(assessment.timeLimit)} {assessment.timeLimit === 60 ? "minute" : assessment.timeLimit < 60 ? "second" : "minutes"}</p>
    //                     </div>
    //                 </div>
    //         </>
    //     )
    // }

    return (
        <>
            <div className="grid grid-cols-1 grid-rows-[min-content_min-content-1fr] h-full">
                {/* Header */}
                <div className="flex flex-row justify-between items-end">
                    <p className="text-xs font-text text-unactive">Assesment Overview</p>
                    <div className="flex items-center justify-center bg-white border-primary border-2 w-8 h-8 rounded-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                        onClick={()=>{setOpenSetting(true)}}>
                        <FontAwesomeIcon icon={faGear}/>
                    </div>
                </div>
                <div className="py-2 grid grid-cols-[1fr_1fr_1fr_1fr] gap-2">
                    {/* <div className="group">
                        <div className="min-h-10 h-10 w-10 rounded-md border-primary border-2 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer"
                            onClick={() => {setOpenSetting(true)}}>
                            <FontAwesomeIcon icon={faSliders}/>
                        </div>
                        <div className="w-fit mt-1 absolute whitespace-nowrap bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center text-center scale-0 group-hover:scale-100 block transition-all ease-in-out">
                            <p>Course Assesment Setting</p>
                        </div>
                    </div> */}
                    <div className="border-2 border-primary rounded-md bg-white p-4">
                        <p className="text-xs font-text text-unactive">Total Questions:</p>
                        <p className="font-header text-primary">{assessment.length} {assessment.length === 1 ? "Question" : "Questions" }</p>
                    </div>
                    <div className="border-2 border-primary rounded-md bg-white p-4">
                        <p className="text-xs font-text text-unactive">Total Points:</p>
                        <p className="font-header text-primary">{(() => {
                            const total = assessment.reduce((acc, i) => {
                            const block = JSON.parse(i.BlockData);
                            return acc + Number(block.points || 0);
                            }, 0);

                            return `${total} ${total === 1 ? "Point" : "Points"}`;
                        })()}</p>

                    </div>
                    <div className="border-2 border-primary rounded-md bg-white p-4">
                        <p className="text-xs font-text text-unactive">Passing Average:</p>
                        <p className="font-header text-primary">{assessmentItem.passing_percentage}% Average</p>
                    </div>
                    <div className="border-2 border-primary rounded-md bg-white p-4">
                        <p className="text-xs font-text text-unactive">Max Attempt:</p>
                        <p className="font-header text-primary">{assessmentItem.max_attempt} {assessmentItem.max_attempt >= 1 ? "Attempts" : "Attempt"}</p>
                    </div>

                </div>
                {/* Toggle Answer key */}
                <div className="flex items-center justify-between py-2 font-text text-unactive text-xs">
                    <p className="text-xs font-text">Assesment Items</p>
                </div>
                <ScrollArea className="h-[calc(100vh-19.8rem)] rounded-md bg-white shadow-md border-divider border ">
                    <div className="flex flex-col gap-4 p-4 ">
                    {
                        assessment.map((item, index) => {
                            const questionData = JSON.parse(item.BlockData)
                            return (
                                <CourseAssesmentManagementItems index={index} questionData={questionData} item={item}/>
                            )
                        })
                    }
                    </div>
                </ScrollArea>
                {/* Content */}
                {/* <ScrollArea className="h-[calc(100vh-22rem)] pr-5 rounded-md bg-white shadow-md border-divider border">
                    <div className="p-4 pr-0 flex-col gap-y-2 flex items-center justify-center h-full">
                        {assessment.assesmentItems.map((item, index) => (
                            <CourseAssesmentManagementItems key={index} item={item} index={assessment.assesmentItems.findIndex(entry => entry.id === item.id)} show={showAnswerKey}/>
                        ))}
                    </div>
                </ScrollArea> */}
            </div>
            <CourseAssesmentManagementModal open={openSetting} close={() => {setOpenSetting(false)}} assessment={assessmentItem} refresh={()=>refresh()}/>
        </>
    )
}

export default CourseAssesmentManagement;
