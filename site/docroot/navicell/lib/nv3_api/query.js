async function getMapInfos(mapIds) {
    let map_infos = {}
    await Promise.all(Array.from(mapIds).map(async value => {
      try 
      {
        
        let response = await nv3_request(
            '/api/maps/' + value, 'GET'
        )

        // server responded with http response != 200
        if(response.status != 200)
          throw new Error('HTTP response code != 200');

        // read json response from server
        // success response example : {"error":0,"message":""}
        // error response example : {"error":1,"message":"File type not allowed"}
        let json_response = await response.json();
          if(json_response.error == 1)
              throw new Error(json_response.message);	
        map_infos[json_response.id] = json_response;
        // console.log(map_infos);
      }
      catch(e) {
        // catch rejected Promises and Error objects
          return_data = { error: 1, message: e.message };
      }
    }));
    // console.log(map_infos);
    return map_infos;
  
    
    
  }
  
  function addSpeciesSearchResult(table, value, key, map_info) {
    row = table.tBodies[0].insertRow();
    name_cell = row.insertCell();
    name_cell.innerText = value.name;
    type_cell = row.insertCell();
    type_cell.innerText = value.type;
    map_cell = row.insertCell();
    map_cell.innerHTML = "<a href=\"javascript_required.html\" id=\"link_" + key + "\">" + map_info[value.mapId].name + "</a>"
    
    document.querySelector("#link_" + key).addEventListener('click', function (e) {
      e.preventDefault();
      map = window.open(map_info[value.mapId].url);
      console.log(value.speciesId);
      map.to_open = [value.speciesId];
    });
  }
  
  function clearSpeciesSearchResults(table) {
    table.tBodies[0].innerHTML = "";
  }
  
  async function getByTag(tag) {
      
    try{
        let response = await nv3_request(
            'api/tags/name/' + tag, 'GET'
        )
        
        // server responded with http response != 200
      if(response.status != 200)
      throw new Error('HTTP response code != 200');

    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
      if(json_response.error == 1)
          throw new Error(json_response.message);	
    
    console.log(json_response.length);
    if (json_response.length > 0) {
        table = document.querySelector("#table-results");  
        clearTable(table);
        json_response.map((value, key) => {
            addMapToTable(table, key, value);
        });
        
        
    } else {
        table = document.querySelector("#table-results");
        table.tBodies[0].innerHTML = "Maps with the tag <b>" + tag + "</b> couldn't be found.";
    }
}
    catch(e) {
        console.log(e);
    }
}

  async function getByName(name) {

    try {


    let response = await nv3_request(
        '/api/species/name/' + name, 'GET'
    )
    
      // server responded with http response != 200
      if(response.status != 200)
        throw new Error('HTTP response code != 200');

      // read json response from server
      // success response example : {"error":0,"message":""}
      // error response example : {"error":1,"message":"File type not allowed"}
      let json_response = await response.json();
        if(json_response.error == 1)
            throw new Error(json_response.message);	
      
      console.log(json_response.length);
      if (json_response.length > 0) {
            
        let map_ids = new Set();
        json_response.map((value) => {
          map_ids.add(value.mapId)
        });
        
        let map_info = await getMapInfos(map_ids);
              
        // console.log(json_response);
        table = document.querySelector("#table-results");

        clearSpeciesSearchResults(table);
        json_response.map((value, key) => {
          addSpeciesSearchResult(table, value, key, map_info);
      
        });
      }
      else {
        console.log("Couldnt be found");
        table = document.querySelector("#table-results");
        table.tBodies[0].innerHTML = "<b>" + name + "</b> couldn't be found.";
      }
    }
    catch(e) {
      // catch rejected Promises and Error objects
        return_data = { error: 1, message: e.message };
    }
  }
  
  async function getByHugoName(name) {

    try {
        
        let response = await nv3_request(
            '/api/species/hugo/' + name, 'GET'
        )
      
      // server responded with http response != 200
      if(response.status != 200)
        throw new Error('HTTP response code != 200');

      // read json response from server
      // success response example : {"error":0,"message":""}
      // error response example : {"error":1,"message":"File type not allowed"}
      let json_response = await response.json();
        if(json_response.error == 1)
            throw new Error(json_response.message);	
      
      console.log(json_response.length);
      if (json_response.length > 0) {
            
        let map_ids = new Set();
        json_response.map((value) => {
          map_ids.add(value.mapId)
        });
        
        let map_info = await getMapInfos(map_ids);
              
        // console.log(json_response);
        table = document.querySelector("#table-results");
        clearSpeciesSearchResults();
        json_response.map((value, key) => {
            addSpeciesSearchResult(table, value, key, map_info);
        });
      }
      else {
        console.log("Couldnt be found");
        table = document.querySelector("#table-results");
        table.tBodies[0].innerHTML = "Hugo term <b>" + name + "</b> couldn't be found.";
      }
    }
    catch(e) {
      // catch rejected Promises and Error objects
        return_data = { error: 1, message: e.message };
    }
  }