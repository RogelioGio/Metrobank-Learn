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

//Props for password checker
const PasswordRule = ({passed, children}) => (
    <li className={`flex flex-row gap-4 items-center font-text text-sm ${passed ? 'text-primary' : 'text-unactive'}`}>
        <FontAwesomeIcon icon={passed ? faSquareCheck : faSquareXmark}/>
        {children}
    </li>
)

export default function InitialLogin() {
    const {user} = useStateContext();
    const {id, role} = useParams()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);
    const [AuthenticatedUser, setAuthenticatedUser] = useState(null);

     //pasword criteria checker
        const [criteria, setCriteria] = useState({
            length: false,
            upper: false,
            lower: false,
            number: false,
            special: false,
        })
        const checkPasswordCriteria = (password) => {
            return {
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                lower: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            }
        }
        const handlePasswordChange = (e) => {
            formik.handleChange(e);
            const password = e.target.value;
            setCriteria(checkPasswordCriteria(password));
        }
        //password handler
        const [showPassword, setShowPassword] = useState(true);
        const [showConfirmPassword, setShowConfirmPassword] = useState(true);

    // Formik
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .required('New Password is required')
                .min(8, 'the password must be at least 8 characters long')
                .matches(/[A-Z]/, "the password must contain at least one uppercase letter")
                .matches(/[a-z]/ , 'the password must contain at least one lowercase letter')
                .matches(/\d/, 'the password must contain at least one number')
                .matches(/[!@#$%^&*(),.?":{}|<>]/ , 'the password must contain at least one special character'),
            confirmPassword: Yup.string()
                .required('Confirm Password is required')
                .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        }),
        onSubmit: (values) => {
            console.log('Form submitted:', values);

            const payload = {
                password: values.password,
                password_confirmation: values.confirmPassword,
            }
            setLoading(true);

            axiosClient.put(`/change-user-password/${id}`,payload)
            .then(({data}) => {
                setLoading(false)
                toast.success('Password updated successfully!');
                setAuthenticatedUser(data.user);
            }).catch((err) => {
                console.log(err);
                toast.error(err.response.data.message);
                setLoading(false);
            })
        },
    })
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
            user_id: id,
        })
        .then(({data}) => {
            toast.success('Phone number verified successfully!');
            setSavingPhone(false);
            navigate('/');
        }).catch((err) => {
            toast.error('Failed to verify phone number. Please check the OTP and try again.');
        })
    }

    useEffect(() => {
       console.log('Authenticated User:', AuthenticatedUser);
       if(!AuthenticatedUser) return;
        if(AuthenticatedUser.phone_number){
            navigate('/');
        } else {
            setStep(2);
        }
    },[AuthenticatedUser])

    return(
        <>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | WELCOME TO MBLEARN</title>
            </Helmet>

            <div className='h-screen w-screen flex flex-col justify-center items-center bg-background gap-3'>
                {
                    step === 1 ?
                    <div className='flex flex-col w-[40vw] bg-white rounded-lg shadow-lg p-5'>
                        {/* Headder */}
                        <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 col-span-2">
                            <div>
                                <h1 className="text-primary font-header text-3xl">Set Password</h1>
                                <p className="text-unactive font-text text-xs">Replace your auto-generated initial password with a secure, personalized password during first-time login for enhanced account security.</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="h-fit bg-primarybg p-5 rounded-full flex items-center justify-center">
                                    <div className="h-full w-fit aspect-square flex items-center justify-center">
                                        <FontAwesomeIcon icon={faKey} className="text-primary text-lg"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Password */}
                        <form className='py-2 px-5 w-full' onSubmit={formik.handleSubmit}>
                            <div className="inline-flex flex-col w-full">
                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                    <p className="font-text text-unactive">New Password:</p>
                                </label>
                                <div className="flex flex-row font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                                <input type={showPassword ? "password" : "text"} name="password"
                                    value={formik.values.password}
                                    onChange={handlePasswordChange}
                                    onBlur={formik.handleBlur}
                                    className='focus:outline-none w-full'
                                    />
                                <span className="flex items-center justify-center">
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-unactive text-lg cursor-pointer " onClick={() => setShowPassword(!showPassword)}/>
                                </span>
                                </div>
                                    {formik.touched.password && formik.errors.password ? (<div className="text-red-500 text-xs font-text">{formik.errors.password}</div>):null}
                            </div>
                            {/* Password Criteria */}
                            <div className='py-2 space-y-1'>
                                <p className='font-text text-xs text-unactive'>Password Criteria:</p>
                                <ul className='space-y-1'>
                                    <PasswordRule passed={criteria.length}>At least 8 characters</PasswordRule>
                                    <PasswordRule passed={criteria.upper}>At least one uppercase letter</PasswordRule>
                                    <PasswordRule passed={criteria.lower}>At least one lowercase letter</PasswordRule>
                                    <PasswordRule passed={criteria.number}>At least one number</PasswordRule>
                                    <PasswordRule passed={criteria.special}>At least one special character</PasswordRule>
                                </ul>
                            </div>
                            <div className="inline-flex flex-col w-full">
                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                    <p className="font-text text-unactive">Confirm Password:</p>
                                </label>
                                <div className="flex flex-row font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                                <input type={showConfirmPassword ? "password" : "text"} name="confirmPassword"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='focus:outline-none w-full'/>
                                <span className="flex items-center justify-center">
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="text-unactive text-lg cursor-pointer " onClick={() => setShowConfirmPassword(!showConfirmPassword)}/>
                                </span>
                                </div>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? (<div className="text-red-500 text-xs font-text">{formik.errors.confirmPassword}</div>):null}
                            </div>
                            <div className="py-2" onClick={()=>{
                                if(loading) return;
                                formik.handleSubmit()}}>
                                <div className={`bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out w-full ${(loading) ? 'opacity-50' : ''} flex flex-row justify-center items-center gap-2`}>
                                    {!loading ?
                                    <>
                                        <p>Update Password</p>
                                    </> : <>
                                        <FontAwesomeIcon icon={faSpinner} className="text-white mr-2 animate-spin"/>
                                        <p>Upating Password</p>
                                    </>}
                                </div>
                            </div>

                        </form>
                    </div>: step === 2 ?
                        <div className='flex flex-col w-[40vw] bg-white rounded-lg shadow-lg p-5'>
                            <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-col col-span-2">
                                <p className='font-header text-xl text-primary'>Verify Your Phone Number</p>
                                <p className='font-text text-xs text-'>Add and verify your phone number to use it for OTP logins and account security</p>
                                <p className='font-text text-xs text-inactive'>Phone Number under Globe, TM, and DITO Telecom is viable numbers at this moment</p>

                            </div>

                            <div className='py-2 flex flex-col mx-5 justify-center gap-2'>
                                {/* Phone number input */}
                                <div className="inline-flex flex-col gap-1 col-span-1 pb-2">
                                    <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
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
                                        sent ? <p className='font-text text-xs text-primary'>OTP Sent! Please check your messages. <span className='underline text-unactive cursor-pointer ' onClick={()=>{handleSendOTP()}}>Didnt get the code, Resend another one?</span></p> : null
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
                                    <div className={`w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${savingPhone ? 'border-gray-400 text-gray-400 hover:cursor-not-allowed hover:bg-transparent' : 'border-primary text-primary hover:text-white hover:bg-primaryhover'}`}
                                        onClick={()=>{
                                            if(savingPhone) return;
                                            navigate('/')
                                        }}>
                                        <p>SAVE LATER</p>
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
                    : null
                }

        </div>
        </>
    )
}

