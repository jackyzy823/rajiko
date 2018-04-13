document.addEventListener("DOMContentLoaded", function(event) {
  /*
  let beforeAllScript = document.createElement("script");
  beforeAllScript.innerText = "debugger;";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(beforeAllScript, s);
  */

  let inspect_script = document.createElement("script");
  inspect_script.src = chrome.extension.getURL('ui/inspect_start.js');
  document.head.appendChild(inspect_script);


  let targetPlayButton = document.getElementById('play').getElementsByTagName('i')[0];
  let observer = new MutationObserver(function(list){
    for(let mutation of list){
      if(mutation.type == 'attributes' && mutation.attributeName == 'class'){
        if(!mutation.target.classList.contains('on')){
          chrome.storage.local.get({"current_recording":false},function(d){
            if(d["current_recording"]){
              chrome.runtime.sendMessage({"stop-recording":true},function(){});
            }
          })
        }
      }
    }
  });
  observer.observe(targetPlayButton,{attributes:true});

});
