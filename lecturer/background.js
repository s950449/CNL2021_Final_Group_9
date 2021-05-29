var courseList = [];


let serverAddress = "http://127.0.0.1:8000";
chrome.runtime.onInstalled.addListener(() => { 
  chrome.storage.sync.set({ "courseList":courseList });
  chrome.storage.sync.set({ "serverAddress":serverAddress } );
  console.log('Default course is empty');
});
