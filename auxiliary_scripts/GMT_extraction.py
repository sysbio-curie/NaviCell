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
XML format and generate a list of genes per Modules in a GMT format file. The
resulting GMTs will have the same names as maps followed by the .gmt extension.
ATTENTION! The Module information has to be annotated inside the map using the
'MODULE:' tag followed by the module name (e.g. MODULE:CELL_CYCLE).
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


args = parser.parse_args()


#########################
### HELP Section STOP ###
#########################




def Print_number_of_existing_modules(info_dict):

	mod = 0
	for item in info_dict.keys():
		if info_dict[item]['module']:
			mod+=1
	print mod, len(info_dict.keys())

	return


def Get_notes(item_tree):

	modules_list = []

	for item_notes in item_tree.iter('{http://www.sbml.org/sbml/level2}body'):
				if item_notes.text and 'MODULE:' in item_notes.text:
					tmp = item_notes.text.split()
					for item in tmp:
						index = item.find(":")
						if 'MODULE:' in item and item[index+1:] not in modules_list:
							modules_list.append(item[index+1:])

	return modules_list


def Retrieve_proteins_info(root, mod_dict):

	prot_dict = {}

	for list_prot in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfProteins'):

		for prot in list_prot:

			prot_id = prot.get('id')
			prot_dict[prot_id] = {}
			prot_dict[prot_id]['name'] = prot.get('name')
			prot_dict[prot_id]['module'] = []

			# Get Proteins Modules
			for prot_notes in prot.iter('{http://www.w3.org/1999/xhtml}body'):

				if prot_notes.text and 'MODULE:' in prot_notes.text:

					tmp = prot_notes.text.split()

					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in prot_dict[prot_id]['module']:

							prot_dict[prot_id]['module'].append(item[index+1:])

			prot_dict[prot_id]['module'].extend(Get_notes(prot))

			# print prot.get('id'), prot.get('name')
			# print prot_dict[prot_id]['module']

			for mod in prot_dict[prot_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["prot_id"] = []

					if prot.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(prot.get('name'))
					mod_dict[mod]["prot_id"].append(prot.get('id'))

				else:

					if "prot_id" not in mod_dict[mod]:
						mod_dict[mod]["prot_id"] = []

					if prot.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(prot.get('name'))
					mod_dict[mod]["prot_id"].append(prot.get('id'))

	return prot_dict, mod_dict


def Retrieve_genes_info(root, mod_dict):

	gene_dict = {}

	for list_gene in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfGenes'):

		for gene in list_gene:

			gene_id = gene.get('id')
			gene_dict[gene_id] = {}
			gene_dict[gene_id]['name'] = gene.get('name')
			gene_dict[gene_id]['module'] = []

			# Get Proteins Modules
			for gene_notes in gene.iter('{http://www.w3.org/1999/xhtml}body'):

				if gene_notes.text and 'MODULE:' in gene_notes.text:

					tmp = gene_notes.text.split()
					
					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in gene_dict[gene_id]['module']:

							gene_dict[gene_id]['module'].append(item[index+1:])

			gene_dict[gene_id]['module'].extend(Get_notes(gene))

			for mod in gene_dict[gene_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["gene_id"] = []

					if gene.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(gene.get('name'))
					mod_dict[mod]["gene_id"].append(gene.get('id'))

				else:

					if "gene_id" not in mod_dict[mod]:
						mod_dict[mod]["gene_id"] = []

					if gene.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(gene.get('name'))
					mod_dict[mod]["gene_id"].append(gene.get('id'))

	return gene_dict, mod_dict


def Retrieve_rna_info(root, mod_dict):

	rna_dict = {}

	for list_rna in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfRNAs'):

		for rna in list_rna:

			rna_id = rna.get('id')
			rna_dict[rna_id] = {}
			rna_dict[rna_id]['name'] = rna.get('name')
			rna_dict[rna_id]['module'] = []

			# Get RNA Modules
			for rna_notes in rna.iter('{http://www.w3.org/1999/xhtml}body'):

				if rna_notes.text and 'MODULE:' in rna_notes.text:

					tmp = rna_notes.text.split()
					
					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in rna_dict[rna_id]['module']:

							rna_dict[rna_id]['module'].append(item[index+1:])

			rna_dict[rna_id]['module'].extend(Get_notes(rna))

			for mod in rna_dict[rna_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["rna_id"] = []

					if rna.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(rna.get('name'))
					mod_dict[mod]["rna_id"].append(rna.get('id'))

				else:

					if "rna_id" not in mod_dict[mod]:
						mod_dict[mod]["rna_id"] = []

					if rna.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(rna.get('name'))
					mod_dict[mod]["rna_id"].append(rna.get('id'))

	return rna_dict, mod_dict


def Retrieve_antisense_rna_info(root, mod_dict):

	antirna_dict = {}

	for list_antirna in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfAntisenseRNAs'):

		for antirna in list_antirna:

			antirna_id = antirna.get('id')
			antirna_dict[antirna_id] = {}
			antirna_dict[antirna_id]['name'] = antirna.get('name')
			antirna_dict[antirna_id]['module'] = []

			# Get Proteins Modules
			for antirna_notes in antirna.iter('{http://www.w3.org/1999/xhtml}body'):

				if antirna_notes.text and 'MODULE:' in antirna_notes.text:

					tmp = antirna_notes.text.split()
					
					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in antirna_dict[antirna_id]['module']:

							antirna_dict[antirna_id]['module'].append(item[index+1:])

			antirna_dict[antirna_id]['module'].extend(Get_notes(antirna))

			for mod in antirna_dict[antirna_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["antirna_id"] = []

					if antirna.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(antirna.get('name'))
					mod_dict[mod]["antirna_id"].append(antirna.get('id'))

				else:

					if "antirna_id" not in mod_dict[mod]:
						mod_dict[mod]["antirna_id"] = []

					if antirna.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(antirna.get('name'))
					mod_dict[mod]["antirna_id"].append(antirna.get('id'))

	return antirna_dict, mod_dict


def Retrieve_species_info(root, prot_dict, gene_dict, rna_dict, antirna_dict, mod_dict):

	spec_dict = {}
	spec_inc_list = []

	# Find Species ID info
	for list_spec in root.iter('{http://www.sbml.org/sbml/level2}listOfSpecies'):

		for spec in list_spec:

			#print spec.tag, spec.attrib
			spec_id = spec.get('id')
			spec_dict[spec_id] = {}
			spec_dict[spec_id]['name'] = spec.get('name')
			spec_dict[spec_id]['module'] = []

			# Get species direct Modules
			for spec_notes in spec.iter('{http://www.w3.org/1999/xhtml}body'):

				if spec_notes.text and 'MODULE:' in spec_notes.text:

					tmp = spec_notes.text.split()
					
					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in spec_dict[spec_id]['module']:

							spec_dict[spec_id]['module'].append(item[index+1:])
							#print spec_id, spec_dict[spec_id]['module']

			spec_dict[spec_id]['module'].extend(Get_notes(spec))

			#print spec_dict[spec_id]['module']

			for mod in spec_dict[spec_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["spec_id"] = []

					if spec.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(spec.get('name'))
					mod_dict[mod]["spec_id"].append(spec.get('id'))

				else:

					if "spec_id" not in mod_dict[mod]:
						mod_dict[mod]["spec_id"] = []

					if spec.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(spec.get('name'))
					mod_dict[mod]["spec_id"].append(spec.get('id'))

	# Find Included Species ID info
	for list_spec in root.iter('{http://www.sbml.org/2001/ns/celldesigner}listOfIncludedSpecies'):

		for spec in list_spec:

			#print spec.tag, spec.attrib
			spec_id = spec.get('id')
			spec_dict[spec_id] = {}
			spec_dict[spec_id]['name'] = spec.get('name')
			spec_dict[spec_id]['module'] = []

			spec_inc_list.append(spec_id)

			# Get species Modules
			for spec_notes in spec.iter('{http://www.w3.org/1999/xhtml}body'):

				if spec_notes.text and 'MODULE:' in spec_notes.text:

					tmp = spec_notes.text.split()
					
					for item in tmp:

						index = item.find(":")

						if 'MODULE:' in item and item[index+1:] not in spec_dict[spec_id]['module']:

							spec_dict[spec_id]['module'].append(item[index+1:])
							#print spec_id, spec_dict[spec_id]['module']

			spec_dict[spec_id]['module'].extend(Get_notes(spec))

			for mod in spec_dict[spec_id]['module']:

				if mod not in mod_dict:

					mod_dict[mod] = {}
					mod_dict[mod]["name"] = []
					mod_dict[mod]["spec_id"] = []
					mod_dict[mod]["spec_id_all"] = []

					if spec.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(spec.get('name'))
					mod_dict[mod]["spec_id"].append(spec.get('id'))
					mod_dict[mod]["spec_id_all"].append(spec.get('id'))

				else:

					if "spec_id" not in mod_dict[mod]:
						mod_dict[mod]["spec_id"] = []
					if "spec_id_all" not in mod_dict[mod]:
						mod_dict[mod]["spec_id_all"] = []

					if spec.get('name') not in mod_dict[mod]["name"]:
						mod_dict[mod]["name"].append(spec.get('name'))
					mod_dict[mod]["spec_id"].append(spec.get('id'))
					mod_dict[mod]["spec_id_all"].append(spec.get('id'))

	return spec_dict, spec_inc_list, mod_dict

def Save_GMT_file(mod_dict, filename):

	with open(filename, 'w') as outfile:

		for mod in mod_dict.keys():

			if "name" in mod_dict[mod]:
				outfile.write(mod+"\tna\t")
				for name in mod_dict[mod]["name"]:
					#print repr(name)
					name = name.encode("utf-8")
					outfile.write(name+'\t')
				outfile.write("\n")

			if "spec_id" in mod_dict[mod]:
				outfile.write(mod+"\tSpec_ID\t")
				for spec_id in mod_dict[mod]["spec_id"]:
					outfile.write(spec_id+'\t')
				outfile.write("\n")

	return


print "\n"
############
### MAIN ###
############

maps_folder = args.map
gmt_folder = args.gmt

glob_list = glob.glob(maps_folder+"*.xml")
map_names = [os.path.basename(x) for x in glob.glob(maps_folder+"*.xml")]
if not os.path.exists(gmt_folder):
	os.makedirs(gmt_folder)
for file_path, filename in zip(glob_list, map_names):
	Filename = gmt_folder+"/"+filename[:-4]+".gmt"
	print "Working on "+filename

	Tree = ET.parse(file_path)
	Root = Tree.getroot()

	Module_dict = {}

	Proteins_dict_info, Module_dict = Retrieve_proteins_info(Root, Module_dict)

	Genes_dict_info, Module_dict = Retrieve_genes_info(Root, Module_dict)

	RNA_dict_info, Module_dict = Retrieve_rna_info(Root, Module_dict)

	Antisense_RNA_dict_info, Module_dict = Retrieve_antisense_rna_info(Root, Module_dict)

	Save_GMT_file(Module_dict, Filename)
	print "Done!"

print "You can find the resulting GMT files in the folder: "+gmt_folder

print "\n"