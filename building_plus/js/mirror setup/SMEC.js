
//@ts-nocheck
import { globalConfig } from "shapez/core/config";
import { Rectangle } from "shapez/core/rectangle";
import { enumDirection, Vector } from "shapez/core/vector";
import { StaticMapEntityComponent } from "shapez/game/components/static_map_entity";
import { ModInterface } from "shapez/mods/mod_interface";
import { types } from "shapez/savegame/serialization";



/**
 * 
 * @param {ModInterface} $ 
 */
export const setupMirrorableSMEComponent = ($) => {
    // Update vector things too
    Vector.flipDirectionOverYAxis = function (direction) {
        if(direction == enumDirection.top || direction == enumDirection.bottom) return direction;
        return direction === enumDirection.left ? enumDirection.right : enumDirection.left;
    }

    Vector.flipDirectionOverXAxis = function (direction) {
        if(direction == enumDirection.left || direction == enumDirection.right) return direction;
        return direction === enumDirection.top ? enumDirection.bottom : enumDirection.top;
    }

    shapez.StaticMapEntityComponent.getId = () => "oldStaticMapEntity"
    shapez.StaticMapEntityComponent = class extends StaticMapEntityComponent {
        static getId() {
            return "StaticMapEntity"
        }

        static getSchema(){
            return {
                origin: types.tileVector,
                rotation: types.float,
                originalRotation: types.float,
    
                // See building_codes.js
                code: types.uintOrString,
                mirrored: types.bool
            }
        };

        copyAdditionalStateTo(otherComponent) {
            return new shapez.StaticMapEntityComponent({
                origin: this.origin.copy(),
                rotation: this.rotation,
                originalRotation: this.originalRotation,
                code: this.code,
                mirrored: this.mirrored
            });
        }

        constructor(obj) {
            super(obj);
            this.mirrored = obj.mirrored;
        }

        getTileSpaceBounds() {
            const size = this.getTileSize();
            if(!this.mirrored) {
                switch (this.rotation) {
                    case 0:
                        return new Rectangle(this.origin.x, this.origin.y, size.x, size.y);
                    case 90:
                        return new Rectangle(this.origin.x - size.y + 1, this.origin.y, size.y, size.x);
                    case 180:
                        return new Rectangle(this.origin.x - size.x + 1, this.origin.y - size.y + 1, size.x, size.y);
                    case 270:
                        return new Rectangle(this.origin.x, this.origin.y - size.x + 1, size.y, size.x);
                    default:
                        assert(false, "Invalid rotation");
                }
            } else {
                switch (this.rotation) {
                    case 0:
                        return new Rectangle(this.origin.x - size.x + 1, this.origin.y, size.x, size.y);
                    case 90:
                        return new Rectangle(this.origin.x - size.y + 1, this.origin.y - size.x + 1, size.y, size.x);
                    case 180:
                        return new Rectangle(this.origin.x, this.origin.y - size.y + 1, size.x, size.y);
                    case 270:
                        return new Rectangle(this.origin.x, this.origin.y, size.y, size.x);
                    default:
                        assert(false, "Invalid rotation");
                }
            }
        }

        localDirectionToWorld(direction) {
            const dir = Vector.transformDirectionFromMultipleOf90(direction, this.rotation);

            if(!this.mirrored) {
                return dir;
            } else {
                return this.rotation % 180 === 0
                    ? Vector.flipDirectionOverYAxis(dir)
                    : Vector.flipDirectionOverXAxis(dir)
            }
        }

        worldDirectionToLocal(direction) {
            const dir = Vector.transformDirectionFromMultipleOf90(direction, 360 - this.rotation);

            if(!this.mirrored) {
                return dir;
            } else {
                return this.rotation % 180 === 0
                    ? Vector.flipDirectionOverYAxis(dir)
                    : Vector.flipDirectionOverXAxis(dir)
            }        
        }

        localTileToWorld(localTile) {
            const result = localTile.rotateFastMultipleOf90(this.rotation);
            if(!this.mirrored) {
                result.x += this.origin.x;
                result.y += this.origin.y;    
            } else {
                if(this.rotation % 180 == 0 ) {
                    result.x = this.origin.x - result.x;
                    result.y += this.origin.y;
                } else {
                    result.x += this.origin.x;
                    result.y = this.origin.y - result.y;
                }
            }
            return result;
        }

        worldToLocalTile(worldTile) {
            let localUnrotated = worldTile.copy(); 
            if(this.mirrored) {
                if(this.rotation % 180 == 0 ) {
                    // Flip over Y axis
                    localUnrotated.x = -localUnrotated.x + this.origin;
                } else {
                    localUnrotated.y = -localUnrotated.y + this.origin;
                }
            }

            localUnrotated = worldTile.sub(this.origin);
            return this.unapplyRotationToVector(localUnrotated);
        }

        drawSpriteOnBoundsClipped(parameters, sprite, extrudePixels = 0, overridePosition = null) {
            if (!this.shouldBeDrawn(parameters) && !overridePosition) {
                return;
            }
            const size = this.getTileSize();
            let worldX = this.origin.x * globalConfig.tileSize;
            let worldY = this.origin.y * globalConfig.tileSize;

            if (overridePosition) {
                worldX = overridePosition.x * globalConfig.tileSize;
                worldY = overridePosition.y * globalConfig.tileSize;
            }

            const flip = () => {
                if(this.rotation % 90 === 0 ) {
                    parameters.context.scale(-1, 1)
                } else {
                    parameters.context.scale(1, -1)
                }
            }
            if (this.rotation === 0 && !this.mirrored) {
                // Early out, is faster
                sprite.drawCached(
                    parameters,
                    worldX - extrudePixels * size.x,
                    worldY - extrudePixels * size.y,
                    globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                    globalConfig.tileSize * size.y + 2 * extrudePixels * size.y
                );
            } else if(this.rotation === 0) {
                const rotationCenterX = worldX + globalConfig.halfTileSize;
                const rotationCenterY = worldY + globalConfig.halfTileSize;

                parameters.context.translate(rotationCenterX, rotationCenterY);
                flip();
                sprite.drawCached(
                    parameters,
                    -globalConfig.halfTileSize - extrudePixels * size.x,
                    -globalConfig.halfTileSize - extrudePixels * size.y,
                    globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                    globalConfig.tileSize * size.y + 2 * extrudePixels * size.y,
                    false // no clipping possible here
                );
                flip();
                parameters.context.translate(-rotationCenterX, -rotationCenterY);
            } else if(!this.mirrored) {
                const rotationCenterX = worldX + globalConfig.halfTileSize;
                const rotationCenterY = worldY + globalConfig.halfTileSize;

                parameters.context.translate(rotationCenterX, rotationCenterY);
                //@ts-ignore
                parameters.context.rotate(Math.radians(this.rotation));
                sprite.drawCached(
                    parameters,
                    -globalConfig.halfTileSize - extrudePixels * size.x,
                    -globalConfig.halfTileSize - extrudePixels * size.y,
                    globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                    globalConfig.tileSize * size.y + 2 * extrudePixels * size.y,
                    false // no clipping possible here
                );
                //@ts-ignore
                parameters.context.rotate(-Math.radians(this.rotation));
                parameters.context.translate(-rotationCenterX, -rotationCenterY);
            } else {
                const rotationCenterX = worldX + globalConfig.halfTileSize;
                const rotationCenterY = worldY + globalConfig.halfTileSize;

                parameters.context.translate(rotationCenterX, rotationCenterY);
                //@ts-ignore
                parameters.context.rotate(Math.radians(this.rotation));
                flip();
                sprite.drawCached(
                    parameters,
                    -globalConfig.halfTileSize - extrudePixels * size.x,
                    -globalConfig.halfTileSize - extrudePixels * size.y,
                    globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                    globalConfig.tileSize * size.y + 2 * extrudePixels * size.y,
                    false // no clipping possible here
                );
                //@ts-ignore
                flip();
                parameters.context.rotate(-Math.radians(this.rotation));
                parameters.context.translate(-rotationCenterX, -rotationCenterY);
            }
        }
    }


}