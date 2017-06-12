#
# test.py
#
# NaviCell python binding test
#
# Institut Curie (c) December 2015
#
# Eric Bonnet, Eric Viara
#

from curie.navicell import NaviCell, Options

# load expression data and send it to the map
def test(nv):
    filename = "DU145_data.txt"
    dat = nv.makeDataFromFile(filename)
    nv.importDatatables(dat, "DU145", "mRNA expression data")

    # select a datatable, select a sample and produce a heatmap
    nv.heatmapEditorSelectDatatable('','0','DU145')
    nv.heatmapEditorSelectSample('','0','data')
    nv.heatmapEditorApply('')
