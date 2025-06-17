import { createContext, useContext, useEffect, useReducer } from "react";

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('token') || null,
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN_START':
            return {
                user: null,
                role: null,
                token: null,
            };

        case 'LOGIN_SUCCESS':
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('role', action.payload.role);
            localStorage.setItem('token', action.payload.token);
            return {
                user: action.payload.user,
                token: action.payload.token,
                role: action.payload.role
            };

        case 'LOGOUT':
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('token');
            return {
                user: null,
                role: null,
                token: null,
            };

        default:
            return state;
    }       
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        // Load user data from local storage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedRole = localStorage.getItem('role');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedRole && storedToken) {
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: storedUser,
                    role: storedRole,
                    token: storedToken
                }
            });
        }
    }, []);

    return (
        <authContext.Provider value={{ user: state.user, token: state.token, role: state.role, dispatch }}>
            {children}
        </authContext.Provider>
    );
};
