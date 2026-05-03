import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
import CourseListMaintenance from "./views/CourseListMaintenance";
import UserManagementMaintenance from "./views/UserManagementMaintenance";
import UserAccountSecurityMaintenance from "./views/UserAccountSecurityMaintenance";
import Dashboard from "./views/Dashboard";
import SystemAdmin from "./components/SystemAdmin";
import CourseAdmin from "./components/CourseAdmin";
import Learner from "./components/Learner";
import SystemConfiguration from "./views/SystemConfigurationMaintenance";
import ActivityLog from "./views/ActivityLog";
import SystemLevelReports from "./views/SystemLevelReports";
import BulkEnrollment from "./views/BulkEnrollment";
import ProtectedRoutes from "./ProtectedRoutes";
import Unauthorized from "./views/Unauthorized";
import AssignedCourse from "./views/AssignedCourseCatalog";
import AssignedCourseReport from "./views/AssignedCourseResport";
import Course from "./views/Course";
import MyEmployee from "./views/MyEmployee";
import { CourseListProvider } from "./contexts/CourseListProvider";
import { SelectedUserProvider } from "./contexts/selecteduserContext";
import { OptionProvider } from "./contexts/AddUserOptionProvider";
import SelectUser from "./views/SelectedUser";
import { SelectedCourseProvider } from "./contexts/selectedcourseContext";
import CsvToJson from "./views/CsvToJson";
import AccountSettings from "./views/AccountSetting";
import LearnerCourseManager from "./views/LearnerCourseManager";
import LearnerCertficates from "./views/LearnerCertificates";
import LearnerSelfEnrollment from "./views/LearnerSelfEnrollment";
import CompeLearnExtension from "./views/CompeLearnExtension";
import InitialLogin from "./views/InitialLogin";
import Test from "./views/Test";
import SMEDashboard from "./views/Dashboards/SMEDashboard";
import Calendar from "./views/Calendar";
import UserProfile from "./views/UserProfile";
import { Edit, User } from "lucide-react";
import { useStateContext } from "./contexts/ContextProvider";
import Redirect from "./contexts/Redirect";
import { CourseProvider } from "./contexts/Course";



import AdminDashboard from "./authoring-tool/modules/dashboard-module/AdminDashboard";
import SubjectMatterExpertLayout from "./components/SubjectMatterExpertLayout";
import AuthoringDashboard from "./views/AuthoringTools/AuthoringDashboard";
import DesignLaboratory from "./views/AuthoringTools/DesignLaboratory";
import ContentHub from "./views/AuthoringTools/ContentHub";
import UserReports from "./views/AuthoringTools/UserReports";
import { CourseCreation } from "./views/AuthoringTools/CourseCreation";
import LessonCanvas from "./views/AuthoringTools/LessonCanvas";
import { AuthoringToolProvider } from "./contexts/AuthoringToolContext";
import ContentBank from "./views/AuthoringTools/ContentBank";
import { CategoryCourseSelection} from "./views/AuthoringTools/CategoryCourseSelection";
import { TobeDistributedCourse } from "./views/AuthoringTools/TobeDistributedCourse";
import { ReviewCourse } from "./views/AuthoringTools/ReviewCourse";
import { AssessmentCanvas } from "./views/AuthoringTools/AssessmentCanvas";
import { CoursePreview } from "./views/AuthoringTools/CoursePreview";
import CourseIncompletePreview from "./views/AuthoringTools/CourseIncompletePreview";
import SelfEnrollmentCoursePreview from "./views/SelfEnrollmentCoursePreview";
import { AddUser } from "./views/AddUser";
import EditUser from "./views/EditUser";
import Notifications from "./views/notifications";
import LearnerCertficatesPreview from "./views/learnerCertificatePreview";
import LearnersProfile from "./views/LearnersProfile";


// const {user} = useStateContext()
// const cleanRole = user.user_infos.role[0].role_name.toLowerCase().replace(/\s+/g, '');

