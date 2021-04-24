async function toggle_data_public(index, data_id) {
        
  let data = new FormData();
  data.append('is_public', document.querySelector("#public_" + index).checked);

  let response = await nv3_request(
      '/api/data/' + data_id, 'PUT', data
  )

  // server responded with http response != 200
  if(response.status === 200){
      document.querySelector("#creating_status").style.visibility = "hidden";
      refresh();   
      // getPublicMaps();     
  }
}


async function uploadData() {
  
  try {
    
    let data = new FormData();
    data.append('name', document.querySelector("#data-name").value);
    data.append('file', document.querySelector("#data-file").files[0]);
    data.append('type', document.querySelector("#data-type").options.selectedIndex);
    // send fetch along with cookies
    let response = await nv3_request('/api/data', 'POST', data);
  
    // server responded with http response != 200
    if(response.status != 201)
      throw new Error('HTTP response code != 200');
    console.log(response);
    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    // let json_response = await response.json();
    //   if(json_response.error == 1)
    //       throw new Error(json_response.message);	
    refresh();
  }
  catch(e) {
    // catch rejected Promises and Error objects
      console.log(e);
    }
}


async function deleteData(id) {
  
  let response = await nv3_request(
      '/api/data/' + id, 'DELETE', null
  );
    
  if (response.status != 200) 
      throw new Error('HTTP response code != 200')
  
  refresh();
  // getPublicMaps();
}

async function getData(table) {
  
  try {
    // send fetch along with cookies
    let response = await nv3_request('/api/data', 'GET');
  
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
    
    // table = document.querySelector("#table-data");
    if (table) {
      clearTable(table);
      json_response.map((value, key) => {
        addDataToTable(table, key, value);
        
      });
    }
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

function addDataToTable(table, data_ind, data) {
    row = table.tBodies[0].insertRow();
    name_cell = row.insertCell();
    name_cell.innerText = data.name;
    public_cell = row.insertCell();
    public_cell.innerHTML = "<label class=\"switch\"><input type=\"checkbox\"/ id=\"public_" + data_ind + "\" onclick=\"toggle_data_public(" + data_ind + ", '" + data.id + "')\"" + (data.isPublic ? " checked" : "") + "><span class=\"slider round\"></span></label>"
    delete_cell = row.insertCell();
    delete_cell.style = "padding: 0.25rem";
    delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger\" id=\"delete_" + data.id + "\"><i class=\"bi-trash\"></i></button></div>"
    
    document.querySelector("#delete_" + data.id).addEventListener('click', async function() {
        await deleteData(data.id);
    });
}