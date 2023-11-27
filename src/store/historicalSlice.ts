import { createSlice } from '@reduxjs/toolkit';
import { ConstructionSite } from '../types/types';

export interface HistoricalState {
    accidentsLayerVisible?: boolean;
    routesLayerVisible?: boolean;
    constructionsLayerVisible?: boolean;
    constructionSites: Array<ConstructionSite>;
}

const initialState: HistoricalState = {
    accidentsLayerVisible: false,
    routesLayerVisible: false,
    constructionsLayerVisible: false,
    constructionSites: []
};

const historicalSlice = createSlice({
    name: 'historical',
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
        },
        setConstructionSites(state, action) {
            state.constructionSites = action.payload;
        }
    }
});

export const { toggleAccidentsLayer, toggleRoutesLayer, toggleConstructionsLayer, setConstructionSites } = historicalSlice.actions;
export default historicalSlice.reducer;