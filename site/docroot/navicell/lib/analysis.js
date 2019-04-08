/**
 * Eric Viara (Sysra), $Id$
 *
 * Copyright (C) 2013-2015 Curie Institute, 26 rue d'Ulm, 75005 Paris, France
 * 
 * NaviCell is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * NaviCell is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA
 */

var ANALYSIS_NUMBER_TYPE = 1;
var ANALYSIS_BOOL_TYPE = 2;
var ANALYSIS_SINGLE_LIST_TYPE = 3;
var ANALYSIS_MULTIPLE_LIST_TYPE = 4;
var ANALYSIS_SAMPLE_TYPE = 5;
var ANALYSIS_GROUP_TYPE = 6;
var ANALYSIS_SAMPLE_OR_GROUP_TYPE = 7;

var ANALYSIS_DATATABLE_INPUT_TYPE = 10;
var ANALYSIS_GET_METHOD = 100;
var ANALYSIS_POST_METHOD = 101;

var ANALYSIS_HTML_IN_TAB = 1000;

function Analysis(analysis_desc) {
	this.analysis_desc = analysis_desc;
	this.module_div = {}; // module_name -> dialog
	this._completeAndCheckDescription();
	Analysis.all_analysis.push(this);
}

Analysis.prototype = {

	getLabel: function() {
		return this.analysis_desc.label;
	},

	getId: function() {
		return this.analysis_desc.id;
	},

	_completeAndCheckDescription: function() {
		// check attributes: name, input, params, remote, output and parameter types
		// add id attribute
	},

	getSelection: function(win) {
		var doc = win.document;
		var select_map = {};
		var id = this.analysis_desc.id;
		for (var idx in this.analysis_desc.inputs) {
			var input_id = id + "_input_" + idx;
			select_map[input_id] = $("#" + input_id, doc).val();
		}
		for (var idx in this.analysis_desc.params) {
			var param = this.analysis_desc.params[idx];
			var param_id = id + "_param_" + idx;
			var param_obj = $("#" + param_id, doc);
			if (param.type == ANALYSIS_BOOL_TYPE) {
				select_map[param_id] = param_obj.attr("checked") == "checked";
			} else {
				select_map[param_id] = param_obj.val();
			}
		}
		return select_map;
	},
	
	_build_div: function(win, select_map) {
		var module = get_module(win);
		var doc = win.document;
		var id = this.analysis_desc.id;

		var html = "<div id='" + id + "' class='analysis_dialog' width='100%'>";
//		html += "<h4>" + this.analysis_desc.label + "</h4>";
		html += "<table cellpadding='5'>";
		for (var idx in this.analysis_desc.inputs) {
			var input = this.analysis_desc.inputs[idx];
			var input_id = id + "_input_" + idx;
			html += "<tr><td class='analysis-label'>" + input.label + "</td>";
			if (input.type == ANALYSIS_DATATABLE_INPUT_TYPE) {
				var input_id = id + "_input_" + idx;
				var sel_datatable = select_map ? navicell.getDatatableByCanonName(select_map[input_id]) : null;
				html += "<td><select id='" + input_id + "'>";
				html += select_datatable(sel_datatable);
			}
			html += "</select></td></tr>";

		}

		for (var idx in this.analysis_desc.params) {
			var param = this.analysis_desc.params[idx];
			html += "<tr><td class='analysis-label'>" + param.label + "</td>";
			html += "<td>";
			var type = param.type;
			var param_id = id + "_param_" + idx;
			var selected_val = (select_map ? select_map[param_id] : '');
			console.log(param.label + ": " + "selected_val: " + selected_val);
			if (type == ANALYSIS_NUMBER_TYPE) {
				if (!selected_val && param.default_value != undefined) {
					selected_val = param.default_value;
				}
				html += "<input type='text' id='" +  param_id + "' value='" + selected_val + "'></input>";
			} else if (type == ANALYSIS_BOOL_TYPE) {
				var checked = selected_val ? " checked" : "";
				html += "<input type='checkbox' id='" +  param_id + "'" +  checked + "></input>";
			} else if (type == ANALYSIS_SINGLE_LIST_TYPE) {
				var select = $("#" + param_id, doc);
				html += "<option value='_none_'>Select an item</option>\n";
				html += "<select id='" +  param_id + "'>";
				for (var item_value in param.list) {
					var item = param.list[item_value];
					var selected = selected_val ==  item_value ? " selected" : "";
					html += "<option value='" + item_value + "'" + selected + ">" + item + "</option>";
				}
				html += "</select>";
			} else if (type == ANALYSIS_SAMPLE_TYPE) {
				var select = $("#" + param_id, doc);
				html += "<select id='" +  param_id + "'>";
				html += "<option value='_none_'>Select a sample</option>\n";
				var sample_names = get_sample_names();
				for (var sample_idx in sample_names) {
					var sample_name = sample_names[sample_idx];
					var sample = navicell.dataset.samples[sample_name];
					var sample_value = "s_" + sample.getCanonName();
					var selected = selected_val == sample_value ? " selected" : "";
					html += "<option value='" + sample_value + "'" + selected + ">" + sample_name + "</option>";
				}
				html += "</select>";
			} else if (type == ANALYSIS_GROUP_TYPE) {
				html += "<select id='" +  param_id + "'>";
				html += "<option value='_none_'>Select a group</option>\n";
				var group_names = get_group_names();
				for (var group_idx in group_names) {
					var group_name = group_names[group_idx];
					var group = navicell.group_factory.group_map[group_name];
					var group_value = "g_" + group.getCanonName();
					var selected = selected_val == group_value ? " selected" : "";
					html += "<option value='" + group_value + "'>" + group.label + "</option>";
				}
				html += "</select>";
			} else if (type == ANALYSIS_SAMPLE_OR_GROUP_TYPE) {
				throw "building analysis dialog: not yet implemented \"" + type + "\"";
			} else {
				throw "building analysis dialog: unknown param type \"" + type + "\"";
			}
			html += "</td></tr>";
		}
		
		html += "</table>";
		html += "</div>";

		$('body', doc).append(html);
		var div = $("#" + id, doc);
		div.css("display", "none");
		this.module_div[module] = div;
		return div;
	},

	getDiv: function(win, select_map) {
		var module = get_module(win);
		if (!select_map) {
			var div = this.module_div[module];
			if (div) {
				return div;
			}
		}
		return this._build_div(win, select_map);
	},

	executeAnalysis: function(win) {
		var doc = win.document;
		var module = get_module(win);
		var id = this.analysis_desc.id;

		var input_val_arr = [];
		var param_val_arr = [];
		for (var idx in this.analysis_desc.inputs) {
			var input_id = id + "_input_" + idx;
			input_val_arr.push($("#" + input_id, doc).val());
		}
		for (var idx in this.analysis_desc.params) {
			var param = this.analysis_desc.params[idx];
			var param_id = id + "_param_" + idx;
			var param_obj = $("#" + param_id, doc);
			if (param.type == ANALYSIS_BOOL_TYPE) {
				param_val_arr.push(param_obj.attr("checked") == "checked");
			} else {
				param_val_arr.push(param_obj.val());
			}
		}
		var data = this.analysis_desc.remote.build_data(module, this.analysis_desc, input_val_arr, param_val_arr);
		if (!data) {
			return;
		}
		var url;
		var href = win.location.href;
		var idx = href.indexOf('/navicell/');
		var mode = this.analysis_desc.remote.mode;
		if (mode == "relative_to_base") {
			url = win.location.protocol + "//" + win.location.hostname + "/" + this.analysis_desc.remote.url;
		} else if (mode == "relative_to_navicell") {
			url = href.substr(0, idx) + '/' + this.analysis_desc.remote.url;
		} else if (mode == "absolute") {
			url = this.analysis_desc.remote.url;
		} else if (!mode || mode == "guess") {
			if (this.analysis_desc.remote.url.indexOf('https://') == 0 || this.analysis_desc.remote.url.indexOf('http://') == 0) {
				url = this.analysis_desc.remote.url;
			} else {
				url = href.substr(0, idx) + '/' + this.analysis_desc.remote.url;
			}
		} else {
			error_dialog(analysis_desc.label, "Bad URL mode [" + mode + "] " + this.analysis_desc.remote.url, win);
			return;
		}
		//console.log("data [" + data + "]");
		console.log("url [" + url + "]");
		$.ajax(url,
		       {
			       async: false,
			       cache: false, // don't work without cache off
			       dataType: 'text',
			       type: 'POST',
			       data: data,
			       success: function(html_ret) {
				       //console.log("execute: response has been succesfully sent [" + html_ret + "]");
				       var new_win = win.open();
				       var doc = new_win.document;
				       doc.title = "Gene Enrichment Analysis";
				       var html = "<h1>Gene Enrichment Analysis</h1>";
				       html += html_ret;
				       $('body', doc).append(html);
			       },
			       error: function(e) {
				       error_dialog(analysis_desc.label, "Response failure  [" + url + "] " + e.toString(), win);
				       console.log("execute: sending response failure " + e);
			       }
		       }
		      );
	}
};

