import StreamLayer from "@arcgis/core/layers/StreamLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { LabelSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";

const stationFeed = new StreamLayer({
    url: "https://us-iot.arcgis.com/d8avj4l9dv7mdfsa/d8avj4l9dv7mdfsa/streams/arcgis/rest/services/station_bike_capacity_0720/StreamServer",
});

export const initializeStationFeed = (view: __esri.SceneView) => {
    console.log("station feed initialized");
}

export const stopStationFeed = (view: __esri.SceneView) => {
    console.log("station feed stopped");
}