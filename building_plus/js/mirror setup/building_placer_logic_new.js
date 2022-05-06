import { Vector } from "shapez/core/vector";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { StaticMapEntityComponent } from "shapez/game/components/static_map_entity";
import { Entity } from "shapez/game/entity";
import { HUDBuildingPlacer } from "shapez/game/hud/parts/building_placer";
import { KEYMAPPINGS, keyToKeyCode } from "shapez/game/key_action_mapper";

export function setupMirrorableBuildingPlacerLogicNew(modInterface){ 
    modInterface.registerIngameKeybinding({id: "mirror", keyCode: keyToKeyCode("M"), translation: "Mirror building"});
    modInterface.extendClass(HUDBuildingPlacer, MirroredHUDBuildingPlacerLogic);
}

class MirroredHUDBuildingPlacerLogic extends HUDBuildingPlacer {
    // @ts-ignore
    initialize() {
        super.initialize();

        this.preferredMirrored = {};
        this.currentMirroredGeneral = false;
    }

    get currentMirrored() {
        if (!this.root.app.settings.getAllSettings().rotationByBuilding) {
            return this.currentMirroredGeneral;
        }
        const metaBuilding = this.currentMetaBuilding.get();
        if (metaBuilding && this.preferredMirrored.hasOwnProperty(metaBuilding.getId())) {
            return this.preferredMirrored[metaBuilding.getId()];
        } else {
            return this.currentMirroredGeneral;
        }
    }

    set currentMirrored(mirrored) {
        if (!this.root.app.settings.getAllSettings().rotationByBuilding) {
            this.currentMirroredGeneral = mirrored;
        } else {
            const metaBuilding = this.currentMetaBuilding.get();
            if (metaBuilding) {
                this.preferredMirrored[metaBuilding.getId()] = mirrored;
            } else {
                this.currentMirroredGeneral = mirrored;
            }
        }
    }

    initializeBindings() {
        super.initializeBindings();
        this.root.keyMapper.getBindingById("mirror").add(this.tryMirror, this);
    }

    tryMirror() {
        const selectedBuilding = this.currentMetaBuilding.get();
        if (selectedBuilding) {
            this.currentMirrored = !this.currentMirrored;
            const staticComp = this.fakeEntity.components.StaticMapEntity;
            //@ts-ignore
            staticComp.mirrored = this.currentMirrored;
        }
    }


    tryPlaceCurrentBuildingAt(tile) {
        if (this.root.camera.getIsMapOverlayActive()) {
            // Dont allow placing in overview mode
            return;
        }

        const metaBuilding = this.currentMetaBuilding.get();
        const { rotation, rotationVariant, mirrored } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
            root: this.root,
            tile,
            mirrored: this.currentMirrored,
            rotation: this.currentBaseRotation,
            variant: this.currentVariant.get(),
            layer: metaBuilding.getLayer(),
        });

        const entity = this.root.logic.tryPlaceBuilding({
            origin: tile,
            rotation,
            //@ts-ignore
            mirrored: mirrored,
            rotationVariant,
            originalRotation: this.currentBaseRotation,
            building: this.currentMetaBuilding.get(),
            variant: this.currentVariant.get(),
        });

        if (entity) {
            // Succesfully placed, find which entity we actually placed
            this.root.signals.entityManuallyPlaced.dispatch(entity);

            // Check if we should flip the orientation (used for tunnels)
            if (
                metaBuilding.getFlipOrientationAfterPlacement() &&
                !this.root.keyMapper.getBinding(
                    KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation
                ).pressed
            ) {
                this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
            }

            // Check if we should stop placement
            if (
                !metaBuilding.getStayInPlacementMode() &&
                !this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.placeMultiple).pressed &&
                !this.root.app.settings.getAllSettings().alwaysMultiplace
            ) {
                // Stop placement
                this.currentMetaBuilding.set(null);
            }
            return true;
        } else {
            return false;
        }
    }


    onSelectedMetaBuildingChanged(metaBuilding) {
        this.abortDragging();
        this.root.hud.signals.selectedPlacementBuildingChanged.dispatch(metaBuilding);
        if (metaBuilding) {
            const availableVariants = metaBuilding.getAvailableVariants(this.root);
            const preferredVariant = this.preferredVariants[metaBuilding.getId()];

            // Choose last stored variant if possible, otherwise the default one
            let variant;
            if (!preferredVariant || !availableVariants.includes(preferredVariant)) {
                variant = availableVariants[0];
            } else {
                variant = preferredVariant;
            }

            this.currentVariant.set(variant);

            // @ts-ignore
            this.fakeEntity = new Entity(null);
            metaBuilding.setupEntityComponents(this.fakeEntity, null);


            this.fakeEntity.addComponent(
                new StaticMapEntityComponent({
                    origin: new Vector(0, 0),
                    rotation: 0,
                    //@ts-ignore
                    mirrored: false,
                    tileSize: metaBuilding.getDimensions(this.currentVariant.get()).copy(),
                    code: getCodeFromBuildingData(metaBuilding, variant, 0),
                })
            );
            metaBuilding.updateVariants(this.fakeEntity, 0, this.currentVariant.get());
        } else {
            this.fakeEntity = null;
        }

        // Since it depends on both, rerender twice
        this.signals.variantChanged.dispatch();
    }
}