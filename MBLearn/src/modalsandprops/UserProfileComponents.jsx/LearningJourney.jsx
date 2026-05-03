import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "MBLearn/src/axios-client";
import { Progress } from "MBLearn/src/components/ui/progress";
import { useEffect, useState } from "react";import { faArrowDownAZ, faArrowDownShortWide, faArrowUpAZ, faArrowUpWideShort, faFilter, faSearch, faSort, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select,
        SelectTrigger,
        SelectValue,
        SelectContent,
        SelectItem
} from "MBLearn/src/components/ui/select";
import { Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger, } from "MBLearn/src/components/ui/sheet";
import CourseCard from "../CourseCard";

const LearningJourney = ({type, setType, sort, setSort, fetching, courses}) => {

    const toggleSort = (key,value) => {
        setSort((prev => ({
            ...prev,
            [key]:value,
        })));
    }
    const setOrder = (key) => {
        const order = sort[key] === "none" ? "asc" : sort[key] === "asc" ? "desc" : "none";
        toggleSort(key, order);
    }

    return(
        <div className="grid grid-cols-4 lg:grid-rows-[min-content_1fr] grid-rows-[min-content_min-content_1fr] w-full h-full">
            <div className="lg:col-span-2 col-span-4 py-1 flex flex-row items-center justify-between gap-2">
                {/* Type */}
                <Select value={type} onValueChange={(value) => {setType(value);}}>
                    <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white">
                        <SelectValue placeholder="Course Type" />
                    </SelectTrigger>
                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="ongoing">On-going</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="due">Due Time</SelectItem>
                    </SelectContent>
                </Select>
                {/* Sorter */}
                {/* ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"} */}
                <div className={`h-fit flex flex-row items-center justify-between border-2 border-primary py-2 px-4 font-header rounded-md text-primary gap-2 md:w-fit w-full  transition-all ease-in-out shadow-md hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer ${sort.name === "asc" ? 'bg-primary text-white' : sort.name === "desc" ? 'bg-primary text-white': 'bg-white' }`}
                    onClick={() => {
                        setOrder("name")
                    }}>
                    <p>Name</p>
                    <FontAwesomeIcon icon={sort.name === "asc" ? faArrowUpAZ : sort.name === "desc" ? faArrowDownAZ : faSort}/>
                </div>
                <div className={`h-fit flex flex-row items-center justify-between border-2 border-primary py-2 px-4 font-header rounded-md text-primary gap-2 md:w-fit w-full transition-all ease-in-out shadow-md  hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer ${sort.created_at === "asc" ? 'bg-primary text-white' : sort.created_at === "desc" ? 'bg-primary text-white': 'bg-white' }`}
                    onClick={() => {
                        setOrder("created_at")
                    }}>
                    <p>Date</p>
                    <FontAwesomeIcon icon={sort.created_at === "asc" ? faArrowUpWideShort : sort.created_at === "desc" ? faArrowDownShortWide : faSort}/>
                </div>
            </div>
            <div className="lg:col-span-2 col-span-4 py-1 flex flex-row items-center justify-end gap-2">
                <div>
                    <Sheet>
                            <SheetTrigger>
                                {/* ${isFiltered ? "bg-primary text-white":"bg-white text-primary"} */}
                                <div className={`w-11 h-11 flex justify-center items-center border-2 border-primary rounded-md shadow-md hover:cursor-pointer hover:scale-105 text-primary bg-white hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out `}>
                                    <FontAwesomeIcon icon={faFilter}/>
                                </div>
                            </SheetTrigger>
                            <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                            <SheetContent className="h-full flex-col flex">
                                <SheetTitle className="text-primary font-header text-lg">Course Filter</SheetTitle>
                                <SheetDescription className="text-unactive font-text text-xs">Select option to categorize and filter the given entries</SheetDescription>
                                {/* WLa pang filter toh */}
                            </SheetContent>
                    </Sheet>
                </div>
                <div className="lg:w-72 w-full">
                    <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
                        <div className='bg-primary py-2 px-4 text-white'>
                            <FontAwesomeIcon icon={faSearch}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`col-span-4 grid gap-2 py-2 grid-cols-2 grid-rows-[min-content_min-content_min-content_min-content]
                            lg:grid-cols-4 lg:grid-rows-2`}>
                {
                    fetching ?
                    Array.from({length: 8}).map((_,index) => (
                        <div key={index} className="w-full h-full border border-divider rounded-md bg-white shadow-md animate-pulse flex flex-col items-center justify-center min-h-32"/>
                    ))
                    : courses?.length === 0 ?
                    <div className="col-span-4 row-span-2 flex items-center justify-center font-text flex-col gap-4 text-xs text-unactive">
                        <div className="w-24 h-24 bg-primarybg rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faXmark} className="text-primary text-6xl"/>
                        </div>
                        <p>No Course Available to display here yet.</p>
                    </div>
                    : courses?.map((course) => (
                        <CourseCard key={course.id} course={course} type={"profile_journey"}/>
                    ))
                }
            </div>
        </div>
    )
}
export default LearningJourney;
