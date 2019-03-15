#!/usr/bin/env python
#coding: utf-8

import re
import argparse


##########################
### HELP Section START ###
##########################

class CustomFormatter(argparse.RawDescriptionHelpFormatter,
					argparse.ArgumentDefaultsHelpFormatter): pass

parser = argparse.ArgumentParser(prog='Module_staining',
								formatter_class=CustomFormatter,
								description=
"""
#-------------------------------------------#
# Module_staining                       #
#                                           #
# Author : SOMPAIRAC Nicolas                #
# Contact : nicolas.sompairac@gmail.com     #
# Version : (March 2019); Institut Curie    #
#-------------------------------------------#
This script allows to take as input a file containing scores for Modules
in a map plus a GMT containing a list of Genes per Module and create a 
file containing a list of genes with average scores based on their Modules.
""")

file_locations = parser.add_argument_group('Location of different files')


file_locations.add_argument('--scores', metavar='Scores_file', type=str,
							default=None,
							help=("Location and name of the file containing "
								"scores per Modules."))
file_locations.add_argument('--gmt', metavar='GMT_file', type=str,
							default=None,
							help=("Location and name of the GMT file "
								"containing Genes per Modules."))


args = parser.parse_args()


#########################
### HELP Section STOP ###
#########################


def Read_module_scores(filename):

	module_scores_dict = {}

	with open(filename, 'rU') as infile:

		# Ignore header
		first_line = infile.readline().split()

		for line in infile:

			tmp = line.split()
			module_scores_dict[tmp[0]] = {}
			
			for col in range(1, len(tmp)):
				
				module_scores_dict[tmp[0]][first_line[col]] = float(tmp[col])

	return module_scores_dict, (first_line[1:])


def Read_GMT(filename, mod_dict):

	gmt_dict = {}

	with open(filename, 'rU') as infile:

		for line in infile:

			tmp = line.split()
			if tmp[0] in mod_dict:
				gmt_dict[tmp[0]] = tmp[2:]

	return gmt_dict


def Get_genes_modules_gmt(gmt_dict):

	gene_dict = {}

	for mod in gmt_dict:

		for gene in gmt_dict[mod]:

			if gene not in gene_dict:

				gene_dict[gene] = [mod]

			elif mod not in gene_dict[gene]:

				gene_dict[gene].append(mod)

	return gene_dict


def Calculate_gene_module_score(mod_score_dict, group, gmt_dict, gene_dict, filename):

	with open(filename, 'w') as outfile:

		outfile.write("Gene\tModule_score\n")

		for gene in gene_dict:

			score = 0
			total_gene = 0

			for mod in gene_dict[gene]:

				score += mod_score_dict[mod][group] * len(gmt_dict[mod])
				total_gene += len(gmt_dict[mod])

			score = score/total_gene

			outfile.write(gene+"\t"+str(score)+"\n")

	return

print("\n")
############
### MAIN ###
############

module_score_filename = args.scores
gmt_filename = args.gmt

Module_score_dict, Groups_tup = Read_module_scores(module_score_filename)

GMT_dict = Read_GMT(gmt_filename, Module_score_dict)

Gene_gmt_dict = Get_genes_modules_gmt(GMT_dict)

for Group in Groups_tup:
	
	Calculate_gene_module_score(Module_score_dict, Group, GMT_dict, Gene_gmt_dict, "Gene_module_scores_table_"+Group+".txt")

print("\n")