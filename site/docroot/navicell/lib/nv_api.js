/**
 * Eric Viara (Sysra), $Id$
 *
 * Copyright (C) 2013-2014 Curie Institute, 26 rue d'Ulm, 75005 Paris, France
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

// NaviCell API

var nv_open_bubble = false;
var nv_decoding = false;
var nv_cumul_error_cnt = 0;
var nv_last_proxy_error_ts = 0;
var nv_server_id = 0;
var nv_proxy_url = "";
var nv_demo_file = "demo/launch_demo";

// constants
var SERVER_TRACE = 1;
var NV_MAX_CUMUL_ERROR_CNT = 20;
var ESCAPE_LINE_BREAK = /\\n/g;
var ESCAPE_QUOTE = /\\"/g;
var ESCAPE_TAB = /\\t/g;

// Export Image function
//

function nv_export_image_enable()
{
	console.log("nv_export_image_enable");
	$("#export_image").css("display", "block");
}

function nv_export_image_set_maxsize(size)
{
	EXPORT_IMAGE_MAX_WIDTH = size;
}

function nv_export_image_set_full_map(full_map)
{
	EXPORT_IMAGE_FULL_MAP = full_map;
}

// Utility functions
function add_to_datatable_desc_list(dt_desc_list, data) {
	var lines = data.split(LINE_BREAK_REGEX);
	for (var ii = 0; ii < lines.length; ++ii) {
		var args = lines[ii].trim().split("\t");
		if (args.length != 3) {
			continue;
		}
		dt_desc_list.push({url: args[0], name: args[1], type: args[2]}); 
	}
}

function get_datatable_desc_list(type, name, file_elem, url, dt_desc_list, async) {
	var ready = $.Deferred();
	if (type == DATATABLE_LIST) {
		if (url) {
			$.ajax(url,
			       {
				       async: async,
				       dataType: 'text',
				       success: function(data) {
					       add_to_datatable_desc_list(dt_desc_list, data);
					       ready.resolve();
				       },
				       
				       error: function() {
					       ready.resolve();
				       }
			       }
			      );
		} else {
			var reader = new FileReader();
			reader.readAsBinaryString(file_elem);
			reader.onload = function() { 
				var data = reader.result;
				add_to_datatable_desc_list(dt_desc_list, data);
				ready.resolve();
			}
			reader.onerror = function() {
				ready.resolve();
			}
		}
	} else {
		dt_desc_list.push({type: type, name: name, file_elem: file_elem, url: url});
		ready.resolve();
	}
	return ready;
}

function nv_win(win)
{
	if (!win) {
		return window;
	}
	if (typeof win == "string") {
		// in this case, win is module
		return get_win(win);
	}
	return win;
}

// API

function nv_open_module(win, module_id, ids)
{
	console.log("module: [" + module_id + "] " + ids.length);
	if (module_id.match("{{[a-zA-Z0-9_]*}}")) {
		console.log("module match regex calling getMapURL");
		module_id = navicell.mapdata.getMapURL(module_id);
	}

	var url;
	if (module_id.match('/index.html')) {
		url = module_id;
	} else if (module_id.match('/index.php')) { // EV: 2017-05-26
		var ids_arg = ids ? JSON.stringify(ids) : "";
		url = module_id + (ids_arg ? "?show_ids=" + ids_arg : "");
	} else {
		var module = navicell.mapdata.getModuleDescriptions()[module_id];
		if (!module) {
			throw "module " + module_id + " not found";
		}
		url = module.url ? module.url : module_id;
	}
	console.log("-> show_map_and_markers(url=" + url + ", ids=" + ids + ")");
	win.show_map_and_markers(url, ids ? ids : []);
	return null;
}

function nv_get_command_history(win)
{
	return $("#command-history", win.document).val();
}

// ------------------------------------------------------------------------------------------------------
// nv_find_entities
//
// @params
//
//    win: window
//    search: search string
//
// @example
//
//    nv_find_entities(window, "AK.*");
// ------------------------------------------------------------------------------------------------------

function nv_notice_perform(win, command, header, msg, position, width, height, commands, ok_name)
{
	win = nv_win(win);
	//console.log("notice [" + commands + "] [" + ok_name + "]");
	if (command == "set_message_and_open") {
		win.notice_dialog(header, msg, win, position, width, height, commands, ok_name);
	} else if (command == "open") {
		open_info_dialog(win);
	} else if (command == "close") {
		close_info_dialog(win);
	} else {
		throw "nv_notice_perform: unknown command \"" + command + "\"";
	}
}

function nv_find_entities(win, search, open_bubble)
{
	win = nv_win(win);
	navicell.mapdata.findJXTree(win, search, false, 'subtree', {div: $("#result_tree_contents", win.document).get(0)}, open_bubble);
	$("#right_tabs", win.document).tabs("option", "active", 1);
	return null;
	// Two problems:
	// 1. bubble contents is not sync with search (=> deferred)
	// 2. contents is often too large, need POST data to be sliced into packets
	//return navicell.mapdata.getBubbleContents(get_module(win));
}

function nv_select_entity(win, id, mode, center, clicked_boundbox, was_checked)
{
	win = nv_win(win);
	var module = get_module(win);
	var jxtree = navicell.mapdata.getJXTree(module);
	var node = jxtree.getNodeByUserId(id);
	if (node) {
		win.click_node(win.overlay, node, mode, center, clicked_boundbox, was_checked);
	}
	return null;
}

function nv_set_zoom(win, zoom)
{
	win = nv_win(win);
	win.map.setZoom(zoom);
	return null;
}

function nv_uncheck_all_entities(win)
{
	win = nv_win(win);
	win.uncheck_all_entities(win);
	$("#result_tree_header", win.document).html("");
	$("#right_tabs", win.document).tabs("option", "active", 0);
	return null;
}

function nv_unhighlight_all_entities(win)
{
	win = nv_win(win);
	var module = get_module(win);
	if (win.overlay && win.overlay.hasHighlight()) {
		win.overlay.unhighlight();
		win.overlay.draw(module);
	}
	return null;
}

function nv_set_center(win, where, lng, lat)
{
	var map = win.map;
	//console.log("nv_set_center " + lng + " " + lat);

	var center = map.getCenter();
	var scrolled_center;

	where = where.trim().toUpperCase();

	if (where == "MAP_CENTER") { // should be MAP_CENTER
		scrolled_center = win.map_ori_center;
	} else if (where == "MAP_WEST") { // MAP_WEST_CENTER
		scrolled_center = new google.maps.LatLng(win.map_ori_center.lat(), win.map_ori_bounds.getNorthEast().lng());
	} else if (where == "MAP_EAST") {
		scrolled_center = new google.maps.LatLng(win.map_ori_center.lat(), win.map_ori_bounds.getSouthWest().lng());
	} else if (where == "MAP_SOUTH") {
		scrolled_center = new google.maps.LatLng(win.map_ori_bounds.getNorthEast().lat(), win.map_ori_center.lng());
	} else if (where == "MAP_NORTH") {
		scrolled_center = new google.maps.LatLng(win.map_ori_bounds.getSouthWest().lat(), win.map_ori_center.lng());
	} else if (where == "MAP_SOUTH_WEST") {
		scrolled_center = win.map_ori_bounds.getNorthEast();
	} else if (where == "MAP_NORTH_EAST") {
		scrolled_center = win.map_ori_bounds.getSouthWest();
	} else if (where == "MAP_SOUTH_EAST") {
		scrolled_center = new google.maps.LatLng(win.map_ori_bounds.getNorthEast().lat(), win.map_ori_bounds.getSouthWest().lng());
	} else if (where == "MAP_NORTH_WEST") {
		scrolled_center = new google.maps.LatLng(win.map_ori_bounds.getSouthWest().lat(), win.map_ori_bounds.getNorthEast().lng()); 
	} else if ((where == "RELATIVE") && typeof lng == "number" && typeof lat == "number") {
		scrolled_center = new google.maps.LatLng(center.lat()+lat, center.lng()+lng, true);
	} else if ((where == "ABSOLUTE") && typeof lng == "number" && typeof lat == "number") {
		scrolled_center = new google.maps.LatLng(lat, lng, true);
	} else if ((where == "ABSOLUTE_LEGACY") && typeof lng == "number" && typeof lat == "number") {
		scrolled_center = new google.maps.LatLng(lat, lng, true);
		var projection = win.map.getProjection();
		var p = projection.fromLatLngToPoint_legacy(scrolled_center);
		scrolled_center = projection.fromPointToLatLng(p);
	} else {
		if (lat) {
			throw "nv_set_center: unknown directive \"" + where + ", " + lng + "," + lat + "\"";
		}
		throw "nv_set_center: unknown directive \"" + where + "\"";
	}

	if (scrolled_center != null) {
		map.setCenter(scrolled_center);
		//console.log("has scrolled to center [" + scrolled_center + "]");
	}
	return null;
}

// ------------------------------------------------------------------------------------------------------------------
// nv_import_datatables
//
// @params
//   win: window
//   type: datatable type
//   name: datatable name
//   file_elem: file element coming from a file dialog
//   url: URL
//   params: parameters
//
// @examples
//
//    nv_import_datatables(window, "Protein expression data", "BAF", null, "file:///bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/CCL_BAF.txt");
//    nv_import_datatables(window, "Discrete Copy number data", "CopyNumber", null, "file:///bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/CCL_CopyNumber.txt");
//    nv_import_datatables(window, "Protein expression data", "Expression", null, "file:///bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/CCL_Expression_neg.txt");
// OR:
// navicell launched from file://
//    nv_import_datatables(window, "Datatable list", "", null, "file:///bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/datatable_list.txt");
// navicell launched from http://
//    nv_import_datatables(window, "Datatable list", "", null, "http://navicell-dev2.curie.fr/nv2.1/cancer_cell_line_broad/datatable_list_url.txt");
//
// with params:
//    nv_import_datatables(window, "Datatable list", "", null, "file:///bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/datatable_list.txt", {import_display_markers: false, import_display_barplot: true});
//
// ------------------------------------------------------------------------------------------------------------------

function nv_is_ready(win)
{
	var module = get_module(win);
	return navicell.mapdata.isReady(module);
}

function nv_is_imported(win)
{
	try {
		console.log("is_imported: " + navicell.import_synchronizer.isReady());
	} catch(e) {
		console.log("WARNING 4: caugth " + e);
	}
	return navicell.import_synchronizer.isReady();
}

function nv_import_datatables(win, type, name, file_elem, url, params)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var dt_desc_list = [];
	var async = params && params.async != undefined && !nv_decoding ? params.async : false;
	var ready = get_datatable_desc_list(type, name, file_elem, url, dt_desc_list, async);

	var error_message = params ? params.error_message : null;
	var status_message = params ? params.status_message : null;

	//console.log("import_datatables: type=" + type + " name=" + name + " url=" + url);
	navicell.import_synchronizer.start(dt_desc_list.length, params ? params.wait_cursor_on : null, win);

	setTimeout(function() {
		ready.then(function() {
			try {
				var msg_cnt = 0;
				if (!dt_desc_list.length) {
					if (error_message) {
						error_message("No Datatables Imported");
					} else {
						throw "nv_import_datatables error: No Datatables Imported";
					}
					return;
				}
				for (var idx in dt_desc_list) {
					var dt_desc = dt_desc_list[idx];
					var datatable = navicell.dataset.readDatatable(dt_desc.type, dt_desc.name, dt_desc.file_elem, dt_desc.url, win, async);
					if (datatable.error) {
						var error_str = "<div align='center'><span style='text-align: center; font-weight: bold'>Import Failed</span></div>";
						error_str += "<table>";
						error_str += "<tr><td>Datatable</td><td>" + dt_desc.name + "</td></tr>";
						error_str += "<tr><td>Error</td><td>" + datatable.error + "</td></tr>";
						error_str += "</table>";
						if (error_message) {
							error_message(error_str, msg_cnt++);
						} else {
							throw "nv_import_datatables error: datatable " + dt_desc.name + ": " + datatable.error;
						}
					} else {
						datatable.ready.then(function(my_datatable) {
							try {
								if (my_datatable.error) {
									var error_str = "<div align='center'><span style='text-align: center; font-weight: bold'>Import Failed</span></div>";
									error_str += "<table>";
									error_str += "<tr><td>Datatable</td><td>" + my_datatable.name + "</td></tr>";
									error_str += "<tr><td>Error</td><td>" + my_datatable.error + "</td></tr>";
									error_str += "</table>";
									if (error_message) {
										error_message(error_str, msg_cnt++);
									} else {
										throw "nv_import_datatables error: " + error_str;
									}
								} else {
									var status_str = "<div align='center'><span style='text-align: center; font-weight: bold'>Import Successful</span></div>";
									status_str += "<table>";
									status_str += "<tr><td>Datatable</td><td>" + my_datatable.name + "</td></tr>";
									status_str += "<tr><td>Samples</td><td>" + my_datatable.getSampleCount() + "</td></tr>\n";
									var opener = win;
									var nnn = 0;
									while (opener) {
										try {
											if (!opener.document.map_name) {
												break;
											}
											//console.log("NOTICE 3: OK cross origin opener: " + opener.location.protocol + "//" + opener.location.host + " (current window: " + window.location.protocol + "//" + window.location.host + ")");
											status_str += "<tr><td>Genes mapped on " + opener.document.map_name + "</td><td>" + my_datatable.getGeneCountPerModule(opener.document.map_name) + "</td></tr>";
										}
										catch(e) {
											console.log("WARNING #3: cross origin problem ? caugth " + e);
										}
										opener = opener.opener;
										if (nnn++ > 4) {
											win.console.log("too many level of hierarchy !");
											break;
										}
									}
									/*
									while (opener && opener.document.map_name) {
										status_str += "<tr><td>Genes mapped on " + opener.document.map_name + "</td><td>" + my_datatable.getGeneCountPerModule(opener.document.map_name) + "</td></tr>";
										opener = opener.opener;
										if (nnn++ > 4) {
											win.console.log("too many level of hierarchy !");
											break;
										}
									}
									*/
									status_str += "</table>";
									if (status_message) {
										status_message(status_str, msg_cnt++);
									} else {
										win.console.log("nv_import_datatables notice: " + status_str);
									}
									navicell.annot_factory.refresh();
									var display_graphics = false;
									if (params) {
										if (params.import_display_barplot) {
											var barplotConfig = drawing_config.getEditingBarplotConfig();
											barplotConfig.setDatatableAt(0, datatable);
											if (params.open_drawing_editor) {
												$("#barplot_editing", win.document).html(EDITING_CONFIGURATION);
												$("#barplot_editor_div", win.document).dialog("open");
											} else {
												$("#drawing_config_chart_display", win.document).attr("checked", 'checked')
												$("#drawing_config_chart_type", win.document).val('Barplot');
												drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
												barplot_sample_action('all_samples', DEF_OVERVIEW_BARPLOT_SAMPLE_CNT);
												
												barplot_editor_apply(drawing_config.getBarplotConfig());
												barplot_editor_apply(drawing_config.getEditingBarplotConfig());
												barplot_editor_set_editing(false);

												max_barplot_sample_cnt = DEF_MAX_BARPLOT_SAMPLE_CNT;

												display_graphics = true;
											}
										} else if (params.import_display_heatmap) {
											var heatmapConfig = drawing_config.getEditingHeatmapConfig();
											var datatable_cnt = mapSize(navicell.dataset.datatables);
											for (var idx = 0; idx < datatable_cnt; ++idx) {
												if (!heatmapConfig.getDatatableAt(idx)) {
													break;
												}
											}
											heatmapConfig.setDatatableAt(idx, datatable);
											if (params.open_drawing_editor) {
												$("#heatmap_editing", win.document).html(EDITING_CONFIGURATION);
												$("#heatmap_editor_div", win.document).dialog("open");
											} else {
												$("#drawing_config_chart_display", win.document).attr("checked", 'checked')
												$("#drawing_config_chart_type", win.document).val('Heatmap');
												drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
												if (!drawing_config.getHeatmapConfig().getSampleOrGroupCount()) {
													win.heatmap_sample_action_perform('all_samples', DEF_OVERVIEW_HEATMAP_SAMPLE_CNT);
												} else {
													win.heatmap_sample_action_perform('pass');
												}

												win.heatmap_editor_apply(drawing_config.getHeatmapConfig());
												win.heatmap_editor_apply(drawing_config.getEditingHeatmapConfig());
												win.heatmap_editor_set_editing(false);

												win.max_heatmap_sample_cnt = DEF_MAX_HEATMAP_SAMPLE_CNT;

												display_graphics = true;
											}
										} else {
											display_graphics = false;
										}

									}
									var display_markers = params ? params.import_display_markers : true;
									my_datatable.display(win.document.navicell_module_name, win, display_graphics, display_markers);
									drawing_editing(false);
									update_status_tables();
								}
							} catch(e) {
								navicell.import_synchronizer.setError(e.toString());
							}
						});
					}
					navicell.import_synchronizer.success();
				}
			} catch(e) {
				navicell.import_synchronizer.setError(e.toString());
			}
		})}, DISPLAY_TIMEOUT*1); // *10 for testing
	return null;
}

