import { getBuildingDataFromCode } from "shapez/game/building_codes";
import { Component } from "shapez/game/component";
import { Entity } from "shapez/game/entity";
import { GameLogic } from "shapez/game/logic";

export function setupMirrorableGameLogic(modInterface) {
    modInterface.replaceMethod(
        GameLogic,
        "tryPlaceBuilding",
        /**  @this GameLogic */
        function (
            $original,
            [{ origin, rotation, rotationVariant, mirrored, originalRotation, variant, building }]
        ) {
            const entity = building.createEntity({
                root: this.root,
                origin,
                rotation,
                mirrored,
                originalRotation,
                rotationVariant,
                variant,
            });
            if (this.checkCanPlaceEntity(entity, {})) {
                this.freeEntityAreaBeforeBuild(entity);
                this.root.map.placeStaticEntity(entity);
                this.root.entityMgr.registerEntity(entity);
                return entity;
            }
            return null;
        }
    );

    modInterface.replaceMethod(
        Entity,
        "clone",
        /**  @this Entity */
        function ($original, []) {
            const staticComp = this.components.StaticMapEntity;
            const buildingData = getBuildingDataFromCode(staticComp.code);

            const clone = buildingData.metaInstance.createEntity({
                root: this.root,
                origin: staticComp.origin,
                originalRotation: staticComp.originalRotation,
                rotation: staticComp.rotation,
                // @ts-ignore
                mirrored: staticComp.mirrored,
                rotationVariant: buildingData.rotationVariant,
                variant: buildingData.variant,
            });

            for (const key in this.components) {
                /** @type {Component} */ this.components[key].copyAdditionalStateTo(clone.components[key]);
            }

            return clone;
        }
    );
}
