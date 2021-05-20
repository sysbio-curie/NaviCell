<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
    <main role="main" class="container" style="margin-top: 100px">
      <div class="text-center">
        <form class="form-signin" id="signup-form">
          <img class="mb-4" src="navicell-logo.png" alt="" width="250px">
          <div class="alert alert-danger alert-dismissible fade show" role="alert" id="error_alert" style="display: none">
            <strong>Error !</strong> <span id="error_message"></span>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <h1 class="h3 mb-3 font-weight-normal">Signing up</h1>
          <label for="login" class="sr-only">Login</label>
          <input type="text" id="login" class="form-control" placeholder="Login" required autofocus>
          <label for="password1" class="sr-only">Password</label>
          <input type="password" id="password1" class="form-control form-signin-upper-border" placeholder="Password" required>
          <label for="password2" class="sr-only">Repeat password</label>
          <input type="password" id="password2" class="form-control" placeholder="Repeat password" required>
          <button class="btn btn-lg btn-primary btn-block form-signin-upper-border" type="submit">Log in</button>
        </form>
      </div>
    </main><!-- /.container -->
    
    <script type="text/javascript">
      
      
      async function local_refresh() {
        if (logged_in()) {
          window.location.href = "/";  
        }
      }
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        refresh(); 
        
       
      });
      
      
      document.querySelector("#signup-form").addEventListener('submit', async function(event) {
        event.preventDefault();
        
        let login = document.querySelector("#login").value;
        let password1 = document.querySelector("#password1").value;
        let password2 = document.querySelector("#password2").value;
        error();
        if (
          (login && login.length > 0)
          && (password1 && password1.length > 0) 
          && (password1 === password2)
        )
        {
          
          let res = await signup(login, password1);
          console.log(res)
          if (res.length == 0) {
            window.location.href = "/signin.php";  
          } else {
            // console.log(res)
            error(res);
            
          }
          
        } else {
          if (login.length == 0) {
            error("Please choose an username");
          } else if (password1.length == 0){
            error("Please choose a password");
          } else if (password2.length == 0) {
            error("Please confirm your password")
          } else if (password1 !== password2) {
            error("Your password confirmation doesn't match")
          }
        }
      });
      
    </script>
    <script src="lib/nv3_api/auth.js"></script>

  </body>
</html>