Analysis.all_analysis = [];
Analysis.selected_analysis = null;

// analysis descriptions
var gene_enrichment_analysis_build_data = function(module, analysis_desc, input_val_arr, param_val_arr) {
	var data = '';
	for (var idx in input_val_arr) {
		var input = analysis_desc.inputs[idx];
		if (data.length) {
			data += '&';
		}
		var datatable = navicell.getDatatableByCanonName(input_val_arr[idx]);
		if (!datatable) {
			error_dialog(analysis_desc.label, "Datatable not specified", window);
			console.log("invalid datatable: " + input_val_arr[idx]);
			return null;
		}
		data += input.name + "=" + JSON.stringify(datatable.getGeneNames(module));
	}
	for (var idx in param_val_arr) {
		var param = analysis_desc.params[idx];
		if (data.length) {
			data += '&';
		}
		data += param.name + "=" + param_val_arr[idx];
		if (param.name == "background_set" && param_val_arr[idx] == "genes_on_map") {
			data += "&genes_on_map=" + JSON.stringify(navicell.mapdata.getHugoNames());
		}
	}
	var gene_module = {};
	var module_list = navicell.mapdata.getModuleList();
	for (var idx in module_list) {
		var module_name = module_list[idx];
		gene_module[module_name] = navicell.mapdata.getHugoNamesByModule(module_name);
	}
	data += "&gene_module=" + JSON.stringify(gene_module);
	return data;
}

