import { Mod } from "shapez/mods/mod";
import { ModInterface } from "shapez/mods/mod_interface";
import { addHUDResearch, research_logger } from "./researchShop";
import { postCreateMenuElements } from "./game_menu_ext";
import { showForLevelReplace } from "./unlock_notification_ext";
import { HUDGameMenu } from "shapez/game/hud/parts/game_menu";
import { HubGoals } from "shapez/game/hub_goals";
import { HUDUnlockNotification } from "shapez/game/hud/parts/unlock_notification";

ModInterface.prototype["addResearch"] = addResearch;

class ModImpl extends Mod {
    init() {
        // Add research hud
        addHUDResearch(this.modInterface);
        // this.modInterface.extendClass(HUDGameMenu, GameMenuExtension);
        this.modInterface.extendClass(HubGoals, HubGoalsExtension);
        this.modInterface.replaceMethod(HUDUnlockNotification, "showForLevel", showForLevelReplace);
        this.modInterface.runAfterMethod(HUDGameMenu, "createElements", postCreateMenuElements);
        this.saveGainedRewards();
    }

    saveGainedRewards() {
        this.signals.gameSerialized.add((root, data) => {
            data.modExtraData["gainedRewards"] = root.hubGoals.gainedRewards;
        });
        this.signals.gameDeserialized.add((root, data) => {
            // turn off hints - hints are bad!
            root.app.settings.updateSetting("offerHints", false);
            const gainedRewards = data.modExtraData["gainedRewards"];
            if (gainedRewards) {
                root.hubGoals.gainedRewards = gainedRewards;
                var variants = [];

                if (Object.keys(root.hud.parts.research.researchVariants).length) {
                    variants = Object.keys(root.hud.parts.research.researchVariants);
                }

                for (let i = 0; i < variants.length; i++) {
                    const { reward, amount } = root.hud.parts.research.researchVariants[variants[i]];
                    // check to see if we already researched it
                    if (gainedRewards[reward]) {
                        root.hud.parts.research.researchedVariants.push(variants[i]);
                        root.hud.parts.research.usedResearchPoint += amount;
                    }
                }
                // root.hud.parts.research.rerenderFull();
            }
        });
    }
}

const HubGoalsExtension = ({ $super, $old }) => ({
    getLevel() {
        return this.level;
    },
});

/**
 * @this {any}
 */
function addResearch(variants) {
    this.modLoader.signals.gameInitialized.add(root => {
        root.hud.parts.research.addResearch(variants);
    });
}
