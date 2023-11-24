import { toggleAccidentsLayer, toggleConstructionsLayer, toggleRoutesLayer } from "../../store/historicalSlice";
import { UnsubscribeListener } from '@reduxjs/toolkit';
import { RootState, listenerMiddleware, store } from "../../store/storeConfiguration";

let accidentsLayer: __esri.FeatureLayer = null;
let constructionsLayer: __esri.GroupLayer = null;
let routesLayerWithConstructions: __esri.GroupLayer = null;
let routesLayerWithoutConstructions: __esri.GroupLayer = null;
const unsubscribeListeners: UnsubscribeListener[] = [];

const updateAccidentsVisibility = () => {
    const accidentsLayerVisible = (store.getState() as RootState).historical.accidentsLayerVisible;
    accidentsLayer.visible = accidentsLayerVisible;
}

const updateConstructionVisibility = () => {
    const constructionsLayerVisible = (store.getState() as RootState).historical.constructionsLayerVisible;
    const routesLayerVisible = (store.getState() as RootState).historical.routesLayerVisible;
    if (constructionsLayerVisible) {
        routesLayerWithConstructions.visible = routesLayerVisible;
        routesLayerWithoutConstructions.visible = false;
        constructionsLayer.visible = constructionsLayerVisible;
    } else {
        routesLayerWithConstructions.visible = false;
        routesLayerWithoutConstructions.visible = routesLayerVisible;
        constructionsLayer.visible = false;
    }
}

const updateRoutesVisibility = () => {
    const constructionsLayerVisible = (store.getState() as RootState).historical.constructionsLayerVisible;
    const routesLayerVisible = (store.getState() as RootState).historical.routesLayerVisible;
    if (constructionsLayerVisible) {
        routesLayerWithConstructions.visible = routesLayerVisible;
        routesLayerWithoutConstructions.visible = false;
        constructionsLayer.visible = constructionsLayerVisible;
    } else {
        routesLayerWithConstructions.visible = false;
        routesLayerWithoutConstructions.visible = routesLayerVisible;
        constructionsLayer.visible = false;
    }
}

export const initializeHistoricalLayers = (view: __esri.SceneView) => {
    accidentsLayer = view.map.findLayerById("18bd7b789d5-layer-100") as __esri.FeatureLayer;
    const accidentsVisibilityListener = { actionCreator: toggleAccidentsLayer, effect: updateAccidentsVisibility };
    unsubscribeListeners.push(listenerMiddleware.startListening(accidentsVisibilityListener));

    routesLayerWithConstructions = view.map.findLayerById("18b00184556-layer-118") as __esri.GroupLayer;
    routesLayerWithoutConstructions = view.map.findLayerById("18c01a36557-layer-107") as __esri.GroupLayer;
    constructionsLayer = view.map.findLayerById("18c01fb12c8-layer-80") as __esri.GroupLayer;
    const routesVisibilityListener = { actionCreator: toggleRoutesLayer, effect: updateRoutesVisibility };
    unsubscribeListeners.push(listenerMiddleware.startListening(routesVisibilityListener));
    const constructionsVisibilityListener = { actionCreator: toggleConstructionsLayer, effect: updateConstructionVisibility };
    unsubscribeListeners.push(listenerMiddleware.startListening(constructionsVisibilityListener));

}

export const removeHistoricalListeners = () => {
    unsubscribeListeners.forEach(unsubscribe => unsubscribe({ cancelActive: true }));
}