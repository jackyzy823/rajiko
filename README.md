Rajiko
====================
How to use:
-------------------
1. Install it from [Chrome webstore](https://chrome.google.com/webstore/detail/rajiko/ejcfdikabeebbgbopoagpabbdokepnff) or [Firefox addons](https://addons.mozilla.org/firefox/addon/rajiko/).
2. Do nothing or change default area by clicking icon which only affects live area.
3. Recording live or download timeshift by clicking icon. 
4. Click icon or click pause button to stop recording.


Permission Details:
-------------------
1. activeTab : to get tab's url to decide whether auto refresh or alert or which radio to record.
2. cookies : for force setting radiko.jp's current location.
3. storage : for storing your location configuration.
4. webRequest : modify request to pass the authentication.
5. webRequestBlocking : modify request to pass the authentication.
6. \*://\*.radiko.jp/\* : the only site we aimed at.
7. declartiveContent : [TODO] for showing icon only on radiko pages.But firefox does not support this api.When firefox supports this api,tab permission will not be required.
8. downloads : for downloading recored audio.
9. \*://\*.smartstream.ne.jp/\* : the site where audio stored.
10. unlimitedStorage : for recording radio.


What's new:
-----------
+ version 0.2.8

    use hashchange event to detect #!out and close dialog

+ version 0.2.7.2

    since chrome do not count hash in history. revert v0.2.7.

+ version 0.2.7.1

    make page history correct via history.back

+ version 0.2.7

    bypass unclosable dialog

+ version 0.2.6

    make share page bypass geoblock (fix #1)

    sync radiko android version code to 7.3.7

+ version 0.2.5.8

    upadte new radio-area map for エフエム佐賀 エフエム徳島

    sync radiko android version code to 7.2.9

+ version 0.2.5.7

    upadte new radio-area map for エフエム秋田、Rhythm Station　エフエム山形、FM岡山、エフエム山陰、エフエム宮崎

    change some radio's name

+ version 0.2.5.6

    upadte new radio-area map for HI-SIX(エフエム高知)

    sync radiko android version code to 7.2.0

+ version 0.2.5.5

    fix compatible problem for Chrome 72 -

+ version 0.2.5.4

    fix cors issue for Chrome 76 +

    sync radiko android version code to 7.1.1

+ version 0.2.5.3

    remove alert to avoid stuck in Chrome on Windows

    sync radiko android version code to 7.0.6

+ version 0.2.5.2

    make extension work under incognito mode

    sync radiko android version code to 6.4.4

    fix download blob file problem in new version firefox

+ version 0.2.5.1
    
    dirty fix for live recording issue caused by radiko using new  `rpaa` api for stream. (May encounter unexpected problem.Issues are welcomed.)

+ version 0.2.5
    
    fix error caused by radiko new type api requestheader (X-Radiko-AreaId).

    solved a problem caused by CORS and Disk cache.

+ version 0.2.4.1
    
    upadte new radio-area map for FMFUKUI(FM福井)

+ version 0.2.4

    sync radiko android version code to 6.4.0

    resolve 5s problem in some mediaplayer. Now aac are concated without id3 metadata.

+ version 0.2.3

    fix time display in ballon when dragging in timefree, fix dragging in different timezone (Don't know if this fix works)

    update gps info from radiko android DEVELOPER_MODE

+ version 0.2.2

    fix timefree bypass logic.

+ version 0.2.1
    
    Now, you can use areafree(エリアフリー) and timefree(タイムフリー) as premium(プレミアム会員)  freely without any operation.

    For switching to  other area in timefree(タイムフリー) page, only click 地域変更 button in timefree(タイムフリー) page.

    The "3 hours a day" limitation of timefree(タイムフリー) has been unblocked.You can listen no matter how long now. And also you can download timefree(タイムフリー) program.

    "Choose Area" is only needed in displaying area in live(ライブ).

    If there's any bug or problem ,please try to disable and then enable or reinstall it.If this does not help , please tell me via review page or github issue.

    Update to the newest radio table [20180412].

+ version 0.1.4.1
    
    bug fix: fix cookie error caused by different storage.local key name.

    continously improve mobile ui

    improve extension icon ui when recording


+ version 0.1.4

    change to responsive ui in firefox android !

    fix gps info mistake

    adjust to correct japan timezone via moment-timezone

+ version 0.1.3

    experimentally support recording radio. [Caution: this would cause slowing down popup page and increasing cpu usage if recording too long. No more than 30 minutes is recommended.]

+ version 0.1.2
    
    fix bug in firefox

+ version 0.1.1

    support firefox for android

+ version 0.1
    
    initial version
    
Suppport List:
------------------
+ firefox latest

+ chrome latest

+ chromium latest

+ yandex browser latest

+ firefox for android latest

+ kiwi browser for android

Known Issue:
---------------
+ The timeshift program can not be played after downloading without force refresh ,becuase of a problem of xhr access-control with disk cache see :https://lists.w3.org/Archives/Public/www-archive/2017Aug/0000.html (solved by add Access-Control-Allow-Origin in response via extension or see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin  CORS and caching ->set Vary: Origin in response?)
+ Failed to download recorded on firefox nightly and firefox for android nightly
+ Drag issue with timezone in timefree mode. (1.Always play the start part Wherever you drag 2.Cannot drag over time after localtime now) .The second problem may be caused by radiko which only aims atjapan user not  handling timezone problem . (solved)
+ Timefree only plays 5 seconds. (Don't know whether this is my issue or radiko's ,update :solved) 

Why I do this:
-------------------
An overseas fan of Kalafina wanted to listen to the radio program 'Kalafina倶楽部 ' which was ended a few days after this extension have been developed.

Technical Details:
------------------
1. How it works?

    The authentication of pc(html5) version radkio validates user's location via ip address.
    
    However the android version of radkio validates user via geolocation provided by GPS(if possible),not via user's ip.
    
    So why don't we use the authentication method of android version in pc to bypass ip check?

    The authentication includes two step:
    1.  auth1

        request : platform_info , user_id

        response : a token to be valid, full_key_offset ,partial_key_length

    2.  auth2

        request: token ,platform_info ,user_id, a parital key generated by full key and offset ,  connection type (in android), gps location(in android)

        response: Your location (and your token is valid for only this location) / OUT
    
    In the pc version,the full key is simplely placed in the javascript code in `apps/js/playerCommon.js` :

    ```javascript
    player = new RadikoJSPlayer($audio[0], 'pc_html5', 'bcd151073c03b352e1ef2fd66c32209da9ca0afa' /*full key*/ ...
    ```
    However the android version's full key is protected by native dynamic librarys.Obviously the key is much longer than that in pc version.

2. But how do you generate the partialkey/how do you get fullkey?

    By reversing android dynamic library,You can get the fullkey from .data segment  after bypassing the root check ,emulator check and lots of anti-debugging tricks and waiting for itself to repair the .data segment.

ABOUT AAC
------------
1. HLS(HTTP Live Streaming) using  Packed Audio see : https://tools.ietf.org/html/draft-pantos-http-live-streaming-23  which is ID3 tag + audio sample(AAC_ADTS,MP3,AC3)
2. About com.apple.streaming.transportStreamTimestamp ? Could i use this to sort?(yes)  PTS ->  (stamp2 - stamp1) / (90*1000.0) https://blog.csdn.net/qq_32430349/article/details/50218317
3. Drop all ID3 tag? see id3 in hls :https://helpx.adobe.com/adobe-media-server/dev/timed-metadata-hls-hds-streams.html
4. ID3 header -> size  PRIV Frame header (PRIV size flag) -> identi end with \x00  64bit data (31bit 0 and 33bit data bigendian)
    frame header  see http://id3.org/id3v2.4.0-structure priv see http://id3.org/id3v2.4.0-frames

TODO
------------
0. Using ffmpeg.js (based on Emscripten:an LLVM-to-JavaScript compiler) concating ts segments to avoid 5s problem in mediaplayer.Note:size is about 13MB. (depercated :  just drop id3 tags and simplely concat adts strem)
1. Fake request headers more similarly (such as remove cookies and set accept,user agent,and etc) to avoid detection (partially done)
    due to the limitation of extension , cannot captialize some header's key 
2. Automatic switch location , no need for manually choice. (consider not supporting)
3. Add recording function? (find solution on firefox -> webRequest.filterResponseData() and localstorge/chrome.storage ->  downloads.download  URL.createObjectURL(BlobObject), chrome may use xhr to save data , double trafic?) 
    the right way to download data uri 
    https://stackoverflow.com/questions/40269862/save-data-uri-as-file-using-downloads-download-api/40279050

    how to merge? (src site use hls.js to play m3u8 and aac) 
        seems that directly concat is enough

4. Force Firefox android load web page,not app download page.(done)
5. consider generate different extension in different browser 

    https://stackoverflow.com/questions/45911251/what-is-the-best-way-to-create-a-cross-browser-gmail-extension
    https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/
6. modify firefox android page to responsive page. (partially done)
7. break the time limitation of timeshift and be able to download timeshift content (done)