function nv_prepare_import_dialog(win, filename, name, type)
{
	var doc = win.document;
	$("#dt_import_file_message", doc).css("display", "block");
	$("#dt_import_file_message", doc).html("The file '" + filename + "' has been sent by NV client, please import it:");
	$("#dt_import_type", doc).val(type);
	$("#dt_import_name", doc).val(name);
	$("#dt_import_dialog", doc ).dialog("open");
	return null;
}

function nv_get_module_list(win)
{
	var module_names = [];
	var module_descriptions = navicell.mapdata.getModuleDescriptions();
	for (var module_id in module_descriptions) {
		var module = module_descriptions[module_id];
		module_names.push({id: module.id, name: module.name, url: module.url});
	}
	return module_names;
}

function nv_get_datatable_list(win)
{
	var ret_datatables = [];
	var datatables = navicell.dataset.getDatatables();
	for (var name in datatables) {
		var datatable = datatables[name];
		ret_datatables.push([datatable.name, datatable.biotype.name]);
	}
	return ret_datatables;
}

function nv_get_datatable_gene_list(win)
{
	return navicell.dataset.getSortedGeneNames();
}

function nv_get_datatable_sample_list(win)
{
	var sample_names = [];
	for (var sample_name in navicell.dataset.getSamples()) {
		sample_names.push(sample_name);
	}
	return sample_names;
}

