# NaviCell  

![NaviCell Logo](https://github.com/sysbio-curie/NaviCell/raw/feat/v3/site/docroot/navicell/navicell-logo.png)


NaviCell platform supports easy molecular maps navigation and exploration using Google maps™ engine. The logic of navigation as scrolling and zooming; features as markers, pop-up bubbles and zoom bar are adapted from the Google map.
NaviCell’s semantic zooming feature provides possibility for map exploring from detail toward a top-level view achieved by gradual exclusion of details while zooming out.
NaviCell includes a powerful module for data visualization. Users can integrate and visualize different types of "omics" data on the NaviCell maps. There is also a Python API to automate tasks and communicate with the NaviCell web server.
### NaviCell Web Server

The extended NaviCell 3.0 web-server allows users to easily create their own maps, superimposed with data, regrouped and share with the community, save the produced annotated maps to retrieve them later. This activity is possible from the webpage interface, but also in order to create large number of maps (e.g., from network-based omics data analysis), we developed a python client which allows to create maps in a programmatic fashion.

This new NaviCell 3.0 web-server is available at https://navicell.curie.fr.

This work was funded as a part of the project iPC which has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 826121.


### NaviCell Factory

Before using <b>NaviCell Factory</b>, CellDesigner maps should be prepared in a specific manner to be most compatible with NaviCell. Here is the [procedure for construction of maps](map_construction_procedures/NaviCell_Maps_Preparation_Procedure.pdf) in CellDesigner and preparation of modular hierarchical map structure. The procedure contains instructions for generation of semantic zoom levels for maps using a [set of scripts](map_construction_procedures/procedure_scripts).

This is a <b>NaviCell Factory</b> package allowing to convert a <a href="http://celldesigner.org">CellDesigner</a> map into <a href="http://navicell.curie.fr">NaviCell</a> 
Google Maps-based enviroment, allowing to explore the map online and visualize high-throughput data on top of it with <a href="https://navicell.curie.fr/pages/nav_web_service.html">NaviCell Web Service</a>.

If you've never seen NaviCell then <a href="https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php?demo=on">click here</a> in order to see <a href="https://navicell.curie.fr/pages/maps.html">an example</a>.

Using <b>NaviCell Factory</b> consists of several steps

1) Download the <b>NaviCell Factory</b> package from github into a folder. Let us assume it is "C:\NaviCell" (and we assume to work under Windows though all instructions will work under any other operating system as well).

2) If you use <b>NaviCell Factory</b> for the first time then go to "C:\NaviCell\factory\examples\" and build the examples from there
or from "C:\NaviCell\factory\maps\" folder. Open and browse the result locally.

3) Prepare the images of CellDesigner files including, if necessary, several zoom images, b/w images for coloring the map, module definitions
(examples of map preparation are provided with the NaviCell Factory package in "C:\NaviCell\factory\examples\".
Detailed instructions on preparation of high-quality set of images for NaviCell are provided at <a href="https://navicell.curie.fr/doc/NaviCellMapperAdminGuide.pdf">here</a> (though for very simple use of the maps
it is sufficient to look at the examples).
Beware of exact naming of the files (i.e.,all images and main xml files shoud end up with "master", 
black/white image files should end with "_nobg-[k].png" string, enumeration of png files goes 
from 0 (lowest resolution) to k (highest resolution), etc.).

Simplest minimal set of files for <b>NaviCell Factory</b> can be found at "C:\NaviCell\factory\examples\\simple_map_src".

4) Copy the prepared files into the  "C:\NaviCell\factory\maps\\[src_folder]"

5) Create a .bat or .sh file for launching the command line based on the provided templates in "C:\NaviCell\factory\examples\".
You must modify the first two lines with:
set outFolderName=[out_folder]
set srcFolderName=[src_folder]

6) Launch the .bat or .sh file accordingly 

7) Find the results in "C:\NaviCell\site\docroot\navicell\maps\\[out_folder]\master\"

8) <i>Either</i> browse the map locally from "C:\NaviCell\site\docroot\navicell\maps\\[out_folder]\master\index.html". 
Beware of launching Chrome browser with "--allow-file-access-from-files" option!

9) <i>Or</i> copy the whole content of "C:\NaviCell\site\docroot\navicell\maps\\[out_folder]" to a web-server and browse online.

