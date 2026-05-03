import { faClock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useFormik } from "formik";
import * as React from "react";
import { useState } from "react";
import * as Yup from "yup";
import axiosClient from "../axios-client";
import { toast } from 'sonner';
import { set } from "date-fns";
import { useForm } from "@inertiajs/vue3";
  import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { InputOTP,InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot } from "../components/ui/input-otp";
import { useEffect } from "react";



const ResetPasswordModal = ({open, close, reseted}) => {
    const [resetting, setResetting] = useState(false);
    const [step, setStep] = useState(1);
    const [otpError, setOtpError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [user,setUser] = useState({});
    const [requested, setRequested] = useState(false);

    const [timeleft, setTimeLeft] = useState(0);
        useEffect(()=>{
            if (timeleft <=0) return;

            const interval = setInterval(()=>{
                setTimeLeft((prevTime) => prevTime - 1);
            },1000);


            return () => clearInterval(interval)
        },[timeleft])
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds/60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        }

    const formik = useFormik({
        initialValues: {
            creds: '',
        },
        validationSchema: Yup.object({
            creds: Yup.string().required('Required'),
        }),
        onSubmit: (values) => {
            // Handle form submission
            setResetting(true);
            axiosClient.post('/reqOTPEmailResetPassword', {
                MBemail: values.creds,
            }).then(({data}) => {
                setResetting(false);
                setStep(2);
                setTimeLeft(5*60);
                setResetting(false);
                setUser(data.User);
                setTimeout(() => {
                    setRequested(true);
                }, 2000);
            })


            // setTimeout(() => {
            //     setResetting(false);
            //     setStep(2);
            //     setTimeLeft(5*60);
            // }, 2000);
            // setTimeout(() => {
            //     setRequested(true);
            // }, 3000);

            // axiosClient.post('/reset-passowrd-request',payload)
            // .then((res) => {
            //     console.log(res)
            //     setResseting(false)
            //     toast("Request Sent",{
            //             description: "Please wait for the system admin action for your request",
            //         })
            //     setTimeout(
            //         formik.resetForm(),1000
            //     )
            //     close()
            // }).catch((err) => {
            //     console.log(err)
            //     setResseting(false)
            // })
            // console.log('Form submitted:', payload);
            // Close the modal after submission
        },
    })

    const OTP = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: Yup.object({
            otp: Yup.string().required('Required'),
        }),
        onSubmit: (values) => {
            // Handle form submission
            console.log('Form submitted:', values);

            handleOTPVerify();
        }
    })

    const handleOTPVerify = () => {
        setVerifying(true);

        axiosClient.post('/verifyOtpResetPassword', {
            user_id: user.id,
            otp: OTP.values.otp,
            user_email: user.MBemail,

        }).then(({data}) => {
            reseted();
            toast.success("Password Reset Successful")
            close();

            setTimeout(() => {
                setVerifying(false);
                formik.resetForm();
                OTP.resetForm();
                setStep(1);
            }, 1000);
        }).catch((error) => {
            const response = error.response;
            if (response && response.status === 422) {
                const errors = response.data.errors;
                if (errors.otp) {
                    setOtpError(errors.otp[0]);
                } else {
                    setOtpError('Verification failed. Please try again.');
                }
            } else {
                setOtpError('An unexpected error occurred. Please try again later.');
            }
            setVerifying(false);
        })
    }

    useEffect(() => {
        console.log(user)
    },[user])

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40'>
                        <div className='bg-white rounded-md h-full p-5 grid grid-row-5 grid-cols-2 w-[40vw]'>
                        {/* Header */}
                        <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 col-span-2 justify-between">
                            <div>
                                <h1 className="text-primary font-header text-3xl">Reset Password</h1>
                                <p className="text-unactive font-text text-xs">Enter you login credentials for MBLearn to reset your login password</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-fit bg-primarybg p-5 rounded-full flex items-center justify-center">
                                    <div className="h-full w-fit aspect-square flex items-center justify-center">
                                        <FontAwesomeIcon icon={faClock} className="text-primary text-lg"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {
                            step === 1 ?
                            <form onSubmit={formik.handleSubmit} className="px-4 w-full col-span-2">
                            <div>
                                <div className="inline-flex flex-col gap-1 col-span-2 py-2 w-full">
                                    <label htmlFor="creds" className="font-text text-xs flex flex-row justify-between">
                                        <p>MBLearn Registered Email or Employee ID <span className="text-red-500">*</span></p>
                                    </label>
                                    <input type="text" name="creds"
                                            value={formik.values.creds}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            maxLength={50}
                                            className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                    {formik.touched.creds && formik.errors.creds ? (<div className="text-red-500 text-xs font-text">{formik.errors.creds}</div>):null}
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                    <button type="button" className="w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                        onClick={()=>{
                                            if (verifying || resetting) return;
                                            close();
                                            formik.resetForm();
                                            OTP.resetForm();
                                            setOtpError('');
                                            setStep(1);
                                        }}>
                                        <p>Cancel</p>
                                    </button>
                                    <button type="submit" className={`w-full flex flex-row items-center justify-center gap-2 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${resetting? "opacity-50 hover:cursor-not-allowed":""}`}>
                                        {
                                            resetting ?
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                <p>Finding Account</p>
                                            </> : <>
                                                <p>Find Account</p>
                                            </>
                                        }
                                    </button>
                                </div>
                            </form>
                            :
                            <>
                                <div className="col-span-2 px-4">
                                    <p className="col-span-2 font-text text-xs text-unactive py-2">You account is found, please enter the verification code we have sent you for completing on resetting your Login Password</p>
                                </div>
                                <form onSubmit={OTP.handleSubmit} className="p-4 w-full col-span-2 flex flex-col items-center justify-center">
                                    <p className="font-text text-xs text-unactive py-2">Enter Verification Code</p>
                                    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={OTP.values.otp} onChange={(value) => OTP.setFieldValue('otp', value)}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                    </InputOTP>
                                <p className='text-unactive text-xs font-xs py-2'>OTP expires in: {formatTime(timeleft)}</p>
                                {
                                    requested ?
                                    <div className="col-span-2">
                                        <p className="col-span-2 font-text text-xs text-unactive">Didn't receive the code? <span className="text-primary hover:cursor-pointer hover:underline" onClick={()=> {
                                            setRequested(true);
                                            setTimeLeft(5*60);
                                        }}>Resend Code</span></p>
                                    </div>
                                    : null
                                }
                                {
                                    OTP.touched.otp && OTP.errors.otp &&
                                    <p className='font-text text-red-600 text-xs'>{OTP.errors.otp}</p>
                                }
                                {
                                    otpError &&
                                    <p className='font-text text-red-600 text-xs'>{otpError}</p>
                                }
                                </form>

                                <div className="flex flex-row gap-2 col-span-2 px-4">
                                    <div className="w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                        onClick={()=>{
                                            if (verifying || resetting) return;
                                            close();
                                            formik.resetForm();
                                            setOtpError('');
                                            OTP.resetForm();
                                            setStep(1);
                                        }}>
                                        <p>Cancel</p>
                                    </div>
                                    <div className={`w-full flex flex-row items-center justify-center gap-2 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${verifying? "opacity-50 hover:cursor-not-allowed":""}`}
                                        onClick={()=> OTP.handleSubmit()}>
                                        {
                                            verifying ?
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                <p>Verifying</p>
                                            </> : <>
                                                <p>Verify Code & Reset Password</p>
                                            </>
                                        }
                                    </div>
                                </div>
                            </>
                        }

                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
export default ResetPasswordModal;
