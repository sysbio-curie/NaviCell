<!doctype html>

<html lang="en">
<?php $title="NaviCell"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
      <div class="container-fluid">
        <div class="row">
          <div class="col-4">
            <img src="navicell-logo.png" width="250px"/>
          </div>
          <div class="col-8">
            <h1>NaviCell</h1>
            <h3>A web tool for exploring large maps of molecular interactions</h3>
          </div>
        </div>
        <br/><br/>
        <div class="row">
          <div class="col-sm-4">
            <div class="card" style="width: 18rem;">
              <div class="card-body">
                <h5 class="card-title">Map browsing by Google™ Map engine</h5>
                <p class="card-text">Easy map navigation and its annotations using Google maps™ engine. The logic of navigation as scrolling and zooming; features as markers, pop-up bubbles and zoom bar are adapted from the Google map.</p>
              </div>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="card" style="width: 18rem;">
              <div class="card-body">
                <h5 class="card-title">Semantic zoom for viewing different levels of details on the map</h5>
                <p class="card-text">NaviCell semantic zooming provides possibility for map exploring from detailed toward a top-level view achieved by gradual exclusion of details while zooming out.</p>
              </div>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="card" style="width: 18rem;">
              <div class="card-body">
                <h5 class="card-title">Data Visualization Web Service</h5>
                <p class="card-text">NaviCell now includes a powerful module for data visualization. Users can map and visualize different types of "omics" data on the NaviCell maps. There is also a Python API to automate tasks and communicate with the NaviCell web server.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
          
      
    </main><!-- /.container -->
    <footer class="footer">
      <div class="container">
        <span class="text-muted">NaviCell was created and is maintained by the team <b><a href="https://sysbio.curie.fr">Computational System Biology of Cancer</a></b> at <b><a href="https://institut-curie.org/">Institut Curie</a></b></span>
      </div>
    </footer>
    <script type="text/javascript">
      // document.querySelector("#logout_button").addEventListener('click', async function() {
      //   logout(); 
      //   await refresh();
      // });
      
      async function local_refresh() {
        // await getMaps(); 
      }
      
      // async function refresh() {
        
      //   show_logged_in(logged_in()); 

      //   if (logged_in()) {
      //     let t_username = await get_user();
      //     console.log(t_username);
      //     document.querySelector("#username").innerText = t_username;
          
      //     let t_isroot = await is_root();
      //     if (t_isroot) {
      //       console.log("User is root")
      //       document.querySelector("#admin_link").style.display = "block";
      //     } else {
      //       document.querySelector("#admin_link").style.display = "none";
      //     }
      //   } else {
      //     document.querySelector("#username").innerText = "";
      //     document.querySelector("#admin_link").style.display = "none";

      //   }
        
      //   local_refresh();
       
      // }
     
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        await refresh();  
      });
      
      // console.log(document.json_response);
    </script>
    
  <script src="lib/nv3_api/auth.js"></script>
  <script src="lib/nv3_api/maps.js"></script>

  </body>
</html>
