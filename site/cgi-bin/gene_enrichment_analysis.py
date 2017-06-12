#!/usr/bin/python
#
# Gene enrichment analysis for map modules
#
# (c) 2015 Sylvia Saint and New Bohemians 
#


from subprocess import call
import tempfile
import os
import cgi
import json
import HTML
from sets import Set

#$_POST["gene_list"]; // json
#$_POST["p_value"]; // double
#$_POST["background_set"]; // string
#$_POST["genes_on_map"]; // optional
#$_POST["multiple_testing"]; // true or false
#$_POST["gene_module"]; // json

# print HTML header
print "Content-type: text/html"
print ""

form = cgi.FieldStorage()

# get list of genes of interest
glist = json.loads(form.getvalue("gene_list"))

# correction for multiple testing, either 'true' or 'false'
mtest = form.getvalue("multiple_testing")

# p-value threshold , default to 0.05
pval = 0.05
try:
    pval = float(form.getvalue("p_value"))
    if pval > 1 or pval <= 0:
        pval = 0.05
except:
    pass

# get background set option, either 'genes_on_map' or 'whole_geneome'
bg_set = form.getvalue("background_set")

# get list of genes present on the map, if the option is selected
g_map = []
if bg_set == 'genes_on_map':
    g_map = json.loads(form.getvalue("genes_on_map"))

gm = {}             # module list as dictionary 
gm_sample_size = {} # module size as dictionary
gm_nb_sample = {}   # nb of genes of interest per module, as dictionary
universe = []       # list of genes for universe
nb_universe = 0     # nb of genes of interest in the universe
universe_size = 0   # universe size
nb_modules = 0      # nb of modules
gm_genes = {}       # list of genes of interest per module

# get modules gene lists
# calculate nb of genes of interest in modules
gm = json.loads(form.getvalue("gene_module"))
for k in gm.keys():
    gm_sample_size[k] = len(gm[k])
    count = 0
    gm_genes[k] = []
    for g in glist:
        if g in gm[k]:
            count += 1
            gm_genes[k].append(g)
    gm_nb_sample[k] = count

nb_modules = len(gm.keys())

# set appropriate background set
if bg_set == "genes_on_map": 
    genes_in_map = Set()
    for g in g_map:
        genes_in_map.add(g)

    universe = list(genes_in_map)
else:
    # load universe file
    fh = open("acsn_universe.txt")
    for line in fh:
        universe.append(line.strip())
    fh.close()

universe_size = len(universe)

# calculate nb of genes of interest in universe
nb_universe = 0
for g in glist:
    if g in universe:
        nb_universe += 1 

# create temporary files for R calculations
input_data =  tempfile.NamedTemporaryFile(delete=False)
output_data = tempfile.NamedTemporaryFile(delete=False)

# fill in input data file for R
fh = open(input_data.name, 'w')
module_names = []
for k in gm.keys():
    if gm_nb_sample[k] > 0:
        string = str(gm_nb_sample[k]) + "\t" + str(gm_sample_size[k]) + "\t" + str(nb_universe) + "\t" + str(universe_size) + "\n" 
        fh.write(string)
        module_names.append(k)
fh.close()

#print input_data.name
#print output_data.name
#call("chmod 777 " + input_data.name, shell=True)
#call("chmod 777 " + output_data.name, shell=True)

# launch R analysis
Rcmd = "/bioinfo/local/build/R/R-2.15.0/bin/Rscript script.R " + input_data.name + " " + output_data.name + " > /dev/null"
return_code = call(Rcmd, shell=True)
 
if return_code != 0:
    print "An error occurred. Please close this window and restart the analysis (error code " + str(return_code) + ")"

    # cleanup this mess
    os.unlink(input_data.name)
    os.unlink(output_data.name)
else:

    p_values = []

    # collect results from R
    fh = open(output_data.name)
    for line in fh:
        p_values.append(float(line.strip()))
    fh.close()

    # do not fill /tmp
    os.unlink(input_data.name)
    os.unlink(output_data.name)

    # correction for multiple testing (Bonferroni)
    if mtest == "true":
        pval = pval / nb_modules
    
    # select p-values lower than threshold
    tab = []
    for i in range(0, len(p_values)):
        if p_values[i] < pval:
            k = module_names[i]
            g_string = ""
            for g in gm_genes[k]:
                g_string = g_string + g + " "
            g_string = g_string[:-1]
            #tab.append([k, str(gm_sample_size[k]), str(gm_nb_sample[k]), str('%.1e' % p_values[i]), str(gm_genes[k])])
            tab.append([k, str(gm_sample_size[k]), str(gm_nb_sample[k]), str('%.1e' % p_values[i]), g_string])

    # sort results by increasing p-value
    tab.sort(key = lambda x: float(x[3]))

    # build HTML table
    if mtest == "true":
        print HTML.table(tab, header_row = ['Module', 'Module size', 'Nb genes in module', 'p-value (corrected)', 'Genes'])
    else:
        print HTML.table(tab, header_row = ['Module', 'Module size', 'Nb genes in module', 'p-value', 'Genes'])


#EOF
