import { Children, createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axios-client";

const CourseOption = createContext();

export const CourseListProvider = ({children}) => {
    const [courseContext, setCourseContext] = useState({
        coursetypes: [],
        coursecategories: [],
        departments:[],
        cities:[],
        branches:[],
        divisions:[],
        sections: [],
    })

    useEffect(() => {
        const fetchCourseContext = () => {
            axiosClient.get('/coursecontext')
            .then((res) => {
                setCourseContext(res.data)
            }).catch((err)=> console.log(err))
        }

        fetchCourseContext()
    },[])
    return(
        <CourseOption.Provider value={courseContext}>
            {children}
        </CourseOption.Provider>
    )
}
export const useCourseContext = () => useContext(CourseOption)
