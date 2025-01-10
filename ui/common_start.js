document.addEventListener("DOMContentLoaded", function (event) {
  let inspect_script = document.createElement("script");
  inspect_script.src = chrome.runtime.getURL('ui/inspect_start.js');
  document.head.appendChild(inspect_script);
});