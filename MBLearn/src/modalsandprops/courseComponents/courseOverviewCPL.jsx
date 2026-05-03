import { useEffect } from "react";
import { useState } from "react";
import axiosClient from "../../axios-client";
import { useParams } from "react-router-dom";
import { useCourse } from "MBLearn/src/contexts/selectedcourseContext";
import CourseLoading from "../../assets/Course_Loading.svg";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";

const CourseOverviewCPL = ({overview, objective}) => {
    
    const [isLoading ,setLoading] = useState(false);

    return (
        <ScrollArea className="h-[calc(100vh-11rem)] border border-divider rounded-md bg-white">
            <div className="p-4 flex flex-col gap-2">

                {/* Overview */}
                <div className="flex flex-col gap-2 border-b pb-4">
                    <p className="font-header text-2xl text-primary">Overview</p>
                    <div
                        className="font-text text-md text-unactive     [&>p]:mb-2 
                            [&>ul]:list-disc [&>ul]:pl-5 
                            [&>ol]:list-decimal [&>ol]:pl-5 
                            [&>li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: overview || "No course overview found." }}
                    />
                </div>

                {/* Objective */}
                <div className="flex flex-col gap-2">
                    <p className="font-header text-2xl text-primary">Objective</p>
                    <div
                        className="font-text text-md text-unactive     [&>p]:mb-2 
                            [&>ul]:list-disc [&>ul]:pl-5 
                            [&>ol]:list-decimal [&>ol]:pl-5 
                            [&>li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: objective || "No course objective found." }}
                    />
                </div>
            </div>
        </ScrollArea>
    );
};


export default CourseOverviewCPL
