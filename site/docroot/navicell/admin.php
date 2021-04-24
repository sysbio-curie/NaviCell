<!doctype html>

<html lang="en">
<?php $title="Administration"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
    
      <div class="container">
        <h1>Users</h1>
        <br/>
        <table id="table-users" class="table table-stripped">
          <thead>
            <th style="border-top: 0"></th>
            <th style="border-top: 0">Active</th>
            <th style="border-top: 0">Admin</th>
            <th style="border-top: 0"></th>
          </thead>
          <tbody></tbody>
        </table>
        <br/><br/>
        
      </div>
    
      
     
    </main><!-- /.container -->
    
    <script type="text/javascript">
      let users;
      async function local_refresh() {
          await get_users();    
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
