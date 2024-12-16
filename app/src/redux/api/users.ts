import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, ICountRowsResponse, ICreateUserRequest, ICreateUserResponse, IItemsPageListRequest, IUpdateItemResponse, IUpdateUserRequest, IUser } from '../apiInterfaces';
import { RootState } from '../store';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  tagTypes: ['Users'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_HOST}/api/users`,
    // следующая настройка для отправки кук
    // важно: на сервере в "cors" обязательно нужно указать origin и credentials
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as RootState).auth.accessToken;
      if (accessToken !== null && accessToken !== '') {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  endpoints: (build) => ({
    getAllUsers: build.query<IUser[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: `?offset=${params.offset}&limit=${params.limit}&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    getHomeUsersList: build.query<IUser[] | AuthError, void>({
      query: () => ({
        url: '?homepage=true'
      }),
      providesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    getCurrentUser: build.query<IUser | AuthError, number>({
      query: (id) => ({
        url: `/user-${id}`
      }),
      providesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    userExistenceCheck: build.query<ICountRowsResponse | AuthError, string>({
      query: (email) => ({
        url: `/existence-check?email=${email}`
      }),
      providesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    countAllUsers: build.query<ICountRowsResponse | AuthError, void>({
      query: () => ({
        url: '/total'
      }),
      providesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    createUser: build.mutation<ICreateUserResponse | AuthError, ICreateUserRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Users']
    }),
    updateUser: build.mutation<IUpdateItemResponse | AuthError, IUpdateUserRequest>({
      query: (params) => ({
        url: `/user-${params.id}`,
        method: 'PATCH',
        body: params.body
      }),
      invalidatesTags: ['Users']
    })
  })
});

export const { useGetAllUsersQuery, useGetHomeUsersListQuery, useGetCurrentUserQuery, useLazyUserExistenceCheckQuery, useCountAllUsersQuery, useCreateUserMutation, useUpdateUserMutation } = usersApi;