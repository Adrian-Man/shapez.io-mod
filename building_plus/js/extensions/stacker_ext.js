import { formatItemsPerSecond } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { T } from "shapez/translations";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { stackerItemProcessor } from "../itemProcessor/stacker_processor";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";

/** @enum {string} */
export const enumStackerVariants = {
    smart: "smart",
    reverse: "reverse",
};

/** @enum {string} */
export const enumStackerResearch = { reward_smart_stacker: "reward_smart_stacker" };

export function addStackerVariant(modInterface) {
    //add variant
    modInterface.addVariantToExistingBuilding(MetaStackerBuilding, enumStackerVariants.reverse, {
        name: "Reverse stacker",
        description: "Stacker, with reverse input",

        dimensions: new Vector(2, 1),

        additionalStatistics(root) {
            const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker);
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
        },

        isUnlocked(root) {
            return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_stacker);
        },
    });

    modInterface.addVariantToExistingBuilding(MetaStackerBuilding, enumStackerVariants.smart, {
        name: "Smart stacker",
        description: "Stack shape based on the signal input",

        dimensions: new Vector(4, 1),

        additionalStatistics(root) {
            const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker);
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
        },

        isUnlocked(root) {
            return root.hubGoals.isRewardUnlocked(enumStackerResearch.reward_smart_stacker);
        },
    });

    //extend instance methods
    modInterface.extendClass(MetaStackerBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            if (variant === enumStackerVariants.reverse) {
                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.bottom, filter: "shape" },
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, filter: "shape" },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.stacker;
                entity.components.ItemProcessor.inputsPerCharge = 2;
            } else if (variant === enumStackerVariants.smart) {
                if (!entity.components.WiredPins) {
                    entity.addComponent(new WiredPinsComponent({ slots: [] }));
                }

                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(2, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(3, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ]);

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, filter: "shape" },
                    { pos: new Vector(1, 0), direction: enumDirection.bottom, filter: "shape" },
                    { pos: new Vector(2, 0), direction: enumDirection.bottom, filter: "shape" },
                    { pos: new Vector(3, 0), direction: enumDirection.bottom, filter: "shape" },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemProcessor.type = stackerItemProcessor.smart_stacker;
                entity.components.ItemProcessor.processingRequirement = stackerItemProcessor.smart_stacker;
            } else if (variant === defaultBuildingVariant) {
                // reset for original
                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, filter: "shape" },
                    { pos: new Vector(1, 0), direction: enumDirection.bottom, filter: "shape" },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.stacker;
                entity.components.ItemProcessor.inputsPerCharge = 2;
            } else {
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },
    }));
}
