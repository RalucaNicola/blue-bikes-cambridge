import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StationInformation } from '../services/map/streamMock';

export interface StationsSlice {
    stations: Array<StationInformation>;
    selectedStation: StationInformation;
}

const initialState: StationsSlice = {
    stations: [],
    selectedStation: null
};

const stationsSlice = createSlice({
    name: 'bikeTrips',
    initialState,
    reducers: {
        setStations(state, param: PayloadAction<Array<StationInformation>>) {
            state.stations = param.payload;
        },
        updateStation(state, param: PayloadAction<StationInformation>) {
            state.stations = state.stations.map(station => {
                if (station.stationID === param.payload.stationID) {
                    return param.payload;
                }
                return station;
            });
        },
        setSelectedStation(state, param: PayloadAction<StationInformation>) {
            if (param.payload) {
                state.selectedStation = state.stations.find(station => station.stationID === param.payload.stationID);
            }
            else {
                state.selectedStation = param.payload;
            }
        }
    }
});

export const { setStations, updateStation, setSelectedStation } = stationsSlice.actions;
export default stationsSlice.reducer;
