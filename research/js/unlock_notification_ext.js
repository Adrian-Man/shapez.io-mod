<<<<<<< Updated upstream
import { defaultBuildingVariant, MetaBuilding } from "shapez/game/meta_building";
import { HUDUnlockNotification } from "shapez/game/hud/parts/unlock_notification";
import { SOUNDS } from "shapez/platform/sound";
import { T } from "shapez/translations";
import { enumNotificationType } from "shapez/game/hud/parts/notifications";
import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { ModInterface } from "shapez/mods/mod_interface";
import { enumHubGoalRewardsToContentUnlocked } from "shapez/game/tutorial_goals_mappings";


// Copy from SI

/**
 *
 * @param {ModInterface} modInterface
 */
export function replaceGoalExplanations(modInterface) {
    modInterface.replaceMethod(HUDUnlockNotification, "showForLevel", function ($original, [level, reward, title = "", desc = ""]) {
        const isResearch = !level;
        this.root.soundProxy.playUi(SOUNDS.levelComplete);

        const levels = this.root.gameMode.getLevelDefinitions();
        // Don't use getIsFreeplay() because we want the freeplay level up to show
        if (level > levels.length) {
            this.root.hud.signals.notification.dispatch(
                T.ingame.notifications.freeplayLevelComplete.replace("<level>", String(level)),
                enumNotificationType.success
            );
            return;
        }

        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        if (isResearch) {
            this.elemTitle.innerText = "RESEARCH";
        } else {
            this.elemTitle.innerText = T.ingame.levelCompleteNotification.levelTitle.replace(
                "<level>",
                ("" + level).padStart(2, "0")
            );
        }

        let html;
        if (isResearch){
            html = `
            <div class="rewardName">
                ${T.ingame.levelCompleteNotification.unlockText.replace("<reward>", title)}
            </div>
            
            <div class="rewardDesc">
                ${desc}
            </div>
            `;
        }
        else{
        const rewardName = T.storyRewards[reward].title;
            html = `
            <div class="rewardName">
                ${T.ingame.levelCompleteNotification.unlockText.replace("<reward>", rewardName)}
            </div>
            
            <div class="rewardDesc">
                ${T.storyRewards[reward].desc}
            </div>
            `;
        }

        html += "<div class='images'>";
        const gained = enumHubGoalRewardsToContentUnlocked[reward];
        if (gained) {
            gained.forEach(([metaBuildingClass, variant]) => {
                const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
                html += `<div class="buildingExplanation" data-icon="building_tutorials/${
                    metaBuilding.getId() + (variant === defaultBuildingVariant ? "" : "-" + variant)
                }.png"></div>`;
            });
        }
        html += "</div>";

        this.elemContents.innerHTML = html;
        this.visible = true;

        if (this.buttonShowTimeout) {
            clearTimeout(this.buttonShowTimeout);
        }

        this.element.querySelector("button.close").classList.remove("unlocked");

        if (this.root.app.settings.getAllSettings().offerHints) {
            this.buttonShowTimeout = setTimeout(
                () => this.element.querySelector("button.close").classList.add("unlocked"), 5000
            );
        } else {
            this.element.querySelector("button.close").classList.add("unlocked");
        }

        this.element.querySelector("button.close").innerHTML = isResearch ? "Continue" : "Next Level";
    });
=======
import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumHubGoalRewardsToContentUnlocked } from "shapez/game/tutorial_goals_mappings";
import { enumNotificationType } from "shapez/game/hud/parts/notifications";
import { SOUNDS } from "shapez/platform/sound";
import { T } from "shapez/translations";

// Copy from SI

/**
 * @this {any}
 */
export function showForLevelReplace($original, [level, reward, title = "", desc = ""]) {
    const isResearch = !level;
    this.root.soundProxy.playUi(SOUNDS.levelComplete);
    const levels = this.root.gameMode.getLevelDefinitions();
    // Don't use getIsFreeplay() because we want the freeplay level up to show
    if (level > levels.length) {
        this.root.hud.signals.notification.dispatch(
            T.ingame.notifications.freeplayLevelComplete.replace("<level>", String(level)),
            enumNotificationType.success
        );
        return;
    }

    this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
    if (isResearch) {
        this.elemTitle.innerText = "RESEARCH";
    } else {
        this.elemTitle.innerText = T.ingame.levelCompleteNotification.levelTitle.replace(
            "<level>",
            ("" + level).padStart(2, "0")
        );
    }

    let html;
    if (isResearch) {
        html = `
        <div class="rewardName">
            ${T.ingame.levelCompleteNotification.unlockText.replace("<reward>", title)}
        </div>
        
        <div class="rewardDesc">
            ${desc}
        </div>
        `;
    }
    else {
        const rewardName = T.storyRewards[reward].title;
        html = `
        <div class="rewardName">
            ${T.ingame.levelCompleteNotification.unlockText.replace("<reward>", rewardName)}
        </div>
        
        <div class="rewardDesc">
            ${T.storyRewards[reward].desc}
        </div>
        `;
    }

    html += "<div class='images'>";
    const gained = enumHubGoalRewardsToContentUnlocked[reward];
    if (gained) {
        gained.forEach(([metaBuildingClass, variant]) => {
            const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
            html += `<div class="buildingExplanation" data-icon="building_tutorials/${metaBuilding.getId() + (variant === defaultBuildingVariant ? "" : "-" + variant)
                }.png"></div>`;
        });
    }
    html += "</div>";

    this.elemContents.innerHTML = html;
    this.visible = true;

    if (this.buttonShowTimeout) {
        clearTimeout(this.buttonShowTimeout);
    }

    this.element.querySelector("button.close").classList.remove("unlocked");

    if (this.root.app.settings.getAllSettings().offerHints) {
        this.buttonShowTimeout = setTimeout(
            () => this.element.querySelector("button.close").classList.add("unlocked"), 5000
        );
    } else {
        this.element.querySelector("button.close").classList.add("unlocked");
    }

    this.element.querySelector("button.close").innerHTML = isResearch ? "Continue" : "Next Level";
>>>>>>> Stashed changes
}