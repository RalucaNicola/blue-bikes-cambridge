import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { bikeFeedRenderer } from "../../utils/symbology";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { LabelSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import { debounce } from "../../utils/utilities";
import { AppDispatch } from "../../store/storeConfiguration";
import { setBikeTripsCount } from "../../store/bikeTripsSlice";

const bikeFeed = new StreamLayer({
    url: "https://us-iot.arcgis.com/d8avj4l9dv7mdfsa/d8avj4l9dv7mdfsa/streams/arcgis/rest/services/bike_trips_07_20/StreamServer",
    elevationInfo: {
        mode: "relative-to-scene"
    },
    renderer: bikeFeedRenderer,
    updateInterval: 2000,
    purgeOptions: {
        ageReceived: 1
    },
    labelingInfo: [
        new LabelClass({
            labelExpressionInfo: {
                expression: `$feature.Name + TextFormatting.NewLine + Hour($feature.Time) + ":" + Minute($feature.Time) + TextFormatting.NewLine`
            },
            labelPlacement: "center-right",
            symbol: new LabelSymbol3D({
                symbolLayers: [new TextSymbol3DLayer({
                    material: {
                        color: "#03a9fc"
                    },
                    halo: {
                        size: 1,
                        color: [255, 255, 255, 0.8]
                    },
                    font: {
                        size: 8,
                        family: "sans-serif",
                        weight: "bold"
                    }
                })]
            })
        })
    ]
});

let bikeFeedLayerView: __esri.StreamLayerView = null;




export const initializeBikeFeed = (view: __esri.SceneView) => async (dispatch: AppDispatch) => {
    console.log(crypto.getRandomValues(new Uint32Array(1))[0]);
    addBikeFeedToMap(view);
    bikeFeedLayerView = await view.whenLayerView(bikeFeed);
    const updateBikeTripsCount = debounce(() => {
        bikeFeedLayerView.queryFeatureCount().then((count) => {
            dispatch(setBikeTripsCount(count));
        });
    }, 200)
    bikeFeedLayerView.on("data-received", (event) => updateBikeTripsCount());
}

const addBikeFeedToMap = (view: __esri.SceneView) => {
    view.map.add(bikeFeed);
}

export const removeBikeFeedFromMap = (view: __esri.SceneView) => {
    view.map.remove(bikeFeed);
}