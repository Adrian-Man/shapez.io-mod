// clone from SI with slight modification
import { ItemEjectorComponent } from "shapez/game/components/item_ejector";
import { Entity } from "shapez/game/entity";
import { defaultBuildingVariant, MetaBuilding } from "shapez/game/meta_building";
import { GameRoot } from "shapez/savegame/savegame";
import { T } from "shapez/translations";
import { formatItemsPerSecond, generateMatrixRotations } from "shapez/core/utils";
import { BeltUnderlaysComponent } from "shapez/game/components/belt_underlays";
import { enumDirection, Vector } from "shapez/core/vector";
import { ItemAcceptorComponent } from "shapez/game/components/item_acceptor";
import { THEME } from "shapez/game/theme";
import { MetaBalancerBuilding } from "shapez/game/buildings/balancer";
import { BeltCrossingComponent } from "../components_systems/belt_crossing";

/** @enum {string} */
export const enumBeltCrossingVariants = { corner: "corner", switcher: "switcher" };

/** @enum {string} */
export const enumBeltCrossingResearch = {
    reward_belt_crossing : "reward_belt_crossing",
    reward_corner_crossing : "reward_corner_crossing",
    reward_line_crossing : "reward_line_crossing",
};

const overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    [enumBeltCrossingVariants.corner]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    [enumBeltCrossingVariants.switcher]: null,
};

export class MetaBeltCrossingBuilding extends MetaBuilding {
    constructor() {
        super("belt_crossing");
    }

    static getAllVariantCombinations() {
        return [
            {
                name: "Belt Crossing",
                description: "Crosses two belts over each other, with no interaction between them",
                variant: defaultBuildingVariant,
            },
            {
                name: "Corner Crossing",
                description: "Crosses two corner belts over each other",
                variant: enumBeltCrossingVariants.corner,
            },
            {
                name: "Line Crossing",
                description: "Swaps two adjacent belts over each other",
                variant: enumBeltCrossingVariants.switcher,
            },
        ];
    }

    getDimensions(variant) {
        switch (variant) {
            case enumBeltCrossingVariants.switcher:
                return new Vector(2, 1);
            case defaultBuildingVariant:
            case enumBeltCrossingVariants.corner:
                return new Vector(1, 1);
            default:
                assertAlways(false, "Unknown crossing variant: " + variant);
        }
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        const matrix = overlayMatrices[variant];
        if (matrix) {
            return matrix[rotation];
        }
        return null;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getBeltBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    getSilhouetteColor() {
        return THEME.map.chunkOverview.beltColor;
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        /** @type {Array<string>} */
        const available = [];
        if (root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_belt_crossing)) {
            available.push(defaultBuildingVariant);
        }
        if (root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_corner_crossing)) {
            available.push(enumBeltCrossingVariants.corner);
        }
        if (root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_line_crossing)) {
            available.push(enumBeltCrossingVariants.switcher);
        }
        return available;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_belt_crossing) ||
            root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_corner_crossing) ||
            root.hubGoals.isRewardUnlocked(enumBeltCrossingResearch.reward_line_crossing)
            ;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({ slots: [], })
        );

        entity.addComponent(
            new ItemEjectorComponent({ slots: [], renderFloatingItems: false, })
        );

        entity.addComponent(new BeltCrossingComponent());

        entity.addComponent(new BeltUnderlaysComponent({ underlays: [] }));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ];
                break;
            }
            case enumBeltCrossingVariants.corner: {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                    { pos: new Vector(0, 0), direction: enumDirection.left },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(0, 0), direction: enumDirection.right },
                ];
                break;
            }
            case enumBeltCrossingVariants.switcher: {
                entity.components.ItemAcceptor.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom },
                    { pos: new Vector(1, 0), direction: enumDirection.bottom },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);

                entity.components.BeltUnderlays.underlays = [
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ];
                break;
            }
            default:
                assertAlways(false, "Unknown balancer variant: " + variant);
        }
    }
}

export function addBeltCrossing(modInterface) {
    modInterface.registerNewBuilding({ metaClass: MetaBeltCrossingBuilding });

    // add building to toolbar, infront of balancer
    modInterface.addNewBuildingToToolbar({
        toolbar: "regular",
        location: "primary",
        metaClass: MetaBeltCrossingBuilding,
        before: MetaBalancerBuilding,
    });
}
