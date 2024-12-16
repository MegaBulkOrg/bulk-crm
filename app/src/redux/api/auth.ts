import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IRefreshResponse, ISigninRequest, ISigninResponse, ISignoutResponse } from '../apiInterfaces';

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_HOST}/api/auth`,
    // следующая настройка для отправки кук
    // важно: на сервере в "cors" обязательно нужно указать origin и credentials
    credentials: 'include'
  }),
  endpoints: (build) => ({
    signin: build.mutation<ISigninResponse, ISigninRequest>({
      query: (body) => ({
        url: '/signin',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Auth', id: 'LIST' }]
    }),
    signout: build.mutation<ISignoutResponse, number>({
      query: (userId) => ({
        url: `/signout?userId=${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Auth', id: 'LIST' }]
    }),
    refresh: build.query<IRefreshResponse, void>({
      query: () => ({
        url: '/refresh'
      }),
      providesTags: [{ type: 'Auth', id: 'LIST' }]
    })
  })
});

export const { useSigninMutation, useSignoutMutation, useLazyRefreshQuery } = authApi;