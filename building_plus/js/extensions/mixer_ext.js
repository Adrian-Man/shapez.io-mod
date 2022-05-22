import { formatItemsPerSecond } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { T } from "shapez/translations";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { mixerItemProcessor } from "../itemProcessor/mixer_processor";
import { defaultBuildingVariant } from "shapez/game/meta_building";

/** @enum {string} */
export const enumMixerVariants = { smart: "smart" };

/** @enum {string} */
export const enumMixerResearch = { reward_smart_mixer: "reward_smart_mixer" };

export function addMixerVariant(modInterface) {
    //add variant
    modInterface.addVariantToExistingBuilding(MetaMixerBuilding, enumMixerVariants.smart, {
        name: "Smart Mixer",
        description: "Mix color based on the signal input",

        dimensions: new Vector(3, 1),

        additionalStatistics(root) {
            const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.mixer);
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
        },

        isUnlocked(root) {
            return root.hubGoals.isRewardUnlocked(enumMixerResearch.reward_smart_mixer);
        },
    });

    //extend instance methods
    modInterface.extendClass(MetaMixerBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            if (variant === enumMixerVariants.smart) {
                if (!entity.components.WiredPins) {
                    entity.addComponent(new WiredPinsComponent({ slots: [] }));
                }

                entity.components.WiredPins.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ]);

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, filter: "color" },
                    { pos: new Vector(1, 0), direction: enumDirection.bottom, filter: "color" },
                    { pos: new Vector(2, 0), direction: enumDirection.bottom, filter: "color" },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);
                entity.components.ItemProcessor.type = mixerItemProcessor.smart_mixer;
                entity.components.ItemProcessor.processingRequirement = mixerItemProcessor.smart_mixer;
                entity.components.ItemProcessor.inputsPerCharge = 3;
            } else if (variant === defaultBuildingVariant) {
                // reset for original
                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, filter: "color" },
                    { pos: new Vector(1, 0), direction: enumDirection.bottom, filter: "color" },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.ItemProcessor.type = enumItemProcessorTypes.mixer;
                entity.components.ItemProcessor.inputsPerCharge = 2;
            } else {
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },
    }));
}
