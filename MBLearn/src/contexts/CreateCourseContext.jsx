import { createContext, useContext, useState } from "react";

const CreateCourseContext = createContext({
    course: {},
    setCourse: () => {},
})

export const CreateCourseProvider = ({children}) => {
    const [course, _setCourse] = useState(null);

    const setCourse = (c) => {
        _setCourse(c);
    }

    return (
        <CreateCourseContext.Provider value={{course, setCourse}}>
            {children}
        </CreateCourseContext.Provider>
    )

}
export const useCreateCourse = () => useContext(CreateCourseContext);
