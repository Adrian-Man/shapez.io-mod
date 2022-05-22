import { formatBigNumber } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { T } from "shapez/translations";
import { enumPinSlotType } from "shapez/game/components/wired_pins";
import { MetaStorageBuilding } from "shapez/game/buildings/storage";
import { StorageComponent } from "shapez/game/components/storage";
import { ValveComponent } from "../components_systems/valve";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { BeltUnderlaysComponent } from "shapez/game/components/belt_underlays";

/** @enum {string} */
export const enumStorageVariants = { valve: "valve" };

/** @enum {string} */
export const enumStorageResearch = { reward_valve: "reward_valve" };

export function addStorageVariant(modInterface) {
    //add variant
    modInterface.addVariantToExistingBuilding(MetaStorageBuilding, enumStorageVariants.valve, {
        name: "Valve",
        description: "Small buffer, output when receive a true signal",

        dimensions: new Vector(1, 1),

        additionalStatistics(root) {
            const storageSize = 100;
            return [[T.ingame.buildingPlacement.infoTexts.storage, formatBigNumber(storageSize)]];
        },

        isUnlocked(root) {
            return root.hubGoals.isRewardUnlocked(enumStorageResearch.reward_valve);
        },
    });

    //extend instance methods
    modInterface.extendClass(MetaStorageBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            if (variant === enumStorageVariants.valve) {
                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ]);

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                if (!entity.components[ValveComponent.getId()]) {
                    entity.addComponent(new ValveComponent({ maximumStorage: 100 }));
                }

                if (entity.components[StorageComponent.getId()]) {
                    entity.removeComponent(StorageComponent);
                }

                if (!entity.components.BeltUnderlays) {
                    entity.addComponent(
                        new BeltUnderlaysComponent({
                            underlays: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
                        })
                    );
                }
            } else if (variant === defaultBuildingVariant) {
                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalEjector,
                    },
                ]);

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 1), direction: enumDirection.bottom },
                    { pos: new Vector(1, 1), direction: enumDirection.bottom },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ]);

                if (!entity.components[StorageComponent.getId()]) {
                    entity.addComponent(new StorageComponent({ maximumStorage: 5000 }));
                }

                if (entity.components[ValveComponent.getId()]) {
                    entity.removeComponent(ValveComponent);
                }
            } else {
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },
    }));
}
