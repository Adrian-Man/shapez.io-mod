import { globalConfig } from "shapez/core/config";
import { Vector } from "shapez/core/vector";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { StaticMapEntityComponent } from "shapez/game/components/static_map_entity";
import { Entity } from "shapez/game/entity";
import { HUDBuildingPlacer } from "shapez/game/hud/parts/building_placer";
import { KEYMAPPINGS } from "shapez/game/key_action_mapper";

export function setupMirrorableBuildingPlacerLogic(modInterface) {
    modInterface.extendClass(HUDBuildingPlacer, ({ $old }) => ({
        // HUDBuildingPlacerLogic
        initialize() {
            $old.initialize.bind(this)();

            this.currentMirroredGeneral = false;
            this.preferredMirrored = {};
        },

        initializeBindings() {
            $old.initializeBindings.bind(this)();
            this.root.keyMapper.getBindingById("mirror").add(this.tryMirror, this);
        },

        tryMirror() {
            const selectedBuilding = this.currentMetaBuilding.get();
            if (selectedBuilding) {
                this.currentMirrored = !this.currentMirrored;
                const staticComp = this.fakeEntity.components.StaticMapEntity;
                staticComp.mirrored = this.currentMirrored;
            }
        },

        tryPlaceCurrentBuildingAt(tile) {
            if (this.root.camera.getIsMapOverlayActive()) {
                // Dont allow placing in overview mode
                return false;
            }

            const metaBuilding = this.currentMetaBuilding.get();
            const { rotation, rotationVariant, mirrored } =
                metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
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
                mirrored: this.currentMirrored,
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
        },

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
                        tileSize: metaBuilding.getDimensions(this.currentVariant.get()).copy(),
                        code: getCodeFromBuildingData(metaBuilding, variant, 0),
                    })
                );
                this.fakeEntity.components.StaticMapEntity.setMirror(this.mirrored);
                metaBuilding.updateVariants(this.fakeEntity, 0, this.currentVariant.get());
            } else {
                this.fakeEntity = null;
            }

            // Since it depends on both, rerender twice
            this.signals.variantChanged.dispatch();
        },

        // HUDBuildingPlacer
        drawRegularPlacement(parameters) {
            const mousePosition = this.root.app.mousePosition;
            if (!mousePosition) {
                // Not on screen
                return;
            }

            const metaBuilding = this.currentMetaBuilding.get();

            const worldPos = this.root.camera.screenToWorld(mousePosition);
            const mouseTile = worldPos.toTileSpace();

            // Compute best rotation variant
            const { rotation, rotationVariant, mirrored, connectedEntities } =
                metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
                    root: this.root,
                    tile: mouseTile,
                    mirrored: this.currentMirrored,
                    rotation: this.currentBaseRotation,
                    variant: this.currentVariant.get(),
                    layer: metaBuilding.getLayer(),
                });

            // Check if there are connected entities
            if (connectedEntities) {
                for (let i = 0; i < connectedEntities.length; ++i) {
                    const connectedEntity = connectedEntities[i];
                    const connectedWsPoint = connectedEntity.components.StaticMapEntity.getTileSpaceBounds()
                        .getCenter()
                        .toWorldSpace();

                    const startWsPoint = mouseTile.toWorldSpaceCenterOfTile();

                    const startOffset = connectedWsPoint
                        .sub(startWsPoint)
                        .normalize()
                        .multiplyScalar(globalConfig.tileSize * 0.3);
                    const effectiveStartPoint = startWsPoint.add(startOffset);
                    const effectiveEndPoint = connectedWsPoint.sub(startOffset);

                    parameters.context.globalAlpha = 0.6;

                    // parameters.context.lineCap = "round";
                    parameters.context.strokeStyle = "#7f7";
                    parameters.context.lineWidth = 10;
                    parameters.context.beginPath();
                    parameters.context.moveTo(effectiveStartPoint.x, effectiveStartPoint.y);
                    parameters.context.lineTo(effectiveEndPoint.x, effectiveEndPoint.y);
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                    // parameters.context.lineCap = "square";
                }
            }

            // Synchronize rotation and origin
            this.fakeEntity.layer = metaBuilding.getLayer();
            const staticComp = this.fakeEntity.components.StaticMapEntity;
            staticComp.origin = mouseTile;
            staticComp.rotation = rotation;
            staticComp.mirrored = mirrored;
            metaBuilding.updateVariants(this.fakeEntity, rotationVariant, this.currentVariant.get());
            staticComp.code = getCodeFromBuildingData(
                this.currentMetaBuilding.get(),
                this.currentVariant.get(),
                rotationVariant
            );

            const canBuild = this.root.logic.checkCanPlaceEntity(this.fakeEntity, {});

            // Fade in / out
            parameters.context.lineWidth = 1;

            // Determine the bounds and visualize them
            const entityBounds = staticComp.getTileSpaceBounds();
            const drawBorder = -3;
            if (canBuild) {
                parameters.context.strokeStyle = "rgba(56, 235, 111, 0.5)";
                parameters.context.fillStyle = "rgba(56, 235, 111, 0.2)";
            } else {
                parameters.context.strokeStyle = "rgba(255, 0, 0, 0.2)";
                parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
            }

            parameters.context.beginRoundedRect(
                entityBounds.x * globalConfig.tileSize - drawBorder,
                entityBounds.y * globalConfig.tileSize - drawBorder,
                entityBounds.w * globalConfig.tileSize + 2 * drawBorder,
                entityBounds.h * globalConfig.tileSize + 2 * drawBorder,
                4
            );
            parameters.context.stroke();
            // parameters.context.fill();
            parameters.context.globalAlpha = 1;

            // HACK to draw the entity sprite
            const previewSprite = metaBuilding.getBlueprintSprite(rotationVariant, this.currentVariant.get());
            staticComp.origin = worldPos.divideScalar(globalConfig.tileSize).subScalars(0.5, 0.5);
            staticComp.drawSpriteOnBoundsClipped(parameters, previewSprite);
            staticComp.origin = mouseTile;

            // Draw ejectors
            if (canBuild) {
                this.drawMatchingAcceptorsAndEjectors(parameters);
            }
        },
    }));

    Object.defineProperty(HUDBuildingPlacer.prototype, "currentMirrored", {
        get() {
            if (!this.root.app.settings.getAllSettings().rotationByBuilding) {
                return this.currentMirroredGeneral;
            }
            const metaBuilding = this.currentMetaBuilding.get();
            if (metaBuilding && this.preferredMirrored.hasOwnProperty(metaBuilding.getId())) {
                return this.preferredMirrored[metaBuilding.getId()];
            } else {
                return this.currentMirroredGeneral;
            }
        },
        set(mirrored) {
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
        },
    });
}
