  <header>
    <nav class="navbar navbar-expand-md navbar-custom fixed-top">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="maps.php">Maps</a>
          </li>
          <li class="nav-item logged_in" style="display:none">
            <a class="nav-link" href="factory.php">Factory</a>
          </li>
          <li class="nav-item logged_in" style="display:none">
            <a class="nav-link" href="data.php">Data</a>
          </li>
          <li class="nav-item logged_in" style="display:none">
            <a class="nav-link" href="sessions.php">Sessions</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Help</a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="guide.php">Guide</a>
              <a class="dropdown-item" href="resources.php">Resources</a>
              <a class="dropdown-item" href="faq.php">FAQ</a>
              <a class="dropdown-item" href="about.php">About</a>
            </div>
          </li>
          
        </ul>
        <?php 
          if ($search == true) {
            echo "<form class=\"form-inline mt-2 mt-md-0\" action=\"query.php\"  method=\"GET\"><input id=\"query_text\" class=\"form-control mr-sm-2\" type=\"text\" name=\"search\" placeholder=\"Search\" aria-label=\"Search\"></form>";    
          }
        ?>
          
        
        <ul class="navbar-nav ml-auto">

        <li class="nav-item">
          <a href="#" class="logged_in nav-link"><i class="bi-person-circle"></i>&nbsp;<span id="username"></span></a>
        </li>  
        <li class="nav-item">
          <a href="admin.php" id="admin_link" class="logged_in nav-link" style="display: none;">Admin</a>        
        </li>
        <li class="nav-item">
          <a id="logout_button" href="#" class="logged_in nav-link" style="display: none;">Logout</a>        
          <a href="signin.php" class="logged_out nav-link" style="display: block;">Log in</a>                </li>
        <li class="nav-item">
          <a href="signup.php" class="logged_out nav-link" style="display: block;">Sign up</a>        
        </li>
        </ul>
      </div>
    </nav>
  </header>
  