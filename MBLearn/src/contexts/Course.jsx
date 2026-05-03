import { createContext, useContext, useState } from "react";

const CourseContext = createContext({
    course: {},
    setCourse: () => {},
});

export const CourseProvider = ({children}) => {
    const [course, _setCourse] = useState(null);

    const setCourse = (c) => {
        _setCourse(c);
    }

    return (
        <CourseContext.Provider value={{course, setCourse}}>
            {children}
        </CourseContext.Provider>
    )
}

export const useCourse = () => useContext(CourseContext);
