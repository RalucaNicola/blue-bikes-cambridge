import { createSlice } from '@reduxjs/toolkit';

export interface BasemapType {
    cartographic?: boolean;
}

const initialState = {
    cartographic: true
};

const basemapSlice = createSlice({
    name: 'basemapType',
    initialState,
    reducers: {
        toggleBasemap(state) {
            state.cartographic = !state.cartographic;
        }
    }
});

export const { toggleBasemap } = basemapSlice.actions;
export default basemapSlice.reducer;
