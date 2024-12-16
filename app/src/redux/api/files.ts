import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthError, IUploadSinglePhotoResponse } from '../apiInterfaces';
import { RootState } from '../store';

export const filesApi = createApi({
  reducerPath: 'filesApi',
  tagTypes: ['Files'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_REACT_APP_HOST}/api/files`,
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
    uploadSinglePhoto: build.mutation<IUploadSinglePhotoResponse | AuthError, FormData>({
        query: (body) => ({
          url: '/upload-single-photo',
          method: 'POST',
          body: body
        }),
        invalidatesTags: [{ type: 'Files', id: 'LIST' }]
    })
  })
});

export const { useUploadSinglePhotoMutation } = filesApi;