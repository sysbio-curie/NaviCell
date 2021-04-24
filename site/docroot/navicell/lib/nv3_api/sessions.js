
async function deleteSession(id) {
  
  let response = await nv3_request(
      '/api/sessions/' + id, 'DELETE', null
  );
    
  if (response.status != 200) 
      throw new Error('HTTP response code != 200')
  
  refresh();
}



async function getSessions() {
  
  try {
    // send fetch along with cookies
    let response = await nv3_request('/api/sessions', 'GET');
  
    // server responded with http response != 200
    if(response.status != 200)
      throw new Error('HTTP response code != 200');
    
    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
      if(json_response.error == 1)
          throw new Error(json_response.message);	
    
    table = document.querySelector("#table-sessions");
    clearTable(table);
    json_response.map((value, key) => {
      addSessionToTable(table, key, value);
      
    });
    
    return json_response;
  }
  catch(e) {
    // catch rejected Promises and Error objects
      console.log(e);
    }
}

function clearTable(table) {
    table.tBodies[0].innerHTML = "";
}

function addSessionToTable(table, session_ind, session) {
    row = table.tBodies[0].insertRow();
    name_cell = row.insertCell();
    name_cell.innerText = session.name;
    resume_cell = row.insertCell();
    resume_cell.innerHTML = "<a href=\"session.php?session=" + session.id + "&map=" + session.mapId + "\">Resume</a>";
    
    
    download_cell = row.insertCell();
    download_cell.innerHTML = "<a href=\"/api/sessions/" + session.id + ".nvc\">Download</a>";
    delete_cell = row.insertCell();
    delete_cell.style = "padding: 0.25rem";
    delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger\" id=\"delete_" + session_ind + "\">Delete</button></div>"
    
    document.querySelector("#delete_" + session_ind).addEventListener('click', async function() {
        await deleteSession(session.id);
    });
}

function getJSONFromCommand(command) {
  return JSON.parse(command.split("@COMMAND")[1]);
}
