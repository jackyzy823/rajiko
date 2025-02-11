import { BONUS_PERMISSION, RECOCHOKU_PERMISSION } from "../modules/static.js";

document.addEventListener("DOMContentLoaded", async function () {
    let { bonus_feature: bonus_feature,
        recochoku_ua: recochoku_ua
    } = await chrome.storage.local.get({ "bonus_feature": false, "recochoku_ua": false });

    let bonus = document.getElementById("bonus");
    bonus.checked = bonus_feature === true;

    bonus.onclick = async (data) => {
        if (bonus.checked) {
            try {
                let permitted = await chrome.permissions.request(BONUS_PERMISSION);
                if (!permitted) {
                    bonus.checked = false;
                    return;
                }
            } catch {
                bonus.checked = false;
                return;
            }
        }
        await chrome.storage.local.set({ "bonus_feature": bonus.checked });
        await chrome.runtime.sendMessage({ "update-bonus": bonus.checked ? "yes" : "no" });
    };

    let recochoku = document.getElementById("recochoku");

    recochoku.checked = recochoku_ua === true;

    recochoku.onclick = async (data) => {
        if (recochoku.checked) {
            try {
                let permitted = await chrome.permissions.request(RECOCHOKU_PERMISSION);
                if (!permitted) {
                    recochoku.checked = false;
                    return;
                }
            } catch {
                recochoku.checked = false;
                return;
            }
        }
        await chrome.storage.local.set({ "recochoku_ua": recochoku.checked });
        await chrome.runtime.sendMessage({ "update-recochoku": recochoku.checked ? "yes" : "no" });
    }
});
