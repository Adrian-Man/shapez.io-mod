import { formatItemsPerSecond } from "shapez/core/utils";
import { Vector } from "shapez/core/vector";
import { MetaFilterBuilding } from "shapez/game/buildings/filter";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { T } from "shapez/translations";

/** @enum {string} */
export const enumFilterVariants = { reverse: "reverse" };

export function addFilterVariant(modInterface) {
    //add variant
    modInterface.addVariantToExistingBuilding(MetaFilterBuilding, enumFilterVariants.reverse, {
        name: "Reverse Filter",
        description: "Filter, with reverse input",

        dimensions: new Vector(2, 1),

        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
        },

        isUnlocked(root) {
            return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_filter);
        },
    });

    //extend instance methods
    modInterface.extendClass(MetaFilterBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            if (variant === enumFilterVariants.reverse) {
                entity.components.ItemEjector.setSlots([
                    { pos: new shapez.Vector(1, 0), direction: shapez.enumDirection.right },
                    { pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.top },
                ]);
            } else if (variant === defaultBuildingVariant) {
                // reset for original
                entity.components.ItemEjector.setSlots([
                    { pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.top },
                    { pos: new shapez.Vector(1, 0), direction: shapez.enumDirection.right },
                ]);
            } else {
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },
    }));
}
