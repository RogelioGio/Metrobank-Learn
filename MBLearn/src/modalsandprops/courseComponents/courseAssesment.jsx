import { faArrowLeft, faCheck, faChevronLeft, faChevronRight, faCircleChevronLeft, faCircleChevronRight, faClipboard, faClipboardCheck, faPause, faPen, faPercent, faRightToBracket, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PortalToolTip from "MBLearn/src/components/ui/portal"
import { Progress } from "MBLearn/src/components/ui/progress"
import { useEffect, useRef, useState } from "react"
import CourseAssesmentItem from "./courseAssementItem"
import CircleChart from "MBLearn/src/components/ui/circleChart"
import { RingProgress } from "@mantine/core"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { set } from "date-fns"
import AssessmentQuestion from "./assessmentQuestion"
import axiosClient from "MBLearn/src/axios-client"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import PreparingAssessment from "../../assets/Online test-amico.svg"

const CourseAssesment = ({test, setCurrentAttemptResult, setAttempts}) => {
    const {user} = useStateContext();
    const iconRef = useRef(null);
    const [hover, setHover] = useState(false);
    const [assessment, setAssessment] = useState(test);
    const [progress, setProgress] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0)
    const [active, setActive] = useState(0)
    const [quizState, setQuizState] = useState("preparing") //preparing, start, on-going, paused, review, complete, attemptReview, finalize
    const [tobeReviewed, setTobeReviewed] = useState(false)
    const [finalized, setFinalized] = useState({})
    const [finalizing, setFinalizing] = useState(true)

    const [currentAttempt, setCurrentAttempt] = useState([])
    const [attemptHistory, setAttemptHistory] = useState([])
    const [attemptResult, setAttemptResult] = useState({})
    const [attemptIndex, setAttemptIndex] = useState(1)
    const [numberOfAttempts, setNumberOfAttempts] = useState(0)
    const [loadingAttempts, setLoadingAttempts] = useState(false)

    const [reviewAttempt, setReviewAttempt] = useState(0);
    const [attempt, setAttempt] = useState();
    const [loadingReview, setLoadingReview] = useState();

    const next = () => {
        if(quizState === "review") {
            setQuizState("complete")
            return
        } else if(active === assessment.content.length-1){
            setTobeReviewed(true)
            setQuizState("review")
        }
        // else if(active !== assessment.content.length-1 && tobeReviewed){
        //     setQuizState("review")
        //     return
        // }

        setActive(prev => prev + 1)

        setProgress((prev) => {
            return prev.includes(assessment.content[active].id) ? prev : [...prev, assessment.content[active].id]
        })
    }

    const back = () => {
        if(active <= 0) return
        if(quizState === "review") {
            setQuizState("on-going")
            setActive(assessment.content.length)
        }
        setActive(prev => prev - 1)
    }

    const startAssessment = () => {
        if(quizState === "start"){
            setQuizState("on-going")
            setActive(0)
            setProgress([])
            setProgressPercent(0)
            setCurrentAttempt((prev) => ({...prev, attempt: 1, assessmentAnswers: []}))
        }else if(tobeReviewed){
            setQuizState("review")
        }
        else{
            setQuizState("on-going")
        }

    }
    const pauseAssessment = () => {
        if(quizState === "review"){
            setTobeReviewed(true)
        }
        setQuizState("paused")
    }

    // const handleSpecificAttempts = () => {
    //     axiosClient.get(`/select-user-test-attempt-answers/${user.user_infos.id}/12/1`)
    //     .then((res) => {
    //         setAttempt(res);
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //     });
    // }

    const handleFinalizeAssessment = () => {
        axiosClient.get(`/finalizeAssessment/${test.id}`)
        .then((res) => {
            console.log("Finalize Assessment: ", res)
            setFinalized(res.data)

            if(res.data.remark === "Passed"){
                setFinalizing(false)
                setQuizState("finalize")
            } else if ( res.data.remark === "Failed" && res.data.attempts >= assessment.max_attempt){
                setFinalizing(false)
                setQuizState("finalize")
                setAttempts(prev => ({...prev, maxAttempts: res.data.maxAttempts, totalAttempts: res.data.attempts}))
            } else {
                setQuizState("start")
            }

            setAttempts(prev => ({...prev, remarks: res.data.remark}))
        })
        .catch((err) => {
            console.error(err);
        });
    }

    const getTotalAttempts = () => {
        setLoadingAttempts(true);
        axiosClient.get(`/total-user-test-attempts/${user.user_infos.id}/${test.id}`)
        .then((res) => {
            setAttempts(res.data);
            setNumberOfAttempts(res.data.totalAttempts)
            setLoadingAttempts(false);
        }).catch((err) => {
            console.error(err);
        });
    }

    useEffect(()=>{
        setProgressPercent(Math.round((progress.length / assessment.content.length) * 100))
    },[active])

    useEffect(()=>{
        // console.log("Current Attempt: ", currentAttempt)
        //console.log("attemptHistory: ", attemptHistory)
        //console.log("attemptResult: ", attemptResult)
        // console.log("Quiz State: ", quizState)
        // console.log("ToBeReviewed: ", tobeReviewed)
        // console.log("attemptIndex", attemptIndex);
        // console.log(active);
        //console.log("attemptHistory", attemptHistory.find(a => a.attempt === attemptIndex))
        //console.log("question: ", assessment.assesmentItems[active])
    },[active])

    const handleAnswer = (answer, question, questionType, index) => {
        setCurrentAttempt((prev)=>{
            if(questionType === "oneWordIdentification" || questionType === "trueOrfalse"){
                const existingAnswer = prev.assessmentAnswers.find(a => a.questionId === question);
                if(existingAnswer) {
                    const answerArray = prev.assessmentAnswers.map(a => a.questionId === question ? {...a, answers: [answer]} : a);
                    return {
                        ...prev,
                        assessmentAnswers: answerArray
                    }
                } else {
                    return {
                        ...prev,
                        assessmentAnswers: [...prev.assessmentAnswers, {questionId: question, answers: [answer]}]
                    }
                }
            } else if(questionType === "multipleWordIdentification") {
                const existingQuestion = prev.assessmentAnswers.find(a => a.questionId === question)
                if(existingQuestion) {
                    const answers = [...existingQuestion.answers];
                    answers[index] = answer;

                    return {
                        ...prev,
                        assessmentAnswers: prev.assessmentAnswers.map(a => a.questionId === question ? {...a, answers: answers} : a)
                    }
                }else{
                    return {
                        ...prev,
                        assessmentAnswers: [...prev.assessmentAnswers, {questionId: question, answers: [answer]}]
                    }
                }
            }
            else {
                const existingQuestion = prev.assessmentAnswers.find(a => a.questionId === question)

                if(existingQuestion) {
                    const answerExists = existingQuestion.answers.find(a => a === answer);
                    if(answerExists) {
                        return {
                            ...prev,
                            assessmentAnswers: prev.assessmentAnswers.map(a => a.questionId === question ? {...a, answers: a.answers.filter(ans =>  ans !== answer)} : a)
                        }
                    }else{
                        return {
                            ...prev,
                            assessmentAnswers: prev.assessmentAnswers.map(a => a.questionId === question ? {...a, answers: [...a.answers, answer]} : a)
                        }
                    }

                }else {
                    return {
                        ...prev,
                        assessmentAnswers: [...prev.assessmentAnswers, {questionId: question, answers: [answer]}]
                    }
                }


            }


            // if(existingAnswer) {
            //     const answerArray = prev.assessmentAnswers.map(a => a.questionId === question ? {...a, answer: answer} : a);
            //     return {
            //         ...prev,
            //         assessmentAnswers: answerArray
            //     }
            // } else {
            //     return {
            //         ...prev,
            //         assessmentAnswers: [...prev.assessmentAnswers, {questionId: question, answer: answer}]
            //     }
            // }
        })
    }

    const handleResult = () => {
        setSubmitting(true)
        axiosClient.post(`/takeTest/${test.id}`, currentAttempt.assessmentAnswers)
        .then((res) => {
            setSubmitting(false)
            setQuizState("complete")
            setAttemptResult({
                totalUserPoints: res.data.Answers,
                totalAssessmentPoints: res.data.total,
                userAttempt:res.data.pivot,
                passed: res.data.passed
            })
            setNumberOfAttempts(prev => prev + 1)
        })
        .catch((err) => {
            console.error(err);
            setSubmitting(false)
        });

        // next()
    }

    const item = () => {
        return (
            <>
                {
                    quizState === "on-going"  ||  quizState === "review" ? <>
                    <div className="grid grid-rows-[min-content_1fr_min-content] w-full h-full">
                        <div className="flex flex-row items-center justify-between py-2">
                            <div className="flex flex-row items-center gap-2 w-full">
                                <div className="relative w-fit group">
                                    <div className="overflow-visible relative border-primary border-2 w-10 h-10 bg-white shadow-md rounded-md flex items-center justify-center text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition-all ease-in-out"
                                        onClick={()=>{pauseAssessment(),setHover(false)}}
                                        ref={iconRef} onMouseLeave={()=>setHover(false)} onMouseEnter={()=>setHover(true)}>
                                        <FontAwesomeIcon icon={faPause}/>
                                    </div>

                                    <PortalToolTip anchorRef={iconRef} visible={hover}>
                                        Pause Quiz
                                    </PortalToolTip>
                                </div>
                                <div className="flex flex-col whitespace-nowrap">
                                    <p className='font-text text-xs'>Attempt:</p>
                                    <p className='font-header text-lg text-primary'>{currentAttempt.attempt} <span className="font-text text-xs text-unactive">out of</span> 4 <span className="font-text text-xs text-unactive">max Attempt</span></p>

                                </div>
                            </div>

                            <div className="flex flex-row justify-end w-full">
                                <div className="flex flex-col items-end justify-end">
                                    <p className='font-text text-xs'>Assessment Progress</p>
                                    <p className='font-header'>{progressPercent}%</p>
                                </div>
                                <RingProgress
                                    size={45} // Diameter of the ring
                                    roundCaps
                                    thickness={7} // Thickness of the progress bar
                                    sections={[{ value: progressPercent, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                    rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                />
                            </div>
                        </div>

                        {
                            quizState === "review" ?
                            <>
                                <div className="grid grid-cols-1 grid-rows-[min-content_1fr] gap-2 h-full pr-4">
                                    <div className="">
                                        <p className="font-header text-primary text-lg">Review</p>
                                        <p className="font-text text-xs text-unactive">Review your answer</p>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-23rem)] bg-white w-full rounded-md shadow-md border border-divider">
                                        <div className="py-4 px-5 flex flex-col gap-2">
                                            {
                                                assessment.assessmentItems.map((item, index) => (
                                                    <div key={index}>
                                                        <CourseAssesmentItem assesmentItem={item} active={index} assesmentItems={assessment.assessmentItems.length} usedFor={"review"} currentAttempt={currentAttempt} switchAnswer={()=>{setActive(index),setQuizState("on-going")}}/>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </ScrollArea>
                                </div>
                            </> :
                            <div className="h-full">
                                <CourseAssesmentItem assessmentItem={assessment.content[active]} active={active} assessmentItems={assessment.content.length} handleAnswer={handleAnswer} currentAttempt={currentAttempt}/>
                            </div>
                        }

                        <div className="flex flex-row items-center justify-between py-2">
                            <div className="w-32 h-10 border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                onClick={() => {back()}}>
                                <FontAwesomeIcon icon={faCircleChevronLeft}/>
                                <p>Previous</p>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-x-1">
                                {
                                    Array.from({length: assessment.assesmentItems.length}).map((i,_)=>{
                                        const qId = assessment.assessmentItems[_].id
                                        const isDone = progress.includes(qId);

                                        return <div key={_} className={`w-2 h-2 rounded-full ${isDone ? 'bg-primary':"bg-unactive"}`}/>
                                    })
                                }
                            </div>
                            <div className="w-32 h-10 border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                onClick={()=>{
                                    if(quizState === "review")
                                    {
                                        handleResult()
                                    }
                                    next()
                                }}>
                                <p>{
                                    quizState === "on-going" ? "Next" : "Submit"
                                }</p>
                                <FontAwesomeIcon icon={faCircleChevronRight} />
                            </div>
                        </div>
                    </div>
                    </> : quizState === "complete" ? <>
                    <div className="flex flex-row items-center justify-center col-start-1 row-start-2 row-span-2 gap-5">
                        <div className="space-y-2">
                            <CircleChart label="Assesment Performance" size={200}  type="finished" value={attemptResult.percentage}/>
                            <div className="flex flex-col items-center justify-center">
                                <p className={`font-header text-3xl ${attemptResult.percentage >= assessment.passing ? "text-primary":"text-red-700"}`}>
                                    {
                                        attemptResult.percentage === 100 ?
                                        "Perfect Score!"
                                        :attemptResult.percentage >= assessment.passing ?
                                        "Passed!"
                                        : "Failed"
                                    }
                                </p>
                                <p className="font-text text-unactive text-xs">Remarks</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 grid-rows-[min-content_1fr_min-content] gap-x-10 gap-y-2">
                            <div className="col-span-3">
                                <p className="font-header text-primary text-2xl">Course Assessment Result</p>
                                <p className="font-text text-xs text-unactive">Assessment attempt result report</p>
                            </div>

                            <div className="py-2">
                                <p className="font-header text-xl text-primary">{attemptResult.score} out of {assessment.assessmentItems.reduce((acc,i) => acc + i.points,0)}</p>
                                <p className="font-text text-unactive text-xs">Total Assessment Score</p>
                            </div>

                            <div className="py-2">
                                <p className="font-header text-xl text-primary">{currentAttempt.attempt}{currentAttempt.attempt === 1 ? "st attempt" :  currentAttempt.attempt === 2 ? "nd attempt" : currentAttempt.attempt === 3 ? "rd attempt" : "th attempt"}</p>
                                <p className="font-text text-unactive text-xs">Current Attempt</p>
                            </div>

                            <div className="py-2">
                                {/* <p className="font-header text-xl text-primary">{
                                    elaspedTime < 60 ?
                                        elaspedTime !== 1 ?
                                        elaspedTime + " seconds":
                                        elaspedTime + " second"
                                    : formatTime(elaspedTime) + "minutes"
                                    }
                                </p> */}
                                <p className="font-text text-unactive text-xs">Attempt Duration</p>
                            </div>

                            <div className="flex flex-row items-start justify-center gap-2 py-2 col-span-3">
                                <div className="border-2 border-primary rounded-md w-full h-fit py-2 bg-white shadow-md flex items-center justify-center text-primary hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer transition-all ease-in-out"
                                    onClick={()=>{setQuizState("attemptReview")}}>
                                    <p className="font-header">Review Attempt</p>
                                </div>
                                <div className="w-full flex flex-col items-center justify-center">
                                    <div className="mb-2 border-2 border-primary rounded-md w-full h-full py-2 bg-primary shadow-md flex items-center justify-center text-white hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer transition-all ease-in-out"
                                        onClick={()=>{
                                                    setQuizState("start"),
                                                    setActive(0),
                                                    setProgress([]),
                                                    setTobeReviewed(false)
                                                }}>
                                        <p className="font-header">Try Again</p>
                                    </div>
                                    <p className="font-text text-xs text-unactive">{( assessment.maxAttempts - attemptHistory.length)} attempts left
                                        {
                                            //Attempts left
                                        }
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                    </> : quizState === "attemptReview" ? <>
                    <div className="grid grid-rows-[min-content_1fr_min-content] w-full h-full">
                        <div className="flex flex-row items-center justify-between py-2 pr-4">
                            <div className="flex flex-row items-center gap-2 ">
                                <div className="overflow-visible relative border-primary border-2 w-10 h-10 bg-white shadow-md rounded-md flex items-center justify-center text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition-all ease-in-out"
                                    onClick={()=>{
                                        tobeReviewed ? setQuizState("complete") : setQuizState("start");
                                    }}>
                                    <FontAwesomeIcon icon={faArrowLeft}/>
                                </div>
                                <div>
                                    <p className="font-header text-primary">Review Attempt</p>
                                    <p className="font-text text-unactive text-xs">Quick summary of your current attempt</p>
                                </div>
                            </div>
                            <div className="flex flex-row items-center justify-end gap-7">
                                <div className="flex-col items-end">
                                    <p className="font-text text-unactive text-xs">Attempt Duration</p>
                                    {/* <p className="font-header">{
                                        currentAttempt.attempt ?
                                        elaspedTime < 60 ?
                                                elaspedTime !== 1 ?
                                                elaspedTime + " seconds":
                                                elaspedTime + " second"
                                            : formatTime(elaspedTime) + " minutes"
                                        : attemptHistory.find(a => a.attempt === attemptIndex) ?
                                            attemptHistory.find(a => a.attempt === attemptIndex).duration < 60 ?
                                                attemptHistory.find(a => a.attempt === attemptIndex).duration !== 1 ?
                                                attemptHistory.find(a => a.attempt === attemptIndex).duration + " seconds":
                                                attemptHistory.find(a => a.attempt === attemptIndex).duration + " second"
                                            : formatTime(attemptHistory.find(a => a.attempt === attemptIndex).duration) + " minutes"
                                        : null
                                    }</p> */}
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="font-text text-unactive text-xs">Current Attempt</p>
                                    <p className="font-header">{
                                            tobeReviewed?
                                                attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.attempt
                                            : attemptHistory.find(a => a.attempt === attemptIndex).attempt
                                        }{attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.attempt === 1 || attemptHistory.find(a => a.attempt === attemptIndex).attempt === 1 ? "st attempt"
                                            : attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.attempt === 1 || attemptHistory.find(a => a.attempt === attemptIndex).attempt === 1 ? "nd attempt"
                                            : attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.attempt === 1 || attemptHistory.find(a => a.attempt === attemptIndex).attempt === 1 ? "rd attempt"
                                            : "th attempt"}</p>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <p className="font-text text-unactive text-xs">Total Assessment Score</p>
                                        <p className="font-header">{
                                            tobeReviewed?
                                                attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.score
                                            : attemptHistory.find(a => a.attempt === attemptIndex).score
                                            } out of {assessment.assessmentItems.reduce((acc,i) => acc + i.points,0)}</p>
                                    </div>
                                    {
                                        tobeReviewed?
                                            <RingProgress
                                            size={35} // Diameter of the ring
                                            roundCaps
                                            thickness={4} // Thickness of the progress bar
                                            sections={[{ value: attemptHistory.find(a => a.attempt === currentAttempt.attempt)?.percentage, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                            rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            /> :
                                        <RingProgress
                                            size={35} // Diameter of the ring
                                            roundCaps
                                            thickness={4} // Thickness of the progress bar
                                            sections={[{ value: attemptHistory.find(a => a.attempt === attemptIndex)?.percentage, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                            rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            />
                                    }

                                </div>
                            </div>
                        </div>
                        <div className="pr-4 py-2">
                            <ScrollArea className={`bg-white w-full rounded-md shadow-md border border-unactive ${!tobeReviewed ? "h-[calc(100vh-20rem)]" : "h-[calc(100vh-17rem)]"}`}>
                                <div className="flex flex-col gap-4 p-5">
                                {
                                        tobeReviewed?
                                            assesment.assesmentItems.map((item, index) => (
                                                <CourseAssesmentItem assesmentItem={item} active={index} assesmentItems={assessment.assesmentItems.length} usedFor={"attemptReview"} attemptHistory={attemptHistory.find(a => a.attempt === attemptResult.attempt)} isCorrect={attemptHistory.find(a => a.attempt === attemptResult.attempt).result.find(q => q.questionId === item.id).isCorrect}/>
                                            ))
                                        : assesment.assesmentItems.map((item, index) => (
                                            <CourseAssesmentItem assesmentItem={item} active={index} usedFor={"attemptReview"} attemptHistory={attemptHistory.find(a => a.attempt === attemptIndex)} isCorrect={attemptHistory.find(a => a.attempt === attemptIndex).result.find(q => q.questionId === item.id).isCorrect}/>
                                        ))
                                }
                                </div>
                            </ScrollArea>
                        </div>
                        {
                            !tobeReviewed ?
                            <div className="flex flex-row items-center justify-between pr-4 pb-2">
                                <div className="w-32 h-10 border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                    onClick={()=>{
                                        if(attemptIndex <= 1 ) return
                                        setAttemptIndex(prev => prev - 1)
                                    }}>
                                    <FontAwesomeIcon icon={faCircleChevronLeft}/>
                                    <p>Previous</p>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-x-2">
                                    {
                                        Array.from({length: attemptHistory.length}).map((i,_)=>{
                                            const current = _+1 === attemptIndex;

                                            return (
                                                <div className={`w-2 h-2 rounded-md ${current ? "bg-primary":"bg-unactive"}`}/>
                                            )
                                        })
                                    }
                                </div>
                                <div className="w-32 h-10 border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                    onClick={()=>{
                                        if(attemptIndex >= attemptHistory.length) return
                                        setAttemptIndex(prev => prev + 1)
                                    }}>
                                    <p>Next</p>
                                    <FontAwesomeIcon icon={faCircleChevronRight} />
                                </div>
                            </div> : null
                        }

                    </div>
                    </>:null
                }

                <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2 w-full">
                            <div className="relative w-fit group">
                                <div className="overflow-visible relative border-primary border-2 w-10 h-10 bg-white shadow-md rounded-md flex items-center justify-center text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition-all ease-in-out"
                                    onClick={()=>{pauseAssessment(),setHover(false)}}
                                    ref={iconRef} onMouseLeave={()=>setHover(false)} onMouseEnter={()=>setHover(true)}>
                                    <FontAwesomeIcon icon={faPause}/>
                                </div>

                                <PortalToolTip anchorRef={iconRef} visible={hover}>
                                    Pause Quiz
                                </PortalToolTip>
                            </div>
                            <div className="flex flex-col whitespace-nowrap">
                                <p className='font-text text-xs'>Attempt:</p>
                                <p className='font-header text-lg text-primary'>{currentAttempt.attempt} <span className="font-text text-xs text-unactive">out of</span> 4 <span className="font-text text-xs text-unactive">max Attempt</span></p>

                            </div>
                        </div>

                        <div className="flex flex-row justify-end w-full">
                            <div className="flex flex-col items-end justify-end">
                                <p className='font-text text-xs'>Assessment Progress</p>
                                <p className='font-header'>{progressPercent}%</p>
                            </div>
                            <RingProgress
                                size={45} // Diameter of the ring
                                roundCaps
                                thickness={7} // Thickness of the progress bar
                                sections={[{ value: progressPercent, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                rootColor="hsl(210, 14%, 83%)" // Darker blue track
                            />
                        </div>
                    </div>
            </>
        )
    }

    useEffect(()=>{
        if(quizState === "start" || currentAttempt === 0) {
            getTotalAttempts()
        }else if(quizState === "preparing" || quizState === "finalize"){
            handleFinalizeAssessment()
        }
    },[quizState])

    useEffect(()=>{
            // console.log("Number of attempts changed", numberOfAttempts)
            // console.log("Max attempts", assessment.max_attempt)

            setCurrentAttemptResult({
                passed: numberOfAttempts >= assessment.max_attempt ? true : attemptResult.passed
            })
    },[numberOfAttempts, assessment.max_attempt])

    return(
        <div className="flex flex-col items-center justify-center w-full h-full pb-4">
            {
                quizState === "preparing" ?
                <div className="flex flex-col gap-2 items-center justify-center">
                    <img src={PreparingAssessment} alt="Unauthorized" className="w-60"/>
                    <div>
                        <p className="font-header text-3xl text-primary">Preparing Assessment</p>
                        <p className="font-text text-xs text-unactive">Please wait and we are forging your journer to success...</p>
                    </div>
                </div>
                : quizState === "start" || quizState === "paused" ?
                <div className="grid grid-rows-[min-content_1fr_1fr] gap-4 w-full">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-primarybg flex items-center justify-center">
                            <FontAwesomeIcon icon={faClipboard} className="text-primary text-5xl"/>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="font-text text-unactive text-xs">Assessment</p>
                            <p className="font-header text-primary text-3xl">{assessment.name}</p>
                            <p className="font-text text-sm"> {assessment.description} </p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-around">
                        <div>
                                {
                                    loadingAttempts ?
                                    <>
                                    <div className="w-40 animate-pulse h-8 bg-gray-400 rounded-md"></div>
                                    <p className="font-text text-unactive text-xs">Current Attempt</p>
                                    </>
                                    :
                                    <>
                                    <p className="font-header text-lg text-primary">{numberOfAttempts === 0 ? 1 : Math.min(numberOfAttempts + 1, assessment.max_attempt)}{Math.min(numberOfAttempts + 1, assessment.max_attempt) === 1 ? "st attempt" : Math.min(numberOfAttempts + 1, assessment.max_attempt) === 2 ? "nd attempt" : Math.min(numberOfAttempts + 1, assessment.max_attempt) === 3 ? "rd attempt" : "th attempt"}</p>
                                    <p className="font-text text-unactive text-xs">Current Attempt</p>
                                    </>
                                }
                        </div>
                        <div>
                            {
                                loadingAttempts ?
                                <>
                                    <div className="w-40 animate-pulse h-8 bg-gray-400 rounded-md"></div>
                                    <p className="font-text text-unactive text-xs">Max Attempt</p>
                                </>
                                :
                                <>
                                    <p className="font-header text-lg text-primary">{assessment.max_attempt} attempts</p>
                                    <p className="font-text text-unactive text-xs">Max Attempts</p>
                                </>
                            }
                        </div>
                        {
                            quizState === "paused" ?
                            <div>
                                <div className="flex flex-row items-center justify-start gap-2">
                                    <RingProgress
                                    size={35} // Diameter of the ring
                                    roundCaps
                                    thickness={4} // Thickness of the progress bar
                                    sections={[{ value: progressPercent, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                    rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                    />
                                    <p className='font-header'>{progressPercent}%</p>
                                </div>
                                <p className="font-text text-unactive text-xs">Assessment Progress</p>
                            </div> : null
                        }
                    </div>
                    <div className="flex flex-row items-center justify-center gap-2">
                        {/* {
                            numberOfAttempts >= 1 && loadingAttempts ?
                            <div className="w-40 animate-pulse h-12 bg-gray-400 rounded-md"></div>
                            : numberOfAttempts >= 1 && quizState === "start"  ?
                            <div className={`w-fit py-3 px-5 bg-white rounded-md shadow-md flex flex-col items-center justify-center transition-all ease-in-out text-primary hover:border-primaryhover hover:text-white hover:cursor-pointer hover:bg-primaryhover border-2 border-primary`}
                            onClick={() => {setQuizState("reviewAttempts")}}>
                                <p className="font-header text-sm"> Review {numberOfAttempts === 1 ? "Attempt" : "Attempts"}</p>
                            </div>
                            : null
                        } */}
                        <div className={`${quizState === "paused" ? "flex" : "hidden"} w-fit py-3 px-5 bg-white rounded-md shadow-md flex flex-col items-center justify-center transition-all ease-in-out text-primary hover:border-primaryhover hover:text-white hover:cursor-pointer hover:bg-primaryhover border-2 border-primary`}
                            onClick={()=>{
                                if(quizState !== "paused") return
                                setQuizState("start"),
                                setCurrentAttempt([])
                            }}>
                            <p className="font-header text-sm">Quit Assement</p>
                        </div>
                        {
                            loadingAttempts ?
                            <div className="w-40 animate-pulse h-12 bg-gray-400 rounded-md"></div>
                            :
                            <div className={`w-fit py-3 px-5 bg-primary rounded-md shadow-md flex flex-col items-center justify-center transition-all ease-in-out hover:cursor-pointer ${numberOfAttempts >= assessment.max_attempt ? "opacity-50 cursor-not-allowed":"hover:bg-primaryhover"}`}
                            onClick={()=>{
                                if(numberOfAttempts >= assessment.max_attempt) return
                                startAssessment()
                            }}>
                                <p className="font-header text-white text-sm">
                                    {
                                        numberOfAttempts >= assessment.max_attempt ? "Max Attempt Exceeded" :  quizState === "start" ? "Start assessment" : "Resume assessment"
                                    }
                                </p>
                            </div>
                        }
                    </div>
                </div>
                : quizState === "on-going"  ||  quizState === "review" ?
                <div className="grid grid-rows-[1fr_min-content] w-full h-full">
                    {
                        quizState === "review" ?
                        <>
                            <div className="grid grid-cols-1 grid-rows-[min-content_1fr] gap-2 h-full">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <div className="">
                                        <p className="font-header text-primary text-lg">Review</p>
                                        <p className="font-text text-xs text-unactive">Review your answer</p>
                                    </div>

                                    <div className="flex flex-row gap-2">
                                        <div className={`px-4 py-2 border-2 border-primary rounded-md w-fit h-fit bg-white shadow-md flex items-center justify-center text-primary transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                                            onClick={()=>{
                                                if(quizState === "review" && !submitting )
                                                {
                                                    setQuizState("on-going")
                                                    setActive(0)
                                                }
                                            }}>
                                            <FontAwesomeIcon icon={faCircleChevronLeft} />
                                            <p className="font-header text-sm ml-2">Review Assessment</p>
                                        </div>
                                        <div className={`px-4 py-2 border-2 border-primary rounded-md w-fit h-fit bg-primary shadow-md flex items-center justify-center text-white transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                                            onClick={()=>{
                                                if(quizState === "review" && !submitting)
                                                {
                                                    handleResult()
                                                }
                                            }}>
                                            {
                                                submitting ?
                                                <>
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                    <p className="font-header text-sm ml-2">Submitting...</p>
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon icon={faRightToBracket} />
                                                    <p className="font-header text-sm ml-2">Submit Attempt</p>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <ScrollArea className="h-[calc(100vh-17.9rem)] bg-white w-full rounded-md shadow-md border border-divider">
                                    <div className="p-5 flex flex-col gap-4 h-full">
                                        {
                                            assessment.content.map((item, index) => (
                                                <AssessmentQuestion content={item} active={index} currentAttempt={currentAttempt}/>
                                            ))
                                        }
                                    </div>
                                </ScrollArea>
                            </div>
                        </>:
                        <AssessmentQuestion content={assessment.content[active]} active={active} handleAnswer={handleAnswer} currentAttempt={currentAttempt} quizState={quizState}/>
                    }

                    <div className="flex flex-row items-center justify-between pt-2">
                        <div className="flex flex-row items-center gap-2 w-full">
                            <div className={`overflow-visible relative border-primary border-2 w-10 h-10 bg-white shadow-md rounded-md flex items-center justify-center text-primary  transition-all ease-in-out ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primary hover:cursor-pointer"}`}
                                onClick={()=>{
                                        if(submitting) return
                                        pauseAssessment()
                                    }}>
                                <FontAwesomeIcon icon={faPause}/>
                            </div>
                            {
                                quizState === "on-going" &&
                                <div className="flex flex-row justify-end">
                                    <RingProgress
                                        size={45} // Diameter of the ring
                                        roundCaps
                                        thickness={7} // Thickness of the progress bar
                                        sections={[{ value: progressPercent, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                        rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                    />
                                    <div className="flex flex-col justify-center">
                                        <p className='font-text text-xs'>Assessment Progress</p>
                                        <p className='font-header'>{progressPercent}%</p>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="flex flex-row gap-2">
                            {
                                quizState === "on-going" ?
                                <>
                                    <div className="w-10 h-10 bg-white border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                        onClick={() => {back()}}>
                                        <FontAwesomeIcon icon={faCircleChevronLeft}/>
                                    </div>
                                    <div className="w-10 h-10 bg-white border-2 border-primary rounded-md flex justify-center items-center font-header text-primary transition-all ease-in-out shadow-md gap-2 hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer"
                                        onClick={()=>{
                                            next()
                                        }}>
                                        <FontAwesomeIcon icon={faCircleChevronRight} />
                                    </div>
                                </> :
                                <div className="flex flex-row justify-end whitespace-nowrap">
                                    <div className="flex flex-col justify-center items-end">
                                        <p className='font-text text-xs'>Assessment Progress</p>
                                        <p className='font-header'>{progressPercent}%</p>
                                    </div>
                                    <RingProgress
                                        size={45} // Diameter of the ring
                                        roundCaps
                                        thickness={7} // Thickness of the progress bar
                                        sections={[{ value: progressPercent, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                        rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                : quizState === "complete" ?
                <div className="flex flex-row items-center justify-center col-start-1 row-start-2 row-span-2 gap-5">
                    <div className="space-y-2">
                        <CircleChart label="Assesment Performance" size={200}  type="finished" value={Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100)}/>
                        <div className="flex flex-col items-center justify-center">
                            <p className={`font-header text-3xl ${Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ? "text-primary":"text-red-700"}`}>
                                {
                                    Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) === 100 ?
                                    "Perfect Score!"
                                    :Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ?
                                    "Passed!"
                                    : "Failed"
                                }
                            </p>
                            <p className="font-text text-unactive text-xs">Remarks</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 grid-rows-[min-content_1fr_min-content] gap-x-10 gap-y-2">
                        <div className="col-span-3">
                            <p className="font-header text-primary text-2xl">Course Assessment Result</p>
                            <p className="font-text text-xs text-unactive">Assessment attempt result report</p>
                        </div>

                        <div className="py-2">
                            <p className="font-header text-xl text-primary">{attemptResult.totalUserPoints} out of {attemptResult.totalAssessmentPoints}</p>
                            <p className="font-text text-unactive text-xs">Total Assessment Score</p>
                        </div>

                        <div className="py-2">
                            <p className="font-header text-lg text-primary">{numberOfAttempts === 0 ? 1 : numberOfAttempts }{numberOfAttempts === 1 ? "st attempt" : numberOfAttempts === 2 ? "nd attempt" : numberOfAttempts === 3 ? "rd attempt" : "th attempt"}</p>
                            <p className="font-text text-unactive text-xs">Current Attempt</p>
                        </div>

                        <div className="flex flex-row items-start justify-center gap-2 py-2 col-span-3">
                            <div className="border-2 border-primary rounded-md w-full h-fit py-2 bg-white shadow-md flex items-center justify-center text-primary hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer transition-all ease-in-out"
                                onClick={()=>{setQuizState("attemptReview")}}>
                                <p className="font-header">Review Attempt</p>
                            </div>
                            <div className="w-full flex flex-col items-center justify-center">
                                <div className="mb-2 border-2 border-primary rounded-md w-full h-full py-2 bg-primary shadow-md flex items-center justify-center text-white hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer transition-all ease-in-out"
                                    onClick={()=>{
                                                if(assessment.max_attempt - (numberOfAttempts) === 0 || Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage){
                                                    setQuizState("finalize")
                                                } else {
                                                    setQuizState("start")
                                                }
                                                setActive(0),
                                                setProgress([]),
                                                setTobeReviewed(false)
                                            }}>
                                    {
                                        assessment.max_attempt - (numberOfAttempts) === 0 || Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ?
                                        <p className="font-header">Finalize Assement</p>
                                        :
                                        <p className="font-header">Try Again</p>
                                    }
                                </div>
                                {
                                    assessment.max_attempt - (numberOfAttempts) === 0 || Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ? null :
                                    <p className="font-text text-xs text-unactive">{assessment.max_attempt - (numberOfAttempts)} attempts left </p>
                                }

                            </div>
                        </div>

                    </div>
                </div>
                : quizState === "attemptReview" ?
                <div className="grid grid-rows-[min-content_1fr_min-content] w-full h-full grid-cols-4 gap-2">
                    <div className="flex flex-row gap-2 row-start-1">
                        <RingProgress
                        size={40} // Diameter of the ring
                        roundCaps
                        thickness={6} // Thickness of the progress bar
                        sections={[{ value: Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100), color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                        rootColor="hsl(210, 14%, 83%)" // Darker blue track
                        />
                        <div className="flex flex-col justify-center items-start">
                            <p className='font-text text-xs'>Assessment Performance</p>
                            <p className='font-header'>{Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100)}%</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-text text-unactive text-xs">Total Assessment Score</p>
                        <p className="font-header text-primary">{attemptResult.totalUserPoints} out of {attemptResult.totalAssessmentPoints}</p>
                    </div>
                    <div>
                        <p className='font-text text-xs'>Remarks</p>
                        <p className={`font-header ${Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ? "text-primary":"text-red-700"}`}>
                        {
                                Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) === 100 ?
                                "Perfect Score!"
                                :Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ?
                                "Passed!"
                                : "Failed"
                            }
                        </p>
                    </div>
                    <div>
                        <p className="font-text text-unactive text-xs">Current Attempt</p>
                        <p className="font-header text-primary">{numberOfAttempts === 0 ? 1 : numberOfAttempts}{numberOfAttempts === 1 ? "st attempt" : numberOfAttempts === 2 ? "nd attempt" : numberOfAttempts === 3 ? "rd attempt" : "th attempt"}</p>
                    </div>
                    <ScrollArea className="h-[calc(100vh-18rem)] bg-white w-full rounded-md shadow-md border border-divider col-span-4">
                        <div className="p-5 flex flex-col gap-4 h-full">
                            {
                                assessment.content.map((item, index) => (
                                    <AssessmentQuestion content={item} active={index} currentAttempt={currentAttempt} corrections={attemptResult.content}/>
                                ))
                            }
                        </div>
                    </ScrollArea>

                    <div className={`col-span-2 px-4 py-4 border-2 border-primary rounded-md w-full h-full bg-white shadow-md flex items-center justify-center text-primary transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                        onClick={()=>{
                            setQuizState("complete")
                        }}>
                        <p className="font-header text-sm ml-2">Return to Results</p>
                    </div>
                    <div className={`col-span-2 px-4 py-4 border-2 border-primary rounded-md w-full h-full bg-primary shadow-md flex items-center justify-center text-white transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}
                        onClick={()=>{
                            setQuizState("start"),
                            setActive(0),
                            setProgress([]),
                            setTobeReviewed(false)
                        }}>
                        <p className="font-header text-sm ml-2">Try Again</p>

                    </div>
                </div>
                : quizState === "reviewAttempts" ?
                <div className="grid grid-rows-[min-content_1fr_min-content] w-full h-full grid-cols-4 gap-2">
                    {/* sections={[{ value: Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100), color: "hsl(218,97%,26%)" }]} // Lighter blue progress */}
                    <div className="flex flex-row gap-2 row-start-1">
                        <RingProgress
                        size={40} // Diameter of the ring
                        roundCaps
                        thickness={6} // Thickness of the progress bar
                        sections={[{ value:10, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                        rootColor="hsl(210, 14%, 83%)" // Darker blue track
                        />
                        <div className="flex flex-col justify-center items-start">
                            <p className='font-text text-xs'>Assessment Performance</p>
                            <p className='font-header'>Hello%</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-text text-unactive text-xs">Total Assessment Score</p>
                        {/* <p className="font-header text-primary">{attemptResult.totalUserPoints} out of {attemptResult.totalAssessmentPoints}</p> */}
                        <p className="font-header text-primary">10 out of 10</p>
                    </div>
                    <div>
                        <p className='font-text text-xs'>Remarks</p>
                        {/* <p className={`font-header ${Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ? "text-primary":"text-red-700"}`}>
                        {
                                Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) === 100 ?
                                "Perfect Score!"
                                :Math.round((attemptResult.totalUserPoints/attemptResult.totalAssessmentPoints)*100) >= assessment.passing_percentage ?
                                "Passed!"
                                : "Failed"
                            }
                        </p> */}
                    </div>
                    <div>
                        <p className="font-text text-unactive text-xs">Current Attempt</p>
                        <p className="font-header text-primary">{numberOfAttempts === 0 ? 1 : numberOfAttempts}{numberOfAttempts === 1 ? "st attempt" : numberOfAttempts === 2 ? "nd attempt" : numberOfAttempts === 3 ? "rd attempt" : "th attempt"}</p>
                    </div>
                    <ScrollArea className="h-[calc(100vh-18rem)] bg-white w-full rounded-md shadow-md border border-divider col-span-4">
                    </ScrollArea>

                    <div className={`col-span-2 px-4 py-4 border-2 border-primary rounded-md w-full h-full bg-white shadow-md flex items-center justify-center text-primary transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <p className="font-header text-sm ml-2">Previous Attempt</p>
                    </div>
                    <div className={`col-span-2 px-4 py-4 border-2 border-primary rounded-md w-full h-full bg-white shadow-md flex items-center justify-center text-primary transition-all ease-in-out whitespace-nowrap ${submitting ? "opacity-50 cursor-not-allowed":"hover:text-white hover:bg-primaryhover hover:border-primaryhover hover:cursor-pointer"}`}>
                        <p className="font-header text-sm mr-2">Next Attempt</p>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                </div>
                : quizState === "finalize" ?
                    <>
                        {
                            finalizing ?
                            <div className="flex flex-col justify-center items-center">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-5xl"/>
                                <p className="font-header text-primary text-2xl mt-2">Finalizing Assessment</p>
                                <p className="font-text text-unactive text-xs">Please wait and we are forging your journey to success...</p>
                            </div>
                            :
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-primarybg rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={finalized.remark === "Passed" ? faCheck : faXmark } className="text-primary text-5xl"/>
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <p className="text-4xl font-header text-primary">{finalized.remark}</p>
                                        <p className="text-xs font-text text-unactive">Assessment Remarks</p>

                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1 items-center">
                                        <p className="text-4xl font-header">{assessment.name}</p>
                                        <p className="text-xs font-text text-unactive">Assessment Name</p>
                                    </div>
                                    <div className="flex flex-row gap-10">
                                        <div className="flex flex-col justify-end items-end">
                                            <div className="flex flex-row gap-2 text-3xl font-header text-primary">
                                                <p>{finalized.bestScore}</p>
                                                <FontAwesomeIcon icon={faClipboard}/>
                                            </div>
                                            <p className="text-xs font-text text-unactive">Assessment Best Score</p>
                                        </div>
                                        <div className="flex flex-col justify-end items-end">
                                            <div className="flex flex-row gap-2 text-3xl font-header text-primary">
                                                <p>{finalized.bestPercentage}</p>
                                                <FontAwesomeIcon icon={faPercent}/>
                                            </div>
                                            <p className="text-xs font-text text-unactive">Assessment Performance</p>
                                        </div>
                                        <div className="flex flex-col justify-end items-end">
                                            <div className="flex flex-row gap-2 text-3xl font-header text-primary">
                                                <p>{finalized.attempts}</p>
                                                <FontAwesomeIcon icon={faPen}/>
                                            </div>
                                            <p className="text-xs font-text text-unactive">Assessment Attempt</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </>
                :null
            }
        </div>
    )
}
export default CourseAssesment
