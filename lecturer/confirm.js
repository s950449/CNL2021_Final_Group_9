var ret;
chrome.storage.sync.get("confirmmsg", async({ confirmmsg }) => {
	ret = confirm(await confirmmsg);
	chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
		console.log(sender.tab ?
		            "from a content script:" + sender.tab.url :
		            "from the extension");
		if (request.greeting == "confirm?")
		  sendResponse({"ret": ret});
	}, {once : true});
});

