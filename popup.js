import { regions, areaListParRegion, radioAreaId } from "./constants.js";
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


document.addEventListener("DOMContentLoaded", async function () {
    //define event
    let region_select = document.getElementById("rajiko-region");
    region_select.onchange = function (data) {
        loadArea(this.selectedIndex);
    };

    let area_select = document.getElementById("rajiko-area");

    let confirm_button = document.getElementById("rajiko-confirm");
    confirm_button.innerText = chrome.i18n.getMessage("confirm_button");

    confirm_button.onclick = function (data) {
        let area = document.getElementById("rajiko-area");
        chrome.storage.local.get("selected_areaid", function (data) {
            if (data["selected_areaid"] && data["selected_areaid"] == area) {
                //same area;
                window.close();
            }
            else {
                chrome.runtime.sendMessage({ "update-area": area.selectedOptions[0].id });
                chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
                    let tab = arrayOfTabs[0];
                    if (/radiko\.jp/.test(tab.url)) {
                        chrome.tabs.reload(tab.id);
                    }
                    // in Windows ,chrome display extension's alert in it's own popup window however size is too small for alert window to close.
                    window.close();
                });
            }
        });

    };

    //load region and area
    //TODO : via message not via local.get to fasten when recording or downloading
    chrome.runtime.sendMessage({ "get-area": true }, function (data) {
        let area_id = data["get-area"];
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
    });




    //should hide record button from other pages than radiko.
    //what radio
    //// html <div id="player-area" class="player-default">
    //// <input type="hidden" id="url" value="#BAYFM78">
    //// <input type="hidden" id="tmpUrl" value="#LFR">
    // tmpUrl is the page you view
    // the url is really playing ,but no url when no playing .
    // <input id="url" value="https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=RADIONAME&amp;l=15&amp;ft=FROMTTIME&amp;to=TOTIME&amp;seek=SEEK" type="hidden">
    // <input id="tmpUrl" value="https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=ANOTHERORSAME&amp;l=15&amp;ft=FROMTTIME&amp;to=TOTIME" type="hidden">
    //
    let record_button = document.getElementById("rajiko-record");
    let download_button = document.getElementById("rajiko-download");
    // only download viewing timeshift not playing 
    // recording playing first ,if not exisit recording viewing.


    let localdata = await chrome.storage.local.get({ "current_recording": false, "timeshift_list": [] });
    // Always show record-button if has current recording.
    if (localdata["current_recording"]) {
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
            let url = result && result.url || ''; // #RAIDO or http://m3u8list
            let tmpUrl = result && result.tmpUrl || '';  // #RAIDO or http://m3u8list

            // only show live recoding when current no work.
            if (!localdata["current_recording"]) {
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
                    record_button.hidden = false;
                    record_button.innerText = chrome.i18n.getMessage("record_button_to_prepare", radioAreaId[tmpUrl.slice(1)].name);
                    record_button.onclick = async function (data) {
                        await chrome.runtime.sendMessage({ "start-recording": tmpUrl.slice(1), "tabId": tab.id });
                        window.close();
                    }
                }
            }
            // TODO(mv3):this is not work currently
            // TODO(mv3): url params start_at end_at ft to  && seek 
            if (tmpUrl.indexOf("https://radiko.jp/v2/api/ts/playlist.m3u8") != -1 && /\/ts\//.test(href) && !localdata["timeshift_list"].includes(tmpUrl)) {
                //viewing timeshift
                download_button.hidden = false;
                download_button.innerText = chrome.i18n.getMessage("timeshift_button");
                download_button.onclick = async function () {
                    await chrome.runtime.sendMessage({ "download-timeshift": tmpUrl });
                    window.close();
                }
            }

        }
    }


    // // NOTE(mv3): since using tabs.query, we only match "radiko.jp"
    // chrome.tabs.query({
    //     active: true, currentWindow: true,
    //     // url: "*://radiko.jp/*" 
    // }, function (tabs) {
    //     // if (!tabs || tabs.length < 1 || !tabs[0]) {
    //     //     record_button.hidden = true;

    //     // } else {
    //     //     let [tab] = tabs;
    //     //     let href = tab.url;
    //     //     chrome.scripting.executeScript({
    //     //         target: { tabId: tab.id },
    //     //         func: () => {
    //     //             return {
    //     //                 tmpUrl: document.getElementById('tmpUrl') && document.getElementById('tmpUrl').value,
    //     //                 url: document.getElementById('url') && document.getElementById('url').value
    //     //             }
    //     //         }
    //     //     }, function (inject_results) {
    //     //         let error = chrome.runtime.lastError; // chrome:// --> will cause error but stop-recording should display whatever
    //     //         if (!inject_results || inject_results.length < 1 || !inject_results[0]) {
    //     //             return;
    //     //         }
    //     //         let { result } = inject_results[0];

    //     //         let url = result && result.url || ''; // #RAIDO or http://m3u8list
    //     //         let tmpUrl = result && result.tmpUrl || '';  // #RAIDO or http://m3u8list


    //     //     });
    //     // }
    //     let [tab] = tabs;
    //     chrome.scripting.executeScript({
    //         target: { tabId: tab.id },
    //         func: () => {
    //             return {
    //                 href: window.location.href,
    //                 tmpUrl: document.getElementById('tmpUrl') && document.getElementById('tmpUrl').value,
    //                 url: document.getElementById('url') && document.getElementById('url').value
    //             }
    //         }
    //     }, function (inject_results) {
    //         let error = chrome.runtime.lastError; // chrome:// --> will cause error but stop-recording should display whatever
    //         if (!inject_results || inject_results.length < 1 || !inject_results[0]) {
    //             return;
    //         }
    //         let { result } = inject_results[0];

    //         let href = result && result.href || '';
    //         let url = result && result.url || ''; // #RAIDO or http://m3u8list
    //         let tmpUrl = result && result.tmpUrl || '';  // #RAIDO or http://m3u8list


    //         //consider pass current_recording and timeshift list by message if not store in storage.local (slow)
    //         chrome.storage.local.get({ "current_recording": false, "timeshift_list": [] }, function (data) {
    //             let shouldhidden = error || ! /radiko\.jp/.test(href);

    //             //display stop whatever page
    //             if (data["current_recording"]) {
    //                 record_button.hidden = false;
    //                 record_button.innerText = chrome.i18n.getMessage("record_button_to_stop");
    //                 record_button.onclick = function (data) {
    //                     chrome.runtime.sendMessage({ "stop-recording": true }, function () {
    //                         window.close();
    //                     });
    //                 }
    //             } else {
    //                 if (shouldhidden) {
    //                     record_button.hidden = true;
    //                 } else {
    //                     //not recording
    //                     if (url[0] == '#') {
    //                         //playing live
    //                         record_button.hidden = false;
    //                         record_button.innerText = chrome.i18n.getMessage("record_button_to_start", radioAreaId[url.slice(1)].name);
    //                         record_button.onclick = function (data) {
    //                             chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
    //                                 let tab = arrayOfTabs[0];
    //                                 if (/radiko\.jp/.test(tab.url)) {
    //                                     chrome.runtime.sendMessage({ "start-recording": tmpUrl.slice(1), "tabId": tab.id }, function () {
    //                                         window.close();
    //                                     });
    //                                 }
    //                             });
    //                         }
    //                     } else if (tmpUrl[0] == '#' && /\/live\//.test(href)) {
    //                         //viewing live
    //                         record_button.hidden = false;
    //                         record_button.innerText = chrome.i18n.getMessage("record_button_to_prepare", radioAreaId[tmpUrl.slice(1)].name);
    //                         record_button.onclick = function (data) {
    //                             chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
    //                                 let tab = arrayOfTabs[0];
    //                                 if (/radiko\.jp/.test(tab.url)) {
    //                                     chrome.runtime.sendMessage({ "start-recording": tmpUrl.slice(1), "tabId": tab.id }, function () {
    //                                         window.close();
    //                                     });
    //                                 }
    //                             });
    //                         }

    //                     }
    //                 }
    //             }
    //             if (tmpUrl.indexOf("https://radiko.jp/v2/api/ts/playlist.m3u8") != -1 && /\/ts\//.test(href) && !data["timeshift_list"].includes(tmpUrl)) {
    //                 //viewing timeshift
    //                 download_button.hidden = false;
    //                 download_button.innerText = chrome.i18n.getMessage("timeshift_button");
    //                 download_button.onclick = function () {
    //                     chrome.runtime.sendMessage({ "download-timeshift": tmpUrl }, function () {
    //                         window.close();
    //                     });
    //                 }
    //             } else {
    //                 download_button.hidden = true;
    //             }
    //         });
    //     });
    // });

});



