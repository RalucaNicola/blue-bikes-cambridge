import { SimpleRenderer } from "@arcgis/core/renderers";
import { IconSymbol3DLayer, PointSymbol3D } from "@arcgis/core/symbols";

export const bikeFeedRenderer = new SimpleRenderer({
    symbol: new PointSymbol3D({
        symbolLayers: [new IconSymbol3DLayer({
            resource: {
                href: "./assets/biker-flag.png"
            },
            size: 35,
            anchor: "bottom-left",
            // material: {
            //     color: "#03a9fc"
            // }
        })]
    })
})