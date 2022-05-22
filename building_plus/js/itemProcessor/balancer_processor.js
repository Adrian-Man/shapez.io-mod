import { MOD_ITEM_PROCESSOR_HANDLERS } from "shapez/game/systems/item_processor";

/** @enum {string} */
export const balancerItemProcessor = { balancer: "balancer" };

export function registerBalancerItemProcessor() {
    // output the signal
    MOD_ITEM_PROCESSOR_HANDLERS.balancer = function (payload) {
        assert(
            payload.entity.components.ItemEjector,
            "To be a balancer, the building needs to have an ejector"
        );
        const availableSlots = payload.entity.components.ItemEjector.slots.length;
        const processorComp = payload.entity.components.ItemProcessor;

        for (let i = 0; i < 3; ++i) {
            const item = payload.items.get(i);
            if (!item) {
                continue;
            }
            payload.outItems.push({
                item,
                preferredSlot: processorComp.nextOutputSlot++ % availableSlots,
                doNotTrack: true,
            });
        }
        return true;
    };
}
