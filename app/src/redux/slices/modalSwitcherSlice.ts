import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TModalSwitcher = {
    open: boolean,
    modalName: string
    itemId: number | null
}

const initialState: TModalSwitcher = {
    open: false,
    modalName: '',
    itemId: null
}

export const modalSwitcherSlice = createSlice({
    name: 'modalSwitcher',
    initialState,
    reducers: {
        modalSwitch(state, action: PayloadAction<TModalSwitcher>){
            state.open = action.payload.open
            state.modalName = action.payload.modalName
            state.itemId = action.payload.itemId
        }
    }
})

export const { modalSwitch } = modalSwitcherSlice.actions
export default modalSwitcherSlice.reducer