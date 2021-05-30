let defaultServer = '127.0.0.1';
let courseToken = 'default course token';
let userToken = 'default user token';

chrome.runtime.onInstalled.addListener(
    () => {
        chrome.storage.sync.set({ defaultServer });
        chrome.storage.sync.set({ courseToken });
        chrome.storage.sync.set({ userToken });
        console.log('Default server address: %s', defaultServer);
    }
);

chrome.tabs.onUpdated.addListener(function (tabI, changeInfo, tab) {
    console.log('onUpdated');
    if (changeInfo.url) {
        console.log(`onUpdated: URL has changed to ${changeInfo.url}`);
        onUrlChanged(changeInfo.url);
    }
})

chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log("onActivated");
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (activeInfo.tabId === tabId && changeInfo.url) {
            console.log(`onActivated.onUpdated: URL has changed to ${changeInfo.url}`);
            onUrlChanged(changeInfo.url);
        }
    })
})

function onUrlChanged(urlString) {
    url = new URL(urlString);
    tmpcourseToken = url.searchParams.get('courseToken');
    tmpUserToken = url.searchParams.get('userToken');

    if (tmpcourseToken != null && tmpUserToken != null) {
        console.log('courseToken: %s', courseToken);
        courseToken = tmpcourseToken;
        chrome.storage.sync.set({ courseToken });

        console.log('userToken: %s', userToken);
        userToken = tmpUserToken;
        chrome.storage.sync.set({ userToken });
    }
}