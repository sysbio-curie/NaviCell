echo off

set outFolderName=nfkb
set srcFolderName=simple_map_src


md ..\..\site\docroot\navicell\maps\%outFolderName%
java -Dfile.encoding=UTF-8 -classpath ..\lib\navicell.jar;..\lib\binomlibext.jar;..\lib\cd4.jar;..\lib\celldesigner.jar;..\lib\CellDesigner401Jars.jar;..\lib\csml.jar;..\lib\cytoscape270.jar;..\lib\giny.jar;..\lib\imgscalr-lib-3.1-javadoc.jar;..\lib\imgscalr-lib-3.1-sources.jar;..\lib\imgscalr-lib-3.1.jar;..\lib\jwordpress\commons-collections-3.2.jar;..\lib\jwordpress\commons-configuration-1.5.jar;..\lib\jwordpress\commons-lang-2.3.jar;..\lib\jwordpress\jwordpress-0.5.1-cli.jar;..\lib\jwordpress\jwordpress-0.5.1.jar;..\lib\jwordpress\jwordpress-0.5.jar;..\lib\jwordpress\xmlrpc-client-1.1.jar;..\lib\MathMLIO.jar;..\lib\paxtools-4.2.1-no-jena.jar;..\lib\sbml.jar;..\lib\transpath.jar;..\lib\VDAOEngine.jar;..\lib\xgmml.jar;.. fr.curie.BiNoM.pathways.navicell.ProduceClickableMap --config %srcFolderName%\config --xrefs xrefs.txt --destination ..\..\site\docroot\navicell\maps\%outFolderName% --verbose --demo 

cd ..\..\site\docroot\navicell\maps\%outFolderName%
set url=%cd%\master\index.html

echo[ 
echo Simple map map has been succesfully generated
echo[
echo Available at URL file://%url%
echo[
echo If you are using Chrome, open it using --allow-file-access-from-files option
echo[
echo Under Linux:
echo google-chrome --allow-file-access-from-files
echo[
echo Under MacOS
echo open -a "Google Chrome" --args --allow-file-access-from-files
echo[
echo Under Windows
echo chrome --allow-file-access-from-files
echo[
