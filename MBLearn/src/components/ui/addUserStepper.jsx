import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createContext, useContext, useState, useImperativeHandle, forwardRef, useEffect,} from "react";

const AddUserStepper = createContext()

export const AddUser = forwardRef(({children, initialStep = 0, enableStepClick = false, onStepChange, formProgress= []},ref) => {
    const [activeStep, setActiveStep] = useState(initialStep);

    const steps = React.Children.toArray(children).filter(
        (child) => child.type === Step
    );

    const completedStep = React.Children.toArray(children).find(
        (child) => child.type === StepperCompleted
    );

    const isCompleted = activeStep >= steps.length;

    useImperativeHandle(ref, () => ({
        next: () => {
            setActiveStep((prev) => Math.min(prev + 1, steps.length));
        },
        back: () => {
            setActiveStep((prev) => Math.max(prev - 1, 0));
        },
        goTo: (stepIndex) => {
            if (stepIndex >= 0 && stepIndex < steps.length) {
                setActiveStep(stepIndex);
            }
        },
        reset: () => setActiveStep(initialStep),
        activeStep,
        stepsMeta,
    }));

    const stepsMeta = steps.map((step) => ({
        title: step.props.stepTitle,
        desc: step.props.stepDesc,
        stepID: step.props.stepID,
        icon: step.props.icon,
    }));
    useEffect(() => {
        if(onStepChange) onStepChange(activeStep, stepsMeta[activeStep]);
    }, [activeStep]);

    const setCurrent = () => {
        return formProgress.length
    }


    return (
        <AddUserStepper.Provider value={{activeStep, setActiveStep, stepsMeta}}>
            <div className="flex-row justify-between mx-4 gap-x-1
                            lg:flex
                            hidden">
                {steps.map((steps, index)=>{
                    const isActive = activeStep === index;
                    const isDone = formProgress.includes(steps.props.stepID);
                    const isCurrent = setCurrent() === index;

                    return (
                        <div key={index} className={`group grid rounded-md p-3 ${isActive ? 'border-2 border-primary': 'border-2 border-transparent'} ${isCurrent ? 'bg-primarybg':null} hover:border-primary transition-all ease-in-out cursor-pointer hover:shadow-md hover:bg-primarybg
                                                    grid-cols-1 w-fit
                                                    md:grid-cols-[min-content_1fr] md:gap-2 md:w-full`}
                                onClick={() => {
                                    if ((!isCompleted && enableStepClick && formProgress.includes(steps.props.stepID)) || isCurrent) {
                                        setActiveStep(index);
                                    }
                                }}>
                            <div className="flex">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary ${isActive ? '!bg-primary': null} ${isCurrent ? "bg-primary": isDone ? "bg-primarybg" :"bg-divider"}`}>
                                    <FontAwesomeIcon icon={isDone ? faCheckCircle : steps.props.icon} className={`text-lg text-primary group-hover:text-primarybg ${isActive ? 'text-white': null} ${isCurrent ? "text-primarybg": isDone ? "text-primary" : "text-unactive"}`} />
                                </div>
                            </div>
                            <div className="flex-col justify-start hidden md:flex">
                                <p className={`font-header text-sm group-hover:text-primary ${isActive ? '!text-primary': null} ${isCurrent ? "text-primary": isDone ? "text-primary" :"text-unactive"}`}>{steps.props.stepTitle}</p>
                                <p className={`font-text text-xs group-hover:text-primary ${isActive ? '!text-primary': null} ${isCurrent ? "text-primary":"text-unactive"} lg:block md:hidden`}>{steps.props.stepDesc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            {
                activeStep + 1 > steps.length ? null :
                <div className="lg:hidden flex justify-between items-center mx-4 gap-3">
                    <div className="flex gap-3">
                        <div className="flex py-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary`}>
                                <FontAwesomeIcon icon={steps[activeStep]?.props.icon} className={`text-lg text-white`} />
                            </div>
                        </div>
                        <div className="flex-col justify-center items-center leading-tight py-2">
                            <p className={`font-header text-sm text-primary`}>{steps[activeStep]?.props.stepTitle}</p>
                            <p className={`font-text text-xs text-unactive`}>{steps[activeStep]?.props.stepDesc}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-header text-primary text-sm">{activeStep+1}/{steps.length}</p>
                    </div>
                </div>
            }
            <div className="mx-4 py-2">
                {isCompleted ? completedStep : steps[activeStep]}
            </div>
        </AddUserStepper.Provider>
    );
})

export const Step = ({children}) => {
    return <div>{children}</div>
}

export const StepperCompleted = ({ children }) => {
    return <div>{children}</div>;
};

export const useAddUserStepper = () => useContext(AddUserStepper);
