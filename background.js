import { APP_VERSION_MAP, APP_KEY_MAP, IGNORELIST } from "./modules/static.js";
import { genRandomInfo, genGPS, initiatorFromExtension, isFirefox } from "./modules/util.js"
import { downloadtimeShift } from "./modules/timeshift.js"
import { retrieve_token } from "./modules/auth.js"
import { updateRadioRules, setUpBonus, updateAreaRules } from "./modules/rules.js";
import { radioAreaId, areaMap, areaList, areaSuffixList } from "./modules/constants.js";
import { stream_listener_builder } from "./modules/recording.js"

// try {
// Even with declarativeNetRequestFeedback and extensions.dnr.feedback,
// onRuleMatchedDebug is still not work under Firefox.
// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => console.log(info));
// } catch { }


// Register listeners synchronously. so need to store device info in local
chrome.runtime.onMessage.addListener(async function (msg, sender, respCallback) {
  if (msg["update-area"]) {
    let area_id = msg["update-area"];

    await chrome.storage.local.set({ selected_areaid: area_id });
    console.log(`Update area to ${area_id}`);

    let { device_info: info } = await chrome.storage.local.get("device_info");
    if (!info) {
      console.warn("this shouldn't happen");
      info = genRandomInfo();
    }

    if (!isFirefox()) {
      updateAreaRules(area_id, info);
    }
  } else if (msg["share-redirect"]) {
    let param = msg["share-redirect"];
    chrome.tabs.update(sender.tab.id, { "url": "https://radiko.jp/#!/ts/" + param.station + "/" + param.t });
  } else if (msg["update-bonus"]) {
    // This works for firefox too
    await setUpBonus(msg["update-bonus"] == "yes");
  } else if (msg["download-timeshift"]) {
    let link = msg["download-timeshift"];
    console.log(`start donwload timeshift ${link}`);

    let { timeshift_list: list, selected_areaid: area_id } = await chrome.storage.local.get(["timeshift_list", "selected_areaid"]);
    if (!list) {
      list = [];
    }
    list.push(link);
    await chrome.storage.local.set({ "timeshift_list": list });

    chrome.action.setBadgeBackgroundColor?.({ color: "#e73c64" });
    chrome.action.setBadgeText?.({ text: list.length.toString() });
    downloadtimeShift(link, area_id);
  } else if (msg["start-recording"]) {
    let radioname = msg["start-recording"];
    console.log(`Strart recording ${radioname}`);
    // store in session, for popup menu to check if has running recording and  get current recording's radioname
    await chrome.storage.session.set({ "current_recording": radioname });

    // We need service worker to keepalive here.
    // Because user can prepare to record and after 30s (the service work became inactive), then click play button.

    // DO when aac request is completed
    //TODO Firefox listen on what? onCompleted or onBeforeSendHeaders
    chrome.webRequest.onCompleted.addListener(
      // create a listener function
      stream_listener_builder(radioname),
      {
        urls: [
          `*://*.smartstream.ne.jp/${radioname}/*.aac*`,
          "*://rpaa.smartstream.ne.jp/segments/*.aac*",
          `*://*.radiko-cf.com/segments/*/*/${radioname}/*.aac*`,
          `*://*.smartstream.ne.jp/segments/*/*/${radioname}/*.aac*`
        ]
        , tabId: msg["tabId"] //restrict to specific tabid
      }
    );
    chrome.action.setIcon?.({ path: 'Circle-icons-radio-red-48.png' });
  }
});

/**
 * User could be just visiting the page, not be intent on clicking the play button.
 * It's a bit aggreesive :( But i have no choice. Blame on MV3.
 * 
 * On live page, if user pause the audio and stay on a page a long time (token expired), then play. this won't be triggered.
 * On timeshift page, it is the same.
 */
