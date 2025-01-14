document.addEventListener("DOMContentLoaded", function (event) {
  let inspect_script = document.createElement("script");
  inspect_script.src = chrome.runtime.getURL('ui/inspect_start.js');
  document.head.appendChild(inspect_script);

  // Implement stop recording by watching the play button's attribution.
  // TODO what about the big saisei button?
  let targetPlayButton = document.getElementById('play').getElementsByTagName('i')[0];
  let observer = new MutationObserver(function (list) {
    for (let mutation of list) {
      if (mutation.type == 'attributes' && mutation.attributeName == 'class' && !mutation.target.classList.contains('on')) {
        chrome.runtime.sendMessage({ "stop-recording": true });
      }
    }
  });
  observer.observe(targetPlayButton, { attributes: true });
});