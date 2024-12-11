import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TList = {
    sortby?: 'asc' | 'desc'
    tpl?: string,
    userPageList?: string
}

const initialState: TList = {
    sortby: 'asc',
    tpl: 'table',
    userPageList: 'clients'
}

export const itemsListsSlice = createSlice({
    name: 'itemsListsSwitcher',
    initialState,
    reducers: {
        changeSortDir(state, action: PayloadAction<TList>){
            state.sortby = action.payload.sortby
        },
        changeItemsTpl(state, action: PayloadAction<TList>){
            state.tpl = action.payload.tpl
        },
        changeUserPageList(state, action: PayloadAction<TList>){
            state.userPageList = action.payload.userPageList
        }

    }
})

export const { changeSortDir, changeItemsTpl, changeUserPageList } = itemsListsSlice.actions
export default itemsListsSlice.reducer