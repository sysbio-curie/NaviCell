<!doctype html>

<html lang="en">
<?php $title="Data"; include 'header.php'; ?>

<body>
  
  <?php $search = true; include 'navbar.php' ?>
  
  <main role="main" class="container" style="margin-top: 100px">
  
    <div class="container">
      <div class="row">
        <div class="col-4"><h1>Datasets</h1></div>
        <div class="col-8">
          <button class="btn btn-primary float-right mr-1" type="button" data-toggle="modal" data-target="#uploadDataModal">
          <i class="bi-plus-circle-fill"></i>&nbsp;Add new dataset
        </button></div>
      </div>
      
      <br/><br/>  
      <table id="table-data" class="table table-stripped"><tbody></tbody></table>

     
    </div>
      
    
  </main><!-- /.container -->
    
  
     
  <div class="modal fade" id="uploadDataModal" tabindex="-1" role="dialog" aria-labelledby="uploadDataModalLabel" aria-hidden="true">     
    <div class="modal-dialog" role="document">
      <form id="upload-data-form">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload new dataset</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" id="local-tab" data-toggle="tab" href="#local" role="tab" aria-controls="home" aria-selected="true">Local</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="remote-tab" data-toggle="tab" href="#remote" role="tab" aria-controls="remote" aria-selected="false">Remote</a>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="local" role="tabpanel" aria-labelledby="local-tab">
            <table class="table" style="margin-bottom: 0px">
              <tbody>
                <tr>
                  <td width="100px">File:</td>
                  <td><input type="file" id="data-file" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tab-pane fade" id="remote" role="tabpanel" aria-labelledby="remote-tab">
            <table class="table" style="margin-bottom: 0px">
              <tbody>
                <tr>
                  <td width="100px">File url:</td>
                  <td><input type="text" id="data-url" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
          <table class="table" style="margin-bottom: 0px">
            <tbody>
              <tr>
                <td width="100px">Name:</td>
                <td><input type="text" id="data-name" /></td>
              </tr>
              <tr>
                <td width="100px">Type</td>
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
              
            </tbody>
          </table>
        
        </div>

        
        <div class="modal-footer">
        
          <div class="float-right">
            <span id="new_data_error_message"></span>
    
            <div class="spinner-border mr-3" role="status" style="visibility:hidden" id="new_data_spinner">
              <span class="sr-only">Uploading the dataset...</span>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Upload dataset</button>
        </div>
      </div>
      </form>
    </div>
  </div>
    
  
  <script type="text/javascript">
    
    async function local_refresh() {
      await getData(document.querySelector("#table-data"));
    }
    
    document.addEventListener("DOMContentLoaded", async function () {
      
      document.querySelector("#upload-data-form").addEventListener('submit', async function(e) {
        e.preventDefault();
        is_local = document.querySelector("#local-tab").classList.contains("active");
        await uploadData(
          document.querySelector("#data-name").value,
          is_local ? document.querySelector("#data-file").files[0] : undefined,
          !is_local ? document.querySelector("#data-url").value : undefined, 
          document.querySelector("#data-type").options.selectedIndex
        );
        $("#uploadDataModal").modal('hide');
      });
    
      load_token();
      refresh(); 
    });
    
  </script>
  
  <script src="lib/nv3_api/auth.js"></script>
  <script src="lib/nv3_api/data.js"></script>
    
</body>
</html>