var gene_enrichment_analysis_desc = {
	id: "gene_enrichment_analysis",
	label: "Gene Enrichment Analysis",
	inputs: [{
		name: "gene_list",
		label: "Gene List",
		type: ANALYSIS_DATATABLE_INPUT_TYPE
	}],
	params: [
		{name: "p_value",
		 label: "P-value Threshold",
		 type: ANALYSIS_NUMBER_TYPE,
		 default_value: "0.05"
		},
		{name: "background_set",
		 label: "Background Set",
		 type: ANALYSIS_SINGLE_LIST_TYPE,
		 list: {whole_genome: "Whole Genome", genes_on_map: "Genes on the Map"}
		},
		{name: "multiple_testing",
		 label: "Correction for Multiple Testing",
		 type: ANALYSIS_BOOL_TYPE
		}],
	remote: {
		mode: 'relative_to_base',
		url: 'cgi-bin/gene_enrichment_analysis.py',
		method: ANALYSIS_POST_METHOD,
		build_data: gene_enrichment_analysis_build_data
	},
	outputs: [{
		type: ANALYSIS_HTML_IN_TAB
	}]
};

			 
var find_diff_expr_genes_analysis_build_data = function(module, analysis) {
}

var find_diff_expr_genes_analysis_desc = {
	id: "find_diff_expr_genes",
	label: "Find Differentially Expressed Genes",
	inputs: [{
		name: "gene_list",
		label: "Gene List",
		type: ANALYSIS_DATATABLE_INPUT_TYPE
	}],
	params: [
		{name: "group_1",
		 label: "Sample Group 1",
		 type: ANALYSIS_GROUP_TYPE
		},
		{name: "group_2",
		 label: "Sample Group 2",
		 type: ANALYSIS_GROUP_TYPE
		},
		{name: "sample_test",
		 label: "Sample Test",
		 type: ANALYSIS_SAMPLE_TYPE
		},
		{name: "p_value",
		 label: "P-value",
		 type: ANALYSIS_NUMBER_TYPE
		},
		{name: "multiple_testing",
		 label: "Correction for multiple testing",
		 type: ANALYSIS_BOOL_TYPE
		}],
	remote: {
		url: "cgi-bin/find_diff_expr_gene_analysis.php", // relative URL
		method: ANALYSIS_POST_METHOD,
		build_data: find_diff_expr_genes_analysis_build_data
	},
	outputs: [{
		type: ANALYSIS_HTML_IN_TAB
	}]
};

			 
var gene_enrichment_analysis = new Analysis(gene_enrichment_analysis_desc);

