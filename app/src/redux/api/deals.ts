import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, IGetAllDealsResponseWithQuantity, IDeal, ICountRowsResponse, ICreateDealRequest, ICreateDealResponse, IItemsPageListRequest, IUpdateDealRequest, IUpdateItemResponse } from '../apiInterfaces';
import { RootState } from '../store';

export const dealsApi = createApi({
  reducerPath: 'dealsApi',
  tagTypes: ['Deals'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_HOST}/api/deals`,
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
    getAllDeals: build.query<IGetAllDealsResponseWithQuantity | AuthError, IItemsPageListRequest>({
      query: (params) => ({        
        url: params.mode === 'all'
          ? `?mode=${params.mode}&offset=${params.offset}&limit=${params.limit}&sortby=${params.sortDir}`
          : `?mode=${params.mode}&managerId=${params.id}&offset=${params.offset}&limit=${params.limit}&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    getHomeDealsList: build.query<IGetAllDealsResponseWithQuantity | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: params.mode === 'all'
          ? `?mode=${params.mode}&sortby=desc&limit=3`
          : `?mode=${params.mode}&managerId=${params.id}&sortby=desc&limit=3`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    getCurrentDeal: build.query<IDeal | AuthError, number>({
      query: (id) => ({
        url: `/deal-${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    getDealsByCurrentUser: build.query<IDeal[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: `/user-${params.id}?&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    getDealsByCurrentClient: build.query<IDeal[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: `/client-${params.id}?&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    countAllDeals: build.query<ICountRowsResponse | AuthError, void>({
      query: () => ({
        url: '/total'
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    сountDealsInWork: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/count-inwork?id=${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    сountDealsDone: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/count-done?id=${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    сountDealsInWorkByCurrentUser: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/count-inwork-by-user?id=${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    сountDealsDoneByCurrentUser: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/count-done-by-user?id=${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    сountDealsFailedByCurrentUser: build.query<ICountRowsResponse | AuthError, number>({
      query: (id) => ({
        url: `/count-failed-by-user?id=${id}`
      }),
      providesTags: [{ type: 'Deals', id: 'LIST' }]
    }),
    createDeal: build.mutation<ICreateDealResponse | AuthError, ICreateDealRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Deals']
    }),
    updateDeal: build.mutation<IUpdateItemResponse | AuthError, IUpdateDealRequest>({
      query: (params) => ({
        url: `/deal-${params.id}`,
        method: 'PATCH',
        body: params.body
      }),
      invalidatesTags: ['Deals']
    })
  })
});

export const { useGetHomeDealsListQuery, useGetCurrentDealQuery, useLazyGetCurrentDealQuery, useСountDealsDoneQuery, useСountDealsInWorkQuery, useСountDealsInWorkByCurrentUserQuery, useСountDealsDoneByCurrentUserQuery, useСountDealsFailedByCurrentUserQuery, useCountAllDealsQuery, useGetAllDealsQuery, useGetDealsByCurrentUserQuery, useGetDealsByCurrentClientQuery, useLazyGetDealsByCurrentClientQuery, useCreateDealMutation, useUpdateDealMutation } = dealsApi;