import { Navigate } from "react-router";
import { useStateContext } from "./ContextProvider";

export default function Redirect() {
    const {user} = useStateContext();

    if (!user?.user_infos?.roles?.[0]?.role_name) {
        return null; // Or a loading spinner
    }

    const cleanRole = user.user_infos.roles[0].role_name.toLowerCase().replace(/\s+/g, '');

    return <Navigate to={`/${cleanRole}`} />;

}