//var find_diff_expr_genes_analysis = new Analysis(find_diff_expr_genes_analysis_desc);

// analysis management
function update_analysis_table(doc, params)
{
	console.log("update_analysis_table");
	var select_map_arr = [];
	for (var idx in Analysis.all_analysis) {
		var analysis = Analysis.all_analysis[idx];
		select_map_arr.push(analysis.getSelection(doc.win));
	}
	var div = $("#selected_analysis_panel", doc);
	div.children().remove();
	for (var idx in Analysis.all_analysis) {
		var analysis = Analysis.all_analysis[idx];
		var analysis_div = analysis.getDiv(doc.win, select_map_arr[idx]);
		div.append(analysis_div);
	}
	if (Analysis.selected_analysis) {
		Analysis.selected_analysis.getDiv(doc.win).css("display", "block");
	}
}

function nv_functional_analysis_perform(win)
{
	var doc = win.document;
	$("#analysis_dialog", doc).dialog("open");
}

function select_analysis(win) {
	var module = get_module(win);
	var select = $("#analysis_id", win.document);
	var selected = select.val();
	for (var idx in Analysis.all_analysis) {
		var analysis = Analysis.all_analysis[idx];
		var analysis_div = analysis.getDiv(window);
		if ("select_" + analysis.getId() != selected) {
			var analysis_div = analysis.getDiv(win);
			analysis_div.css("display", "none");
		} else {
			analysis_div.css("display", "block");
			Analysis.selected_analysis = analysis;
		}
	}
}


$(function() {
	var ANALYSIS_DIALOG_WIDTH = 480;
	var ANALYSIS_DIALOG_HEIGHT = 500;

	$("#analysis_dialog").dialog({
		autoOpen: false,
		width: get_dialog_width(ANALYSIS_DIALOG_WIDTH),
		height: get_dialog_height(ANALYSIS_DIALOG_HEIGHT),
		modal: false,
		buttons : {
			Cancel: function() {
				$(this).dialog("close");
			},
			Execute: function() {
				if (Analysis.selected_analysis) {
					Analysis.selected_analysis.executeAnalysis(window);
				}
				$(this).dialog("close");
			}
		}
	});
	var div = $("#selected_analysis_panel");
	var select = $("#analysis_id");
	var select_html = ""; // "<option value='_none_'>Select an analysis</option>";
	var selected_analysis = null;
	for (var idx in Analysis.all_analysis) {
		var analysis = Analysis.all_analysis[idx];
		var analysis_div = analysis.getDiv(window);
		div.append(analysis_div);
		if (idx == 0) {
			selected_analysis = analysis;
		}
		select_html += "<option value='select_" + analysis.getId() + "'>" + analysis.getLabel() + "</option>";
	}
	select.html(select_html);
	if (selected_analysis) {
		select.val("select_" + selected_analysis.getId());
		select_analysis(window);
	}
});

// testing in tab
function functional_analysis_test(win)
{
	console.log("Functional Analysis"); 
	var new_win = win.open();
	var doc = new_win.document;
	doc.title = "Gene Enrichment Analysis";
	var html = "<h1>Gene Enrichment Analysis</h1>";
	html += "<table border='1' cellspacing='0' cellpadding='2'>";
	html += "<tr><th>Modules</th><th>Names</th></tr>";
	for (var idx = 0; idx < 10; ++idx) {
		html += "<tr><td>Module " + idx + "</td><td>Name " + idx + "</td></tr>";
	}
	html += "</table>";
	$('body', doc).append(html);
}

