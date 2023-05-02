chrome.storage.local.get({"selected_areaid":"JP13"}, function (data) {
  let area_id = data["selected_areaid"];
  document.addEventListener("DOMContentLoaded", function(event) {
    let cheat_areacheck = document.createElement("script");
    // response_handler.fail will always called no matter you're in Japan or not
    // because we block it in background.js
    // $.cookie("default_area_id") from onBeforeRequest is not quite reliable here,
    // so we use chrome.storage
    cheat_areacheck.innerText=`
    (function(){
      const _origin_ajax = $.ajax;
      $.ajax = function(options){
        if(options.url == "/area" || options.url == "https://api.radiko.jp/apparea/area" ){
          let response_handler =  _origin_ajax(options);
          response_handler.fail = function(){
            $.Radiko.area.id = "`+ area_id +`";
            return this;
          };
          return response_handler;
        }
        return _origin_ajax(options);
      };})();`

    document.head.appendChild(cheat_areacheck);


    let inspect_script = document.createElement("script");
    inspect_script.src = chrome.runtime.getURL('ui/inspect_start.js');
    document.head.appendChild(inspect_script);


    let targetPlayButton = document.getElementById('play').getElementsByTagName('i')[0];
    let observer = new MutationObserver(function(list){
      for(let mutation of list){
        if(mutation.type == 'attributes' && mutation.attributeName == 'class' && !mutation.target.classList.contains('on')){
          chrome.runtime.sendMessage({"stop-recording":true},function(){});
        }
      }
    });
    observer.observe(targetPlayButton,{attributes:true});

  });
});
