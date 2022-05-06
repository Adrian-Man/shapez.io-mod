
import { ModInterface } from "shapez/mods/mod_interface";
import { setupMirrorableBuildingPlacerLogic } from "./building_placer_logic";
import { setupMirrorableGameLogic } from "./game_logic";
import { setupMirrorableMetaBuilding } from "./meta_building";
import { setupMirrorableSMEComponent } from "./SMEC";



/**
 * 
 * @param {ModInterface} $ 
 */
export const setupMirror = ($) => {
    setupMirrorableSMEComponent($);
    setupMirrorableMetaBuilding($);
    setupMirrorableGameLogic($);
    setupMirrorableBuildingPlacerLogic($);
}


