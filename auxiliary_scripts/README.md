# Auxiliary Scripts

This folder contains scripts that are used outside of <b>NaviCell Factory</b> to process maps or data for further usage.

 - The script [Module_staining.py](Module_staining.py) allows to take as input a file containing scores for Modules
in a map plus a GMT containing a list of Genes per Module and create a 
file containing a list of genes with average scores based on their Modules.
A detailed help is available by running "python Module_staining.py --help"
