chrome.storage.local.get({ "selected_areaid": "JP13" }, function (data) {
  let area_id = data["selected_areaid"];
  function inspect() {
    let cheat_areacheck = document.createElement("script");
    // response_handler.fail will always called no matter you're in Japan or not
    // because we block it in background.js
    // $.cookie("default_area_id") from onBeforeRequest is not quite reliable here,
    // so we use chrome.storage
    cheat_areacheck.textContent = `
    (function(){
      Object.defineProperty(window.navigator, 'userAgent', { value:  window.navigator.userAgent.replace(/android.*?\;/gi, "").replace(/mobile/gi, "")})
      const _origin_ajax = $.ajax;
      $.ajax = function(options){
        if(options.url.startsWith("/area") || options.url.startsWith("https://api.radiko.jp/apparea/area")){
          let response_handler =  _origin_ajax(options);
          response_handler.fail = function(){
            $.Radiko.area.id = "`+ area_id + `";
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
    let observer = new MutationObserver(function (list) {
      for (let mutation of list) {
        if (mutation.type == 'attributes' && mutation.attributeName == 'class' && !mutation.target.classList.contains('on')) {
          chrome.runtime.sendMessage({ "stop-recording": true }, function () { });
        }
      }
    });
    observer.observe(targetPlayButton, { attributes: true });
  };

  var executed = false;
  document.addEventListener("readystatechange", function (event) {
    // complete interactive
    if (event.target.readyState !== "loading" && !executed) {
      inspect();
      executed = true;
    } else {
      // loading
      document.addEventListener('DOMContentLoaded', inspect);
    }
  });

});
