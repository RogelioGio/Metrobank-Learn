import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "./contexts/ContextProvider";

const ProtectedRoutes = ({allowed}) => {
    const {token, user} = useStateContext();

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    if(!allowed.includes(user.user_infos.roles[0].role_name)){
        return <Navigate to="/unauthorized" replace/>;
    }

    return <Outlet/>
}

export default ProtectedRoutes;

