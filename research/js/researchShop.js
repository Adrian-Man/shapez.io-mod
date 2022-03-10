import { InputReceiver } from "shapez/core/input_receiver";
import { formatBigNumber, makeDiv } from "shapez/core/utils";
import { T } from "shapez/translations";
import { KeyActionMapper, KEYMAPPINGS } from "shapez/game/key_action_mapper";
import { BaseHUDPart } from "shapez/game/hud/base_hud_part";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { MetaBuilding } from "shapez/game/meta_building";
import { ModInterface } from "shapez/mods/mod_interface";
import { keyToKeyCode } from "shapez/game/key_action_mapper";
// import { RESEARCH_VARIANTS } from "./researchDict";
// NOTE ---- A lot of this is copied code from SI. Sue me, I don't care

const RESEARCH_VARIANTS = {};

export class HUDResearch extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Research", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], "Research");
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
        // DIALOG Inner / Wrapper

        this.root.signals.storyGoalCompleted.add((level, reward) => {
        }, this);

        this.researchVariants = RESEARCH_VARIANTS;
        this.variantToElements = {};
        this.researchedVariants = [];
        this.usedResearchPoint = 0;
    }

    rerenderFull() {
        // first, delete old children
        while (this.contentDiv.lastChild) {
            this.contentDiv.removeChild(this.contentDiv.lastChild);
        }
        this.variantToElements = {};
        console.log('rerenderFull researchVariants', this.researchVariants);
        console.log('rerenderFull researchedVariants', this.researchedVariants);
        // now, create new elements
        var variants = [];

        if (Object.keys(this.researchVariants).length) {
            variants = Object.keys(this.researchVariants).sort((a, b) => {
                //sort by research complete & meta building id
                const aMetaBuilding = gMetaBuildingRegistry.findByClass(this.researchVariants[a].building);
                const aString = aMetaBuilding.getId();
                const bMetaBuilding = gMetaBuildingRegistry.findByClass(this.researchVariants[b].building);
                const bString = bMetaBuilding.getId();
                if (!(this.isResearchCompleted(a) - this.isResearchCompleted(b)) && !(aString > bString)) {
                    return -1;
                }
                else {
                    return this.isResearchCompleted(a) - this.isResearchCompleted(b);
                }
            });
        }

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            const { building, reward, title, desc, amount } = this.researchVariants[variant];
            const handle = {};
            handle.requireIndexToElement = [];

            /** @type {MetaBuilding} */
            const metaBuilding = gMetaBuildingRegistry.findByClass(building);

            // Wrapper
            handle.elem = makeDiv(this.contentDiv, null, ["variant"]);

            // Title
            makeDiv(handle.elem, null, ["title"], title);


            // Description
            handle.elemDescription = makeDiv(handle.elem, null, ["description"], desc);
            handle.elemRequirements = makeDiv(handle.elem, null, ["requirements"]);

            // icon
            handle.icon = makeDiv(handle.elem, null, ["iconWrapper"]);
            handle.icon.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");
            handle.icon.setAttribute("data-id", metaBuilding.getId());
            makeDiv(handle.icon, null, ["icon"]);

            ///*
            // Building Sprite, cant figure rendering
            // const iconSize = 64;
            // const dimensions = metaBuilding.getDimensions(buildingVariant);
            // const sprite = metaBuilding.getPreviewSprite(0, buildingVariant);
            // handle.icon = makeDiv(handle.elem, null, ["iconWrap"]);
            // handle.icon.setAttribute("data-tile-w", String(dimensions.x));
            // handle.icon.setAttribute("data-tile-h", String(dimensions.y));
            // handle.icon.innerHTML = sprite.getAsHTML(iconSize * dimensions.x, iconSize * dimensions.y);
            // handle.icon.setAttribute("data-id", metaBuilding.getId());
            // makeDiv(handle.icon, null, ["icon"]);
            //*/

            // Buy button
            handle.buyButton = document.createElement("button");
            handle.buyButton.classList.add("buy", "styledButton");
            handle.buyButton.innerText = "Research";
            handle.elem.appendChild(handle.buyButton);

            this.trackClicks(handle.buyButton, () => {
                this.root.hud.parts.unlockNotification.showForLevel(0, reward, title, desc);
                console.log('buy button before register', this.root.hubGoals.gainedRewards);
                this.root.hubGoals.gainedRewards[reward] = 1;
                console.log('buy button after register', this.root.hubGoals.gainedRewards);
                this.researchedVariants.push(variant);
                this.usedResearchPoint = this.usedResearchPoint + amount;
                this.rerenderFull();
            });

            // Assign handle
            this.variantToElements[variant] = handle;

            // now actually add everything else

            // Cleanup detectors
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
            }

            //Cleanup
            handle.requireIndexToElement = [];

            const complete = !!this.isResearchCompleted(variant);
            handle.icon.classList.toggle("hidden", complete);
            handle.buyButton.classList.toggle("hidden", complete);

            if (complete) {
                handle.elemDescription.innerText = "COMPLETED";
                continue;
            }

            //Requirement
            const container = makeDiv(handle.elemRequirements, null, ["requirement"]);

            //Research Icon
            makeDiv(container, null, ["research"]);

            //Progress bar
            const progressContainer = makeDiv(container, null, ["amount"]);
            const progressBar = document.createElement("label");
            progressBar.classList.add("progressBar");
            progressContainer.appendChild(progressBar);

            const progressLabel = document.createElement("label");
            progressContainer.appendChild(progressLabel);

            handle.requireIndexToElement.push({
                container,
                progressLabel,
                progressBar,
                required: amount,
            });

        }
    }

    renderCountsAndStatus() {
        for (const variant in this.variantToElements) {
            const handle = this.variantToElements[variant];
            let hasShapes = true;
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const { progressLabel, progressBar, required } = handle.requireIndexToElement[i];

                const haveAmount = this.root.hubGoals.getLevel() - this.usedResearchPoint;
                const progress = Math.min(haveAmount / required, 1.0);

                progressLabel.innerText = formatBigNumber(haveAmount) + " / " + formatBigNumber(required);
                progressBar.style.width = progress * 100.0 + "%";
                progressBar.classList.toggle("complete", progress >= 1.0);
                if (progress < 1.0) {
                    hasShapes = false;
                }
            }

            handle.buyButton.classList.toggle("buyable", hasShapes);
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("research");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuClose).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.mods.menuOpenResearch).add(this.close, this);

        this.close();

        this.rerenderFull();
        this.root.signals.upgradePurchased.add(this.rerenderFull, this);
    }

    cleanup() {
        // Cleanup detectors
        for (const variant in this.variantToElements) {
            const handle = this.variantToElements[variant];
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const requiredHandle = handle.requireIndexToElement[i];
                requiredHandle.container.remove();
            }
            handle.requireIndexToElement = [];
        }
    }

    show() {
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
    }

    close() {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
        if (this.visible) {
            this.renderCountsAndStatus();
        }
    }

    isBlockingOverlay() {
        return this.visible;
    }

    addResearch(variant) {
        Object.assign(this.researchVariants, variant);
        console.log('addResearch', this.researchVariants);
    }

    isResearchCompleted(variant) {
        return this.researchedVariants.includes(variant) ? 1 : 0;
    }

    getAvailableResearch() {
        let available = 0;
        for (const variant in this.variantToElements) {
            const handle = this.variantToElements[variant];
            let hasShapes = true;
            for (let i = 0; i < handle.requireIndexToElement.length; ++i) {
                const { required } = handle.requireIndexToElement[i];

                const haveAmount = this.root.hubGoals.getLevel() - this.usedResearchPoint;
                const progress = haveAmount / required;
                if (progress < 1.0) {
                    hasShapes = false;
                }
            }
            if (!handle.requireIndexToElement.length) {
                hasShapes = false;
            }
            if (hasShapes) {
                available++;
            }
        }
        return available;
    }
}

/**
 *
 * @param {ModInterface} modInterface
 */
export function addHUDResearch(modInterface) {
    //Add keybinding
    modInterface.registerIngameKeybinding({
        id: "menuOpenResearch",
        keyCode: keyToKeyCode("H"),
        translation: "Researchs",
    });

    //Register research hud
    modInterface.registerHudElement("research", HUDResearch);

}