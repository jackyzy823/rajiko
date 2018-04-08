
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



window.onload = function () {
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
                    else {
                        window.alert(chrome.i18n.getMessage("refresh_alert"));
                    }
                    window.close();
                });
            }
        });

    };

    //load region and area
    chrome.storage.local.get({"selected_areaid":"JP13"}, function (data) {
        let area_id = data["selected_areaid"];
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
    // if playing        
    //<i class="icon icon--play-02 on"></i>
    //<i class="icon icon--play-02"></i>
    // tmpUrl is the page you view
    // the url is really playing ,but no url when no playing .
    // <input id="url" value="https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=RADIONAME&amp;l=15&amp;ft=FROMTTIME&amp;to=TOTIME&amp;seek=SEEK" type="hidden">
    // <input id="tmpUrl" value="https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=ANOTHERORSAME&amp;l=15&amp;ft=FROMTTIME&amp;to=TOTIME" type="hidden">
    //
    let record_button = document.getElementById("rajiko-record");
    chrome.tabs.executeScript({code:"var tmpdata = {url : window.location.href,radioname:document.getElementById('url') && document.getElementById('url').value.slice(1) };tmpdata",runAt:"document_start"},function(results){
        // if(chrome.runtime.lastError){
        //     console.log(chrome.runtime.lastError);
        // }
        let error = chrome.runtime.lastError;
        // console.log(results); //slice to remove #
        // if ( ) {
        //     record_button.hidden = true; // TODO: could stop in any page ,could not start in other page
        //     return;
        // }
        chrome.storage.local.get({"current_recording":false},function(data){
            let shouldhidden  =  error || ! /radiko\.jp/.test(results[0].url) ;
            if(!data["current_recording"]  &&  !shouldhidden ){
                //start to
                record_button.innerText = chrome.i18n.getMessage("record_button_to_start");
                record_button.onclick = function(data){
                    // let radioname = results[0].radioname 
                    if(!results[0].radioname || results[0].radioname == ""  ){
                        let res = /radiko\.jp\/#!\/live\/(.*)/i.exec(results[0].url);
                        let waitraido = res && res[1];
                        if(waitraido){
                            chrome.runtime.sendMessage({"start-recording":waitraido},function(){
                                window.alert(chrome.i18n.getMessage("record_prepare",waitraido));
                                window.close();
                            });                            
                        }else{
                            window.alert("No playing radio!");
                            window.close();
                        }

                    }else{
                        chrome.runtime.sendMessage({"start-recording":results[0].radioname},function(){
                            window.close();
                        });
                    }

                }
            }else if(data["current_recording"]){
                //stop doing
                record_button.innerText = chrome.i18n.getMessage("record_button_to_stop"); // pass radioname to text via placeholders and substitutions
                record_button.onclick = function(data){
                    chrome.runtime.sendMessage({"stop-recording":true},function(){ //stop's raioname --> from executescript / from storage.get current_recording?
                        window.close();
                    });
                }
            }else{
                record_button.hidden = true;
            }
        
        });

    });


};



