<!doctype html>

<html lang="en">
<?php $title="About"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
  <main role="main" class="container" style="margin-top: 100px">
    <div class="container-fluid">
      <h1>About</h1>
      <br/>
    </div>
    
  </main><!-- /.container -->
  <script type="text/javascript">
    
    async function local_refresh() { }
    
    document.addEventListener("DOMContentLoaded", async function () {
      load_token();
      await refresh();  
    });
  </script>
  
<script src="lib/nv3_api/auth.js"></script>

</body>
</html>
