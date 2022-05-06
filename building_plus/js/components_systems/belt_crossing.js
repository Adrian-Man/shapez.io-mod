import { Component } from "shapez/game/component";
import { GameSystemWithFilter } from "shapez/game/game_system_with_filter";

export class BeltCrossingComponent extends Component {
    constructor(inputsToProcess = 1) {
        super();
        this.clear();
        this.inputsToProcess = inputsToProcess;
    }

    clear() {
        this.inputSlots = [];
    }

    static getId() {
        return "BeltCrossing";
    }

    tryTakeItem(item, sourceSlot) {
        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}

export class BeltCrossingSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltCrossingComponent]);
    }

    static getId() {
        return "beltCrossing";
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const beltCrossingComp = entity.components[BeltCrossingComponent.getId()];
            const ejectorComp = entity.components.ItemEjector;
            for (let i = 0; i < beltCrossingComp.inputSlots.length; ++i) {
                const slot = beltCrossingComp.inputSlots[i].sourceSlot;
                const item = beltCrossingComp.inputSlots[i].item;
                const isOnMap = this.root.camera.getIsMapOverlayActive();
                const isOffWindow = this.root.app.unloaded || !this.root.app.pageVisible;
                if (
                    ejectorComp.canEjectOnSlot(slot) &&
                    (this.isAcceptorSlotFree(entity, slot) || isOnMap || isOffWindow)
                ) {
                    if (ejectorComp.tryEject(slot, item)) {
                        beltCrossingComp.inputSlots.splice(i, 1);
                    }
                }
            }
        }
    }

    canProcess(entity) {
        const beltCrossingComp = entity.components.BeltCrossing;
        return beltCrossingComp.inputSlots.length >= beltCrossingComp.inputsToProcess;
    }

    isAcceptorSlotFree(entity, slotIndex) {
        assert(
            entity.components.ItemAcceptor,
            "To accept items, the building needs to have an Item Acceptor"
        );
        const acceptorComp = entity.components.ItemAcceptor;
        for (let i = 0; i < acceptorComp.itemConsumptionAnimations.length; ++i) {
            const isSlot = acceptorComp.itemConsumptionAnimations[i].slotIndex == slotIndex;
            if (isSlot) {
                return false;
            }
        }
        return true;
    }
}

export function registerBeltCrossingComponent(modInterface){
    modInterface.registerComponent(BeltCrossingComponent);
    modInterface.registerGameSystem({
        id: "beltCrossing",
        systemClass: BeltCrossingSystem,
        before: "itemProcessor",
    });
}