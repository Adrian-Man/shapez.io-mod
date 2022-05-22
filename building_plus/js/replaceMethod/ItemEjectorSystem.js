import { ItemEjectorSystem } from "shapez/game/systems/item_ejector";
import { BeltCrossingComponent } from "../components_systems/belt_crossing";
import { ValveComponent } from "../components_systems/valve";

export function replaceItemEjectorSystem(modInterface) {
    modInterface.replaceMethod(
        ItemEjectorSystem,
        "tryPassOverItem",
        function ($original, [item, reciever, slotIndex]) {
            // components_systems/belt_crossing
            const beltCrossingComp = reciever.components[BeltCrossingComponent.getId()];
            if (beltCrossingComp) {
                if (beltCrossingComp.tryTakeItem(item, slotIndex)) {
                    return true;
                }
                return false;
            }

            // components_systems/valve
            const valveComp = reciever.components[ValveComponent.getId()];
            if (valveComp) {
                // It's a valve
                if (valveComp.canAcceptItem(item)) {
                    valveComp.takeItem(item);
                    return true;
                }
                return false;
            }

            return $original(item, reciever, slotIndex);
        }
    );
}
