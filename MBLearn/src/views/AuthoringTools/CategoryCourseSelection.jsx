import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosClient from "MBLearn/src/axios-client";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { AuthoringToolProvider, useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { useDivisionCourses } from "MBLearn/src/contexts/DivisionCoursesContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";

export function CategoryCourseSelection({ categoryId, allCourses = [] }) {
    const { setShowBack, setPageTitle } = useStateContext();
    const { divisionId } = useParams();
    const { division } = useDivisionCourses();
    const { career_level } = useAuthoringTool();
    const [tab, setTab] = useState("");
    const navigate = useNavigate();
    const { setCourse } = useCreateCourse();

    const filteredCourses = categoryId
        ? allCourses.filter((course) => course.category_id === categoryId)
        : allCourses;

    useEffect(() => {
        setShowBack(false);
        setPageTitle("DASHBOARD");
    }, [setShowBack, setPageTitle]);

   return (
    <ScrollArea className="h-[calc(100vh-150px)] overflow-auto p-4">
        <div className="grid h-full w-full grid-cols-3 gap-2 p-4">
            {filteredCourses.length === 0 ? (
            <div className="h-full w-full col-span-3 flex flex-col items-center justify-center">
                <div className="w-24 h-24 text-primary bg-primarybg rounded-full items-center justify-center flex mb-4">
                <FontAwesomeIcon icon={faXmark} className="text-5xl" />
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                <p className="text-primary font-header text-2xl">No Course yet</p>
                <p className="text-xs">
                    There is no course distributed yet.
                </p>
                </div>
            </div>
            ) : (
            filteredCourses.map((item, index) => (
                <div
                key={index}
                className="shadow-md h-40 border rounded-md flex flex-col relative hover:cursor-pointer"
                onClick={() => {
                    navigate(`/SubjectMatterExpert/preview/${item.id}`);
                    setCourse(item);
                }}
                >
                <div className="h-full w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-md">
                    <img src={`${item.ImagePath}`} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="absolute h-full w-full text-white rounded-md bg-gradient-to-b from-transparent to-black p-4 flex flex-col justify-between">
                    <div></div>
                    <div>
                    <p className="font-text text-xs text-white">{item.CourseID}</p>
                    <p className="font-header text-sm">{item.CourseName}</p>
                    </div>
                </div>
                </div>
            ))
            )}
        </div>
    </ScrollArea>
    );
}

