window.addEventListener('hashchange', function(event) {
  if(event.newURL == "https://radiko.jp/#!/out"){
    document.getElementById("cboxClose").click()
    if(event.oldURL == "https://radiko.jp/"){
      history.replaceState(null,null," ")
    }else{
      window.location.href = event.oldURL  
    }
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
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
