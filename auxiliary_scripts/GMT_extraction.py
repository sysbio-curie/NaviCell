#!/usr/bin/env python
#coding: utf-8

import xml.etree.cElementTree as ET
import glob
import os
import re
import argparse



##########################
### HELP Section START ###
##########################

class CustomFormatter(argparse.RawDescriptionHelpFormatter,
					argparse.ArgumentDefaultsHelpFormatter): pass

parser = argparse.ArgumentParser(prog='GMT_extraction',
								formatter_class=CustomFormatter,
								description=
"""
#-------------------------------------------#
# GMT_extraction                            #
#                                           #
# Author : SOMPAIRAC Nicolas                #
# Contact : nicolas.sompairac@gmail.com     #
# Version : (March 2019); Institut Curie    #
#-------------------------------------------#
This script allows to take as input a folder containing maps in a CellDesigner
XML format and generate a list of proteins per Modules in a GMT format file.
The resulting GMTs will have the same names as maps followed by the .gmt
extension.
ATTENTION!
The Module information has to be annotated inside the map
using the 'MODULE:' tag followed by the module name (e.g. MODULE:CELL_CYCLE).
The ID to use for the GMT content has to be annotated in the same fashion
(e.g. HUGO:AKT2)
Both these annotations can be specified as arguments with --mod and --id.
""")

file_locations = parser.add_argument_group('Location of different folders')

file_locations.add_argument('--map', metavar='Maps_folder', type=str,
							default="",
							help=("Location and name of the folder containing "
								"maps in Celldesigner XML format."))
file_locations.add_argument('--gmt', metavar='GMTs_folder', type=str,
							default="GMT",
							help=("Location and name of the GMT folder used to"
								"output GMT files from maps."))

annotation_type = parser.add_argument_group('Type of annotations')

annotation_type.add_argument('--mod', metavar='Module', type=str,
							default="MODULE",
							help=("Prefix of the module to use from annotation "
								"to construct the GMT file."))
annotation_type.add_argument('--id', metavar='ID', type=str,
							default="HUGO",
							help=("Prefix of the species ID to use from"
								"annotation to construct the GMT file."))

args = parser.parse_args()


#########################
### HELP Section STOP ###
#########################


def Get_annotation(item_tree, id_name):
	"""
		Find the ID information in the annotations.
	"""

	id_list = []

	for item_notes in item_tree.iter('{http://www.w3.org/1999/xhtml}body'):
				if item_notes.text and id_name+':' in item_notes.text:
					tmp = item_notes.text.split()
					for item in tmp:
						index = item.find(":")
						if id_name+':' in item and item[index+1:] not in id_list:
							id_list.append(item[index+1:])

	return id_list


def Clean_ids(id_dict):
	"""
		Delete repetitions in the dictionary values list.
	"""

	to_delete = []

	for item in id_dict:
		if len(id_dict[item]) >= 1:
			id_dict[item] = list(set(id_dict[item]))
		else:
			to_delete.append(item)

	for key in to_delete:
		id_dict.pop(key, None)

	return id_dict


def Add_modules_to_dict(module_list, mod_dict, spec_name):

	for mod in module_list:

		if mod not in mod_dict:

			mod_dict[mod] = []

			if spec_name not in mod_dict[mod]:
				mod_dict[mod].append(spec_name)

		else:

			if spec_name not in mod_dict[mod]:
				mod_dict[mod].append(spec_name)

	return mod_dict


def Retrieve_proteins_info(root, mod_dict, id_dict, id_type, mod_type):
	"""
		Retrieve annotations of Proteins.
	"""

	for list_prot in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfProteins'):

		for prot in list_prot:

			prot_name = prot.get('name')
			prot_mod_list = []
			if prot_name not in id_dict:
				id_dict[prot_name] = []

			# Get Proteins Modules
			prot_mod_list.extend(Get_annotation(prot,mod_type))
			id_dict[prot_name].extend(Get_annotation(prot,id_type))

			mod_dict = Add_modules_to_dict(prot_mod_list, mod_dict, prot_name)

	return mod_dict, id_dict