function nv_get_hugo_list(win)
{
	return navicell.mapdata.getHugoNames();
}

function nv_get_biotype_list(win)
{
	var ret_biotypes = [];
	var biotypes = navicell.biotype_factory.getBiotypes();
	for (biotype_name in biotypes) {
		var biotype = biotypes[biotype_name];
		ret_biotypes.push({name: biotype_name, type: biotype.type.getTypeString(), subtype: biotype.type.getSubtypeString()});
	}
	return ret_biotypes;
}

function _nv_get_datatable_tag(arg)
{
	var is_datatable_num = arg[0] == '#'
	if (is_datatable_num || !is_int(arg)) {
		var selected_datatable = (is_datatable_num ? parseInt(arg.substring(1)) : arg);
		var datatable_num = 1;
		var datatables = navicell.dataset.datatables;
		for (var datatable_name in navicell.dataset.datatables) {
			var datatable = datatables[datatable_name];
			if (selected_datatable == datatable_num || selected_datatable == datatable_name || selected_datatable == datatable.getCanonName()) {
				//return datatable.getId();
				return datatable.getCanonName();
			}
			datatable_num++;
		}
		return -1;
	}
	return arg;
}

function _nv_get_sample_tag(arg)
{
	var is_sample_num = arg[0] == '#'
	var selected_sample = (is_sample_num ? parseInt(arg.substring(1)) : arg);
	var group_names = get_group_names();
	for (var group_num in group_names) {
		var group_name = group_names[group_num];
		var group = navicell.group_factory.group_map[group_name];
		//var group_tag = "g_" + group.getId();
		var group_tag = "g_" + group.getCanonName();
		if (selected_sample == group_num || selected_sample == group_name || selected_sample == group_tag) {
			return group_tag;
		}
	}
	var sample_names = get_sample_names();
	for (var sample_num in sample_names) {
		var sample_name = sample_names[sample_num];
		var sample = navicell.dataset.samples[sample_name];
		//var sample_tag = "s_" + sample.getId();
		var sample_tag = "s_" + sample.getCanonName();
		if (selected_sample == sample_num || selected_sample == sample_name || selected_sample == sample_tag) {
			return sample_tag;
		}
	}
	return null;
}

function _nv_get_datatable(arg)
{
	var is_datatable_num = arg[0] == '#'
	var selected_datatable = (is_datatable_num ? parseInt(arg.substring(1)) : arg);
	var datatable_num = 1;
	var datatables = navicell.dataset.datatables;
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = datatables[datatable_name];
		if (is_datatable_num) {
			if (selected_datatable == datatable_num) {
				return datatable;
			}
		} else {
			if (selected_datatable == datatable_name || selected_datatable == datatable.getId()) {
				return datatable;
			}
		}
		datatable_num++;
	}
	return null;
}

function nv_display_continuous_config_perform(win, command, arg1, arg2, arg3, arg4, arg5)
{
	win = nv_win(win);
	var module = get_module(win);
	if (command == "open") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;
		var datatable = navicell.getDatatableByCanonName(datatable_id);
		datatable.showDisplayConfig_perform(doc, what);
		/*
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		div.dialog('open');
		*/
	} else if (command == "close") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		div.dialog('close');
	} else if (command == "apply_and_close") {
		nv_display_continuous_config_perform(win, 'apply', arg1, arg2);
		nv_display_continuous_config_perform(win, 'close', arg1, arg2);
	} else if (command == "cancel") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		displayConfig.update();
		DisplayContinuousConfig.setEditing(datatable_id, false, what, doc.win);
		div.dialog('close');
	} else if (command == "apply") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);
		var active = displayConfig.getActiveTab();
		var tabname = DisplayContinuousConfig.tabnames[active];

		var prev_value = datatable.minval;
		var error = 0;

		var step_cnt = displayConfig.getStepCount(what, tabname);
		if (displayConfig.has_empty_values) {
			step_cnt++;
		}

		var use_gradient = displayConfig.use_gradient[what];
		for (var idx = 0; idx < step_cnt; ++idx) {
			var value;
			if (step_cnt > 1 && idx == step_cnt-1 && !use_gradient) { // EV 2015-06-11
				value = datatable.maxval;
			} else {
				value = $("#step_value_" + what + '_' + datatable_id + "_" + idx, doc).val();
			}
			value *= 1.;
			if (value <= prev_value) {
				console.log("nv_display_continuous_config_perform error #2: " + value + " " + prev_value);
				error = 1;
				break;
			}
			prev_value = value;
		}
		
		if (!error) {
			for (var idx = 0; idx < step_cnt; ++idx) {
				var value;
				if (idx == step_cnt-1 && !use_gradient) {
					value = datatable.maxval;
				} else {
					var id = "#step_value_" + tabname + '_' + what + '_' + datatable_id + "_" + idx;
					value = $(id, doc).val();
					if (!value) {
						value = $(id, doc).text();
					}
				}
				var color = $("#step_config_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				var size = $("#step_size_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				var shape = $("#step_shape_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				displayConfig.setStepInfo(what, tabname, idx, value, color, size, shape);
			}
			DisplayContinuousConfig.setEditing(datatable_id, false, what, doc.win);
		}
		doc.win.clickmap_refresh(true);
		update_status_tables({no_sample_status_table: true, no_gene_status_table: true, no_module_status_table: true, no_datatable_status_table: true, no_group_status_table: true, no_sample_annot_table: true, doc: doc});
	} else if (command == "step_count_change") {
		var tabname = arg1;
		var config = arg2;
		var datatable_id = arg3;
		var step_cnt = arg4;
		DisplayContinuousConfig.stepCountChange(tabname, config, datatable_id, step_cnt, true);
	} else if (command == "set_sample_absval") {
		var config = arg1;
		var datatable_id = arg2;
		var checked = arg3;
		DisplayContinuousConfig.setSampleAbsval(config, datatable_id, checked, true);
	} else if (command == "set_sample_method") {
		var config = arg1;
		var datatable_id = arg2;
		var method = arg3;
		DisplayContinuousConfig.setSampleMethod(config, datatable_id, method, true);
	} else if (command == "set_group_method") {
		var config = arg1;
		var datatable_id = arg2;
		var method = arg3;
		DisplayContinuousConfig.setGroupMethod(config, datatable_id, method, true);
/*
	} else if (command == "set_editing") {
		var datatable_id = arg1;
		var val = arg2;
		var config = arg3;
		DisplayContinuousConfig.setEditing(datatable_id, val, config, win, true);
*/

	} else if (command == "set_input_value") {
		/* 1.
		   command names must be homogeneous:
		   set_value_at
		   set_color_at
		   set_size_at
		   set_input_at
		   2. is config really necessary when setting color, size or shape ?
		   => yes, because of COLOR_SIZE configuration ? thought about that...
		*/
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var value = arg5;
		DisplayContinuousConfig.setInputValue(datatable_id, config, tabname, idx, value, true);
	} else if (command == "set_input_color") {
		var datatable_id = arg1;
		var config = arg2;
		/* TBD: config is useless as it must be color */
		var tabname = arg3;
		var idx = arg4;
		var color = arg5;
		DisplayContinuousConfig.setInputColor(datatable_id, config, tabname, idx, color, true);
	} else if (command == "set_select_size") {
		var datatable_id = arg1;
		/* TBD: config is useless as it must be size */
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var size = arg5;
		DisplayContinuousConfig.setSelectSize(datatable_id, config, tabname, idx, size, true);
	} else if (command == "set_select_shape") {
		var datatable_id = arg1;
		var config = arg2;
		/* TBD: config is useless as it must be shape */
		var tabname = arg3;
		var idx = arg4;
		var shape = arg5;
		DisplayContinuousConfig.setSelectShape(datatable_id, config, tabname, idx, shape, true);
	} else if (command == "switch_sample_tab") {
		var datatable_id = arg1;
		var config = arg2;
		DisplayContinuousConfig.switch_sample_tab(datatable_id, config, win.document, true);
	} else if (command == "switch_group_tab") {
		var datatable_id = arg1;
		var config = arg2;
		DisplayContinuousConfig.switch_group_tab(datatable_id, config, win.document, true);
	} else {
		throw "nv_display_continuous_config_perform: unknown command \"" + command + "\"";
	}
}

