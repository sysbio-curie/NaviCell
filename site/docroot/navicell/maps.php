<!doctype html>

<html lang="en">
<?php $title="Maps"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
    
        
        <div class="container-fluid" >
           
          <div class="container-fluid">
            <div class="row">
              <div class="col-8"><h1>Collection of Maps</h1></div>
              <div class="col-4"><button class="btn btn-primary float-right" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                <i class="bi-filter"></i>&nbsp;More tags
              </button></div>
            </div>
            
            <br/><br/>
            <div>
              <div class="row">
              <div class="col-10">
                <div id="list_first_tags" style="line-height: 2em"></div>
              </div>
              <div class="col-2">
              <a href="#" class="btn btn-primary btn-sm mr-1 float-right" style="opacity:1" role="button" id="tag_all"><i class="bi-check-all"></i></a>
              </div>
            </div>
            
          
          </div>
          <div class="collapse" id="collapseExample">
            <div class="row">
            <div class="col-12">
                <div id="list_tags" style="line-height: 2em"></div>
                </div>
              <!-- <div class="col-2">
              <a href="#" class="btn btn-primary btn-sm mr-1 float-right" style="opacity:1" role="button" id="tag_all"><i class="bi-check-all"></i></a>
              </div> -->
            </div>
            
          </div>
            
            
            <table id="table-public-maps" class="table table-stripped">
              <thead>
                <th style="border-top: 0" class="col-5"></th>
                <th style="border-top: 0" class="col-5"></th>
                <th style="border-top: 0" class="col-2"></th>
              </thead>
              <tbody></tbody>
            </table>
            
          </div>
        </div>
        
      
     
    </main><!-- /.container -->
    
    <script type="text/javascript">
      
      function get_active_tags() {
        list_tags = []
        Array.from(document.querySelector("#list_first_tags").children).map(function (child, key) {
          if (child.style.opacity > 0.8) {
            list_tags.push(child.innerText.split(" ").slice(0, -1).join(" "));
          }
        });
        Array.from(document.querySelector("#list_tags").children).map(function (child, key) {
              if (child.style.opacity > 0.8) {
                list_tags.push(child.innerText.split(" ").slice(0, -1).join(" "));
              }
            });
        return list_tags;
      }
      
      document.querySelector("#tag_all").addEventListener('click', async function(e) {
        
        e.target.style.opacity = e.target.style.opacity > 0.8 ? .65 : 1;
      
        Array.from(document.querySelector("#list_first_tags").children).map(function (child, key) {
          child.style.opacity = e.target.style.opacity;
        });
        Array.from(document.querySelector("#list_tags").children).map(function (child, key) {
          child.style.opacity = e.target.style.opacity;
        });
        
        await getPublicMapsByTags(get_active_tags());
      });
      
      
      
      async function local_refresh() {
   
        await getPublicMaps();
        let tags = await getTags();
   
        Object.keys(tags).map(function (tag, key) {
          
          if (key < 5) {
            list_tags = document.querySelector("#list_first_tags");
          } else {
            list_tags = document.querySelector("#list_tags");
          }
          list_tags.insertAdjacentHTML('beforeend', '<a href="#" class="btn btn-primary btn-sm mr-1" style="opacity:1;margin-bottom: 0.2em" role="button" id="tag_' + key + '">' + tag + ' <span style="color: #0069d9;border-radius: 20px;background-color: white;padding-left: .5em;padding-right: .5em">' + tags[tag] + '</span></a>');
          document.querySelector("#tag_" + key).addEventListener('click', async function(e) {
              console.log(e.target)
              if (e.target.tagName == "A") {
              e.target.style.opacity = e.target.style.opacity > 0.8 ? .65 : 1;
              } else {
                e.target.parentNode.style.opacity = e.target.parentNode.style.opacity > 0.8 ? .65 : 1;
              }
              await getPublicMapsByTags(get_active_tags());
          });
            
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
