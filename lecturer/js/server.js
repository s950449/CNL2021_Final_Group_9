async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, resolve);
    })
        .then(result => {
            if (key == null) return result;
            else return result[key];
        });
}

export async function sendServer(msg,action){
	//https://stackoverflow.com/questions/5587973/javascript-upload-file
	const ctrl = new AbortController()    // timeout
	setTimeout(() => ctrl.abort(), 5000);	
	let serverAddress = await getFromStorage("serverAddress");
	try {
		let r =  await fetch(`${serverAddress}/${action}`,
			{method: "POST", body: msg, signal: ctrl.signal,mode: 'cors'
		});
		if(r.status != 200){
			alert("upload fail");
		}
		return await r.json();
    } catch(e) {
    	alert(e);
    	alert("server connection problem");
	}
	return {code:-1}; //fail
}
