import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TAuth = {
    isAuth: boolean
    accessToken: string | null
    authUserId: number | null
    authUserRoleId: number | null
}

const initialState: TAuth = {
    isAuth: false,
    accessToken: null,
    authUserId: null,
    authUserRoleId: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        changeAuthStatus(state, action: PayloadAction<TAuth>){
            state.isAuth = action.payload.isAuth 
            state.accessToken = action.payload.accessToken
            state.authUserId = action.payload.authUserId
            state.authUserRoleId = action.payload.authUserRoleId
        },
        resetAuthStatus(state){
            state.isAuth = false 
            state.accessToken = null
            state.authUserId = null
            state.authUserRoleId = null
        }
    }
})

export const { changeAuthStatus, resetAuthStatus } = authSlice.actions
export default authSlice.reducer