import { APP_VERSION_MAP, APP_KEY_MAP } from "./modules/static.js";
import { genRandomInfo, genGPS, initiatorFromExtension } from "./modules/util.js"
import { downloadtimeShift } from "./modules/timeshift.js"
import { retrieve_token } from "./modules/auth.js"
import { updateRadioRules, setUpBonus, updateAreaRules } from "./modules/rules.js";
import { radioAreaId } from "./modules/constants.js";

// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => console.log(info));


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

    updateAreaRules(area_id, info);
  } else if (msg["share-redirect"]) {
    let param = msg["share-redirect"];
    chrome.tabs.update(sender.tab.id, { "url": "https://radiko.jp/#!/ts/" + param.station + "/" + param.t });
  } else if (msg["update-bonus"]) {
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

    chrome.action.setBadgeBackgroundColor && chrome.action.setBadgeBackgroundColor({ color: "#e73c64" });
    chrome.action.setBadgeText && chrome.action.setBadgeText({ text: list.length.toString() });
    downloadtimeShift(link, area_id);
  }
});

/**
 * User could be just visiting the page, not be intent on clicking the play button.
 * It's a bit aggreesive :( But i have no choice. Blame on MV3.
 * 
 * On live page, if user pause the audio and stay on a page a long time (token expired), then play. this won't be triggered.
 * On timeshift page, it is the same.
 */
chrome.webRequest.onBeforeRequest.addListener(
  async req => {
    if (initiatorFromExtension(req)) { return }

    let [radioname] = req.url.split("/").at(-1).split(".");
    let { selected_areaid: selected_areaid } = await chrome.storage.local.get(["selected_areaid"]);
    console.log(`Hit ${req.url} radioname ${radioname} , area ${selected_areaid}`);
    // if selected_areaid in radioname's avaiable area. then do nothing
    if (radioAreaId[radioname].area.includes(selected_areaid)) {
      return;
    }

    let [token, area_id] = await retrieve_token(radioname, selected_areaid);
    // Should we update rules here?

  },
  {
    urls: [
      // This is used in live and timeshift
      // https://radiko.jp/v3/radioweb/bansen/station/RADIONAME.xml
      "*://*.radiko.jp/v3/radioweb/bansen/station/*.xml*"
      // CM related request. Hope they won't remove it.
      // Only in live page
      // "*://*.radiko.jp/v3/feed/pc/extra/*.xml*"
      //https://api.radiko.jp/program/v4/date/DATE/station/RADIONAME.json
      // https://api.radiko.jp/program/v3/weekly/RADIONAME.xml
      // maybe cached?
      // https://radiko.jp/v2/static/station/logo/RADIONAME/224x100.png
      // DONT USE, TOO FREQUNCEY
      // https://radiko.jp/v3/feed/pc/cm/RADIONAME.xml?_=
      // https://api.radiko.jp/music/api/v1/noas/RADIONAME/latest?size=20
    ],
  }
);


/**
 * The most accurate listener for the playing event.
 * However when it happens, it is too late to generate token if token doesn't exist and then update rules.
 * So we can catch up the second request to m3u8 link, but the first one is 403 with wrong token.
 * Blame on MV3
 */
chrome.webRequest.onBeforeRequest.addListener(
  async req => {
    if (initiatorFromExtension(req)) { return }
    // let [, type, radioname] = new URL(url).hash.split("/");
    // let [token, area_id] = await retrieve_token(radioname);
    // TODO set up rules based on type, radioname and area_id

    let [radioname] = req.url.split("/").at(-1).split(".")
    let { selected_areaid: selected_areaid } = await chrome.storage.local.get(["selected_areaid"]);
    console.log(`Hit ${req.url} radioname ${radioname} , area ${selected_areaid}`);
    // if selected_areaid in radioname's avaiable area. then do nothing
    if (radioAreaId[radioname].area.includes(selected_areaid)) {
      return;
    }
    // TOOOO LATE
    let [token, area_id] = await retrieve_token(radioname, selected_areaid);
    // we can catch up the second requrest , the first one is 403.
    updateRadioRules(radioname, area_id, token);
  },
  {
    // The request fetch playlist_create_url
    urls: ["*://*.radiko.jp/v3/station/stream/pc_html5/*"]
  }
);

// Register listeners synchronously. so need to store device info in session
chrome.webRequest.onHeadersReceived.addListener(
  async resp => {
    if (initiatorFromExtension(resp)) { return }

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
      return
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
    })

    // save or not? race condtion?
    // browser auth1 -> extension auth1 -> browser auth2 -> extension auth2
    // if (resp2.ok && resp2.status == 200) {
    //   // let data = await resp2.text(); // and JP in data
    //   let { auth_tokens: authTokens } = await chrome.storage.session.get({ "auth_tokens": {} });
    //   authTokens[area_id] = { token: token, requestTime: Date.now() };
    //   await chrome.storage.session.set({ "auth_tokens": authTokens });
    // }


    // ************ TODO !!! for live out of current area?
    // should we update the token in auth_tokens here? ...well do not help, auth only the first time , then setinterval
    // or listen at ? https://rd-wowza-radiko.radiko-cf.com/medialist?session=XXX&station_id=CROSSFM&_=1736692279287
    // to check should update or not
    // maybe not necessary since medialist do not require authtoken , so won't expire.

  },
  {
    urls: ["*://*.radiko.jp/v2/api/auth1*"]
  }, ["responseHeaders"]
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
  // since service worker will not persist
  let info = genRandomInfo();
  await chrome.storage.local.set({ "device_info": info });
  // let { device_info: info } = await chrome.storage.local.get("device_info");
  // if (!info) {
  //   info = genRandomInfo();
  //   await chrome.storage.local.set({ "device_info": info });
  // }
  console.log("Using ", info, " for ", area_id);

  updateAreaRules(area_id, info);
  // save after clear
  // await chrome.storage.local.set({ "device_info": info });

  //clean previous unfinshed recording or downloading content if exists.
  // TODO(mv3): add back recording/downloading
  await chrome.storage.local.clear();
  await chrome.storage.local.set({
    "selected_areaid": area_id,
    "device_info": info,
    "bonus_feature": bonus,
  });

  // TODO(mv3): add back recording/downloading
  // chrome.action.setBadgeText && chrome.action.setBadgeText({ text: "" }); //clean badgetext when crash
  await setUpBonus(bonus);
}

chrome.runtime.onInstalled.addListener(async (data) => {
  await initialize();
})
//main stuff do only once on profile started
chrome.runtime.onStartup.addListener(async () => {
  await initialize();
});
