import { text } from "@fortawesome/fontawesome-svg-core"
import { faSpinner, faCheck, faPencil, faList, faPlus, faSave, faStar, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from "formik"
import axiosClient from "MBLearn/src/axios-client";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { useAssessmentCanvas } from "MBLearn/src/contexts/AssessmentCanvasContext"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext"
import AssessmentDetails from "MBLearn/src/modalsandprops/AuthoringTool/AssessmentDetails";
import SuccessModal from "MBLearn/src/modalsandprops/AuthoringTool/SuccessModal";
import React, { useEffect, useState, useRef } from "react"
import { useParams } from "react-router";
import { Fetch } from "socket.io-client";
import * as Yup from 'yup';
import { id } from "zod/v4/locales/index.cjs"

export function AssessmentCanvas() {
    const {setPageTitle, setShowBack, setShouldConfirmBack} = useStateContext();
    const {assessment, setAssessment} = useAssessmentCanvas()
    const {course, setCourse} = useCreateCourse()
    const [assessmentItem, setAssessmentItem] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingButton, setLoadingButton] = useState({ 
        add: false, 
        save: false 
    });
    const [assessmentDetailsModal, setAssessmentDetailsModal] = useState(false);
    const {id} = useParams();

    useEffect(() => {
        setPageTitle("ASSESSMENT CANVAS");
        setShowBack(true);
        setShouldConfirmBack(true);

        return () => {
            setShouldConfirmBack(false);
            setShowBack(false);
        };
    }, []);

    const [assessmentName, setAssessmentName] = useState('');
    const fetchAssessmentContent = async () => {
        try {
            const response = await axiosClient.get(`/fetchAssessmentContent/${id}`);
            console.log("asdasd", response);
            setAssessmentName(response.data.TestName);  

            const formattedBlocks = response.data.customBlocks.map(block => ({
                id: block.id,
                questionType: block.QuestionType,
                question: block.BlockData.question,
                choices: block.BlockData.choices,
                points: block.BlockData.points,
            }));

            setAssessmentItem(formattedBlocks);

        } catch (error) {
            console.error("The Error: ", error);
        }
    }

    const getAssessment = () => {
        try {
            setLoading(true);
            axiosClient.get(`/assessment/${id}`)
            .then(({ data }) => {
                console.log("Assessment Data:", data);
                setAssessment(data);
                setAssessmentItem(
                data.custom_blocks.map(block => ({
                    id: block.id,
                    questionType: block.QuestionType,
                    question: block.BlockData.question,
                    choices: block.BlockData.choices,
                    points: block.BlockData.points,
                }))
                );
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            setLoading(false);
        }
    };


    useEffect(() => {
    if (!id) return;
        setLoading(true);
        getAssessment();
    }, [id]);


    // useEffect(() => {
    //     fetchAssessmentContent();
    //     console.log("Assessment Item:", assessmentItem);
    // },[assessmentItem])


    
    const choiceSchema = Yup.object().shape({
        id: Yup.number().required(),
        text: Yup.string().trim().required("Answer is required"),
        isCorrect: Yup.boolean(),
        left: Yup.string(),
        right: Yup.string(),
        selectedRight: Yup.string()
    });

    const assessmentItemSchema = Yup.array().of(
        Yup.object().shape({
            id: Yup.number().required(),
            questionType: Yup.string().required("Question type is required"),
            question: Yup.string().required("Question text is required"),
            points: Yup.number().min(1, "Minimum 1 point").max(10, "Maximum 10 points allowed").required("Points required"),

            choices: Yup.array().of(choiceSchema).ensure()
            .test(
                "validate-choices",
                "Invalid or missing answer(s)",
                function (choices) {
                const { questionType } = this.parent;
                if (!questionType) return true;

                if (["oneWordIdentification", "multipleWordIdentification"].includes(questionType)) {
                    return Array.isArray(choices) && choices.every(choice => choice?.text?.trim() !== "");
                }

                switch (questionType) {
                    case "multipleChoice":
                    case "trueOrfalse":
                    return (
                        Array.isArray(choices) &&
                        choices.some(c => c?.isCorrect === true) &&
                        choices.every(c => typeof c.text === "string" && c.text.trim() !== "")
                    );

                    case "matchingPairs":
                    return Array.isArray(choices) && choices.every(c =>
                        typeof c.left === "string" && c.left.trim() !== "" &&
                        typeof c.right === "string" && c.right.trim() !== ""
                    );

                    default:
                    return true;
                }
                }
            )
        })
    );



    const defaultQuestion = {
        id: 1,
        questionType: "",
        question: "",
        points: 1,
        choices: []
    };

    const normalizedAssessmentItem = (assessmentItem && assessmentItem.length > 0)
        ? assessmentItem
        : [defaultQuestion];

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { assessmentItem: normalizedAssessmentItem },
        validationSchema: Yup.object({
            assessmentItem: assessmentItemSchema
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setLoadingButton(prev => ({ ...prev, save: true }));
                const response = await axiosClient.put(`/updateQuestionBlocks/${id}/${assessment?.course_id}`, values);
                setSuccessModalOpen(true);
                resetForm({ values: response.data.assessmentItem || values });
                setAssessmentItem(response.data.assessmentItem || values.assessmentItem);
            } catch (error) {
                console.error('Error saving:', error.response?.data || error.message);
            } finally {
                setSubmitting(false);
                setLoadingButton(prev => ({ ...prev, save: false }));
            }
        }
    });


    const handleAddItem = () => {
        if (loadingButton.add || loadingButton.save) return;

        const currentItems = formik.values.assessmentItem;
        const nextId = currentItems.length > 0 ? Math.max(...currentItems.map(item => item.id)) + 1 : 1;

        const newItem = {
            id: nextId,
            questionType: "",
            question: "",
            choices: [],
            points: 1
        };

        const addedItems = [...currentItems, newItem];
        formik.setFieldValue("assessmentItem", addedItems);
    };

    const handleAddChoice = (index) => {
        const items = formik.values.assessmentItem;
        const currentChoices = items[index]?.choices || [];

        const choice = {
            id: currentChoices.length + 1,
            text: "",
            isCorrect: false
        };

        const updatedChoices = [...currentChoices, choice];
        formik.setFieldValue(`assessmentItem[${index}].choices`, updatedChoices);
    };
    const handleRemoveChoice = (itemIndex, choiceIndex) => {
        const items = [...formik.values.assessmentItem];
        const choices = [...items[itemIndex].choices];

        choices.splice(choiceIndex, 1);
        items[itemIndex].choices = choices;

        formik.setFieldValue("assessmentItem", items);
    };
    const handleMakeCorrect = (itemIndex, choiceIndex) => {
        const items = [...formik.values.assessmentItem];
        const updatedChoices = items[itemIndex].choices.map((choice, idx) => ({
            ...choice,
            isCorrect: idx === choiceIndex
        }));

        items[itemIndex].choices = updatedChoices;
        formik.setFieldValue("assessmentItem", items);
    };

    const handleRemoveQuestion = (index) => {
    const updatedItems = [...formik.values.assessmentItem];
    updatedItems.splice(index, 1); // remove 1 item at index
    formik.setFieldValue("assessmentItem", updatedItems);
    };

    useEffect(() => {
        console.log("Assessment Item Updated:", formik.values.assessmentItem);
    },[formik.values.assessmentItem])

    const handleMaximumPoints = (index) => (e) => {
        let value = e.target.value;

        if (value === "") {
            formik.setFieldValue(`assessmentItem[${index}].points`, "");
            return;
        }

        let num = Number(value);
        if (num < 1) num = 1;
        else if (num > 10) num = 10;

        formik.setFieldValue(`assessmentItem[${index}].points`, num);
    }

    /// --------------------
    /// Quick Question Navigation
    /// --------------------
    const questionRefs = useRef([]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleScrollToQuestion = (index) => {
        const element = questionRefs.current[index];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="grid h-full w-full grid-cols-4 grid-rows-[min-content_1fr] gap-2">
            {/* Header */}
            <div className="flex flex-row w-full col-span-2 items-center h-full gap-2 pr-4">
                <div className="w-10 h-10 bg-white shadow-md border-2 border-primary p-2 rounded-md hover:cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out text-primary"
                    onClick={() => setAssessmentDetailsModal(true)}>
                    <FontAwesomeIcon icon={faPencil} className="text-xl"/>
                </div>
                <div>
                {
                    loading ?
                        <div className="space-y-2 animate-pulse">
                        <div className="h-3 w-24 bg-gray-300 rounded"></div> {/* for "Assessment Name:" */}
                        <div className="h-7 w-48 bg-gray-300 rounded"></div> {/* for the big TestName */}
                        <div className="h-3 w-64 bg-gray-300 rounded"></div> {/* for course + category + level */}
                        </div>
                    :
                    <>
                        <p className="text-xs text-unactive font-text">Assessment Name:</p>
                        <p className="text-xl font-header text-primary">{assessment.TestName}</p>
                        <p className="text-xs font-text text-unactive">
                            {assessment?.created_course?.CourseName} ({assessment?.created_course?.category.category_name} - {assessment?.created_course?.career_level?.name} Level)
                        </p>
                    </>
                }
                </div>
            </div>
            <div className="flex flex-row w-full col-span-2 justify-end items-center h-full gap-2 pr-4">
                <div
                className={`min-h-10 flex items-center justify-center border-primary border-2 rounded-md bg-white text-primary hover:text-white hover:bg-blue-500 hover:cursor-pointer transition-all ease-in-out px-4 py-2 gap-4 w-fit
                    ${(loadingButton.add || loadingButton.save || loading) ? "opacity-50 pointer-events-none" : ""}
                `}
                onClick={() => {
                    if (loadingButton.add || loadingButton.save) return;
                    handleAddItem(assessmentItem.length + 2);
                }}
                >
                {loadingButton.add ? (
                    <>
                    <FontAwesomeIcon icon={faSpinner} className="text-xl animate-spin" />
                    <p className="font-header">Adding...</p>
                    </>
                ) : (
                    <>
                    <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    <p className="font-header">Add Question</p>
                    </>
                )}
                </div>

                <div
                    className={`border-2 border-primary bg-primary rounded-md min-w-10 min-h-10 flex justify-center items-center text-white hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out w-fit px-4 py-2 gap-4
                        ${(loadingButton.save || loadingButton.add || loading) ? "opacity-50 pointer-events-none" : ""}
                    `}
                    onClick={() => {
                        if (loadingButton.save || loadingButton.add) return;
                        formik.handleSubmit();console.log('Formik Errors:', formik.errors);

                    }}
                    >
                    {loadingButton.save ? (
                        <>
                        <FontAwesomeIcon icon={faSpinner} className="text-xl animate-spin" />
                        <p className="font-header">Saving...</p>
                        </>
                    ) : (
                        <>
                        <FontAwesomeIcon icon={faSave} className="text-xl" />
                        <p className="font-header">Save Changes</p>
                        </>
                    )}
                </div>

            </div>





            {/* Content */}
            <form onSubmit={formik.handleSubmit}  className="col-span-3 row-span-1 pb-4">
            <div>
                {
                    loading ?
                    <div
                        className="h-[calc(100vh-10.3rem)] w-full rounded-md animate-pulse"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.6)", zIndex: 10 }}
                    />
                    :
                    <ScrollArea className="h-[calc(100vh-10.3rem)] bg-white w-full rounded-lg border border-divider">
                        <div className="h-full bg-white w-full p-4 shadow-sm flex flex-col gap-4">
                            {
                                formik.values.assessmentItem?.map((item, index) => (
                                    <div key={index} 
                                        ref={(el) => questionRefs.current[index] = el}
                                        className="h-fit w-full p-4 border border-primary rounded-lg bg-white shadow-md flex flex-col gap-2"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="col-span-2 flex flex-col gap-1">
                                                <label htmlFor={`assessmentItem[${index}].questionType`} className="font-header text-xs flex flex-row justify-between">
                                                    <p className="font-text text-unactive">Question Type:</p>
                                                </label>
                                                <div className="grid grid-cols-1 col-span-2">
                                                <select id={`assessmentItem[${index}].questionType`} name={`assessmentItem[${index}].questionType`} className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.assessmentItem[index]?.questionType}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            const items = [...formik.values.assessmentItem];
                                                            const question = {...items[index], questionType: value};

                                                            if(value === "trueOrfalse") {
                                                                question.choices = [
                                                                        { id: 1, text: "True", isCorrect: false },
                                                                        { id: 2, text: "False", isCorrect: false }
                                                                ];
                                                            } else if (value === "oneWordIdentification") {
                                                                question.choices = [
                                                                    { id: 1, text: "", isCorrect: true }
                                                                ];
                                                            } else if(value === "multipleChoice" || value === "likert") {
                                                                question.choices = [];
                                                            } else if(value === "matchingPairs") {
                                                                question.choices = [
                                                                    {id: 1, left: "", right: "", selectedRight: ""}
                                                                ];
                                                            }

                                                            items[index] = question;
                                                            formik.setFieldValue("assessmentItem", items);
                                                        }}
                                                        // onBlur={formik.handleBlur}>
                                                        >
                                                        <option value="">Question Type</option>
                                                        <option value="trueOrfalse">True or False</option>
                                                        <option value="multipleChoice">Multiple Choice</option>
                                                        <option value="oneWordIdentification">Identification</option>
                                                        <option value="multipleWordIdentification">Fill in the Blanks</option>
                                                        {/* <option value="matchingPairs">Matching Pairs</option> */}
                                                        <option value="likert">Likert Scale</option>
                                                    </select>
                                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="col-span-1 flex flex-col gap-1">
                                                <label htmlFor={`assessmentItem[${index}].points`} className="font-header text-xs flex flex-row justify-between">
                                                    <p className="font-text text-unactive">Question Value:</p>
                                                </label>
                                                <div className="relative">
                                                   <input className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full"
                                                        type="number"
                                                        name={`assessmentItem[${index}].points`}
                                                        value={formik.values.assessmentItem[index].points}
                                                        onChange={handleMaximumPoints(index)}
                                                        onBlur={formik.handleBlur}
                                                        placeholder="0"
                                                        min={1}
                                                        max={10}
                                                    />
                                                    <div className="absolute top-1/2 -translate-y-1/2 flex flex-col justify-center items-end  w-full h-full pointer-events-none p-2">
                                                        <p className="text-xs text-unactive">Points</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-start text-unactive hover:cursor-pointer hover:text-red-700 transition-all ease-in-out"
                                                onClick={() => {handleRemoveQuestion(index)}}>
                                                <FontAwesomeIcon icon={faXmark} className="text-xl hover:cursor-pointer hover:text-red-700 transition-all ease-in-out"/>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between gap-1">
                                            <div className="flex flex-row justify-between items-center">
                                                <p className="font-header text-primary">Question {index+1}</p>
                                                <p className="font-text text-xs text-unactive">Please input your question here in the given field</p>
                                            </div>
                                            {(() => {
                                                const questionError = formik.errors.assessmentItem?.[index]?.question;
                                                const questionTouched = formik.touched.assessmentItem?.[index]?.question;
                                                const currentValue = formik.values.assessmentItem[index]?.question || "";
                                                const currentLength = currentValue.length;
                                                const maxLength = 500;

                                                return (
                                                <>
                                                    <textarea
                                                    maxLength={500}
                                                    name={`assessmentItem[${index}].question`}
                                                    id={`assessmentItem[${index}].question`}
                                                    value={formik.values.assessmentItem[index]?.question}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        formik.setFieldValue(`assessmentItem[${index}].question`, value);

                                                        if (formik.values.assessmentItem[index].questionType === "multipleWordIdentification") {
                                                       const blanks = (value.match(/(?<![,])(_{10,})(?!_)/g) || []).length;
                                                        const currentChoices = formik.values.assessmentItem[index].choices || [];
                                                        let newChoices = [...currentChoices];

                                                        if (blanks > currentChoices.length) {
                                                            for (let i = currentChoices.length; i < blanks; i++) {
                                                            newChoices.push({
                                                                id: i + 1,
                                                                text: "",
                                                                isCorrect: true,
                                                            });
                                                            }
                                                        } else if (blanks < currentChoices.length) {
                                                            newChoices = newChoices.slice(0, blanks);
                                                        }

                                                        formik.setFieldValue(`assessmentItem[${index}].choices`, newChoices);
                                                        }
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                    disabled={formik.values.assessmentItem[index].questionType === ""}
                                                    className={`h-32 font-text border rounded-md p-2 resize-none focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${
                                                        questionError && questionTouched ? "border-red-600" : "border-divider"
                                                    }`}
                                                    />
                                                    <p className="text-xs text-right text-unactive">
                                                        {currentLength} / {maxLength}
                                                    </p>
                                                </>
                                                );
                                            })()}
                                        </div>
                                        {formik.touched.assessmentItem?.[index]?.question && formik.errors.assessmentItem?.[index]?.question && (
                                            <p className="text-sm text-red-600 font-text mb-2">
                                                {formik.errors.assessmentItem[index].question}
                                            </p>
                                        )}
                                        {/* answer and choices */}
                                        <div className={`grid ${item.questionType === "multipleChoice" ||  item.questionType === "trueOrfalse" ? "grid-cols-1" : ""} gap-2`}>
                                            {
                                                item.questionType === "multipleChoice" ?
                                                <>
                                                    <div className="flex flex-row justify-between items-center">
                                                        <p className="text-xs ">Choices:</p>
                                                        <p className="text-xs text-unactive">Must picked an correct choice for the given question</p>
                                                    </div>
                                                    {
                                                        formik.touched.assessmentItem?.[index]?.choices &&
                                                        typeof formik.errors.assessmentItem?.[index]?.choices === "string" && (
                                                            <p className="text-sm text-red-600 font-text mb-2">
                                                                {formik.errors.assessmentItem[index].choices}
                                                            </p>
                                                        )
                                                    }
                                                    <div className="flex flex-col gap-2 items-center">
                                                        {
                                                           item.choices?.map((choice, idx) => {
                                                                const errorText = formik.errors.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                                const touched = formik.touched.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                                const currentValue = formik.values.assessmentItem[index]?.choices[idx]?.text || "";
                                                                const maxLength = 50;
                                                                const currentLength = currentValue.length;

                                                                return (
                                                                    <div key={idx} className="w-full flex flex-col gap-1">
                                                                        <div className="flex flex-row justify-between gap-2 items-center">
                                                                            {/* Correct Choice Selector */}
                                                                            <div
                                                                                className={`group border border-primary rounded-md min-w-10 min-h-10 flex justify-center items-center hover:cursor-pointer hover:bg-primary ${
                                                                                    choice.isCorrect ? "bg-primary text-white hover:bg-primaryhover" : ""
                                                                                } transition-all ease-in-out`}
                                                                                onClick={() => handleMakeCorrect(index, idx)}
                                                                            >
                                                                                {choice.isCorrect ? (
                                                                                    <FontAwesomeIcon icon={faCheck} className="text-lg" />
                                                                                ) : (
                                                                                    <FontAwesomeIcon icon={faCheck} className="text-lg scale-0 group-hover:scale-100 text-white" />
                                                                                )}
                                                                            </div>

                                                                            {/* Choice Input with Validation */}
                                                                            <input
                                                                                type="text"
                                                                                maxLength={50}
                                                                                name={`assessmentItem[${index}].choices[${idx}].text`}
                                                                                value={formik.values.assessmentItem[index]?.choices[idx]?.text}
                                                                                onChange={formik.handleChange}
                                                                                onBlur={formik.handleBlur}
                                                                                placeholder="Please enter choice here"
                                                                                className={`font-text border rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full ${
                                                                                    errorText && touched ? "border-red-600" : "border-divider"
                                                                                }`}
                                                                            />

                                                                            {/* Delete Choice Button */}
                                                                            <div>
                                                                                <div
                                                                                    className="border border-transparent bg-red-700 rounded-md min-w-10 min-h-10 flex justify-center items-center text-white hover:cursor-pointer hover:bg-red-800 transition-all ease-in-out"
                                                                                    onClick={() => handleRemoveChoice(index, idx)}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs text-right text-unactive">
                                                                            {currentLength} / {maxLength}
                                                                        </p>
                                                                        {/* Error Message */}
                                                                        {errorText && touched && (
                                                                            <p className="text-sm text-red-600 font-text">{errorText}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                        {
                                                            formik.values.assessmentItem[index]?.choices?.length !== 4 &&
                                                            <div className="py-2 flex flex-row gap-2 items-center justify-center text-white rounded-md shadow-md bg-primary w-full hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                                                onClick={() => {handleAddChoice(index)}}>
                                                                <FontAwesomeIcon icon={faPlus}/>
                                                                <p className="font-header">Add Answer</p>
                                                            </div>
                                                        }
                                                    </div>
                                                </>
                                                : item.questionType === "trueOrfalse" ?
                                                <>
                                                    <div className="flex flex-row justify-between items-center">
                                                        <p className="text-xs ">Choices:</p>
                                                        <p className="text-xs text-unactive">Must picked an correct choice for the given question</p>
                                                    </div>
                                                    {
                                                        formik.touched.assessmentItem?.[index]?.choices &&
                                                        typeof formik.errors.assessmentItem?.[index]?.choices === "string" && (
                                                            <p className="text-sm text-red-600 font-text mb-2">
                                                                {formik.errors.assessmentItem[index].choices}
                                                            </p>
                                                        )
                                                    }
                                                    <div className="flex flex-col gap-2 items-center">
                                                        {
                                                            item.choices?.map((choice, idx) => (
                                                                <div key={idx} className="w-full flex flex-row justify-between gap-2 items-center">
                                                                    <div className={`group border border-primary rounded-md min-w-10 min-h-10 flex justify-center items-center hover:cursor-pointer hover:bg-primary ${choice.isCorrect ? "bg-primary text-white hover:bg-primaryhover" : null } transition-all ease-in-out`} onClick={() => {handleMakeCorrect(index, idx)}}>
                                                                        {
                                                                            choice.isCorrect ?
                                                                            <FontAwesomeIcon icon={faCheck} className="text-lg"/>
                                                                            :<FontAwesomeIcon icon={faCheck} className="text-lg scale-0 group-hover:scale-100 text-white"/>
                                                                        }
                                                                    </div>
                                                                    <div className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full">
                                                                        {choice.text}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </>
                                                : item.questionType === "oneWordIdentification" ?
                                                <>
                                                    <div className="flex flex-row justify-between items-center">
                                                        <p className="text-xs ">Answer:</p>
                                                        <p className="text-xs text-unactive">Provide the answer for the created question</p>
                                                        </div>

                                                        <div>
                                                        {item.choices?.map((choice, idx) => {
                                                            const errorText = formik.errors.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                            const touched = formik.touched.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                            const currentValue = formik.values.assessmentItem[index]?.choices[idx]?.text || "";
                                                            const maxLength = 50;
                                                            const currentLength = currentValue.length;

                                                            return (
                                                            <div key={idx} className="w-full flex flex-col gap-1">
                                                                <input
                                                                type="text"
                                                                maxLength={50}
                                                                name={`assessmentItem[${index}].choices[${idx}].text`}
                                                                value={formik.values.assessmentItem[index]?.choices[idx]?.text}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                placeholder="Please enter answer here"
                                                                className={`font-text border rounded-md p-2 w-full focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 ${
                                                                    errorText && touched ? "border-red-600" : "border-divider"
                                                                }`}
                                                                />
                                                                <p className="text-xs text-right text-unactive">
                                                                    {currentLength} / {maxLength}
                                                                </p>
                                                                {touched && errorText && (
                                                                <p className="text-sm text-red-600 font-text mb-2">{errorText}</p>
                                                                )}
                                                            </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                                // : item.questionType === "matchingPairs" ?
                                                // <>
                                                //     <div className="flex flex-row justify-between items-center">
                                                //         <p className="text-xs">Matching Pairs:</p>
                                                //         <p className="text-xs text-unactive">Enter the left item and its correct right pair</p>
                                                //     </div>

                                                //     <div className="flex flex-col gap-2">
                                                //         {
                                                //             item.choices?.map((choice, idx) => (
                                                //                 <div key={idx} className="flex flex-row items-center gap-2">
                                                //                     {/* Left Input */}
                                                //                     <input
                                                //                         type="text"
                                                //                         name={`assessmentItem[${index}].choices[${idx}].left`}
                                                //                         value={formik.values.assessmentItem[index]?.choices[idx]?.left || ''}
                                                //                         onChange={formik.handleChange}
                                                //                         onBlur={formik.handleBlur}
                                                //                         placeholder="Enter left item"
                                                //                         className="font-text border border-divider rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
                                                //                     />

                                                //                     {/* Right Input */}
                                                //                     <input
                                                //                         type="text"
                                                //                         name={`assessmentItem[${index}].choices[${idx}].right`}
                                                //                         value={formik.values.assessmentItem[index]?.choices[idx]?.right || ''}
                                                //                         onChange={formik.handleChange}
                                                //                         onBlur={formik.handleBlur}
                                                //                         placeholder="Enter right item"
                                                //                         className="font-text border border-divider rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
                                                //                     />
                                                //                 <button
                                                //                     type="button"
                                                //                     className="border border-transparent bg-red-700 rounded-md min-w-10 min-h-10 flex justify-center items-center text-white hover:cursor-pointer hover:bg-red-800 transition-all ease-in-out"
                                                //                     onClick={() => {handleRemovePairs(index, idx)}}
                                                //                 >
                                                //                     <FontAwesomeIcon icon={faTrash}/>
                                                //                 </button>
                                                //                 </div>
                                                //             ))

                                                //         }
                                                //         <button
                                                //             type="button"
                                                //             className="py-2 flex flex-row gap-2 items-center justify-center text-white rounded-md shadow-md bg-primary w-full hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                                //             onClick={() => {handleAddPairs(index)}}
                                                //         >
                                                //             <FontAwesomeIcon icon={faPlus}/>
                                                //             <p className="font-header">Add New Pair</p>
                                                //         </button>
                                                //     </div>
                                                // </>
                                                : item.questionType === "multipleWordIdentification" ?
                                                <>
                                                    <div>
                                                        <div className="flex flex-row justify-between items-center">
                                                            <p className="text-xs ">Answers:</p>
                                                            <p className="text-xs text-unactive">Provide the answers for the created question</p>
                                                        </div>
                                                        </div>

                                                        <div className="">
                                                        {item.choices.length === 0 ? (
                                                            <div className="py-4 flex items-center justify-center flex-col gap-2 border border-dashed border-primary rounded-md w-full">
                                                            <p className="text-xs text-unactive">
                                                                No blanks detected. Please add "__________" in the question to generate answer fields.
                                                            </p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-2 items-center w-full">
                                                            {item.choices?.map((choice, idx) => {
                                                                const errorText = formik.errors.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                                const touched = formik.touched.assessmentItem?.[index]?.choices?.[idx]?.text;
                                                                const currentValue = formik.values.assessmentItem[index]?.choices[idx]?.text || "";
                                                                const maxLength = 50;
                                                                const currentLength = currentValue.length;

                                                                return (
                                                                <div
                                                                    className="w-full flex flex-row justify-between gap-2 items-center whitespace-nowrap"
                                                                    key={idx}
                                                                >
                                                                    <p className="font-text text-xs">Answer {idx + 1}:</p>

                                                                    <input
                                                                    maxLength={50}
                                                                    type="text"
                                                                    name={`assessmentItem[${index}].choices[${idx}].text`}
                                                                    value={formik.values.assessmentItem[index]?.choices[idx]?.text || ""}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    placeholder={`Answer for blank #${idx + 1}`}
                                                                    className={`font-text border rounded-md p-2 w-full focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 ${
                                                                        errorText && touched ? "border-red-600" : "border-divider"
                                                                    } focus-within:outline-primary`}
                                                                    />
                                                                    <p className="text-xs text-right text-unactive">
                                                                        {currentLength} / {maxLength}
                                                                    </p>
                                                                    {touched && errorText && (
                                                                    <p className="text-sm text-red-600 font-text mb-2">{errorText}</p>
                                                                    )}
                                                                </div>
                                                                );
                                                            })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                                : item.questionType === "likert" ?
                                                <>
                                                    <div className="flex flex-row justify-between items-center">
                                                        <p className="text-xs ">Degree of answer:</p>
                                                        <p className="text-xs text-unactive">Input conseccutively the possible answer of the user</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-center">
                                                        {
                                                            item.choices?.map((choice, idx) => (
                                                                <div key={idx} className="w-full flex flex-row justify-between gap-2 items-center">
                                                                    <input type="text" name={`assessmentItem[${index}].choices[${idx}].text`}
                                                                    maxLength={25}
                                                                    value={formik.values.assessmentItem[index]?.choices[idx]?.text}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    placeholder="Please enter choice here"
                                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full"/>
                                                                    <div>
                                                                        <div className="border border-transparent bg-red-700 rounded-md min-w-10 min-h-10 flex justify-center items-center text-white hover:cursor-pointer hover:bg-red-800 transition-all ease-in-out"
                                                                            onClick={() => {handleRemoveChoice(index, idx)}}>
                                                                            <FontAwesomeIcon icon={faTrash}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        {
                                                            formik.values.assessmentItem[index]?.choices?.length !== 10 &&
                                                            <div className="py-2 flex flex-row gap-2 items-center justify-center text-white rounded-md shadow-md bg-primary w-full hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                                                onClick={() => {handleAddChoice(index)}}>
                                                                <FontAwesomeIcon icon={faPlus}/>
                                                                <p className="font-header">Add Degree answer</p>
                                                            </div>
                                                        }
                                                    </div>
                                                </>
                                                : null
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                }
            </div>
            </form>

            {/* Assement Review and Quick Link */}
            <div className="col-span-1 row-span-1 pb-4 pr-4 flex flex-col gap-2 h-full">
                <div className="flex flex-row items-center gap-2 h-fit">
                    <div className="h-fit w-full p-4 border-2 border-primary rounded-lg bg-white shadow-sm flex flex-col justify-between gap-2">
                    <p className="text-xs">Total Items</p>
                    <p className="font-header text-primary text-xl">
                        <FontAwesomeIcon icon={faList} /> {formik.values.assessmentItem.length || 0} <span className="text-xs font-text">items</span>
                    </p>
                    </div>
                    <div className="h-fit w-full p-4 border-2 border-primary rounded-lg bg-white shadow-sm flex flex-col justify-between gap-2">
                    <p className="text-xs">Total Score</p>
                    <p className="font-header text-primary text-xl">
                        <FontAwesomeIcon icon={faStar} /> {formik.values.assessmentItem ? formik.values.assessmentItem.reduce((sum, q) => sum + (Number(q.points) || 0), 0) : 0} <span className="text-xs font-text">points</span>
                    </p>
                    </div>
                </div>
                <div className="w-full h-full flex flex-col gap-2">
                    <p className="text-xs text-unactive">Question items</p>
                    <ScrollArea className="h-[calc(100vh-18em)] bg-white w-full rounded-lg border border-divider">
                        <div className="h-full w-full p-4 flex flex-col gap-2">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex flex-row justify-between h-fit w-full border border-primary rounded-md p-4 gap-2 shadow-md animate-pulse">
                                <div className="flex flex-col gap-1 w-3/4">
                                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </div>
                            ))
                        ) : (
                            formik.values.assessmentItem?.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setSelectedIndex(index);
                                }}
                                className={`
                                cursor-pointer flex flex-row justify-between h-fit w-full border rounded-md p-4 gap-2 shadow-md transition
                                ${
                                    selectedIndex === index
                                    ? 'bg-blue-100 border-blue-600 shadow-lg' // angas naman ng mga to
                                    : 'border-primary hover:bg-gray-50'
                                }
                                `}
                            >
                                <div>
                                <p className="font-text text-sm">Question {index + 1}</p>
                                <p className="font-text text-xs text-unactive">
                                    {item.questionType === "trueOrfalse"
                                    ? "True or False"
                                    : item.questionType === "multipleChoice"
                                    ? "Multiple Choice"
                                    : item.questionType === "oneWordIdentification"
                                    ? "Identification "
                                    : item.questionType === "multipleWordIdentification"
                                    ? "Fill in the Blank"
                                    : item.questionType === "matchingPairs"
                                    ? "Matching Pairs"
                                    : item.questionType === "likert"
                                    ? "Likert Scale"
                                    : "No Question Type Selected"}
                                </p>
                                </div>
                                <div>
                                <p className="font-text text-xs text-unactive">{item.points || 0} points</p>
                                </div>
                            </div>
                            ))
                        )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <AssessmentDetails
                open={assessmentDetailsModal}
                close={() => setAssessmentDetailsModal(false)}
                assessment={assessment}
                refetchAssessmentName={getAssessment}
                courseId={assessment.created_course?.id}
            />
            <SuccessModal
                open={successModalOpen}
                close={() => setSuccessModalOpen(false)}
                header="Saved Successfully"
                desc="The Assessment Content is now updated."
                confirmLabel="Close"
            />
        </div>
    )
}
