<!doctype html>

<html lang="en">
<?php $title="FAQ"; include 'header.php'; ?>

<body>
  
  <?php $search = false; include 'navbar.php' ?>
  
  <main role="main" class="container" style="margin-top: 100px">
    <div class="container-fluid">
      <h1>FAQ</h1>
      <br/><br/>
      
      
      
      <a class="text-dark" data-toggle="collapse" href="#question1" aria-expanded="false" aria-controls="collapseExample">
        <h4>How can I use NaviCell for data visualization?</h4>
      </a>
      
      <div class="collapse" id="question1">
        <div class="card card-body">
          NaviCell Web Service for Network-based Data Visualization allows mapping high-througput data (mRNA, microRNA and protein expressions, gene copy number and mutation profiles, simple gene lists and clinical data) onto biological network maps, browsable with NaviCell. This can be done from within NaviCell graphical user interface (GUI) or programmatically using NaviCell REST API with available Python binding. NaviCell Web Service provides both standard (barplots and heatmaps) and advanced original (glyphs and map staining) tools for visualizing omics data of different types simultaneously. All documentation for using NaviCell Web Service, including a user guide, a tutorial and several case studies, is available in the "NaviCell Web service" section.
        </div>
      </div>
      <br/>
      <a class="text-dark" data-toggle="collapse" href="#question2" aria-expanded="false" aria-controls="collapseExample">
        <h4>How to find the gene or protein of my interest on the map in NaviCell?</h4>
      </a>
      
      <div class="collapse" id="question2">
        <div class="card card-body">
          Scroll through the selection panel that contains the list of all entities of the map including proteins and genes and select your gene or protein. Markers will appear on the map indicating all modifications of the selected gene or protein
        </div>
      </div>
      <br/>
      <a class="text-dark" data-toggle="collapse" href="#question3" aria-expanded="false" aria-controls="collapseExample">
        <h4>How to find map modules?</h4>
      </a>
      
      <div class="collapse" id="question3">
        <div class="card card-body">
          Scroll through the selection panel that contains the list of all entities of the map including map modules, select modules of your interest. Markers will appear on the map indicating selected modules. Each module can be visualised in the context of the whole map or individually
        </div>
      </div>
      <br/>
      <a class="text-dark" data-toggle="collapse" href="#question4" aria-expanded="false" aria-controls="collapseExample">
        <h4>I am interested to use the map displayed in NaviCell. Do I have an access to the maps?</h4>
      </a>
      
      <div class="collapse" id="question4">
        <div class="card card-body">
          The maps can be only viewed and commented from the NaviCell. To access the maps files for research needs please contact NaviCell managers. Send Email to: navicell@curie.fr
        </div>
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
