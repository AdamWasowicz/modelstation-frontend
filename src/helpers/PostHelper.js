import axios from "axios";
import { API_address, getPostByUserId, getUserPosts_APU_route, likePost_API_route, likedPost_create_or_edit_API_route, postCategory_GET_API_route, patchPost_API_route, uploadPost_API_route, deletePost_API_route, getUserProfileById_API_route, patchUserProfileData_API_route, uploadUserProfileImage_API_route
} from "../API_routes";
import { StoreContext } from "../store/StoreProvider";
import react, {useState, useEffect} from 'react';

export async function GetPostByPostId(postId, setPostObject, setLoading)
{
    let error = false;
    let data = null;

    await axios({
        method: 'GET',
        url: `${API_address}${getPostByUserId}/${postId}`
    }).then(result => {
        data = result.data;
        setPostObject(result.data);
        setLoading(false);
    }).catch(e => {
        setPostObject({});
        setLoading(false);
        console.log(e);
        error = true;
    });
    
    setLoading(false);

    return { error, data };
}

export async function GetUserPosts(jwt, userId, setUserPosts, setLoading)
{
    let error = false;
    let data = [];

    await axios({
        method: 'GET',
        url: `${API_address}${getUserPosts_APU_route}/${userId}`,
        headers: {
            Authorization: "Bearer " + jwt
        }
    }).then(result => {
        if (result.status === 200) {  
            setUserPosts(result.data);
            setLoading(false);

            data = result.data;
            error = false;
        } else {
            setPosts([]);
            setLoading(false);

            error = true;
        }
    }).catch(e => {

        setUserPosts([]);
        setLoading(false);
        error = true;
    });
    
    setLoading(false);

    return { error, data };
}

export async function LikePostHelper_GET(jwt, postId) {
    let error = false;
    let value = 0;

    if (jwt == null)
    {
        error = true;
        return {error, value};
    }

    await axios({
        method: 'GET',
        url: `${API_address}${likePost_API_route}` + postId,
        headers: {
            Authorization: "Bearer " + jwt
        },
    }).then(result => {
        if (result.status === 200) {
            value = result.data.value;
        } else {
            value = 0;
            error = true;
        }
    }).catch(e => {
        value = 0;
        error = true;
    });

    return {error, value};
}

export async function LikedPostHelper_POST(jwt, newValue, postId)
{
    let error = false;
    let result = true;

    await axios({
        method: 'POST',
        url: `${API_address}${likedPost_create_or_edit_API_route}`,
        headers: {
            Authorization: "Bearer " + jwt
        },
        data: {
            postId: postId,
            value: newValue
        },
    }).then(result => {
        if (result.status === 200) {
            result = true;
            error = false;
        } else {
            result = false;
            error = true;
        }

    }).catch(e => {
        console.log(e);
        result = false;
        error = true;
    });

    return error;
}

export async function postCategory_GET(jwt, setPostCategories) {
    let data = null;

    await axios({
        method: 'GET',
        url: `${API_address}${postCategory_GET_API_route}`,
        headers: {
            Authorization: "Bearer " + jwt
        },
    }).then(result => {
        if (result.status === 200) 
        {
            data = result.data;
        } 
    }).catch(e => {
        console.log(e);
    });

    return data ;
}

export default function postQueryExecutor(PostCategory, Title, UserName, CurrentPage, NumberOfPosts, SortOrder, SortAtr, posts, setPosts)
{
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [hasMore, setHasMore] = useState(false);


    //Functions
    const GetSortOrder = (sortOrder) => {
        if (sortOrder == 1)
            return 'ASC';

        if (sortOrder == -1)
            return 'DSC';
    }
    const GetSortArgument = (sortArgument) => {

        if (sortArgument == 0)
            return 'NONE';

        if (sortArgument == 1)
            return 'LIKES'

        if (sortArgument == 2)
            return 'DATE';
    }

    const GetParams = (PostCategory, Title, UserName, CurrentPage, NumberOfPosts, SortOrder, SortAtr, posts, setPosts) => { 
        let params = {
        PostCategory: PostCategory, 
        Title: Title,
        UserName: UserName,
        CurrentPage: CurrentPage,
        NumberOfPosts: NumberOfPosts,
        OrderByDirection: GetSortOrder(SortOrder),
        OrderByAtribute: GetSortArgument(SortAtr)
        }

        return params;
    }


    useEffect( () => {
        setPosts([])
    }, [Title, PostCategory, SortOrder, SortAtr])

    useEffect(() => {
        setLoading(true)
        setError(false)
        let cancel;
        axios({
            method: 'GET',
            url: `${API_address}/api/v1/post/query`,
            params: GetParams(PostCategory, Title, UserName, CurrentPage, NumberOfPosts, SortOrder, SortAtr, posts, setPosts),
          cancelToken: new axios.CancelToken(c => cancel = c)
          
        }).then(res => {
            if (res.status == 204) {
                setError(false);
                setLoading(false);
                setHasMore(false);
            }
            
            else {
                setPosts(prevPosts => {
                    return [...new Set([...prevPosts, ...res.data.posts])]
                });

                setError(false);
                setHasMore(res.data.posts.length == NumberOfPosts);
                setLoading(false);
            }

        }).catch(e => {

            console.log(e);
            if (axios.isCancel(e)) return
            setError(true);
            setLoading(false);
            setHasMore(false);
        })
        return () => cancel()
      }, [Title, PostCategory, SortOrder, SortAtr, CurrentPage])
    
      return { loading, error, hasMore }
}

