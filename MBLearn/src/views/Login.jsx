import React, { useEffect } from 'react'
import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAsterisk, faEye, faEyeSlash, faKey, faLock, faMessage, faTriangleExclamation, faUser } from '@fortawesome/free-solid-svg-icons'
import Full_Logo from '../assets/Full_Logo.svg'
import axiosClient from '../axios-client'
import { useStateContext } from '../contexts/ContextProvider'
import {InfinitySpin} from 'react-loader-spinner'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMediaQuery } from 'react-responsive'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer'
import { toast } from 'sonner'
import Small_Logo from '../assets/Small_Logo.svg';
import Mobile_1 from '../assets/Mobile_icon.svg';
import { redirect, useNavigate } from 'react-router'
import ResetPasswordModal from '../modalsandprops/resetPasswordModal'
import { InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot, } from '../components/ui/input-otp'
  import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { set } from 'date-fns'
import SuccessModal from '../modalsandprops/AuthoringTool/SuccessModal'

export default function Login() {
    const {setUser, setToken, setAvailableRoles, setRole, authenticated, SetAuthenticated, setRefreshToken} = useStateContext();
    const isMobile = useMediaQuery({maxWidth: 640});
    const navigate = useNavigate();
    const [resetPassword, setResetPassword] = useState(false);
    //const [authenticated, setAuthenticated] = useState(false);
    const [loginRedirect, setLoginRedirect] = useState({
        role: '',
        isFirstLogin:'',
        user_email:'',
        userCredId: '',
    });
    const [verify, setVerified] = useState();
    const [otpError, setOtpError] = useState('');
    const [requstOTP, setrequestOTP] = useState()
    const [sms,setSms] = useState(false)
    const [sending, setSending] = useState(false)
    const [AuthenticatedUser, setAuthenticatedUser] = useState({});
    const [reseted, setReseted] = useState(false);

    useEffect(()=>(
        SetAuthenticated(false)
    ),[])

    //Expiration Timer
    const [timeleft, setTimeLeft] = useState();
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

    //loading state
    const [isLoading, setIsLoading] = useState(false);

    //Handle Password
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    //Error handling
    const [error, setError] = useState('');
    useEffect(()=> {
        if(!isMobile) return;
        if (error) {
            toast.error("Login Error",{
                description: error,
                position: 'top-center'
            })
        } else {
            return;
        }
    },[setError, error])

    const togglePassword = () =>{
        setShowPassword(!showPassword);
    };
    const handlePassword = (e) =>{
        const {value} = e.target;
        formik.setFieldValue('password', value);
        setError('');
        setPassword(value);
    }

    //payload and validation
    const formik = useFormik({
        //reference
        initialValues:{
            MBemail: '',
            password: '',
        },
        validationSchema: Yup.object({
            MBemail: Yup.string()
                .required('Email is required'),
            password: Yup.string()
                .required('Password is required')
                .min(8, 'Password must be at least 8 characters')
        }),
        //submission
        onSubmit: (values) =>{

            const payload ={
                MBemail: values.MBemail,
                password:  values.password
            }

            setIsLoading(true);
            setError('');

            //API call
            axiosClient.post('/login', payload).then(({data})=>{
                setLoginRedirect((prev)=> ({
                    ...prev,
                    isFirstLogin: data.user.first_log_in,
                    userCredId: data.user.id,
                    user_email: data.user.MBemail,
                    role: data.user.user_infos.roles[0]?.role_name,
                }))
                SetAuthenticated(true);
                setTimeLeft(5*60);
                setIsLoading(false)
                setAuthenticatedUser(data.user)
            })
            .catch(({response})=>{
                if(response){
                    setError(response.data.message);
                    console.log(response.data.message);
                    setIsLoading(false);
                    formik.resetForm();
                    setIsLoading(false);
                }
            })
        }
    })

    const OTPFormik = useFormik({
        initialValues: {
            otp: ''
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .required('OTP is required')
                .length(6, 'OTP must be 6 digits')
                .matches(REGEXP_ONLY_DIGITS_AND_CHARS, 'OTP must contain only digits and characters')
        }),
        onSubmit: (values) => {
            setVerified(true)
            const payload = {
                user_id: loginRedirect.userCredId,
                user_email:loginRedirect.user_email,
                otp: values.otp
            }
            // Call the verified function to handle OTP verification
            axiosClient.post('/verifyOtp', payload)
            .then(({data}) => {
                setToken(data.token)
                setRefreshToken(data.refresh_token)
                setRole(loginRedirect.role)
                setVerified(false);
                console.log(data);

                if(data.first_login === true){
                    navigate(`/initial-login/${loginRedirect.userCredId}`);
                    return;
                }else{
                    navigate("/");
                };
                // if(!loginRedirect.isFirstLogin){
                //     navigate(`/welcome/${loginRedirect.userCredId}/${loginRedirect.role}`)
                // }else{
                // }

            })
            .catch((err)=> {
                setOtpError(err?.response?.data?.message)
                setVerified(false)
            }
            )
            ;
        }
    })

    //Request Another OTP
    const reqOTP = () => {
        setrequestOTP(true)
        setSending(true)
        const payload = {
            user_id: loginRedirect.userCredId
        }
        setOtpError('')
        axiosClient.post('/reqOtp',payload)
        .then(({data})=>{
            setTimeLeft(5*60);
            setrequestOTP(false)
            setSending(false)
        }).catch((err)=>{
            console.log(err)
        })
    }

    const reqOTPSMS = () => {
        setrequestOTP(true)
        setSending(true)

        axiosClient.post('/reqOTPSMS', {
            user_id: loginRedirect.userCredId
        })
        .then(({data})=>{
            setTimeLeft(5*60);
            setrequestOTP(false)
            setSending(false)
        }).catch((err)=>{
            console.log(err)
        })
    }



    return (
        <>
        {
            !authenticated ?
            <div className='max-w-md h-fit shadow-md rounded-xl px-16 py-10 flex flex-col gap-5 bg-white'>

                    <img src={Full_Logo} alt="" className='h-7 w-auto p-0 m-0 self-start'/>
                    <h1 className='font-header text-primary text-3xl'>
                        Prepare for Success,<br/>
                        Access Your Training!
                    </h1>

                    {/* Error Handling */}
                        {
                        error &&
                        <div className='min-h-[50px]'>
                            <div className='bg-red-200 px-4 border-2 border-red-400 rounded-md p-2 grid grid-cols-[3rem_auto]'>
                                <div className='bg-red-400 w-10 rounded-full aspect-square text-red-600 flex items-center justify-center'>
                                    <FontAwesomeIcon icon={faTriangleExclamation}/>
                                </div>
                                {

                                    <div className='w-full flex flex-col gap-1 justify-center px-2'>
                                        <p className='text-red-500 text-sm font-text'>{error}</p>
                                    </div>
                                }
                            </div>
                        </div>
                        }

                    {/* Login Front-end */}
                    <form onSubmit={formik.handleSubmit} className='flex flex-col gap-2'>

                        {/* Email of Employee ID */}
                        <div className='flex flex-col gap-0.5'>
                            <div className={`flex items-center place-content-between border-2 rounded-md shadow-md ${formik.touched.MBemail && formik.errors.MBemail ? 'border-red-500' : 'border-primary'}`}>
                                <input
                                    type="text"
                                    name="MBemail"
                                    value={formik.values.MBemail}
                                    onChange={(e)=>{formik.handleChange(e); setError('')}}
                                    onBlur={formik.handleBlur}
                                    placeholder='Email Address or Employee ID'
                                    className='focus:outline-none font-text text-sm px-4 w-full '
                                    />
                                <div className= {`py-2 px-4 text-white ${formik.touched.MBemail && formik.errors.MBemail ? 'bg-red-500' : 'bg-primary'}`}>
                                    <FontAwesomeIcon icon={
                                        formik.touched.MBemail && formik.errors.MBemail
                                        ? formik.errors.MBemail === 'Invalid Email' ? faTriangleExclamation
                                        : faAsterisk : faUser
                                    }/>
                                </div>
                            </div>
                            {/* Error */}
                            {/* <div className='min-h-[20px] px-4'>
                                {formik.touched.MBemail && formik.errors.MBemail && (<div className='text-red-500 text-sm font-text'>{formik.errors.MBemail}</div>)}
                            </div> */}
                        </div>

                        {/* Password */}
                        <div className='flex flex-col gap-0.5'>
                            <div className={`flex items-center place-content-between border-2 rounded-md shadow-md ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-primary'}`}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name='password'
                                    className='focus:outline-none font-text text-sm px-4 w-full'
                                    value={formik.values.password}
                                    onBlur={formik.handleBlur}
                                    onChange={handlePassword}
                                    placeholder='Password'
                                />
                                {/* Set Visibilitiy */}
                                {password &&
                                    <div className='px-2 flex items-center justify-center'>
                                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className='text-primary cursor-pointer' onClick={togglePassword}/>
                                    </div>
                                }
                                <div className={`py-2 px-4 text-white ${formik.touched.password && formik.errors.password ? 'bg-red-500' : 'bg-primary'}`}>
                                    <FontAwesomeIcon icon={
                                        formik.touched.password && formik.errors.password
                                        ? formik.errors.password === 'Password must be at least 8 characters' ? faTriangleExclamation
                                        : faAsterisk : faKey
                                    }/>
                                </div>
                            </div>
                            {/* Error */}
                            {/* <div className='min-h-[20px] px-4'>
                                {formik.touched.MBemail && formik.errors.MBemail && (<div className='text-red-500 text-sm font-text'>{formik.errors.password}</div>)}
                            </div> */}
                        </div>

                        {/* Remember Me */}


                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`border bg-primary rounded-md font-header text-sm text-white p-3 cursor-pointer flex items-center justify-center \
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1 `}
                            style={{ height: "3rem" }}
                        >
                            {isLoading ? (
                                "Loading..."
                            ) : (
                                "LOGIN"
                            )}
                        </button>

                    </form>

                    <p className='font-text text-sm self-center text-unactive mt-auto'>Forgot your password? <span className='text-primary hover:cursor-pointer' onClick={() => setResetPassword(true)}>Let's Reset it!</span></p>
                </div>

            :
            sms ?
            <div className='flex flex-col col-span-2 items-center gap-2'>
                <div className='bg-white w-[70vw] p-5 shadow-md rounded-xl flex flex-col items-center justify-center
                            sm:w-[70vw]
                            xl:w-[30vw]'>
                    {/* Header */}
                <div className='flex flex-col justify-center items-center p-2'>
                    <div className='flex items-center justify-center bg-primarybg w-16 h-16 rounded-full my-2'>
                        <FontAwesomeIcon icon={faMessage} className='text-2xl text-primary'/>
                    </div>
                    <p className='pt-2 text-primary font-header text-2xl'>
                        VERIFY ACCOUNT
                    </p>
                    <p className='text-unactive font-text text-xs text-center'>
                        We've sent a 6-digit verification code to your registered Phone Number. Please enter it below to complete your login.
                    </p>
                </div>
                {/* OTP */}
                <div className='py-2 flex flex-col items-center justify-center gap-2'>
                    {/* <p className='font-text text-unactive text-xs'>Input one time password</p> */}
                    {
                        sending ?
                            <p className='text-unactive text-xs font-xs'>Sending OTP</p>
                        : timeleft > 0 ? (
                            <p className='text-unactive text-xs font-xs'>OTP expires in: {formatTime(timeleft)}</p>
                        ) : (
                            <p className='text-unactive text-xs font-xs'>OTP expired! click resend to requerst another new OTP</p>
                        )
                    }
                    {
                        OTPFormik.touched.otp && OTPFormik.errors.otp &&
                        <p className='font-text text-red-600 text-xs'>{OTPFormik.errors.otp}</p>
                    }
                    {
                        otpError &&
                        <p className='font-text text-red-600 text-xs'>{otpError}</p>
                    }
                    <form onSubmit={OTPFormik.handleSubmit}>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={OTPFormik.values.otp} onChange={(value) => OTPFormik.setFieldValue('otp', value)}
                            onPaste={(e) => e.preventDefault()} // 🚫 disable paste
                            onCopy={(e) => e.preventDefault()}  // 🚫 disable copy
                            onCut={(e) => e.preventDefault()}   >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        </InputOTP>
                        {
                            !requstOTP &&
                            <p className='font-text text-xs text-unactive py-2 text-center'>Didn't get the code? click here to <span className='text-primary hover:cursor-pointer' onClick={()=>reqOTPSMS()}>resend</span></p>
                        }
                    </form>
                </div>
                {/* Submit */}
                <div className='w-full p-2 '>
                    <div className={`font-header text-white bg-primary w-full py-3 rounded-md flex items-center justify-center cursor-pointer hover:bg-primaryhover transition-all ease-in-out uppercase ${verify ? "opacity-50 cursor-not-allowed":""}`} onClick={()=>{OTPFormik.handleSubmit()}}>
                        <p>{verify ? "verifying...":"submit"}</p>
                    </div>
                </div>
            </div>
            {
                !requstOTP &&
                <p className='text-xs text-white'>Still not working? Go back and lets re-email you, <span className='underline cursor-pointer' onClick={()=>{setSms(false);reqOTP()}}>Request an OTP here</span></p>
            }
            </div>
            :<div className='flex flex-col col-span-2 items-center gap-2'>
            <div className='bg-white w-[70vw] p-5 shadow-md rounded-xl flex flex-col items-center justify-center
                            sm:w-[70vw]
                            xl:w-[30vw]'>
                    {/* Header */}
                <div className='flex flex-col justify-center items-center p-2'>
                    <div className='flex items-center justify-center bg-primarybg w-16 h-16 rounded-full my-2'>
                        <FontAwesomeIcon icon={faLock} className='text-2xl text-primary'/>
                    </div>
                    <p className='pt-2 text-primary font-header text-2xl'>
                        VERIFY ACCOUNT
                    </p>
                    <p className='text-unactive font-text text-xs text-center'>
                        We've sent a 6-digit verification code to your registered MBLearn email. Please enter it below to complete your login.
                    </p>
                </div>
                {/* OTP */}
                <div className='py-2 flex flex-col items-center justify-center gap-2'>
                    {/* <p className='font-text text-unactive text-xs'>Input one time password</p> */}
                    {
                        sending ?
                            <p className='text-unactive text-xs font-xs'>Sending OTP</p>
                        : timeleft > 0 ? (
                            <p className='text-unactive text-xs font-xs'>OTP expires in: {formatTime(timeleft)}</p>
                        ) : (
                            <p className='text-unactive text-xs font-xs'>OTP expired! click resend to requerst another new OTP</p>
                        )
                    }
                    {
                        OTPFormik.touched.otp && OTPFormik.errors.otp &&
                        <p className='font-text text-red-600 text-xs'>{OTPFormik.errors.otp}</p>
                    }
                    {
                        otpError &&
                        <p className='font-text text-red-600 text-xs'>{otpError}</p>
                    }
                    <form onSubmit={OTPFormik.handleSubmit}>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={OTPFormik.values.otp} onChange={(value) => OTPFormik.setFieldValue('otp', value)}
                             onPaste={(e) => e.preventDefault()} // 🚫 disable paste
                            onCopy={(e) => e.preventDefault()}  // 🚫 disable copy
                            onCut={(e) => e.preventDefault()}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        </InputOTP>
                        {
                            !requstOTP &&
                            <p className='font-text text-xs text-unactive py-2 text-center'>Didn't get the code? click here to <span className='text-primary hover:cursor-pointer' onClick={()=>reqOTP()}>resend</span></p>
                        }
                    </form>
                </div>
                {/* Submit */}
                <div className='w-full p-2 '>
                    <div className={`font-header text-white bg-primary w-full py-3 rounded-md flex items-center justify-center cursor-pointer hover:bg-primaryhover transition-all ease-in-out uppercase ${verify ? "opacity-50 cursor-not-allowed":""}`} onClick={()=>{OTPFormik.handleSubmit()}}>
                        <p>{verify ? "verifying...":"submit"}</p>
                    </div>
                </div>
            </div>
            {
                !requstOTP && AuthenticatedUser?.phone_number !== null ?
                <p className='text-xs text-white'>Try another option by using your SMS, <span className='underline cursor-pointer' onClick={()=>{setSms(true); reqOTPSMS()}}>Request an OTP here</span></p>
                : null
            }
            </div>
        }
        <ResetPasswordModal open={resetPassword} close={()=>{setResetPassword(false)}} reseted={()=>setReseted(true)}/>
        <SuccessModal open={reseted} close={()=>{setReseted(false)}} header="Password Reset Successful" desc="Your password has been successfully reset. You can now log in with your new password." confirmLabel="Close"/>
    </>
    )
}
