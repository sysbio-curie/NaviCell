<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
        <div class="row">
          <div class="col-4"><h1>My Maps</h1></div>
          <div class="col-8">
            <button class="btn btn-primary float-right mr-1" type="button" data-toggle="modal" data-target="#newMapModal">
              <i class="bi-plus-circle-fill"></i>&nbsp;Create new map
            </button>
          </div>
        </div>  
      
          <div class="container-fluid">
            <table id="table-maps" class="table table-stripped">
              <thead>
                <th style="border-top: 0"></th>
                <th style="border-top: 0">Public</th>
                <th style="border-top: 0"></th>
              </thead>
              <tbody></tbody>
            </table>
            <br/><br/>
            <div id="createmap_div" style="display: none;">
            
            </div>
          </div>
          
      </div>
    
      
     
    </main><!-- /.container -->
    
     
    <div class="modal fade" id="newMapModal" tabindex="-1" role="dialog" aria-labelledby="newMapModalLabel" aria-hidden="true">     
      <div class="modal-dialog modal-lg" role="document">
        <form id="create_map_form">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create new map</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="simple-tab" data-toggle="tab" href="#simple" role="tab" aria-controls="simple" aria-selected="true">Simple</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="layers-tab" data-toggle="tab" href="#layers" role="tab" aria-controls="layers" aria-selected="false">Semantic Zooming</a>
              </li>
              <!-- <li class="nav-item">
                <a class="nav-link" id="modules-tab" data-toggle="tab" href="#modules" role="tab" aria-controls="modules" aria-selected="false">Modules</a>
              </li> -->
            </ul>
            <div class="tab-content" id="myTabContent">
              <div class="tab-pane fade show active" id="simple" role="tabpanel" aria-labelledby="simple-tab">
                <table class="table">
                  <tbody>
                    <tr>
                      <td>Name:</td>
                      <td><input type="text" id="map-name" /></td>
                    </tr>
                    <tr>
                      <td>Network file:</td>
                      <td><input type="file" id="map-network" /></td>
                    </tr>
                    <tr>
                      <td>Automatic rendering</td>
                      <td>
                        <label class="switch"><input type="checkbox" id="map-rendering" checked><span class="slider round"></span></label>
                      </td>
                    </tr>
                    <tr class="collapse" id="map-image-tr">
                      <td>Image file:</td>
                      <td><input type="file" id="map-image" /></td>
                    </tr>
                    <tr class="collapse.show" id="map-layout-tr">
                      <td>Layout</td>
                      <td>
                        <label class="switch"><input type="checkbox" id="map-layout"><span class="slider round"></span></label>
                      </td>
                    </tr>
                    
                    <tr>
                      <td>Tags:</td>
                      <td><input type="text" id="map-tags" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tab-pane fade" id="layers" role="tabpanel" aria-labelledby="layers-tab">
              <table class="table" id="map-layers-table-form">
                  <tbody>
                    <tr>
                      <td>Name:</td>
                      <td><input type="text" id="layered-map-name" /></td>
                    </tr>
                    <tr>
                      <td>Network file:</td>
                      <td><input type="file" id="layered-map-network" /></td>
                    </tr>
                    <tr>
                      <td>Top level image:</td>
                      <td>
                        <input type="file" id="layered-map-image-0" />
                        <button type="button" class="btn btn-primary btn-sm float-right ml-1" id="map-layers-add-button">
                          <i class="bi-plus-circle-fill"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>Black and white images</td>
                      <td>
                        <label class="switch"><input type="checkbox" id="layered-map-nobg"><span class="slider round"></span></label>
                      </td>
                    </tr>
                    <tr class="collapse" id="layered-map-nobg-tr-0">
                      <td>Top level b&w image file:</td>
                      <td>
                        <input type="file" id="layered-map-nobg-image-0" />
                        <button type="button" class="btn btn-primary btn-sm float-right ml-1" id="map-layers-nobg-add-button">
                          <i class="bi-plus-circle-fill"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>Tags:</td>
                      <td><input type="text" id="layered-map-tags" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- <div class="tab-pane fade" id="modules" role="tabpanel" aria-labelledby="modules-tab">
            
              </div> -->
            </div>
           
          </div>
  
          
          <div class="modal-footer">
          
          <div class="float-right">
              <span id="new_map_error_message"></span>
      
              <div class="spinner-border mr-3" role="status" style="visibility:hidden" id="new_map_spinner">
                <span class="sr-only">Creating the map...</span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Create Map</button>
          </div>
        </div>
        </form>
      </div>
    </div>
    
    <script type="text/javascript">
      let max_levels = 1;
      document.querySelector("#map-layers-add-button").addEventListener('click', async function(e) {
        console.log("Clicked add layer");
        row = document.querySelector("#map-layers-table-form").tBodies[0].insertRow(2+max_levels);
        label = row.insertCell();
        label.innerText = "level " + max_levels + " image";
        
        input = row.insertCell();
        input.innerHTML = "<input type=\"file\" id=\"layered-map-image-" + max_levels + "\" name=\"layered-map-image-" + max_levels + "\"/>";
        
        row = document.querySelector("#map-layers-table-form").tBodies[0].insertRow(4+max_levels+1);
        row.classList.add("collapse" + (document.querySelector("#layered-map-nobg").checked ? ".show" : ""));
        row.id = "layered-map-nobg-tr-" + max_levels;
        
        label = row.insertCell();
        label.innerText = "level " + max_levels + " b&w image";
        
        input = row.insertCell();
        input.innerHTML = "<input type=\"file\" id=\"layered-map-nobg-image-" + max_levels + "\" name=\"layered-map-nobg-image-" + max_levels + "\"/>";
        
        
        max_levels += 1;
      });
      document.querySelector("#map-rendering").addEventListener('change', async function(e) {
        if (document.querySelector("#map-rendering").checked) {
          document.querySelector("#map-image-tr").classList.add("collapse");
          document.querySelector("#map-image-tr").classList.remove("collapse.show");
          document.querySelector("#map-layout-tr").classList.remove("collapse");
          document.querySelector("#map-layout-tr").classList.add("collapse.show");
        } else {
          document.querySelector("#map-image-tr").classList.remove("collapse");
          document.querySelector("#map-image-tr").classList.add("collapse.show");
          document.querySelector("#map-layout-tr").classList.add("collapse");
          document.querySelector("#map-layout-tr").classList.remove("collapse.show");
        }
        
      });
      
      document.querySelector("#layered-map-nobg").addEventListener('change', async function(e) {
        for (i=0; i < max_levels; i++) {
            
          if (document.querySelector("#layered-map-nobg").checked) {
            document.querySelector("#layered-map-nobg-tr-" + i.toString()).classList.add("collapse.show");
            document.querySelector("#layered-map-nobg-tr-" + i.toString()).classList.remove("collapse");
          
          // document.querySelector("#map-image-tr").classList.remove("collapse.show");
          // document.querySelector("#map-layout-tr").classList.remove("collapse");
          // document.querySelector("#map-layout-tr").classList.add("collapse.show");
          } else {
            
            document.querySelector("#layered-map-nobg-tr-" + i.toString()).classList.remove("collapse.show");
            document.querySelector("#layered-map-nobg-tr-" + i.toString()).classList.add("collapse");
            // document.querySelector("#map-image-tr").classList.add("collapse.show");
            // document.querySelector("#map-layout-tr").classList.add("collapse");
            // document.querySelector("#map-layout-tr").classList.remove("collapse.show");
          }
        }
        
      });
      
      document.querySelector("#create_map_form").addEventListener('submit', async function(e) {
        e.preventDefault();
        active_tab = Object.values(document.querySelector("#myTabContent").children).reduce((result, element, ind) => {
          if (element.classList.contains("active")) {
              result = ind;
          }
          return result;
        }, -1);
        
        try {
          await uploadMap(active_tab);
          $("#newMapModal").modal('hide');
        }
        catch (e) {
          console.log(e)
          document.querySelector("#new_map_error_message").innerHTML = e.message;
          document.querySelector("#new_map_spinner").style.visibility = "hidden";
        }
        
      });
         
      async function local_refresh() {
        if (logged_in()) {
          document.querySelector("#createmap_div").style.display = "block";
        }
        maps = await getMaps();
        nb_building = 0;
        
        maps.map(function (map) {
          if (map.isBuilding) {
            nb_building += 1;
          }
        })
        if (nb_building > 0) {
          setTimeout(function(){ refresh() }, 10000);
        }
      }
     
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        await refresh();  
      });
    </script>
    <script src="lib/nv3_api/auth.js"></script>
    <script src="lib/nv3_api/maps.js"></script>
    
  </body>
</html>
