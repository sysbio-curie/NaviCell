var appUtilities = require('./app-utilities');

// Handle sbgnviz menu functions which are to be triggered on events
module.exports = function() {
  
  console.log('init the sbgnviz template/page');

  $(document).on('sbgnvizLoadFileEnd sbgnvizLoadSampleEnd', function(event, filename, cy) {

    // get chise instance for cy
    var chiseInstance = appUtilities.getChiseInstance(cy);
    document.sbgnReady = true;
    // var currentLayoutProperties = appUtilities.getScratch(cy, 'currentLayoutProperties');

    // var preferences;
    // // if preferences param is not set use an empty map not to override any layout option
    // if (preferences === undefined) {
    //   preferences = {};
    // }

    // var options = $.extend({}, currentLayoutProperties, preferences);
    
    // chiseInstance.performLayout(options);

    
    
    
    
    
    chiseInstance.saveAsPng("truc.png", document.sbgnBg); // the default filename is 'network.png'

  });

  // $(document).on('layoutstop', function(event, cy) {
  //   chiseInstance.saveAsPng("layout.png"); // the default filename is 'network.png'

  // });		  
};
