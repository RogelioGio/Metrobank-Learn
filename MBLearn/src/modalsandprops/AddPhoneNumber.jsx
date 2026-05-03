import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { faCheckCircle, faClock, faEye, faEyeSlash, faKey, faPaperPlane, faSpinner, faSquareCheck, faSquareXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from '../axios-client';
import { useNavigate, useParams } from 'react-router';
import { set } from 'date-fns';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { toast } from 'sonner';




const AddPhoneNumber = ({open, close}) => {
    const {user} = useStateContext();
    const {id, role} = useParams()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(2);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);
    const [AuthenticatedUser, setAuthenticatedUser] = useState(null);

     const PhoneNumber = useFormik({
            initialValues: {
                PhoneNumber: '',
                OTP: '',
            },
            validationSchema: Yup.object({
                PhoneNumber: Yup.string()
                    .required('Phone Number is required')
                    .matches(/^9\d{9}$/, 'Invalid phone number, Must be exactly 10 digits and type in this format (9XXXXXXXXX)'),
                OTP: Yup.string()
                    .required('Verification code is required')
                    .length(6, 'Verification code must be 6 digits')
                    .matches(REGEXP_ONLY_DIGITS_AND_CHARS, 'Verification code must contain only digits and characters')
            }),
            onSubmit: (values) => {
                handleSavePhoneNumber();
            }
        });

        const handleSendOTP = () => {
            setSending(true);
            axiosClient.post('/otp-phone-number', {
                phone: `+63${PhoneNumber.values.PhoneNumber}`,
            }).then(({data}) => {
                 setSending(false);
                 setSent(true);
            }).catch((err) => {})
        }

        const handleSavePhoneNumber = () => {
            setSavingPhone(true);
            axiosClient.post('/save-phone-number', {
                phone: `+63${PhoneNumber.values.PhoneNumber}`,
                otp: PhoneNumber.values.OTP,
                user_id: user.id,
            })
            .then(({data}) => {
                toast.success('Phone number verified successfully!');
                setSavingPhone(false);
                setTimeout(() => {
                    PhoneNumber.resetForm();
                    setSent(false);
                    setSending(false);
                }, 2000);
                close();
            }).catch((err) => {
                toast.error('Failed to verify phone number. Please check the OTP and try again.');
                setSavingPhone(false);
            })
        }

    return (
        <Dialog open={open} onClose={()=>{}}>
            <Dialog open={open} onClose={()=>{}}></Dialog><DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='flex flex-col w-[40vw] bg-white rounded-lg shadow-lg p-5'>
                                                    <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-col col-span-2">
                                                        <p className='font-header text-xl text-primary'>Verify Your Phone Number</p>
                                                        <p className='font-text text-xs text-'>Add and verify your phone number to use it for OTP logins and account security</p>
                                                    </div>

                                                    <div className='py-2 flex flex-col mx-5 justify-center gap-2'>
                                                        {/* Phone number input */}
                                                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2">
                                                            <label htmlFor="name" className="font-text  text-xs flex flex-col justify-between">
                                                                <p className="text-unactive">Phone Number under Globe, TM, and DITO Telecom are only viable numbers at this moment</p>
                                                                <p>Phone Number <span className="text-red-500">*</span></p>
                                                            </label>
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <input type="text" name="PhoneNumber"
                                                                        value={PhoneNumber.values.PhoneNumber}
                                                                        onChange={PhoneNumber.handleChange}
                                                                        onBlur={PhoneNumber.handleBlur}
                                                                        maxLength={10}
                                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary w-full"/>
                                                                <div className={`min-w-10 min-h-10 flex items-center justify-center rounded-md ${PhoneNumber.errors.PhoneNumber || !PhoneNumber.values.PhoneNumber || sending || sent ? 'bg-gray-400 hover:cursor-not-allowed' : 'bg-primary hover:cursor-pointer hover:bg-primaryhover'} transition-all ease-in-out`}
                                                                    onClick={()=>{
                                                                            if(PhoneNumber.errors.PhoneNumber || !PhoneNumber.values.PhoneNumber || sending || sent) return;
                                                                            handleSendOTP()
                                                                        }}>
                                                                        {
                                                                            sending ? <FontAwesomeIcon icon={faSpinner} className="text-white animate-spin"/> :
                                                                            sent ? <FontAwesomeIcon icon={faCheckCircle} className="text-white"/> :
                                                                            <FontAwesomeIcon icon={faPaperPlane} className="text-white"/>
                                                                        }
                                                                </div>
                                                            </div>
                                                            {
                                                                sending ? <p className='font-text text-xs text-unactive'>Sending Validation Code...</p> :
                                                                sent ? <p className='font-text text-xs text-primary'>OTP Sent! Please check your messages. <span className='underline text-unactive cursor-pointer ' onClick={()=>{
                                                                   if(PhoneNumber.errors.PhoneNumber || !PhoneNumber.values.PhoneNumber || sending ) return;
                                                                    handleSendOTP()
                                                                }}>Didnt get the code, Resend another one?</span></p> : null
                                                            }
                                                            {PhoneNumber.touched.PhoneNumber && PhoneNumber.errors.PhoneNumber ? (<div className="text-red-500 text-xs font-text">{PhoneNumber.errors.PhoneNumber}</div>):null}
                                                        </div>
                                                        <div className='font-text text-xs flex flex-col items-center justify-center gap-2'>
                                                            <p className='text-unactive'>Check your messages and type the code here to verify.</p>
                                                            <form>
                                                                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={PhoneNumber.values.OTP} onChange={(value) =>PhoneNumber.setFieldValue('OTP', value)}>
                                                                    <InputOTPGroup>
                                                                        <InputOTPSlot index={0} />
                                                                        <InputOTPSlot index={1} />
                                                                        <InputOTPSlot index={2} />
                                                                        <InputOTPSlot index={3} />
                                                                        <InputOTPSlot index={4} />
                                                                        <InputOTPSlot index={5} />
                                                                    </InputOTPGroup>
                                                                </InputOTP>
                                                            </form>
                                                                {
                                                                    PhoneNumber.touched.OTP && PhoneNumber.errors.OTP &&
                                                                    <p className='font-text text-red-600 text-xs'>{PhoneNumber.errors.OTP}</p>
                                                                }
                                                        </div>
                                                        <div className='pt-2 flex-row flex gap-2 '>
                                                            <div className={`w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${savingPhone ? 'opacity-50 hover:cursor-not-allowed' : 'border-primary text-primary hover:text-white hover:bg-primaryhover'}`}
                                                                onClick={()=>{
                                                                    if(savingPhone) return;
                                                                    close()
                                                                    setTimeout(() => {
                                                                        PhoneNumber.resetForm();
                                                                        setSent(false);
                                                                        setSending(false);
                                                                    }, 2000);
                                                                }}>
                                                                <p>Cancel</p>
                                                            </div>
                                                            <div className={`w-full bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out flex flex-row justify-center items-center gap-2 ${savingPhone ? 'bg-gray-400 opacity-50 hover:cursor-not-allowed' : PhoneNumber.isValid && PhoneNumber.dirty ? 'bg-primary hover:cursor-pointer hover:bg-primaryhover' : 'bg-gray-400 opacity-50 hover:cursor-not-allowed'}`}
                                                            onClick={()=>{
                                                                if(savingPhone) return;
                                                                PhoneNumber.handleSubmit()}}>
                                                                {
                                                                    savingPhone ?
                                                                    <p>
                                                                        <FontAwesomeIcon icon={faSpinner} className="text-white mr-2 animate-spin"/>
                                                                        SAVING PHONE NUMBER...
                                                                    </p>
                                                                    :
                                                                    <p>
                                                                        VERIFY & ADD PHONE NUMBER
                                                                    </p>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
export default AddPhoneNumber
