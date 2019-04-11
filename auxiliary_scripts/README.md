# Auxiliary Scripts

This folder contains scripts that are used outside of <b>NaviCell Factory</b> to process maps or data for further usage.

 - The script [Module_staining.py](Module_staining.py) allows to take as input a file containing scores for Modules
 in a map plus a GMT containing a list of Genes per Module and create a 
 file containing a list of genes with average scores based on their Modules.
 A detailed help is available by running "python Module_staining.py --help"
 - The script [GMT_extraction.py](GMT_extraction.py) allows to take as input a folder containing maps in a CellDesigner XML format plus a correspondence file between species names to an ID (e.g. HUGO), and generate a list of genes per Modules in a GMT format file.
 The resulting GMTs will have the same names as maps followed by the .gmt extension.
 ATTENTION! The Module information has to be annotated inside the map using the 'MODULE:' tag followed by the module name (e.g. MODULE:CELL_CYCLE).
 A detailed help is available by running "python GMT_extraction.py --help"