if (!isFirefox()) {
  chrome.webRequest.onBeforeRequest.addListener(
    async req => {
      if (initiatorFromExtension(req)) { return; }

      let [radioname] = req.url.split("/").at(-1).split(".");
      let { selected_areaid: selected_areaid } = await chrome.storage.local.get(["selected_areaid"]);
      console.log(`Hit ${req.url} radioname ${radioname} , area ${selected_areaid}`);

      if (radioAreaId[radioname].area.includes(selected_areaid)) {
        return;
      }

      let [token, area_id] = await retrieve_token(radioname, selected_areaid);
      // We update rules in `"*://*.radiko.jp/v3/station/stream/pc_html5/*"` listener.
    },
    {
      urls: [
        // This is used in live and timeshift
        // https://radiko.jp/v3/radioweb/bansen/station/RADIONAME.xml
        "*://*.radiko.jp/v3/radioweb/bansen/station/*.xml*",

        // Domain name is GCP_API_DOMAIN
        // https://api.radiko.jp/program/v3/weekly/RADIONAME.xml
        // This is usable, but we only use one to avoid fetch token twice since these reuqests are very closed.
        // "*://*.radiko.jp/program/v3/weekly/*.xml*"

        // Only in live page
        // "*://*.radiko.jp/v3/feed/pc/extra/*.xml*"

        // Not all radio have v4 API
        //https://api.radiko.jp/program/v4/date/DATE/station/RADIONAME.json

        // maybe cached?
        // https://radiko.jp/v2/static/station/logo/RADIONAME/224x100.png

        // DONT USE, TOO FREQUNCEY
        // https://radiko.jp/v3/feed/pc/cm/RADIONAME.xml?_=
        // Only in live page
        // https://api.radiko.jp/music/api/v1/noas/RADIONAME/latest?size=20
        // Only in timeshift page
        // https://api.radiko.jp/music/api/v1/noas/RADIONAME?
      ],
    }
  );
}


/**
 * The most accurate listener for the playing event.
 * However when it happens, it is too late to generate token if token doesn't exist and then update rules.
 * So we can catch up the second request to m3u8 link, but the first one is 403 with wrong token.
 * Blame on MV3
 */
chrome.webRequest.onBeforeRequest.addListener(
  async req => {
    if (initiatorFromExtension(req)) { return; }

    let [radioname] = req.url.split("/").at(-1).split(".")
    let { selected_areaid: selected_areaid } = await chrome.storage.local.get(["selected_areaid"]);
    console.log(`Hit ${req.url} radioname ${radioname} , area ${selected_areaid}`);

    if (radioAreaId[radioname].area.includes(selected_areaid)) {
      return;
    }
    // Too LATE
    let [token, area_id] = await retrieve_token(radioname, selected_areaid);
    if (!isFirefox()) {
      updateRadioRules(radioname, area_id, token);
    }
  },
  {
    // The request fetch playlist_create_url
    urls: ["*://*.radiko.jp/v3/station/stream/pc_html5/*"]
  },
  isFirefox() ? ["blocking"] : []
);

// Register listeners synchronously. so need to store device info in session
chrome.webRequest.onHeadersReceived.addListener(
  async resp => {
    if (initiatorFromExtension(resp)) { return; }

    let token = "";
    let offset = 0;
    let length = 0;
    let set = 0;

    for (let i = 0; i < resp.responseHeaders.length; i++) {
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-keyoffset") {
        offset = parseInt(resp.responseHeaders[i].value);
        set ^= 1;
      }
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-keylength") {
        length = parseInt(resp.responseHeaders[i].value);
        set ^= 1 << 1;
      }
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-authtoken") {
        token = resp.responseHeaders[i].value;
        set ^= 1 << 2;
      }
    }

    if (set != 0b111) {
      console.error("no enough info from auth2 response.");
      return;
    }

    console.log(`onHeadersReceived of auth1: token ${token}, offset ${offset} length ${length}`);
    let { device_info: info } = await chrome.storage.local.get("device_info");
    if (!info) {
      // This should not happen and is not recoverable
      // If generate again, X-Radiko-App may not be same in auth1 and auth2 then auth will fail.
      // TODO If all aSmartPhone8 then ok to regenerate info?
      // TempFix: assert all device are aSmartPhone8
      info = genRandomInfo();
      await chrome.storage.local.set({ "device_info": info });
      console.error("no device_info in local storage");
      // return
    }

    let { selected_areaid: area_id } = await chrome.storage.local.get("selected_areaid");
    if (!area_id) {
      // This should not happen and is not recoverable
      console.error("no area_id in local storage");
      return;
    }


    let partial = btoa(atob(APP_KEY_MAP[APP_VERSION_MAP[info.appversion]]).slice(offset, offset + length));
    let resp2 = await fetch('https://radiko.jp/v2/api/auth2', {
      headers: {
        'X-Radiko-App': APP_VERSION_MAP[info.appversion],
        'X-Radiko-App-Version': info.appversion,
        'X-Radiko-Device': info.device,
        'X-Radiko-User': info.userid,
        'X-Radiko-AuthToken': token,
        'X-Radiko-Partialkey': partial,
        'X-Radiko-Location': genGPS(area_id),
        'X-Radiko-Connection': "wifi",
        // modifying UA does not work here. so we use session rules RULEID.AUTH_FETCH.
        'User-Agent': info.useragent
      },
      credentials: "omit"
    });

    // Don't save the token from default_area_id to avoid race condition.
  },
  {
    urls: ["*://*.radiko.jp/v2/api/auth1*"]
  },
  // Is here blocking necessary?
  isFirefox() ? ["blocking", "responseHeaders"] : ["responseHeaders"]
);


