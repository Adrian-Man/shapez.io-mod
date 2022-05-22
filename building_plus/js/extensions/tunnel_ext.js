import { formatItemsPerSecond } from "shapez/core/utils";
import { enumDirection, Vector } from "shapez/core/vector";
import { T } from "shapez/translations";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";

import {
    arrayUndergroundRotationVariantToMode,
    enumUndergroundBeltVariantToTier,
    MetaUndergroundBeltBuilding,
} from "shapez/game/buildings/underground_belt";
import { enumUndergroundBeltMode } from "shapez/game/components/underground_belt";
import { building_plus_logger } from "../logger";
import { enumTunnelModeExt } from "../components_systems/tunnel";

/** @enum {string} */
export const enumTunnelVariants = {
    tun_ext_tier1: "tun_ext_tier1",
    tun_ext_tier2: "tun_ext_tier2",
};

/** @enum {string} */
export const enumTunnelResearch = {
    reward_tun_ext_tier1: "reward_tun_ext_tier1",
    reward_tun_ext_tier2: "reward_tun_ext_tier2",
};

const newenumUndergroundBeltVariantToTier = {
    ...enumUndergroundBeltVariantToTier,
    [enumTunnelVariants.tun_ext_tier1]: 0,
    [enumTunnelVariants.tun_ext_tier2]: 1,
};

export function addTunnelVariant(modInterface) {
    //add variant
    modInterface.addVariantToExistingBuilding(MetaUndergroundBeltBuilding, enumTunnelVariants.tun_ext_tier1, {
        name: "Range Extender",
        description: "Extend the range of tier 1 tunnel",
        dimensions: new Vector(1, 1),
        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getUndergroundBeltBaseSpeed();
            const stats = [
                [
                    T.ingame.buildingPlacement.infoTexts.range,
                    T.ingame.buildingPlacement.infoTexts.tiles.replace("<x>", "5"),
                    [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)],
                ],
            ];
            return stats;
        },
        isUnlocked(root) {
            return true;
        },
    });

    modInterface.addVariantToExistingBuilding(MetaUndergroundBeltBuilding, enumTunnelVariants.tun_ext_tier2, {
        name: "Range Extender",
        description: "Extend the range of tier 2 tunnel",
        dimensions: new Vector(1, 1),
        additionalStatistics(root) {
            const beltSpeed = root.hubGoals.getUndergroundBeltBaseSpeed();
            const stats = [
                [
                    T.ingame.buildingPlacement.infoTexts.range,
                    T.ingame.buildingPlacement.infoTexts.tiles.replace("<x>", "9"),
                    [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)],
                ],
            ];
            return stats;
        },
        isUnlocked(root) {
            return true;
        },
    });

    // extend instance methods
    modInterface.extendClass(MetaUndergroundBeltBuilding, ({ $old }) => ({
        updateVariants(entity, rotationVariant, variant) {
            entity.components.UndergroundBelt.tier = newenumUndergroundBeltVariantToTier[variant];
            if (Object.values(enumTunnelVariants).includes(variant)) {
                entity.components.UndergroundBelt.mode = enumTunnelModeExt.extender;
                // building_plus_logger.log("tier", entity.components.UndergroundBelt.tier)
                entity.components.ItemEjector.setSlots([]);
                entity.components.ItemAcceptor.setSlots([]);
                return;
            } else {
                $old.updateVariants.bind(this)(entity, rotationVariant, variant);
            }
        },
    }));
}
