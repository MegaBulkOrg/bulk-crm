import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist';
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { clientsApi } from './api/clients';
import { dealsApi } from './api/deals';
import { notesApi } from './api/notes';
import { usersApi } from './api/users';
import { directoriesApi } from './api/directories';
import { authApi } from './api/auth';
import { filesApi } from './api/files';
import { searchApi } from './api/search';
import authReducer from "./slices/authSlice";
import itemsListsReducer from "./slices/itemsListsSlice";
import modalSwitcherReducer from "./slices/modalSwitcherSlice";

const createNoopStorage = () => {
  return {
    getAllKeys(_key: any) {
      return Promise.resolve([]);
    },
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve(null);
    },
  }
}
const storage = 
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage()

const rootReducer = combineReducers({
  modalSwitcher: modalSwitcherReducer,
  auth: authReducer,
  itemsLists: itemsListsReducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [clientsApi.reducerPath]: clientsApi.reducer,
  [dealsApi.reducerPath]: dealsApi.reducer,
  [notesApi.reducerPath]: notesApi.reducer,
  [directoriesApi.reducerPath]: directoriesApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [filesApi.reducerPath]: filesApi.reducer,
  [searchApi.reducerPath]: searchApi.reducer
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        usersApi.middleware,
        clientsApi.middleware,
        dealsApi.middleware,
        notesApi.middleware,
        directoriesApi.middleware,
        authApi.middleware,
        filesApi.middleware,
        searchApi.middleware
      )
})

export default store
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;