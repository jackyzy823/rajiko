import { NHK_PERMISSION, RECOCHOKU_PERMISSION, TVER_PERMISSION } from "../modules/static.js";

document.addEventListener("DOMContentLoaded", async function () {
    let {
        nhkradio_bypass: nhkradio_bypass,
        recochoku_ua: recochoku_ua,
        tver_fix: tver_fix
    } = await chrome.storage.local.get({ "nhkradio_bypass": false, "recochoku_ua": false, "tver_fix": false });

    let nhkradio = document.getElementById("nhkradio");
    nhkradio.checked = nhkradio_bypass === true;

    nhkradio.onclick = async (data) => {
        if (nhkradio.checked) {
            try {
                let permitted = await chrome.permissions.request(NHK_PERMISSION);
                if (!permitted) {
                    nhkradio.checked = false;
                    return;
                }
            } catch {
                nhkradio.checked = false;
                return;
            }
        }
        await chrome.storage.local.set({ "nhkradio_bypass": nhkradio.checked });
        await chrome.runtime.sendMessage({ "update-nhkradio": nhkradio.checked ? "yes" : "no" });
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

    let tver = document.getElementById("tver");

    tver.checked = tver_fix === true;

    tver.onclick = async (data) => {
        if (tver.checked) {
            try {
                let permitted = await chrome.permissions.request(TVER_PERMISSION);
                if (!permitted) {
                    tver.checked = false;
                    return;
                }
            } catch {
                tver.checked = false;
                return;
            }
        }
        await chrome.storage.local.set({ "tver_fix": tver.checked });
        await chrome.runtime.sendMessage({ "update-tver": tver.checked ? "yes" : "no" });
    }
});
