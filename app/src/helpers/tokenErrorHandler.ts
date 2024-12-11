import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta, MutationActionCreatorResult, MutationDefinition, QueryActionCreatorResult, QueryDefinition } from "@reduxjs/toolkit/query";
import { IRefreshResponse, ISignoutResponse } from "Redux/apiInterfaces";
import { resetAuthStatus } from 'Redux/slices/authSlice';
import { changeAuthStatus } from 'Redux/slices/authSlice';
import { AppDispatch } from "Redux/store";
import { jwtVerify } from 'jose';

type TArgs = {
    error: FetchBaseQueryError 
    dispatch: AppDispatch
    signout: (arg: number) => MutationActionCreatorResult<MutationDefinition<number, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta>, "Auth", ISignoutResponse, "authApi">>
    authUserId: number | null
    refresh: (arg: void, preferCacheValue?: boolean) => QueryActionCreatorResult<QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta>, "Auth", IRefreshResponse, "authApi">>
}

export async function tokenErrorHandler(arg:TArgs) {    
    // отсутствует заголовок авторизации либо accessToken отсутствует
    if (arg.error.status === 401) {
        const { data } = await arg.signout(arg.authUserId || 0)
        if(data && data.status) {
            arg.dispatch(resetAuthStatus())
            return false
        }
    }
    if (arg.error.status === 403) {
        const { data } = await arg.refresh()
        // refreshToken обновился
        if (data && data.status === true && data.accessToken) {            
            // секретный ключ должен быть преобразован в формат Uint8Array
            const secretKey = new TextEncoder().encode(import.meta.env.VITE_REACT_JWT_ACCESS_SECRET);
            const { payload } = await jwtVerify(data.accessToken, secretKey)
            arg.dispatch(changeAuthStatus({
                isAuth: data.status,
                accessToken: data.accessToken,
                authUserId: Number(payload.userId),
                authUserRoleId: Number(payload.userRole)
            }))
            return true
        }
        // с refreshToken что-то не так
        if (data && data.status === false) {
            const { data } = await arg.signout(arg.authUserId || 0)
            if(data && data.status) {
                arg.dispatch(resetAuthStatus())
                return false
            }
        }
    }
}