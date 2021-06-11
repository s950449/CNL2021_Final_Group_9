import {sendServer} from './server.js';
import {allFilled} from './utils.js';

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
    
		let msg = await sendServer(formData,"addCourse");
		console.log(msg);
		//responseMsg = {code:0,masterToken:"1234",courseID:"1"}; // for test
		alert('addCourse: ' + responseMsg.code);
   		if("code" in msg & msg.code == 0 && "courseID" in msg){
   			alert("add course success");
   			addCourse(courseName,responseMsg.masterToken,msg.courseID);

   		}else{
   			alert("add course fail");
   		}

	}else{
		alert('Fill all the fields');
	}
}

function addCourse(new_name,new_masterToken,new_courseID){
	chrome.storage.sync.get("courseList", ({ courseList }) => {
		courseList.push({name:new_name,masterToken:new_masterToken,courseID:new_courseID});
		chrome.storage.sync.set({"courseList":courseList});
	});
}

