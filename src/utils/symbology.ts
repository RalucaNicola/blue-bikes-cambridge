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

export const getDonutChartImage = (bikeCount: number, totalCount: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    const total = totalCount + 10;
    const values = [bikeCount, total - bikeCount];
    const colors = [`rgba(${bikeColor.r}, ${bikeColor.g}, ${bikeColor.b}, 1)`, "rgba(120, 120, 120, 1)"];
    const distance = 7 * Math.PI / 180;
    let startAngle = distance;

    for (let i = 0; i < values.length; i++) {
        const endAngle = startAngle + (values[i] / total) * 2 * Math.PI - distance;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, startAngle, endAngle, false);
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 4, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        startAngle = endAngle + distance;
    }

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    ctx.fillStyle = '#006fc4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 35px Arial';
    ctx.fillText(bikeCount.toString(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
}