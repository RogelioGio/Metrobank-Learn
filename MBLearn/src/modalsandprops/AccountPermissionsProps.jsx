import { useEffect, useState } from "react";
import CourseAdminPermissionProps from "./SystemSettingComponents.jsx/CourseAdminPermissionProps";
import SystemAdminPermissionProps from "./SystemSettingComponents.jsx/SystemAdminPermssionProps";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import LearnerPermissionProps from "./SystemSettingComponents.jsx/LearnerPermissionProps";

const AccountPermissionProps = ({refPermissions, selectedRole, role, setAccountPerm, currentPerm, originalRole}) => {
    const [OriginalRole, setOriginaltRole] = useState();

    useEffect(() => {
        setOriginaltRole(originalRole)
        if (OriginalRole !== selectedRole || currentPerm?.length === 0) {
            console.log("Selected Role Changed:", selectedRole, "New Permission");
            availablePermission();
        } else if (currentPerm) {
            console.log("Current Permission:", currentPerm, "Edit mode");
            setPermissions(currentPerm);
            _setAccountPerm(currentPerm.map(p => ({
                permission_Id: p.id
            })));
        }
    }, [selectedRole]);

    const [accountPerm, _setAccountPerm] = useState([])


    const [permission, setPermissions] = useState([]);
    const availablePermission = () => {
        const selected = role?.find((r) => r.id === parseInt(selectedRole));
        if (selected) {
            console.log(selected)
            setPermissions(selected?.permissions)
            _setAccountPerm((selected?.permissions || []).map(p => ({
                permission_Id: p.id
            })))
        } else {
            setPermissions([]);
        }
    };

    useEffect(()=>{
        // console.log(refPermissions)
        // console.log(rolePermission)
        if(setAccountPerm){
            setAccountPerm(accountPerm)
        }
        console.log("Permission to be Thrown: " ,accountPerm)
    },[permission])


    const isChecked = (permName) => {
        return permission.some(p => p.permission_name === permName);
    };
    const permissionswitch = (perm_id,permission_name ,checked) => {
            const perm = refPermissions.find(p => p.permission_name === permission_name);
            const _perm = refPermissions.find(p =>p.id === perm_id)

            console.log("Permission Switch Called", perm, _perm);
            console.log(accountPerm)

        setPermissions(prev => {
            const exists = prev.some(p => p.permission_name === permission_name);

            if(checked && !exists) {
                //setSaved(false)
                return [...prev, {
                    id: perm.id, permission_name: perm.permission_name}];
            } else if (!checked && exists) {
                //setSaved(false)
                return prev.filter(p=>p.permission_name !== permission_name)
            }
            return prev;
        })

        _setAccountPerm(prev => {
            const exists = prev.some(p => p.permission_Id === perm_id)

            if(checked && !exists){
                return[
                    ...prev, {
                        permission_Id: _perm.id
                    }
                ]
            } else if(!checked&& exists){
                return prev.filter(p => p.permission_Id !== perm_id)
            }
            return prev;
        })
    }

    return (
        <>
        {
                (selectedRole ===  "1"||selectedRole === 1) ? (
                <SystemAdminPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={refPermissions}/>
            ) : (selectedRole ===  "2"||selectedRole === 2) ? (
                <CourseAdminPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={refPermissions}/>
            ) : (selectedRole ===  "3"||selectedRole === 3) ? (
                <LearnerPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={refPermissions}/>
            ):(selectedRole ===  "4"||selectedRole === 4) ? (
                <SystemAdminPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={refPermissions}/>
            ) :
            (null)
        }
        </>
    );
}

export default AccountPermissionProps;
