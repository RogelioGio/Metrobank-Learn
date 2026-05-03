import { faAsterisk, faCheck, faCheckCircle, faPenSquare, faPenToSquare, faStar, faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { useEffect } from "react";

const CourseAssesmentItem = ({assessmentItem, active, usedTo, assessmentItems, usedFor, handleAnswer, currentAttempt, attemptHistory, isCorrect, switchAnswer,}) => {

    //const selected = currentAttempt?.assesmentAnswers?.find(e => e.questionId === assesmentItem.id)?.answer;
    const selected = (() => {
        if(currentAttempt) {
            return currentAttempt.assesmentAnswers.find(e => e.questionId === assesmentItem.id)?.answer;
        } else if(attemptHistory) {
            return attemptHistory.result.find(e => e.questionId === assesmentItem.id)?.answer;
        }
    })() // Placeholder for selected answer logic, to be implemented based on the context

    const correctAnswer = (() => {
        if(attemptHistory) {
            return attemptHistory.result.find(e => e.questionId === assesmentItem.id)?.correctAnswer;
        }
    })()

    return(
        <div className={`grid gird-cols-1 grid-rows-[min-content_1fr_min-content] gap-2 h-full border p-4 rounded-md border-divider shadow-md bg-[hsl(210,19%,92%)]`}>
            <div className="flex items-center justify-between">
                <p className={ `font-header text-primary ${usedFor === "review" || usedFor === "attemptReview" ? "text-sm":"text-lg"}`}>Question {active + 1}</p>

                <div className="flex flex-row items-center gap-x-2">
                    <div className={`${usedFor === "attemptReview" ? "block" : "hidden"} font-text text-xs flex flex-row items-center gap-x-1`}>
                        {
                            selected === "" ?
                            <>
                                <FontAwesomeIcon icon={faAsterisk} className="text-red-700"/>
                                <p>No answer</p>
                            </>
                            : selected === correctAnswer ?
                            <FontAwesomeIcon icon={faCheck} className="text-green-700" />
                            : <FontAwesomeIcon icon={faXmark} className="text-red-700" />
                        }
                    </div>
                    <p className="text-xs font-text text-unactive">{assesmentItem.points} points</p>
                    <div className={`w-8 h-8 min-h-8 min-w-8 bg-white rounded-md shadow-md flex items-center justify-center border-primary border-2 text-primary hover:text-white hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out cursor-pointer
                                    ${usedFor === "review" ? "block":"hidden"}`}
                                    onClick={() => {switchAnswer()}}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </div>
                </div>
            </div>
            <div>
                <p className={`font-text ${usedFor === "review" || usedFor === "attemptReview" ? "text-sm":"text-base"}`}>
                    {assesmentItem.question}
                </p>
            </div>
            {
                assesmentItem.questionType === "trueOrfalse" ?
                <div className={`flex items-center justify-between gap-x-2 ${usedFor === "review" || usedFor === "attemptReview" ? "py-2": ""}`}>
                    <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md  transition-all ease-in-out
                                    ${selected === "true" &&  usedFor !== "attemptReview" ? "bg-primary text-white border-primary"
                                        : usedFor === "attemptReview" && selected === "true" && correctAnswer === "true" ? "bg-green-300 text-green-700 border-green-700"
                                        : usedFor === "attemptReview" && selected === "false" && correctAnswer === "true" ? "bg-green-300 text-green-700 border-green-700"
                                        : usedFor === "attemptReview" && selected === "true" && correctAnswer === "false" ? "bg-red-300 text-red-700 border-red-700"
                                        : usedFor === "attemptReview" && selected === "false" ? "opacity-50 bg-white text-primary border-primary"
                                        : usedFor === "review" || usedFor === "attemptReview" ? "opacity-50 bg-white text-primary border-primary"
                                        : "bg-white text-primary border-primary"}
                                    ${usedFor === "review" || usedFor === "attemptReview" ? "p-2 text-sm" : "p-4 text-lg hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                                    onClick={() => {
                                        if(usedFor === "review") return
                                        handleAnswer("true", assesmentItem.id)
                                    }}>
                            {
                                usedFor === "attemptReview" && selected === "true" && correctAnswer === "true" ?
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                                :usedFor === "attemptReview" && selected !== "true" && correctAnswer === "true" ?
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                                : usedFor === "attemptReview" && selected === "true" && correctAnswer === "false" ?
                                <FontAwesomeIcon icon={faXmarkCircle} className="text-red-700 mr-2" />
                                :null
                            }
                            <p>True</p>
                    </div>
                    <div className={`flex items-center justify-center w-full font-header border-2 rounded-md shadow-md  transition-all ease-in-out
                                    ${selected === "false" && usedFor !== "attemptReview" ? "bg-primary text-white border-primary"
                                        : usedFor === "attemptReview" && selected === "false" && correctAnswer === "false" ? "bg-green-300 text-green-700 border-green-700"
                                        : usedFor === "attemptReview" && selected === "true" && correctAnswer === "false" ? "bg-green-300 text-green-700 border-green-700"
                                        : usedFor === "attemptReview" && selected === "false" && correctAnswer === "true" ? "bg-red-300 text-red-700 border-red-700"
                                        : usedFor === "attemptReview" && selected === "true" ? "opacity-50 bg-white text-primary border-primary"
                                        : usedFor === "review" || usedFor === "attemptReview"  ? "opacity-50 bg-white text-primary border-primary"
                                        : "bg-white text-primary border-primary"}
                                    ${usedFor === "review" || usedFor === "attemptReview" ? "p-2 text-sm" : "p-4 text-lg hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                                    onClick={() => {
                                        if(usedFor === "review") return
                                        handleAnswer("false", assesmentItem.id)
                                    }}>
                        {
                            usedFor === "attemptReview" && selected === "false" && correctAnswer === "false" ?
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                            :usedFor === "attemptReview" && selected === "true" && correctAnswer === "false" ?
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                            : usedFor === "attemptReview" && selected === "false" && correctAnswer === "true" ?
                            <FontAwesomeIcon icon={faXmarkCircle} className="text-red-700 mr-2" />
                            : null
                        }
                        <p>False</p>
                    </div>
                </div>
                : assesmentItem.questionType === "multipleChoice" ?
                <div className={`grid grid-cols-2 grid-rows-2 items-center justify-between gap-2 ${usedFor === "review" || usedFor === "attemptReview"  ? "py-2": ""}`}>
                        {
                            assesmentItem.choices.map((i) => (
                                <div key={i.name} className={`flex items-center justify-center w-full font-header border-2 rounded-md p-2 shadow-md transition-all ease-in-out
                                                ${selected === i.value && usedFor !== "attemptReview" ? "bg-primary text-white border-primary"
                                                    : usedFor === "attemptReview" && selected === i.value && correctAnswer === i.value ? "bg-green-300 text-green-700 border-green-700"
                                                    : usedFor === "attemptReview" && selected !== i.value && correctAnswer === i.value ? "bg-green-300 text-green-700 border-green-700"
                                                    : usedFor === "attemptReview" && selected === i.value && correctAnswer !== i.value ? "bg-red-300 text-red-700 border-red-700"
                                                    : usedFor === "review" || usedFor === "attemptReview"  ? "opacity-50 bg-white text-primary border-primary"
                                                    : "bg-white text-primary border-primary"}
                                                ${usedFor === "review" || usedFor === "attemptReview" ? "text-sm" : "text-lg hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer "}`}
                                                onClick={() => {
                                                    if(usedFor === "review") return
                                                    handleAnswer(i.value, assesmentItem.id)
                                                }}>
                                    {
                                        usedFor === "attemptReview" && selected === i.value && correctAnswer === i.value ?
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                                        :usedFor === "attemptReview" && selected !== i.value && correctAnswer === i.value ?
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 mr-2" />
                                        : usedFor === "attemptReview" && selected === i.value && correctAnswer !== i.value ?
                                        <FontAwesomeIcon icon={faXmarkCircle} className="text-red-700 mr-2" />
                                        : null
                                    }
                                    <p>{i.name}</p>
                                </div>
                            ))
                        }
                </div>
                : null
            }

        </div>
    )
}
export default CourseAssesmentItem
