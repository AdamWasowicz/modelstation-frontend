import React, {useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';
import {StoreContext} from '../../store/StoreProvider'


//Helpers
import { LikeCommentHelper_GET, LikedCommentHelper_PATCH, Comment_PATCH} from '../../helpers/CommentHelper';


//Styles
import { faArrowUp, faArrowDown, faEdit, faTrashAlt, faSave} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { default as CommentStyle } from './Comment.module.scss'


const Comment = ({ commentObject }) => {

    //useState
    const [comment, setCommentObject] = useState(commentObject);
    const [commentText, setCommentText] = useState(commentObject.text);
    const [editCommentText, setEditCommentText] = useState(commentObject.text);
    const [currentLikeStatus, setCurrentLikeStatus] = useState(0);
    const [amountOfLikes, setAmountOfLikes] = useState(0);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);


    //useContext
    const { isLoggedIn } = useContext(StoreContext);


    //useParams
    const postId = useParams().postId;


    //useEffect
    useEffect( () => {
        if (isLoggedIn)
            CheckIfUserLikedComment();
        else if (isLoggedIn == false)
        {
            setCurrentLikeStatus(0);
            setEditMode(false);
        }
    }, [isLoggedIn])


    //Handlers
    const likeUpButtonHandler = async () => {
        if (currentLikeStatus == 1) {
            await LikedCommentHelper_PATCH(0, comment.id);
            setCurrentLikeStatus(0);
            setAmountOfLikes(amountOfLikes - 1);
        }
        else if (currentLikeStatus === -1) {
            await LikedCommentHelper_PATCH(1, comment.id);
            setCurrentLikeStatus(1);
            setAmountOfLikes(amountOfLikes + 2);
        }
        else {
            await LikedCommentHelper_PATCH(1, comment.id);
            setCurrentLikeStatus(1);
            setAmountOfLikes(amountOfLikes + 1);
        }
    }
    const likeDownButtonHandler = async () => {
        if (currentLikeStatus === 1) {
            await LikedCommentHelper_PATCH(-1, comment.id);
            setCurrentLikeStatus(-1);
            setAmountOfLikes(amountOfLikes - 2);
        }
        else if (currentLikeStatus === -1) {
            await LikedCommentHelper_PATCH(0, comment.id);
            setCurrentLikeStatus(0);
            setAmountOfLikes(amountOfLikes + 1);
        }
        else {
            await LikedCommentHelper_PATCH(-1, comment.id);
            setCurrentLikeStatus(-1);
            setAmountOfLikes(amountOfLikes - 1);
        }
    }
    const TextAreaChangeHandler = (event) => setEditCommentText(event.target.value);
    const EditModeChangeHandler = (event) => {
        setEditCommentText(commentText);
        setEditMode(!editMode);
    }
    const SendPatchHandler = (event) => {
        if (ValidateForm())
        {
            PatchComment();
            EditModeChangeHandler();
        }
        else {
            alert("Komentarz musi mieć przynajmniej jeden znak oraz nie być dłuższy niż 256 znaków")
        }
    }
    const ValidateForm = () => {
        if (commentText > 0 && commentText < 256)
            return true;
        
        return false;
    }


    //Functions
    //https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    };
    const CheckIfUserLikedComment = async () => {
        if (isLoggedIn)
        {
            const { error, value} = await LikeCommentHelper_GET(comment.id);
            setCurrentLikeStatus(value);
        }
    }
    const PatchComment = async () => {
        await Comment_PATCH(editCommentText, postId);
        setCommentText(editCommentText);
    }


    return (
        <div className='Comment'>
            <div className='LikeSideBar'>
                <div className='LikeContainer'>
                    <button 
                        className={
                            currentLikeStatus == 1
                            ? 'LikeUpButton-Active'
                            : 'LikeUpButton'}
                        onClick={editMode ? likeUpButtonHandler : null}>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </button>

                    <div className='LikeCounter'>
                        {amountOfLikes}
                    </div>

                    <button 
                        className={
                            currentLikeStatus == -1
                                ? 'LikeDownButton-Active'
                                : 'LikeDownButton'}
                        onClick={editMode ? likeDownButtonHandler : null}>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </button>
                </div>
            </div>

            <div className='Main'>
                <div className='UserInformation'>
                    <div className='UserName'>
                        {comment.userName}
                    </div>

                    <div className='UserImage'>
                        UserImage
                    </div>
                </div>

                <div className='CommentContent'>
                    {
                        editMode && isLoggedIn
                        ? <textarea className='Text' type='text' value=   {editCommentText} onChange={TextAreaChangeHandler}>
                        </textarea>
                        : <div className='Text'>
                            {commentText}
                        </div>
                    }
                </div>
            </div>

            {
                isLoggedIn == true && parseJwt(JSON.parse(window.localStorage.getItem('jwt'))).UserId == comment.userId
                ? <div className='ManipulationPanel'>

                    <button className='EditButton' onClick={EditModeChangeHandler}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>

                    {
                        !editMode
                        ? <button className='DeleteButton'>
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                        : <button className='SaveButton' onClick={SendPatchHandler}>
                            <FontAwesomeIcon icon={faSave}/>
                        </button>
                    }

                </div>
                : null 
            }
        </div>
    );
}

export default Comment;