import { createSlice } from '@reduxjs/toolkit';

export interface BasemapType {
    accidentsLayerVisible?: boolean;
}

const initialState = {
    accidentsLayerVisible: false
};

const accidentsSlice = createSlice({
    name: 'basemapType',
    initialState,
    reducers: {
        toggleAccidentsLayer(state) {
            state.accidentsLayerVisible = !state.accidentsLayerVisible;
        }
    }
});

export const { toggleAccidentsLayer } = accidentsSlice.actions;
export default accidentsSlice.reducer;