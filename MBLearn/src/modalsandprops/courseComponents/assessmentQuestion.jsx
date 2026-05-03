import { useEffect } from "react";

const AssessmentQuestion = ({content, active, handleAnswer,currentAttempt,quizState,}) => {
    // const parse = JSON.parse(content.BlockData);
    // const data = JSON.parse(parse);

    // const data = (content) => {
    //     if (content.BlockData === "string")
    //         return JSON.parse(content.BlockData);
    //     else{
    //         let parse = JSON.parse(content.BlockData);
    //         return JSON.parse(parse);
    //     }
    // }

    const data = JSON.parse(content.BlockData)

    return (
        <div className="w-full h-full p-4 border border-divider rounded-md bg-white shadow-md grid grid-rows-[min-content_1fr_min-content] gap-4">
            <div className="w-full flex flex-row items-start justify-between">
                <div>
                    <p className="text-xl font-header text-primary">Question {active + 1}</p>
                    <p className="text-xs font-text text-unactive">{data.points} points</p>
                </div>
                <div>
                    {(() => {
                        let type;
                        switch (content.QuestionType) {
                            case "trueOrfalse":
                            type = "True or False";
                            break;
                            case "multipleChoice":
                            type = "Multiple Choice";
                            break;
                            case "oneWordIdentification":
                            type = "One Word Identification";
                            break;
                            case "multipleWordIdentification":
                            type = "Fill in the Blank";
                            break;
                            case "likert":
                            type = "Likert Scale";
                            break;
                            default:
                            type = "Unknown Type";
                        }
                        return <p className="text-sm font-text text-unactive">{type}</p>;
                    })()}
                </div>
            </div>
            <div>
                <p className="text-md font-text text-xs">{data.question}</p>
            </div>
            {/* <div className="w-full h-full grid grid-cols-1">
                {
                    data.choices.map((item, index) => (
                        <div className="" key={index}>
                            {item.text}
                        </div>
                    ))
                }
            </div> */}
            {
                !content.QuestionType ? null
                :content.QuestionType === "trueOrfalse" ?
                <div className="w-full h-full grid grid-cols-2 gap-2">
                    {
                        data.choices?.map((item, index) => {
                            const selected = currentAttempt?.assessmentAnswers.find(a => a.questionId === content.id)?.answers.find(a => a === item.text);
                            return(
                                <div className={`flex items-center justify-center w-full font-header rounded-md shadow-md  transition-all ease-in-out p-4 border-primary border-2 text-primary hover:bg-primaryhover hover:cursor-pointer hover:text-white ${selected ? "bg-primary text-white" : "bg-white"}`} key={index}
                                onClick={() => {
                                    if(quizState !== "on-going") return;
                                    handleAnswer(item.text, content.id, content.QuestionType)
                                }}>
                                {item.text}
                            </div>
                            )
                        })
                    }
                </div>
                : content.QuestionType === "multipleChoice" ?
                <div className="w-full h-full grid grid-cols-1 gap-2">
                    {
                        data.choices?.map((item, index) => {
                            const selected = currentAttempt?.assessmentAnswers.find(a => a.questionId === content.id)?.answers.includes(item.text);
                            return (
                                <div className={`font-text text-xs flex items-center justify-start w-full rounded-md shadow-md transition-all ease-in-out px-4 py-2 border-primary border-2 text-primary hover:bg-primaryhover hover:cursor-pointer hover:text-white ${selected ? "bg-primary text-white" : "bg-white"}`} key={index}
                                onClick={() => {
                                    if(quizState !== "on-going") return;
                                    handleAnswer(item.text, content.id)
                                }}>
                                    {item.text}
                                </div>
                            )
                        })
                    }
                </div>
                : content.QuestionType === "oneWordIdentification" ?
                <div className="w-full h-full grid grid-cols-1 gap-2">
                    {
                        data.choices?.map((item, index) => {
                            const subQuestionId = `${content.id}-${item.id}`;
                            const answer = currentAttempt?.assessmentAnswers.find(a => a.questionId === content.id)?.answers[index] || "";
                            return(
                                <div className="w-full h-full flex items-center justify-start">
                                    <input type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        if(quizState !== "on-going") return;
                                        handleAnswer(e.target.value, content.id, content.QuestionType)}
                                    }
                                    disabled={quizState !== "on-going"}
                                    className="w-full px-4 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={`Type your answer for blank #${item.id}`} />
                                </div>
                            )
                        })
                    }
                </div>
                : content.QuestionType === "multipleWordIdentification" ?
                <div className="w-full h-full grid grid-cols-1 gap-2">
                    {
                        data.choices?.map((item, index) => {
                            const subQuestionId = `${content.id}-${item.id}`;
                            const answer = currentAttempt?.assessmentAnswers.find(a => a.questionId === content.id)?.answers[index] || "";
                            return(
                                <div className="w-full h-full flex items-center justify-start">
                                    <input type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        if(quizState !== "on-going") return;
                                        handleAnswer(e.target.value, content.id, content.QuestionType, index)}
                                    }
                                    disabled={quizState !== "on-going"}
                                    className="w-full px-4 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={`Type your answer for blank #${item.id}`} />
                                </div>
                            )
                        })
                    }
                </div>: null
            }
        </div>
    )
}

export default AssessmentQuestion;
