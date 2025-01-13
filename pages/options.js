import { BONUS_PERMISSION } from "../modules/static.js";

BONUS_PERMISSION
document.addEventListener("DOMContentLoaded", async function () {
    let { bonus_feature: bonus_feature } = await chrome.storage.local.get({ "bonus_feature": false });
    let bonus = document.getElementById("bonus");
    if (bonus_feature === false) {
        bonus.checked = false;
    } else if (bonus_feature === true) {
        bonus.checked = true;
    }
    bonus.onclick = async (data) => {
        if (bonus.checked) {
            let matched = await chrome.permissions.contains(BONUS_PERMISSION);
            if (!matched) {
                // Need user gestures.
                let permitted = await chrome.permissions.request(BONUS_PERMISSION)
                if (!permitted) {
                    return
                }
            }
        }
        await chrome.storage.local.set({ "bonus_feature": bonus.checked });
        await chrome.runtime.sendMessage({ "update-bonus": bonus.checked ? "yes" : "no" });
        // let user close options page.
    };
});