import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import loadingReducer from './loadingSlice';
import errorReducer from './errorSlice';
import authenticationReducer from './authenticationSlice';
import modalOptionsReducer from './modalSlice';
import basemapReducer from './basemapSlice';
import bikeTripsReducer from './bikeTripsSlice';
import stationsReducer from './stationsSlice';
import accidentsReducer from './accidentsSlice';

const rootReducer = combineReducers({
  basemapType: basemapReducer,
  authentication: authenticationReducer,
  error: errorReducer,
  loading: loadingReducer,
  infoModal: modalOptionsReducer,
  bikeTrips: bikeTripsReducer,
  stations: stationsReducer,
  accidents: accidentsReducer
});

export const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
