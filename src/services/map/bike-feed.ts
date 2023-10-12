import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { bikeFeedRenderer } from "../../utils/renderers";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { LabelSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";

const bikeFeed = new StreamLayer({
    url: "https://us-iot.arcgis.com/d8avj4l9dv7mdfsa/d8avj4l9dv7mdfsa/streams/arcgis/rest/services/Routes/StreamServer",
    elevationInfo: {
        mode: "relative-to-scene"
    },
    renderer: bikeFeedRenderer,
    labelingInfo: [
        new LabelClass({
            labelExpressionInfo: {
                expression: `$feature.Name + TextFormatting.NewLine + "Started at: " + Hour($feature.Time) + ":" + Minute($feature.Time) + TextFormatting.NewLine`
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

export const addBikeFeedToMap = (view: __esri.SceneView) => {
    view.map.add(bikeFeed);
}

export const removeBikeFeedFromMap = (view: __esri.SceneView) => {
    view.map.remove(bikeFeed);
}