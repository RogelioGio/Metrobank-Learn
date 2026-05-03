import { createContext, useState, useContext, useEffect } from "react";

const DivisionCourseContent = createContext({
    division : null,
    courses: [],
    setDivision: () => {},
    setCourses: () => [],
})


export const DivisionCoursesProvider = ({children}) => {
    const [division, _setDivision] = useState(null);
    const [courses, _setCourses] = useState([]);

    const setDivision = (division) => {
        _setDivision(division);
    }

    const setCourses = (courses) => {
        _setCourses(courses);
    }

    return (
        <DivisionCourseContent.Provider value={{
            division,
            courses,
            setDivision,
            setCourses
        }}>

            {children}
        </DivisionCourseContent.Provider>
    )
}

export const useDivisionCourses = () => useContext(DivisionCourseContent);
