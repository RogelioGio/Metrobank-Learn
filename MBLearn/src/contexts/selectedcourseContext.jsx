import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axios-client";


const SelectedCourse = createContext()
export const SelectedCourseProvider = ({children}) => {
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseID, setCourseID] = useState(null)
    const [isFetching, setIsFetching] = useState(false);
    const [Course, _setCourse] = useState(null);

    useEffect(() => {
        setIsFetching(true)
        if (courseID !== undefined && courseID !== null) { // Ensuring courseID is valid
            axiosClient.get(`/coursecontext/${courseID}`)
            .then(({data}) => {
                setSelectedCourse(data)
                setIsFetching(false)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [courseID]);

    const SetCourse = (course) => {
        _setCourse(course);
        console.log("Course set:", course);
    }

    const selectCourse = (id) => {
        if (id === courseID && selectedCourse) {
            setIsFetching(false);
            return; // Prevent unnecessary state updates
        }
        setIsFetching(true);
        setCourseID(id);
    }

    const resetSelectedCourse = (id) => {
        if (id !== courseID && selectedCourse) {
            setIsFetching(true);
            setSelectedCourse(null);
        }
    }

    return (
        <SelectedCourse.Provider value={{selectedCourse, selectCourse, resetSelectedCourse,isFetching, Course, SetCourse}}>
            {children}
        </SelectedCourse.Provider>
    )
}
export const useCourse = () => useContext(SelectedCourse)
