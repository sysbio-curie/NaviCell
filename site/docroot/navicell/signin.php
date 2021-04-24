<!doctype html>

<html lang="en">
<?php $title="Factory"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
    
    <main role="main" class="container" style="margin-top: 100px">
      <div class="text-center">
        <form class="form-signin" id="nv3_login">
          <img class="mb-4" src="navicell-logo.png" alt="" width="250px">
          <h1 class="h3 mb-3 font-weight-normal">Please log in</h1>
          <label for="login" class="sr-only">Login</label>
          <input type="text" id="login" class="form-control" placeholder="Login" required autofocus>
          <label for="password" class="sr-only">Password</label>
          <input type="password" id="password" class="form-control" placeholder="Password" required>
          <div class="checkbox mb-3 form-signin-upper-border">
            <label>
              <input type="checkbox" value="remember-me"> Remember me
            </label>
          </div>
          <button class="btn btn-lg btn-primary btn-block" type="submit">Log in</button>
        </form>
      </div>
      
      
      
      
    
    </main><!-- /.container -->
    
    <script type="text/javascript">
      
      async function local_refresh() {
        if (logged_in()) {
          window.location.href = "/factory.php";  
        }
      }
      document.addEventListener("DOMContentLoaded", async function () {
        load_token();
        refresh(); 
        
       
      });
      
 
      document.querySelector("#nv3_login").addEventListener('submit', async function(event) {
        event.preventDefault();
        let t_login = document.querySelector("#login").value;
        let password = document.querySelector("#password").value;
        if ((t_login && t_login.length > 0) && (password && password.length > 0)){
          await login(t_login, password);
          
          refresh(); 
        }
        
      });
      
      
      
    </script>
      <script src="lib/nv3_api/auth.js"></script>

  </body>
</html>
