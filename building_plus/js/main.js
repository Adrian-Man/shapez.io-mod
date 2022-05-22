import { Mod } from "shapez/mods/mod";
import { setupMirror } from "./mirror setup/setup_mirror";
import { MODS } from "shapez/mods/modloader";

import { registerValveComponent } from "./components_systems/valve";
import { registerBeltCrossingComponent } from "./components_systems/belt_crossing";

import { addBeltCrossing } from "./buildings/belt_crossing";
import { addMixerVariant } from "./extensions/mixer_ext";
import { addStorageVariant } from "./extensions/storage_ext";
import { addStackerVariant } from "./extensions/stacker_ext";
import { painterExt } from "./extensions/painter_ext";
import { addFilterVariant } from "./extensions/filter_ext";
import { addBalancerVariant } from "./extensions/balancer_ext";

import { registerMixerItemProcessor } from "./itemProcessor/mixer_processor";
import { registerStackerItemProcessor } from "./itemProcessor/stacker_processor";
import { registerBalancerItemProcessor } from "./itemProcessor/balancer_processor";

import { replaceItemEjectorSystem } from "./replaceMethod/ItemEjectorSystem";
import { replaceBeltPath } from "./replaceMethod/BeltPath";
import { replaceModInterface } from "./replaceMethod/ModInterface";
import { replaceMainMenuState } from "./replaceMethod/MainMenu";

import { researchVariants } from "./research";
import { building_plus_logger } from "./logger";

import { addTunnelVariant } from "./extensions/tunnel_ext";
import { registerTunnelSystem } from "./components_systems/tunnel";

import { replaceHUDWiresOverlay } from "./replaceMethod/HUDWiresOverlay";


class ModImpl extends Mod {
    init() {
        // check if Research is installed
        this.signals.stateEntered.add(state => {
            if (state instanceof shapez.MainMenuState) {
                if (MODS.mods.some(m => m.metadata.id === "research")) {
                    // Research is installed, load research
                    building_plus_logger.log("Research found");
                    // @ts-ignore
                    this.modInterface.addResearch(researchVariants);
                } else {
                    // Research is not installed, show warning
                    building_plus_logger.log("Research not found");
                    // @ts-ignore
                    const { ok } = this.dialogs.showInfo(
                        "Missing dependency",
                        "Research is not installed, but is required by Building+"
                    );
                    ok.add(() => {
                        // @ts-ignore
                        const { ok } = this.dialogs.showInfo(
                            "Open site",
                            "Click OK to open Research on mod.io",
                            ["cancel:bad", "ok:good"]
                        );
                        ok.add(() =>
                            this.app.platformWrapper.openExternalLink("https://shapez.mod.io/research")
                        );
                    });
                }
            }
        });

        // replace method, Do this in batch for better management
        replaceBeltPath(this.modInterface);
        replaceItemEjectorSystem(this.modInterface);
        replaceModInterface(this.modInterface);
        replaceMainMenuState(this.modInterface);

        registerBeltCrossingComponent(this.modInterface);
        addBeltCrossing(this.modInterface);
        building_plus_logger.log("belt crossing added");

        registerBalancerItemProcessor();
        addBalancerVariant(this.modInterface);
        building_plus_logger.log("balancer added");

        addFilterVariant(this.modInterface);
        building_plus_logger.log("filter added");

        registerMixerItemProcessor();
        addMixerVariant(this.modInterface);
        building_plus_logger.log("mixer added");

        painterExt(this.modInterface);
        building_plus_logger.log("painter fixed");

        registerStackerItemProcessor();
        addStackerVariant(this.modInterface);
        building_plus_logger.log("smart stacker added");

        registerValveComponent(this.modInterface);
        addStorageVariant(this.modInterface);
        building_plus_logger.log("valve added");

        setupMirror(this.modInterface);
        building_plus_logger.log("mirrored added");

        // registerTunnelSystem(this.modInterface);
        // addTunnelVariant(this.modInterface);

        // replaceHUDWiresOverlaySystem(this.modInterface);
    }
}
