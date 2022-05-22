import { makeOffscreenBuffer } from "shapez/core/buffer_utils";
import { globalConfig } from "shapez/core/config";
import { Loader } from "shapez/core/loader";
import { HUDWiresOverlay } from "shapez/game/hud/parts/wires_overlay";

const wiresBackgroundDpi = 4;

export function replaceHUDWiresOverlay(modInterface) {
    modInterface.replaceMethod(
        HUDWiresOverlay,
        "generateTilePattern",
        /** @this  HUDWiresOverlay*/
        function () {
            const overlayTile = Loader.getSprite("sprites/wires/overlay_tile.png");
        const dims = globalConfig.tileSize * wiresBackgroundDpi;
        const [canvas, context] = makeOffscreenBuffer(dims, dims, {
            smooth: false,
            reusable: false,
            label: "wires-tile-pattern",
        });
        context.clearRect(0, 0, dims, dims);
        // overlayTile.draw(context, 0, 0, dims, dims);
        this.tilePatternCanvas = canvas;
        }
    );

    modInterface.replaceMethod(
        HUDWiresOverlay,
        "draw",
        /** @this  HUDWiresOverlay*/
        function ($original, [parameters]) {
            if (this.currentAlpha < 0.02) {
                return;
            }
    
            const hasTileGrid = !this.root.app.settings.getAllSettings().disableTileGrid;
            if (hasTileGrid && !this.cachedPatternBackground) {
                this.cachedPatternBackground = parameters.context.createPattern(this.tilePatternCanvas, "repeat");
            }
    
            const bounds = parameters.visibleRect;
    
            parameters.context.globalAlpha = this.currentAlpha;
    
            const scaleFactor = 1 / wiresBackgroundDpi;
            parameters.context.globalCompositeOperation = "overlay";
            parameters.context.fillStyle = "rgba(0,0,0,0)";
            parameters.context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
            parameters.context.globalCompositeOperation = "source-over";
    
            parameters.context.scale(scaleFactor, scaleFactor);
            parameters.context.fillStyle = hasTileGrid
                ? this.cachedPatternBackground
                : "rgba(0,0,0,0)";
            parameters.context.fillRect(
                bounds.x / scaleFactor,
                bounds.y / scaleFactor,
                bounds.w / scaleFactor,
                bounds.h / scaleFactor
            );
            parameters.context.scale(1 / scaleFactor, 1 / scaleFactor);
    
            parameters.context.globalAlpha = 1;
        }
    );
}
