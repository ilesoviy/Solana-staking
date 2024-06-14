import { createContext, useContext, useEffect, useState } from "react";

export const GlobalContext = createContext({
    darkMode: false,
    toggleColorMode: () => {},
    showNav: false,
    showNavFunc: () => {},
});

export const GlobalProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [showNav, setShowNav] = useState(true);

    useEffect(() =>{
        if (window.innerWidth <= 600) {
            setShowNav(false);
        }
    }, [])

    useEffect(() => {
        console.log("GlobalProvider: ", darkMode);
    }, [darkMode])

    return (
        <GlobalContext.Provider
            value={{
                darkMode,
                toggleColorMode: () => setDarkMode(!darkMode),
                showNav,
                showNavFunc: (v) => setShowNav(v),
            }}
        >
            { children }
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);