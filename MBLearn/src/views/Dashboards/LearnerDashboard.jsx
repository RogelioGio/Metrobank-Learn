import { faChevronLeft, faChevronRight, faClock, faGraduationCap, faListCheck, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axiosClient from "MBLearn/src/axios-client"
import AnnouncmentCarousel from "MBLearn/src/modalsandprops/dashboardComponents/AnnouncementCarousel"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as React from "react"
import { format } from "date-fns"
import { Progress } from "MBLearn/src/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { faCalendar } from "@fortawesome/free-regular-svg-icons"
import Calendar from "MBLearn/src/modalsandprops/dashboardComponents/Calendar"
import CourseCard from "MBLearn/src/modalsandprops/CourseCard"
import { useCourse } from "MBLearn/src/contexts/Course"
import { useRef } from "react"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"


const LearnerDashboard = ({name,user}) => {
    const {events} = useStateContext()
    const [activities, setActivities] = useState([])
    const [enrolled, setEnrolled] = useState([])
    const [courseLoading, setCourseLoading] = useState(false)
    const [activitiesLoading, setActivitiesLoading] = useState(false)
    //const [count, setCount] = useState({})
    const {setCourse} = useCourse()
    const navigate = useNavigate();

    const calendarRef = useRef()
    const [monthLabel, setMonthLabel] = useState("")
    const [openCalendarModal, setOpenCalendarModal] = useState(false);
    const updateMonthLabel = () => {
        const current = calendarRef.current?.getCurrentMonth();
        if (current) {
        setMonthLabel(format(current, "MMMM yyyy"));
        }
    };

    const handleGetLearnerActivities = () => {
        setActivitiesLoading(true)
        axiosClient.get('/learner/activities').then(({data})=>{
            console.log(data)
            setActivities(data)
            setActivitiesLoading(false)
        }).catch(()=>{});
    }

    useEffect(() => {
        updateMonthLabel(); // set initial label
        handleGetLearnerActivities()
    }, []);

    const fetchRecentOpenedCourses = () =>{
        setCourseLoading(true)
        axiosClient.get('/learner/records', {
            params: {
                page: pageState.currentPage,
                per_page: pageState.perPage,
            }
        },
        ).then(({data})=>{
            setEnrolled(data.data)
            setCourseLoading(false)
        }).catch(()=>{
            setCourseLoading(false)
        })
    }

    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 4,
        totalCourses: 0,
        lastPage:1,
        startNumber: 0,
        endNumber: 0,
        currentPerPage:0
    });

    useEffect(() => {
        fetchRecentOpenedCourses();
    }, [pageState.currentPage, pageState.perPage]);

    const pageChangeState = (key, value) => {
        setPagination ((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    const back = () => {
        if (courseLoading) return;
        if (pageState.currentPage > 1){
            pageChangeState("currentPage", pageState.currentPage - 1)
            pageChangeState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (courseLoading) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    const Pages = [];
    for(let p = 1; p <= pageState.lastPage; p++){
        Pages.push(p)
    }



//         {
//   "id": 71,
//   "name": "Fundamentals of Banking and Financial Services",
//   "description": "This course offers a comprehensive introduction to the modern banking system and its vital role in the global economy. Learners will explore the structure, functions, and services provided by banks, understand the regulatory landscape, and examine how digital transformation is reshaping financial services. Through a mix of theoretical knowledge and real-world case studies, this course prepares students and professionals to confidently navigate the banking and finance sector.",
//   "type_id": null,
//   "category_id": null,
//   "training_mode_id": null,
//   "training_type": "Mandatory",
//   "archived": "active",
//   "system_admin_id": 1,
//   "created_at": "2025-05-14T18:42:27.000000Z",
//   "updated_at": "2025-05-16T19:46:19.000000Z",
//   "CourseID": "9",
//   "months": 1,
//   "weeks": 2,
//   "days": null,
//   "course_outcomes": "Banking",
//   "course_objectives": "Banking",
//   "published": false,
//   "author_id": 1,
//   "laravel_through_key": 1,
//   "progress": 100,
//   "deadline": "2025-06-29 23:59:59",
//   "enrolled": 3,
//   "ongoing": 1,
//   "due_soon": 0,
//   "categories": [
//     {
//       "id": 8,
//       "category_name": "Banking",
//       "created_at": "2025-05-14T18:27:08.000000Z",
//       "updated_at": "2025-05-14T18:27:08.000000Z",
//       "pivot": {
//         "course_id": 71,
//         "category_id": 8
//       }
//     }
//   ],
//   "types": [
//     {
//       "id": 2,
//       "type_name": "Technical Training",
//       "created_at": "2025-02-27T00:10:17.000000Z",
//       "updated_at": "2025-02-27T00:10:17.000000Z",
//       "pivot": {
//         "course_id": 71,
//         "type_id": 2
//       }
//     }
//   ],
//   "training_modes": [],
//   "lessons": [
//     {
//       "id": 23,
//       "lesson_name": "Introduction to Banking",
//       "lesson_content_as_json": "{\"type\":\"doc\",\"content\":[{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"1.1 What is a Bank?\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Definition and purpose\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Key functions: accepting deposits, lending, safekeeping, and facilitating payments\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Difference between banks and other financial institutions\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"1.2 History and Evolution of Banking\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Ancient banking systems: Mesopotamia, Greece, Rome\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Medieval banking: rise of merchant banks (Medici family, Knights Templar)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Modern banking: creation of central banks and global banking systems\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"1.3 Types of Banks\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Retail banks\"},{\"type\":\"text\",\"text\":\"\\u2013 serve individuals and small businesses\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Commercial banks\"},{\"type\":\"text\",\"text\":\"\\u2013 provide large-scale services to corporations\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Investment banks\"},{\"type\":\"text\",\"text\":\"\\u2013 manage capital markets, M&A, and underwriting\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Central banks\"},{\"type\":\"text\",\"text\":\"\\u2013 control monetary policy and issue currency\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Development banks\"},{\"type\":\"text\",\"text\":\"\\u2013 focus on funding infrastructure and economic development\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Co-operative banks\"},{\"type\":\"text\",\"text\":\"\\u2013 member-owned institutions\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"1.4 Role of Banking in the Economy\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Financial intermediation: matching savers and borrowers\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Credit creation and money supply\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Promoting investment and consumption\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Facilitating trade and commerce\"}]}]}]}]}",
//       "lesson_type": "text",
//       "course_id": 71,
//       "created_at": "2025-05-14T18:42:28.000000Z",
//       "updated_at": "2025-05-14T18:42:28.000000Z",
//       "lesson_description": null
//     },
//     {
//       "id": 24,
//       "lesson_name": "Banking Products and Services",
//       "lesson_content_as_json": "{\"type\":\"doc\",\"content\":[{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"2.1 Deposit Products\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Savings accounts\"},{\"type\":\"text\",\"text\":\"\\u2013 interest-bearing personal accounts\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Current accounts\"},{\"type\":\"text\",\"text\":\"\\u2013 transactional accounts for businesses\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Fixed\\/term deposits\"},{\"type\":\"text\",\"text\":\"\\u2013 locked deposits with higher interest rates\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Recurring deposits\"},{\"type\":\"text\",\"text\":\"\\u2013 regular monthly contributions\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"2.2 Lending Products\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Personal loans\"},{\"type\":\"text\",\"text\":\"\\u2013 unsecured loans for personal use\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Home loans\"},{\"type\":\"text\",\"text\":\"\\u2013 mortgage financing\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Auto loans\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Business loans\"},{\"type\":\"text\",\"text\":\"\\u2013 working capital, term loans\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Overdraft facilities\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Loan underwriting process and credit scoring\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"2.3 Cards and Plastic Money\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Debit cards\"},{\"type\":\"text\",\"text\":\"\\u2013 real-time withdrawals\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Credit cards\"},{\"type\":\"text\",\"text\":\"\\u2013 revolving credit facilities\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Prepaid cards and gift cards\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Card networks (Visa, Mastercard, RuPay)\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"2.4 Payment and Settlement Systems\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Domestic payment systems:\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"UPI (India), ACH (US), FPS (UK)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"NEFT\\/RTGS\\/IMPS (India)\"}]}]}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"International:\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"SWIFT, IBAN, wire transfers\"}]}]}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Role of payment gateways and aggregators\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"text\":\"2.5 Specialized Services\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Safe deposit lockers\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Standing instructions and ECS mandates\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Internet and mobile banking\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Wealth management and advisory services\"}]}]}]}]}",
//       "lesson_type": "text",
//       "course_id": 71,
//       "created_at": "2025-05-14T18:42:28.000000Z",
//       "updated_at": "2025-05-14T18:42:28.000000Z",
//       "lesson_description": null
//     },
//     {
//       "id": 25,
//       "lesson_name": "Central Banking and Monetary Policy",
//       "lesson_content_as_json": "{\"type\":\"doc\",\"content\":[{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.1 What is a Central Bank?\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Definition and key characteristics\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Not-for-profit but not commercial \\u2014 operates in the public interest\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Examples:\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"U.S. Federal Reserve (The Fed)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"European Central Bank (ECB)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Reserve Bank of India (RBI)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Bank of England (BoE)\"}]}]}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.2 Core Functions of a Central Bank\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Monetary policy implementation\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Issuing currency\"},{\"type\":\"text\",\"text\":\"\\u2013 sole authority to print legal tender\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Regulating and supervising banks\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Managing foreign exchange reserves\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Lender of last resort\"},{\"type\":\"text\",\"text\":\"\\u2013 providing emergency liquidity to banks\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Maintaining financial stability\"}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.3 Monetary Policy Tools\"}]},{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Central banks use these tools to influence the supply of money and interest rates:\"}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"a. Open Market Operations (OMO)\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Buying or selling government securities to control liquidity\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Buying = injects money; Selling = reduces money\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"b. Policy Interest Rates\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Repo rate\"},{\"type\":\"text\",\"text\":\"\\u2013 the rate at which central banks lend to commercial banks\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Reverse repo rate\"},{\"type\":\"text\",\"text\":\"\\u2013 rate at which they borrow from banks\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Adjusting these influences borrowing, lending, and inflation\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"c. Reserve Requirements\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Cash Reserve Ratio (CRR)\"},{\"type\":\"text\",\"text\":\"\\u2013 minimum reserves held in cash\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Statutory Liquidity Ratio (SLR)\"},{\"type\":\"text\",\"text\":\"\\u2013 reserve maintained in the form of gold or securities\"}]}]}]},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":4},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"d. Moral Suasion and Qualitative Tools\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Guidelines or informal pressure to influence bank behavior\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Credit control to specific sectors\"}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.4 Inflation and Interest Rates\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Relationship between inflation and interest rates\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Target inflation rate\"},{\"type\":\"text\",\"text\":\": typically 2% for many developed countries\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"How monetary policy fights inflation or stimulates growth\"}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.5 Types of Monetary Policy\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Expansionary\"},{\"type\":\"text\",\"text\":\"\\u2013 lower rates to encourage borrowing and spending\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Contractionary\"},{\"type\":\"text\",\"text\":\"\\u2013 raise rates to control inflation and cool the economy\"}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.6 Central Bank Independence\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Why independence from political influence is critical\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Real-world debates on central bank autonomy\"}]}]}]},{\"type\":\"horizontalRule\"},{\"headerBlock\":\"heading\",\"attrs\":{\"textAlign\":null,\"level\":3},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3.7 Recent Trends and Global Challenges\"}]},{\"bulletListBlock\":\"bulletList\",\"content\":[{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Quantitative easing (QE)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Negative interest rates\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Central Bank Digital Currencies (CBDCs)\"}]}]},{\"type\":\"listItem\",\"content\":[{\"textType\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"text\":\"Central banks' role during economic crises (e.g., COVID-19, 2008 crisis)\"}]}]}]}]}",
//       "lesson_type": "text",
//       "course_id": 71,
//       "created_at": "2025-05-14T18:42:28.000000Z",
//       "updated_at": "2025-05-14T18:42:28.000000Z",
//       "lesson_description": null
//     }
//   ],
//   "enrollments": [
//     {
//       "id": 198,
//       "user_id": 112,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-18T14:16:57.000000Z",
//       "updated_at": "2025-05-18T14:16:57.000000Z",
//       "start_date": "2025-05-18 00:00:00",
//       "end_date": "2025-06-29 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 199,
//       "user_id": 118,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-19T10:46:13.000000Z",
//       "updated_at": "2025-05-19T10:46:13.000000Z",
//       "start_date": "2025-05-19 00:00:00",
//       "end_date": "2025-07-03 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 200,
//       "user_id": 117,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-19T10:46:17.000000Z",
//       "updated_at": "2025-05-19T10:50:26.000000Z",
//       "start_date": "2025-05-19 00:00:00",
//       "end_date": "2025-07-03 23:59:59",
//       "enrollment_status": "ongoing",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 209,
//       "user_id": 121,
//       "course_id": 71,
//       "enroller_id": 113,
//       "created_at": "2025-05-20T12:36:21.000000Z",
//       "updated_at": "2025-05-20T12:36:21.000000Z",
//       "start_date": "2025-05-20 00:00:00",
//       "end_date": "2025-06-10 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 210,
//       "user_id": 127,
//       "course_id": 71,
//       "enroller_id": 113,
//       "created_at": "2025-05-20T12:36:27.000000Z",
//       "updated_at": "2025-05-20T12:36:27.000000Z",
//       "start_date": "2025-05-20 00:00:00",
//       "end_date": "2025-06-10 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 212,
//       "user_id": 134,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-23T08:41:49.000000Z",
//       "updated_at": "2025-05-23T08:41:49.000000Z",
//       "start_date": "2025-05-23 00:00:00",
//       "end_date": "2025-07-07 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 213,
//       "user_id": 115,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-23T08:42:54.000000Z",
//       "updated_at": "2025-05-23T08:42:54.000000Z",
//       "start_date": "2025-05-23 00:00:00",
//       "end_date": "2025-07-07 23:59:59",
//       "enrollment_status": "enrolled",
//       "due_soon": false,
//       "allow_late": false
//     },
//     {
//       "id": 197,
//       "user_id": 1,
//       "course_id": 71,
//       "enroller_id": 1,
//       "created_at": "2025-05-18T14:16:54.000000Z",
//       "updated_at": "2025-06-14T03:31:52.000000Z",
//       "start_date": "2025-05-18 00:00:00",
//       "end_date": "2025-06-29 23:59:59",
//       "enrollment_status": "finished",
//       "due_soon": false,
//       "allow_late": false
//     }
//   ]
// }
//     ]

    // useEffect(() => {
    //     console.log(course)
    // },[course])

    // const sampleEvents = [
    //     { date: "2025-06-25", title: "Meeting with Finance", event_type: "Meeting" },
    //     { date: "2025-06-30", title: "Payroll Deadline", event_type: "Deadline" },
    //     { date: "2025-06-30", title: "Payroll Deadline", event_type: "Deadline" },
    //     { date: "2025-06-30", title: "Payroll Deadline", event_type: "Deadline" },
    //     { date: "2025-06-30", title: "Hello", event_type: "Meeting" },
    // ];

    return(
        <div className="grid h-full w-full grid-cols-4
                            grid-rows-[6.25rem_auto]
                            xl:grid-rows-[6.25rem_1fr_1fr]
                            sm:grid-rows-[6.25rem_1fr_1fr]">
        <div className='flex flex-col justify-center col-span-2 row-span-1  border-b border-divider
                    ml-3
                    xl:pr-5
                    sm:ml-0'>
        <p className='text-xs text-unactive'>Good Day!  </p>
        <p className='font-header text-primary text-3xl'>{name}</p>
        <p className='font-text text-xs text-unactive'>{user.user_infos.employeeID} | {user.user_infos.roles[0].role_name}</p>
        {/* <p className='font-text text-unactive
                        text-xs
                        xl:text-sm
                        sm:text-xs'>System Admin Dashboard, A centralized hub for system administrators to manage users, monitor system activity.</p> */}
    </div>
    <div className='border-b border-divider  flex flex-row justify-end items-center col-span-2 gap-4
                    mr-3
                    sm:mr-4'>
        <div className='flex-col justify-end items-end flex leadeing-tigth'>
            <p className='font-header text-primary'>Learner Dashboard</p>
            <p className='font-text text-xs text-unactive'>A centralized hub for starting your learning journey.</p>
        </div>
        <div className='aspect-square bg-secondaryprimary rounded-full flex justify-center items-center
                        w-16 h-16
                        xl:w-20 xl:h-20 xl:mr-5
                        sm:w-16 sm:h-16'>
            <FontAwesomeIcon icon={faGraduationCap} className='text-primary text-xl xl:text-2xl sm:text-xl'/>
        </div>
    </div>

        {/* Announcement */}
        <div className='row-span-1 py-2 w-full
                        col-span-4 px-4
                        xl:col-span-3 xl:row-span-1 xl:h-full xl:pr-3
                        sm:col-span-4 sm:row-span-1 sm:h-full sm:px-4'>
            <AnnouncmentCarousel/>
        </div>

        {/* Calender */}
        <div className='row-span-1 grid grid-cols-1 grid-rows-[min-content_1fr]
                        col-span-4 px-4 pt-2 pb-5
                        xl:col-span-1 xl:pr-5 xl:pb-2
                        sm:col-span-4 sm:pb-5 sm:px-4'>
            <div className='flex flex-row justify-between items-center'>
                <div className="pb-3">
                    <p className="font-text text-unactive text-xs">Current Month & Date:</p>
                    <p className="font-header text-primary text-base">{monthLabel || "Loading"}</p>
                </div>
                <div className='flex flex-row gap-2'>
                    <div>
                        <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                            onClick={()=> {navigate('/learner/calendar')}}>
                            <FontAwesomeIcon icon={faCalendar} className='text-sm'/>
                        </div>
                    </div>
                    <div>
                        <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                        onClick={()=> {calendarRef.current?.goToPreviousMonth(), setTimeout(updateMonthLabel, 0)}}>
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <div className='w-9 h-9 border-2 rounded-md text-primary border-primary flex justify-center items-center hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'
                        onClick={()=> {calendarRef.current?.goToNextMonth(), setTimeout(updateMonthLabel, 0)}}>
                        <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-full rounded-md shadow-md border-2 border-primary overflow-hidden">
                <Calendar ref={calendarRef} events={events}/>
            </div>
        </div>

        {/* Enrolled */}
        <div className="grid grid-rows-[min-content_1fr] grid-cols-4 gap-2
                        row-start-3 col-span-4 px-3 py-2
                        xl:row-start-3 xl:col-span-3 xl:py-0">
            <div className="col-span-4 flex flex-row justify-between">
                <div>
                    <h1 className="font-header text-primary text-base">Recently Opened Courses</h1>
                    <p className="font-text text-unactive text-xs">Continue your learning journey.</p>
                </div>
                {/* Pagination */}
                <div className="col-start-4 flex flex-row justify-end items-center">
                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                        {/* Previous */}
                        <a
                            onClick={back}
                            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset  transition-all ease-in-out ${courseLoading ? "opacity-50 cursor-not-allowed":"hover:bg-primary hover:text-white"}`}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </a>

                        {/* Current Page & Dynamic Paging */}

                        {
                            Pages.map((page)=>(
                                <a
                                    key={page}
                                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                        ${
                                            courseLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white hover:cursor-pointer"
                                        }
                                        ${
                                            page === pageState.currentPage
                                            ? 'bg-primary text-white'
                                            : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                        } transition-all ease-in-out`}
                                        onClick={() => pageChange(page)}>
                                    {page}</a>
                            ))
                        }
                        <a
                            onClick={next}
                            className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset  transition-all ease-in-out ${courseLoading ? "opacity-50 cursor-not-allowed":"hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </a>
                    </nav>
                </div>
            </div>

            <div className="col-span-4 grid grid-cols-2 gap-2 h-full
                            lg:grid-cols-4 xl:pb-5">
                {
                    courseLoading ?
                    Array.from({length:4}).map((i,_)=>(
                        <div key={_} className="border border-unactive animate-pulse bg-white shadow-md rounded-md min-h-20"/>
                    ))
                    : enrolled.length === 0 ?
                    <div className="py-3 col-span-2 md:py-0 md:col-span-4 flex flex-col items-center justify-center gap-2">
                        <div className="min-h-10 min-w-10 w-20 h-20 bg-primarybg rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faXmark} className="text-primary text-4xl"/>
                        </div>
                        <p className="font-text text-unactive text-xs">You dont have any on-going training yet..</p>
                    </div>
                    : enrolled.map((e)=>(
                        <CourseCard key={e.id} course={e} type='learner' click={() => {setCourse(e), navigate(`/learner/course/${e.id}`)}}/>
                    ))
                }
            </div>
        </div>

        {/* Activities */}
            <div className="row-start-4 px-3 col-span-4 py-2 flex flex-col gap-2
                    xl:pb-5 xl:row-start-3 xl:col-span-1 xl:pr-5 xl:py-0">
            <div>
                <h1 className="font-header text-primary text-base">Activities</h1>
                <p className="font-text text-unactive text-xs">Tracks and displays your recent learning activities.</p>
            </div>
            <div className="grid gap-2 h-full grid-cols-3 grid-rows-1
                            xl:grid-cols-1 xl:grid-rows-3">
                {
                    //activitiesLoading ?
                    activitiesLoading ?
                    Array.from({length: 3}).map((i,_) =>(<div key={_} className="w-full h-full border-unactive border bg-white animate-pulse rounded-md shadow-md min-h-[5rem] xl:min-h-0"/>))
                    : activities.length === 0  ?
                        <div className="flex flex-col items-center justify-center gap-2 py-4
                                        col-span-3
                                        xl:row-span-3 xl:col-span-1">
                            <div className="bg-primarybg min-h-20 min-w-20 w-20 h-20 flex flex-col items-center justify-center text-2xl rounded-full text-primary ">
                                <FontAwesomeIcon icon={faListCheck}/>
                            </div>
                            <p className="font-text text-unactive text-xs">You dont any activities yet.</p>
                        </div>

                    :
                    <>
                        {activities.enrolled > 0 && (
                            <div className="w-full h-full bg-white border border-primary rounded-md shadow-md px-3 py-1 flex flex-row  justify-start items-center gap-3 hover:cursor-pointer hover:bg-primary group transition-all ease-in-out"
                                onClick={() => navigate('/learner/learnercoursemanager/enrolled')}>
                                {/* icon */}
                                <div className="group-hover:text-white group-hover:bg-gray-50 group-hover:bg-opacity-20  text-primary flex flex-col item-center justify-center bg-primarybg p-2 aspect-square rounded-full">
                                    <FontAwesomeIcon icon={faGraduationCap} className="text-base"/>
                                </div>
                                {/* desc */}
                                <div className="flex flex-col justify-center items-start">
                                    <p className="group-hover:text-white font-header text-sm text-primary">Enrolled</p>
                                    <p className="group-hover:text-white font-text text-unactive text-xs">You're just enrolled to {activities.enrolled} courses</p>
                                </div>
                            </div>
                        )}
                        {activities.ongoing > 0 && (
                            <div className="w-full h-full bg-white border border-primary rounded-md shadow-md px-3 py-1 flex flex-row  justify-start items-center gap-3 hover:cursor-pointer hover:bg-primary group transition-all ease-in-out"
                                onClick={() => navigate('/learner/learnercoursemanager/ongoing')}>
                                {/* icon */}
                                <div className="group-hover:text-white group-hover:bg-gray-50 group-hover:bg-opacity-20  text-primary flex flex-col item-center justify-center bg-primarybg p-2 aspect-square rounded-full">
                                    <FontAwesomeIcon icon={faClock} className="text-base"/>
                                </div>
                                {/* desc */}
                                <div className="flex flex-col justify-center items-start">
                                    <p className="group-hover:text-white font-header text-sm text-primary">On-going</p>
                                    <p className="group-hover:text-white font-text text-unactive text-xs">You have {activities.ongoing} courses on-going</p>
                                </div>
                            </div>
                        )}
                        {activities.past_due > 0 && (
                            <div className="w-full h-full bg-white border border-primary rounded-md shadow-md px-3 py-1 flex flex-row  justify-start items-center gap-3 hover:cursor-pointer hover:bg-primary group transition-all ease-in-out"
                                onClick={() => navigate('/learner/learnercoursemanager/ongoing')}>
                                {/* icon */}
                                <div className="group-hover:text-white group-hover:bg-gray-50 group-hover:bg-opacity-20  text-primary flex flex-col item-center justify-center bg-primarybg p-2 aspect-square rounded-full">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-base"/>
                                </div>
                                {/* desc */}
                                <div className="flex flex-col justify-center items-start">
                                    <p className="group-hover:text-white font-header text-sm text-primary">Past Deadline</p>
                                    <p className="group-hover:text-white font-text text-unactive text-xs">You have {activities.past_due} courses past deadline</p>
                                </div>
                            </div>
                        )}
                    </>
                }
            </div>
        </div>
    </div>
    )
}

export default LearnerDashboard
