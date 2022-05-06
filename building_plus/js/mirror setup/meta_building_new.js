import { Vector } from "shapez/core/vector";
import { MetaBeltBuilding } from "shapez/game/buildings/belt";
import { MetaComparatorBuilding } from "shapez/game/buildings/comparator";
import { MetaConstantProducerBuilding } from "shapez/game/buildings/constant_producer";
import { MetaConstantSignalBuilding } from "shapez/game/buildings/constant_signal";
import { MetaDisplayBuilding } from "shapez/game/buildings/display";
import { MetaLeverBuilding } from "shapez/game/buildings/lever";
import { MetaLogicGateBuilding } from "shapez/game/buildings/logic_gate";
import { MetaMinerBuilding } from "shapez/game/buildings/miner";
import { MetaReaderBuilding } from "shapez/game/buildings/reader";
import { MetaRotaterBuilding } from "shapez/game/buildings/rotater";
import { MetaTrashBuilding } from "shapez/game/buildings/trash";
import { MetaUndergroundBeltBuilding } from "shapez/game/buildings/underground_belt";
import { MetaWireBuilding } from "shapez/game/buildings/wire";
import { MetaWireTunnelBuilding } from "shapez/game/buildings/wire_tunnel";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { StaticMapEntityComponent } from "shapez/game/components/static_map_entity";
import { Entity } from "shapez/game/entity";
import { MetaBuilding } from "shapez/game/meta_building";
import { ModInterface } from "shapez/mods/mod_interface";


const setupNonMirrorableBuildings = () => {
    const buildings = [
        MetaBeltBuilding, 
        MetaUndergroundBeltBuilding, 
        MetaTrashBuilding, 
        MetaMinerBuilding, 
        MetaRotaterBuilding,
        MetaConstantProducerBuilding,
        MetaReaderBuilding,
        MetaLeverBuilding,
        MetaDisplayBuilding,
        MetaWireBuilding,
        MetaWireTunnelBuilding,
        MetaConstantSignalBuilding,
        MetaLogicGateBuilding,
        MetaComparatorBuilding,
    ]

    buildings.forEach(building => {
        //@ts-ignore
        building.prototype.getIsMirrorable = () => false;
    })
}

/**
 * 
 * @param {ModInterface} $ 
 */
 export const setupMirrorableMetaBuilding = ($) => {
    //@ts-ignore
    $.replaceMethod(MetaBuilding, "createEntity", function(old, [{ root, origin, rotation, mirrored = false, originalRotation, rotationVariant, variant }]) {
        // @ts-ignore
        const entity = new Entity(root);
        entity.layer = this.getLayer();
        entity.addComponent(
            new StaticMapEntityComponent({
                origin: new Vector(origin.x, origin.y),
                rotation,
                originalRotation,
                //@ts-ignore
                mirrored,
                tileSize: this.getDimensions(variant).copy(),
                code: getCodeFromBuildingData(this, variant, rotationVariant),
            })
        );
        this.setupEntityComponents(entity, root);
        this.updateVariants(entity, rotationVariant, variant);
        return entity;
    })

    //@ts-ignore
    MetaBuilding.prototype.getIsMirrorable = function() {
        return true;
    } 

    setupNonMirrorableBuildings();
   

    $.replaceMethod(MetaBuilding, "computeOptimalDirectionAndRotationVariantAtTile", function(old, [{ root, tile, rotation, variant, layer, mirrored }]){
        return {
            rotation: this.getIsRotateable() ? rotation : 0,
            //@ts-ignore
            mirrored: this.getIsMirrorable() ? mirrored : false,
            rotationVariant: 0,
        };
    })
}