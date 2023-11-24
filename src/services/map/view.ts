import PortalItem from '@arcgis/core/portal/PortalItem';
import WebScene from '@arcgis/core/WebScene';
import { mapConfig } from '../../config';
import { AppDispatch, RootState, listenerMiddleware, store } from '../../store/storeConfiguration';
import { setViewLoaded } from '../../store/loadingSlice';
import { getMapCenterFromHashParams } from '../../utils/URLHashParams';
import { setError } from '../../store/errorSlice';
import { initializeViewEventListeners } from './eventListeners';
import SceneView from '@arcgis/core/views/SceneView';
import { initializeBikeFeed, removeBikeFeedFromMap } from './bikeFeed';
import { destroyStations, initializeStationFeed, initializeStations } from './stationFeed';
import { toggleBasemap } from '../../store/basemapSlice';
import { UnsubscribeListener } from '@reduxjs/toolkit';
import { initializeHistoricalLayers, removeHistoricalListeners } from './historicalLayers';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { initializeStreamMock } from './streamMock';

let view: __esri.SceneView = null;
let cartographicBasemap: __esri.GroupLayer = null;
let realisticBasemap: __esri.GroupLayer = null;

const unsubscribeListeners: UnsubscribeListener[] = [];

export function getView() {
    return view;
}

export function destroyView() {
    if (view) {
        removeBikeFeedFromMap(view);
        removeStoreListeners();
        removeHistoricalListeners();
        destroyStations(view);
        view.destroy();
        view = null;
    }
}

const updateBasemap = () => {
    const cartographic = (store.getState() as RootState).basemapType.cartographic;
    realisticBasemap.visible = !cartographic;
    cartographicBasemap.visible = cartographic;
}

export const initializeView = (divRef: HTMLDivElement) => async (dispatch: AppDispatch) => {
    try {
        const portalItem = new PortalItem({
            id: mapConfig['web-map-id']
        });

        await portalItem.load();
        const webmap = new WebScene({
            portalItem: portalItem
        });
        await webmap.load();

        view = new SceneView({
            container: divRef,
            map: webmap,
            ui: {
                components: ["zoom"]
            },
            popup: {
                dockEnabled: false,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false
                },
                highlightEnabled: false,
                defaultPopupTemplateEnabled: false
            }
        });
        view.popup.defaultPopupTemplateEnabled = true;

        await view.when(() => {
            dispatch(setViewLoaded(true));
            const mapCenter = getMapCenterFromHashParams();
            if (mapCenter) {
                view.goTo({ zoom: mapCenter.zoom, center: [mapCenter.center.lon, mapCenter.center.lat] });
            }
            //@ts-ignore
            window.view = view;
            cartographicBasemap = view.map.layers.find(layer => layer.title === 'Cartographic base layers') as __esri.GroupLayer;
            realisticBasemap = view.map.layers.find(layer => layer.title === 'Realistic base layers') as __esri.GroupLayer;
            dispatch(initializeViewEventListeners());
            dispatch(initializeStreamMock(view));
            // initializeStations(view);
            //initializeStationFeed();
            initializeHistoricalLayers(view);
            const basemapListener = { actionCreator: toggleBasemap, effect: updateBasemap };
            unsubscribeListeners.push(listenerMiddleware.startListening(basemapListener));
        });
    } catch (error) {
        const { message } = error;
        dispatch(setError({ name: 'Error on map', message: message }));
    }
};


const removeStoreListeners = () => {
    unsubscribeListeners.forEach(unsubscribe => {
        unsubscribe({ cancelActive: true });
    });
}