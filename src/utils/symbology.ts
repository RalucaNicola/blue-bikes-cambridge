import Color from "@arcgis/core/Color";
import { SimpleRenderer } from "@arcgis/core/renderers";
import { FillSymbol3DLayer, IconSymbol3DLayer, MeshSymbol3D, PointSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import { formatNumber } from "./utilities";

export const bikeColor = new Color("#03a9fc");
export const overflowColor = new Color("#ff9800");
export const dockingColor = new Color("#22e078");
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

export const getLabelSymbol = (label: number) => {

    return new PointSymbol3D({
        symbolLayers: [
            new TextSymbol3DLayer({
                material: { color: [255, 255, 255] },
                background: {
                    color: [50, 50, 50, 0.6]
                },
                size: 7,
                text: `${formatNumber(Math.floor(label))}`
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
            color: [50, 50, 50, 0.6],
            border: {
                color: [0, 0, 0, 0],
            },
        },
    });
}