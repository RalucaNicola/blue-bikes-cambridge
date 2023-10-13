import Color from "@arcgis/core/Color";
import { SimpleRenderer } from "@arcgis/core/renderers";
import { FillSymbol3DLayer, IconSymbol3DLayer, MeshSymbol3D, PointSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import { formatNumber } from "./utilities";

export const bikeColor = new Color("#03a9fc");

export const bikeFeedRenderer = new SimpleRenderer({
    symbol: new PointSymbol3D({
        symbolLayers: [new IconSymbol3DLayer({
            resource: {
                href: "./assets/biker-flag.png"
            },
            size: 35,
            anchor: "bottom-left",
        })]
    })
})

export const barSymbol = new MeshSymbol3D({
    symbolLayers: [
        new FillSymbol3DLayer({
            material: { color: [255, 255, 255, 1] },
        }),
    ],
});

export const getLabelSymbol = (date: number, label: number) => {

    const text = new Date(date).getHours() + ":" + new Date(date).getMinutes();
    return new PointSymbol3D({
        symbolLayers: [
            new TextSymbol3DLayer({
                material: { color: [255, 255, 255] },
                background: {
                    color: [bikeColor.r, bikeColor.g, bikeColor.b, 0.3]
                },
                font: {
                    weight: "bold",
                },
                size: 9,
                text: `${formatNumber(Math.floor(label))} - ${text}`
            }),
        ],
        verticalOffset: {
            screenLength: 20,
            maxWorldLength: 500,
            minWorldLength: 5,
        },
        callout: {
            type: "line",
            size: 0.5,
            color: bikeColor,
            border: {
                color: [0, 0, 0, 0],
            },
        },
    });
}