function nv_display_unordered_discrete_config_perform(win, command, arg1, arg2, arg3, arg4, arg5)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	if (command == "open") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		datatable.showDisplayConfig_perform(doc, what);
		/*
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		div.dialog('open');
		*/
	} else if (command == "close") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		div.dialog('close');
	} else if (command == "cancel") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);

		displayConfig.update();
		DisplayUnorderedDiscreteConfig.setEditing(datatable_id, false, what, doc.win);
		div.dialog('close');
	} else if (command == "apply_and_close") {
		nv_display_unordered_discrete_config_perform(win, 'apply', arg1, arg2);
		nv_display_unordered_discrete_config_perform(win, 'close', arg1, arg2);
	} else if (command == "apply") {
		var datatable_id = arg1;
		var what = arg2;
		var doc = win.document;

		var datatable = navicell.getDatatableByCanonName(datatable_id);
		var displayConfig = datatable.getDisplayConfig(module);
		var div = displayConfig.getDiv(what);
		var active = displayConfig.getActiveTab();
		var tabname = DisplayContinuousConfig.tabnames[active];

		var value_cnt = displayConfig.getValueCount();
		var is_group = tabname == 'group';
		if (is_group) {
			value_cnt++;
		}
		var advanced = is_group && displayConfig.advanced;
		for (var idx = 0; idx < value_cnt; ++idx) {
			var cond = $("#discrete_cond_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
			var color = $("#discrete_color_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
			var size = $("#discrete_size_"  + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
			var shape = $("#discrete_shape_"  + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
			if (is_group && !advanced && idx > 0) {idx = value_cnt-1;}
			displayConfig.setValueInfo(what, tabname, idx, color, size, shape, cond);
		}
		DisplayUnorderedDiscreteConfig.setEditing(datatable_id, false, what, doc.win);
		doc.win.clickmap_refresh(true);
		update_status_tables({no_sample_status_table: true, no_gene_status_table: true, no_module_status_table: true, no_datatable_status_table: true, no_group_status_table: true, no_sample_annot_table: true, doc: doc});
	} else if (command == "set_advanced_configuration") {
		var datatable_id = arg1;
		var config = arg2;
		var checked = arg3;
		DisplayUnorderedDiscreteConfig.setAdvancedConfiguration(datatable_id, config, checked, true);
	} else if (command == "set_discrete_value") {
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var value = arg5;
		DisplayUnorderedDiscreteConfig.setDiscreteValue(datatable_id, config, tabname, idx, value, true);
	} else if (command == "set_discrete_color") {
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var color = arg5;
		DisplayUnorderedDiscreteConfig.setDiscreteColor(datatable_id, config, tabname, idx, color, true);
	} else if (command == "set_discrete_size") {
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var size = arg5;
		DisplayUnorderedDiscreteConfig.setDiscreteSize(datatable_id, config, tabname, idx, size, true);
	} else if (command == "set_discrete_shape") {
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var shape = arg5;
		DisplayUnorderedDiscreteConfig.setDiscreteShape(datatable_id, config, tabname, idx, shape, true);
	} else if (command == "set_discrete_cond") {
		var datatable_id = arg1;
		var config = arg2;
		var tabname = arg3;
		var idx = arg4;
		var cond = arg5;
		DisplayUnorderedDiscreteConfig.setDiscreteCond(datatable_id, config, tabname, idx, cond, true);
	} else if (command == "switch_sample_tab") {
		var datatable_id = arg1;
		var config = arg2;
		DisplayUnorderedDiscreteConfig.switch_sample_tab(datatable_id, config, win.document, true);
	} else if (command == "switch_group_tab") {
		var datatable_id = arg1;
		var config = arg2;
		DisplayUnorderedDiscreteConfig.switch_group_tab(datatable_id, config, win.document, true);
	} else {
		throw "nv_display_unordered_discrete_config_perform: unknown command \"" + command + "\"";
	}
}

function nv_heatmap_editor_perform(win, command, arg1, arg2)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var heatmap_config = drawing_config.getHeatmapConfig();

	if (command == "open") {
		$("#heatmap_editor_div", win.document).dialog("open");
	} else if (command == "close") {
		$("#heatmap_editor_div", win.document).dialog("close");
	} else if (command == "apply_and_close") {
		nv_heatmap_editor_perform(win, "apply", arg1);
		nv_heatmap_editor_perform(win, "close");
	} else if (command == "select_datatable") {
		var idx = arg1;
		var datatable_tag = _nv_get_datatable_tag(arg2);
		$("#heatmap_editor_datatable_" + idx, win.document).val(datatable_tag);
		heatmap_editor_set_editing(true, idx, win.document.map_name);
	} else if (command == "select_sample") {
		var idx = arg1;
		var sample_tag = _nv_get_sample_tag(arg2);
		$("#heatmap_editor_gs_" + idx, win.document).val(sample_tag);
		heatmap_editor_set_editing(true, undefined, win.document.map_name);
	} else if (command == "apply") {
		var interactive = arg1;
		var msg = get_heatmap_config_message(true);
		if (msg) {
			if (interactive) {
				warning_dialog("Apply cannot be performed", msg, win);
			} else {
				throw "nv_heatmap_editor_perform: apply cannot be performed " + msg;
			}
			return;
		}
		$("#drawing_config_chart_type", win.document).val('Heatmap');
		drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());

		heatmap_editor_apply(drawing_config.getHeatmapConfig());
		heatmap_editor_apply(drawing_config.getEditingHeatmapConfig());
		drawing_config.getHeatmapConfig().shrink();
		drawing_config.getEditingHeatmapConfig().shrink();
		update_heatmap_editor(win.document);
		heatmap_editor_set_editing(false, undefined, win.document.map_name);
		$("#drawing_config_chart_display", win.document).attr("checked", true);
		$("#drawing_config_chart_type", win.document).val('Heatmap');
		drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
		drawing_config.apply(win);
	} else if (command == "clear_samples" || command == "all_samples" || command == "all_groups" || command == "from_barplot") {
		heatmap_sample_action_perform(command, 0, win);
	} else if (command == "set_transparency") {
		var value = arg1;
		heatmap_config.getSlider().slider("value", value);
		heatmap_config.setTransparency(value);
		$("#heatmap_editing", win.document).html(EDITING_CONFIGURATION);
	} else if (command == "cancel") {
		drawing_config.getEditingHeatmapConfig().cloneFrom(drawing_config.getHeatmapConfig());
		update_heatmap_editor(win.document);
		heatmap_editor_set_editing(false, undefined, win.document.map_name);
		$("#heatmap_editor_div", win.document).dialog("close");
	} else {
		throw "nv_heatmap_editor_perform: unknown command \"" + command + "\"";
	}
	// must add:
	// apply
	// cancel
	// select_sample

	// select_datatables (arg1 and arg2: array of same length expected)
	// select_samples (arg1 and arg2: array of same length expected)
	return null;
}

function nv_barplot_editor_perform(win, command, arg1, arg2)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var barplot_config = drawing_config.getBarplotConfig();

	if (command == "open") {
		$("#barplot_editor_div", win.document).dialog("open");
	} else if (command == "close") {
		$("#barplot_editor_div", win.document).dialog("close");
	} else if (command == "apply_and_close") {
		nv_barplot_editor_perform(win, "apply", arg1);
		nv_barplot_editor_perform(win, "close");
	} else if (command == "select_datatable") {
		var datatable_tag = _nv_get_datatable_tag(arg1);
		var idx = 0;
		$("#barplot_editor_datatable_" + idx, win.document).val(datatable_tag);
		barplot_editor_set_editing(true, idx);
	} else if (command == "select_sample") {
		var idx = arg1;
		var sample_tag = _nv_get_sample_tag(arg2);
		$("#barplot_editor_gs_" + idx, win.document).val(sample_tag);
		barplot_editor_set_editing(true, undefined);
	} else if (command == "apply") {
		var interactive = arg1;
		var msg = get_barplot_config_message(true);
		if (msg) {
			if (interactive) {
				warning_dialog("Apply cannot be performed", msg, win);
			} else {
				throw "nv_barplot_editor_perform: apply cannot be performed " + msg;
			}
			return;
		}
		$("#drawing_config_chart_type", win.document).val('Barplot');
		drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
		
		barplot_editor_apply(drawing_config.getBarplotConfig());
		
		barplot_editor_apply(drawing_config.getEditingBarplotConfig());
		drawing_config.getBarplotConfig().shrink();
		drawing_config.getEditingBarplotConfig().shrink();
		update_barplot_editor(win.document);
		barplot_editor_set_editing(false);
		$("#drawing_config_chart_display", win.document).attr("checked", true);
		$("#drawing_config_chart_type", win.document).val('Barplot');
		drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
		drawing_config.apply();
	} else if (command == "clear_samples" || command == "all_samples" || command == "all_groups" || command == "from_heatmap") {
		barplot_sample_action_perform(command, 0, win);
	} else if (command == "set_transparency") {
		var value = arg1;
		barplot_config.getSlider().slider("value", value);
		barplot_config.setTransparency(value);
		$("#barplot_editing", win.document).html(EDITING_CONFIGURATION);
	} else if (command == "cancel") {
		drawing_config.getEditingBarplotConfig().cloneFrom(drawing_config.getBarplotConfig());
		update_barplot_editor(win.document);
		barplot_editor_set_editing(false);
		$("#barplot_editor_div", win.document).dialog("close");
	} else {
		throw "nv_barplot_editor_perform: unknown command \"" + command + "\"";
	}
}

