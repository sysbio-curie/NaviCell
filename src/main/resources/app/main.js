var chise = require('chise');
var sbgnviz = require('sbgnviz');
var filesaver = require('file-saver');
var konva = require('konva');
var tippy = require('tippy.js');
window.jQuery = window.jquery = window.$ = require('jquery'); // jquery should be global because jquery.qtip extension is not compatible with commonjs
var cytoscape = require('cytoscape');

require('jquery-expander')($);
require('bootstrap');

var appUtilities = require('./js/app-utilities');
// var appMenu = require('./js/app-menu');

// Get cy extension instances
var cyPanzoom = require('cytoscape-panzoom');
//var cyQtip = require('cytoscape-qtip');
var cyFcose = require('cytoscape-fcose');
var cyUndoRedo = require('cytoscape-undo-redo');
var cyClipboard = require('cytoscape-clipboard');
var cyContextMenus = require('cytoscape-context-menus');
var cyExpandCollapse = require('cytoscape-expand-collapse');
var cyEdgeEditing = require('cytoscape-edge-editing');
var cyViewUtilities = require('cytoscape-view-utilities');
var cyEdgehandles = require('cytoscape-edgehandles');
var cyGridGuide = require('cytoscape-grid-guide');
var cyAutopanOnDrag = require('cytoscape-autopan-on-drag');
var cyNodeResize = require('cytoscape-node-resize');
var cyPopper = require('cytoscape-popper');
var cyLayoutUtilities = require('cytoscape-layout-utilities');

// Register cy extensions
cyPanzoom( cytoscape, $ );
//cyQtip( cytoscape, $ );
cyFcose( cytoscape );
cyUndoRedo( cytoscape );
cyClipboard( cytoscape, $ );
cyContextMenus( cytoscape, $ );
cyExpandCollapse( cytoscape, $ );
cyEdgeEditing( cytoscape, $ );
cyViewUtilities( cytoscape, $ );
cyEdgehandles( cytoscape );
cyGridGuide( cytoscape, $ );
cyAutopanOnDrag( cytoscape );
cyNodeResize( cytoscape, $, konva );
cyPopper( cytoscape );
cyLayoutUtilities( cytoscape );

// Libraries to pass sbgnviz
var libs = {};

libs.filesaver = filesaver;
libs.jquery = jquery;
libs.cytoscape = cytoscape;
libs.sbgnviz = sbgnviz;
libs.tippy = tippy;

function registerRenderingEvents() {
  
  console.log('init the sbgnviz template/page');

  $(document).on('sbgnvizLoadFileEnd sbgnvizLoadSampleEnd', function(event, filename, cy) {

    // get chise instance for cy
    var chiseInstance = appUtilities.getChiseInstance(cy);
    var cyInstance = chiseInstance.getCy();
    
    var urlParams = appUtilities.getScratch(cyInstance, 'urlParams');
    
    var layout = urlParams.layout;
    
    if (layout == undefined || layout.toLowerCase() !== "true") {
      
      document.sbgnReady = true;

      var format = urlParams.format;
      var bg = urlParams.bg;
      var scale = urlParams.scale;
      var maxWidth = urlParams.max_width;
      var maxHeight = urlParams.max_height;
      var quality = urlParams.quality;
      
      if (format == "svg") {
        chiseInstance.saveAsSvg("network.svg", scale=scale, bg=bg);
        
      } else if (format == "jpg") {
        chiseInstance.saveAsJpg("network.jpg", scale=scale, bg=bg, maxWidth=maxWidth, maxHeight=maxHeight, quality=quality);
        
      } else {
        chiseInstance.saveAsPng("network.png", scale=scale, bg=bg, maxWidth=maxWidth, maxHeight=maxHeight); // the default filename is 'network.png'
          
      }  
    } else {
      // Layout... todo
      var currentLayoutProperties = appUtilities.getScratch(cy, 'currentLayoutProperties');
      document.performLayout = true;

      var preferences;
      // if preferences param is not set use an empty map not to override any layout option
      if (preferences === undefined) {
        preferences = {};
      }
      var options = $.extend({}, currentLayoutProperties, preferences);
      
      chiseInstance.performLayout(options);
    }

  });
  
};

$(document).ready(function () {

  document.sbgnReady = false;
  document.sbgnNotFound = false;
  document.sbgnNotProvided = false;
  document.sbgnNotParsed = false;
  
  // Register chise with libs
  chise.register(libs);

  registerRenderingEvents();

  // create a new network and access the related chise.js instance
  appUtilities.createNewNetwork();

  // launch with model file if exists
  appUtilities.launchWithModelFile();
});
