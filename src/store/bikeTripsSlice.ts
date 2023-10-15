import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface BikeTrips {
    currentCount: number;
}

const initialState = {
    currentCount: 0
};

const bikeTripsSlice = createSlice({
    name: 'bikeTrips',
    initialState,
    reducers: {
        setBikeTripsCount(state, param: PayloadAction<number>) {
            console.log("Changing current count in state", param.payload);
            state.currentCount = param.payload;
        }
    }
});

export const { setBikeTripsCount } = bikeTripsSlice.actions;
export default bikeTripsSlice.reducer;
