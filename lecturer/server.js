export function sendServer(msg,action){

	//https://stackoverflow.com/questions/5587973/javascript-upload-file
	//msg.action = action;
	msg.append("action",action); 
	const ctrl = new AbortController()    // timeout
	setTimeout(() => ctrl.abort(), 5000);
	var ret = {code:0};
	try {
		chrome.storage.sync.get("serverAddress",async({serverAddress}) =>{
			let r =  await fetch(serverAddress,
				{method: "POST", body: msg, signal: ctrl.signal,mode: 'cors'
			});
			if(r.status != 200){
   				alert("upload fail");
   			}
   			ret = await r.text(); //todo
		});
    } catch(e) {
	       	console.log('Huston we have problem...:', e);
	}
	return ret;
}
