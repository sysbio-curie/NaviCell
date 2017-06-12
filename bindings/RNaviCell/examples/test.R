#
# test.R
# 
# NaviCell R binding test
#
# Institut Curie (c) December 2015
#
# Eric Bonnet, Eric Viara
#

navicell <- NaviCell()

# the environment variables NV_PROXY_URL, NV_MAP_URL and NV_BROWSER_COMMAND must be set,
# or you can hard-code the following variables as follows:

#navicell$proxy_url <- "https://navicell.curie.fr/cgi-bin/nv_proxy.php"
#navicell$map_url <- "https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php"
#navicell$browser_command <- "/usr/bin/google-chrome"

# to display the map with the Live Example Button, uncomment this line
#navicell$demo <- "on"

navicell$launchBrowser()

mat <- navicell$readDatatable('DU145_data.txt')

navicell$importDatatable("mRNA expression data", "DU145", mat)

navicell$heatmapEditorSelectSample('0','data')
navicell$heatmapEditorSelectDatatable('0','DU145')
navicell$heatmapEditorApply()



