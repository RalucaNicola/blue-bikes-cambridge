import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { csv } from 'd3';
import { DSVRowArray } from "d3";
import { Point } from "@arcgis/core/geometry";
import Mesh from "@arcgis/core/geometry/Mesh";
import Graphic from "@arcgis/core/Graphic";
import MeshMaterialMetallicRoughness from "@arcgis/core/geometry/support/MeshMaterialMetallicRoughness";
import { barSymbol, bikeColor, getLabelSymbol } from "../../utils/symbology";

const stationFeed = new StreamLayer({
    url: "https://us-iot.arcgis.com/d8avj4l9dv7mdfsa/d8avj4l9dv7mdfsa/streams/arcgis/rest/services/station_bike_capacity_0720/StreamServer",
});

const capacityBarsLayer = new GraphicsLayer();
const labelsLayer = new GraphicsLayer();
let connection: __esri.StreamConnection = null;

type DataArray = DSVRowArray<string>;
type StationInformation = {
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

const getGeometry = (origin: Point, size: number, color: __esri.Color) => {
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
    const topColor = [30, 30, 30, 255];
    const baseColor = [255, 255, 255, 50];

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

const addBarGraphic = (originPoint: __esri.Point, size: number, station: StationInformation) => {
    capacityBarsLayer.graphics.push(new Graphic({
        geometry: getGeometry(originPoint, size, bikeColor),
        attributes: {
            ...station,
            size
        },
        symbol: barSymbol
    }));
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
            station_id: station.station_id
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
        const size = getSizeFromValue(stationInformation.capacity);
        addBarGraphic(originPoint, size, stationInformation);
        addLabelGraphic(originPoint, size, stationInformation);
    });
}

export const initializeStations = async (view: __esri.SceneView) => {
    view.map.addMany([capacityBarsLayer, labelsLayer]);
    const stations = await fetchStationsData();
    createGraphics(stations);
    initializeStationFeed();
}

export const destroyStations = (view: __esri.SceneView) => {
    view.map.removeMany([capacityBarsLayer, labelsLayer]);
    stopStationFeed();
}

const updateBarGraphic = (feature: __esri.Graphic) => {
    const graphic = capacityBarsLayer.graphics.find(graphic => {
        return graphic.attributes.station_id === feature.attributes.station_id;
    });
    const nextSize = getSizeFromValue(feature.attributes.current_capacity);
    (graphic.geometry as Mesh).transform.scale = [1, 1, nextSize];
    //@ts-ignore
    graphic.notifyMeshTransformChanged({ action: 0 });
}

const updateLabelGraphic = (feature: __esri.Graphic) => {
    const graphic = labelsLayer.graphics.find(graphic => {
        return graphic.attributes.station_id === feature.attributes.station_id;
    });
    graphic.symbol = getLabelSymbol(feature.attributes.time, feature.attributes.current_capacity);
    (graphic.geometry as Point).z = getSizeFromValue(feature.attributes.current_capacity);
}

const initializeStationFeed = async () => {
    console.log("station feed initialized");

    // get layer's connection configurations
    const parameters = stationFeed.createConnectionParameters();

    const connection = await stationFeed.connect(parameters);

    // listen to date-received event once the connection is established
    // create a graphic from the JSON object returned and add them to view
    //@ts-ignore
    connection.on("data-received", (feature) => {
        updateBarGraphic(feature);
        updateLabelGraphic(feature);
    });


}

const stopStationFeed = () => {
    console.log("station feed stopped");
    // close the connection when it is not needed anymore
    connection.destroy();
}