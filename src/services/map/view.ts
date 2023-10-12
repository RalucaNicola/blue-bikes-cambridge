import PortalItem from '@arcgis/core/portal/PortalItem';
import WebScene from '@arcgis/core/WebScene';
import { mapConfig } from '../../config';
import { AppDispatch } from '../../store/storeConfiguration';
import { setViewLoaded } from '../../store/loadingSlice';
import { getMapCenterFromHashParams } from '../../utils/URLHashParams';
import { setError } from '../../store/errorSlice';
import { initializeViewEventListeners } from './eventListeners';
import SceneView from '@arcgis/core/views/SceneView';
import { addBikeFeedToMap, removeBikeFeedFromMap } from './bike-feed';

let view: __esri.SceneView = null;

export function getView() {
    return view;
}

export function destroyView() {
    if (view) {
        removeBikeFeedFromMap(view);
        view.destroy();
        view = null;
    }
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
            padding: {
                top: 50,
                bottom: 0
            },
            ui: {
                components: []
            },
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false
                },
                highlightEnabled: false,
                defaultPopupTemplateEnabled: false,
                autoOpenEnabled: false
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
            dispatch(initializeViewEventListeners());
            addBikeFeedToMap(view);
        });
    } catch (error) {
        const { message } = error;
        dispatch(setError({ name: 'Error on map', message: message }));
    }
};
