import { createContext, useContext, useState } from "react";

const AssessmentCanvasContext = createContext({
    assessment: {},
    setAssessment: () => {},
})

export const AssessmentCanvasProvider = ({children}) => {
    const [assessment, _setAssessment] = useState({});

    const setAssessment = (a) => {
        _setAssessment(a);
    }

    return (
        <AssessmentCanvasContext.Provider value={{assessment, setAssessment}}>
            {children}
        </AssessmentCanvasContext.Provider>
    )


}

export const useAssessmentCanvas = () => useContext(AssessmentCanvasContext);
