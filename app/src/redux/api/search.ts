import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, ISearchRequest, ISearchResponseItem } from '../apiInterfaces';
import { RootState } from '../store';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  tagTypes: ['Search'],
  baseQuery: fetchBaseQuery({
    baseUrl: `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/search`,
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
    getSearchResults: build.query<ISearchResponseItem[] | AuthError, ISearchRequest>({
      query: (params) => ({
        url: params.mode === 'all'
          ? `?query=${params.query}&mode=all&sortby=${params.sortDir}`
          : `?query=${params.query}&mode=byManager&managerId=${params.id}&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Search', id: 'LIST' }]
    })
  })
});

export const { useGetSearchResultsQuery } = searchApi;