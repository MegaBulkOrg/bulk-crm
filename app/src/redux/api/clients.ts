import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, IGetAllClientsResponseWithQuantity, IClient, ICountRowsResponse, ICreateClientRequest, ICreateClientResponse, IItemsPageListRequest, IUpdateClientRequest, IUpdateItemResponse } from '../apiInterfaces';
import { RootState } from '../store';

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  tagTypes: ['Clients'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_HOST}/api/clients`,
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
    getAllClients: build.query<IGetAllClientsResponseWithQuantity | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: params.mode === 'all'
          ? `?mode=${params.mode}&offset=${params.offset}&limit=${params.limit}&sortby=${params.sortDir}`
          : `?mode=${params.mode}&managerId=${params.id}&offset=${params.offset}&limit=${params.limit}&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Clients', id: 'LIST' }]
    }),
    getHomeClientsList: build.query<IGetAllClientsResponseWithQuantity | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: params.mode === 'all'
          ? `?mode=${params.mode}&sortby=desc&limit=4`
          : `?mode=${params.mode}&managerId=${params.id}&sortby=desc&limit=4`
      }),
      providesTags: [{ type: 'Clients', id: 'LIST' }]
    }),
    getCurrentClient: build.query<IClient | AuthError, number>({
      query: (id) => ({
        url: `/client-${id}`
      }),
      providesTags: [{ type: 'Clients', id: 'LIST' }]
    }),
    getClientsByCurrentUser: build.query<IClient[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: `/user-${params.id}?&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Clients', id: 'LIST' }]
    }),
    countClientsByCurrentUser: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/user-${id}/count`
      }),
      providesTags: [{ type: 'Clients', id: 'LIST' }]
    }),
    createClient: build.mutation<ICreateClientResponse | AuthError, ICreateClientRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Clients']
    }),
    updateClient: build.mutation<IUpdateItemResponse | AuthError, IUpdateClientRequest>({
      query: (params) => ({
        url: `/client-${params.id}`,
        method: 'PATCH',
        body: params.body
      }),
      invalidatesTags: ['Clients']
    })
  })
});

export const { useGetAllClientsQuery, useGetHomeClientsListQuery, useGetCurrentClientQuery, useLazyGetCurrentClientQuery, useGetClientsByCurrentUserQuery, useLazyGetClientsByCurrentUserQuery, useLazyCountClientsByCurrentUserQuery, useCreateClientMutation, useUpdateClientMutation } = clientsApi;