async function initialize() {
  let {
    selected_areaid: area_id,
    bonus_feature: bonus
  } = await chrome.storage.local.get(["selected_areaid", "bonus_feature"]);
  //if not selected_areaid use default value:JP13
  if (!area_id) {
    area_id = "JP13";
    await chrome.storage.local.set({ "selected_areaid": area_id });
  }
  // Re-generate device info every initalization
  // Why use storage.local instead of storage.session for device info?
  // See issue: https://issues.chromium.org/issues/389232707
  let info = genRandomInfo();
  console.log("Using ", info, " for ", area_id);

  //clean previous unfinshed recording or downloading content if exists.
  await chrome.storage.local.clear();
  await chrome.storage.local.set({
    "selected_areaid": area_id,
    "device_info": info,
    "bonus_feature": bonus,
  });

  chrome.action.setBadgeText?.({ text: "" });

  if (!isFirefox()) {
    updateAreaRules(area_id, info);
  }

  await setUpBonus(bonus);
}

chrome.runtime.onInstalled.addListener(async (data) => {
  await initialize();
})
//main stuff do only once on profile started
chrome.runtime.onStartup.addListener(async () => {
  await initialize();
});

/**
 * 
 * Firefox Listeners
 * 
 */
if (isFirefox()) {
  // Set request header in auth1
  chrome.webRequest.onBeforeSendHeaders.addListener(async req => {
    if (initiatorFromExtension(req)) {
      // TODO if from ext, then remove Accept-Language,Accept,User-Agent
      // like RULEID.AUTH_FETCH 
      return;
    }
    let { device_info: info } = await chrome.storage.local.get("device_info");
    if (!info) {
      // This should not happen and is not recoverable
      // If generate again, X-Radiko-App may not be same in auth1 and auth2 then auth will fail.
      // TODO If all aSmartPhone8 then ok to regenerate info?
      // TempFix: assert all device are aSmartPhone8
      info = genRandomInfo();
      await chrome.storage.local.set({ "device_info": info });
      console.error("no device_info in local storage");
      // return
    }

    req.requestHeaders = req.requestHeaders.filter(function (x) {
      return !IGNORELIST.includes(x.name.toLowerCase());
    });

    req.requestHeaders.push({
      name: "X-Radiko-User",
      value: info.userid
    });
    req.requestHeaders.push({
      name: "X-Radiko-App-Version",
      value: info.appversion
    });
    req.requestHeaders.push({
      name: "X-Radiko-App",
      value: APP_VERSION_MAP[info.appversion],
    });
    req.requestHeaders.push({
      name: "X-Radiko-Device",
      value: info.device
    });
    req.requestHeaders.push({
      name: "User-Agent",
      value: info.useragent
    });
    return {
      requestHeaders: req.requestHeaders
    };
  }, {
    urls: ["*://*.radiko.jp/v2/api/auth1*"]
  }, ["blocking", "requestHeaders"]);

  // Fix response header in auth1
  chrome.webRequest.onHeadersReceived.addListener(async resp => {
    if (initiatorFromExtension(resp)) { return; }
    for (let i = 0; i < resp.responseHeaders.length; i++) {
      if (resp.responseHeaders[i].name.toLowerCase() == "x-radiko-keyoffset") {
        resp.responseHeaders[i].value = "0"; //to avoid too big offset cause radiko's js error
      }
    }
    return {
      responseHeaders: resp.responseHeaders
    };
  }, {
    urls: ["*://*.radiko.jp/v2/api/auth1*"]
  }, ["blocking", "responseHeaders"]);

  // Set area response content
  chrome.webRequest.onBeforeRequest.addListener(async req => {
    let filter = browser.webRequest.filterResponseData(req.requestId);

    filter.onstop = async event => {
      let { selected_areaid: area_id } = await chrome.storage.local.get("selected_areaid");
      // Template document.write('<span class=\"JP27\">OSAKA JAPAN</span>');
      let encoder = new TextEncoder();
      filter.write(encoder.encode(`document.write('<span class="${area_id}">${areaMap[area_id]} JAPAN</span>');`));
      filter.close();
    };

    return {};
  }, {
    // webRequest support "*://*.radiko.jp/area*" to match "https://radiko.jp/area"
    // But declarativeNetRequest don't, it only support "*://radiko.jp/area*"
    urls: ["*://*.radiko.jp/area*", "*://*.radiko.jp/apparea/area*"]
  }, ["blocking"]);

  // Set browser's auth2 response content
  chrome.webRequest.onBeforeRequest.addListener(async req => {
    if (initiatorFromExtension(req)) {
      // TODO add permission: requestHeaders
      // TODO if from ext, then remove Accept-Language,Accept,User-Agent
      // like RULEID.AUTH_FETCH 
      return;
    }
    let filter = browser.webRequest.filterResponseData(req.requestId);

    filter.onstop = async event => {
      let { selected_areaid: area_id } = await chrome.storage.local.get("selected_areaid");
      let encoder = new TextEncoder();
      let area_id_num = parseInt(area_id.substr(2)) - 1;
      filter.write(encoder.encode(`${area_id},${areaList[area_id_num]}${areaSuffixList[area_id_num]},${areaMap[area_id].toLowerCase()} Japan`));
      filter.close();
    };

    return {};
  }, {
    urls: ["*://radiko.jp/v2/api/auth2*"]
  }, ["blocking"]);

  // THE correct way to set authtoken to m3u8
  chrome.webRequest.onBeforeSendHeaders.addListener(async req => {
    if (initiatorFromExtension(req)) { return; }
    let radioname;
    (new URL(req.url)).search.slice(1).split('&').map(function (kv) {
      let s = kv.split('=');
      switch (s[0]) {
        case 'station_id':
          radioname = s[1];
          break;
      }
    });
    let { selected_areaid: selected_areaid } = await chrome.storage.local.get("selected_areaid");
    if (radioAreaId[radioname].area.includes(selected_areaid)) {
      return {};
    }

    // Good timing! Firefox!
    let [token, area_id] = await retrieve_token(radioname, selected_areaid);

    req.requestHeaders = req.requestHeaders.filter(function (x) {
      return !["x-radiko-authtoken", "x-radiko-areaid"].includes(x.name.toLowerCase()); //remove previous token
    });
    req.requestHeaders.push({
      name: "X-Radiko-AuthToken",
      value: token
    });
    req.requestHeaders.push({
      name: "X-Radiko-AreaId",
      value: area_id
    });

    return {
      requestHeaders: req.requestHeaders
    };

  }, {
    urls: ["*://radiko.jp/v2/api/ts/playlist.m3u8?*" /*for timeshift*/
      , "*://*.smartstream.ne.jp/*/playlist.m3u8?*" // some new apis
      , "*://*.radiko-cf.com/*/playlist.m3u8?*"
    ]
  }, ["blocking", "requestHeaders"]);
}