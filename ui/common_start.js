document.addEventListener("DOMContentLoaded", function(event) {
  /*
  let beforeAllScript = document.createElement("script");
  beforeAllScript.innerText = "debugger;";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(beforeAllScript, s);
  */

  let momentscript = document.createElement("script");
  momentscript.src = chrome.extension.getURL('ui/moment-timezone.js');
  document.head.appendChild(momentscript);
});
