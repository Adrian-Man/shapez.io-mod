import { makeDiv, makeDivElement } from "shapez/core/utils";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { HUDGameMenu } from "shapez/game/hud/parts/game_menu";
import { KEYMAPPINGS } from "shapez/game/key_action_mapper";

/**
 * @this {HUDGameMenu}
 */
export function postCreateMenuElements() {
    const button = makeDivElement(null, ["button", "research"]);

    this.element.insertBefore(button, this.element.firstChild);
    // @ts-ignore
    const research = this.root.hud.parts.research;
    const handler = () => research.show();
    const visible = () => this.root.hubGoals.level > 12;
    const badge = () => research.getAvailableResearch();

    this.trackClicks(button, handler);

    // @ts-ignore
    const binding = this.root.keyMapper.getBinding(KEYMAPPINGS.mods.menuOpenResearch);
    binding.add(() => {
        if (visible()) {
            handler();
        }
    });

    this.visibilityToUpdate.push({
        button,
        condition: visible,
        domAttach: new DynamicDomAttach(this.root, button),
    });

    const badgeElement = makeDiv(button, null, ["badge"]);
    this.badgesToUpdate.push({
        badge,
        lastRenderAmount: 0,
        button,
        badgeElement,
        notification: null,
        condition: visible,
    });
}
