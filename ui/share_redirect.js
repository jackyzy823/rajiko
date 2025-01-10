let checkOverseas = document.getElementsByClassName("messageToOverseas")
if (checkOverseas.length != 0) {
	window.addEventListener("message", async function (evt) {
		let param = evt.data["share-redirect"] || {};
		if (param.t && param.station) {
			// Wake up service worker? Is this a bug?
			// await chrome.runtime.sendMessage({});
			await chrome.runtime.sendMessage({ "share-redirect": param });
		}
	});

	let inspect_script = document.createElement("script");
	inspect_script.src = chrome.runtime.getURL('ui/share_redirect_inject.js');
	document.head.appendChild(inspect_script);
}
