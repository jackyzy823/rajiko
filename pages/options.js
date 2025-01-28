import { BONUS_PERMISSION, RECOCHOKU_PERMISSION } from "../modules/static.js";
import { isFirefox } from "../modules/util.js";

document.addEventListener("DOMContentLoaded", async function () {
    let { bonus_feature: bonus_feature,
        recochoku_ua: recochoku_ua
    } = await chrome.storage.local.get({ "bonus_feature": false, "recochoku_ua": false });

    let firefox_permissions_instruction = document.getElementById("firefox_permissions_instruction")
    let bonus = document.getElementById("bonus");
    bonus.checked = bonus_feature === true;

    bonus.onclick = async (data) => {
        if (bonus.checked) {
            let matched = await chrome.permissions.contains(BONUS_PERMISSION);
            if (!matched) {
                if (isFirefox()) {
                    if (firefox_permissions_instruction.hidden) {
                        firefox_permissions_instruction.hidden = false;
                        alert(chrome.i18n.getMessage("firefox_optional_permissions_alert"));
                    }
                } else {
                    // Need user gestures.
                    try {
                        let permitted = await chrome.permissions.request(BONUS_PERMISSION)
                        if (!permitted) {
                            return;
                        }
                    } catch {
                        bonus.checked = false;
                        return;
                    }
                }
            }
        }
        await chrome.storage.local.set({ "bonus_feature": bonus.checked });
        await chrome.runtime.sendMessage({ "update-bonus": bonus.checked ? "yes" : "no" });
    };

    let recochoku = document.getElementById("recochoku");

    recochoku.checked = recochoku_ua === true;

    recochoku.onclick = async (data) => {
        if (recochoku.checked) {
            let matched = await chrome.permissions.contains(RECOCHOKU_PERMISSION);
            if (!matched) {
                if (isFirefox()) {
                    if (firefox_permissions_instruction.hidden) {
                        firefox_permissions_instruction.hidden = false;
                        alert(chrome.i18n.getMessage("firefox_optional_permissions_alert"));
                    }
                } else {
                    try {
                        let permitted = await chrome.permissions.request(RECOCHOKU_PERMISSION)
                        if (!permitted) {
                            return;
                        }
                    } catch {
                        recochoku.checked = false;
                        return;
                    }
                }

            }
        }
        await chrome.storage.local.set({ "recochoku_ua": recochoku.checked });
        await chrome.runtime.sendMessage({ "update-recochoku": recochoku.checked ? "yes" : "no" });
    }
});