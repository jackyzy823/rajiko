
function loadArea(regionIdx){
    let area_select = document.getElementById("rajiko-area");
    while(area_select.lastChild){
        area_select.removeChild(area_select.lastChild);
    }
    let id = regions[regionIdx].id;
    let areas = areaListParRegion[id];
    for(let i =0 ;i< areas.length;i++){
        let tmp = document.createElement("option");
        tmp.setAttribute("id",areas[i].id);
        tmp.innerText = areas[i].name;
        area_select.appendChild(tmp);
    }
}



window.onload = function(){
    //define event
    let region_select = document.getElementById("rajiko-region");
    region_select.onchange = function(data){
        loadArea(this.selectedIndex);
    };

    let area_select = document.getElementById("rajiko-area");

    let confirm_button = document.getElementById("rajiko-confirm");
    confirm_button.innerText = chrome.i18n.getMessage("confirm_button");
    
    confirm_button.onclick = function(data){
        let area = document.getElementById("rajiko-area");
        chrome.storage.local.set({selected_areaid:area.selectedOptions[0].id},function(){});
        chrome.runtime.sendMessage({"update-area":area.selectedOptions[0].id});
        chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
            let tab = arrayOfTabs[0];
            if(/radiko.jp/.test(tab.url)){
                chrome.tabs.reload(tab.id);
            }
            else{
                window.alert(chrome.i18n.getMessage("refresh_alert"));
            }
            window.close();
        });
           
    };


    //load region and area
    chrome.storage.local.get("selected_areaid",function(data){
        let area_id = "JP13"; //default for tokyo;
        if(data["selected_areaid"]){
            area_id = data["selected_areaid"];
        }
        for(let i = 0; i< regions.length;i++){
            let tmp = document.createElement("option");
            tmp.setAttribute("id",regions[i].id);
            tmp.innerText = regions[i].name;
            region_select.appendChild(tmp);
        }

        Object.keys(areaListParRegion).forEach(function(key,keyindex){
            for(let i = 0;i<areaListParRegion[key].length;i++){
                if(areaListParRegion[key][i].id == area_id ){
                    region_select.selectedIndex = keyindex
                    loadArea(keyindex);
                    area_select.selectedIndex = i;
                }

            }

        });

    });


};



