export function mainTabAlert(msg){
  chrome.storage.sync.set({"alertmsg":msg});
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        files: ['alert.js'],
    });
  });
}
//todo, current workaround is to make popup size big enough
export function mainTabConfirm(msg){
	var ret;
	chrome.storage.sync.set({"confirmmsg":msg});
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		chrome.scripting.executeScript({
	    	target: {tabId: tabs[0].id},
	    	files: ['confirm.js'],
		});

		chrome.extension.sendMessage({greeting: "confirm?"}, function(response) {
			ret = response.ret;
		});
	});
	return ret;
}
