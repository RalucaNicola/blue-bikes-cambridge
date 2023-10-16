import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { csv } from 'd3';
import { DSVRowArray } from "d3";
import { Point } from "@arcgis/core/geometry";
import Mesh from "@arcgis/core/geometry/Mesh";
import Graphic from "@arcgis/core/Graphic";
import MeshMaterialMetallicRoughness from "@arcgis/core/geometry/support/MeshMaterialMetallicRoughness";
import { barSymbol, bikeColor, dockingColor, getLabelSymbol, overflowColor } from "../../utils/symbology";
import Color from "@arcgis/core/Color";
import { addNotifyingStation, removeNotifyingStation } from "../../store/stationsSlice";
import { store } from "../../store/storeConfiguration";

const stationFeed = new StreamLayer({
    url: "https://us-iot.arcgis.com/d8avj4l9dv7mdfsa/d8avj4l9dv7mdfsa/streams/arcgis/rest/services/station_bike_capacity_0720/StreamServer",
});

const bikeBarsLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
const dockingBarsLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
const labelsLayer = new GraphicsLayer();
let connection: __esri.StreamConnection = null;

type DataArray = DSVRowArray<string>;
export type StationInformation = {
    station_id: string,
    has_kiosk: boolean,
    capacity: number,
    has_key_dispenser: boolean,
    name: string,
    rental_methods: Array<string>,
    lat?: number,
    lon?: number
}

const fetchStationsData = async () => {
    try {
        const stations = await csv('./data/cambridge_bike_station_information.csv');
        return stations;
    } catch (error) {
        console.log(error);
    }
};

const getSizeFromValue = (value: number) => {
    const stops = [
        { value: 0, size: 5 },
        { value: 130, size: 300 },
    ];
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (value < stop.value) {
            if (i === 0) {
                return stop.size;
            }
            const prev = stops[i - 1];
            const weight = (value - prev.value) / (stop.value - prev.value);
            return prev.size + Math.abs((stop.size - prev.size) * weight);
        }
    }
    return stops[stops.length - 1].size;
}

const getGeometry = (origin: Point, size: number, color: __esri.Color, gradient: boolean) => {
    const geometry = Mesh.createCylinder(origin, {
        size: { height: 1, width: 15, depth: 15 },
        //@ts-ignore
        useTransform: true,
        geographic: true,
        densificationFactor: 2,
    });
    geometry.transform.scale = [1, 1, size];
    geometry.components[0].material = new MeshMaterialMetallicRoughness({
        emissiveColor: [color.r, color.g, color.b],
    });
    const coordinateColors = [];
    const topColor = gradient ? [30, 30, 30, 255] : [30, 30, 30, 150];
    const baseColor = gradient ? [255, 255, 255, 50] : [30, 30, 30, 150];

    const vertexNo = geometry.vertexAttributes.position.length / 3;

    for (let i = 0; i < vertexNo; i++) {
        if (i < vertexNo / 2) {
            coordinateColors.push(topColor);
        } else {
            coordinateColors.push(baseColor);
        }
    }

    const colorVertices = Uint8Array.from(coordinateColors.flat());
    geometry.vertexAttributes.color = colorVertices;
    return geometry;
};

const addBarGraphic = (originPoint: __esri.Point, size: number, station: StationInformation, layer: GraphicsLayer, color: Color, gradient: boolean) => {
    const graphic = new Graphic({
        geometry: getGeometry(originPoint, size, color, gradient),
        attributes: {
            ...station,
            size
        },
        symbol: barSymbol
    });
    if (!gradient) {
        graphic.visible = false;
    }
    layer.graphics.push(graphic);
}

const addLabelGraphic = (origin: Point, size: number, station: StationInformation) => {
    const labelGraphic = new Graphic({
        geometry: new Point({
            x: origin.x,
            y: origin.y,
            z: size,
            spatialReference: {
                wkid: 4326,
            },
        }),
        attributes: {
            station_id: station.station_id,
            capacity: station.capacity,
        },
        symbol: getLabelSymbol(0, station.capacity)
    });
    labelsLayer.add(labelGraphic);
}

