document.addEventListener('DOMContentLoaded', loadPage)
function loadPage(){
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
  		var url = tabs[0].url;
     	parseURL(url);
     	chrome.storage.sync.get( "courseID" , ({courseID}) => {
			if(courseID === ''){
				location.assign('../html/myCourse.html');
			}else{
				location.assign('../html/inCourse.html');
			}
		});
   	});
}

function parseURL(urlString) {
    let url = new URL(urlString);
    let courseID = url.searchParams.get('courseID');
    let userToken = url.searchParams.get('userToken');
    if (courseID != null && userToken != null) {
        chrome.storage.sync.set({ "courseID":courseID });
        chrome.storage.sync.set({ "userToken":userToken });  
    }else{
      chrome.storage.sync.set({ "userToken": '' });
      chrome.storage.sync.set({ "courseID": '' });
    }
}