const router = createBrowserRouter([

    // Authenticated Routes
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Redirect />
            },
            {
                path: "/systemadmin",
                element: <ProtectedRoutes allowed={["System Admin"]}/>,
                children: [
                    {
                        path: "/systemadmin",
                        element: <Navigate to="/systemadmin/dashboard" />
                    },
                    {
                        path: "dashboard",
                        element: <Dashboard/>
                    },
                    {
                        path:"dashboard/calendar",
                        element: <Calendar/>
                    },
                    {
                        path: "usermanagementmaintenance",
                        element:<UserManagementMaintenance/>,
                    },
                    {
                        path: "adduser",
                        element: <AddUser/>,
                    },
                    {
                        path: "edituser",
                        element: <EditUser/>
                    },
                    {
                        path: "notifications",
                        element: <Notifications/>
                    },
                    // {
                    //     path: "userdetail/:id",
                    //     element:
                    //     <SelectedUserProvider>
                    //         <SelectUser/>
                    //     </SelectedUserProvider>
                    //     // <UserProfile/>
                    // },
                    {
                        path: "useraccountsmaintenance",
                        element: <UserAccountSecurityMaintenance/>
                    },
                    {
                        path: "systemconfigurationmaintenance",
                        element:
                        <CourseListProvider>
                            <SystemConfiguration/>
                        </CourseListProvider>
                    },
                    {
                        path: "systemlevelreports",
                        element: <SystemLevelReports/>
                    },
                    {
                        path: "activitylogs",
                        element: <ActivityLog/>
                    },
                    {
                        path: "testCsvToJson",
                        element: <CsvToJson/>
                    },
                    {
                        path:"accountsettings",
                        element: <AccountSettings/>
                    },
                    {
                        path:'profile',
                        element: <UserProfile/>
                    }

                ]
            },
            {
                path:"/courseadmin",
                element:
                <CourseListProvider>
                        <CourseProvider>
                            <ProtectedRoutes allowed={["System Admin","Course Admin"]}/>
                        </CourseProvider>
                </CourseListProvider>,
                children: [
                    {
                        path: "/courseadmin",
                        element: <Navigate to="/courseadmin/dashboard" />
                    },
                    {
                        path: "dashboard",
                        element:

                            <Dashboard/>

                    },
                    {
                        path: "bulkenrollment",
                        element: <BulkEnrollment/>
                    },
                     {
                        path: "notifications",
                        element: <Notifications/>
                    },
                    // {
                    //     path: "courselistmaintenance",
                    //     element:
                    //     <SelectedCourseProvider>
                    //         <Course_ContexttProvider>
                    //             <CourseListMaintenance/>,
                    //         </Course_ContexttProvider>
                    //     </SelectedCourseProvider>
                    // },
                    {
                        path:"course/:id",
                        element:
                                <Course/>

                    },
                    {
                        path:"learnersprofile",
                        element:
                                <LearnersProfile/>

                    },
                    {
                        path: "courses",
                        element:
                                <AssignedCourse/>

                    },
                    {
                        path: "coursereports",
                        element: <AssignedCourseReport/>
                    },
                    {
                        path: "myemployee",
                        element:<MyEmployee/>
                    },
                    // {
                    //     path: "courses/comp_e_learn",
                    //     element: <CompeLearnExtension/>
                    // }
                    {
                        path:"accountsettings",
                        element: <AccountSettings/>
                    },
                    {
                        path:'test',
                        element:
                        <CourseProvider>
                            <Test/>
                        </CourseProvider>
                    }

                ]
            },
            {
                path:"/learner",
                element:
                <CourseListProvider>
                        <CourseProvider>
                                <Learner/>
                        </CourseProvider>
                </CourseListProvider>,
                children: [
                    {
                        path: "/learner",
                        element: <Navigate to="/learner/dashboard" />
                    },
                    {
                        path: "dashboard",
                        element:
                            <Dashboard/>
                    },
                     {
                        path: "notifications",
                        element: <Notifications/>
                    },
                    {
                        path: "calendar",
                        element: <Calendar/>
                    },
                    {
                        path: "learnercoursemanager/:status?",
                        element: <SelectedCourseProvider>
                                        <LearnerCourseManager/>
                            </SelectedCourseProvider>
                    },
                    {
                        path: "learnercertificates",
                        element: <LearnerCertficates/>
                    },
                    {
                        path:"learnerCertificatePreview/:id?",
                        element:<LearnerCertficatesPreview/>
                    },
                    {
                        path: "learnerselfenrollment",
                        element:
                            <LearnerSelfEnrollment/>
                    },
                    {
                        path:"course/:id",
                        element:
                                <Course/>

                    },
                    {
                        path: "preview/:id/:request?",
                        element: <SelfEnrollmentCoursePreview/>
                    },
                    {
                        path:"accountsettings",
                        element: <AccountSettings/>
                    }

                ]
            }
        ]
    },

    //SME ROUTES
    {
        path: "/SubjectMatterExpert",
        element: <SubjectMatterExpertLayout />,
        children: [
            {
                element:
                            <ProtectedRoutes allowed={["SME","SME-Creator","SME-Approver","SME-Distributor", "System Admin"]} />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/SubjectMatterExpert/dashboard" replace/>
                    },
                    {
                        path: "dashboard",
                        element: <AuthoringDashboard/>
                    },
                    {
                        path: "testDesign",
                        element: <DesignLaboratory/>
                    },
                    {
                        path: "contentHub/:category?",
                        element: <ContentHub/>
                    },
                    {
                        path: "contentBank",
                        element: <ContentBank/>
                    },
                    {
                        path: "userReports",
                        element: <UserReports/>
                    },
                    {
                        path: "coursecreation/:courseId?",
                        element: <CourseCreation/>
                    },
                    {
                        path: "authoring-tool/course-incomplete-preview/:courseId",
                        element: <CourseIncompletePreview />
                    },
                    {
                        path: "lessonCanvas/:id?",
                        element: <LessonCanvas/>
                    },
                    {
                        path: "assessmentCanvas/:id?",
                        element: <AssessmentCanvas/>
                    },
                    {
                        path: "category/:id?",
                        element: <CategoryCourseSelection/>
                    },
                    {
                        path : "coursePlacement/:id?",
                        element: <TobeDistributedCourse/>
                    },
                    {
                        path: "review/:id?",
                        element: <ReviewCourse/>
                    },
                    {
                        path:"preview/:id?/:mblearn?",
                        element: <CoursePreview/>
                    }


                ]
            }
        ]
        //     {
        //         path: "/SubjectMatterExpert",
        //         element: <Navigate to="/SubjectMatterExpert/dashboard" />
        //     },
        //     {
        //         dashboard: "dashboard",
        //         element: <AdminDashboard/>
        //     }
        // ]
    },

    //Login route
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login/>
            },
        ]
    },

    //404 route
    {
        path: "/404-not-found",
        element: <NotFound/>
    },

    //Unauthorized route
    {
        path: "/unauthorized",
        element: <Unauthorized/>
    },

    //Initial Login Route
    {
        path:"/initial-login/:id?",
        element: <InitialLogin/>
    },

    {
        path: "*",
        element: <NotFound/>
    }


]);

export default router;
