import { formatItemsPerSecond } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { enumBalancerVariants, MetaBalancerBuilding } from "shapez/game/buildings/balancer";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { T } from "shapez/translations";
import { balancerItemProcessor } from "../itemProcessor/balancer_processor";

/** @enum {string} */
export const enumBalancerVariantsExt = {
    mergerSide: "mergerSide",
    mergerAll: "mergerAll",
    splitterSide: "splitterSide",
    splitterAll: "splitterAll",
};

/** @enum {string} */
export const enumBalancerResearch = {
    reward_mergerAll: "reward_mergerAll",
    reward_splitterAll: "reward_splitterAll",
};

export function addBalancerVariant(modInterface) {
    //add variant
    //Side Merger
    modInterface.addVariantToExistingBuilding(MetaBalancerBuilding, enumBalancerVariantsExt.mergerSide, {
        name: "Merger (Side)",
        description: "A merger",

        dimensions: new Vector(1, 1),

        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
        },
    });

    //3 way merger
    modInterface.addVariantToExistingBuilding(MetaBalancerBuilding, enumBalancerVariantsExt.mergerAll, {
        name: "Merger (All)",
        description: "A all way merger",

        dimensions: new Vector(1, 1),

        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
        },
    });

    //Side Splitter
    modInterface.addVariantToExistingBuilding(MetaBalancerBuilding, enumBalancerVariantsExt.splitterSide, {
        name: "Splitter (Side)",
        description: "A splitter",

        dimensions: new Vector(1, 1),

        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
        },
    });

    //3way Splitter
    modInterface.addVariantToExistingBuilding(MetaBalancerBuilding, enumBalancerVariantsExt.splitterAll, {
        name: "Splitter (All)",
        description: "A all way splitter",

        dimensions: new Vector(1, 1),

        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
        },
    });

    //extend instance methods
    modInterface.extendClass(MetaBalancerBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            if (variant === enumBalancerVariantsExt.mergerSide) {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                entity.components.ItemProcessor.type = enumItemProcessorTypes.balancer;
            } else if (variant === enumBalancerVariantsExt.mergerAll) {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                entity.components.ItemProcessor.type = balancerItemProcessor.balancer;
            } else if (variant === enumBalancerVariantsExt.splitterSide) {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                entity.components.ItemProcessor.type = enumItemProcessorTypes.balancer;
            } else if (variant === enumBalancerVariantsExt.splitterAll) {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ];

                entity.components.ItemProcessor.type = balancerItemProcessor.balancer;
            } else {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.balancer;
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },

        getAvailableVariants(root) {
            const deterministic = root.gameMode.getIsDeterministic();
            const merger = [enumBalancerVariants.merger, enumBalancerVariantsExt.mergerSide];

            const splitter = [enumBalancerVariants.splitter, enumBalancerVariantsExt.splitterSide];

            let available = [];
            if (!deterministic) {
                available.push(defaultBuildingVariant);
            }

            if (!deterministic && root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger)) {
                available.push(...merger);
            }

            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter)) {
                available.push(...splitter);
            }

            if (!deterministic && root.hubGoals.isRewardUnlocked(enumBalancerResearch.reward_mergerAll)) {
                available.push(enumBalancerVariantsExt.mergerAll);
                available = available.filter(item => !merger.includes(item));
            }

            if (root.hubGoals.isRewardUnlocked(enumBalancerResearch.reward_splitterAll)) {
                available.push(enumBalancerVariantsExt.splitterAll);
                available = available.filter(item => !splitter.includes(item));
            }

            return available;
        },
    }));
}
