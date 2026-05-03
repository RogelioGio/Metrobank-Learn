import { createContext, useContext, useState } from "react";


const LessonCanvasContext = createContext({
    lesson: {},
    setLesson: () => {},
})

export const LessonCanvasProvider = ({children}) => {
    const [lesson, _setLesson] = useState(null);

    const setCourse = (c) => {
        _setCourse(c);
    }

    const setLesson = (l) => {
        _setLesson(l);
    }

    return (
        <LessonCanvasContext.Provider value={{lesson, setLesson}}>
            {children}
        </LessonCanvasContext.Provider>
    )
}

export const useLessonCanvas = () => useContext(LessonCanvasContext);
