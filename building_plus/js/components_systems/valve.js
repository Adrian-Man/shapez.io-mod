import { StorageComponent } from "shapez/game/components/storage";
import { Loader } from "shapez/core/loader";
import { formatBigNumber, lerp } from "shapez/core/utils";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";
import { isTrueItem } from "shapez/game/items/boolean_item";
import { MapChunkView } from "shapez/game/map_chunk_view";

export class ValveComponent extends StorageComponent {
    static getId() {
        return "Valve";
    }

    /**
     * @param {object} param0
     * @param {number=} param0.maximumStorage How much this storage can hold
     */
    constructor({ maximumStorage = 1e20 }) {
        super({maximumStorage});
     }
}

export class ValveSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ValveComponent]);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");

        /**
         * Stores which uids were already drawn to avoid drawing entities twice
         * @type {Set<number>}
         */
        this.drawnUids = new Set();

        this.root.signals.gameFrameStarted.add(this.clearDrawnUids, this);
    }

    clearDrawnUids() {
        this.drawnUids.clear();
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const valveComp = entity.components[ValveComponent.getId()];

            const pinsComp = entity.components.WiredPins;
            const network = pinsComp.slots[0].linkedNetwork;

            let currentInput = false;

            if (network && network.hasValue()) {
                const value = network.currentValue;
                if (value && isTrueItem(value)) {
                    currentInput = true;
                }
            }

            // Eject from storage
            if (currentInput && valveComp.storedItem && valveComp.storedCount > 0) {
                const ejectorComp = entity.components.ItemEjector;

                const nextSlot = ejectorComp.getFirstFreeSlot();
                if (nextSlot !== null) {
                    if (ejectorComp.tryEject(nextSlot, valveComp.storedItem)) {
                        valveComp.storedCount--;

                        if (valveComp.storedCount === 0) {
                            valveComp.storedItem = null;
                        }
                    }
                }
            }

            let targetAlpha = valveComp.storedCount > 0 ? 1 : 0;
            valveComp.overlayOpacity = lerp(valveComp.overlayOpacity, targetAlpha, 0.05);
        }
    }

    /**
     * @param {import("shapez/core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const valveComp = entity.components[ValveComponent.getId()];
            if (!valveComp) {
                continue;
            }

            const storedItem = valveComp.storedItem;
            if (!storedItem) {
                continue;
            }

            if (this.drawnUids.has(entity.uid)) {
                continue;
            }

            this.drawnUids.add(entity.uid);

            const staticComp = entity.components.StaticMapEntity;

            const context = parameters.context;
            context.globalAlpha = valveComp.overlayOpacity;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            storedItem.drawItemCenteredClipped(center.x + 0.2, center.y - 0.3, parameters, 16);

            this.storageOverlaySprite.drawCached(parameters, center.x - 10, center.y + 7, 20, 10);

            if (parameters.visibleRect.containsCircle(center.x, center.y + 25, 20)) {
                context.font = "bold 6px GameFont";
                context.textAlign = "center";
                context.fillStyle = "#64666e";
                context.fillText(formatBigNumber(valveComp.storedCount), center.x, center.y + 14);
                context.textAlign = "left";
            }
            context.globalAlpha = 1;
        }
    }
}

export function registerValveComponent(modInterface){
    modInterface.registerComponent(ValveComponent);
    modInterface.registerGameSystem({
        id: "valve",
        systemClass: ValveSystem,
        before: "storage",
        drawHooks: ["staticAfter"],
    });
}