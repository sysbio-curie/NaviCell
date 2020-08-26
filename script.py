
from curie.navicell import NaviCell, Options

# 1. Instantiate and set Options:
options = Options()
options.proxy_url = 'http://localhost/navicell/proxy/nv_proxy.php'
options.map_url = 'http://localhost/navicell/maps/cellcycle/master/index.php'

# If you want to specify a particular Web Browser, you have to set options.browser_command, otherwise the default browser will be used.
# For instance, to use firefox on MacOS:
# options.browser_command = 'open -a Firefox %s'
# To use google chrome on Linux:
# options.browser_command = 'chromium-browser %s'
# options.browser_command = 'firefox %s'
options.browser_command = '/opt/firefox-developer/firefox-80.0b8/firefox/firefox %s'
# 2. Instantiate a NaviCell client handle
nv = NaviCell(options)

# 3. Launch browser
nv.launchBrowser()

# # 4. Check hugo list
# hugo_list = nv.getHugoList()
# print(hugo_list)


# print("Loading data...")
# data = nv.makeDataFromFile("/home/vincent/Work/code/NaviCell/site/docroot/data/ovca_expression.txt")

# print("Importing data...")
# nv.importDatatables(data, "mRNAExpression", "mRNA expression data", {"open_drawing_editor": False, "import_display_markers": "checked", "import_display_heatmap": False})

# print("Staining configuration")
# nv.mapStainingEditorOpen('')
# nv.mapStainingEditorSelectSample('', 'TCGA_04_1332')
# nv.mapStainingEditorSelectDatatable('', 'mRNAExpression')
# nv.mapStainingEditorSetTransparency('', 0.10)
# nv.mapStainingEditorApplyAndClose('')

# print("Zooming")
# nv.setZoom('', 5)
# nv.setCenter('', 'ABSOLUTE',95, -25)
