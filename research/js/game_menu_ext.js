<<<<<<< Updated upstream
import { makeDiv } from "shapez/core/utils";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { enumNotificationType } from "shapez/game/hud/parts/notifications";
import { KEYMAPPINGS } from "shapez/game/key_action_mapper";
import { T } from "shapez/translations";

export const GameMenuExtension = ({ $old }) => ({
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_GameMenu");

        const buttons = [
            {
                id: "research",
                label: "Research",
                handler: () => this.root.hud.parts.research.show(),
                keybinding: KEYMAPPINGS.mods.menuOpenResearch,
                visible: () => this.root.hubGoals.level > 12,
                badge: () => this.root.hud.parts.research.getAvailableResearch(),
            },
            {
                id: "shop",
                label: "Upgrades",
                handler: () => this.root.hud.parts.shop.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenShop,
                badge: () => this.root.hubGoals.getAvailableUpgradeCount(),
                notification: /** @type {[string, enumNotificationType]} */ ([
                    T.ingame.notifications.newUpgrade,
                    enumNotificationType.upgrade,
                ]),
                visible: () => 
                    this.root.hubGoals.level >= 3,
            },
            {
                id: "stats",
                label: "Stats",
                // @ts-ignore
                handler: () => this.root.hud.parts.statistics.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenStats,
                visible: () =>
                    !this.root.app.settings.getAllSettings().offerHints || this.root.hubGoals.level >= 3,
            },
        ];

        /** @type {Array<{
         * badge: function,
         * button: HTMLElement,
         * badgeElement: HTMLElement,
         * lastRenderAmount: number,
         * condition?: function,
         * notification: [string, enumNotificationType]
         * }>} */
        this.badgesToUpdate = [];

        /** @type {Array<{
         * button: HTMLElement,
         * condition: function,
         * domAttach: DynamicDomAttach
         * }>} */
        this.visibilityToUpdate = [];

        buttons.forEach(({ id, label, handler, keybinding, badge, notification, visible }) => {
            const button = document.createElement("button");
            button.classList.add(id);
            this.element.appendChild(button);
            this.trackClicks(button, handler);

            if (keybinding) {
                const binding = this.root.keyMapper.getBinding(keybinding);
                binding.add(() => {
                    if (visible()) {
                        handler();
                    }
                });
            }

            if (visible) {
                this.visibilityToUpdate.push({
                    button,
                    condition: visible,
                    domAttach: new DynamicDomAttach(this.root, button),
                });
            }

            if (badge) {
                const badgeElement = makeDiv(button, null, ["badge"]);
                this.badgesToUpdate.push({
                    badge,
                    lastRenderAmount: 0,
                    button,
                    badgeElement,
                    notification,
                    condition: visible,
                });
            }
        });

        this.saveButton = makeDiv(this.element, null, ["button", "save", "animEven"]);
        this.settingsButton = makeDiv(this.element, null, ["button", "settings"]);

        this.trackClicks(this.saveButton, this.startSave);
        this.trackClicks(this.settingsButton, this.openSettings);
    }
=======
import { makeDiv } from "shapez/core/utils";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { enumNotificationType } from "shapez/game/hud/parts/notifications";
import { KEYMAPPINGS } from "shapez/game/key_action_mapper";
import { T } from "shapez/translations";

export const GameMenuExtension = ({ $super, $old }) => ({
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_GameMenu");

        const buttons = [
            {
                id: "research",
                label: "Research",
                handler: () => this.root.hud.parts.research.show(),
                // @ts-ignore
                keybinding: KEYMAPPINGS.mods.menuOpenResearch,
                visible: () => this.root.hubGoals.level > 12,
                badge: () => this.root.hud.parts.research.getAvailableResearch(),
            },
            {
                id: "shop",
                label: "Upgrades",
                handler: () => this.root.hud.parts.shop.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenShop,
                badge: () => this.root.hubGoals.getAvailableUpgradeCount(),
                notification: /** @type {[string, enumNotificationType]} */ ([
                    T.ingame.notifications.newUpgrade,
                    enumNotificationType.upgrade,
                ]),
                visible: () => 
                    this.root.hubGoals.level >= 3,
            },
            {
                id: "stats",
                label: "Stats",
                handler: () => this.root.hud.parts.statistics.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenStats,
                visible: () =>
                    !this.root.app.settings.getAllSettings().offerHints || this.root.hubGoals.level >= 3,
            },
        ];

        /** @type {Array<{
         * badge: function,
         * button: HTMLElement,
         * badgeElement: HTMLElement,
         * lastRenderAmount: number,
         * condition?: function,
         * notification: [string, enumNotificationType]
         * }>} */
        this.badgesToUpdate = [];

        /** @type {Array<{
         * button: HTMLElement,
         * condition: function,
         * domAttach: DynamicDomAttach
         * }>} */
        this.visibilityToUpdate = [];

        buttons.forEach(({ id, label, handler, keybinding, badge, notification, visible }) => {
            const button = document.createElement("button");
            button.classList.add(id);
            this.element.appendChild(button);
            this.trackClicks(button, handler);

            if (keybinding) {
                const binding = this.root.keyMapper.getBinding(keybinding);
                binding.add(() => {
                    if (visible()) {
                        handler();
                    }
                });
            }

            if (visible) {
                this.visibilityToUpdate.push({
                    button,
                    condition: visible,
                    domAttach: new DynamicDomAttach(this.root, button),
                });
            }

            if (badge) {
                const badgeElement = makeDiv(button, null, ["badge"]);
                this.badgesToUpdate.push({
                    badge,
                    lastRenderAmount: 0,
                    button,
                    badgeElement,
                    notification,
                    condition: visible,
                });
            }
        });

        this.saveButton = makeDiv(this.element, null, ["button", "save", "animEven"]);
        this.settingsButton = makeDiv(this.element, null, ["button", "settings"]);

        this.trackClicks(this.saveButton, this.startSave);
        this.trackClicks(this.settingsButton, this.openSettings);
    }
>>>>>>> Stashed changes
});