def Retrieve_genes_info(root, mod_dict, id_dict, id_type, mod_type):
	"""
		Retrieve annotations of Genes.
	"""

	for list_gene in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfGenes'):

		for gene in list_gene:

			gene_name = gene.get('name')
			gene_mod_list = []
			if gene_name not in id_dict:
				id_dict[gene_name] = []

			# Get Gene Modules
			gene_mod_list.extend(Get_annotation(gene,mod_type))
			id_dict[gene_name].extend(Get_annotation(gene,id_type))

			mod_dict = Add_modules_to_dict(gene_mod_list, mod_dict, gene_name)

	return mod_dict, id_dict


def Retrieve_rna_info(root, mod_dict, id_dict, id_type, mod_type):
	"""
		Retrieve annotations of RNA.
	"""

	for list_rna in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfRNAs'):

		for rna in list_rna:

			rna_name = rna.get('name')
			rna_mod_list = []
			if rna_name not in id_dict:
				id_dict[rna_name] = []

			# Get RNA Modules
			rna_mod_list.extend(Get_annotation(rna,mod_type))
			id_dict[rna_name].extend(Get_annotation(rna,id_type))

			mod_dict = Add_modules_to_dict(rna_mod_list, mod_dict, rna_name)

	return mod_dict, id_dict


def Retrieve_antisense_rna_info(root, mod_dict, id_dict, id_type, mod_type):
	"""
		Retrieve annotations of Antisense RNA.
	"""

	for list_antirna in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfAntisenseRNAs'):

		for antirna in list_antirna:

			antirna_name = antirna.get('name')
			antirna_mod_list = []
			if antirna_name not in id_dict:
				id_dict[antirna_name] = []

			# Get AntiRNA Modules
			antirna_mod_list.extend(Get_annotation(antirna,mod_type))
			id_dict[antirna_name].extend(Get_annotation(antirna,id_type))

			mod_dict = Add_modules_to_dict(antirna_mod_list, mod_dict, antirna)

	return mod_dict, id_dict


def Save_GMT_file(mod_dict, name_hugo_dict, filename):
	"""
		Save the Modules and their corresponding species content in HUGO IDs.
		The output file is in GMT format.
	"""

	with open(filename, 'w') as outfile:

		for mod in mod_dict.keys():

			if mod_dict[mod]:

				to_print = []

				for name in mod_dict[mod]:

					# print name
					name = name.encode("utf-8")
					# print name

					not_hugo = False

					if name in name_hugo_dict:

						for hugo in name_hugo_dict[name]:

							to_print.append(hugo)

						continue

					else:
						if "*" in name:
							not_hugo = True
						for c in name:
							if c.islower():
								not_hugo = True

					if not_hugo:
						continue
					else:
						to_print.append(name)

				if to_print:
					outfile.write(mod+"\tna\t")
					to_print_unique = sorted(list(set(to_print)))
					for item in to_print_unique:
						outfile.write(item+"\t")

					outfile.write("\n")

	return


print "\n"
############
### MAIN ###
############

maps_folder = args.map
gmt_folder = args.gmt
id_type = args.id
mod_type = args.mod

glob_list = glob.glob(maps_folder+"*.xml")
map_names = [os.path.basename(x) for x in glob.glob(maps_folder+"*.xml")]
if not os.path.exists(gmt_folder):
	os.makedirs(gmt_folder)
for file_path, filename in zip(glob_list, map_names):
	Filename = gmt_folder+"/"+filename[:-4]+".gmt"
	print("Working on "+filename)

	Tree = ET.parse(file_path)
	Root = Tree.getroot()

	Module_dict = {}
	Name_to_HUGO_dict = {}

	Module_dict, Name_to_HUGO_dict = Retrieve_proteins_info(Root, Module_dict,
		Name_to_HUGO_dict, id_type, mod_type)

	Module_dict, Name_to_HUGO_dict = Retrieve_genes_info(Root, Module_dict,
		Name_to_HUGO_dict, id_type, mod_type)

	Module_dict, Name_to_HUGO_dict = Retrieve_rna_info(Root, Module_dict,
		Name_to_HUGO_dict, id_type, mod_type)

	# Module_dict, Name_to_HUGO_dict = Retrieve_antisense_rna_info(Root,
	# 	Module_dict, Name_to_HUGO_dict, id_type, mod_type)

	Name_to_HUGO_dict = Clean_ids(Name_to_HUGO_dict)

	Save_GMT_file(Module_dict, Name_to_HUGO_dict, Filename)
	print("Done!")

print("You can find the resulting GMT files in the folder: "+gmt_folder)

print("\n")