function nv_glyph_editor_perform(win, command, glyph_num, arg1, arg2)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var glyph_config = drawing_config.getGlyphConfig(glyph_num);

	if (command == "open") {
		$("#glyph_editor_div_" + glyph_num, win.document).dialog("open");
	} else if (command == "close") {
		$("#glyph_editor_div_" + glyph_num, win.document).dialog("close");
	} else if (command == "apply_and_close") {
		nv_glyph_editor_perform(win, "apply", glyph_num, arg1);
		nv_glyph_editor_perform(win, "close", glyph_num);
	} else if (command == "select_sample") {
		var sample_tag = _nv_get_sample_tag(arg1);
		$("#glyph_editor_gs_" + glyph_num, win.document).val(sample_tag);
		glyph_editor_set_editing(glyph_num, true, undefined);
	} else if (command == "select_datatable_shape") {
		var datatable_tag = _nv_get_datatable_tag(arg1);
		$("#glyph_editor_datatable_shape_" + glyph_num, win.document).val(datatable_tag);
		glyph_editor_set_editing(glyph_num, true, "shape");
	} else if (command == "select_datatable_color") {
		var datatable_tag = _nv_get_datatable_tag(arg1);
		$("#glyph_editor_datatable_color_" + glyph_num, win.document).val(datatable_tag);
		glyph_editor_set_editing(glyph_num, true, "color");
	} else if (command == "select_datatable_size") {
		var datatable_tag = _nv_get_datatable_tag(arg1);
		$("#glyph_editor_datatable_size_" + glyph_num, win.document).val(datatable_tag);
		glyph_editor_set_editing(glyph_num, true, "size");
	} else if (command == "set_transparency") {
		var value = arg1;
		glyph_config.getSlider().slider("value", value);
		glyph_config.setTransparency(value);
		$("#glyph_editing_" + glyph_num, win.document).html(EDITING_CONFIGURATION);
	} else if (command == "apply") {
		var interactive = arg1;
		var msg = get_glyph_config_message(glyph_num, true);
		if (msg) {
			if (interactive) {
				warning_dialog("Apply cannot be performed", msg, win);
			} else {
				throw "nv_glyph_editor_perform: apply cannot be performed " + msg;
			}
			return;
		}
		glyph_editor_apply(glyph_num, drawing_config.getGlyphConfig(glyph_num));
		glyph_editor_apply(glyph_num, drawing_config.getEditingGlyphConfig(glyph_num));
		update_glyph_editors(win.document);
		
		$("#drawing_config_glyph_display_" + glyph_num, win.document).attr("checked", true);
		drawing_config.setDisplayGlyphs(glyph_num, true);
		glyph_editor_set_editing(glyph_num, false);
		drawing_config.apply();
	} else if (command == "cancel") {
		drawing_config.getEditingGlyphConfig(glyph_num).cloneFrom(drawing_config.getGlyphConfig(glyph_num));
		update_glyph_editors(win.document);
		glyph_editor_set_editing(glyph_num, false);
		$("#glyph_editor_div_" + glyph_num, win.document).dialog("close");
	} else {
		throw "nv_glyph_editor_perform: unknown command \"" + command + "\"";
	}
	return null;
}

function nv_map_staining_editor_perform(win, command, arg1, arg2)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var map_staining_config = drawing_config.getMapStainingConfig();

	var map_staining_editor = $("#map_staining_editor_div", win.document);
	if (command == "open") {
		map_staining_editor.dialog("open");
	} else if (command == "close") {
		map_staining_editor.dialog("close");
	} else if (command == "apply_and_close") {
		nv_map_staining_editor_perform(win, "apply", arg1);
		nv_map_staining_editor_perform(win, "close");
	} else if (command == "select_datatable") {
		// TBD: action to be called from mouse event (update_map_staining_editor)
		var datatable_tag = _nv_get_datatable_tag(arg1);
		$("#map_staining_editor_datatable_color", win.document).val(datatable_tag);
		map_staining_editor_set_editing(true, "color", win.document.map_name);
	} else if (command == "select_sample") {
		// TBD: action to be called from mouse event (update_map_staining_editor)
		var sample_tag = _nv_get_sample_tag(arg1);
		$("#map_staining_editor_gs", win.document).val(sample_tag);
		map_staining_editor_set_editing(true, "color", win.document.map_name);
	} else if (command == "apply") {
		var interactive = arg1;
		var msg = get_map_staining_config_message(true);
		if (msg) {
			if (interactive) {
				warning_dialog("Apply cannot be performed", msg, win);
			} else {
				throw "nv_map_staining_editor_perform: apply cannot be performed " + msg;
			}
			return;
		}
		map_staining_editor_apply(drawing_config.getMapStainingConfig());
		map_staining_editor_apply(drawing_config.getEditingMapStainingConfig());
		update_map_staining_editor(win.document);
		$("#drawing_config_map_staining_display").attr("checked", true);
		drawing_config.setDisplayMapStaining(true);
		navicell.getMapTypes(module).setMapTypeByMapStaining(true);
		map_staining_editor_set_editing(false, "color", win.document.map_name);
		drawing_config.apply(win);
	} else if (command == "set_transparency") {
		// TBD: action to be called from mouse event (update_map_staining_editor)
		var value = arg1;
		map_staining_config.getSlider().slider("value", value);
		map_staining_config.setTransparency(value);
		$("#map_staining_editing", win.document).html(EDITING_CONFIGURATION);
	} else if (command == "cancel") {
		drawing_config.getEditingMapStainingConfig().cloneFrom(drawing_config.getMapStainingConfig());
		update_map_staining_editor(win.document);
		map_staining_editor_set_editing(false, "color", win.document.map_name);
		map_staining_editor.dialog("close");
	} else {
		throw "nv_map_staining_editor_perform: unknown command \"" + command + "\"";
	}
}

function nv_drawing_config_perform(win, command, arg1, arg2)
{
	win = nv_win(win);
	var module = get_module(win);
	var drawing_config = navicell.getDrawingConfig(module);
	var drawing_config_dialog = $("#drawing_config_div", win.document);

	if (command == "open") {
		drawing_config_dialog.dialog("open");
	} else if (command == "close") {
		drawing_config_dialog.dialog("close");
	} else if (command == "apply_and_close") {
		nv_drawing_config_perform(win, "apply");
		nv_drawing_config_perform(win, "close");
	} else if (command == "select_heatmap") {
		// TBD: action to be called from mouse event (onchange on drawing_config_map_char*)
		var checked = arg1;
		if (checked) {
			$("#drawing_config_chart_display", win.document).attr("checked", "checked");
			drawing_config.displayCharts(checked, "Heatmap");
			$("#drawing_config_chart_type", win.document).val(drawing_config.displayCharts());
		} else {
			$("#drawing_config_chart_display", win.document).removeAttr("checked");
		}
	} else if (command == "select_barplot") {
		// TBD: action to be called from mouse event (onchange on drawing_config_map_char*)
		var checked = arg1;
		if (checked) {
			drawing_config.displayCharts(checked, "Barplot");
			$("#drawing_config_chart_display", win.document).attr("checked", "checked");
			$("#drawing_config_chart_type", win.document).val(drawing_config.displayCharts());
		} else {
			$("#drawing_config_chart_display", win.document).removeAttr("checked");
		}
	} else if (command == "select_glyph") {
		// TBD: action to be called from mouse event (onchange on drawing_config_map_char*)
		var glyph_num = arg1;
		var checked = arg2;
		if (checked) {
			$("#drawing_config_glyph_display_" + glyph_num, win.document).attr("checked", "checked");
		} else {
			$("#drawing_config_glyph_display_" + glyph_num, win.document).removeAttr("checked");
		}
	} else if (command == "select_map_staining") {
		// TBD: action to be called from mouse event (onchange on drawing_config_map_staining_display)
		var checked = arg1;
		drawing_config.setDisplayMapStaining(checked);
		if (checked) {
			$("#drawing_config_map_staining_display", win.document).attr("checked", "checked");
		} else {
			$("#drawing_config_map_staining_display", win.document).removeAttr("checked");
		}
	} else if (command == "display_all_genes") {
		$("#drawing_config_display_all", win.document).attr("checked", "checked");
		$("#drawing_config_display_selected", win.document).removeAttr("checked");
	} else if (command == "display_selected_genes") {
		$("#drawing_config_display_all", win.document).removeAttr("checked");
		$("#drawing_config_display_selected", win.document).attr("checked", "checked");
	} else if (command == "apply") {
		drawing_config.setDisplayCharts($("#drawing_config_chart_display", win.document).attr("checked"), $("#drawing_config_chart_type", win.document).val());
		for (var num = 1; num <= GLYPH_COUNT; ++num) {
			drawing_config.setDisplayGlyphs(num, $("#drawing_config_glyph_display_" + num, win.document).attr("checked"));
		}
		var map_staining = $("#drawing_config_map_staining_display", win.document).attr("checked");
		drawing_config.setDisplayMapStaining(map_staining);
		navicell.getMapTypes(module).setMapTypeByMapStaining(map_staining);
		drawing_config.apply();
	} else if (command == "cancel") {
		if (drawing_config.displayCharts()) {
			$("#drawing_config_chart_display", win.document).attr("checked", "checked");
			$("#drawing_config_chart_type", win.document).val(drawing_config.displayCharts());
		} else {
			$("#drawing_config_chart_display", win.document).removeAttr("checked");
		}
		$("#drawing_config_old_marker", win.document).val(drawing_config.displayOldMarkers());
		for (var num = 1; num <= GLYPH_COUNT; ++num) {
			if (drawing_config.displayGlyphs(num)) {
				$("#drawing_config_glyph_display_" + num).attr("checked", "checked");
			} else {
				$("#drawing_config_glyph_display_" + num).removeAttr("checked");
			}
		}
		if (drawing_config.displayDLOsOnAllGenes()) {
			$("#drawing_config_display_all", win.document).attr("checked", "checked");
			$("#drawing_config_display_selected", win.document).removeAttr("checked");
		} else {
			$("#drawing_config_display_all", win.document).removeAttr("checked");
			$("#drawing_config_display_selected", win.document).attr("checked", "checked");
		}
		drawing_editing(false);
		drawing_config_dialog.dialog("close");
	} else {
		throw "nv_drawing_config_perform: unknown command \"" + command + "\"";
	}
}

