document.addEventListener("DOMContentLoaded", function(event) {
  var momentscript = document.createElement("script");
  momentscript.src = chrome.extension.getURL('ui/moment-timezone.js');
  document.head.appendChild(momentscript);
});