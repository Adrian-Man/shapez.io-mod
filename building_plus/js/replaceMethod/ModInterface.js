import { ModInterface } from "shapez/mods/mod_interface";

export function replaceModInterface(modInterface) {
    modInterface.replaceMethod(
        ModInterface,
        "addNewBuildingToToolbar",
        /** @this ModInterface */
        // add a param before to set the position of toolbar
        function ($original, [{ toolbar, location, metaClass, before = null }]) {
            const hudElementName = toolbar === "wires" ? "HUDWiresToolbar" : "HUDBuildingsToolbar";
            const property = location === "secondary" ? "secondaryBuildings" : "primaryBuildings";
            this.modLoader.signals.hudElementInitialized.add(element => {
                if (element.constructor.name === hudElementName) {
                    if (before) {
                        element[property].splice(
                            element[property].indexOf(before),
                            0, // We do NOT want to remove any item
                            metaClass
                        );
                    } else {
                        element[property].push(metaClass);
                    }
                }
            });
        }
    ); 
}
