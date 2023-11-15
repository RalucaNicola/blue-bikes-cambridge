import { toggleAccidentsLayer } from "../../store/accidentsSlice";
import { UnsubscribeListener } from '@reduxjs/toolkit';
import { RootState, listenerMiddleware, store } from "../../store/storeConfiguration";

let accidentsLayer: __esri.FeatureLayer = null;
const unsubscribeListeners: UnsubscribeListener[] = [];

const updateVisibility = () => {
    const accidentsLayerVisible = (store.getState() as RootState).accidents.accidentsLayerVisible;
    console.log(accidentsLayerVisible)
    accidentsLayer.visible = accidentsLayerVisible;
}

export const initializeAccidentsLayer = (view: __esri.SceneView) => {
    accidentsLayer = view.map.findLayerById("18bd539790a-layer-98") as __esri.FeatureLayer;
    const accidentsVisibilityListener = { actionCreator: toggleAccidentsLayer, effect: updateVisibility };
    unsubscribeListeners.push(listenerMiddleware.startListening(accidentsVisibilityListener));
}

export const removeAccidentsListeners = () => {
    unsubscribeListeners.forEach(unsubscribe => unsubscribe({ cancelActive: true }));
}