/*
function _nv_datatable_config_build(win, div, datatable, what)
{
	if (div.built) {
		return;
	}
	//var datatable_id = datatable.getId();
	var datatable_id = datatable.getCanonName();
	var width;
	if (what == COLOR_SIZE_CONFIG) {
		width = datatable.biotype.isUnorderedDiscrete() ? 760 : 500;
	} else if (what == 'color') {
		width = datatable.biotype.isUnorderedDiscrete() ? 700 : 440;
	} else if (what == 'shape') {
		width = 400;
	} else {
		width = 400;
	}
	div.dialog({
		autoOpen: false,
		width: width,
		height: 670,
		modal: false,

		buttons: {
			"Apply": function() {
				nv_perform("nv_datatable_config_perform", win, "apply", datatable_id.toString(), what);
			},

			"Cancel": function() {
				nv_perform("nv_datatable_config_perform", win, "cancel", datatable_id.toString(), what);
			},
			"OK": function() {
				nv_perform("nv_datatable_config_perform", win, "apply_and_close", datatable_id.toString(), what);
			}
		}
	});
	div.built = true;
}

function nv_datatable_config_perform(win, command, dtarg, what, arg3)
{
	win = nv_win(win);
	var module = get_module(win);
	var datatable = _nv_get_datatable(dtarg);
	if (!datatable) {
		throw "nv_datatable_config_perform: unknown datatable \"" + dtarg + "\"";
	}

	var displayConfig = datatable.getDisplayConfig(module);
	if (!displayConfig) {
		throw "nv_datatable_config_perform: cannot find display config for datatable \"" + dtarg + "\"";
	}
	var div = displayConfig.getDiv(what);
	if (!div) {
		throw "nv_datatable_config_perform: cannot find display config for datatable \"" + dtarg + "\" and configuration \"" + what + "\"";
	}

	_nv_datatable_config_build(win, div, datatable, what);

	//var datatable_id = datatable.getId();
	var datatable_id = datatable.getCanonName();
	var doc = win.document;

	if (command == "open") {
		div.dialog("open");
	} else if (command == "close") {
		div.dialog("close");
	} else if (command == "apply_and_close") {
		nv_perform("nv_datatable_config_perform", win, "apply", datatable_id.toString(), what);
		nv_perform("nv_datatable_config_perform", win, "close", datatable_id.toString(), what);
	} else if (command == "apply") {
		var displayContinuousConfig = datatable.displayContinuousConfig[module];
		var displayUnorderedDiscreteConfig = datatable.displayUnorderedDiscreteConfig[module];
		//var active = div.tabs("option", "active");
		var active = displayConfig.getActiveTab();
		//console.log("Active3 == " + active);
		var tabname = DisplayContinuousConfig.tabnames[active];
		if (displayContinuousConfig) {
			var prev_value = datatable.minval;
			var error = 0;
			var step_cnt = displayContinuousConfig.getStepCount(what, tabname);
			if (displayContinuousConfig.has_empty_values) {
				step_cnt++;
			}
			var use_gradient = displayContinuousConfig.use_gradient[what];
			for (var idx = 0; idx < step_cnt; ++idx) {
				var value;
				if (idx == step_cnt-1 && !use_gradient) {
					value = datatable.maxval;
				} else {
					value = $("#step_value_" + what + '_' + datatable_id + "_" + idx, doc).val();
				}
				value *= 1.;
				if (value <= prev_value) {
					error = 1;
					break;
				}
				prev_value = value;
			}
			
			if (!error) {
				for (var idx = 0; idx < step_cnt; ++idx) {
					var value;
					if (idx == step_cnt-1 && !use_gradient) {
						value = datatable.maxval;
					} else {
						var id = "#step_value_" + tabname + '_' + what + '_' + datatable_id + "_" + idx;
						value = $(id, doc).val();
						if (value == undefined || value == '') {
							value = $(id, doc).text();
						}
					}
					var color = $("#step_config_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
					var size = $("#step_size_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
					var shape = $("#step_shape_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
					displayContinuousConfig.setStepInfo(what, tabname, idx, value, color, size, shape);
				}
				DisplayContinuousConfig.setEditing(datatable_id, false, what, win);
			}
		}
		if (displayUnorderedDiscreteConfig) {
			var value_cnt = displayUnorderedDiscreteConfig.getValueCount();
			if (tabname == 'group') {
				value_cnt++;
			}
			var advanced = displayUnorderedDiscreteConfig.advanced;
			for (var idx = 0; idx < value_cnt; ++idx) {
				var cond = $("#discrete_cond_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				var color = $("#discrete_color_" + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				var size = $("#discrete_size_"  + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				var shape = $("#discrete_shape_"  + tabname + '_' + what + '_' + datatable_id + "_" + idx, doc).val();
				if (!advanced && idx > 0) {idx = value_cnt-1;}
				displayUnorderedDiscreteConfig.setValueInfo(what, tabname, idx, color, size, shape, cond);
			}
			DisplayUnorderedDiscreteConfig.setEditing(datatable_id, false, what, win);
		}
		win.clickmap_refresh(true);
		update_status_tables({no_sample_status_table: true, no_gene_status_table: true, no_module_status_table: true, no_datatable_status_table: true, no_group_status_table: true, no_sample_annot_table: true, doc: doc});
	} else if (command == "cancel") {
		// Cancel does not currently work, but keep the following code.
		div.dialog('close');
	} else {
		throw "nv_datatable_config_perform: unknown command \"" + command + "\"";
	}
	return null;
}
*/

