<<<<<<< Updated upstream
import { defaultBuildingVariant, MetaBuilding } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { MetaRotaterBuilding } from "shapez/game/buildings/rotater";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaPainterBuilding , enumPainterVariants} from "shapez/game/buildings/painter";
import { MetaBalancerBuilding , enumBalancerVariants} from "shapez/game/buildings/balancer";
import { MetaMinerBuilding } from "shapez/game/buildings/miner";
import { MetaUndergroundBeltBuilding } from "shapez/game/buildings/underground_belt";
import { MetaFilterBuilding } from "shapez/game/buildings/filter";

export const RESEARCH_VARIANTS = {
    balancerSmartMerger: {
        building: MetaBalancerBuilding,
        buildingVariant: enumBalancerVariants.mergerInverse,
        reward: enumHubGoalRewards.reward_merger,
        desc: "Test",
        amount: 80,
    },
    tunnelTier2: {
        building: MetaUndergroundBeltBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
        desc: "a variant of the tunnel with bigger range",
        amount: 20,
    },
    minerChainable: {
        building: MetaMinerBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_miner_chainable,
        desc: "Test",
        amount: 120,
    },
    quadCutter: {
        building: MetaCutterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_cutter_quad,
        desc: "Test",
        amount: 20,
    },
    ccwRotator: {
        building: MetaRotaterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_rotater_ccw,
        desc: "Test",
        amount: 20,
    },

    doublePainter: {
        building: MetaFilterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_filter,
        desc: "Test",
        amount: 20,
    },
    rotator180: {
        building: MetaRotaterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_rotater_180,
        desc: "Test",
        amount: 20,
    },
    balancerSmartSplitter: {
        building: MetaPainterBuilding,
        buildingVariant: enumPainterVariants.quad,
        reward: enumHubGoalRewards.reward_splitter,
        desc: "Test",
        amount: 20,
    },
=======
import { defaultBuildingVariant, MetaBuilding } from "shapez/game/meta_building";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { MetaRotaterBuilding } from "shapez/game/buildings/rotater";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaPainterBuilding , enumPainterVariants} from "shapez/game/buildings/painter";
import { MetaBalancerBuilding , enumBalancerVariants} from "shapez/game/buildings/balancer";
import { MetaMinerBuilding } from "shapez/game/buildings/miner";
import { MetaUndergroundBeltBuilding } from "shapez/game/buildings/underground_belt";
import { MetaFilterBuilding } from "shapez/game/buildings/filter";

// random research entry for testing
export const RESEARCH_VARIANTS = {
    balancerSmartMerger: {
        building: MetaBalancerBuilding,
        buildingVariant: enumBalancerVariants.mergerInverse,
        reward: enumHubGoalRewards.reward_merger,
        desc: "Test",
        amount: 80,
    },
    tunnelTier2: {
        building: MetaUndergroundBeltBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
        desc: "a variant of the tunnel with bigger range",
        amount: 20,
    },
    minerChainable: {
        building: MetaMinerBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_miner_chainable,
        desc: "Test",
        amount: 120,
    },
    quadCutter: {
        building: MetaCutterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_cutter_quad,
        desc: "Test",
        amount: 20,
    },
    ccwRotator: {
        building: MetaRotaterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_rotater_ccw,
        desc: "Test",
        amount: 20,
    },

    doublePainter: {
        building: MetaFilterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_filter,
        desc: "Test",
        amount: 20,
    },
    rotator180: {
        building: MetaRotaterBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumHubGoalRewards.reward_rotater_180,
        desc: "Test",
        amount: 20,
    },
    balancerSmartSplitter: {
        building: MetaPainterBuilding,
        buildingVariant: enumPainterVariants.quad,
        reward: enumHubGoalRewards.reward_splitter,
        desc: "Test",
        amount: 20,
    },
>>>>>>> Stashed changes
};