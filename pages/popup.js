import { regions, areaListParRegion, radioAreaId } from "../modules/constants.js";
function loadArea(regionIdx) {
    let area_select = document.getElementById("rajiko-area");
    while (area_select.lastChild) {
        area_select.removeChild(area_select.lastChild);
    }
    let id = regions[regionIdx].id;
    let areas = areaListParRegion[id];
    for (let i = 0; i < areas.length; i++) {
        let tmp = document.createElement("option");
        tmp.setAttribute("id", areas[i].id);
        tmp.innerText = areas[i].name;
        area_select.appendChild(tmp);
    }
}

// Looks not necessary for `tmpUrl`, timeshift only change `url`
function stripM3u8link(link) {
    let m3u8link = new URL(link);
    m3u8link.search = "?" + m3u8link.search.slice(1).split('&').filter((kv) => {
        let [k, v] = kv.split('=');
        if (["seek"].includes(k)) {
            return false;
        } else {
            return true
        }

    }).join("&");
    return m3u8link.toString();
}


document.addEventListener("DOMContentLoaded", async function () {
    //define event
    let region_select = document.getElementById("rajiko-region");
    region_select.onchange = function (data) {
        loadArea(this.selectedIndex);
    };

    let area_select = document.getElementById("rajiko-area");

    let confirm_button = document.getElementById("rajiko-confirm");
    confirm_button.innerText = chrome.i18n.getMessage("confirm_button");

    let { selected_areaid: area_id } = await chrome.storage.local.get("selected_areaid");

    confirm_button.onclick = async function (data) {
        let area = document.getElementById("rajiko-area");
        if (area_id && area_id == area) {
            //same area;
            window.close();
        } else {
            // Wake up service worker? Is this a bug?
            // await chrome.runtime.sendMessage({});
            // Send command
            await chrome.runtime.sendMessage({ "update-area": area.selectedOptions[0].id });
            chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
                if (!arrayOfTabs || arrayOfTabs.length < 1) { return }
                let tab = arrayOfTabs[0];
                if (/radiko\.jp/.test(tab.url)) {
                    chrome.tabs.reload(tab.id);
                }
                // in Windows ,chrome display extension's alert in it's own popup window however size is too small for alert window to close.
                window.close();
            });
        }
    };

    if (!area_id) { area_id = "JP13"; }

    for (let i = 0; i < regions.length; i++) {
        let tmp = document.createElement("option");
        tmp.setAttribute("id", regions[i].id);
        tmp.innerText = regions[i].name;
        region_select.appendChild(tmp);
    }

    Object.keys(areaListParRegion).forEach(function (key, keyindex) {
        for (let i = 0; i < areaListParRegion[key].length; i++) {
            if (areaListParRegion[key][i].id == area_id) {
                region_select.selectedIndex = keyindex
                loadArea(keyindex);
                area_select.selectedIndex = i;
            }
        }
    });

    let download_button = document.getElementById("rajiko-download");
    let record_button = document.getElementById("rajiko-record");

    let { timeshift_list: timeshift_list } = await chrome.storage.local.get({ "timeshift_list": [] });
    let { current_recording: current_recording } = await chrome.storage.session.get("current_recording");

    if (current_recording) {
        record_button.hidden = false;
        record_button.innerText = chrome.i18n.getMessage("record_button_to_stop");
        record_button.onclick = async function (data) {
            await chrome.runtime.sendMessage({ "stop-recording": true });
            window.close();
        }
    }

    let tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
        url: "*://radiko.jp/*"
    });
    if (tabs && tabs.length >= 1 && tabs[0]) {
        let [tab] = tabs;
        let inject_results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return {
                    tmpUrl: document.getElementById('tmpUrl') && document.getElementById('tmpUrl').value,
                    url: document.getElementById('url') && document.getElementById('url').value
                }
            }
        });
        if (inject_results && inject_results.length >= 1 && inject_results[0] && !chrome.runtime.lastError) {
            let { result } = inject_results[0];
            let href = tab.url;
            let url = result && result.url || ''; // #RADIO or http://m3u8list
            let tmpUrl = result && result.tmpUrl || '';  // #RADIO or http://m3u8list

            // only show live recoding when current no work.
            if (!current_recording) {
                if (url[0] == '#') {
                    //playing live
                    record_button.hidden = false;
                    record_button.innerText = chrome.i18n.getMessage("record_button_to_start", radioAreaId[url.slice(1)].name);
                    record_button.onclick = async function (data) {
                        // We have tabId already.
                        await chrome.runtime.sendMessage({ "start-recording": url.slice(1), "tabId": tab.id });
                        window.close();
                    }
                } else if (tmpUrl[0] == '#' && /\/live\//.test(href)) {
                    //viewing live
                    // TODO this may not work , since service worker's life time issue....
                    // We should keep service worker alive now.... send a param keepalive ...?
                    record_button.hidden = false;
                    record_button.innerText = chrome.i18n.getMessage("record_button_to_prepare", radioAreaId[tmpUrl.slice(1)].name);
                    record_button.onclick = async function (data) {
                        await chrome.runtime.sendMessage({ "start-recording": tmpUrl.slice(1), "tabId": tab.id });
                        window.close();
                    }
                }
            }
            if (tmpUrl.indexOf("https://radiko.jp/v2/api/ts/playlist.m3u8") != -1 && /\/ts\//.test(href)) {
                let stripedLink = stripM3u8link(tmpUrl);
                if (!timeshift_list.includes(stripedLink)) {
                    //viewing timeshift
                    download_button.hidden = false;
                    download_button.innerText = chrome.i18n.getMessage("timeshift_button");
                    download_button.onclick = async function () {
                        await chrome.runtime.sendMessage({ "download-timeshift": stripedLink });
                        window.close();
                    }
                }
            }
        }
    }
});



