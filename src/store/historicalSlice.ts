import { createSlice } from '@reduxjs/toolkit';

export interface BasemapType {
    accidentsLayerVisible?: boolean;
    routesLayerVisible?: boolean;
    constructionsLayerVisible?: boolean;
}

const initialState = {
    accidentsLayerVisible: false,
    routesLayerVisible: false,
    constructionsLayerVisible: false
};

const historicalSlice = createSlice({
    name: 'basemapType',
    initialState,
    reducers: {
        toggleAccidentsLayer(state) {
            state.accidentsLayerVisible = !state.accidentsLayerVisible;
        },
        toggleRoutesLayer(state) {
            state.routesLayerVisible = !state.routesLayerVisible;
        },
        toggleConstructionsLayer(state) {
            state.constructionsLayerVisible = !state.constructionsLayerVisible;
        }
    }
});

export const { toggleAccidentsLayer, toggleRoutesLayer, toggleConstructionsLayer } = historicalSlice.actions;
export default historicalSlice.reducer;