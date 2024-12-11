import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, IClientContactPersonContactType, IClientType, ICurrency, IDealStatus, IJob, IRole, IUser } from '../apiInterfaces';
import { RootState } from '../store';

export const directoriesApi = createApi({
  reducerPath: 'directoriesApi',
  tagTypes: ['Directories'],
  baseQuery: fetchBaseQuery({
    baseUrl: `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/directories`,
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
    getAllRoles: build.query<IRole[] | AuthError, void>({
      query: () => ({
        url: '/roles'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllJobs: build.query<IJob[] | AuthError, void>({
      query: () => ({
        url: '/jobs'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllClientsTypes: build.query<IClientType[] | AuthError, void>({
      query: () => ({
        url: '/clients-types'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllClientsContactPersonsContactTypes: build.query<IClientContactPersonContactType[] | AuthError, void>({
      query: () => ({
        url: '/clients-contact-persons-contact-types'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllCurrencies: build.query<ICurrency[] | AuthError, void>({
      query: () => ({
        url: '/currencies'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllDealsStatuses: build.query<IDealStatus[] | AuthError, void>({
      query: () => ({
        url: '/deals-statuses'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    }),
    getAllManagers: build.query<IUser[] | AuthError, void>({
      query: () => ({
        url: '/managers'
      }),
      providesTags: [{ type: 'Directories', id: 'LIST' }]
    })
  })
});

export const { useLazyGetAllRolesQuery, useLazyGetAllJobsQuery, useLazyGetAllClientsTypesQuery, useLazyGetAllClientsContactPersonsContactTypesQuery, useLazyGetAllDealsStatusesQuery, useLazyGetAllCurrenciesQuery, useLazyGetAllManagersQuery } = directoriesApi;