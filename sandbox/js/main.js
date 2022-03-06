import { Mod } from "shapez/mods/mod";
import { makeDiv } from "shapez/core/utils";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { KEYCODES, KEYMAPPINGS } from "shapez/game/key_action_mapper";
import { HUDSandboxController } from "shapez/game/hud/parts/sandbox_controller";
import { Blueprint } from "shapez/game/blueprint";
import { RegularGameMode } from "shapez/game/modes/regular";

import { MetaBuilding } from "shapez/game/meta_building";

import { MetaConstantProducerBuilding } from "shapez/game/buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "shapez/game/buildings/goal_acceptor";
import { MetaBlockBuilding } from "shapez/game/buildings/block";

class ModImpl extends Mod {
    init() {
        this.freeBlueprint();

        this.sandboxOption();

        this.itemProducer();
    }

    freeBlueprint() {
        this.modInterface.replaceMethod(Blueprint, "getCost", function () {
            return 0;
        });
    }

    sandboxOption() {
        //Add Key Binding
        this.modInterface.registerIngameKeybinding({
            id: "menuOpenSandbox",
            keyCode: KEYCODES.F6,
            translation: "Sandbox Options",
        });

        this.modInterface.extendClass(HUDSandboxController, SandboxExtension);

        this.modInterface.registerHudElement("sandbox_controller", HUDSandboxController);
    }

    itemProducer() {
        //Remove itemProducer from the list
        /** @type {(typeof MetaBuilding)[]} */
        const hiddenBuildings = [
            MetaConstantProducerBuilding,
            MetaGoalAcceptorBuilding,
            MetaBlockBuilding,
        ];
        
        this.modInterface.replaceMethod(RegularGameMode, "isBuildingExcluded", function ($original, [building]) {
            return hiddenBuildings.indexOf(building) >= 0;
        })
    }
}

const SandboxExtension = ({ $super, $old }) => ({
    //Edit the layout
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_SandboxController",
            [],
            `
            <label>Sandbox Options</label>

            <div class="buttons">
                <div class="levelToggle plusMinus">
                    <label>Level</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="levelToggle plusMinus">
                    <label> </label>
                    <button class="styledButton minus_50">--</button>
                    <button class="styledButton plus_50">++</button>
                </div>

                <div class="upgradesBelt plusMinus">
                    <label> Belt</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="upgradesBelt plusMinus">
                    <label> </label>
                    <button class="styledButton minus_50">--</button>
                    <button class="styledButton plus_50">++</button>
                </div>

                <div class="upgradesExtraction plusMinus">
                    <label> Extraction</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="upgradesExtraction plusMinus">
                    <label> </label>
                    <button class="styledButton minus_50">--</button>
                    <button class="styledButton plus_50">++</button>
                </div>

                <div class="upgradesProcessing plusMinus">
                    <label> Processing</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="upgradesProcessing plusMinus">
                    <label> </label>
                    <button class="styledButton minus_50">--</button>
                    <button class="styledButton plus_50">++</button>
                </div>

                <div class="upgradesPainting plusMinus">
                    <label> Painting</label>
                    <button class="styledButton minus">-</button>
                    <button class="styledButton plus">+</button>
                </div>

                <div class="upgradesPainting plusMinus">
                    <label> </label>
                    <button class="styledButton minus_50">--</button>
                    <button class="styledButton plus_50">++</button>
                </div>

                <div class="additionalOptions">
                    <button class="styledButton maxOutUpgrade">Max out upgrade</button>
                    <button class="styledButton resetUpgrade">Reset upgrade</button>
                </div>
            </div>
        `
        );

        const bind = (selector, handler) => this.trackClicks(this.element.querySelector(selector), handler);

        bind(".maxOutUpgrade", this.maxOutUpgrade);
        bind(".resetUpgrade", this.resetUpgrade);
        bind(".levelToggle .minus", () => this.modifyLevel(-1));
        bind(".levelToggle .plus", () => this.modifyLevel(1));

        bind(".upgradesBelt .minus", () => this.modifyUpgrade("belt", -1));
        bind(".upgradesBelt .plus", () => this.modifyUpgrade("belt", 1));

        bind(".upgradesExtraction .minus", () => this.modifyUpgrade("miner", -1));
        bind(".upgradesExtraction .plus", () => this.modifyUpgrade("miner", 1));

        bind(".upgradesProcessing .minus", () => this.modifyUpgrade("processors", -1));
        bind(".upgradesProcessing .plus", () => this.modifyUpgrade("processors", 1));

        bind(".upgradesPainting .minus", () => this.modifyUpgrade("painting", -1));
        bind(".upgradesPainting .plus", () => this.modifyUpgrade("painting", 1));

        bind(".levelToggle .minus_50", () => this.modifyLevel(-50));
        bind(".levelToggle .plus_50", () => this.modifyLevel(50));

        bind(".upgradesBelt .minus_50", () => this.modifyUpgrade("belt", -50));
        bind(".upgradesBelt .plus_50", () => this.modifyUpgrade("belt", 50));

        bind(".upgradesExtraction .minus_50", () => this.modifyUpgrade("miner", -50));
        bind(".upgradesExtraction .plus_50", () => this.modifyUpgrade("miner", 50));

        bind(".upgradesProcessing .minus_50", () => this.modifyUpgrade("processors", -50));
        bind(".upgradesProcessing .plus_50", () => this.modifyUpgrade("processors", 50));

        bind(".upgradesPainting .minus_50", () => this.modifyUpgrade("painting", -50));
        bind(".upgradesPainting .plus_50", () => this.modifyUpgrade("painting", 50));
    },

    //Edited, change value from 100 to 1000
    maxOutUpgrade() {
        this.modifyUpgrade("belt", 1000);
        this.modifyUpgrade("miner", 1000);
        this.modifyUpgrade("processors", 1000);
        this.modifyUpgrade("painting", 1000);
    },

    //New, set value to 0
    resetUpgrade() {
        this.modifyUpgrade("belt", -1000);
        this.modifyUpgrade("miner", -1000);
        this.modifyUpgrade("processors", -1000);
        this.modifyUpgrade("painting", -1000);
    },

    //Edited, change F6 to modifiable keymap
    initialize() {
        // Allow toggling the controller overlay
        this.root.keyMapper.getBinding(KEYMAPPINGS.mods.menuOpenSandbox).add(() => this.toggle());

        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }
})

