import {sendServer} from './server.js';


var submitButton =document.getElementById('register_submit');
submitButton.onclick = function(){
   submit();
   location.reload();
};


/*var uploadFileButton = document.getElementById('student_info');
uploadFileButton.onclick = function(){
   getFile(uploadFileButton);
};*/

/*function getFile(requestor){
	alert(`pick file`);
	//requestor.value = ;
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    	chrome.scripting.executeScript({
        	target: {tabId: tabs[0].id},
        	files: ['upload.js'],
    	});
  	});
}*/
async function submit(){
	if(allFilled("newCourseForm")){
		
		let courseName = document.getElementById('course_name').value;
		let lecturerEmail = document.getElementById('lecturer_email').value;
		let studentForm = document.getElementById('student_info').files[0];
    	let formData = new FormData();
         
    	formData.append("course_name", courseName);
    	formData.append("lecturer_email", lecturerEmail);
    	formData.append("student_form",studentForm); 
    
		let responseMsg = sendServer(formData,"addCourse");
		responseMsg = {code:0,token:"1234"}; // for test
   		if(responseMsg.code == 0){
   			alert("add course success");
			chrome.storage.sync.get("courseList", ({ courseList }) => {
				courseList.push({name:courseName,token:responseMsg.token});
				chrome.storage.sync.set({"courseList":courseList});
			});
   		}else{
   			alert("add course fail");
   		}
	}else{
		alert('Fill all the fields');
	}
}


function allFilled(formid){
  let allAreFilled = true;
  document.getElementById(formid).querySelectorAll("[required]").forEach(function(i) {
    if (!allAreFilled) return;
    if (!i.value) allAreFilled = false;
  })
  return allAreFilled;
}