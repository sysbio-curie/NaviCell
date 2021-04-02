var jquery = $ = require('jquery');
var appUtilities = require('./app-utilities');
var modeHandler = require('./app-mode-handler');
// var inspectorUtilities = require('./inspector-utilities');
// var appUndoActionsFactory = require('./app-undo-actions-factory');
var _ = require('underscore');

module.exports = function (chiseInstance) {
  var getExpandCollapseOptions = appUtilities.getExpandCollapseOptions.bind(appUtilities);
//  var nodeQtipFunction = appUtilities.nodeQtipFunction.bind(appUtilities);
  var refreshUndoRedoButtonsStatus = appUtilities.refreshUndoRedoButtonsStatus.bind(appUtilities);

  // use chise instance associated with chise instance
  var cy = chiseInstance.getCy();

  // register extensions and bind events when cy is ready
  cy.ready(function () {
    cytoscapeExtensionsAndContextMenu();
    bindCyEvents();
    cy.style().selector('core').style({'active-bg-opacity': 0});
    // // If undo extension, register undo/redo actions
    // if (appUtilities.undoable) {
    //   registerUndoRedoActions();
    // }
  });

  function cytoscapeExtensionsAndContextMenu() {
    cy.expandCollapse(getExpandCollapseOptions(cy));

    var contextMenus = cy.contextMenus({
      menuItemClasses: ['custom-menu-item'],
    });

    cy.autopanOnDrag();

    cy.edgeEditing({
      // this function specifies the positions of bend points
      bendPositionsFunction: function (ele) {
        return ele.data('bendPointPositions');
      },
      // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
      undoable: appUtilities.undoable,
      // title of remove bend point menu item
      removeBendMenuItemTitle: "Delete Bend Point",
      // whether to initilize bend points on creation of this extension automatically
      initBendPointsAutomatically: false,
      // function to validate edge source and target on reconnection
      validateEdge: chiseInstance.elementUtilities.validateArrowEnds,
      // function to be called on invalid edge reconnection
      actOnUnsuccessfulReconnection: function () {
        if(appUtilities.promptInvalidEdgeWarning){
          appUtilities.promptInvalidEdgeWarning.render();
        }
      },
      // function that handles edge reconnection
      handleReconnectEdge: chiseInstance.elementUtilities.addEdge,
      zIndex: 900
      // whether to start the plugin in the enabled state
    });


    cy.viewUtilities({
      highlightStyles: [
        {
          node: { 'border-width': function (ele) { return Math.max(parseFloat(ele.data('border-width')) + 2, 3); }, 'border-color': '#0B9BCD' },
          edge: {
            'width': function (ele) { return Math.max(parseFloat(ele.data('width')) + 2, 3); },
            'line-color': '#0B9BCD',
            'source-arrow-color': '#0B9BCD',
            'target-arrow-color': '#0B9BCD'
          }
        },
        { node: { 'border-color': '#bf0603',  'border-width': 3 }, edge: {'line-color': '#bf0603', 'source-arrow-color': '#bf0603', 'target-arrow-color': '#bf0603', 'width' : 3} },
        { node: { 'border-color': '#d67614',  'border-width': 3 }, edge: {'line-color': '#d67614', 'source-arrow-color': '#d67614', 'target-arrow-color': '#d67614', 'width' : 3} },
      ],
      selectStyles: {
        node: {
          'border-color': '#d67614', 'background-color': function (ele) { return ele.data('background-color'); }
        },
        edge: {
          'line-color': '#d67614',
          'source-arrow-color': '#d67614',
          'target-arrow-color': '#d67614',
        }
      },
      neighbor: function(node){ //select and return process-based neighbors
        var nodesToSelect = node;
        if(chiseInstance.elementUtilities.isPNClass(node) || chiseInstance.elementUtilities.isLogicalOperator(node)){
            nodesToSelect = nodesToSelect.union(node.openNeighborhood());
        }
        node.openNeighborhood().forEach(function(ele){
            if(chiseInstance.elementUtilities.isPNClass(ele) || chiseInstance.elementUtilities.isLogicalOperator(ele)){
                nodesToSelect = nodesToSelect.union(ele.closedNeighborhood());
                ele.openNeighborhood().forEach(function(ele2){
                    if(chiseInstance.elementUtilities.isPNClass(ele2) || chiseInstance.elementUtilities.isLogicalOperator(ele2)){
                        nodesToSelect = nodesToSelect.union(ele2.closedNeighborhood());
                    }
                });
            }
        });
        return nodesToSelect;
      },
      neighborSelectTime: 500 //ms
    });
    
    cy.layoutUtilities({
      componentSpacing: 30,
      desiredAspectRatio: $(cy.container()).width() / $(cy.container()).height()
    })

    cy.nodeResize({
      padding: 2, // spacing between node and grapples/rectangle
      undoable: appUtilities.undoable, // and if cy.undoRedo exists

      grappleSize: 7, // size of square dots
      grappleColor: "#d67614", // color of grapples
      inactiveGrappleStroke: "inside 1px #d67614",
      boundingRectangle: true, // enable/disable bounding rectangle
      boundingRectangleLineDash: [1.5, 1.5], // line dash of bounding rectangle
      boundingRectangleLineColor: "darkgray",
      boundingRectangleLineWidth: 1.5,
      zIndex: 999,
      getCompoundMinWidth: function(node) {
        return node.data('minWidth') || 0;
      },
      getCompoundMinHeight: function(node) {
        return node.data('minHeight') || 0;
      },
      getCompoundMinWidthBiasRight: function(node) {
        return node.data('minWidthBiasRight') || 0;
      },
      getCompoundMinWidthBiasLeft: function(node) {
        return node.data('minWidthBiasLeft') || 0;
      },
      getCompoundMinHeightBiasTop: function(node) {
        return node.data('minHeightBiasTop') || 0;
      },
      getCompoundMinHeightBiasBottom: function(node) {
        return node.data('minHeightBiasBottom') || 0;
      },
      setWidth: function(node, width) {
        var bbox = node.data('bbox');
        bbox.w = width;
        node.data('bbox', bbox);
      },
      setHeight: function(node, height) {
        var bbox = node.data('bbox');
        bbox.h = height;
        node.data('bbox', bbox);
      },
      setCompoundMinWidth: function(node, minWidth) {
        node.data('minWidth', minWidth);
      },
      setCompoundMinHeight: function(node, minHeight) {
        node.data('minHeight', minHeight);
      },
      setCompoundMinWidthBiasLeft: function(node, minWidthBiasLeft) {
        node.data('minWidthBiasLeft', minWidthBiasLeft);
      },
      setCompoundMinWidthBiasRight: function(node, minHeightBiasRight) {
        node.data('minWidthBiasRight', minHeightBiasRight);
      },
      setCompoundMinHeightBiasTop: function(node, minHeightBiasTop) {
        node.data('minHeightBiasTop', minHeightBiasTop);
      },
      setCompoundMinHeightBiasBottom: function(node, minHeightBiasBottom) {
        node.data('minHeightBiasBottom', minHeightBiasBottom);
      },
      minWidth: function (node) {
        var data = node.data("resizeMinWidth");
        return data ? data : 10;
      }, // a function returns min width of node
      minHeight: function (node) {
        var data = node.data("resizeMinHeight");
        return data ? data : 10;
      }, // a function returns min height of node

      isFixedAspectRatioResizeMode: function (node) {
        //Initially checks if Aspect ratio in Object properties is checked
        if (appUtilities.nodeResizeUseAspectRatio)
            return true;
        //Otherwise it checks 'processes', 'and', 'or' etc. which have fixedAspectRatio as default
        var sbgnclass = node.data("class");
        return chiseInstance.elementUtilities.mustBeSquare(sbgnclass);
      }, // with only 4 active grapples (at corners)
      isNoResizeMode: function (node) {
        var currentGeneralProperties = appUtilities.getScratch(cy, 'currentGeneralProperties');
        return node.is(':parent') && !currentGeneralProperties.allowCompoundNodeResize;
      }, // no active grapples

      cursors: {// See http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
        // May take any "cursor" css property
        default: "default", // to be set after resizing finished or mouseleave
        inactive: "url('app/img/cancel.svg') 6 6, not-allowed",
        nw: "nw-resize",
        n: "n-resize",
        ne: "ne-resize",
        e: "e-resize",
        se: "se-resize",
        s: "s-resize",
        sw: "sw-resize",
        w: "w-resize"
      },

      resizeToContentCueEnabled: function (node){
        var enabled_classes = ["macromolecule", "complex", "simple chemical", "nucleic acid feature",
          "unspecified entity", "perturbing agent", "phenotype", "tag", "compartment", "submap", "BA"];
        var node_class = node.data('class');
        var result = false;

        enabled_classes.forEach(function(enabled_class){
          if(node_class.indexOf(enabled_class) > -1)
            result = true;
        });

        return !node.data("onLayout") && result && !chiseInstance.elementUtilities.isResizedToContent(node) && (cy.zoom() > 0.5);
      },
      resizeToContentFunction: appUtilities.resizeNodesToContent,
      resizeToContentCuePosition: 'bottom-right',
    });

    //For adding edges interactively
    cy.edgehandles({
      // fired when edgehandles is done and entities are added
      complete: function (sourceNode, targetNodes, addedEntities) {
        if (!targetNodes) {
          return;
        }

        var modeProperties = appUtilities.getScratch(cy, 'modeProperties');

        // We need to remove interactively added entities because we should add the edge with the chise api
        addedEntities.remove();

        /*
         * If in add edge mode create an edge
         */
        if (modeProperties.mode === 'add-edge-mode') {
          // fired when edgehandles is done and entities are added
          var source = sourceNode.id();
          var target = targetNodes[0].id();
          var edgeParams = {class : modeProperties.selectedEdgeType, language : modeProperties.selectedEdgeLanguage};
          var promptInvalidEdge = function(){
            appUtilities.promptInvalidEdgeWarning.render();
          }

          var isMapTypeValid = false;
          var currentMapType = chiseInstance.getMapType();
          if(currentMapType == "HybridAny"){
            isMapTypeValid = true;
          }else if(currentMapType == "HybridSbgn"){
              if(edgeParams.language == "PD" || edgeParams.language =="AF"){
                isMapTypeValid = true;
              }
          }else if(currentMapType == edgeParams.language){
            isMapTypeValid = true;
          }

          // if added edge changes map type, warn user
          if (chiseInstance.getMapType() && !isMapTypeValid){
         
            appUtilities.promptMapTypeView.render('You cannot add element of type '+ appUtilities.mapTypesToViewableText[edgeParams.language]  + ' to a map of type '+appUtilities.mapTypesToViewableText[currentMapType]+'!',"You can change map type from Map Properties.");;
           /*  appUtilities.promptMapTypeView.render(function(){
                chiseInstance.addEdge(source, target, edgeParams, promptInvalidEdge);
                var addedEdge = cy.elements()[cy.elements().length - 1];
                var currentArrowScale = Number($('#arrow-scale').val());
                addedEdge.style('arrow-scale', currentArrowScale);
            }); */
          }
          else{
              chiseInstance.addEdge(source, target, edgeParams, promptInvalidEdge);
              var addedEdge = cy.elements()[cy.elements().length - 1];
              var currentArrowScale = Number($('#arrow-scale').val());
              addedEdge.style('arrow-scale', currentArrowScale);
          }

          // If not in sustain mode set selection mode
          if (!modeProperties.sustainMode) {
            modeHandler.setSelectionMode();
          }
        }

      },
      loopAllowed: function( node ) {
        // for the specified node, return whether edges from itself to itself are allowed
        return false;
      },
      toggleOffOnLeave: true, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
      handleSize: 0, // the size of the edge handle put on nodes (Note that it is 0 because we do not want to see the handle)
      handleHitThreshold: 0,
    });

    cy.edgehandles('drawoff');

    var gridProperties = appUtilities.getScratch(cy, 'currentGridProperties');

    cy.gridGuide({
      drawGrid: gridProperties.showGrid,
      gridColor: gridProperties.gridColor,
      snapToGridOnRelease: gridProperties.snapToGridOnRelease,
      snapToGridDuringDrag: gridProperties.snapToGridDuringDrag,
      gridSpacing: gridProperties.gridSize,
      resize: gridProperties.autoResizeNodes,
      guidelines: gridProperties.showAlignmentGuidelines,
      guidelinesTolerance: gridProperties.guidelineTolerance,
      geometricGuideline: gridProperties.showGeometricGuidelines,
      initPosAlignment: gridProperties.showInitPosAlignment,
      distributionGuidelines: gridProperties.showDistributionGuidelines,
      snapToAlignmentLocationOnRelease: gridProperties.snapToAlignmentLocationOnRelease,
      snapToAlignmentLocationDuringDrag: gridProperties.snapToAlignmentLocationDuringDrag,
      lineWidth: gridProperties.lineWidth,
      guidelinesStyle: {
        initPosAlignmentLine: gridProperties.initPosAlignmentLine,
        lineDash: gridProperties.lineDash,
        horizontalDistLine: gridProperties.horizontalDistLine,
        strokeStyle: gridProperties.guidelineColor,
        horizontalDistColor: gridProperties.horizontalGuidelineColor,
        verticalDistColor: gridProperties.verticalGuidelineColor,
        initPosAlignmentColor: gridProperties.initPosAlignmentColor,
        geometricGuidelineRange: gridProperties.geometricAlignmentRange,
        range: gridProperties.distributionAlignmentRange,
        minDistRange: gridProperties.minDistributionAlignmentRange
      }
    });

    var panProps = {
      fitPadding: 20,
      fitSelector: ':visible',
      animateOnFit: function () {
        var currentGeneralProperties = appUtilities.getScratch(cy, 'currentGeneralProperties');
        return currentGeneralProperties.animateOnDrawingChanges;
      },
      animateOnZoom: function () {
        var currentGeneralProperties = appUtilities.getScratch(cy, 'currentGeneralProperties');
        return currentGeneralProperties.animateOnDrawingChanges;
      }
    };

    cy.panzoom(panProps);
  }

  function bindCyEvents() {

    // Expand collapse extension is supposed to clear expand collapse cue on node position event.
    // If compounds are resized position event is not triggered though the position of the node is changed.
    // Therefore, we listen to noderesize.resizedrag event here and if the node is a compound we need to call clearVisualCue() method of
    // expand collapse extension.
    cy.on("noderesize.resizedrag", function(e, type, node){
        if (node.isParent()) {
            cy.expandCollapse('get').clearVisualCue();
        }
    });

    /*
     * Collapsing/expanding can change the nature of the node and change wether it's resizeable or not.
     * We need to refresh the resize grapples to ensure they are consistent with their parent's status.
     * (for instance: complexes)
     */
   /*  cy.on("fit-units-after-expandcollapse", function(event) {
      var nodesToConsider = cy.nodes().filter(function(node){
        var sbgnClass = node.data('class');
        if (sbgnClass == 'complex' || sbgnClass == 'complex multimer' || sbgnClass == 'compartment') {
          return true;
        }
      });
      nodesToConsider.forEach(function(ele){
        if(!ele.data('statesandinfos') || ele.data('statesandinfos').length == 0) {
          return;
        }
        var locations = chiseInstance.elementUtilities.checkFit(ele); //Fit all locations
        chiseInstance.elementUtilities.fitUnits(ele, locations); //Force fit
    });
      cy.style().update();
    }); */

    //Fixes info box locations after expand collapse
    cy.on("expandcollapse.aftercollapse expandcollapse.afterexpand", function(e, type, node) {
      cy.nodeResize('get').refreshGrapples();
    });

    cy.on("expandcollapse.beforeexpand",function(event){
      var currentGeneralProperties = appUtilities.getScratch(cy, 'currentGeneralProperties');
      if(currentGeneralProperties.recalculateLayoutOnComplexityManagement){
        var node = cy.nodes(":selected");
        if(node.length == 1 && event.target.selected())
         node[0].data("onLayout", true);
      }
    });
    
    // To redraw expand/collapse cue after resize
    cy.on("noderesize.resizeend", function (e, type, node) {
      if(node.isParent() && node.selected())
        node.trigger("select");
    });
       
   /*  cy.on("expandcollapse.afterexpand",function(event){
      var node = event.target;
     node.data("expanding", false);      
    }); */
    //Updates arrow-scale of edges after expand
    cy.on("expandcollapse.afterexpand", function(event) {
      var currentArrowScale = Number($('#arrow-scale').val());
      cy.edges().style('arrow-scale', currentArrowScale);
    });

    //Changes arrow-scale of pasted edges
    cy.on("pasteClonedElements", function(e) {
        var currentArrowScale = Number($('#arrow-scale').val());
        cy.edges(":selected").style('arrow-scale', currentArrowScale);
    });

    cy.on("afterDo", function (event, actionName, args, res) {
      refreshUndoRedoButtonsStatus(cy);

      if(actionName == "resize") {
        var node = res.node;
        // ensure consistency of infoboxes through resizing
       /*  if(node.data('statesandinfos').length > 0) {
          updateInfoBox(node);
        } */
        // ensure consistency of inspector properties through resizing
        // inspectorUtilities.handleSBGNInspector();
      }
    });

    // Indicates whether creating a process with convenient edges
    var convenientProcessSource;
    // cyTarget will be selected after 'tap' event is ended by cy core. We do not want this behaviour.
    // Therefore we need to set node to unselect on 'tapend' event (this may be changed as 'tap' event later),
    //  which is to be unselected on 'select' event.
    var nodeToUnselect;

    // infobox refresh when resize happen, for simple nodes
    /* cy.on('noderesize.resizedrag', function(e, type, node) {
      if(node.data('statesandinfos').length > 0) {
        updateInfoBox(node);
      }
    }); */
    
    cy.on("layoutstart",function(event){   
     var node = cy.nodes(":selected").nodes(":parent");
     if(node.length == 1)
      node[0].data("onLayout", true);
    });    

    cy.on('layoutstop', function (event) {
  		/*
  		* 'preset' layout is called to give the initial positions of nodes by sbgnviz.
  		* Seems like 'grid' layout is called by Cytoscape.js core in loading graphs.
  		* If the layout is not one of these (normally it is supposed to be 'cose-bilkent')
  		* stop layout spinner for the related chise instance.
  		*/
      if (event.layout.options.name !== 'preset' && event.layout.options.name !== 'grid')
      {
        appUtilities.getChiseInstance(cy).endSpinner('layout-spinner');
      }
    /*   var nodesToConsider = cy.nodes().filter(function(node){
        var sbgnClass = node.data('class');
        if (sbgnClass == 'complex' || sbgnClass == 'complex multimer' || sbgnClass == 'compartment') {
          return true;
        }
      });
      nodesToConsider.forEach(function(ele){
        // skip nodes without any auxiliary units
        if(!ele.data('statesandinfos') || ele.data('statesandinfos').length == 0) {
          return;
        }
        var locations = chiseInstance.elementUtilities.checkFit(ele); //Fit all locations
        chiseInstance.elementUtilities.fitUnits(ele, locations); //Force fit
      }); */

      cy.nodes("[?onLayout]").forEach(function(node){node.removeData("onLayout"); });
      
      
  
if (document.performLayout !== undefined) {    
  var chiseInstance = appUtilities.getChiseInstance(cy);
  var cyInstance = chiseInstance.getCy();
  var urlParams = appUtilities.getScratch(cyInstance, 'urlParams');

  console.log(" layout finished")

    var format = urlParams.format;
    var bg = urlParams.bg;
    var scale = (urlParams.scale === undefined ? undefined : parseInt(urlParams.scale));
    var maxWidth = (urlParams.max_width === undefined ? undefined : parseInt(urlParams.max_width));
    var maxHeight = (urlParams.max_height === undefined ? undefined : parseInt(urlParams.max_height));
    var quality = (urlParams.quality === undefined ? undefined : parseFloat(urlParams.quality));      
    
    document.sbgnReady = true;
 
    if (format == "svg") {
      chiseInstance.saveAsSvg("network.svg", scale=scale, bg=bg);
      
    } else if (format == "jpg") {
      chiseInstance.saveAsJpg("network.jpg", scale=scale, bg=bg, maxWidth=maxWidth, maxHeight=maxHeight, quality=quality);
      
    } else {
      chiseInstance.saveAsPng("network.png", scale=scale, bg=bg, maxWidth=maxWidth, maxHeight=maxHeight); // the default filename is 'network.png'
        
    } 
  }
    });

    // if the position of compound changes by repositioning its children
    // Note: position event for compound is not triggered in this case
    // edge case: when moving a complex, it triggers the position change of the children,
    // which then triggers the event below.
    var oldPos = {x: undefined, y: undefined};
    var currentPos = {x : 0, y : 0};
    cy.on("position", "node:child", function(event) {
      var parent = event.target.parent();
      if(!parent.is("[class^='complex'], [class^='compartment']")) {
        return;
      }
      currentPos = parent.position();
      if (currentPos.x != oldPos.x || currentPos.y != oldPos.y){
          oldPos = {x : currentPos.x, y : currentPos.y};
          cy.trigger('noderesize.resizedrag', ['unknown', parent]);
      }
    });

    // update background image style when data changes
    cy.on('data', 'node', function(event) {
      var node = event.target;

      if(!node || !node.isNode())
        return;

      var keys = ['background-image', 'background-fit', 'background-image-opacity',
        'background-position-x', 'background-position-y', 'background-height', 'background-width'];

      var opt = {};
      keys.forEach(function(key){
        opt[key] = node.data(key);
      });

      node.style(opt);
    });
  }

};