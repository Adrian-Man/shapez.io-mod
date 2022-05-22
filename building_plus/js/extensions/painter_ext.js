import { enumPainterVariants, MetaPainterBuilding } from "shapez/game/buildings/painter";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";

export function painterExt(modInterface) {
    modInterface.extendClass(MetaPainterBuilding, ({ $old }) => ({
        getAvailableVariants(root) {
            let variants = [];
            variants.push(defaultBuildingVariant);
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_double)) {
                variants.push(enumPainterVariants.double);
            }
            if (
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers) &&
                root.gameMode.getSupportsWires()
            ) {
                variants.push(enumPainterVariants.quad);
            }
            return variants;
        },
    }));
}