function nv_sample_annotation_perform(win, command, arg1, arg2, arg3)
{
	//console.log("nv_sample_annotation_perform [" + command + "]");
	win = nv_win(win);
	if (command == "open") {
		if (navicell.dataset.datatableCount()) {
			$("#dt_sample_annot", win.document).dialog("open");
		}
	} else if (command == "close") {
		$("#dt_sample_annot", win.document).dialog("close");
	} else if (command == "apply") {
		var annots = navicell.annot_factory.annots_per_name;
		var annot_ids = [];
		var checkeds = [];
		for (var annot_name in annots) {
			var annot = navicell.annot_factory.getAnnotation(annot_name, true);
			//var checkbox = $("#cb_annot_" + annot.id, win.document);
			var checkbox = $("#cb_annot_" + annot.getCanonName(), win.document);
			var checked = checkbox.attr("checked");
			
			annot_ids.push(annot.id);
			annot.setIsGroup(checked);
		}
		navicell.group_factory.buildGroups();
		update_status_tables({style_only: true, annot_ids: annot_ids, no_sample_status_table: true, no_gene_status_table: true, no_module_status_table: true, no_datatable_status_table: true});
		$("#dt_sample_annot_status", win.document).html("</br><span class=\"status-message\"><span style='font-weight: bold'>" + mapSize(navicell.group_factory.group_map) + "</span> groups of samples: groups are listed in My Data / Groups tab</span>");
		
		group_editing(false);
	} else if (command == "cancel") {
		var annots = navicell.annot_factory.annots_per_name;
		for (var annot_name in annots) {
			var annot = navicell.annot_factory.getAnnotation(annot_name);
			/*
			if (annot.isGroup()) {
				$("#cb_annot_" + annot.id, win.document).attr("checked", "checked");
			} else {
				$("#cb_annot_" + annot.id, win.document).removeAttr("checked");
			}
			*/
			if (annot.isGroup()) {
				$("#cb_annot_" + annot.getCanonName(), win.document).attr("checked", "checked");
			} else {
				$("#cb_annot_" + annot.getCanonName(), win.document).removeAttr("checked");
			}
		}
		group_editing(false);
	} else if (command == "import") {
		var url = arg1;
		var file = arg2;
		var data;
		console.log("import: " + url + " " + file + " " + data);
		if (url && url.match(/^@DATA\n/)) {
			data = url.substring(6);
			url = null;
		} else {
			data = null;
		}
		var interactive = arg3;
		var status = $("#dt_sample_annot_status", win.document);

		if (!url && !file && !data) {
			if (interactive) {
				error_dialog("Importing Sample Annotations", "no file neither url given", win);
				return;
			} else {
				throw "Importing Sample Annotations: no file neither url given";
			}
		}
		if (url && file) {
			if (interactive) {
				error_dialog("Importing Sample Annotations", "cannot specify both file and URL", win);
				return;
			} else {
				throw "Importing Sample Annotations: cannot specify both file and URL";
			}
		}
		navicell.import_synchronizer.start(1);
		try {
			if (url) {
				navicell.annot_factory.readurl(url);
			} else if (file) {
				navicell.annot_factory.readfile(file, function(file) {status.html("<span class=\"error-message\">Cannot read file " + file + "</span>");});
			} else {
				navicell.annot_factory.readdata(data);
			}
		} catch(e) {
			navicell.import_synchronizer.setError(e.toString());
		}
		navicell.annot_factory.ready.then(function() {
			var sample_file = $("#dt_sample_file");
			var sample_url = $("#dt_sample_url");
			var success = !navicell.annot_factory.error;
			if (success) {
				status.html("<span class=\"status-message\">" + navicell.annot_factory.sample_annotated + " samples annotated</span>");
			} else {
				var msg = "Missing samples: " + navicell.annot_factory.missing + "<br>No samples annotated, may be something wrong in the file.";
				status.html("<span class=\"error-message\">" + msg + "</span>");
				//navicell.import_synchronizer.setError(msg);
				navicell.import_synchronizer.setError(navicell.annot_factory.error);
			}
			sample_file.val("");
			if (navicell.annot_factory.sample_annotated) {
				update_status_tables({no_sample_status_table: true, no_gene_status_table: true, no_module_status_table: true, no_datatable_status_table: true});
			}
			if (success) {
				navicell.import_synchronizer.success();
			}
		});
	} else if (command == "select_annotation") {
		var annot_name = arg1;
		var checked = arg2;
		var annot = navicell.annot_factory.getAnnotationPerCanonName(annot_name);
		console.log("annotation selected: " + annot_name + " " + checked + " " + (annot ? annot.id : "null"));
		if (annot) {
			/*
			if (checked) {
				$("#cb_annot_" + annot.id, win.document).attr("checked", "checked");
			} else {
				$("#cb_annot_" + annot.id, win.document).removeAttr("checked");
			}
			*/
			if (checked) {
				$("#cb_annot_" + annot.getCanonName(), win.document).attr("checked", "checked");
			} else {
				$("#cb_annot_" + annot.getCanonName(), win.document).removeAttr("checked");
			}
		} else {
			throw "nv_sample_annotation_perform: annotation \"" + annot_name + "\" not found";
		}
	} else {
		throw "nv_sample_annotation_perform: unknown command \"" + command + "\"";
	}
	return null;
}

function nv_import_sample_annotations(win, arg1, arg2, arg3)
{
	return nv_sample_annotion_perform(win, "import", arg1, arg2, arg3);
}

function nv_mydata_perform(win, command, arg1, arg2)
{
	win = nv_win(win);
	if (command == "open") {
		if (navicell.dataset.datatableCount()) {
			$("#dt_status_tabs").dialog("open");
		}
	} else if (command == "close") {
		$("#dt_status_tabs").dialog("close");
	} else if (command == "select_datatables") {
		$("#dt_status_tabs").tabs("option", "active", 0);
	} else if (command == "select_samples") {
		$("#dt_status_tabs").tabs("option", "active", 1);
	} else if (command == "select_genes") {
		$("#dt_status_tabs").tabs("option", "active", 2);
	} else if (command == "select_groups") {
		$("#dt_status_tabs").tabs("option", "active", 3);
	} else if (command == "select_modules") {
		$("#dt_status_tabs").tabs("option", "active", 4);
	} else {
		throw "nv_mydata_perform: unknown command \"" + command + "\"";
	}
	return null;
}

// -------------------------------------------------------------------------------------------------------
// Server part, must be moved to [nv_]server.js
// -------------------------------------------------------------------------------------------------------

function nv_now()
{
	var date = new Date();
	var month = (date.getMonth()+1) + "";
	if (month.length == 1) {
		month = "0" + month;
	}
	var day = date.getDate() + "";
	if (day.length == 1) {
		day = "0" + day;
	}
	return {date: date.toLocaleTimeString() + " " + date.getFullYear() + "-" + month + "-" + day, timestamp: date.getTime()};
}

function nv_record(win, to_encode) {
	var history = $("#command-history", win.document).val();
	var now = to_encode.now;
	var cmd = to_encode.cmd;
	var last = cmd[cmd.length-1];
	$("#command-history", win.document).val((history ? history + "\n\n" : "") + cmd);
}

function nv_record_action(win, action, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
	nv_record(win, nv_encode_action(action, win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8));
}
 
var nv_handlers = {
	"nv_is_ready": nv_is_ready,

	"nv_open_module": nv_open_module,
	"nv_find_entities": nv_find_entities,
	"nv_select_entity": nv_select_entity,
	"nv_set_zoom": nv_set_zoom,
	"nv_uncheck_all_entities": nv_uncheck_all_entities,
	"nv_unhighlight_all_entities": nv_unhighlight_all_entities,
	"nv_set_center": nv_set_center,

	"nv_import_datatables": nv_import_datatables,
	"nv_import_sample_annotations": nv_import_sample_annotations,

	"nv_prepare_import_dialog": nv_prepare_import_dialog,
	"nv_mydata_perform": nv_mydata_perform,
	"nv_heatmap_editor_perform": nv_heatmap_editor_perform,
	"nv_barplot_editor_perform": nv_barplot_editor_perform,
	"nv_glyph_editor_perform": nv_glyph_editor_perform,
	"nv_map_staining_editor_perform": nv_map_staining_editor_perform,
	"nv_drawing_config_perform": nv_drawing_config_perform,
	"nv_sample_annotation_perform": nv_sample_annotation_perform,
//	"nv_datatable_config_perform": nv_datatable_config_perform,
	"nv_notice_perform": nv_notice_perform,

	"nv_is_imported": nv_is_imported,

	"nv_display_continuous_config_perform": nv_display_continuous_config_perform,
	"nv_display_unordered_discrete_config_perform": nv_display_unordered_discrete_config_perform,

	"nv_get_module_list": nv_get_module_list,
	"nv_get_datatable_list": nv_get_datatable_list,
	"nv_get_datatable_gene_list": nv_get_datatable_gene_list,
	"nv_get_datatable_sample_list": nv_get_datatable_sample_list,
	"nv_get_hugo_list": nv_get_hugo_list,
	"nv_get_biotype_list": nv_get_biotype_list,

	"nv_get_command_history": nv_get_command_history,
	"nv_execute_commands": nv_execute_commands
//	"nv_demo": nv_demo
};

