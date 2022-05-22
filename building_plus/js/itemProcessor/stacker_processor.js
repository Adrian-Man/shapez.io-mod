import {
    MOD_ITEM_PROCESSOR_HANDLERS,
    MODS_CAN_PROCESS,
    MODS_PROCESSING_REQUIREMENTS,
    ItemProcessorSystem,
} from "shapez/game/systems/item_processor";
import { MOD_ITEM_PROCESSOR_SPEEDS } from "shapez/game/hub_goals";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { isTruthyItem } from "shapez/game/items/boolean_item";

export const stackerItemProcessor = { smart_stacker: "smart_stacker" };

export function registerStackerItemProcessor() {
    // smart stacker
    // Declare the processing speed
    Object.assign(MOD_ITEM_PROCESSOR_SPEEDS, {
        smart_stacker: root => root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker),
    });

    // Declare a handler for the processor
    /**  @this ItemProcessorSystem */
    MOD_ITEM_PROCESSOR_HANDLERS.smart_stacker = function (payload) {
        const pinsComp = payload.entity.components.WiredPins;
        const slotStatus = getSlotStatus(pinsComp);

        const baseItem = payload.items.get(slotStatus[0]);

        let outDefinition = baseItem.definition;
        for (let i = 1; i < slotStatus.length; i++) {
            const item = payload.items.get(slotStatus[i]);

            outDefinition = this.root.shapeDefinitionMgr.shapeActionStack(outDefinition, item.definition);
        }

        payload.outItems.push({
            item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(outDefinition),
        });
    };

    // accept if there is truthy signal in slot
    MODS_PROCESSING_REQUIREMENTS.smart_stacker = function (input) {
        // Check the network value at the given slot
        const pinsComp = input.entity.components.WiredPins;
        const network = pinsComp.slots[input.slotIndex].linkedNetwork;
        const slotIsEnabled = network && network.hasValue() && isTruthyItem(network.currentValue);
        return slotIsEnabled;
    };

    // Can process if all shape of the enabled slots are there
    MODS_CAN_PROCESS.smart_stacker = function (input) {
        const pinsComp = input.entity.components.WiredPins;
        const processorComp = input.entity.components.ItemProcessor;
        const slotStatus = getSlotStatus(pinsComp);
        // All slots are disabled
        if (slotStatus.length == 0) {
            return false;
        }
        // Check if all shape of the enabled slots are there
        for (let i = 0; i < slotStatus.length; ++i) {
            if (!processorComp.inputSlots.get(slotStatus[i])) {
                return false;
            }
        }
        return true;
    };
}

function getSlotStatus(pinsComp) {
    const slotStatus = [];
    for (let i = 0; i < 4; ++i) {
        // Extract the network value on the Nth pin
        const network = pinsComp.slots[i].linkedNetwork;
        const networkValue = network && network.hasValue() ? network.currentValue : null;

        if (!isTruthyItem(networkValue)) {
            continue;
        }
        slotStatus.push(i);
    }
    return slotStatus;
}