const createGraphics = (stations: DataArray) => {
    stations.forEach(station => {
        const stationInformation: StationInformation = {
            station_id: station.short_name,
            capacity: parseInt(station.capacity),
            has_kiosk: station.has_kiosk === "True",
            has_key_dispenser: station.has_key_dispenser === "True",
            name: station.name,
            rental_methods: station.rental_methods.split(","),
            lat: parseFloat(station.lat),
            lon: parseFloat(station.lon)
        }
        const originPoint = new Point({
            x: stationInformation.lon,
            y: stationInformation.lat,
            spatialReference: {
                wkid: 4326,
            },
        });
        const bikeSize = getSizeFromValue(stationInformation.capacity);
        addBarGraphic(originPoint, bikeSize, stationInformation, bikeBarsLayer, bikeColor, true);
        addBarGraphic(originPoint, 0, stationInformation, dockingBarsLayer, dockingColor, false);
        addLabelGraphic(originPoint, bikeSize, stationInformation);
    });
}

export const initializeStations = async (view: __esri.SceneView) => {
    view.map.addMany([bikeBarsLayer, dockingBarsLayer, labelsLayer]);
    const stations = await fetchStationsData();
    createGraphics(stations);
    initializeStationFeed();
}

export const destroyStations = (view: __esri.SceneView) => {
    view.map.removeMany([
        bikeBarsLayer,
        dockingBarsLayer
        //labelsLayer
    ]);
    stopStationFeed();
}

const updateBarGraphics = (feature: __esri.Graphic) => {
    const { station_id, current_capacity } = feature.attributes;
    const bikeGraphic = bikeBarsLayer.graphics.find(graphic => {
        return graphic.attributes.station_id === station_id;
    });
    const { capacity } = bikeGraphic.attributes;
    const bikeHeight = getSizeFromValue(current_capacity);
    (bikeGraphic.geometry as Mesh).transform.scale = [1, 1, bikeHeight];
    if (current_capacity > capacity) {
        (bikeGraphic.geometry as Mesh).components[0].material = new MeshMaterialMetallicRoughness({
            emissiveColor: [overflowColor.r, overflowColor.g, overflowColor.b],
        });
    } else {
        (bikeGraphic.geometry as Mesh).components[0].material = new MeshMaterialMetallicRoughness({
            emissiveColor: [bikeColor.r, bikeColor.g, bikeColor.b],
        });
    }
    const newBikeGeometry = bikeGraphic.geometry.clone();
    bikeGraphic.geometry = newBikeGeometry;

    const dockingGraphic = dockingBarsLayer.graphics.find(graphic => {
        return graphic.attributes.station_id === station_id;
    });
    if (current_capacity >= capacity) {
        //(dockingGraphic.geometry as Mesh).transform.scale = [1, 1, 0];
        dockingGraphic.visible = false;
    } else {
        const dockingHeight = getSizeFromValue(capacity - current_capacity);
        (dockingGraphic.geometry as Mesh).transform.scale = [1, 1, dockingHeight];
        (dockingGraphic.geometry as Mesh).transform.translation = [0, 0, bikeHeight];
        const newDockingGeometry = dockingGraphic.geometry.clone();
        dockingGraphic.geometry = newDockingGeometry;
        dockingGraphic.visible = true;
    }

}

const updateLabelGraphic = (feature: __esri.Graphic) => {
    const { current_capacity, time, station_id } = feature.attributes;
    const graphic = labelsLayer.graphics.find(graphic => {
        return graphic.attributes.station_id === station_id;
    });
    graphic.symbol = getLabelSymbol(time, current_capacity);
    const value = Math.max(current_capacity, graphic.attributes.capacity);
    (graphic.geometry as Point).z = getSizeFromValue(value);
}

const initializeStationFeed = async () => {
    console.log("station feed initialized");

    const parameters = stationFeed.createConnectionParameters();
    const connection = await stationFeed.connect(parameters);
    //@ts-ignore
    connection.on("data-received", (feature) => {
        updateBarGraphics(feature);
        updateLabelGraphic(feature);
        const { current_capacity, time, station_id, total_capacity } = feature.attributes;
        const bikeGraphic = bikeBarsLayer.graphics.find(graphic => {
            return graphic.attributes.station_id === station_id;
        });

        const attributes = { ...bikeGraphic.attributes, current_capacity, time }
        if ((current_capacity > total_capacity) || (current_capacity < 0)) {
            store.dispatch(addNotifyingStation(attributes));
        } else {
            store.dispatch(removeNotifyingStation(attributes));
        }

    });
}

const stopStationFeed = () => {
    console.log("station feed stopped");
    // close the connection when it is not needed anymore
    connection.destroy();
}