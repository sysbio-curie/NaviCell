function generateRandomHexString(length) {
  let characters = "0123456789abcdef";
  let str = ""
  for(let i = 0; i < length; i++){
    str += characters[Math.floor(Math.random() * 16)]
  }
  return str;
}

function generateSessionId() {
  return generateRandomHexString(8) + '-' + generateRandomHexString(4) + '-' + generateRandomHexString(4) + '-' + generateRandomHexString(4) + '-' + generateRandomHexString(12);
}



async function sleep(duration) {
  await new Promise(r => setTimeout(r, duration));
}

async function startSession(map) {
        
  session = {"sessionId" : generateSessionId(), "mapId" : map};   
  let url = "/maps/" + session.mapId + "/master/index.php?id=@" + session.sessionId;
  let map_window = window.open(url)
  // await sleep(1000);
  let timerUpdateSession = setInterval(async function () { await updateSession(session.sessionId);}, 5000);
  await sleep(1000);
  await waitForReady();
}

async function sendCommandToSession(command) {
  let url = "/cgi-bin/nv_proxy.php/?id=" + session.sessionId + "&data=" + command;
  let response = await fetch(url, {method: "GET"});

  if (response.status != 200) {
    console.log("ERROR : Could not send command");
    return false;
  }
  
  let json_response = await response.json();
  if(json_response.error == 1){
      console.log("ERROR : Could not parse command return");
      return false;
  }
  
  if (command.action === "nv_import_datables") {
    await waitForDataLoaded();
  }
      
  return json_response.data;
}

async function getCommandHistory() {
  // let url = "/maps/" + session.mapId + "/master/index.php?id=" + session.id + "&data=@COMMAND{\"action\":\"nv_get_command_history\",\"args\":[]}";
  let url = "/cgi-bin/nv_proxy.php/?id=" + session.sessionId + "&data=@COMMAND{\"action\":\"nv_get_command_history\",\"args\":[]}";
  let response = await fetch(url, {method: "GET"});

  if (response.status != 200) {
    console.log("ERROR : Could not fetch command history");
  }
  
  let json_response = await response.json();
  if(json_response.error == 1)
      console.log("ERROR : Could not parse command history");

  return json_response.data;
      
}

async function waitForDataLoaded() {
  while (!await sendCommandToSession("@COMMAND {\"action\": \"nv_is_imported\", \"args\": []}")) {
    await sleep(1000);
  } 
}

async function waitForReady() {
  while (!await sendCommandToSession("@COMMAND {\"action\": \"nv_is_ready\", \"args\": []}")) {
    await sleep(1000);
  } 
}


async function resumeSession(session_id, map_id) {
        
  console.log("Resuming session...")
  let response = await nv3_request("/api/sessions/" + session_id, 'GET');
  if (response.status != 200) {
    console.log("ERROR : Session recovery failed");
  }
  
  let json_response = await response.json();
  if(json_response.error == 1)
      console.log("ERROR : Getting session recovered failed");

  session = json_response;   
  // session.id = session_id;
  let url = "/maps/" + map_id + "/master/index.php?id=@" + session.sessionId;
  let map_window = window.open(url)
  await sleep(1000);
  await waitForReady();
  for (i=0; i < session.commands.length; i++) {
    await sendCommandToSession(session.commands[i]);
    await waitForReady();
    await sleep(1000);
  }
  await updateSession();
  let timerUpdateSession = setInterval(async function () { await updateSession();}, 5000);
  console.log("Session resumed...")
  resumed = true;
  refresh();
}

let data_biotypes = [
  "mRNA expression data", "microRNA expression data", "Protein expression data", 
  "Discrete Copy number data", "Continuous copy number data", "Mutation data", "Gene list"
]

async function addDataToSession(name, t_data, t_data_url, t_data_type) {
  console.log(t_data);
  document.querySelector("#data_modal_error_message").innerHTML = "";
  document.querySelector("#data_modal_spinner").style.visibility = "visible";
  
  let path_data;
  if (t_data !== undefined) {
    path_data = t_data.path;//.split("/var/navicell/site/docroot/navicell")[1]
  } else if (t_data_url !== undefined) {
    // path_data = t_data_url;
    let form_data = new FormData();
    form_data.append('name', name);
    form_data.append('session_id', session.sessionId);
    form_data.append('file-url', t_data_url);
    form_data.append('type', 0);    
    let response = await nv3_request("/api/data", "POST", form_data);
    
    if (response.status != 201) {
      console.log("ERROR : Could not upload temp data");
    }
    let json_response = await response.json();
  
    console.log(json_response);
    path_data = json_response.path;//.split("/var/navicell/site/docroot/navicell")[1];  
    
    
    
  } else {
    console.log("ERROR : No data to load !");
  }
  
  
  let cmd = "@COMMAND{\"action\":\"nv_import_datatables\",\"args\":[\"" + data_biotypes[t_data_type] + "\", \"" + name + "\", \"\", \"../../../data/" + path_data + "\"]}";
  let url = "/cgi-bin/nv_proxy.php/?id=" + session.sessionId + "&data=" + cmd;
  let response = await fetch(url, {method: "GET"});

  if (response.status != 200) {
    document.querySelector("#data_modal_error_message").innerHTML = "ERROR : Could not fetch command history";
  }
  
  let json_response = await response.json();
  if(json_response.error == 1)
    document.querySelector("#data_modal_error_message").innerHTML = "ERROR : Could not parse command history";
  
  await sleep(1000);
  await waitForDataLoaded();
  // document.querySelector("#data_model_error_message").innerHTML = "";
  await updateSession();
  document.querySelector("#data_modal_spinner").style.visibility = "hidden";

} 

filter = [
  // These three are used extensively by the website
  "nv_get_command_history", 
  "nv_is_imported",
  "nv_is_ready",
  
  // Here we have a lot of parasite movements
  // "nv_set_zoom",
  // "nv_set_center", 
  
];

function filterOutGetCommandHistory(command_history) {
  filtered_commands = [];
  if (command_history.length > 0){
    commands = command_history.split("\n\n");
    commands.map(function (value, key) {
      t_command = JSON.parse(value.split("@COMMAND")[1])
    
      if (!filter.includes(t_command.action)
      ) {
        filtered_commands.push(value);
      }
    });
  }
  doublons_filtered_commands = [];
  filtered_commands.map(function (value, key) {
    if (key == 0) {
      doublons_filtered_commands.push(value);  
    } else {
      command = getJSONFromCommand(value);
      previous_command = getJSONFromCommand(filtered_commands[key-1])
      if (previous_command.action !== command.action || !arrayEquals(previous_command.args, command.args)) {
        doublons_filtered_commands.push(value);  
      } 
    }
  });

  

  return doublons_filtered_commands.join("\n\n");
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

async function updateSession() {
  command_history = await getCommandHistory();
  // console.log(command_history);
  command_history = filterOutGetCommandHistory(command_history);
  // console.log(command_history);
  table = document.querySelector("#table-active-session");
  clearTable(table);
  command_history.split("\n\n").map(function (value, key) {
    // console.log("Adding : " + value);
    addActiveSessionToTable(table, key, value);
  })
  
  
  // let data = new FormData();
  // data.append('commands', command_history);
  
  // let response = await nv3_request("/api/sessions/" + session_id, 'PUT', data);
  // if (response.status != 200) {
  //   console.log("Could not update the session");
  // }
  
  
}

async function saveSession(name) {
        
  let form_data = new FormData();
  form_data.append('name', name);
  form_data.append('sessionId', session.sessionId);
  form_data.append('mapId', session.mapId);
  let response = await nv3_request("/api/sessions", 'POST', form_data);
  if (response.status != 201) {
    console.log("ERROR : Session creation failed");
  }
  
  let json_response = await response.json();
  if(json_response.error == 1)
      console.log("ERROR : Getting session created failed");

  console.log(json_response);
  
  
  command_history = await getCommandHistory();
  // console.log(command_history);
  command_history = filterOutGetCommandHistory(command_history);
  
  
  form_data = new FormData();
  form_data.append('commands', command_history);
  
  response = await nv3_request("/api/sessions/" + session.sessionId, 'PUT', form_data);
  if (response.status != 200) {
    console.log("Could not update the session");
  }
  
}

async function updateSavedSession() {
    
  command_history = await getCommandHistory();
  // console.log(command_history);
  command_history = filterOutGetCommandHistory(command_history);
    
  form_data = new FormData();
  form_data.append('commands', command_history);
  
  response = await nv3_request("/api/sessions/" + session.sessionId, 'PUT', form_data);
  if (response.status != 200) {
    console.log("Could not update the session");
  }
}

async function deleteSession(id) {
  
  let response = await nv3_request(
      '/api/sessions/' + id, 'DELETE', null
  );
    
  if (response.status != 200) 
      throw new Error('HTTP response code != 200')
  
  refresh();
  // getPublicMaps();
}




function clearTable(table) {
    table.tBodies[0].innerHTML = "";
}

function getJSONFromCommand(command) {
  return JSON.parse(command.split("@COMMAND")[1]);
}

function addActiveSessionToTable(table, command_ind, command) {
  row = table.tBodies[0].insertRow();
  name_cell = row.insertCell();
  if (command.length > 0) {
    cmd = JSON.parse(command.split("@COMMAND")[1]);
    txt_cmd = cmd.action + "(";
    for (i=0; i < cmd.args.length; i++) {
      
      if (cmd.args[i] !== null) {
        if (i > 0)
          txt_cmd += ", ";
        txt_cmd += cmd.args[i].toString();
      }
    }
    txt_cmd += ")"
    
    name_cell.innerText = txt_cmd;
    other_cell = row.insertCell();
  }
}
