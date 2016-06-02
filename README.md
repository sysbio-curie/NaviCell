# NaviCell

This is a <b>NaviCell Factory</b> package allowing to convert a <a href="http://celldesigner.org">CellDesigner</a> map into <a href="http://navicell.curie.fr">NaviCell</a> 
Google Maps-based enviroment, allowing to explore the map online and visualize high-throughput data on top of it with <a href="https://navicell.curie.fr/pages/nav_web_service.html">NaviCell Web Service</a>.

If you've never seen NaviCell then <a href="https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php?demo=on">click here</a> in order to see <a href="https://navicell.curie.fr/pages/maps.html">an example</a>.

Using <b>NaviCell Factory</b> consists of several steps

1) Unpack the <b>NaviCell Factory</b> package (navicell.[version].tgz file) into a user-specified folder. Let us assume it is "C:\NaviCell" (and we assume to work under Windows though all instructions will work under any other operating system as well).

2) If you use <b>NaviCell Factory</b> for the first time then go to "C:\NaviCell\factory\examples\" and launch the examples from there
or from "C:\NaviCell\factory\maps\" folder.

3) Prepare the images of CellDesigner files including, if necessary, several zoom images, b/w images for coloring the map, module definitions
(examples of map preparation are provided with the NaviCell Factory package in "C:\NaviCell\factory\examples\".
Detailed instructions on preparation of high-quality set of images for NaviCell are provided at <a href="https://navicell.curie.fr/doc/NaviCellMapperAdminGuide.pdf">here</a> (though for very simple use of the maps
it is sufficient to look at the examples).
Beware of exact naming of the files (i.e.,all images and main xml files shoud end up with "master", 
black/white image files should end with "_nobg-[k].png" string, enumeration of png files goes 
from 0 (lowest resolution) to k (highest resolution), etc.).

Simplest minimal set of files for <b>NaviCell Factory</b> can be found at "C:\NaviCell\factory\examples\\simple_map_src".

4) Copy the prepared files into the  "C:\NaviCell\factory\maps\[src_folder]"

5) Create a .bat or .sh file for launching the command line based on the provided templates in "C:\NaviCell\factory\examples\".
You must modify the first two lines with:
set outFolderName=[out_folder]
set srcFolderName=[src_folder]

6) Launch the .bat or .sh file accordingly 

7) Find the results in "C:\NaviCell\site\docroot\navicell\maps\[out_folder]\master\"

8) <i>Either</i> browse the map locally from "C:\NaviCell\site\docroot\navicell\maps\[out_folder]\master\index.html". 
Beware of launching Chrome browser with "--allow-file-access-from-files" option!

9) <i>Or</i> copy the whole content of "C:\NaviCell\site\docroot\navicell\maps\[out_folder]" onto a web-server and browse online.

