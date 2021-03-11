let checkOverseas = document.getElementsByClassName("messageToOverseas")
if ( checkOverseas.length != 0 ) {
	window.addEventListener("message",function(evt){
		let param = evt.data["share-redirect"] || {} ;
		if ( param.t && param.station ){
			chrome.runtime.sendMessage({"share-redirect": param})
		}
	})


	let inspect_script = document.createElement("script");
	inspect_script.textContent='let param = {}; get_share_log_url(param); window.postMessage({"share-redirect":param});'
	document.head.appendChild(inspect_script);
}
