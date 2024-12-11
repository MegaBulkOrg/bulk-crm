import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, ICreateNoteRequest, ICreateNoteResponse, IItemsPageListRequest, INote, IUpdateItemResponse, IUpdateNoteRequest } from '../apiInterfaces';
import { RootState } from '../store';

export const notesApi = createApi({
  reducerPath: 'notesApi',
  tagTypes: ['Notes'],
  baseQuery: fetchBaseQuery({
    baseUrl: `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/notes`,
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
    getHomeNotesList: build.query<INote[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: params.mode === 'all'
          ? `?mode=${params.mode}&sortby=desc&limit=3`
          : `?mode=${params.mode}&managerId=${params.id}&sortby=desc&limit=3`
      }),
      providesTags: [{ type: 'Notes', id: 'LIST' }]
    }),
    getNotesByCurrentDeal: build.query<INote[] | AuthError, IItemsPageListRequest>({
      query: (params) => ({
        url: `/deal-${params.id}?&sortby=${params.sortDir}`
      }),
      providesTags: [{ type: 'Notes', id: 'LIST' }]
    }),
    getCurrentNote: build.query<INote | AuthError, number>({
      query: (id) => ({
        url: `/note-${id}`
      }),
      providesTags: [{ type: 'Notes', id: 'LIST' }]
    }),
    createNote: build.mutation<ICreateNoteResponse | AuthError, ICreateNoteRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Notes']
    }),
    updateNote: build.mutation<IUpdateItemResponse | AuthError, IUpdateNoteRequest>({
      query: (params) => ({
        url: `/note-${params.id}`,
        method: 'PATCH',
        body: params.body
      }),
      invalidatesTags: ['Notes']
    })
  })
});

export const { useGetHomeNotesListQuery, useGetNotesByCurrentDealQuery, useGetCurrentNoteQuery, useCreateNoteMutation, useUpdateNoteMutation } = notesApi;