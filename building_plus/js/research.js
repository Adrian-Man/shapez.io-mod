import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { MetaStorageBuilding } from "shapez/game/buildings/storage";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import {
    enumBeltCrossingResearch,
    enumBeltCrossingVariants,
    MetaBeltCrossingBuilding,
} from "./buildings/belt_crossing";
import { enumStorageResearch, enumStorageVariants } from "./extensions/storage_ext";
import { enumMixerResearch, enumMixerVariants } from "./extensions/mixer_ext";
import { enumStackerResearch, enumStackerVariants } from "./extensions/stacker_ext";
import { enumBalancerResearch, enumBalancerVariantsExt } from "./extensions/balancer_ext";
import { MetaBalancerBuilding } from "shapez/game/buildings/balancer";

export const researchVariants = {
    // belt_crossing
    belt_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumBeltCrossingResearch.reward_belt_crossing,
        title: "Belt Crossing",
        desc: "Crosses two belts",
        amount: 10,
    },
    corner_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: enumBeltCrossingVariants.corner,
        reward: enumBeltCrossingResearch.reward_corner_crossing,
        title: "Corner Crossing",
        desc: "Crosses two corner belts",
        amount: 10,
    },
    line_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: enumBeltCrossingVariants.switcher,
        reward: enumBeltCrossingResearch.reward_line_crossing,
        title: "Line Crossing",
        desc: "Swaps two adjacent belts",
        amount: 10,
    },

    // balancer
    mergerAll: {
        building: MetaBalancerBuilding,
        buildingVariant: enumBalancerVariantsExt.mergerAll,
        reward: enumBalancerResearch.reward_mergerAll,
        title: "Merger (All)",
        desc: "All way merger",
        amount: 30,
    },
    splitterAll: {
        building: MetaBalancerBuilding,
        buildingVariant: enumBalancerVariantsExt.splitterAll,
        reward: enumBalancerResearch.reward_splitterAll,
        title: "Splitter (All)",
        desc: "All way splitter",
        amount: 30,
    },

    // stacker_ext
    smart_stacker: {
        building: MetaStackerBuilding,
        buildingVariant: enumStackerVariants.smart,
        reward: enumStackerResearch.reward_smart_stacker,
        title: "Smart stacker",
        desc: "Stack shape with wire",
        amount: 60,
    },

    // mixer_ext
    smart_mixer: {
        building: MetaMixerBuilding,
        buildingVariant: enumMixerVariants.smart,
        reward: enumMixerResearch.reward_smart_mixer,
        title: "Smart Mixer",
        desc: "Mix colors with wire",
        amount: 60,
    },

    // valve
    valve: {
        building: MetaStorageBuilding,
        buildingVariant: enumStorageVariants.valve,
        reward: enumStorageResearch.reward_valve,
        title: "Valve",
        desc: "Toggleable tiny storage",
        amount: 30,
    },
};
