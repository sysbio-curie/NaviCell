<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
    
        
        <div class="container-fluid" >
           
          <div class="container-fluid">
            <div class="row">
              <div class="col-8"><h1>Collection of Maps</h1></div>
              <div class="col-4"><button class="btn btn-primary float-right" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                <i class="bi-filter"></i>&nbsp;Filter
              </button></div>
            </div>
            
            <br/><br/>
          <div class="collapse" id="collapseExample">
            <div class="row">
              <div class="col-10">
                <div id="list_tags"></div>
                </div>
              <div class="col-2">
              <a href="#" class="btn btn-primary btn-sm mr-1 float-right" style="opacity:1" role="button" id="tag_all"><i class="bi-check-all"></i></a>
              </div>
            </div>
            
          </div>
            
            
            <table id="table-public-maps" class="table table-stripped">
              <thead>
                <th style="border-top: 0"></th>
                <th style="border-top: 0"></th>
                <th style="border-top: 0"></th>
              </thead>
              <tbody></tbody>
            </table>
            
          </div>
        </div>
        
      
     
    </main><!-- /.container -->
    
    <script type="text/javascript">
      // document.querySelector("#map-create-button").addEventListener('click', async function() {
      //   let upload = await uploadMap();
      // });
      
      function get_active_tags() {
        list_tags = []
        Array.from(document.querySelector("#list_tags").children).map(function (child, key) {
              if (child.style.opacity > 0.8) {
                list_tags.push(child.innerText);
              }
            });
        return list_tags;
      }
      
      document.querySelector("#tag_all").addEventListener('click', async function(e) {
        
        e.target.style.opacity = e.target.style.opacity > 0.8 ? .65 : 1;
          // let tags = await getTags();
        Array.from(document.querySelector("#list_tags").children).map(function (child, key) {
          child.style.opacity = e.target.style.opacity;
        });
        
        await getPublicMapsByTags(get_active_tags());

        
        // console.log(child)
        // console.log(key)
      });
      
      
      
      async function local_refresh() {
        // if (logged_in()) {
        //   document.querySelector("#createmap_div").style.display = "block";
        // }
        // await getMaps();
        await getPublicMaps();
        let tags = await getTags();
        
        tags.map(function (tag, key) {
          list_tags = document.querySelector("#list_tags");
          list_tags.insertAdjacentHTML('beforeend', '<a href="#" class="btn btn-primary btn-sm mr-1" style="opacity:1" role="button" id="tag_' + key + '">' + tag + '</a>');
          document.querySelector("#tag_" + key).addEventListener('click', async function(e) {
        
            e.target.style.opacity = e.target.style.opacity > 0.8 ? .65 : 1;
            
            await getPublicMapsByTags(get_active_tags());
    });
          // link = document.createElement("a")
          // <a href="#" class="btn btn-primary btn-lg" role="button" id="link2">Primary link 2</a>
            
        })
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
