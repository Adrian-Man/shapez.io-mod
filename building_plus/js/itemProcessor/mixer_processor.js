import {
    MOD_ITEM_PROCESSOR_HANDLERS,
    MODS_CAN_PROCESS,
    MODS_PROCESSING_REQUIREMENTS,
} from "shapez/game/systems/item_processor";
import { MOD_ITEM_PROCESSOR_SPEEDS } from "shapez/game/hub_goals";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { enumColors } from "shapez/game/colors";
import { COLOR_ITEM_SINGLETONS } from "shapez/game/items/color_item";

export const mixerItemProcessor = { smart_mixer: "smart_mixer" };

export function registerMixerItemProcessor() {
    // smart mixer
    // Declare the processing speed
    Object.assign(MOD_ITEM_PROCESSOR_SPEEDS, {
        smart_mixer: root => root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.mixer),
    });

    // output the signal
    MOD_ITEM_PROCESSOR_HANDLERS.smart_mixer = function (payload) {
        const pinsComp = payload.entity.components.WiredPins;
        const value = pinsComp.slots[0].linkedNetwork.currentValue;
        payload.outItems.push({ item: COLOR_ITEM_SINGLETONS[value.color] });
    };

    // accept if the input item match the color requrirement
    MODS_PROCESSING_REQUIREMENTS.smart_mixer = function (input) {
        const check = [enumColors.red, enumColors.green, enumColors.blue];
        if (input.item.color != check[input.slotIndex]) {
            return false;
        }
        return true;
    };

    // Can process if signal == color
    MODS_CAN_PROCESS.smart_mixer = function (input) {
        const Comp = input.entity.components;
        const processorComp = Comp.ItemProcessor;
        if (processorComp.inputCount >= processorComp.inputsPerCharge) {
            const network = Comp.WiredPins.slots[0].linkedNetwork;
            if (network) {
                const value = network.currentValue;
                if (value && value.getItemType() == "color" && value.color != enumColors.uncolored) {
                    return true;
                }
            }
        }
        return false;
    };
}
