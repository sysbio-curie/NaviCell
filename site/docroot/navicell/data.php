<!doctype html>

<html lang="en">
<?php $title="Data"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
  <main role="main" class="container" style="margin-top: 100px">
  
    <div class="container">
      <h1>Data</h1>
      <br/>
      <table id="table-data" class="table table-stripped"><tbody></tbody></table>
      
      <h1>Upload data</h1>
      <br/>
      <form id="data-upload-form">
        <table class="table">
          <tbody>
            <tr>
              <td>Name:</td>
              <td><input type="text" id="data-name" /></td>
            </tr>
            <tr>
              <td>file:</td>
              <td><input type="file" id="data-file" /></td>
            </tr>
            <tr>
              <td>Type</td>
              <td><div class="form-group">
                <select class="form-control" id="data-type">
                  <option>mRNA expression data</option>
                  <option>microRNA expression data</option>
                  <option>protein expression data</option>
                  <option>discrete copy number data</option>
                  <option>continuous copy number data</option>
                  <option>mutation data</option>
                  <option>gene list</option>
                  <option>datatable list</option>
                </select>
              </div></td>
            </tr>
            <tr>
              <td></td>
              <td>
                <div class="float-right">
                  <span id="error_message"></span>

                  <div class="spinner-border mr-3" role="status" style="visibility:hidden" id="creating_status">
                    <span class="sr-only">Creating the map...</span>
                  </div>

                  <button class="btn btn-primary float-right" id="data-upload-button" type="submit">Create map</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
      
    
  </main><!-- /.container -->
    
      <script type="text/javascript">
      
      document.querySelector("#data-upload-form").addEventListener('submit', async function(e) {
        e.preventDefault();
        await uploadData();
      });
     
       
      async function local_refresh() {
        await getData(document.querySelector("#table-data"));
      }
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        refresh(); 
      });
      
    </script>
    
    <script src="lib/nv3_api/auth.js"></script>
    <script src="lib/nv3_api/data.js"></script>
    
  </body>
</html>
