import { globalConfig } from "shapez/core/config";
import { fastArrayDelete } from "shapez/core/utils";
import { enumDirection, enumDirectionToVector, enumDirectionToAngle } from "shapez/core/vector";
import { enumUndergroundBeltMode } from "shapez/game/components/underground_belt";
import { Entity } from "shapez/game/entity";
import { UndergroundBeltSystem } from "shapez/game/systems/underground_belt";
import { building_plus_logger } from "../logger";

/** @enum {string} */
export const enumTunnelModeExt = { extender: "extender" };

export function registerTunnelSystem(modInterface) {
    // extend instance methods
    modInterface.extendClass(UndergroundBeltSystem, ({ $old }) => ({
        update() {
            this.staleAreaWatcher.update();

            const now = this.root.time.now();

            for (let i = 0; i < this.allEntities.length; ++i) {
                const entity = this.allEntities[i];
                const undergroundComp = entity.components.UndergroundBelt;
                if (undergroundComp.mode === enumUndergroundBeltMode.sender) {
                    this.handleSender(entity);
                } else if (undergroundComp.mode === enumUndergroundBeltMode.receiver) {
                    this.handleReceiver(entity, now);
                }
            }
        },

        findRecieverForSender(entity) {
            const staticComp = entity.components.StaticMapEntity;
            const undergroundComp = entity.components.UndergroundBelt;
            const searchDirection = staticComp.localDirectionToWorld(enumDirection.top);
            const searchVector = enumDirectionToVector[searchDirection];
            const targetRotation = enumDirectionToAngle[searchDirection];
            let currentTile = staticComp.origin;
            building_plus_logger.log("recompute");
            // Search in the direction of the tunnel
            for (
                let searchOffset = 0;
                // @ts-ignore
                searchOffset < globalConfig.undergroundBeltMaxTilesByTier[undergroundComp.tier];
                ++searchOffset
            ) {
                currentTile = currentTile.add(searchVector);
                const potentialReceiver = this.root.map.getTileContent(currentTile, "regular");
                if (!potentialReceiver) {
                    // Empty tile
                    continue;
                }
                const receiverUndergroundComp = potentialReceiver.components.UndergroundBelt;
                if (!receiverUndergroundComp || receiverUndergroundComp.tier !== undergroundComp.tier) {
                    // Not a tunnel, or not on the same tier
                    continue;
                }

                const receiverStaticComp = potentialReceiver.components.StaticMapEntity;
                if (receiverStaticComp.rotation !== targetRotation) {
                    // Wrong rotation
                    continue;
                }

                if (receiverUndergroundComp.mode == enumTunnelModeExt.extender) {
                    // A extender -> recurse searching
                    const cacheEntry = this.findRecieverForSender(potentialReceiver);

                    return { entity: cacheEntry.entity, distance: cacheEntry.distance + searchOffset + 1 };
                }

                if (receiverUndergroundComp.mode !== enumUndergroundBeltMode.receiver) {
                    // Not a receiver, but a sender -> Abort to make sure we don't deliver double
                    break;
                }
                return { entity: potentialReceiver, distance: searchOffset };
            }

            // None found
            return { entity: null, distance: 0 };
        },

        /**
         *
         * @param {Entity} entity
         */
        handleSender(entity) {
            const undergroundComp = entity.components.UndergroundBelt;

            // Find the current receiver
            let cacheEntry = undergroundComp.cachedLinkedEntity;
            if (!cacheEntry) {
                // Need to recompute cache
                cacheEntry = undergroundComp.cachedLinkedEntity = this.findRecieverForSender(entity);
            }

            if (!cacheEntry.entity) {
                // If there is no connection to a receiver, ignore this one
                return;
            }

            // building_plus_logger.log(cacheEntry.entity.components.StaticMapEntity.origin);
            // Check if we have any items to eject
            const nextItemAndDuration = undergroundComp.pendingItems[0];
            if (nextItemAndDuration) {
                assert(undergroundComp.pendingItems.length === 1, "more than 1 pending");

                // Check if the receiver can accept it
                if (
                    cacheEntry.entity.components.UndergroundBelt.tryAcceptTunneledItem(
                        nextItemAndDuration[0],
                        cacheEntry.distance,
                        this.root.hubGoals.getUndergroundBeltBaseSpeed(),
                        this.root.time.now()
                    )
                ) {
                    // Drop this item
                    fastArrayDelete(undergroundComp.pendingItems, 0);
                }
            }
        },
    }));
}
