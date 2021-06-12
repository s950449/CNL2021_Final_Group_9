import {sendServer} from './server.js';
import {allFilled} from './utils.js';

var submitButton =document.getElementById('register_submit');
submitButton.onclick = async function(){
   await submit();
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
		try{
			
			let courseName = document.getElementById('course_name').value;
			//let lecturerEmail = document.getElementById('lecturer_email').value;
			//let studentForm = document.getElementById('student_form').files[0];
			//let studentFormStr = await readFileAsync(document.getElementById('student_form').files[0]);
		   var formData = new FormData(document.getElementById("newCourseForm"));
		   //let formData = new FormData();
		   //console.log(formData);
			//formData.append('course_name', courseName);
		  	//formData.append('lecturer_email', lecturerEmail);
			//formData.append("student_form",document.getElementById('student_info').files[0]); 
			//formData.append("student_form",studentFormStr); 
			//alert(studentFormStr);

			//formData.append("student_form",await reader.result); 
	      let msg = await sendServer(await formData,"addCourse");
	      alert('addCourse: ' + msg.code);
			if("code" in msg & msg.code == 0 && "courseID" in msg){
				alert("add course success");
				//todo
				addCourse(courseName,"",msg.courseID);
			}else{
				alert("add course fail");
			}


		/*let reader = new FileReader();		
		reader.onload = async() => {
	      formData.append("student_form",await reader.result); 
	      let msg = await sendServer(formData,"addCourse");
	      alert('sent');
			alert(msg);
	      alert('addCourse: ' + msg.code);
			if("code" in msg & msg.code == 0 && "courseID" in msg){
				alert("add course success");
				addCourse(courseName,responseMsg.masterToken,msg.courseID);
			}else{
				alert("add course fail");
			}
	   };
	   await reader.readAsText(studentForm);*/
		}catch(e){
			alert(e);
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


function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  })
}

