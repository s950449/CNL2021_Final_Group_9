export function mainTabAlert(msg){
  chrome.storage.sync.set({"alertmsg":msg});
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.executeScript({file:"js/alert.js"});
  });
}
//todo, current workaround is to make popup size big enough
export function mainTabConfirm(msg){
	var ret;
	chrome.storage.sync.set({"confirmmsg":msg});
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		chrome.tab.executeScript({
	    	target: {tabId: tabs[0].id},
	    	files: ['js/confirm.js'],
		});

		chrome.extension.sendMessage({greeting: "confirm?"}, function(response) {
			ret = response.ret;
		});
	});
	return ret;
}
export function allFilled(formid){
  let allAreFilled = true;
  document.getElementById(formid).querySelectorAll("[required]").forEach(function(i) {
    if (!allAreFilled) return;
    if (!i.value) allAreFilled = false;
  })
  return allAreFilled;
}
