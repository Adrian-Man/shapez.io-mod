import { BeltPath } from "shapez/game/belt_path";
import { BeltCrossingComponent } from "../components_systems/belt_crossing";
import { ValveComponent } from "../components_systems/valve";

export function replaceBeltPath(modInterface) {
    modInterface.replaceMethod(
        BeltPath,
        "computePassOverFunctionWithoutBelts",
        function ($original, [entity, matchingSlotIndex]) {
            // components_systems/belt_crossing
            const beltCrossingComp = entity.components[BeltCrossingComponent.getId()];
            if (beltCrossingComp) {
                return function (item) {
                    if (beltCrossingComp.tryTakeItem(item, matchingSlotIndex)) {
                        return true;
                    }
                };
            }

            // components_systems/valve
            const valveComp = entity.components[ValveComponent.getId()];
            if (valveComp) {
                return function (item) {
                    if (valveComp.canAcceptItem(item)) {
                        valveComp.takeItem(item);
                        return true;
                    }
                };
            }

            return $original(entity, matchingSlotIndex);
        }
    );
}
