import { keyToKeyCode } from "shapez/game/key_action_mapper";
import { ModInterface } from "shapez/mods/mod_interface";
import { setupMirrorableBuildingPlacerLogic } from "./building_placer";
import { setupMirrorableGameLogic } from "./game_logic";
import { setupMirrorableMetaBuilding } from "./meta_building";
import { setupMirrorableSMEC } from "./SMEC";

/**
 * 
 * @param {ModInterface} modInterface 
 */
export const setupMirror = (modInterface) => {
    modInterface.registerIngameKeybinding({
        id: "mirror",
        keyCode: keyToKeyCode("Z"),
        translation: "Mirror building",
    });

    setupMirrorableMetaBuilding(modInterface);
    setupMirrorableGameLogic(modInterface);
    setupMirrorableBuildingPlacerLogic(modInterface);
    setupMirrorableSMEC(modInterface);

}


