<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
  
    <main role="main" class="container" style="margin-top: 100px">
    
      <div class="container">
        <h1>Results</h1>
        <br/>
        <table id="table-results" class="table table-stripped"><tbody></tbody></table>
      </div>
    
    </main><!-- /.container -->
    
      <script type="text/javascript">
      
     
       
      async function local_refresh() {
        console.log(window.location.search);
        const urlParams = new URLSearchParams(window.location.search);
        let search = urlParams.get('search');
        if (search.includes(":")) {
          let terms = search.split(":");
          if (terms[0].toLowerCase() === "hugo") {
            await getByHugoName(terms[1]);
          } else if (terms[0].toLowerCase() === "tag") {
            await getByTag(terms[1]);
          }
        } else { 
          await getByName(urlParams.get('search'));  
        }
      }
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        refresh(); 
        
       
      });
      
    </script>
    
    <script src="lib/nv3_api/auth.js"></script>
    <script src="lib/nv3_api/maps.js"></script>
    <script src="lib/nv3_api/query.js"></script>

  </body>
</html>
