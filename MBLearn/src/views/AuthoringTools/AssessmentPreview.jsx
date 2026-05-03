import { faCheckCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"


const AssessmentPreview = ({assessment, assessmentDescription}) => {
    useEffect(()=>{
        console.log("bat wala", assessment)
    },[assessment])

    const [assessmentItems, setAssesmentItems] =useState([])

    const Itemparsing = (assessment) => {
        return assessment.map(item => ({
            id: item.id,
            questionType: item.QuestionType,
            blockData: JSON.parse(item.BlockData)
        }))
    }

    useEffect(()=>{
        setAssesmentItems(assessment)
        console.log(assessmentItems)
    },[assessment])

    return(
        <div className="flex flex-col gap-4">
            {assessmentDescription && (
                <div className="flex flex-col gap-2 border-b border-divider pb-4">
                    <p className="font-header text-xl text-primary">Test Description</p>
                    <p className="font-text text-sm text-unactive">
                        {assessmentDescription}
                    </p>
                </div>
            )}
            <div className="flex flex-col gap-2">
                {
                    assessmentItems.map((item, index) => {
                        let answers
                        switch(item.QuestionType){
                            case "trueOrfalse":
                                answers = (
                                    <div className={`flex items-center justify-between gap-x-2 py-2`}>
                                        {
                                            item.BlockData?.choices.map((c,index)=>(
                                                <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md transition-all ease-in-out border-primary p-2
                                                    ${c.isCorrect ? "bg-primary text-white" : "bg-white text-primary"}`} >
                                                    <FontAwesomeIcon icon={c.isCorrect ? faCheckCircle : faXmarkCircle} className="mr-2"/>
                                                    <p>{c.text}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                                break
                            case "multipleChoice":
                                answers = (
                                    <div className={`grid grid-cols-2 grid-rows-2 items-center justify-between gap-2 py-2`}>
                                        {
                                            item.BlockData?.choices.map((c,index) => (
                                                <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md transition-all ease-in-out border-primary p-2
                                                    ${c.isCorrect ? "bg-primary text-white" : "bg-white text-primary"}`} >
                                                    <FontAwesomeIcon icon={c.isCorrect ? faCheckCircle : faXmarkCircle} className="mr-2"/>
                                                    <p>{c.text}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                                break
                            case "oneWordIdentification":
                            answers = (
                                <div>
                                    {
                                        item.BlockData?.choices.map((c,index) => (
                                            <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md transition-all ease-in-out border-primary p-2
                                                            ${c.isCorrect ? "bg-primary text-white" : "bg-white text-primary"}`} >
                                                <FontAwesomeIcon icon={c.isCorrect ? faCheckCircle : faXmarkCircle} className="mr-2"/>
                                                <p>{c.text}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                            break
                            case "multipleWordIdentification":
                            answers = (
                                <div className="flex flex-col gap-2">
                                    {
                                        item.BlockData?.choices.map((c,index) => (
                                            <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md transition-all ease-in-out border-primary p-2
                                                            ${c.isCorrect ? "bg-primary text-white" : "bg-white text-primary"}`} >
                                                <FontAwesomeIcon icon={c.isCorrect ? faCheckCircle : faXmarkCircle} className="mr-2"/>
                                                <p>{c.text}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                            break
                            case "likert":
                            answers = (
                                <div className="flex flex-col gap-2">
                                    {
                                        item.BlockData?.choices.map((c,index) => (
                                            <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md transition-all ease-in-out border-primary p-2 bg-white text-primary`} >
                                                <p>{c.text}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                            default: null
                        }
                        return(
                            <div className={`grid gird-cols-1 grid-rows-[min-content_1fr_min-content] gap-2 h-full w-full border p-4 rounded-md border-divider shadow-md bg-[hsl(210,19%,92%)]`}>
                                <div className="flex items-center justify-between">
                                    <p className={ `font-header text-primary text-sm`}>Question {index + 1}</p>
                                    <p className="text-xs font-text text-unactive">{item.BlockData?.points} points</p>
                                </div>
                                <div className="text-sm font-text break-words line-clamp-3">
                                    {item.BlockData.question}
                                </div>
                                {answers}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
export default AssessmentPreview
