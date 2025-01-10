import { RULEID, APP_VERSION_MAP, APP_KEY_MAP } from "./static.js";
import { genRandomInfo, genGPS } from "./util.js"

// TODO(mv3): use session rules which is not persitence (thus good for reducing problems)
// TODO update rules per tab ? but how to delete?
// or update rules per region  and only apply to some tabs?
function updateAreaRules(area_id, info) {
  // TODO(mv3): should we clear dynamic rules every startup?
  // since dynamic is persistent.
  chrome.declarativeNetRequest.updateSessionRules(
    {
      addRules: [
        {
          // Use prepared response from `response` folder for RULEID.AREA and RULEID.AUTH2.
          // I'm not sure why it works now.
          // As i can recall, previously 307 Internal Redirect is not a success code for `/area` API preflight.
          id: RULEID.AREA,
          action: { type: "redirect", redirect: { extensionPath: "/response/area-" + area_id + ".html" } },
          condition: { urlFilter: "*://*.radiko.jp/apparea/area*" }
        },
        {
          id: RULEID.AUTH1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              // Remove
              {
                header: "Accept-Language",
                operation: "remove"
              },
              {
                header: "Accept",
                operation: "remove"
              },
              {
                header: "Cookie",
                operation: "remove"
              },
              {
                header: "Referer",
                operation: "remove"
              },
              // Set
              {
                header: "X-Radiko-User",
                operation: "set",
                value: info.userid
              },
              {
                header: "X-Radiko-App-Version",
                operation: "set",
                value: info.appversion
              },
              {
                header: "X-Radiko-App",
                operation: "set",
                value: APP_VERSION_MAP[info.appversion]
              },
              {
                header: "X-Radiko-Device",
                operation: "set",
                value: info.device
              },
              {
                header: "User-Agent",
                operation: "set",
                value: info.useragent
              }
            ],
            responseHeaders: [
              {
                // to avoid too big offset cause radiko's js error
                // Will this affect the calculation in onHeadersReceived? -> no
                header: "x-radiko-keyoffset",
                operation: "set",
                value: "0"
              }
            ]
          },
          condition: {
            // Exclude the req from extension
            excludedInitiatorDomains: [chrome.runtime.id],
            urlFilter: "*://radiko.jp/v2/api/auth1*"
          }
        },
        {
          id: RULEID.AUTH2,
          action: { type: "redirect", redirect: { extensionPath: "/response/auth2-" + area_id + ".html" } },
          condition: {
            // Exclude the req from extension
            excludedInitiatorDomains: [chrome.runtime.id],
            urlFilter: "*://radiko.jp/v2/api/auth2*"
          }
        },
        {
          id: RULEID.AUTH2_FETCH,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              // Remove
              {
                header: "Accept-Language",
                operation: "remove"
              },
              {
                header: "Accept",
                operation: "remove"
              },
              {
                header: "User-Agent",
                operation: "set",
                value: info.useragent
              }
            ]
          },
          condition: {
            // Only for extension's Fetch to remove unnecessary headers.
            initiatorDomains: [chrome.runtime.id],
            urlFilter: "*://radiko.jp/v2/api/auth2*"
          }
        }],
      removeRuleIds: [RULEID.AREA, RULEID.AUTH1, RULEID.AUTH2, RULEID.AUTH2_FETCH]
    }
  )
}


// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => console.log(info));


//main stuff
chrome.storage.local.get({ "selected_areaid": "JP13" }).then(async data => {
  //if not selected_areaid return default value:JP13
  let area_id = data["selected_areaid"];
  let info = genRandomInfo();
  console.log("Using ", info);

  updateAreaRules(area_id, info);

  //clean previous unfinshed recording or downloading content if exists.
  // TODO(mv3): add back recording/downloading
  chrome.storage.local.clear().then(chrome.storage.local.set({ "selected_areaid": area_id }));

  // TODO(mv3): add back recording/downloading
  // chrome.action.setBadgeText && chrome.action.setBadgeText({ text: "" }); //clean badgetext when crash

  // TODO(mv3): Register listeners synchronously. 
  //      1) store info in session
  chrome.runtime.onMessage.addListener(
    async function (msg, sender, respCallback) {
      if (msg["update-area"]) {
        area_id = msg["update-area"];
        await chrome.storage.local.set({ selected_areaid: area_id });

        updateAreaRules(area_id, info);
      } else if (msg["share-redirect"]) {
        let param = msg["share-redirect"];
        chrome.tabs.update(sender.tab.id, { "url": "https://radiko.jp/#!/ts/" + param.station + "/" + param.t });
      }
    });


  // TODO(mv3): Register listeners synchronously. 
  //      1) store info in session
  chrome.webRequest.onHeadersReceived.addListener(
    async resp => {
      let ifInit = resp.initiator && resp.initiator.toLowerCase().indexOf("chrome-extension://" + chrome.runtime.id) != -1;  //initiator since chrome 63
      let ifTabId = resp.tabId && resp.tabId == -1; //mean this resp is not from tab
      if (ifInit || ifTabId) {
        return;
      }

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
        return;
      }

      console.log("onHeadersReceived of auth1: token ", token, " offset ", offset, " length ", length);
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
          // modifying UA does not work here. so we use session rules RULEID.AUTH2_FETCH.
          'User-Agent': info.useragent
        },
        credentials: "omit"
      })
    },
    {
      urls: ["*://*.radiko.jp/v2/api/auth1*"]
    }, ["responseHeaders"]
  );
});
