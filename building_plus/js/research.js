import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { MetaStorageBuilding } from "shapez/game/buildings/storage";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumBeltCrossingResearch, enumBeltCrossingVariants, MetaBeltCrossingBuilding } from "./buildings/belt_crossing";
import { enumStorageResearch, enumStorageVariants } from "./extensions/storage_ext";
import { enumMixerResearch, enumMixerVariants } from "./extensions/mixer_ext";
import { enumStackerResearch, enumStackerVariants } from "./extensions/stacker_ext";

export const researchVariants = {
    // belt_crossing
    belt_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: defaultBuildingVariant,
        reward: enumBeltCrossingResearch.reward_belt_crossing,
        title: "Belt Crossing",
        desc: "Crosses two belts",
        amount: 20,
    },
    corner_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: enumBeltCrossingVariants.corner,
        reward: enumBeltCrossingResearch.reward_corner_crossing,
        title: "Corner Crossing",
        desc: "Crosses two corner belts",
        amount: 20,
    },
    line_crossing: {
        building: MetaBeltCrossingBuilding,
        buildingVariant: enumBeltCrossingVariants.switcher,
        reward: enumBeltCrossingResearch.reward_line_crossing,
        title: "Line Crossing",
        desc: "Swaps two adjacent belts",
        amount: 20,
    },

    // stacker_ext
    smart_stacker: {
        building: MetaStackerBuilding,
        buildingVariant: enumStackerVariants.smart_stacker,
        reward: enumStackerResearch,
        title: "Smart stacker",
        desc: "stacker",
        amount: 20,
    },

    // mixer_ext
    smart_mixer: {
        building: MetaMixerBuilding,
        buildingVariant: enumMixerVariants.smart_mixer,
        reward: enumMixerResearch,
        title: "Smart Mixer",
        desc: "mixer",
        amount: 20,
    },

    // valve
    valve: {
        building: MetaStorageBuilding,
        buildingVariant: enumStorageVariants.valve,
        reward: enumStorageResearch,
        title: "Valve",
        desc: "valve",
        amount: 20,
    }
}