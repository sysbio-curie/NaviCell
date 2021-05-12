async function toggle_public(index, map_id) {
        
    let data = new FormData();
    data.append('is_public', document.querySelector("#public_" + index).checked);

    let response = await nv3_request(
        '/api/maps/' + map_id, 'PUT', data
    )

    // server responded with http response != 200
    if(response.status === 200){
        getMaps();   
    }
}

// async function managing upload operation
async function uploadMap() {
  document.querySelector("#new_map_error_message").innerHTML = "";
  // document.querySelector("#new_map_spinner").style.visibility = "visible";
  
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
    
    if (!document.querySelector("#map-rendering").checked) {
      data.append('image-file', document.querySelector("#map-image").files[0]);
    } //else {
     
    data.append('layout', document.querySelector("#map-layout").checked);
    // }
    data.append('tags', document.querySelector("#map-tags").value);
    data.append('async', true);
    
    // send fetch along with cookies    
    let response = await nv3_request(
        '/api/maps/', 'POST', data
    );
    
    if(response.status !== 201){
      throw new Error('HTTP response code != 201');
      
    }

    refresh();
  }
}

async function deleteMap(id) {
  
  let response = await nv3_request(
      '/api/maps/' + id, 'DELETE', null
  );
    
  if (response.status != 200) 
      throw new Error('HTTP response code != 200')
  
  return await getMaps();
}

async function getMaps() {
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
  
  return json_response;
  
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
    public_cell = row.insertCell();
    if (!map.isBuilding) {
      public_cell.innerHTML = "<label class=\"switch\"><input type=\"checkbox\"/ id=\"public_" + map_ind + "\" onclick=\"toggle_public(" + map_ind + ", '" + map.id + "')\"" + (map.isPublic ? " checked" : "") + "><span class=\"slider round\"></span></label>"
    }
    public_cell.style = "padding: 0.5rem";

    delete_cell = row.insertCell();
    
    if (!map.isBuilding){
      delete_cell.style = "padding: 0.25rem";  
      delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger btn-md\" id=\"delete_" + map.id + "\"><i class=\"bi-trash\"></i></button></div>"
      delete_cell.innerHTML += "<button class=\"btn btn-md mr-1 btn-light float-right\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapse-map-" + map_ind + "\" aria-expanded=\"false\" aria-controls=\"collapse-map-" + map_ind + "\"><i class=\"bi-info-circle\"></i></button>";
      delete_cell.innerHTML += "<a href=\"session.php?map=" + map.folder + "\"><button class=\"btn btn-md mr-1 btn-light float-right\"><i class=\"bi-record-fill\"></i></button></a>";
      delete_cell.innerHTML += "<a href=\"" + map.url + "\"><button class=\"btn btn-md mr-1 btn-light float-right\"><i class=\"bi-eye\"></i></button></a>";
      
      document.querySelector("#delete_" + map.id).addEventListener('click', async function() {
          await deleteMap(map.id);
      });
    } else {
      delete_cell.style = "padding: 0.25rem";
      delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger btn-md\" id=\"delete_" + map.id + "\"><i class=\"bi-trash\"></i></button></div>"
      delete_cell.innerHTML += "<div class=\"spinner-border float-right\" role=\"status\" style=\"margin: 0.5rem; width: 1.5rem; height: 1.5rem\"></div>";
      document.querySelector("#delete_" + map.id).addEventListener('click', async function() {
        await deleteMap(map.id);
    });
    }
}



function addPublicMapToTable(table, map_ind, map) {
  row = table.tBodies[0].insertRow();
  name_cell = row.insertCell();
  name_cell.innerText = map.name;
  tags_cell = row.insertCell();
  map.tags.map(function (value, key) {
    tags_cell.innerHTML += "<a href=\"#\" class=\"btn btn-primary btn-sm mr-1\" style=\"opacity:1\">" + value + "</a>"  
  })
  
  link_info = row.insertCell();
  link_info.style = "padding: 0.25rem";
  link_info.innerHTML = "<button class=\"btn btn-md mr-1 btn-light float-right\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapse-map-" + map_ind + "\" aria-expanded=\"false\" aria-controls=\"collapse-map-" + map_ind + "\"><span data-toggle=\"tooltip\" title=\"View map info\"><i class=\"bi-info-circle\"></i></span></button>";
  link_info.innerHTML += "<a href=\"session.php?map=" + map.folder + "\"><button class=\"btn btn-md mr-1 btn-light float-right\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Start session\"><i class=\"bi-record-circle-fill\"></i></button></a>";
  link_info.innerHTML += "<a href=\"" + map.url + "\"><button class=\"btn btn-md mr-1 btn-light float-right\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"View map\"><i class=\"bi-eye\"></i></button></a>";
  
  tr_info = table.tBodies[0].insertRow();
  tr_info.classList.add("collapse");
  tr_info.id = "collapse-map-" + map_ind;
  td_info = tr_info.insertCell();
  td_info.colSpan = 3;
  
  div_info = document.createElement("div");
  div_info.classList.add("map_info");
  
  div_info.innerHTML = "<a class=\"button\" href=\"maps/" + map.networkPath + "\">CellDesigner file<i class=\"bi bi-cloud-arrow-down\"></i></a>";
  div_info.innerHTML += "<a href=\"maps/" + map.sbgnPath + "\">SBGN file<i class=\"bi bi-cloud-arrow-down\"></i></a>"; 
  div_info.innerHTML += "<a href=\"maps/" + map.imagePath + "\">PNG file<i class=\"bi bi-cloud-arrow-down\"></i></a>";
  
  
  
  td_info.appendChild(div_info);
}