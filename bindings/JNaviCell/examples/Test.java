import fr.curie.jnavicell.NaviCell;

public class Test {

    public static void main(String[] args) {

            NaviCell nv = new NaviCell();

	    String proxy_url = System.getenv("NV_PROXY_URL");
	    if (proxy_url == null) {
		    proxy_url = "https://navicell.curie.fr/cgi-bin/nv_proxy.php";
	    }
            nv.setProxyUrl(proxy_url);

	    String map_url = System.getenv("NV_MAP_URL");
	    if (map_url == null) {
		    map_url = "https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php";
	    }
            nv.setMapUrl(map_url);
	    
            nv.launchBrowser();

            nv.importData("", "DU145_data.txt",  "mRNA Expression data", "DU145");
            
            // select heatmap for visualization
            nv.drawingConfigSelectHeatmap("", true);
            nv.drawingConfigApply("");

            // select sample and datatable 
            nv.heatmapEditorSelectSample("", 0,"data");
            nv.heatmapEditorSelectDatatable("", 0, "DU145");

            // visualize the results
            nv.heatmapEditorApply("");
    }
}
