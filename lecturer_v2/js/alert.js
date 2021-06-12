chrome.storage.sync.get("alertmsg", async({ alertmsg }) => {
    alert(await alertmsg);
});
