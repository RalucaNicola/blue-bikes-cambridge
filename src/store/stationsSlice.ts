import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StationInformation } from '../services/map/stationFeed';

export interface RealTimeStationInformation extends StationInformation {
    time: Date;
    current_capacity: number;
}

export interface StationsSlice {
    notifyingStations: Array<RealTimeStationInformation>;
    selectedStation: RealTimeStationInformation;
}

const initialState: StationsSlice = {
    notifyingStations: [],
    selectedStation: null
};

const stationsSlice = createSlice({
    name: 'bikeTrips',
    initialState,
    reducers: {
        addNotifyingStation(state, param: PayloadAction<RealTimeStationInformation>) {
            const index = state.notifyingStations.findIndex(station => station.station_id === param.payload.station_id);
            if (index === -1) {
                state.notifyingStations = [...state.notifyingStations, param.payload];
            }
        },
        removeNotifyingStation(state, param: PayloadAction<RealTimeStationInformation>) {
            const index = state.notifyingStations.findIndex(station => station.station_id === param.payload.station_id);
            if (index !== -1) {
                state.notifyingStations = state.notifyingStations.splice(index, 1);
            }
        },
        setSelectedStation(state, param: PayloadAction<RealTimeStationInformation>) {
            state.selectedStation = param.payload;
        }
    }
});

export const { addNotifyingStation, removeNotifyingStation, setSelectedStation } = stationsSlice.actions;
export default stationsSlice.reducer;
