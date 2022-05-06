import { Mod } from "shapez/mods/mod";
import { setupMirror } from "./mirror setup/setup_mirror";
import { createLogger } from "shapez/core/logging";

import { addMixerVariant } from "./extensions/mixer_ext";
import { addStorageVariant } from "./extensions/storage_ext";
import { addStackerVariant } from "./extensions/stacker_ext";
import { replaceItemEjectorSystem } from "./replaceMethod/ItemEjectorSystem";
import { replaceBeltPath } from "./replaceMethod/BeltPath";
import { replaceModInterface } from "./replaceMethod/ModInterface";
import { researchVariants } from "./research";
import { registerMixerItemProcessor } from "./itemProcessor/mixer_processor";
import { registerStackerItemProcessor } from "./itemProcessor/stacker_processor";
import { registerValveComponent } from "./components_systems/valve";
import { registerBeltCrossingComponent } from "./components_systems/belt_crossing";
import { addBeltCrossing } from "./buildings/belt_crossing";

const building_plus_logger = createLogger("Building+");

class ModImpl extends Mod {
    init() {
        // replace method, Do this in batch for better management
        replaceBeltPath(this.modInterface);
        replaceItemEjectorSystem(this.modInterface);
        replaceModInterface(this.modInterface);

        // setupMirror(this.modInterface);
        
        registerBeltCrossingComponent(this.modInterface);
        addBeltCrossing(this.modInterface);
        building_plus_logger.log('belt crossing added');

        registerMixerItemProcessor();
        addMixerVariant(this.modInterface);
        building_plus_logger.log('mixer added');

        registerStackerItemProcessor();
        addStackerVariant(this.modInterface);
        building_plus_logger.log('smart stacker added')

        registerValveComponent(this.modInterface);
        addStorageVariant(this.modInterface);
        building_plus_logger.log('valve added');


        // add research
        // @ts-ignore
        this.modInterface.addResearch(researchVariants);
    }
}

