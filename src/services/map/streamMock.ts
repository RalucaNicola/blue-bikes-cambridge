import { Point, SpatialReference } from '@arcgis/core/geometry';
import Mesh from '@arcgis/core/geometry/Mesh';
import { lngLatToXY } from '@arcgis/core/geometry/support/webMercatorUtils';
import StreamLayer from '@arcgis/core/layers/StreamLayer';
import { SimpleRenderer } from '@arcgis/core/renderers';
import { LabelSymbol3D, SimpleMarkerSymbol, TextSymbol3DLayer } from '@arcgis/core/symbols';
import { DSVRowArray, csv } from 'd3';
import { AppDispatch, listenerMiddleware } from '../../store/storeConfiguration';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { barSymbol, bikeColor, bikeFeedRenderer, dockingColor, getLabelSymbol, overflowColor } from '../../utils/symbology';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import { setBikeTripsCount } from '../../store/bikeTripsSlice';
import MeshMaterialMetallicRoughness from '@arcgis/core/geometry/support/MeshMaterialMetallicRoughness';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import { setSelectedStation, setStations, updateStation } from '../../store/stationsSlice';
import { PayloadAction, UnsubscribeListener } from '@reduxjs/toolkit';
const unsubscribeListeners: UnsubscribeListener[] = [];
type DataArray = DSVRowArray<string>;
export type StationInformation = {
    stationID: string,
    hasKiosk: boolean,
    bikeCount: number,
    totalDocks: number,
    hasKeyDispenser: boolean,
    name: string,
    rentalMethods: Array<string>,
    lat?: number,
    lon?: number
}

export type StreamFeatureAttributes = {
    objectID: number,
    tripID: string,
    type: string,
    stationID: string,
    bikeCount: number,
    totalDocks: number,
}

export type StreamFeature = {
    attributes: StreamFeatureAttributes,
    geometry: {
        x: number,
        y: number
    }
}

const bikeStations = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
const dockingStations = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
const labelsStations = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });

const fetchCSV = async (dataUrl: string) => {
    try {
        const data = await csv(dataUrl);
        return data;
    } catch (error) {
        console.log(error);
    }
};

