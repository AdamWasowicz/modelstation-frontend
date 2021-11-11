import React, {createContext, useState, useEffect} from "react";
import request from "../helpers/request";

require("regenerator-runtime/runtime");

export const StoreContext = createContext(null);


const StoreProvider = ( { children} ) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <StoreContext.Provider value={{
            posts,
            setPosts,

            user,
            setUser,

            currentPage,
            setCurrentPage
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreProvider;