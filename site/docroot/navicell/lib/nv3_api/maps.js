async function toggle_public(index, map_id) {
        
    let data = new FormData();
    data.append('is_public', document.querySelector("#public_" + index).checked);

    let response = await nv3_request(
        '/api/maps/' + map_id, 'PUT', data
    )

    // server responded with http response != 200
    if(response.status === 200){
        document.querySelector("#creating_status").style.visibility = "hidden";
        getMaps();   
        // getPublicMaps();     
    }
}

// async function managing upload operation
async function uploadMap() {
  // function return value
  document.querySelector("#error_message").innerHTML = "";

  let return_data = { error: 0, message: '' };

  try {
    // no file selected
    if(document.querySelector("#map-name").value === "") {
      throw new Error('No name given');
      
    } else if(document.querySelector("#map-network").files.length == 0) {
      throw new Error('No network file selected');
      
    } else {
      // formdata
      let data = new FormData();
      data.append('name', document.querySelector("#map-name").value);
      data.append('network-file', document.querySelector("#map-network").files[0]);
      data.append('layout', document.querySelector("#map-layout").checked);
      data.append('tags', document.querySelector("#map-tags").value);
      
      document.querySelector("#creating_status").style.visibility = "visible";
      // send fetch along with cookies
      
      let response = await nv3_request(
          '/api/maps/', 'POST', data
      );
      
      if(response.status !== 201){
        throw new Error('HTTP response code != 201');
      }
  
      // let json_response = await response.json();
      // if(json_response.error == 1)
      //     throw new Error(json_response.message);	
    
      document.querySelector("#creating_status").style.visibility = "hidden";
      getMaps();
      // read json response from server
      // success response example : {"error":0,"message":""}
      // error response example : {"error":1,"message":"File type not allowed"}
      // let json_response = await response.json();
      //   if(json_response.error == 1)
      //       throw new Error(json_response.message);	
    }
  }
  catch(e) {
    // catch rejected Promises and Error objects
      return_data = { error: 1, message: e.message };
    }

  return return_data;
}

async function deleteMap(id) {
  
  let response = await nv3_request(
      '/api/maps/' + id, 'DELETE', null
  );
    
  if (response.status != 200) 
      throw new Error('HTTP response code != 200')
  
  getMaps();
  // getPublicMaps();
}
async function getMaps() {

  try {
    
    // send fetch along with cookies
    let response = await nv3_request('/api/maps/', 'GET', null);
  
    // server responded with http response != 200
    if(response.status != 200)
      throw new Error('HTTP response code != 200');

    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
      if(json_response.error == 1)
          throw new Error(json_response.message);	
    
    table = document.querySelector("#table-maps");
    clearTable(table);
    json_response.map((value, key) => {
      addMapToTable(table, key, value);
      
    });
  }
  catch(e) {
    // catch rejected Promises and Error objects
      return_data = { error: 1, message: e.message };
    }
}

async function getPublicMaps() {

  try {
    
    // send fetch along with cookies
    let response = await nv3_request('/api/maps/public', 'GET', null);
  
    // server responded with http response != 200
    if(response.status != 200)
      throw new Error('HTTP response code != 200');

    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
      if(json_response.error == 1)
          throw new Error(json_response.message);	
    
    table = document.querySelector("#table-public-maps");
    clearTable(table);
    json_response.map((value, key) => {
      addPublicMapToTable(table, key, value);
      
    });
  }
  catch(e) {
    // catch rejected Promises and Error objects
      return_data = { error: 1, message: e.message };
    }
}


async function getPublicMapsByTags(tags) {
  console.log(tags)
  try {
    let data = new FormData();
    data.append('tags', tags.join());

    console.log(data)
    // send fetch along with cookies
    let response = await nv3_request('/api/maps/public', 'POST', data);
  
    // server responded with http response != 200
    if(response.status != 200)
      throw new Error('HTTP response code != 200');
    console.log(response);
    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
      if(json_response.error == 1)
          throw new Error(json_response.message);	
    
    table = document.querySelector("#table-public-maps");
    clearTable(table);
    json_response.map((value, key) => {
      addPublicMapToTable(table, key, value);
      
    });
  }
  catch(e) {
    // catch rejected Promises and Error objects
      console.log(e);
    }
}

async function getTags() {
  try{
   // send fetch along with cookies
   let response = await nv3_request('/api/tags', 'GET', null);
  
   // server responded with http response != 200
   if(response.status != 200)
     throw new Error('HTTP response code != 200');

   // read json response from server
   // success response example : {"error":0,"message":""}
   // error response example : {"error":1,"message":"File type not allowed"}
   let json_response = await response.json();
     if(json_response.error == 1)
         throw new Error(json_response.message);	
   
   return json_response;
 }
 catch(e) {
   // catch rejected Promises and Error objects
     return_data = { error: 1, message: e.message };
   }
}
function clearTable(table) {
    table.tBodies[0].innerHTML = "";
}

function addMapToTable(table, map_ind, map) {
    row = table.tBodies[0].insertRow();
    name_cell = row.insertCell();
    name_cell.innerText = map.name;
    link_cell = row.insertCell();
    link_cell.innerHTML = "<a href=\"" + map.url + "\">Access map</a>";
    public_cell = row.insertCell();
    public_cell.innerHTML = "<label class=\"switch\"><input type=\"checkbox\"/ id=\"public_" + map_ind + "\" onclick=\"toggle_public(" + map_ind + ", '" + map.id + "')\"" + (map.isPublic ? " checked" : "") + "><span class=\"slider round\"></span></label>"
    delete_cell = row.insertCell();
    delete_cell.style = "padding: 0.25rem";
    delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger\" id=\"delete_" + map.id + "\">Delete</button></div>"
    
    document.querySelector("#delete_" + map.id).addEventListener('click', async function() {
        await deleteMap(map.id);
    });
}
function addPublicMapToTable(table, map_ind, map) {
  row = table.tBodies[0].insertRow();
  name_cell = row.insertCell();
  name_cell.innerText = map.name;
  link_cell = row.insertCell();
  link_cell.innerHTML = "<a href=\"" + map.url + "\">Access map</a>";
  tags_cell = row.insertCell();
  map.tags.map(function (value, key) {
    tags_cell.innerHTML += "<a href=\"#\" class=\"btn btn-primary btn-sm mr-1\" style=\"opacity:1\">" + value + "</a>"  
  })
  
}