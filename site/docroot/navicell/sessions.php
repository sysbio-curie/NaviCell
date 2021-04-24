<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
    
      <div class="container">
        <h1>Sessions</h1>
        <br/>
        <table id="table-sessions" class="table table-stripped">
          <thead>
            <th style="border-top: 0"></th>
            <th style="border-top: 0"></th>
          </thead>
          <tbody></tbody>
        </table>
        <div class="container-fluid" id="div-active-session" style="display: none" >
          <br/><br/>
          <h1>Active session</h1>
          <br/>
          <div class="table">
            <div class="row">
              <div class="col-6">
                <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Choose data...
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="data-list">
                    
                  </div>
                </div>
              </div>
              <div class="col-6">
                <button class="btn btn-secondary" type="button" id="data-load-button">
                  Load data into session
                </button>
              </div>
            </div>
          </div>
        </div>
      
      </div>   
      
    </main><!-- /.container -->
    
    <script type="text/javascript">
      let sessions;
      
      
      
      async function local_refresh() {
        
        sessions = await getSessions();
      }

      document.addEventListener("DOMContentLoaded", async function () {
        load_token(); 
        await refresh(); 
      });
      
    </script>
    
    <script src="lib/nv3_api/auth.js"></script>
    <script src="lib/nv3_api/data.js"></script>
    <script src="lib/nv3_api/sessions.js"></script>
  
  </body>
</html>