const bikeStreamLayer = new StreamLayer({
    objectIdField: 'objectID',
    purgeOptions: {
        ageReceived: 1,
    },
    fields: [
        {
            name: "objectID",
            alias: "objectID",
            type: "oid",
        },
        {
            name: "tripID",
            alias: "tripID",
            type: "string",
        },
    ],
    timeInfo: {
        trackIdField: "tripID"
    },
    geometryType: "point",
    popupTemplate: {
        title: "{status}",
        content: "{TRACKID}"
    },
    elevationInfo: {
        mode: "relative-to-scene"
    },
    renderer: bikeFeedRenderer,
    labelingInfo: [
        new LabelClass({
            labelExpressionInfo: {
                expression: `$feature.tripID + TextFormatting.NewLine`
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
            stationID: station.stationID,
            totalDocks: station.totalDocks
        },
        symbol: getLabelSymbol(station.totalDocks)
    });
    labelsStations.add(labelGraphic);
}

const createGraphics = (stationsInformation: Array<StationInformation>) => {
    stationsInformation.forEach(stationInformation => {
        const originPoint = new Point({
            x: stationInformation.lon,
            y: stationInformation.lat,
            spatialReference: {
                wkid: 4326,
            },
        });
        const bikeSize = getSizeFromValue(stationInformation.totalDocks);
        addBarGraphic(originPoint, bikeSize, stationInformation, bikeStations, bikeColor, true);
        addBarGraphic(originPoint, 0, stationInformation, dockingStations, dockingColor, false);
        addLabelGraphic(originPoint, bikeSize, stationInformation);
    });
}

const updateBarGraphics = (feature: StreamFeature) => {
    const { stationID, bikeCount } = feature.attributes;
    const bikeGraphic = bikeStations.graphics.find(graphic => {
        return graphic.attributes.stationID === stationID;
    });
    const { totalDocks } = bikeGraphic.attributes;
    const bikeHeight = getSizeFromValue(bikeCount);
    (bikeGraphic.geometry as Mesh).transform.scale = [1, 1, bikeHeight];

    (bikeGraphic.geometry as Mesh).components[0].material = new MeshMaterialMetallicRoughness({
        emissiveColor: [bikeColor.r, bikeColor.g, bikeColor.b],
    });
    const newBikeGeometry = bikeGraphic.geometry.clone();
    bikeGraphic.geometry = newBikeGeometry;

    const dockingGraphic = dockingStations.graphics.find(graphic => {
        return graphic.attributes.stationID === stationID;
    });
    if (bikeCount >= totalDocks) {
        dockingGraphic.visible = false;
    } else {
        const dockingHeight = getSizeFromValue(totalDocks - bikeCount);
        (dockingGraphic.geometry as Mesh).transform.scale = [1, 1, dockingHeight];
        (dockingGraphic.geometry as Mesh).transform.translation = [0, 0, bikeHeight];
        const newDockingGeometry = dockingGraphic.geometry.clone();
        dockingGraphic.geometry = newDockingGeometry;
        dockingGraphic.visible = true;
    }

}

const updateLabelGraphic = (feature: StreamFeature) => {
    const { bikeCount, stationID } = feature.attributes;
    const graphic = labelsStations.graphics.find(graphic => {
        return graphic.attributes.stationID === stationID;
    });
    graphic.symbol = getLabelSymbol(bikeCount);
    const value = Math.max(bikeCount, graphic.attributes.totalDocks);
    (graphic.geometry as Point).z = getSizeFromValue(value);
}

export const initializeStreamMock = (view: __esri.SceneView) => async (dispatch: AppDispatch) => {
    const data = await fetchCSV('./data/final_dataset_id.csv');
    const stations = await fetchCSV('./data/cambridge_bike_station_information.csv');
    const stationsInformation = stations.map(station => {
        return {
            stationID: station.shortName,
            totalDocks: parseInt(station.totalDocks),
            bikeCount: parseInt(station.totalDocks),
            hasKiosk: station.hasKiosk === "True",
            hasKeyDispenser: station.hasKeyDispenser === "True",
            name: station.name,
            rentalMethods: station.rentalMethods.split(","),
            lat: parseFloat(station.lat),
            lon: parseFloat(station.lon)
        }
    });
    createGraphics(stationsInformation);
    dispatch(setStations(stationsInformation));
    view.map.addMany([bikeStreamLayer, bikeStations, dockingStations, labelsStations]);

    view.whenLayerView(bikeStreamLayer).then((layerView) => {
        let i = 0;
        window.setInterval(() => {
            i = (i + 1) % data.length;
            const { objectID, tripID, type, stationID, longitude, latitude, bikeCount, totalDocks } = data[i];
            const coords = lngLatToXY(+longitude, +latitude);
            const feature: StreamFeature = {
                attributes: {
                    objectID: + objectID,
                    tripID,
                    type,
                    stationID,
                    bikeCount: +bikeCount,
                    totalDocks: +totalDocks
                },
                geometry: {
                    x: coords[0],
                    y: coords[1]
                }
            };
            if (type === 'bike_location') {
                bikeStreamLayer.sendMessageToClient({
                    type: "features",
                    features: [feature]
                });
                layerView.queryFeatureCount().then((count) => {
                    dispatch(setBikeTripsCount(count));
                });
            } else {
                updateBarGraphics(feature);
                updateLabelGraphic(feature);
                let station = stationsInformation.find(station => station.stationID === stationID);
                dispatch(updateStation({ ...station, bikeCount: feature.attributes.bikeCount }));
            }
        }, 100);
    });

    const zoomToStation = (param: PayloadAction<StationInformation>) => {
        if (param.payload) {
            const bikeGraphic = bikeStations.graphics.find(graphic => {
                return graphic.attributes.stationID === param.payload.stationID;
            });
            const dockingGraphic = dockingStations.graphics.find(graphic => {
                return graphic.attributes.stationID === param.payload.stationID;
            })
            view.goTo({ target: [bikeGraphic, dockingGraphic], zoom: 19 });
        }
    }

    view.on('click', (event) => {
        view.hitTest(event, { include: [bikeStations, dockingStations, labelsStations] }).then((response) => {
            const results = response.results as Array<__esri.GraphicHit>;
            if (results.length > 0 && results[0].graphic) {
                const station = stationsInformation.find(station => {
                    return station.stationID === results[0].graphic.attributes.stationID;
                });
                dispatch(setSelectedStation(station));
            }
        });
    });

    view.on('pointer-move', (event) => {
        view.hitTest(event, { include: [bikeStations, dockingStations, labelsStations] }).then((response) => {
            const results = response.results as Array<__esri.GraphicHit>;
            if (results.length > 0 && results[0].graphic) {
                // change cursor to pointer
                view.container.style.cursor = "pointer";
            } else {
                // change cursor to default
                view.container.style.cursor = "default";
            }
        });
    })
    const stationSelectionListener = { actionCreator: setSelectedStation, effect: zoomToStation };
    unsubscribeListeners.push(listenerMiddleware.startListening(stationSelectionListener));

}