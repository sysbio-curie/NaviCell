<!doctype html>

<html lang="en">
<?php $title="Resources"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
  <main role="main" class="container" style="margin-top: 100px">
    <div class="container-fluid">
      <h1>Associated resources</h1>
      <br/>
      <ul style="font-size:20px">
        <li><a href="https://acsn.curie.fr" class="text-dark">ACSN (Atlas of Cancer Signaling Networks)</a></li>
        <li><a href="https://www.celldesigner.org" class="text-dark">CellDesigner</a></li>
        <li><a href="https://cytoscape.org" class="text-dark">Cytoscape</a></li>
        <li><a href="https://binom.curie.fr" class="text-dark">BiNoM</a></li>
        <li><a href="https://sbgn.org" class="text-dark">SBGN (Systems Biology Graphical Notation)</a></li>
        <li><a href="https://newteditor.org/" class="text-dark">Newt</a></li>
      </ul>
      <br/><br/>
      <h1>Databases</h1>
      <br/>
      <ul style="font-size: 20px">
        <li><a href="https://acsn.curie.fr" class="text-dark">ACSN (Atlas of Cancer Signaling Networks)</a></li>
        <li><a href="http://www.celldesigner.org" class="text-dark">CellDesigner</a></li>
        <li><a href="https://cytoscape.org" class="text-dark">Cytoscape</a></li>
        <li><a href="https://binom.curie.fr" class="text-dark">BiNoM</a></li>
        <li><a href="http://sbgn.org" class="text-dark">SBGN (Systems Biology Graphical Notation)</a></li>
        <li><a href="https://newteditor.org/" class="text-dark">Newt</a></li>
      </ul>
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