export async function updatePost(postId, postTitle, postText, postCategoryName, setError) {
    const jwt = JSON.parse(window.localStorage.getItem('jwt'));
    var result = 0;

    if (postCategoryName == null)
        postCategoryName = '';

    axios({
        method: "PATCH",
        url: `${API_address}${patchPost_API_route}`,
        data: {
            Id: postId,
            Title: postTitle,
            Text: postText,
            PostCategoryName: postCategoryName
        },
        headers: { 
            Authorization: "Bearer " + jwt
        },
    }).then(function (response) {
        result = 1;
    }).catch(function (response)
    {
        console.log(response);
        result = -1;
        setError(true);
    });


    return result;
}

export async function uploadPost(jwt, title, text, categoryName, images, navigate) {
    var result = 0;

    console.log('up');
    //FormData
    let bodyFormData = new FormData();
    bodyFormData.append('Title', title);
    bodyFormData.append("Text", text);
    if (categoryName.length > 0)
        bodyFormData.append("PostCategoryName", categoryName);

    console.log(images);

    if (images.length > 0)
    {
        console.log('images');
        images = [...images];
        images.forEach( (img) => {
            bodyFormData.append("Files", img);
        });
    }


    axios({
        method: "POST",
        url: `${API_address}${uploadPost_API_route}`,
        data: bodyFormData,
        headers: { 
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + jwt
        },
    }).then(function (response) {
        result = 1;
        navigate('/');
    }).catch(function (response)
    {
        console.log(response);
        result = -1;
        alert('Nie udało się utworzyć postu');
    });

    return result;
}

export async function deletePost(postId) {
    const jwt = JSON.parse(window.localStorage.getItem('jwt'));
    var result = 0;

    axios({
        method: "DELETE",
        url: `${API_address}${deletePost_API_route}/${postId}`,
        headers: { 
            Authorization: "Bearer " + jwt
        },
    }).then(function (response) {
        result = 1;
    }).catch(function (response)
    {
        console.log(response);
        result = -1;
    });


    return result;
}

//User
export async function GetUserProfileById(id, setUserObject, setLoading) {

    await axios({
        method: 'GET',
        url: `${API_address}${getUserProfileById_API_route}/${id}`
    }).then(result => {
        setUserObject(result.data);
        setLoading(false);
    }).catch(e => {
        setUserObject(null);
        setLoading(false);
        console.log(e);
    });
}

export async function PatchUserProfile(name, surname, description, setLoading)
{
    const jwt = JSON.parse(window.localStorage.getItem('jwt'));

    axios({
        method: "PATCH",
        url: `${API_address}${patchUserProfileData_API_route}`,
        data: {
            name: name,
            surname: surname,
            gender: null,
            description: description
        },
        headers: { 
            Authorization: "Bearer " + jwt
        },
    }).then(function (response) {
        setLoading(false);
        return;
    }).catch(function (response)
    {
        console.log(response);
        setLoading(false);
        return;
    });
    
    setLoading(false);
    return;
}

export async function UploadUserProfileImage(file, setLoading, setError, setView) {

    setLoading(true);
    setError(false);

    const jwt = JSON.parse(window.localStorage.getItem('jwt'));

    //https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    };


    const jwtObject = parseJwt(jwt);


    //FormData
    let bodyFormData = new FormData();
    bodyFormData.append('UserId', jwtObject.UserId);
    bodyFormData.append("ContentType", "USER");

    let images = file;
    if (images != null)
    {
        images = [...images];
        bodyFormData.append("File", images[0]);
    }


    axios({
        method: "POST",
        url: `${API_address}${uploadUserProfileImage_API_route}`,
        data: bodyFormData,
        headers: { 
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + jwt
        },
    }).then(function (response) {
        UpdateLocalStorage();
        alert('Pomyślnie zmieniono zdjęcie');
        setView(0);
        setLoading(false);


    }).catch(function (response)
    {
        setView(12)
        setError(-1);
        setLoading(false);
    });
};

async function UpdateLocalStorage () {

    let user = JSON.parse(window.localStorage.getItem('user'));
    const id = user.userName;

    await axios({
        method: 'GET',
        url: `${API_address}${getUserProfileById_API_route}/${id}`
    }).then(result => {
        user.file = result.data.file;
        window.localStorage.removeItem('user');
        window.localStorage.setItem('user', JSON.stringify(user))
    }).catch(e => {
        console.log(e);
    });
};