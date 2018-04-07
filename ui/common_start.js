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
});
