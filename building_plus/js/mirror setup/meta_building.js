import { Vector } from "shapez/core/vector";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { Entity } from "shapez/game/entity";
import { MetaBuilding } from "shapez/game/meta_building";
import { MetaAnalyzerBuilding } from "shapez/game/buildings/analyzer";
import { MetaBalancerBuilding } from "shapez/game/buildings/balancer";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaFilterBuilding } from "shapez/game/buildings/filter";
import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaPainterBuilding } from "shapez/game/buildings/painter";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { MetaStorageBuilding } from "shapez/game/buildings/storage";
import { MetaVirtualProcessorBuilding } from "shapez/game/buildings/virtual_processor";
import { MetaBeltCrossingBuilding } from "../buildings/belt_crossing";
import { StaticMapEntityComponent } from "shapez/game/components/static_map_entity";

function setupMirrorableBuildings() {
    const buildings = [
        MetaBeltCrossingBuilding,
        MetaBalancerBuilding,
        MetaCutterBuilding,
        MetaStackerBuilding,
        MetaMixerBuilding,
        MetaPainterBuilding,
        MetaStorageBuilding,
        MetaFilterBuilding,
        MetaVirtualProcessorBuilding,
        MetaAnalyzerBuilding,
    ];

    buildings.forEach(building => {
        //@ts-ignore
        building.prototype.getIsMirrorable = () => true;
    });
}

export function setupMirrorableMetaBuilding(modInterface) {
    modInterface.extendClass(MetaBuilding, () => ({
        createEntity({
            root,
            origin,
            rotation,
            mirrored = false,
            originalRotation,
            rotationVariant,
            variant,
        }) {
            // @ts-ignore
            const entity = new Entity(root);
            entity.layer = this.getLayer();
            entity.addComponent(
                new StaticMapEntityComponent({
                    origin: new Vector(origin.x, origin.y),
                    rotation,
                    originalRotation,
                    tileSize: this.getDimensions(variant).copy(),
                    // @ts-ignore
                    code: getCodeFromBuildingData(this, variant, rotationVariant),
                })
            );
            entity.components.StaticMapEntity.setMirror(mirrored);
            this.setupEntityComponents(entity, root);
            this.updateVariants(entity, rotationVariant, variant);
            return entity;
        },

        computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer, mirrored }) {
            return {
                rotation: this.getIsRotateable() ? rotation : 0,
                mirrored: this.getIsMirrorable() ? mirrored : false,
                rotationVariant: 0,
            };
        },

        getIsMirrorable() {
            return false;
        },
    }));

    setupMirrorableBuildings();
}