function nv_perform(action_str, win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)
{
	var action = nv_handlers[action_str];
	if (!action) {
		win.console.log("nv_perform: error no action \"" + action_str + "\"");
		throw "nv_perform: error no action \"" + action_str + "\""
	}
	var ret = action(win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
	nv_record(win, nv_encode_action(action_str, win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8));
	return ret;
}

var nv_CMD_MARK = "@COMMAND";

function nv_push_arg(args, arg)
{
	/*if (arg != undefined) */ {
		args.push(arg);
	}
}

function nv_encode_data(data)
{
	return JSON.stringify(data);
}

function nv_encode_action(action_str, win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)
{
	var map = {};
	var args = [];
	nv_push_arg(args, arg1);
	nv_push_arg(args, arg2);
	nv_push_arg(args, arg3);
	nv_push_arg(args, arg4);
	nv_push_arg(args, arg5);
	nv_push_arg(args, arg6);
	nv_push_arg(args, arg7);
	nv_push_arg(args, arg8);
	var now = nv_now();
	map["action"] = action_str;
	map["module"] = get_module(win);
	map["args"] = args;
	map["timestamp"] = now.timestamp;
	return {now: now, cmd: nv_CMD_MARK + " " + JSON.stringify(map)};
}

function nv_rsp(url, data, msg_id) {
	if (!url) {
		return;
	}
	if (SERVER_TRACE) {
		console.log("NV Server: nv_rsp(" + url + ", " + data + ", " + msg_id + ")");
	}
	$.ajax(url,
	       {
		       async: false,
		       cache: false, // don't work without cache off
		       dataType: 'text',
		       type: 'POST',
		       data: {msg_id: msg_id, data: nv_encode_data(data)},
		       success: function(ret) {
			       if (SERVER_TRACE) {
				       console.log("NV Server: response has been succesfully sent [" + ret + "]");
			       }
		       },
		       
		       error: function(e) {
			       console.log("NV Server: sending response failure");
		       }
	       }
	      );
}

function nv_rcv_perform(rsp_url, cmd)
{
	var data = nv_decode(cmd);
	var rspdata = {status: 0, msg_id: data.msg_id, data: data.retdata == undefined ? false : data.retdata};
	
	if (SERVER_TRACE) {
		console.log("NV Server: returning data [" + rspdata.msg_id + "]");
	}
	nv_rsp(rsp_url, rspdata, data.msg_id);
}

function nv_generate_session(win, url) {
	$.ajax(url,
	       {
		       async: true,
		       cache: false, // don't work without cache off
		       dataType: 'text',
		       timeout: -1,
		       success: function(id) {
			       console.log("ID [" + id + "]");
			       nv_server(win, id);
		       }
	       });
}

function nv_init_session(win, url, id) {
	$.ajax(url,
	       {
		       async: true,
		       cache: false, // don't work without cache off
		       dataType: 'text',
		       timeout: -1,
		       success: function() {
			       console.log("ID [" + id + "]");
			       nv_server(win, id);
		       }
	       });
}

function nv_server_init(win, id, proxy_url)
{
	if (!proxy_url) {
		var href = win.location.href;
		var idx = href.lastIndexOf('/navicell/');
		proxy_url = href.substr(0, idx) + "/cgi-bin/nv_proxy.php";
	}
	nv_proxy_url = proxy_url;
	nv_server_id = id;
}

function nv_reset_session(win)
{
	if (!nv_server_id) {
		return;
	}
	var url = nv_proxy_url + "?mode=session&perform=reset&id=" + nv_server_id;
	$.ajax(url,
	       {
		       async: false,
		       cache: false, // don't work without cache off
		       dataType: 'text',
		       timeout: -1,
		       success: function(id) {
			       nv_server_id = 0;
		       }
	       });
}

function nv_check_proxy_errors(e) {
	var date = new Date();
	var last_proxy_error_ts = date.getTime()/1000;
	if (nv_last_proxy_error_ts && last_proxy_error_ts - nv_last_proxy_error_ts < 5) {
		return false;
	}
	nv_last_proxy_error_ts = last_proxy_error_ts;
	return true;
}

function nv_execute_commands(win, cmd, relurl) {
	if (cmd) {
		return win.nv_decode(cmd);
	}
	var href = win.location.href;
	var idx = href.lastIndexOf('/navicell/');
	var url = href.substr(0, idx) + '/navicell/' + relurl;
	//console.log("executing URL " + url);
	$.ajax(url,
	       {
		       async: false,
		       cache: false, // don't work without cache off
		       dataType: 'text',
		       success: function(cmd) {
			       //console.log("successfull [" + cmd + "]");
			       nv_execute_commands(win, cmd);
		       },
	       }
	      );
}

var MAX_COMMAND_DISPLAY_LENGTH = 350;
var MAX_COMMAND_DISPLAY_LENGTH_2 = MAX_COMMAND_DISPLAY_LENGTH/2;

function nv_manage_command(cmd, base_url, url) {
	if (SERVER_TRACE) {
		console.log("NV Server: received length [" + cmd.length + "]");
		if (cmd.length > MAX_COMMAND_DISPLAY_LENGTH) {
			console.log("NV Server: received [" + cmd.substring(0, MAX_COMMAND_DISPLAY_LENGTH_2) + " ... " + cmd.substring(cmd.length - MAX_COMMAND_DISPLAY_LENGTH_2) + "]");
		} else {
			console.log("NV Server: received [" + cmd + "]");
		}
	}
	if (cmd.length == 0) {
		nv_rcv(base_url, url);
		return;
	}
	var rsp_url = base_url + "&mode=srv2cli&perform=rsp";
	try {
		if (cmd.substring(0, 2) == '!!') {
			var dataurl = cmd.substring(2);
			$.ajax(dataurl,
			       {
				       async: false,
				       cache: false, // don't work without cache off
				       dataType: 'text',
				       success: function(cmd) {
					       nv_rcv_perform(rsp_url, cmd);
				       },
				       
				       error: function(e) {
					       nv_manage_error(e, base_url, url);
					       nv_rsp(rsp_url, {status: 1, data: "invalid URL " + dataurl}, -1);
				       }
			       }
			      );
		} else {
			nv_rcv_perform(rsp_url, cmd);
		}
		nv_cumul_error_cnt = 0;
	} catch(e) {
		nv_cumul_error_cnt++;
		var date = new Date();
		console.log("NV Server: got exception [" + e + "] at " + date.toDateString() + " " + date.toLocaleTimeString() + " while performing command " + cmd);
		nv_rsp(rsp_url, {status: 1, data: e.toString()}, -1);
	}
	if (nv_cumul_error_cnt > NV_MAX_CUMUL_ERROR_CNT) {
		console.log("NV Server: too many errors: exiting server mode");
		nv_server_id = 0;
	} else {
		nv_rcv(base_url, url);
	}
}

function nv_manage_error(e, base_url, url) {
	var rsp_url = base_url + "&mode=srv2cli&perform=rsp";
	var date = new Date();
	console.log("NV Server: got proxy exception [" + e.status + "] at " + date.toDateString() + " " + date.toLocaleTimeString());

	if (!nv_check_proxy_errors(e)) {
		console.log("NV Server: too many proxy errors: exiting server mode");
		nv_server_id = 0;
	} else {
		console.log("NV Server: proxy error detected (may be timeout): continue server mode");
		nv_rcv(base_url, url);
	}
}

function nv_rcv(base_url, url) {
	// as nv_rcv is called recursively, the ajax call is encapsulated in a timeout to avoid stack overflow
	setTimeout(function() {
		if (SERVER_TRACE) {
			console.log("NV Server: nv_rcv(" + url + ")");
		}
		$.ajax(url,
		       {
			       async: true,
			       cache: false, // don't work without cache off
			       dataType: 'text',
			       timeout: -1,
			       success: function(cmd) {
				       nv_manage_command(cmd.trim(), base_url, url);
			       },
			       
			       error: function(e) {
				       nv_manage_error(e, base_url, url);
			       }
		       }
		      )},
		   10);
}

function nv_server(win, id, proxy_url) {
	nv_server_init(win, id, proxy_url);
	//var href = win.location.href;
	//var idx = href.indexOf('/navicell/');
	try {
		if (id) {
			if (id.substr(0, 1) == "@") {
				id = id.substr(1);
				var url = nv_proxy_url + "?mode=session&perform=init&id=" + id;
				nv_init_session(win, url, id);
			} else {
				var base_url = nv_proxy_url + "?id=" + id;
				var url = base_url + "&mode=cli2srv&perform=rcv&block=on";
				nv_rcv(base_url, url);
			}
		} else {
			var url = nv_proxy_url + "?mode=session&perform=genid";
			nv_generate_session(win, url);
		}
	} catch(e) {
		console.log("NV Server: got exception at upper level [" + e.status + "] at " + date.toDateString() + " " + date.toLocaleTimeString() + ": exiting server mode");
	}
}

var COMMENT_REGEX = new RegExp("##.*(\r\n?|\n)", "g");

function nv_deferred_perform(win, timeout, action_str, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
	setTimeout(function() { // breaking closure
		nv_perform(action_str, win, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
	}, timeout);
}

function nv_eval(cmd)
{
	cmd = cmd.trim();
	if (cmd.substring(0, 3) == "nv_") {
		console.log("executing " + cmd);
		eval(cmd);
	} else {
		console.log("invalid command " + cmd);
	}
}

function nv_decode(str)
{
	var o_decoding = nv_decoding;
	nv_decoding = true;
	var ret = null;
	var msg_id = null;

	str = str.replace(COMMENT_REGEX, "");
	var action_arr = str.split(nv_CMD_MARK);
	for (var idx in action_arr) {
		var action = action_arr[idx].trim();
		if (action.length == 0) {
			continue;
		}
		var action_map = JSON.parse(action);
		var action_str = action_map.action;
		var module = action_map.module;
		var args = action_map.args;
		var win = module ? get_win(module) : window;
		var timeout = action_map.timeout;
		if (!win) {
			console.log("NV Server: nv_decode: unknown module " + module);
			throw "NV Server: nv_decode: unknown module " + module;
			//continue;
		}
		msg_id = action_map.msg_id;
		if (timeout) {
			nv_deferred_perform(win, timeout, action_str, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
		} else {
			ret = nv_perform(action_str, win, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
		}
	}

	nv_decoding = o_decoding;
	return {'msg_id': msg_id, retdata: ret};
}

/*
function nv_get_url(cmd)
{
	if (cmd.trim().length == 0) {
		return;
	}
	var url = window.location.href;
	var data = cmd.replace(COMMENT_REGEX, "").replace(LINE_BREAK_REGEX_G, "");
	var url = window.location.href;
	var idx = url.lastIndexOf('/');
	url = url.substr(0, idx);
	var geturl = url + "/index.php?command=" + escape(data);
	var posturl = url + "/launcher.php";
	var text = "GET URL<br/>" + geturl + "<br/><br/>" + "POST URL<br/>" + posturl + "<br/>POST data<br/>" + data;
	display_dialog("URL", "", text, window);
}
*/
