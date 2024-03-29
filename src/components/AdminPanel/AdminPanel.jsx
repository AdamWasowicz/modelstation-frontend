import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { StoreContext } from '../../store/StoreProvider';


//Resources
import { ReadLocalStorage, parseJwt } from '../../Fuctions';
import { AccessLevels, RoleIds } from '../../API_constants';


//Helpers
import {ChangeRole, UnBanUser, BanUser, ChangePasswordByUserName} from '../../helpers/AccountHelper';


//Components
import Loading from '../Loading';
import NotLoggedException from '../NotLoggedException';
import NoPermissionException from './NoPermissionException';


//Styles
import { default as AdminPanelStyles } from './AdminPanel.module.scss';


const AdminPanel = () => {

    //useNavigate
    const navigate = useNavigate();


    //Constants
    const role = ReadLocalStorage('jwt') != null ? parseJwt(ReadLocalStorage('jwt')) : null;


    //useContext
    const { isLoggedIn, setIsLoggedIn } = useContext(StoreContext)


    //useState
    //General
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(0);
    //RoleChange
    const [ RC_userName, setRC_userName ] = useState('');
    const [ RC_roleId, setRC_roleId] = useState(1);
    //BanStatusChange
    const [ BS_actionId, setBS_actionId ] = useState(0);
    const [ BS_userName, setBS_userName] = useState('')
    //PaswordChange
    const [ PC_userName, setPC_userName ] = useState(''); 
    const [ PC_password, setPC_password ] = useState('');




    //Handlers
    //RoleChange
    const RoleChange_UserNameChangeHandler = (event) => {
        setRC_userName(event.target.value);
    }
    const RoleChange_RoleIdChangeHandler = (event) => {
        setRC_roleId(event.target.value);
    }
    const ChangeRoleOnClick = async () => {
        await ChangeRole(RC_userName, RC_roleId, setLoading, setError);
    }
    //BanStatusChange
    const BanStatusChange_ActionIdChangeHandler = (event) => {
        setBS_actionId(event.target.value);
    }
    const BanStatusChange_UserNameChangeHandler = (event) => {
        setBS_userName(event.target.value);
    }
    const BanUserOnClick = async () => {
        await BanUser(BS_userName, setLoading, setError);
    }
    const UnBanUserOnClick = async () => {
        await UnBanUser(BS_userName, setLoading, setError);
    }
    //PasswordChange
    const PasswordChange_UserNameChangeHandler = (event) => {
        setPC_userName(event.target.value);
    }
    const PasswordChange_PasswordChangeHandler = (event) => {
        setPC_password(event.target.value);
    }
    const ChangePasswordOnClick = async () => {
        await ChangePasswordByUserName(PC_userName, PC_password, setLoading, setError);
    }





    if (loading)
        return (<Loading/>);

    else if (isLoggedIn == false) 
        return (<NotLoggedException/>);
    
    else if (role != null && role.AccessLevel < AccessLevels.IsModerator)
        return (<NoPermissionException/>);

    else
        return (
            <div className='AdminPanel'>
                <div className='Information'>Panel Admina:</div>
                <div className='FunctionContainer'>
                    <div className='ChangeRoleContainer'>
                        <div className='Label'>Zmień role użytkownika:</div>
                        
                        <input 
                            className='UserNameInput' 
                            value={RC_userName}
                            onChange={RoleChange_UserNameChangeHandler}>
                        </input>

                        <div className='Label-Short'>Na</div>

                        <select 
                            className='RoleSelect' 
                            placeholder='Rola'
                            onChange={RoleChange_RoleIdChangeHandler}>
                                <option value={RoleIds.User}>Użytkownik</option>
                                <option value={RoleIds.Moderator}>Moderator</option>
                                {
                                    role.AccessLevel >= AccessLevels.IsAdmin
                                    ? <option value={RoleIds.Admin}>Admin</option>
                                    : null
                                }
                        </select>

                        <button 
                            className='SendButton'
                            onClick={ChangeRoleOnClick}>
                                Wykonaj
                        </button>
                    </div>

                    <div className='BanPanelContainer'>
                        <select 
                            className='ActionSelect'
                            placeholder='Akcja'
                            onChange={BanStatusChange_ActionIdChangeHandler}>
                                <option value={0}>Zbanuj</option>
                                <option value={1}>Odbanuj</option>
                        </select>

                        <div className='Label'>użytkownika:</div>
                        
                        <input 
                            className='UserNameInput' 
                            value={BS_userName}
                            onChange={BanStatusChange_UserNameChangeHandler}>
                        </input>

                        <button 
                            className='SendButton'
                            onClick={
                                BS_actionId == 0
                                ? BanUserOnClick
                                : UnBanUserOnClick
                            }>
                                Wykonaj
                        </button>
                    </div>

                    <div className='PasswordChangeContainer'>
                        <div className='Label'>
                            Zmień hasło użytkownika:
                        </div>

                        <input 
                            className='UserNameInput' 
                            value={PC_userName}
                            onChange={PasswordChange_UserNameChangeHandler}>
                        </input>

                        <div className='Label-Short'>Na</div>

                        <input
                            type='password' 
                            className='UserNameInput-Short' 
                            value={PC_password}
                            onChange={PasswordChange_PasswordChangeHandler}>
                        </input>

                        <button 
                            className='SendButton'
                            onClick={ChangePasswordOnClick}>
                                Wykonaj
                        </button>
                    </div>
                </div>
            </div>
        )
}


export default AdminPanel;