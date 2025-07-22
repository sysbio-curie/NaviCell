<!doctype html>

<html lang="en">
<?php $title="Active session"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
  
    <main role="main" class="container" style="margin-top: 100px">
      <div class="container">
        <div class="row">
          <div class="col-4"><h1>Active session</h1></div>
          <div class="col-8">
            <button class="btn btn-primary float-right mr-1 session-loaded logged_in" type="button" id="session-save-button">
              <i class="bi-save"></i>&nbsp;<span id="session-save-action">Save</span> session
            </button>
            <button class="btn btn-primary float-right mr-1 session-loaded" type="button" data-toggle="modal" data-target="#dataModal">
              <i class="bi-file-earmark-spreadsheet"></i>&nbsp;Load dataset
            </button>
          </div>
        </div>  
      
        <br/>
        <div class="table">
          
          <div class="row" id="update-session-row" style="display: none">
            <div class="col-6">
             
            </div>
            <div class="col-6">
              <button class="btn btn-secondary" type="button" id="session-update-button">
                Update session
              </button>
            </div>
          </div>
          
        
        <br/>
        <div class="session-loaded" style="display: none">
          <table id="table-active-session" class="table table-stripped">
            <thead>
              <th style="border-top: 0"></th>
              <th style="border-top: 0"></th>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="session-loading text-center" style="display: block">
          <div class="spinner-border mr-3" role="status">
            <span class="sr-only">Loading session...</span>
          </div>
        </div>
        <br/><br/>    
      </div>   
      
    </main><!-- /.container -->
    
    <div class="modal fade" id="sessionModal" tabindex="-1" role="dialog" aria-labelledby="sessionModalLabel" aria-hidden="true">     
      <div class="modal-dialog" role="document">
      <form id="session-save-form">  
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Save session</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
                    
            <div class="form-group">
              <input type="text" class="form-control" id="name-session" placeholder="Enter name of the session">
            </div>
  
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">Save session</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          </div>
        </div>
        </form>
      </div>
    </div>
    
    <div class="modal fade" id="dataModal" tabindex="-1" role="dialog" aria-labelledby="dataModalLabel" aria-hidden="true">     
      <div class="modal-dialog" role="document">
      <form id="data-load-form">  
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Load dataset into session</h5>
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
              <br/>
              <div class="tab-pane fade show active" id="local" role="tabpanel" aria-labelledby="local-tab">
                <div class="dropdown text-center">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 80%; overflow-x: hidden; text-overflow: ellipsis;">
                    Choose data...
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="data-list"  style="width: 80%; overflow-x: hidden; text-overflow: ellipsis;">
                    
                  </div>
                
                </div>
              </div>
              <div class="tab-pane fade" id="remote" role="tabpanel" aria-labelledby="remote-tab">
                <table class="table" style="margin-bottom: 0px">
                  <tbody>
                   <tr>
                      <td width="100px">Name:</td>
                      <td><input type="text" id="data-name" /></td>
                    </tr>
                    <tr>
                      <td width="100px">File url:</td>
                      <td><input type="text" id="data-url" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          
          
          
          
          
            
            
          </div>
  
          
          <div class="modal-footer">
            <div class="float-right">
              <span id="data_modal_error_message"></span>
      
              <div class="spinner-border mr-3" role="status" style="visibility:hidden" id="data_modal_spinner">
                <span class="sr-only">Loading data...</span>
              </div>
            </div>  
          <button type="submit" class="btn btn-primary">Load data</button>
            
          </div>
        </div>
        </form>
      </div>
    </div>
        
    <script type="text/javascript">
      let session;
      let resumed = false;
      let loading = true;
      let data;
      let selected_data = -1;
      let command_history = [];
      async function local_refresh() {
        if (resumed) {
          document.querySelector("#session-save-action").innerHTML = "Update";
        } else {
          document.querySelector("#session-save-action").innerHTML = "Save";
        }
        Array.from(document.getElementsByClassName("session-loading")).map(function (object) {
            object.style.display = loading ? "block" : "none";
        });
        Array.from(document.getElementsByClassName("session-loaded")).map(function (object) {
            object.style.display = loading ? "none" : "block";
        });
          
      }

      document.addEventListener("DOMContentLoaded", async function () {
        console.log("DOMContentLoaded")
        load_token(); 
        await refresh(); 

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('map') && urlParams.get('session')) {
          
          await resumeSession(urlParams.get('session'), urlParams.get('map'));
          loading = false;
          await refresh(); 
        }
        else if (urlParams.get('map')) {
          await startSession(urlParams.get('map'));  
          loading = false;
          await refresh();
        }
        
        
        let data = await getData();
        data.map(function (value, key) {
          document.querySelector("#data-list").innerHTML += "<a class=\"dropdown-item\" href=\"#\">" + value.name + "</a>"
        });
        
        $('.dropdown-menu a').click(function (e) {
          selected_data = $(this).index();
          $('.dropdown button').text($(this).text());
        });
        document.querySelector("#data-load-form").addEventListener('submit', async function (e) {
          e.preventDefault();
          
          is_local = document.querySelector("#local-tab").classList.contains("active");
          
          if (!is_local || selected_data >= 0) {
            let datum = data[selected_data];
            console.log(datum)
            await addDataToSession(
              is_local ? datum.name : document.querySelector("#data-name").value,
              is_local ? datum : undefined,
              !is_local ? document.querySelector("#data-url").value : undefined,
              is_local ? datum.type : 0
            );
          }
          $("#dataModal").modal('hide');
        });
        
        // document.querySelector("#session-update-button").addEventListener('click', async function (e) {
        //   await updateSavedSession();
        // });
        
        document.querySelector("#session-save-button").addEventListener('click', async function(e) {
          e.preventDefault();
          if (resumed) {
            await updateSavedSession();
          } else {
            $("#sessionModal").modal('show');
          }
        });

        
        document.querySelector("#session-save-form").addEventListener('submit', async function(e) {
          e.preventDefault();
          await saveSession(
            document.querySelector("#name-session").value
          )
          $("#sessionModal").modal('hide');
        });

      });
     
      
    </script>
    
    <script src="lib/nv3_api/auth.js"></script>
    <script src="lib/nv3_api/data.js"></script>
    <script src="lib/nv3_api/session.js"></script>
    
  </body>
</html>
