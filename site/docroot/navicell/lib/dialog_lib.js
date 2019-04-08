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

var CANCEL_CLOSES = true;

//var SEARCH_DIALOG_WIDTH = 450;
//var SEARCH_DIALOG_HEIGHT = 860;
var SEARCH_DIALOG_WIDTH = 480;
var SEARCH_DIALOG_HEIGHT = 900;
var IMPORT_DIALOG_WIDTH = 550;
var IMPORT_DIALOG_HEIGHT = 900;
var STATUS_TABS_WIDTH = 800;
var STATUS_TABS_HEIGHT = 680;
var DRAWING_CONFIG_WIDTH = 420;
var DRAWING_CONFIG_HEIGHT = 750;

var SAMPLE_ANNOT_WIDTH = 850;
var SAMPLE_ANNOT_HEIGHT = 950;

var HEATMAP_EDITOR_WIDTH = 850;
var HEATMAP_EDITOR_HEIGHT = 580;
var BARPLOT_EDITOR_WIDTH = 750;
var BARPLOT_EDITOR_HEIGHT = 600;
var GLYPH_EDITOR_WIDTH = 750;
var GLYPH_EDITOR_HEIGHT = 718;
var MAP_STAINING_EDITOR_WIDTH = 750;
var MAP_STAINING_EDITOR_HEIGHT = 660;
var COMMAND_DIALOG_WIDTH = 1030;
var COMMAND_DIALOG_HEIGHT = 770;

var DATATABLE_COLOR_SIZE_CONFIG_WIDTH_UNORDERED = 760;
var DATATABLE_COLOR_SIZE_CONFIG_WIDTH = 500;
var DATATABLE_COLOR_CONFIG_WIDTH_UNORDERED = 700;
var DATATABLE_COLOR_CONFIG_WIDTH = 440;
var DATATABLE_CONFIG_WIDTH = 400;
var DATATABLE_CONFIG_HEIGHT = 670;

var USE_MODIF_ID_FOR_COLORS = true;
//var USE_MODIF_ID_FOR_COLORS = false;
var DISPLAY_MODIF_ID = false;

function nv1() {
	$("#datatable_input").css("display", "none");
	$("#right_tabs").css("height", "100%");
}

function nv2() {
	$("#datatable_input").css("display", "block");
	$("#right_tabs").css("height", "59.5%");
}


function open_info_dialog(win)
{
	$("#info_dialog", win.document).dialog("open");
}

function close_info_dialog(win)
{
	$("#info_dialog", win.document).dialog("close");
}

function display_info_dialog(title, header, msg, win, position, width, height, command, ok_name)
{
	var dialog = $("#info_dialog", win.document);
	dialog.html("<br/>" + (header ? ("<div style='text-align: center; font-weight: bold'>" + header + "</div><br/>") : "") + "<div style='text-align: vertical-center; padding: 10px; margin: 10px'>" + "<br/>" + msg.replace(LINE_BREAK_REGEX_G, "<br/>") + "</div>");
	var lines = msg.split(LINE_BREAK_REGEX);
	var maxlen = 0;
	for (var ii = 0; ii < lines.length; ++ii) {
		if (lines[ii].length > maxlen) {
			maxlen = lines[ii].length;
		}
	}
	if (!width) {
		width = maxlen * 5;
		if (width < 400) {
			width = 400;
		} else if (width > 800) {
			width = 800;
		}
	}
	if (!height) {
		height = 50 + lines.length * 5;
		if (height < 300) {
			height = 300;
		} else if (height > 800) {
			height = 800;
		}
	}
	if (!ok_name) {
		ok_name = "OK";
	}
	//console.log("display+info_dialog [" + command + "]");
	if (command) {
		dialog.dialog({
			autoOpen: false,
			width: width,
			height: height,
			modal: false,
			title: title,
			buttons: [
				{
					text: "Cancel",
					click: function() {
						$(this).dialog("close");
					},
				},
				{
					text: ok_name,
					id: 'dialog_ok_button',
					click: function() {
						//var body = $('body', win.document);
						var wait_cursor = new WaitCursor(['#dialog_ok_button'], win);
						setTimeout(function() {
							nv_execute_commands(win, nv_CMD_MARK + ' ' + command);
							wait_cursor.restore();
						}, DISPLAY_TIMEOUT);
					}
				}
			]
		});
	} else {
		dialog.dialog({
			autoOpen: false,
			width: width,
			height: height,
			modal: false,
			title: title,
			buttons: [
				{
					text: ok_name,
					click: function() {
						$(this).dialog("close");
					}
				}
			]
		});
	}
	if (position) {
		dialog.dialog("option", "position", {my: position, at: position});
	}
	dialog.dialog("open");

	dialog.css("background", "white");
	dialog.parent().css("background", "white");
	dialog.next().css("background", "white");
}

function warning_dialog(header, msg, win)
{
	display_info_dialog('Warning', header, msg, win);
}

function error_dialog(header, msg, win)
{
	display_info_dialog('Error', header, "<span class=\"error-message\">" + msg + "</span>", win, 'center');
}

function notice_dialog(header, msg, win, position, width, height, command, ok_name)
{
	//display_info_dialog('Notice', header, msg, win, position, width, height, command, ok_name);
	display_info_dialog("Notice", header, msg, win, position, width, height, command, ok_name);
}

function get_dialog_width(width) {
	var window_width = window.innerWidth-100;
	return width > window_width ? window_width : width;
}

function get_dialog_height(height) {
	var window_height = window.innerHeight-100;
	return height > window_height ? window_height : height;
}

$(function() {
	$('body').append("<div id='foo'></div>");

	var OPEN_DRAWING_EDITOR = true;

	$("#right_tabs").tabs();

	function build_datatable_import_dialog() {
		var select = $("#dt_import_type_select");
		select.html(get_biotype_select("dt_import_type", true));
	}

	build_datatable_import_dialog();

	var name = $("#dt_import_name");
	var file = $("#dt_import_file");
	var url = $("#dt_import_url");
	var type = $("#dt_import_type");
	var status = $("#dt_import_status");
	var import_display_markers = $("#dt_import_display_markers");
	var import_display_barplot = $("#dt_import_display_barplot");
	var import_display_heatmap = $("#dt_import_display_heatmap");
	var sample_file = $("#dt_sample_file");
	var sample_url = $("#dt_sample_url");

	if (OPEN_DRAWING_EDITOR) {
		$("#display_heatmap").html("Display Heatmap (will open heatmap editor after import)");
		$("#display_barplot").html("Display Barplot (will open barplot editor after import)");
	} else {
		$("#display_heatmap").html("Display Heatmap (up to " +  DEF_OVERVIEW_HEATMAP_SAMPLE_CNT + " samples)");
		$("#display_barplot").html("Display Barplot (up to " +  DEF_OVERVIEW_BARPLOT_SAMPLE_CNT + " samples)");
	}

	var win = window;

	function error2_message(error, add) {
		var html = add ? status.html() + "<br/>" : "";
		warning_dialog("Loading data", html + "<span class=\"error-message\">" + error + "</span>", window);
	}

	function error_message(error, add) {
		var html = add ? status.html() + "<br/>" : "";
		status.html(html + "<span class=\"error-message\">" + error + "</span>");
	}

	function status_message(message, add) {
		var html = add ? status.html() + "<br/>" : "";
		status.html(html + "<span class=\"status-message\">" + message + "</span>");
	}

	$.contextMenu({
		selector: '#inner_map', 
		export_contextmenu_data: nv_set_contextmenu_data,
		width_offset: -450, // hard coded value: should depend on right_panel width
		callback: contextmenu_callback,
		items: {
			title:  {name: "&nbsp;", className: 'species-contextmenu-data-title'},
			sep0: "---------",
			center: {name: "Center on Species"},
			highlight: {name: "&nbsp;",
				    className: "species-contextmenu-highlight"
				   },
			sep: "---------",
			reaction_neighbours: {
				//name: "Reaction Graph Neighbours",
				name: "Show Neighbours",
				disabled: function(key, opt) {
					if (getOverlay()) {
						return getOverlay().RGN_select_entities.length == 1;
					}
				},
				className: 'context-menu',
				items: {
					interact_title: {
						name: "&nbsp;",
						className: "species-contextmenu-reaction-neighbours",
					},
					"sep3": "---------",
					reaction_select_highlight: {
						name: "Select and Highlight Neighbours",
						disabled: function(key, opt) {
							if (getOverlay()) {
								return getOverlay().RGN_select_entities.length == 1;
							}
						}
					},
					reaction_select: {
						name: "Select Neighbours",
						disabled: function(key, opt) {
							if (getOverlay()) {
								return getOverlay().RGN_select_entities.length == 1;
							}
						}
					}
				}
			},
			// EV: 2015-02-11: keep the following code
			/*
			sep2: "---------",
			interact_entities: {
				name: "Interacting Entities", 
				className: 'context-menu',
				items: {
					interact_title: {
						name: "&nbsp;",
						className: "species-contextmenu-interacting-entities",
					},
					"sep4": "---------",
					interact_select_highlight: {
						name: "Select and Highlight Entities",
						disabled: function(key, opt) {
							if (getOverlay()) {
								return getOverlay().IE_select_entities.length == 1;
							}
						}
					},
					interact_select: {
						name: "Select Entities",
						disabled: function(key, opt) {
							if (getOverlay()) {
								return getOverlay().IE_select_entities.length == 1;
							}
							return false;
						}
					}
				}
			}
			*/
		}
	});

	$("#search_dialog").dialog({
		autoOpen: false,
		width: get_dialog_width(SEARCH_DIALOG_WIDTH),
		height: get_dialog_height(SEARCH_DIALOG_HEIGHT),
		modal: false,
		buttons: {
			"Search": function() {
				var patterns = $("#search_dialog_patterns").val();
				var eq_all = $("#search_dialog_match_eq_all").attr("checked") == "checked";
				var eq_any = $("#search_dialog_match_eq_any").attr("checked") == "checked";
				var neq_any = $("#search_dialog_match_neq_any").attr("checked") == "checked";
				var neq_all = $("#search_dialog_match_neq_all").attr("checked") == "checked";
				var mode_word = $("#search_dialog_pattern_mode_word").attr("checked") == "checked";
				var mode_regex = $("#search_dialog_pattern_mode_regex").attr("checked") == "checked";
				var in_labels = $("#search_dialog_search_in_labels").attr("checked") == "checked";
				var in_tags = $("#search_dialog_search_in_tags").attr("checked") == "checked";
				var in_annots = $("#search_dialog_search_in_annots").attr("checked") == "checked";
				var in_all = $("#search_dialog_search_in_all").attr("checked") == "checked";
				var all_classes = $("#search_dialog_class_all").attr("checked") == "checked";
				var all_classes_but_included = $("#search_dialog_class_all_but_included").attr("checked") == "checked";
				var all_classes_included = $("#search_dialog_class_all_included").attr("checked") == "checked";
				var select_classes = $("#search_dialog_class_select").attr("checked") == "checked";
				var open_bubble = $("#search_dialog_open_bubble").attr("checked") == "checked";
				var highlight = $("#search_dialog_highlight").attr("checked") == "checked";
				var search = "";
				var op;

				if (eq_any || neq_any) {
					search = patterns.replace(new RegExp("[ \t\n;]+", "g"), ","); 
				} else if (eq_all || neq_all) {
					search = patterns.replace(new RegExp("[\t\n;,]+", "g"), " "); 
				}
				search += " /";
				if (eq_any || eq_all) {
					search += "op=eq;";
				} else {
					search += "op=neq;";
				}
				if (mode_word) {
					search += "token=word;"
				} else {
					search += "token=regex;"
				}
				$("#search_dialog_search_in :selected").each(function(i, selected) {
					search += "in=" + $(selected).val() + ";";
				});
									    
				if (highlight) {
					search += " highlight=on;";
				}
				
				if (all_classes) {
					search += "class=all"
				} else if (all_classes_but_included) {
					search += "class=all_but_included"
				} else if (all_classes_included) {
					search += "class=all_included"
				} else {
					$("#search_dialog_class_choose :selected").each(function(i, selected) {
						search += (i ? "," : "class=") + $(selected).val();
					});
				}
				nv_perform("nv_find_entities", window, search, open_bubble);
			},

			"OK": function() {
				$(this).dialog("close");
			}
		}
	});
	
	$("#dt_import_dialog").dialog({
		autoOpen: false,
		width: get_dialog_width(IMPORT_DIALOG_WIDTH),
		height: get_dialog_height(IMPORT_DIALOG_HEIGHT),
		modal: false,
		buttons: [ // 2015-06-11: added braket
			{
				text: "Import",
				id : "import_dialog_button",
				click : function() {
					var module = get_module();
					var drawing_config = navicell.getDrawingConfig(module);
					var error = "";
					if (!name.val() && type.val() != DATATABLE_LIST) {
						error = "Missing Name"
					}
					if (!file.val() && !url.val().trim()) {
						if (error) {
							error += ", ";
						} else {
							error = "Missing ";
						}
						error += "File or URL";
					}
					if (type.val() == "_none_") {
						if (error) {
							error += ", ";
						} else {
							error = "Missing ";
						}
						error += "Type";
					}
					if (file.val() && url.val().trim()) {
						if (error) {
							error += "<br/>";
						}
						error += "Cannot specify a File and an URL";
					}

					if (error) {
						error2_message(error);
						return;
					}

					$("#dt_import_file_message").css("display", "none");
					setTimeout(function() {
						error_message("");
						status_message("Importing...");
						var file_elem = (file ? file.get()[0].files[0] : null);
						nv_perform("nv_import_datatables", window, type.val().trim(), name.val().trim(), (file_elem == undefined ? "" : file_elem), url.val().trim(),
							   {status_message: status_message,
							    error_message: error2_message,
							    open_drawing_editor: true,
							    async: true,
							    import_display_markers: import_display_markers.attr('checked'),
							    import_display_barplot: import_display_barplot.attr('checked'),
							    import_display_heatmap: import_display_heatmap.attr('checked'),
							    wait_cursor_on: ['#import_dialog_button', '#import_clear_button', '#import_done_button']});
					}, DISPLAY_TIMEOUT);
				},
			},
			{
				text: "Clear",
				id: "import_clear_button",
				click: function() {
					// TBD:
					//nv_perform("nv_import_dialog_perform", window, "clear");
					name.val("");
					file.val("");
					url.val("");
					type.val("");
					status_message("");
				},
			},
			{
				text: "Done",
				id: "import_done_button",
				click: function() {
					// TBD:
					//nv_perform("nv_import_dialog_perform", window, "done");
					$(this).dialog('close');
				}
			}
		]
	});

	$("#dt_status_tabs").dialog({
		autoOpen: false,
		width: get_dialog_width(STATUS_TABS_WIDTH),
		height: get_dialog_height(STATUS_TABS_HEIGHT),
		modal: false
	});

	$("#drawing_config_div").dialog({
		autoOpen: false,
		width: get_dialog_width(DRAWING_CONFIG_WIDTH),
		height: get_dialog_height(DRAWING_CONFIG_HEIGHT),
		modal: false,

		buttons: {
			"Apply": function() {
				nv_perform("nv_drawing_config_perform", window, "apply");
			},

			"Cancel": function() {
				nv_perform("nv_drawing_config_perform", window, "cancel");
			},
			"OK": function() {
				nv_perform("nv_drawing_config_perform", window, "apply_and_close");
			}
		}
	});

	$("#import_dialog").button().click(function() {
		if (!OPEN_DRAWING_EDITOR) {
			var module = get_module();
			var drawing_config = navicell.getDrawingConfig(module);
			var heatmap_sample_cnt = drawing_config.getHeatmapConfig().getSampleOrGroupCount();
			if (heatmap_sample_cnt) {
				var cnt = heatmap_sample_cnt > DEF_OVERVIEW_HEATMAP_SAMPLE_CNT ? heatmap_sample_cnt : DEF_OVERVIEW_HEATMAP_SAMPLE_CNT;
				$("#display_heatmap").html("Display Heatmap (up to " +  cnt + " samples)");
			}
		}
		$("#dt_import_dialog").dialog("open");
		// TBD:
		//nv_perform("nv_import_dialog_perform", window, "open");
	});

	$("#dt_sample_annot").dialog({
		autoOpen: false,
		width: get_dialog_width(SAMPLE_ANNOT_WIDTH),
		height: get_dialog_height(SAMPLE_ANNOT_HEIGHT),
		modal: false,
		buttons: [
			{
				id: 'dt_sample_annot_apply',
				text: 'Apply',
				click: function() {
					nv_perform("nv_sample_annotation_perform", window, "apply", true);
				},
			},
			{
				id: 'dt_sample_annot_cancel',
				text: 'Cancel',
				click: function() {
					nv_perform("nv_sample_annotation_perform", window, "cancel");
				},

			},
			{
				id: 'dt_sample_annot_done',
				text: 'Done',
				click: function() {
					$(this).dialog("close");
				}
			}
		]

	});

	$("#import_annot_status").button().click(function() {
		// TBD: use nv_perform
		if (navicell.dataset.datatableCount()) {
			//$("#dt_sample_annot").dialog("open");
			nv_perform("nv_sample_annotation_perform", window, "open");
		}
	});

	$("#dt_status_tabs").tabs();

	$("#status_tabs").button().click(function() {
		if (navicell.dataset.datatableCount()) {
			nv_perform("nv_mydata_perform", window, "open");
			//$("#dt_status_tabs").dialog("open");
		}
	});

	$("#drawing_config").button().click(function() {
		if (navicell.dataset.datatableCount()) {
			//$("#drawing_config_div").dialog("open");
			nv_perform("nv_drawing_config_perform", window, "open");
		}
	});

        $("#export_image").button().click(function(){
                navicell_export_image(get_module());
        });

	$("#functional_analysis").button().click(function() {
		//if (true || navicell.dataset.datatableCount()) {
		if (navicell.dataset.datatableCount()) {
			// must be: nv_perform("nv_functional_analysis", window, "open")
			nv_functional_analysis_perform(window);
		}
	});

	// EV: 2015-02-11: for now
	//$("#functional_analysis").hide();

	$("#demo").button().click(function() {
		var suffix = nv_demo_file.match(/\.nvc$/) ? "" : ".nvc";
		nv_execute_commands(window, null, nv_demo_file + suffix);
		$("#demo").button("disable");
		//$("#demo").css("display", "none");
	});

	if (DATATABLE_HAS_TABS) {
		var datatable_tabs_width = 850;
		var datatable_tabs_height = 550;

		$("#dt_datatable_tabs").dialog({
			autoOpen: false,
			width: get_dialog_width(DATATABLE_TABS_WIDTH),
			height: get_dialog_height(DATATABLE_TABS_HEIGHT),
			modal: false
		});

		$("#dt_datatable_tabs").tabs();

		$("#datatable_status").button().click(function() {
			if (navicell.dataset.datatableCount()) {
				$("#dt_datatable_tabs").dialog("open");
			}
		});
	}
	update_sample_annot_table(window.document);

	$("#heatmap_editor_div").dialog({
		autoOpen: false,
		width: get_dialog_width(HEATMAP_EDITOR_WIDTH),
		height: get_dialog_height(HEATMAP_EDITOR_HEIGHT),
		modal: false,
		buttons: {
			"Apply": function() {
				nv_perform("nv_heatmap_editor_perform", window, "apply", true);
			},
			
			"Cancel": function() {
				nv_perform("nv_heatmap_editor_perform", window, "cancel");
			},

			"OK": function() {
				nv_perform("nv_heatmap_editor_perform", window, "apply_and_close", true);
			}
		}
	});

	$("#barplot_editor_div" ).dialog({
		autoOpen: false,
		width: get_dialog_width(BARPLOT_EDITOR_WIDTH),
		height: get_dialog_height(BARPLOT_EDITOR_HEIGHT),
		modal: false,
		buttons: {
			"Apply": function() {
				nv_perform("nv_barplot_editor_perform", window, "apply", true);
			},
			
			"Cancel": function() {
				nv_perform("nv_barplot_editor_perform", window, "cancel");
			},

			"OK": function() {
				nv_perform("nv_barplot_editor_perform", window, "apply_and_close", true);
			}

		}
	});


	for (var num = 1; num <= GLYPH_COUNT; ++num) {
		$("#glyph_editor_div_" + num).data('num', num).dialog({
			autoOpen: false,
			width: get_dialog_width(GLYPH_EDITOR_WIDTH),
			height: get_dialog_height(GLYPH_EDITOR_HEIGHT),
			modal: false,

			buttons: {
				"Apply": function() {
					var num = $(this).data('num');
					console.log("APPLY: " + num);
					nv_perform("nv_glyph_editor_perform", window, "apply", num, true);
				},
				
				"Cancel": function() {
					var num = $(this).data('num');
					nv_perform("nv_glyph_editor_perform", window, "cancel", num);
				},
				"OK": function() {
					var num = $(this).data('num');
					nv_perform("nv_glyph_editor_perform", window, "apply_and_close", num, true);
				}

			}
		});
	}

	$("#map_staining_editor_div").dialog({
		autoOpen: false,
		width: get_dialog_width(MAP_STAINING_EDITOR_WIDTH),
		height: get_dialog_height(MAP_STAINING_EDITOR_HEIGHT),
		modal: false,

		buttons: {
			"Apply": function() {
				nv_perform("nv_map_staining_editor_perform", window, "apply", true);
			},

			"Cancel": function() {
				nv_perform("nv_map_staining_editor_perform", window, "cancel");
			},
			"OK": function() {
				nv_perform("nv_map_staining_editor_perform", window, "apply_and_close", true);
			}
		}
	});

	$("#command-dialog").dialog({
		autoOpen: false,
		width: get_dialog_width(COMMAND_DIALOG_WIDTH),
		height: get_dialog_height(COMMAND_DIALOG_HEIGHT),
		modal: false,

		buttons: {
			"Execute": function() {
				var cmd = $("#command-exec").val().trim();
				nv_decode(cmd);
				$("#command-exec").val("");
			},

			/*
			"Get URL": function() {
				var cmd = $("#command-exec").val().trim();
				nv_get_url(cmd);
				$("#command-exec").val("");
			},
			*/

			/*
			"Eval": function() { // for testing, Eval button will disapear
				var cmd = $("#command-exec").val().trim();
				window.eval(cmd);
			},
			*/

			"Clear": function() {
				$("#command-exec").val("");
			},

			"OK": function() {
				$(this).dialog('close');
			}
		}
	});

	update_buttons();
});

function import_annot_file()
{
	var sample_file = $("#dt_sample_file");
	var sample_url = $("#dt_sample_url");
	nv_perform("nv_sample_annotation_perform", window, "import", sample_url.val().trim(), sample_file.get()[0].files[0], true);
}

var DEF_OVERVIEW_HEATMAP_SAMPLE_CNT = 5;
var DEF_OVERVIEW_BARPLOT_SAMPLE_CNT = 5;
var DEF_MAX_HEATMAP_SAMPLE_CNT = 25;
var DEF_MAX_BARPLOT_SAMPLE_CNT = 25;

var max_heatmap_sample_cnt = DEF_MAX_HEATMAP_SAMPLE_CNT;
var max_barplot_sample_cnt = DEF_MAX_BARPLOT_SAMPLE_CNT;

function add_transparency_slider_labels(obj)
{
	obj.slider().
		append("<label class='slider-label' style='left: 0%'>Solid</label>").
		append("<label class='slider-label' style='right: 0%'>Transparent</label>");
}

function heatmap_editor_apply(heatmap_config)
{
	heatmap_config.reset(); // ??
	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;
	if (sample_group_cnt > max_heatmap_sample_cnt) {
		sample_group_cnt = max_heatmap_sample_cnt;
	}
	var doc = window.document;
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		var val = $("#heatmap_editor_gs_" + idx, doc).val();
		if (val == "_none_") {
			heatmap_config.setSampleOrGroupAt(idx, undefined);
		} else {
			var prefix = val.substr(0, 2);
			/*
			var id = val.substr(2);
			if (prefix == 'g_') {
				var group = navicell.group_factory.getGroupById(id);
				heatmap_config.setSampleOrGroupAt(idx, group);
			} else {
				var sample = navicell.dataset.getSampleById(id);
				heatmap_config.setSampleOrGroupAt(idx, sample);
			}
			*/
			var canon_name = val.substr(2);
			if (prefix == 'g_') {
				var group = navicell.group_factory.getGroupByCanonName(canon_name);
				heatmap_config.setSampleOrGroupAt(idx, group);
			} else {
				var sample = navicell.dataset.getSampleByCanonName(canon_name);
				heatmap_config.setSampleOrGroupAt(idx, sample);
			}
		}
	}
	var datatable_cnt = mapSize(navicell.dataset.datatables);
	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var val = $("#heatmap_editor_datatable_" + idx, doc).val();
		if (val == "_none_") {
			heatmap_config.setDatatableAt(idx, undefined);
		} else {
			//var datatable = navicell.getDatatableById(val);
			var datatable = navicell.getDatatableByCanonName(val);
			heatmap_config.setDatatableAt(idx, datatable);
		}
	}
	heatmap_config.setSize($("#heatmap_editor_size", doc).val());
	heatmap_config.setScaleSize($("#heatmap_editor_scale_size", doc).val());
	heatmap_config.setTransparency(heatmap_config.getSlider().slider("value"));
}

function barplot_editor_apply(barplot_config)
{
	barplot_config.reset(); // ??
	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;
	if (sample_group_cnt > max_barplot_sample_cnt) {
		sample_group_cnt = max_barplot_sample_cnt;
	}
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		var val = $("#barplot_editor_gs_" + idx).val();
		if (!val) {
			return; // means not ready
		}
		if (val == "_none_") {
			barplot_config.setSampleOrGroupAt(idx, undefined);
		} else {
			var prefix = val.substr(0, 2);
			/*
			var id = val.substr(2);
			if (prefix == 'g_') {
				var group = navicell.group_factory.getGroupById(id);
				barplot_config.setSampleOrGroupAt(idx, group);
			} else {
				var sample = navicell.dataset.getSampleById(id);
				barplot_config.setSampleOrGroupAt(idx, sample);
			}
			*/
			var canon_name = val.substr(2);
			if (prefix == 'g_') {
				var group = navicell.group_factory.getGroupByCanonName(canon_name);
				barplot_config.setSampleOrGroupAt(idx, group);
			} else {
				var sample = navicell.dataset.getSampleByCanonName(canon_name);
				barplot_config.setSampleOrGroupAt(idx, sample);
			}
		}
	}
	var datatable_cnt = mapSize(navicell.dataset.datatables);
	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var val = $("#barplot_editor_datatable_" + idx).val();
		if (val == "_none_") {
			barplot_config.setDatatableAt(idx, undefined);
		} else {
			//var datatable = navicell.getDatatableById(val);
			var datatable = navicell.getDatatableByCanonName(val);
			barplot_config.setDatatableAt(idx, datatable);
		}
	}
	barplot_config.setHeight($("#barplot_editor_height").val());
	barplot_config.setWidth($("#barplot_editor_width").val());
	barplot_config.setScaleSize($("#barplot_editor_scale_size").val());
	barplot_config.setTransparency(barplot_config.getSlider().slider("value"));
}

function glyph_editor_apply(num, glyph_config)
{
	var val = $("#glyph_editor_gs_" + num).val();
	if (val == "_none_") {
		glyph_config.setSampleOrGroup(undefined);
	} else {
		var prefix = val.substr(0, 2);
		/*
		var id = val.substr(2);
		if (prefix == 'g_') {
			var group = navicell.group_factory.getGroupById(id);
			glyph_config.setSampleOrGroup(group);
		} else {
			var sample = navicell.dataset.getSampleById(id);
			glyph_config.setSampleOrGroup(sample);
		}
		*/
		var canon_name = val.substr(2);
		if (prefix == 'g_') {
			var group = navicell.group_factory.getGroupByCanonName(canon_name);
			glyph_config.setSampleOrGroup(group);
		} else {
			var sample = navicell.dataset.getSampleByCanonName(canon_name);
			glyph_config.setSampleOrGroup(sample);
		}
	}

	val = $("#glyph_editor_datatable_shape_" + num).val();
	if (val == "_none_") {
		glyph_config.setShapeDatatable(undefined);
	} else {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		glyph_config.setShapeDatatable(datatable);
	}

	val = $("#glyph_editor_datatable_color_" + num).val();
	if (val == "_none_") {
		glyph_config.setColorDatatable(undefined);
	} else {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		glyph_config.setColorDatatable(datatable);
	}

	val = $("#glyph_editor_datatable_size_" + num).val();
	if (val == "_none_") {
		glyph_config.setSizeDatatable(undefined);
	} else {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		glyph_config.setSizeDatatable(datatable);
	} 

	glyph_config.setSize($("#glyph_editor_size_" + num).val());
	glyph_config.setScaleSize($("#glyph_editor_scale_size_" + num).val());
	glyph_config.setTransparency(glyph_config.getSlider().slider("value"));
}

function download_samples() {
	var str = ",#Genes for sample in datatable\n";
	str += "Samples (" + mapSize(navicell.dataset.samples) + ")";

	for (var dt_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[dt_name];
		str += "," + datatable.html_name;
	}
	str += "\n";
	for (var sample_name in navicell.dataset.samples) {
		if (sample_name == "") {
			continue;
		}
		str +=  sample_name;
		for (var dt_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[dt_name];
			var cnt = datatable.getGeneCount(sample_name);
			if (cnt >= 0) {
				str += "," + cnt;
			} else {
				str += "," + "-";
			}
		}
		str += "\n";
	}

	download_csv($("#download_samples"), str, "samples");
}

function update_sample_status_table(doc, params) {
	var table = $("#dt_sample_status_table", doc);
	table.children().remove();
	// should use a string buffer
	var str = "<thead>";
	str += "<tr><td>&nbsp</td><td colspan='" + mapSize(navicell.dataset.datatables) + "'>&nbsp;#Genes&nbsp;for&nbsp;sample&nbsp;in&nbsp;datatable&nbsp;</td</tr>";
	str += "<tr><th>Samples&nbsp;(" + mapSize(navicell.dataset.samples) + ")</th>";

	for (var dt_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[dt_name];
		str += "<th>&nbsp;" + datatable.html_name + "&nbsp;</th>";
	}
	str += "</tr></thead>";
	str += "<tbody>\n";
	for (var sample_name in navicell.dataset.samples) {
		if (sample_name == "") {
			continue;
		}
		str += "<tr><td>" + sample_name + "</td>";
		for (var dt_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[dt_name];
			var cnt = datatable.getGeneCount(sample_name);
			if (cnt >= 0) {
				str += "<td style=\"width: 100%; text-align: center\">" + cnt + "</td>";
			} else {
				str += "<td style=\"width: 100%; text-align: center\">-</td>";
			}
		}
		str += "</tr>";
	}
	
	str += "</tbody>";
	table.append(str);
	table.tablesorter();
}

/*
function annot_set_group_old(annot_id, doc) {
	var checkbox = $("#cb_annot_" + annot_id);
	var checked = checkbox.attr("checked");
	var annot = navicell.annot_factory.getAnnotationPerId(annot_id);

	annot.setIsGroup(checked);
}
*/

function is_annot_group(annot_id) {
	var annot = navicell.annot_factory.getAnnotationPerId(annot_id);
	return annot.is_group ? "checked" : "";
}

function update_sample_annot_table_style(doc, params) {
	var annot_ids = params.annot_ids;
	var checked = params.checked;

	for (var idx in annot_ids) {
		var annot_id = annot_ids[idx];
		var annot = navicell.annot_factory.getAnnotationPerId(annot_id);
		var checkbox = $("#cb_annot_" + annot.getCanonName()); // was annot_id
		//var checkbox = $("#cb_annot_" + annot_id);
		var checked = checkbox.attr("checked");
		var td_tochange = $("#dt_sample_annot_table .annot_" + annot_id, doc);
		if (checked) {
			td_tochange.removeClass('non_group_annot');
			td_tochange.addClass('group_annot');
		} else {
			td_tochange.addClass('non_group_annot');
			td_tochange.removeClass('group_annot');
		}
	}
}

function update_sample_annot_table(doc, params) {
	console.log("UPDATE_SAMPLE_ANNOT_TABLE");

	if (params && params.style_only) {
		update_sample_annot_table_style(doc, params);
		return;
	}
	var annots = navicell.annot_factory.annots_per_name;
	var annot_cnt = mapSize(annots);
	var table = $("#dt_sample_annot_table", doc);
	table.children().remove();
	var annotated_sample_cnt = 0;
	for (var sample_name in navicell.dataset.samples) {
		var sample = navicell.dataset.samples[sample_name];
		if (sample.hasAnnots()) {
			annotated_sample_cnt++;
		}
	}
	if (annot_cnt != 0 && annotated_sample_cnt != 0) {
		var str = "<thead>";
		if (annot_cnt) {
			str += "<tr><td>&nbsp;</td><td colspan='" + annot_cnt + "' style='text-align: left; font-style: italic; font-weight: bold; font-size: smaller;'>&nbsp;&nbsp;&nbsp;&nbsp;Check boxes to build groups</td></tr>\n";
		}
		str += '<tr><td style="text-align: right; font-size: smaller; font-style: italic;">' + '&nbsp;' + '</td>';
		for (var annot_name in annots) {
			var annot = navicell.annot_factory.getAnnotation(annot_name, true);
			var annot_id = annot.id;
			//str += "<td style='text-align: center;'><input id='cb_annot_" + annot_id + "' type='checkbox' " + is_annot_group(annot_id) + " onchange='group_editing(true)'></input></td>";
			str += "<td style='text-align: center;'><input id='cb_annot_" + annot.getCanonName() + "' type='checkbox' " + is_annot_group(annot_id) + " onchange='select_sample_annot(\"" + annot.getCanonName() + "\")'></input></td>";
		}
		str += "</tr>";
		str += "<tr><th>Samples (" + annotated_sample_cnt + ")</th>";
		if (0 == annot_cnt) {
		} else {
			for (var annot_name in annots) {
				str += "<th>&nbsp;" + annot_name.replace(/ /g, "&nbsp;") + "&nbsp;</th>";
			}
		}
		str += "</tr></thead>";
		str += "<tbody>";
		if (0 == mapSize(navicell.dataset.samples)) {
			str += "<tr><td>&nbsp;</td><tr>";
		}
		for (var sample_name in navicell.dataset.samples) {
			var sample = navicell.dataset.samples[sample_name];
			if (!sample.hasAnnots()) {
				continue;
			}
			str += "<tr>";
			str += "<td>" + sample_name + "</td>";
			for (var annot_name in annots) {
				var annot = navicell.annot_factory.getAnnotation(annot_name, true);
				var annot_value = sample.annots[annot_name];
				str += "<td class='" + (annot.is_group ? "group_annot" : " non_group_annot") + " annot_" + annot.id + "'>";
				if (annot_value) {
					str += annot_value;
				} else {
					str += "&nbsp;";
				}
				str += "</td>";
			}
			str += "</tr>";
		}
		str += "</tbody>";
		table.append(str);
		table.tablesorter();
		$("#dt_sample_annot").dialog("option", "width", 800);
		$("#dt_sample_annot").dialog("option", "height", 750);
		$("#dt_sample_annot_table_div", doc).css("display", "block");
	} else {
		if (navicell.annot_factory.sample_annotated > 0) {
			$("#dt_sample_annot_status").html("</br><span class=\"status-message\"><span style='font-weight: bold'></span>No groups: check boxes to build groups</span>");
		} else {
			$("#dt_sample_annot_status").html("</br><span class=\"status-message\"><span style='font-weight: bold'></span>No groups: import an annotation file to build groups</span>");
		}
		$("#dt_sample_annot").dialog("option", "width", 600);
		$("#dt_sample_annot").dialog("option", "height", 350);
		$("#dt_sample_annot_table_div", doc).css("display", "none");
	}
}

function download_groups() {
	var str = "Groups (" + mapSize(navicell.group_factory.group_map) + ")";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		str += "," + datatable.html_name + ",";
	}
	str += "\n";
	for (var datatable_name in navicell.dataset.datatables) {
		str += ",#Samples,Samples";
	}
	str += "\n";
	var sample_names_per_datatable = {};
	var sample_cnt_per_datatable = {};
	var maxcnt_per_groups = {}
	var datatable_cnt = 0;
	for (var datatable_name in navicell.dataset.datatables) {
		datatable_cnt++;
	}

	for (var group_name in navicell.group_factory.group_map) {
		var group = navicell.group_factory.group_map[group_name];
		sample_names_per_datatable[group_name] = [];
		sample_cnt_per_datatable[group_name] = [];
		var maxcnt = 0;
		for (var datatable_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[datatable_name];
			var cnt = 0;
			var sample_names = [];
			for (var sample_name in navicell.dataset.samples) {
				var sample = navicell.dataset.samples[sample_name];
				if (datatable.sample_index[sample_name] != undefined) {
					for (var sample_group_name in sample.groups) {
						if (sample_group_name == group_name) {
							sample_names.push(sample_name);
							cnt++;
						}
					}
				}
			}
			sample_names.sort();
			sample_names_per_datatable[group_name].push(sample_names);
			sample_cnt_per_datatable[group_name].push(cnt);
			if (cnt > maxcnt) {
				maxcnt = cnt;
			}
		}
		maxcnt_per_groups[group_name] = maxcnt;
	}

	for (var group_name in navicell.group_factory.group_map) {
		var group = navicell.group_factory.group_map[group_name];
		var maxcnt = maxcnt_per_groups[group_name];
		var group_cnt = sample_cnt_per_datatable[group_name];
		var group_sample_names = sample_names_per_datatable[group_name];
		for (var nn = 0; nn < maxcnt; nn++) {
			str += group.name;
			for (var jj = 0; jj < datatable_cnt; jj++) {
				var cnt = group_cnt[jj];
				var sample_names = group_sample_names[jj];
				str += "," + cnt;
				if (nn >= cnt) {
					str += ",-";
				} else {
					str += "," + sample_names[nn];
				}
			}
			str += "\n";
		}
	}
	download_csv($("#download_groups"), str, "groups");
}

function update_group_status_table(doc, params) {
	var table = $("#dt_group_status_table", doc);
	table.children().remove();
	var str = "<thead><tr><th>Groups&nbsp;(" + mapSize(navicell.group_factory.group_map) + ")</th>";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		str += "<td colspan='2'>&nbsp;" + datatable.html_name + "&nbsp;</td>";
	}
	str += "<tr><td>&nbsp;</td>";
	for (var datatable_name in navicell.dataset.datatables) {
		str += "<th>&nbsp;#Samples&nbsp;</th><th>Samples</th>";
	}
	str += "</tr>";
	str += "</thead>";
	str += "<tbody>";
	for (var group_name in navicell.group_factory.group_map) {
		var group = navicell.group_factory.group_map[group_name];
		str += "<tr>";
		str += "<td>" + group.html_name + "</td>";
		for (var datatable_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[datatable_name];
			str += "<td style='text-align: center'>";
			var cnt = 0;
			var sample_names = [];
			for (var sample_name in navicell.dataset.samples) {
				var sample = navicell.dataset.samples[sample_name];
				if (datatable.sample_index[sample_name] != undefined) {
					for (var sample_group_name in sample.groups) {
						if (sample_group_name == group_name) {
							sample_names.push(sample_name);
							cnt++;
						}
					}
				}
			}
			str += cnt + "</td>";

			sample_names.sort();
			str += "<td><div style='max-height: 200px; overflow: auto'>";
			for (var sample_idx in sample_names) {
				str += sample_names[sample_idx] + "</br>";
				
			}
			str += "</div></td>";
		}
		str += "</tr>";
	}
	str += "</tbody>";
	table.append(str);
	table.tablesorter();
}

function update_module_status_table(doc, params) {
	var table = $("#dt_module_status_table", doc);
	table.children().remove();
	var str = "<thead>";
	str += "<tr><td>&nbsp</td><td colspan='" + mapSize(navicell.dataset.datatables) + "'>&nbsp;#Genes&nbsp;in&nbsp;</td</tr>";
	str += "<tr><th>Module</th>";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		str += "<th>&nbsp;" + datatable.html_name + "&nbsp;</th>";
	}
	str += "</thead>";

	str += "<tbody>";
	for (var module_name in navicell.mapdata.module_mapdata) {
		str += "<tr><td>" + module_name + "</td>";
		for (var datatable_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[datatable_name];
			var gene_cnt = 0;
			for (var gene_name in datatable.gene_index) {
				var hugo_entry = navicell.mapdata.hugo_map[gene_name];
				if (hugo_entry && hugo_entry[module_name]) {
					gene_cnt++;
				}
			}
			str += "<td>" + gene_cnt + "</td>";
		}
		str += "</tr>";
	}
	str += "</tbody>";

	table.append(str);
	table.tablesorter();
}

function in_module_gene_count(module_name) {
	var cnt = 0;
	for (var gene_name in navicell.dataset.genes) {
		if (navicell.mapdata.hugo_map[gene_name][module_name]) {
			cnt++;
		}
	}
	return cnt;
}

function download_genes() {
	var opener = document.win;
	var module_stack = [];
	while (opener) {
		try {
			if (!opener.document.map_name) {
				break;
			}
			//console.log("NOTICE 2: OK cross origin opener: " + opener.location.protocol + "//" + opener.location.host + " (current window: " + window.location.protocol + "//" + window.location.host + ")");
			module_stack.push(opener.document.map_name);
		}
		catch(e) {
			console.log("WARNING #2: cross origin problem ? caugth " + e);
		}
		opener = opener.opener;
	}

	/*
	while (opener && opener.document.map_name) {
		module_stack.push(opener.document.map_name);
		opener = opener.opener;
	}
	*/

	var str = "Genes in";
	for (var ll = 0; ll < module_stack.length; ll++) {
		str += ",";
	}

	var size = mapSize(navicell.dataset.datatables);
	str += "#Samples for gene in datatable";
	for (var ll = 0; ll < size-1; ll++) {
		str += ",";
	}
	str += "\n";
	for (var nn = 0; nn < module_stack.length; ++nn) {
		var module_name = module_stack[nn];
		str += (nn>0?",":"") + module_name + " (" + in_module_gene_count(module_stack[nn]) + ")";
	}

	for (var dt_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[dt_name];
		str += "," + datatable.html_name;
	}
	str += "\n";
	for (var gene_name in navicell.dataset.genes) {
		if (gene_name == "") {
			continue;
		}
		str += gene_name;
		for (var nn = module_stack.length-2; nn >= 0; --nn) {
			var module_name = module_stack[nn];
			if (navicell.mapdata.hugo_map[gene_name][module_name]) {
				str += "," + gene_name;
			} else {
				str += ",";
			}
		}
		for (var dt_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[dt_name];
			var cnt = datatable.getSampleCount(gene_name);
			if (cnt >= 0) {
				str += "," + cnt;
			} else {
				str += ",-";
			}
		}
		str += "\n";
	}	
	download_csv($("#download_genes"), str, "genes");
}

function update_gene_status_table(doc, params) {
	var table = $("#dt_gene_status_table", doc);
	table.children().remove();
	var str = "<thead>";
	var opener = doc.win;
	var module_stack = [];
	while (opener) {
		try {
			if (!opener.document.map_name) {
				break;
			}
			//console.log("NOTICE 1: OK cross origin opener: " + opener.location.protocol + "//" + opener.location.host + " (current window: " + window.location.protocol + "//" + window.location.host + ")");
			module_stack.push(opener.document.map_name);
		}
		catch(e) {
			console.log("WARNING #1: cross origin problem ? caugth " + e);
		}
		opener = opener.opener;
	}

	/*
	while (opener && opener.document.map_name) {
		module_stack.push(opener.document.map_name);
		opener = opener.opener;
	}
	*/
	str += "<tr><td colspan='" + (module_stack.length) + "'>Genes&nbsp;in</td><td colspan='" + mapSize(navicell.dataset.datatables) + "'>&nbsp;#Samples&nbsp;for&nbsp;gene&nbsp;in&nbsp;datatable&nbsp;</td</tr>";
	str += "<tr>";
	for (var nn = module_stack.length-1; nn >= 0; --nn) {
		var module_name = module_stack[nn];
		str += "<th>" + module_name + "&nbsp;(" + in_module_gene_count(module_stack[nn]) + ")</th>";
	}

	for (var dt_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[dt_name];
		str += "<th>&nbsp;" + datatable.html_name + "&nbsp;</th>";
	}
	str += "</tr></thead>";
	str += "<tbody>\n";
	for (var gene_name in navicell.dataset.genes) {
		if (gene_name == "") {
			continue;
		}
		str += "<tr><td>" + gene_name + "</td>";
		for (var nn = module_stack.length-2; nn >= 0; --nn) {
			var module_name = module_stack[nn];
			if (navicell.mapdata.hugo_map[gene_name][module_name]) {
				str += "<td>" + gene_name + "</td>";
			} else {
				str += "<td>&nbsp;</td>";
			}
		}
		for (var dt_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[dt_name];
			var cnt = datatable.getSampleCount(gene_name);
			if (cnt >= 0) {
				str += "<td style=\"width: 100%; text-align: center\">" + cnt + "</td>";
			} else {
				str += "<td style=\"width: 100%; text-align: center\">-</td>";
			}
		}
		str += "</tr>";
	}	
	str += "</tbody>";
	table.append(str);
	table.tablesorter();
}

function download_csv(obj, csv, name) {
	obj.attr("download", name + ".csv");
	obj.attr("href", 'data:text/csv;charset=utf-8,' + escape(csv));
}

function download_datatable_data(id) {
	var datatable = navicell.getDatatableById(id);
	var csv = datatable.makeDataTable_genes_csv(get_module());
	download_csv($("#dt_download_data_" + datatable.getId()), csv, datatable.name);
}

function show_datatable_data(id) {
	var datatable = navicell.getDatatableById(id);
	var div = datatable.getDataMatrixDiv(get_module());
	if (datatable.showingDataIsHuge()) {
		var body = $(body, document);
		var dt_show_data = $("#dt_show_data_" + id, document);
		var ocursor = body.css("cursor");
		var ocursor2 = dt_show_data.css("cursor");
		body.css("cursor", "wait");
		dt_show_data.css("cursor", "wait");
		setTimeout(function() {
			datatable.refresh(window);
			div.dialog("open");
			body.css("cursor", ocursor);
			dt_show_data.css("cursor", ocursor2);
		}, DISPLAY_TIMEOUT);
	} else {
		datatable.refresh(window);
		div.dialog("open");
	}
}

function show_datatable_markers(id) {
	var datatable = navicell.getDatatableById(id);
	if (datatable.showingMarkersIsHuge()) {
		var body = $(body, document);
		var dt_show_markers = $("#dt_show_markers_" + id, document);
		var ocursor = body.css("cursor");
		var ocursor2 = dt_show_markers.css("cursor");
		body.css("cursor", "wait");
		dt_show_markers.css("cursor", "wait");
		setTimeout(function() {
			datatable.display(window.document.navicell_module_name, window, false, true);
			body.css("cursor", ocursor);
			dt_show_markers.css("cursor", ocursor2);
		}, DISPLAY_TIMEOUT);
	} else {
		datatable.display(window.document.navicell_module_name, window, false, true);
	}
}

function update_datatable_status_table(doc, params) {

	var table = $("#dt_datatable_status_table", doc);
	var update_label = $("#dt_datatable_status_update_label", doc);
	var update_checkbox = $("#dt_datatable_status_update", doc);
	if (doc != window.document) {
		update_checkbox.attr("checked", false);
	}
	var update = true;
	var support_remove = true;

	table.children().remove();

	var tab_body = $("#dt_datatable_tabs", doc);
	var tab_header = $("#dt_datatable_tabs ul", doc);
	tab_header.children().remove();
	tab_header.append('<li><a class="ui-button-text" href="#dt_datatable_status">General</a></li>');

	var str = "<thead><tr>";
	if (support_remove && update) {
		str += "<th>Remove</th>";
	}
	str += "<th>Datatable</th>";
	str += "<th>Type</th>";
	str += "<th>Genes</th>";
	str += "<th>Samples</th>";
	str += "<th>Display</th>";
	str += "</tr></thead>";

	str += "<tbody>";
	var tabnum = 1;
	var onchange = 'datatable_management_set_editing(true)';
	for (var dt_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[dt_name];
		$("#dt_data_dialog_title_" + datatable.id).html("<span style='font-style: italic;'>" + datatable.name + "</span> Datatable");
		var data_div = datatable.data_div;
		if (DATATABLE_HAS_TABS) {
			if (data_div) {
				tab_header.append('<li><a class="ui-button-text" href="#' + data_div.attr("id") + '">' + dt_name + '</a></li>');
				datatable.setTabNum(tabnum++);
			}
		}
		str += "<tr>";
		if (update) {
			if (support_remove) {
				str += "<td><input id=\"dt_remove_" + datatable.getId() + "\" type=\"checkbox\"></td>";
			}
			str += "<td><input id=\"dt_name_" + datatable.getId() + "\" type=\"text\" value=\"" + datatable.name + "\" onkeydown='" + onchange + "' onchange='" + onchange + "'/></td>";
			str += "<td>" + get_biotype_select("dt_type_" + datatable.getId(), false, datatable.biotype.name, onchange) + "</td>";
		} else {
			str += "<td>&nbsp;" + datatable.name + "&nbsp;</td>";
			str += "<td style='min-width: 170px'>&nbsp;" + datatable.biotype.name + "&nbsp;</td>";
		}
		str += "<td>" + mapSize(datatable.gene_index) + "</td>";
		str += "<td>" + datatable.getSampleCount() + "</td>";
		str += "<td style='border: none; text-decoration: underline; font-size: 11px'><a id='dt_show_markers_" + datatable.getId() + "' href='#' onclick='show_datatable_markers(" + datatable.getId() + ")'>gene&nbsp;markers</a><br/>";
		str += "<a id='dt_download_data_" + datatable.getId() + "' href='#' onclick='download_datatable_data(" + datatable.getId() + ")'>download&nbsp;data</a></td>";
		str += "</tr>";
	}
	table.append(str);
	table.tablesorter();

	if (DATATABLE_HAS_TABS) {
		tab_body.tabs("refresh");
	}
	navicell.DTStatusMustUpdate = false;
}

function update_buttons()
{
	var enable = navicell.dataset.datatableCount() ? "enable" : "disable";
	$("#import_annot_status").button(enable);
	$("#status_tabs").button(enable);
	$("#drawing_config").button(enable);
	$("#functional_analysis").button(enable);

	enable = navicell.annot_factory.getAnnotCount() > 0;
	$("#dt_sample_annot_apply").button(enable ? "enable" : "disable");
	$("#dt_sample_annot_cancel").button(enable ? "enable" : "disable");
}

function update_status_tables(params) {
	for (var map_name in maps) {
		var doc = maps[map_name].document;
		if (params && params.doc && params.doc != doc) {
			continue;
		}
		var win = doc.win;
		if (!win) {
			continue;
		}
		if (!params || !params.no_sample_status_table) {
			win.update_sample_status_table(doc, params);
		}
		if (!params || !params.no_gene_status_table) {
			win.update_gene_status_table(doc, params);
		}
		if (!params || !params.no_group_status_table) {
			win.update_group_status_table(doc, params);
		}
		if (!params || !params.no_module_status_table) {
			win.update_module_status_table(doc, params);
		}
		if (!params || !params.no_datatable_status_table) {
			win.update_datatable_status_table(doc, params);
		}
		if (!params || !params.no_sample_annot_table) {
			win.update_sample_annot_table(doc, params);
		}

		if (!params || !params.no_analysis_table) {
			win.update_analysis_table(doc, params);
		}

		win.update_heatmap_editor(doc, params);
		win.update_barplot_editor(doc, params);
		win.update_glyph_editors(doc, params);
		win.update_map_staining_editor(doc, params);
		win.update_buttons();
	}
	//navicell_session.write();

}

function update_glyph_editors(doc, params) {
	for (var num = 1; num <= GLYPH_COUNT; ++num) {
		doc.win.update_glyph_editor(doc, params, num);
	}
}

function get_biotype_select(id, include_none, value, onchange) {
	var str = '<select id="' + id + '"';
	if (onchange) {
		str += " onchange='" + onchange + "'";
	}
	str += '">';
	if (include_none) {
		str += '<option value="_none_"></option>';
	}
	for (var biotype_name in navicell.biotype_factory.biotypes) {
		var biotype = navicell.biotype_factory.biotypes[biotype_name];
		var selected = biotype.name == value ? ' selected' : '';
		str += '<option value="' + biotype.name + '"' + selected + '>' + biotype.name + '</option>';
	}
	var selected = DATATABLE_LIST == value ? ' selected' : '';
	str += '<option value="' + DATATABLE_LIST + '"' + selected + '>' + DATATABLE_LIST + '</option>';
	str += "</select>";
	return str;
}

function update_datatables() {
	var update_cnt = 0;
	var remove_cnt = 0;
	var doc = window.document;
	for (var dt_name in navicell.dataset.datatables) {
		// TBD: do not support space in names: check all selector
		var datatable = navicell.dataset.datatables[dt_name];
		var dt_id = datatable.getId();
		var dt_name_elem = $("#dt_name_" + dt_id, doc);
		var dt_type_elem = $("#dt_type_" + dt_id, doc);
		var dt_remove_elem = $("#dt_remove_" + dt_id, doc);
		var new_dt_name = dt_name_elem.val();
		var new_dt_type = dt_type_elem.val();
		var new_dt_remove = dt_remove_elem.attr('checked');
		if (new_dt_remove) {
			navicell.dataset.removeDatatable(datatable);
			remove_cnt++;
		} else {
			if ((new_dt_name && dt_name !== new_dt_name) ||
			    new_dt_type !==  datatable.biotype.name) {
				if (!navicell.dataset.updateDatatable(window, dt_name, new_dt_name, new_dt_type)) {
					dt_name_elem.val(dt_name);
					dt_type_elem.val(datatable.biotype.name);
					
				} else {
					update_cnt++;
				}
				
			}
		}

	}
	if (remove_cnt) {
		var drawing_config = navicell.getDrawingConfig(get_module());
		drawing_config.getHeatmapConfig().syncDatatables();
		drawing_config.getEditingHeatmapConfig().syncDatatables();
		drawing_config.getBarplotConfig().syncDatatables();
		drawing_config.getEditingBarplotConfig().syncDatatables();
		for (var num = 1; num <= GLYPH_COUNT; ++num) {
			drawing_config.getGlyphConfig(num).syncDatatables();
			drawing_config.getEditingGlyphConfig(num).syncDatatables();
		}
	}
	if (update_cnt || remove_cnt) {
		update_datatable_status_table(doc, {force: true});
		update_status_tables();
	}
	if (remove_cnt) {
		clickmap_refresh(true);
	}
	datatable_management_set_editing(false);
}

function cancel_datatables() {
	update_datatable_status_table(window.document, {force: true});
	datatable_management_set_editing(false);
	$("#dt_datatable_tabs").dialog("close");
}

Datatable.prototype.showDisplayConfig = function(doc, what) {
	var module = get_module_from_doc(doc);
	this.getDisplayConfig(module); // to initialize displayconfiguration if necessary
	var displayContinuousConfig = this.displayContinuousConfig[module];
	var displayUnorderedDiscreteConfig = this.displayUnorderedDiscreteConfig[module];
	var datatable_id = this.getCanonName();
	if (displayContinuousConfig) {
		nv_perform("nv_display_continuous_config_perform", doc.win, "open", datatable_id, what);
	} else if (displayUnorderedDiscreteConfig) {
		nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "open", datatable_id, what);
	}
}

Datatable.prototype.showDisplayConfig_perform = function(doc, what) {
	var div = null;
	var module = get_module_from_doc(doc);
	var displayConfig = this.getDisplayConfig(module);
	if (displayConfig) {
		div = displayConfig.getDiv(what);
	}
	if (div) {
		//var datatable_id = this.getId();
		var datatable = this;
		var displayContinuousConfig = datatable.displayContinuousConfig[module];
		var displayUnorderedDiscreteConfig = datatable.displayUnorderedDiscreteConfig[module];
		var datatable_id = this.getCanonName();
		var width;

		if (what == COLOR_SIZE_CONFIG) {
			width = this.biotype.isUnorderedDiscrete() ? DATATABLE_COLOR_SIZE_CONFIG_WIDTH_UNORDERED : DATATABLE_COLOR_SIZE_CONFIG_WIDTH;
		} else if (what == 'color') {
			width = this.biotype.isUnorderedDiscrete() ? DATATABLE_COLOR_CONFIG_WIDTH_UNORDERED : DATATABLE_COLOR_CONFIG_WIDTH;
		} else if (what == 'shape') {
			width = DATATABLE_CONFIG_WIDTH;
		}
		if (!div.built) {
			div.dialog({
				autoOpen: false,
				width: doc.win.get_dialog_width(width),
				height: doc.win.get_dialog_height(DATATABLE_CONFIG_HEIGHT),
				modal: false,

				buttons: {
					"Apply": function() {
						if (displayContinuousConfig) {
							nv_perform("nv_display_continuous_config_perform", doc.win, "apply", datatable_id, what);
						} else if (displayUnorderedDiscreteConfig) {
							nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "apply", datatable_id, what);
						}
					},

					"Cancel": function() {
						if (displayContinuousConfig) {
							nv_perform("nv_display_continuous_config_perform", doc.win, "cancel", datatable_id, what);
						} else if (displayUnorderedDiscreteConfig) {
							nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "cancel", datatable_id, what);
						}
					},
					"OK": function() {
						if (displayContinuousConfig) {
							nv_perform("nv_display_continuous_config_perform", doc.win, "apply_and_close", datatable_id, what);
						} else if (displayUnorderedDiscreteConfig) {
							nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "apply_and_close", datatable_id, what);
						}
					}
				}
			});
			div.built = true;
		}
		/*
		if (displayContinuousConfig) {
			nv_perform("nv_display_continuous_config_perform", doc.win, "open", datatable_id, what);
		} else if (displayUnorderedDiscreteConfig) {
			nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "open", datatable_id, what);
		}
		*/
		div.dialog("open");
	}
}

function datatable_management_set_editing(val) {
	$("#dt_datatable_status_editing").html(val ? 'changes not saved...' : "");
}


// TBD: should be a method DisplayUnorderedDiscreteConfig
function display_discrete_config_set_editing(datatable_id, val, what, tabname) {
	$("#discrete_config_editing_" + tabname + '_' + what + '_' + datatable_id).html(val ? EDITING_CONFIGURATION : "");
}

function drawing_config_chart() {
	var doc = window.document;
	var val = $("#drawing_config_chart_type", doc).val();
	if (val == "Heatmap") {
		nv_perform("nv_heatmap_editor_perform", window, "open");
	} else if (val == "Barplot") {
		nv_perform("nv_barplot_editor_perform", window, "open");
		//$("#barplot_editor_div", doc).dialog("open");
	}
}

function drawing_config_glyph(num) {
	nv_perform("nv_glyph_editor_perform", window, "open", num);
	//var doc = window.document;
	//$("#glyph_editor_div_" + num, doc).dialog("open");
}

function drawing_config_map_staining() {
	nv_perform("nv_map_staining_editor_perform", window, "open");
	//var doc = window.document;
	//$("#map_staining_editor_div", doc).dialog("open");
}

function drawing_editing(val) {
	$("#drawing_editing").html(val ? EDITING_CONFIGURATION : "");
}

function select_sample_annot(annot_name) {
	console.log("select_sample_annot(" + annot_name + ")");
	var annot = navicell.annot_factory.getAnnotationPerCanonName(annot_name);
	//var annot_id = annot.id;
	var checkbox = $("#cb_annot_" + annot.getCanonName()); // was annot.id
	var checked = checkbox.attr("checked") == "checked";
	nv_perform("nv_sample_annotation_perform", window, "select_annotation", annot_name, checked);
	group_editing(true);
}

function group_editing(val) {
	$("#group_editing").html(val ? EDITING_CONFIGURATION : "");
}

function heatmap_editor_set_editing(val, idx, map_name) {
	var doc = (map_name && maps ? maps[map_name].document : null);
	//doc.win.console.log("heatmap_editor_set_editing: " + val + " " + idx + " " + doc.win);
	$("#heatmap_editing", doc).html(val ? EDITING_CONFIGURATION : "");
	if (val) {
		var module = get_module_from_doc(doc);
		var drawing_config = navicell.getDrawingConfig(module);
		doc.win.heatmap_editor_apply(drawing_config.getEditingHeatmapConfig());
		doc.win.update_heatmap_editor(doc, null, drawing_config.getEditingHeatmapConfig());
	}
	if (idx != undefined) {
		if ($("#heatmap_editor_datatable_" + idx, doc).val() != '_none_') {
			$("#heatmap_editor_datatable_config_" + idx, doc).removeClass("zz-hidden");	
		} else {
			$("#heatmap_editor_datatable_config_" + idx, doc).addClass("zz-hidden");	
		}
	}
	var msg = get_heatmap_config_message(false);
	$("#heatmap_editor_msg_div").html(msg);
}

// 2013-09-03 TBD: must add a doc argument: but as this function is called
// from a string evaluation (onchange='step_display_config(...)'), I propose
// to give the doc_idx and get the doc value from an associative array.
// => should maintain an associative array: doc_idx -> doc
// + attribute doc.doc_idx
function heatmap_step_display_config(idx, map_name) {
	var doc = (map_name && maps ? maps[map_name].document : null);
	var val = $("#heatmap_editor_datatable_" + idx, doc).val();
	if (val != '_none_') {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		if (datatable) {
			datatable.showDisplayConfig(doc, 'color');
		}
	}
}

function heatmap_sample_action_perform(action, cnt, win) {
	if (!win) {
		win = window;
	}
	var doc = win.document;
	var module = get_module();
	var drawing_config = navicell.getDrawingConfig(module);
	if (action == "clear_samples") {
		drawing_config.getEditingHeatmapConfig().reset(true);
	} else if (action == "all_samples") {
		drawing_config.getEditingHeatmapConfig().reset(true);
		max_heatmap_sample_cnt = drawing_config.getEditingHeatmapConfig().setAllSamples();
	} else if (action == "all_groups") {
		drawing_config.getEditingHeatmapConfig().reset(true);
		max_heatmap_sample_cnt = drawing_config.getEditingHeatmapConfig().setAllGroups();
	} else if (action == "from_barplot") {
		var barplot_config = drawing_config.getBarplotConfig();
		if (barplot_config.getSampleOrGroupCount()) {
			drawing_config.getEditingHeatmapConfig().reset(true);
			max_heatmap_sample_cnt = drawing_config.getEditingHeatmapConfig().setSamplesOrGroups(barplot_config.getSamplesOrGroups());
		}
	} else if (action == "pass") {
		// nop
	}

	if (cnt) {
		max_heatmap_sample_cnt = cnt;
	}
	max_heatmap_sample_cnt = DEF_MAX_HEATMAP_SAMPLE_CNT;
	$("#heatmap_editing", doc).html(EDITING_CONFIGURATION);
	update_heatmap_editor(doc);
	var msg = get_heatmap_config_message(false);
	$("#heatmap_editor_msg_div", doc).html(msg);
}

function get_group_names() {
	var group_names = [];
	for (var group_name in navicell.group_factory.group_map) {
		group_names.push(group_name);
	}
	if (group_names.length) {
		group_names.sort();
	}
	return group_names;
}

function get_sample_names() {
	var sample_names = [];
	for (var sample_name in navicell.dataset.samples) {
		sample_names.push(sample_name);
	}
	sample_names.sort();
	return sample_names;
}

function select_datatable(sel_datatable)
{
	var html = "<option value='_none_'>Select a datatable</option>\n";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		var selected = sel_datatable && sel_datatable.getId() == datatable.getId() ? " selected": "";
		html += "<option value='" + datatable.getCanonName() + "'" + selected + ">" + datatable.name + "</option>";
	}
	return html;
}

function heatmap_sample_action(action_str, map_name)
{
	nv_perform("nv_heatmap_editor_perform", get_win(map_name), action_str);
}

function heatmap_select_sample(idx, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_heatmap_editor_perform", get_win(map_name), "select_sample", idx, $("#heatmap_editor_gs_" + idx, doc).val());
}

function heatmap_select_datatable(idx, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_heatmap_editor_perform", get_win(map_name), "select_datatable", idx, $("#heatmap_editor_datatable_" + idx, doc).val());
}

// TBD: class HeatmapEditor
function update_heatmap_editor(doc, params, heatmapConfig, ignore_sel_modif_id) {
	//console.log("update_heatmap_editor");
	var module = get_module_from_doc(doc);
	var drawing_config = navicell.getDrawingConfig(module);
	if (!heatmapConfig) {
		if (!drawing_config) {
			console.log("module: " + module);
		}
		heatmapConfig = drawing_config.getEditingHeatmapConfig();
	}
	var map_name = doc ? doc.map_name : "";
	var div = $("#heatmap_editor_div", doc);
	var topdiv = div.parent().parent();
	var empty_cell_style = "background: " + topdiv.css("background") + "; border: none; font-size: x-small";
	var table = $("#heatmap_editor_table", doc);
	var sel_gene_id = $("#heatmap_select_gene", doc).val();
	var sel_gene = sel_gene_id ? navicell.dataset.getGeneById(sel_gene_id) : null;
	var sel_modif_id = (ignore_sel_modif_id ? "" : $("#heatmap_select_modif_id", doc).html());
	var sel_m_genes = (ignore_sel_modif_id ? "" : $("#heatmap_select_m_genes", doc).html());

	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;

	if (sample_group_cnt > max_heatmap_sample_cnt) {
		sample_group_cnt = max_heatmap_sample_cnt;
	}
	table.children().remove();
	var html = "";
	html += "<tbody>";
	html += "<tr>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td><td colspan='1' style='" + empty_cell_style + "'>" + make_button("Clear Samples", "heatmap_clear_samples", "heatmap_sample_action(\"clear_samples\", \"" + map_name + "\")") + "&nbsp;&nbsp;&nbsp;";
	html += "</td><td colspan='1' style='" + empty_cell_style + "'>";

	html += make_button("All samples", "heatmap_all_samples", "heatmap_sample_action(\"all_samples\", \"" + map_name + "\")");
	html += "&nbsp;&nbsp;";
	if (group_cnt) {
		html += "&nbsp;&nbsp;" + make_button("All groups", "heatmap_all_groups", "heatmap_sample_action(\"all_groups\", \"" + map_name + "\")");
	}
	html += "</td>";
	html += "</tr>";
	if (drawing_config.getBarplotConfig().getSampleOrGroupCount()) {
		var label = (group_cnt ? "Samples and Groups" : "Samples") + " from Barplot";
		html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td><td style='" + empty_cell_style + "'>&nbsp;</td><td colspan='1' style='" + empty_cell_style + "'>";
		html += make_button(label, "heatmap_from_barplot", "heatmap_sample_action(\"from_barplot\", \"" + map_name + "\")");
		html += "</td></tr>";
	}
	html += "<tr><td style='" + empty_cell_style + " height: 10px'>&nbsp;</td></tr>";
	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td><td style='font-weight: bold; font-size: smaller; text-align: center'>Datatables</td>";

	var select_title = group_cnt ? 'Select a sample or group' : 'Select a sample';
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		html += "<td style='border: 0px'><select id='heatmap_editor_gs_" + idx + "' onchange='heatmap_select_sample(" + idx + ", \"" + map_name + "\")'>\n";
		html += "<option value='_none_'>" + select_title + "</option>\n";
		var sel_group = heatmapConfig.getGroupAt(idx);
		var sel_sample = heatmapConfig.getSampleAt(idx);
		var group_names = get_group_names();
		for (var group_idx in group_names) {
			var group_name = group_names[group_idx];
			var group = navicell.group_factory.group_map[group_name];
			var selected = sel_group && sel_group.getId() == group.getId() ? " selected": "";
			//html += "<option value='g_" + group.getId() + "'" + selected + ">" + group.name + "</option>";
			html += "<option value='g_" + group.getCanonName() + "'" + selected + ">" + group.name + "</option>";
		}
		var sel_sample = heatmapConfig.getSampleAt(idx);
		var sample_names = get_sample_names();
		for (var sample_idx in sample_names) {
			var sample_name = sample_names[sample_idx];
			var sample = navicell.dataset.samples[sample_name];
			var selected = sel_sample && sel_sample.getId() == sample.getId() ? " selected": "";
			//html += "<option value='s_" + sample.getId() + "'" + selected + ">" + sample_name + "</option>";
			html += "<option value='s_" + sample.getCanonName() + "'" + selected + ">" + sample_name + "</option>";
		}
		html += "</select>";
		html += "</td>";
	}

	html += "</tr>\n";

	var datatable_cnt = mapSize(navicell.dataset.datatables);

	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var sel_datatable = heatmapConfig.getDatatableAt(idx);
		html += "<tr>";
		html += "<td style='border: none; text-decoration: underline; font-size: 9px'><a href='#' onclick='heatmap_step_display_config(" + idx + ",\"" + map_name + "\")'><span id='heatmap_editor_datatable_config_" + idx + "' class='" + (sel_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";
		html += "<td><select id='heatmap_editor_datatable_" + idx + "' onchange='heatmap_select_datatable(" + idx + ", \"" + map_name + "\")'>\n";
		html += "<option value='_none_'>Select a datatable</option>\n";
		for (var datatable_name in navicell.dataset.datatables) {
			var datatable = navicell.dataset.datatables[datatable_name];
			var selected = sel_datatable && sel_datatable.getId() == datatable.getId() ? " selected": "";
			html += "<option value='" + datatable.getCanonName() + "'" + selected + ">" + datatable.name + "</option>";
		}
		html += "</select></td>";
		if ((sel_gene || sel_modif_id) && sel_datatable) {
			var displayConfig = sel_datatable.getDisplayConfig(module);
			var gene_name = (sel_gene ? sel_gene.name : "");
			for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
				var sel_group = heatmapConfig.getGroupAt(idx2);
				var sel_sample = heatmapConfig.getSampleAt(idx2);
				var style = undefined;
				var value = undefined;
				if (sel_sample) {
					if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
						style = displayConfig.getHeatmapStyleSampleByModifId(sel_sample.name, sel_modif_id);
						value = displayConfig.getColorSampleValueByModifId(sel_sample.name, sel_modif_id);
					} else {
						style = displayConfig.getHeatmapStyleSample(sel_sample.name, gene_name);
						value = displayConfig.getColorSampleValue(sel_sample.name, gene_name);
					}
				} else if (sel_group) {
					if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
						style = displayConfig.getHeatmapStyleGroupByModifId(sel_group, sel_modif_id);
						value = displayConfig.getColorGroupValueByModifId(sel_group, sel_modif_id);
					} else {
						style = displayConfig.getHeatmapStyleGroup(sel_group, gene_name);
						value = displayConfig.getColorGroupValue(sel_group, gene_name);
					}
				}
				if (style != undefined && value != undefined && value != INVALID_VALUE) {
					if (value.toString() == '') {
						value = 'NA';
					}
					html += "<td class='heatmap_cell' " + style + ">" + value + "</td>";
				} else {
					value = (sel_group || sel_sample ? 'undefined' : '&nbsp;');
					html += "<td style='text-align: center;' class='heatmap_cell'>" + value + "</td>";
				}
			}
		} else {
			for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
				html += "<td class='heatmap_cell'>&nbsp;</td>";
			}
		}
		html += "</tr>\n";
	}

	html += "</tbody>";

	table.append(html);

	html = "<table cellspacing='5'><tr><td><span style='font-size: small; font-weight: bold'>Size</span></td>";
	var size = heatmapConfig.getSize();

	html += "<td><select id='heatmap_editor_size' onchange='heatmap_editor_set_editing(true, undefined, \"" + map_name + "\")'>";
	html += "<option value='1'" + (size == 1 ? " selected" : "") +">Tiny</option>";
	html += "<option value='2'" + (size == 2 ? " selected" : "") +">Small</option>";
	html += "<option value='4'" + (size == 4 ? " selected" : "") +">Medium</option>";
	html += "<option value='6'" + (size == 6 ? " selected" : "") +">Large</option>";
	html += "<option value='8' " + (size == 8 ? " selected" : "") +">Very Large</option>";
	html += "</select><td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td><td style='text-align: center; padding-left: 50px; padding-right: 50px' class='slider-title'>Heatmap Transparency</td>";
	html == "</tr>";

	var scale_size = heatmapConfig.getScaleSize();
	html += "<tr><td>&nbsp;</td>";
	html += "<td><select id='heatmap_editor_scale_size' onchange='heatmap_editor_set_editing(true, undefined, \"" + map_name + "\")'>\n";
	html += "<option value='0'" + (scale_size == 0 ? " selected" : "") +">Do not depend on scale</option>\n";
	html += "<option value='1'" + (scale_size == 1 ? " selected" : "") +">Depend on scale</option>\n";
	html += "<option value='2'" + (scale_size == 2 ? " selected" : "") +">Depend on sqrt(scale)</option>\n";
	html += "<option value='3'" + (scale_size == 3 ? " selected" : "") +">Depend on sqrt(scale)/2</option>\n";
	html += "<option value='4'" + (scale_size == 4 ? " selected" : "") +">Depend on sqrt(scale)/3</option>\n";
	html += "<option value='5'" + (scale_size == 5 ? " selected" : "") +">Depend on sqrt(scale)/4</option>\n";
	html += "</select><td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td><td><div id='heatmap_editor_slider_div'></div></td>";
	html += "</tr></table>";

	$("#heatmap_editor_size_div", doc).html(html);

	var slider = $("#heatmap_editor_slider_div", doc);
	slider.slider({
		slide: function( event, ui ) {
			nv_perform("nv_heatmap_editor_perform", get_win(map_name), "set_transparency", ui.value);
		}
	});

	slider.slider("value", heatmapConfig.getTransparency());
	add_transparency_slider_labels(slider);

	drawing_config.getEditingHeatmapConfig().setSlider(slider);
	drawing_config.getHeatmapConfig().setSlider(slider);

	html = "Apply this configuration to gene" + (sel_m_genes ? "s" : "") + ":&nbsp;";
	html += "<select id='heatmap_select_gene' onchange='update_heatmap_editor(window.document, null, navicell.getDrawingConfig(\"" + module + "\").getEditingHeatmapConfig(), true)'>\n";
	html += "<option value='_none_'></option>\n";
	var sorted_gene_names = navicell.dataset.getSortedGeneNames();
	for (var idx in sorted_gene_names) {
		var gene_name = sorted_gene_names[idx];
		var gene = navicell.dataset.genes[gene_name];
		var selected = sel_gene && sel_gene.getId() == gene.getId() ? " selected": "";
		html += "<option value='" + navicell.dataset.genes[gene_name].getId() + "'" + selected + ">" + gene_name + (DISPLAY_MODIF_ID && selected && sel_modif_id ? (" (" + sel_modif_id + ")") : "") + "</option>\n";
	}
	if (sel_m_genes && !sel_gene) {
		html += "<option value='" + sel_m_genes + "' selected>" + (sel_m_genes ? sel_m_genes : "") + "</option>\n";
	}
	html += "</select>";
	html += "<div id='heatmap_select_m_genes'>" + (sel_m_genes ? sel_m_genes : "") + "</div>";
	html += "<div id='heatmap_select_modif_id'>" + (sel_modif_id ? sel_modif_id : "") + "</div>";

	$("#heatmap_gene_choice", doc).html(html);
	$("#heatmap_select_m_genes", doc).css("display", "none");
	$("#heatmap_select_modif_id", doc).css("display", "none");

        $("#heatmap_clear_samples", doc).css("font-size", "10px");
        $("#heatmap_all_samples", doc).css("font-size", "10px");
        $("#heatmap_all_groups", doc).css("font-size", "10px");
}

function draw_heatmap(module, overlay, context, scale, modif_id, gene_name, topx, topy)
{
	if (!module) {
		module = get_module();
	}
	var drawing_config = navicell.getDrawingConfig(module);
	var heatmapConfig = drawing_config.getHeatmapConfig();
	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;

	if (sample_group_cnt > max_heatmap_sample_cnt) {
		sample_group_cnt = max_heatmap_sample_cnt;
	}

	var datatable_cnt = mapSize(navicell.dataset.datatables);

	var scale2 = heatmapConfig.getScale(scale);
	var size = heatmapConfig.getSize()*2;
	var cell_w = size*scale2;
	var cell_h = size*scale2;

	topx += 12; // does not depend on scale
	topy -= cell_h * datatable_cnt + 3;

	context.globalAlpha = slider2alpha(heatmapConfig.getTransparency());

	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var sel_datatable = heatmapConfig.getDatatableAt(idx);
		if (!sel_datatable) {
			topy += cell_h;
		}
	}

	var start_y = topy;
	var start_x = topx;

	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var sel_datatable = heatmapConfig.getDatatableAt(idx);
		if (!sel_datatable) {
			continue;
		}
		var displayConfig = sel_datatable.getDisplayConfig(module);
		start_x = topx;
		for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
			var sel_group = heatmapConfig.getGroupAt(idx2);
			var sel_sample = heatmapConfig.getSampleAt(idx2);
			var bg = undefined;
			var value = undefined;
			if (sel_sample) {
				if (USE_MODIF_ID_FOR_COLORS) {	
					bg = displayConfig.getColorSampleByModifId(sel_sample.name, modif_id);
					value = displayConfig.getColorSampleValueByModifId(sel_sample.name, modif_id);
					var bg2 = displayConfig.getColorSample(sel_sample.name, gene_name);
					var value2 = displayConfig.getColorSampleValue(sel_sample.name, gene_name);
				} else {
					bg = displayConfig.getColorSample(sel_sample.name, gene_name);
					value = displayConfig.getColorSampleValue(sel_sample.name, gene_name);
				}
			} else if (sel_group) {
				if (USE_MODIF_ID_FOR_COLORS) {	
					bg = displayConfig.getColorGroupByModifId(sel_group, modif_id);
					value = displayConfig.getColorGroupValueByModifId(sel_group, modif_id);
				} else {
					bg = displayConfig.getColorGroup(sel_group, gene_name);
					value = displayConfig.getColorGroupValue(sel_group, gene_name);
				}
			} else {
				break; // EV: added 2014-11-10
			}
			if (bg != undefined && value != undefined && value != INVALID_VALUE) {
				var fg = getFG_from_BG(bg);
				context.fillStyle = "#" + bg;
				//console.log("start_x " + start_x + " " + start_y + " " + cell_w + " " + cell_h);
				fillStrokeRect(context, start_x, start_y, cell_w, cell_h);
				start_x += cell_w;
			}
		}
		start_y += cell_h;
	}
	overlay.addBoundBox([topx, topy, start_x-topx, start_y-topy], gene_name, "heatmap", undefined, modif_id);
}

function barplot_editor_set_editing(val, idx) {
	$("#barplot_editing").html(val ? EDITING_CONFIGURATION : "");
	var module = get_module_from_doc(window.document);
	var drawing_config = navicell.getDrawingConfig(module);
	if (val) {
		barplot_editor_apply(drawing_config.getEditingBarplotConfig());
		window.update_barplot_editor(window.document, null, drawing_config.getEditingBarplotConfig());
	}
	if (idx != undefined) {
		if ($("#barplot_editor_datatable_" + idx).val() != '_none_') {
			$("#barplot_editor_datatable_config_" + idx).removeClass("zz-hidden");	
		} else {
			$("#barplot_editor_datatable_config_" + idx).addClass("zz-hidden");	
		}
	}
	var msg = get_barplot_config_message(false);
	$("#barplot_editor_msg_div").html(msg);
}

// 2013-09-03 TBD: must add a doc argument: but as this function is called
// from a string evaluation (onchange='step_display_config(...)'), I propose
// to give the doc_idx and get the doc value from an associative array.
// => should maintain an associative array: doc_idx -> doc
// + attribute doc.doc_idx
function barplot_step_display_config(idx, map_name) {
	var val = $("#barplot_editor_datatable_" + idx).val();
	if (val != '_none_') {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		if (datatable) {
			var doc = (map_name && maps ? maps[map_name].document : null);
			datatable.showDisplayConfig(doc, datatable.biotype.isUnorderedDiscrete() ? COLOR_SIZE_CONFIG : 'color');
		}
	}
}

function barplot_sample_action_perform(action, cnt) {
	var module = get_module_from_doc(window.document);
	var drawing_config = navicell.getDrawingConfig(module);
	if (action == "clear_samples") {
		drawing_config.getEditingBarplotConfig().reset(true);
	} else if (action == "all_samples") {
		drawing_config.getEditingBarplotConfig().reset(true);
		max_barplot_sample_cnt = drawing_config.getEditingBarplotConfig().setAllSamples();
	} else if (action == "all_groups") {
		drawing_config.getEditingBarplotConfig().reset(true);
		max_barplot_sample_cnt = drawing_config.getEditingBarplotConfig().setAllGroups();
	} else if (action == "from_heatmap") {
		var heatmap_config = drawing_config.getHeatmapConfig();
		var cnt = heatmap_config.getSampleOrGroupCount();
		if (cnt) {
			drawing_config.getEditingBarplotConfig().reset(true);
			max_barplot_sample_cnt = drawing_config.getEditingBarplotConfig().setSamplesOrGroups(heatmap_config.getSamplesOrGroups());
		}
	}

	if (cnt) {
		max_barplot_sample_cnt = cnt;
	}
	max_barplot_sample_cnt = DEF_MAX_BARPLOT_SAMPLE_CNT;

	$("#barplot_editing").html(EDITING_CONFIGURATION);
	update_barplot_editor(window.document);
	var msg = get_barplot_config_message(false);
	$("#barplot_editor_msg_div").html(msg);
}

function barplot_sample_action(action_str, map_name) {
	nv_perform("nv_barplot_editor_perform", get_win(map_name), action_str);
}

function barplot_select_sample(idx, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_barplot_editor_perform", get_win(map_name), "select_sample", idx, $("#barplot_editor_gs_" + idx, doc).val());
}

function barplot_select_datatable(idx, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_barplot_editor_perform", get_win(map_name), "select_datatable", $("#barplot_editor_datatable_" + idx, doc).val());
}

// TBD: class BarplotEditor
function update_barplot_editor(doc, params, barplotConfig, ignore_sel_modif_id) {
	var module = get_module_from_doc(doc);
	var drawing_config = navicell.getDrawingConfig(module);
	if (!barplotConfig) {
		barplotConfig = drawing_config.getEditingBarplotConfig();
	}
	var map_name = doc ? doc.map_name : "";
	var div = $("#barplot_editor_div", doc);
	var topdiv = div.parent().parent();
	var empty_cell_style = "background: " + topdiv.css("background") + "; border: none;";
	var table = $("#barplot_editor_table", doc);
	var sel_gene_id = $("#barplot_select_gene", doc).val();
	var sel_gene = sel_gene_id ? navicell.dataset.getGeneById(sel_gene_id) : null;
	var sel_modif_id = (ignore_sel_modif_id ? "" : $("#barplot_select_modif_id", doc).html());
	var sel_m_genes = (ignore_sel_modif_id ? "" : $("#barplot_select_m_genes", doc).html());

	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;

	if (sample_group_cnt > max_barplot_sample_cnt) {
		sample_group_cnt = max_barplot_sample_cnt;
	}
	table.children().remove();
	var html = "";
	html += "<tbody>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td><td colspan='1' style='" + empty_cell_style + "'>" + make_button("Clear Samples", "barplot_clear_samples", "barplot_sample_action(\"clear_samples\", \"" + map_name + "\")") + "&nbsp;&nbsp;&nbsp;";
	html += "</td><td colspan='1' style='" + empty_cell_style + "'>";
	html += make_button("All samples", "barplot_all_samples", "barplot_sample_action(\"all_samples\", \"" + map_name + "\")") + "&nbsp;&nbsp;&nbsp;";
	if (group_cnt) {
		html += "<td style='" + empty_cell_style + "'>" + make_button("All groups", "barplot_all_groups", "barplot_sample_action(\"all_groups\", \"" + map_name + "\")");
	}
	html += "</td></tr>";
	if (drawing_config.getHeatmapConfig().getSampleOrGroupCount()) {
		var label = (group_cnt ? "Samples and Groups" : "Samples") + " from Heatmap";
		html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td><td style='" + empty_cell_style + "'>&nbsp;</td><td colspan='1' style='" + empty_cell_style + "'>";
		html += make_button(label, "barplot_from_heatmap", "barplot_sample_action(\"from_heatmap\", \"" + map_name + "\")");
		html += "</td></tr>";
	}
	html += "<tr><td style='" + empty_cell_style + " height: 10px'>&nbsp;</td>";
	var idx = 0;
	var sel_datatable = barplotConfig.getDatatableAt(idx);
	html += "<tr>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td>";
	var MAX_BARPLOT_HEIGHT = 100.;
	//console.log("sel_gene " + sel_gene + " -- " + sel_modif_id);
	if ((sel_gene || sel_modif_id) && sel_datatable) {
		var displayConfig = sel_datatable.getDisplayConfig(module);
		var gene_name = (sel_gene ? sel_gene.name : "");
		for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
			var sel_group = barplotConfig.getGroupAt(idx2);
			var sel_sample = barplotConfig.getSampleAt(idx2);
			var style = undefined, height = undefined;
			if (sel_sample) {
				if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
					style = displayConfig.getBarplotStyleSampleByModifId(sel_sample.name, sel_modif_id);
					height = "height: " + displayConfig.getBarplotSampleHeightByModifId(sel_sample.name, sel_modif_id, MAX_BARPLOT_HEIGHT) + "px;";
				} else {
					style = displayConfig.getBarplotStyleSample(sel_sample.name, gene_name);
					height = "height: " + displayConfig.getBarplotSampleHeight(sel_sample.name, gene_name, MAX_BARPLOT_HEIGHT) + "px;";
				}
			} else if (sel_group) {
				if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
					style = displayConfig.getBarplotStyleGroupByModifId(sel_group, sel_modif_id);
					height = "height: " + displayConfig.getBarplotGroupHeightByModifId(sel_group, sel_modif_id, MAX_BARPLOT_HEIGHT) + "px;";
				} else {
					style = displayConfig.getBarplotStyleGroup(sel_group, gene_name);
					height = "height: " + displayConfig.getBarplotGroupHeight(sel_group, gene_name, MAX_BARPLOT_HEIGHT) + "px;";
				}
			}
			if (style != undefined) {
				style += height + "width: 100%;";
				html += "<td style='" + height + "width: 100%; vertical-align: bottom;'><table style='" + height + "width: 100%'><tr>";
				html += "<td class='barplot_cell' " + style + ">&nbsp;</td>";
				html += "</tr></table></td>";
			} else {
				html += "<td class='barplot_cell'>&nbsp;</td>";
			}
		}
	} else {
		for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
			html += "<td class='barplot_cell'>&nbsp;</td>";
		}
	}
	html += "</tr>\n";

	html += "<tr>\n";
	html += "<td style='border: none; text-decoration: underline; font-size: 9px'><a href='#' onclick='barplot_step_display_config(" + idx + ", \"" + map_name + "\")'><span id='barplot_editor_datatable_config_" + idx + "' class='" + (sel_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";

	html += "<td><select id='barplot_editor_datatable_" + idx + "' onchange='barplot_select_datatable(" + idx + ", \"" + map_name + "\")'>\n";
	html += "<option value='_none_'>Select a datatable</option>\n";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		var selected = sel_datatable && sel_datatable.getId() == datatable.getId() ? " selected": "";
		html += "<option value='" + datatable.getCanonName() + "'" + selected + ">" + datatable.name + "</option>";
	}
	html += "</select></td>";

	if ((sel_gene || sel_modif_id) && sel_datatable) {
		var config = sel_datatable.biotype.isUnorderedDiscrete() ? COLOR_SIZE_CONFIG : 'color';
		var gene_name = (sel_gene ? sel_gene.name : "");
		var displayConfig = sel_datatable.getDisplayConfig(module);
		for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
			var sel_group = barplotConfig.getGroupAt(idx2);
			var sel_sample = barplotConfig.getSampleAt(idx2);
			var value = undefined;
			if (sel_sample) {
				if (USE_MODIF_ID_FOR_COLORS && sel_modif_id) {
					value = displayConfig.getColorSizeSampleValueByModifId(sel_sample.name, sel_modif_id);
				} else {
					value = displayConfig.getColorSizeSampleValue(sel_sample.name, gene_name);
				}
			} else if (sel_group) {
				if (USE_MODIF_ID_FOR_COLORS && sel_modif_id) {
					value = displayConfig.getColorSizeGroupValueByModifId(sel_group, sel_modif_id);
				} else {
					value = displayConfig.getColorSizeGroupValue(sel_group, gene_name);
				}
			}
			if (value != undefined && value != INVALID_VALUE) {
				var style = "style='text-align: center;'";
				if (value.toString() == '') {
					value = 'NA';
				}
				html += "<td class='barplot_cell' " + style + ">" + value + "</td>";
			} else {
				value = (sel_group || sel_sample ? 'undefined' : '&nbsp;');
				html += "<td style='text-align: center;' class='barplot_cell'>" + value + "</td>";
			}
		}
	} else {
		for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
			html += "<td class='barplot_cell'>&nbsp;</td>";
		}
	}

	html += "</tr>\n";

	html += "<td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td>";
	var select_title = group_cnt ? 'Select a group or sample' : 'Select a sample';
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		html += "<td style='border: 0px'><select id='barplot_editor_gs_" + idx + "' onchange='barplot_select_sample(" + idx + ", \"" + map_name + "\")'>\n";
		html += "<option value='_none_'>" + select_title + "</option>\n";
		var sel_group = barplotConfig.getGroupAt(idx);
		var sel_sample = barplotConfig.getSampleAt(idx);
		var group_names = get_group_names();
		for (var group_idx in group_names) {
			var group_name = group_names[group_idx];
			var group = navicell.group_factory.group_map[group_name];
			var selected = sel_group && sel_group.getId() == group.getId() ? " selected": "";
			//html += "<option value='g_" + group.getId() + "'" + selected + ">" + group.name + "</option>";
			html += "<option value='g_" + group.getCanonName() + "'" + selected + ">" + group.name + "</option>";
		}
		var sel_sample = barplotConfig.getSampleAt(idx);
		var sample_names = get_sample_names();
		for (var sample_idx in sample_names) {
			var sample_name = sample_names[sample_idx];
			var sample = navicell.dataset.samples[sample_name];
			var selected = sel_sample && sel_sample.getId() == sample.getId() ? " selected": "";
			//html += "<option value='s_" + sample.getId() + "'" + selected + ">" + sample_name + "</option>";
			html += "<option value='s_" + sample.getCanonName() + "'" + selected + ">" + sample_name + "</option>";
		}
		html += "</select>";
		html += "</td>";
	}

	html += "</tr>\n";

	html += "</tbody>";

	table.append(html);

	html = "<table cellspacing='5'><tr><td><span style='font-size: small; font-weight: bold'>Size</span></td>";
	var height = barplotConfig.getHeight();

	html += "<td><select id='barplot_editor_height' onchange='barplot_editor_set_editing(true)'>";
	html += "<option value='1'" + (height == 1 ? " selected" : "") +">Tiny Height</option>";
	html += "<option value='2'" + (height == 2 ? " selected" : "") +">Small Height</option>";
	html += "<option value='4'" + (height == 4 ? " selected" : "") +">Medium Height</option>";
	html += "<option value='6'" + (height == 6 ? " selected" : "") +">Large Height</option>";
	html += "<option value='8' " + (height == 8 ? " selected" : "") +">Very Large Height</option>";
	html += "</select><td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td><td style='text-align: center; padding-left: 50px; padding-right: 50px' class='slider-title'>Barplot Transparency</td>";
	html += "</tr>";

	var width = barplotConfig.getWidth();

	html += "<tr><td>&nbsp;</td>";
	html += "<td><select id='barplot_editor_width' onchange='barplot_editor_set_editing(true)'>";
	html += "<option value='1'" + (width == 1 ? " selected" : "") +">Tiny Width</option>";
	html += "<option value='2'" + (width == 2 ? " selected" : "") +">Small Width</option>";
	html += "<option value='4'" + (width == 4 ? " selected" : "") +">Medium Width</option>";
	html += "<option value='6'" + (width == 6 ? " selected" : "") +">Large Width</option>";
	html += "<option value='8' " + (width == 8 ? " selected" : "") +">Very Large Width</option>";
	html += "</select><td>";
	html += "<td style='" + empty_cell_style + "'>&nbsp;</td><td><div id='barplot_editor_slider_div'></div></td>";
	html += "</tr>";

	var scale_size = barplotConfig.getScaleSize();
	html += "<tr><td>&nbsp;</td>";
	html += "<td><select id='barplot_editor_scale_size' onchange='barplot_editor_set_editing(true)'>\n";
	html += "<option value='0'" + (scale_size == 0 ? " selected" : "") +">Do not depend on scale</option>\n";
	html += "<option value='1'" + (scale_size == 1 ? " selected" : "") +">Depend on scale</option>\n";
	html += "<option value='2'" + (scale_size == 2 ? " selected" : "") +">Depend on sqrt(scale)</option>\n";
	html += "<option value='3'" + (scale_size == 3 ? " selected" : "") +">Depend on sqrt(scale)/2</option>\n";
	html += "<option value='4'" + (scale_size == 4 ? " selected" : "") +">Depend on sqrt(scale)/3</option>\n";
	html += "<option value='5'" + (scale_size == 5 ? " selected" : "") +">Depend on sqrt(scale)/4</option>\n";
	html += "</select><td>";
	html += "</tr></table>";

	$("#barplot_editor_size_div", doc).html(html);

	var slider = $("#barplot_editor_slider_div", doc);
	slider.slider({
		slide: function( event, ui ) {
			nv_perform("nv_barplot_editor_perform", get_win(map_name), "set_transparency", ui.value);
		}
	});

	slider.slider("value", barplotConfig.getTransparency());
	add_transparency_slider_labels(slider);
	drawing_config.getEditingBarplotConfig().setSlider(slider);
	drawing_config.getBarplotConfig().setSlider(slider);

	html = "Apply this configuration to gene" + (sel_m_genes ? "s" : "") + ":&nbsp;";
	html += "<select id='barplot_select_gene' onchange='update_barplot_editor(window.document, null, navicell.getDrawingConfig(\"" + module + "\").getEditingBarplotConfig(), true)'>\n";
	html += "<option value='_none_'></option>\n";
	var sorted_gene_names = navicell.dataset.getSortedGeneNames();
	for (var idx in sorted_gene_names) {
		var gene_name = sorted_gene_names[idx];
		var gene = navicell.dataset.genes[gene_name];
		var selected = sel_gene && sel_gene.getId() == gene.getId() ? " selected": "";
		html += "<option value='" + navicell.dataset.genes[gene_name].getId() + "'" + selected + ">" + gene_name + (DISPLAY_MODIF_ID && selected && sel_modif_id ? (" (" + sel_modif_id + ")") : "") + "</option>\n";
	}
	if (sel_m_genes && !sel_gene) {
		html += "<option value='" + sel_m_genes + "' selected>" + (sel_m_genes ? sel_m_genes : "") + "</option>\n";
	}
	html += "</select>";
	html += "<div id='barplot_select_m_genes'>" + (sel_m_genes ? sel_m_genes : "") + "</div>";
	html += "<div id='barplot_select_modif_id'>" + (sel_modif_id ? sel_modif_id : "") + "</div>";
	$("#barplot_gene_choice", doc).html(html);
	$("#barplot_select_m_genes", doc).css("display", "none");
	$("#barplot_select_modif_id", doc).css("display", "none");

        $("#barplot_clear_samples", doc).css("font-size", "10px");
        $("#barplot_all_samples", doc).css("font-size", "10px");
        $("#barplot_all_groups", doc).css("font-size", "10px");
}

function draw_barplot(module, overlay, context, scale, modif_id, gene_name, topx, topy)
{
	if (!module) {
		module = get_module();
	}
	var drawing_config = navicell.getDrawingConfig(module);
	var barplotConfig = drawing_config.getBarplotConfig();
	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;

	if (sample_group_cnt > max_barplot_sample_cnt) {
		sample_group_cnt = max_barplot_sample_cnt;
	}

	var datatable_cnt = mapSize(navicell.dataset.datatables);

	var scale2 = barplotConfig.getScale(scale);
	var width = barplotConfig.getWidth()*1.5;
	var height = barplotConfig.getHeight()*1.5;
	var cell_w = width*scale2;
	var cell_h = height*scale2;

	topx += 12; // does not depend on scale
	var maxy = cell_h*4;
	var start_x = topx;
	var start_y = topy - 3;
	var idx = 0;
	var sel_datatable = barplotConfig.getDatatableAt(idx);
	if (!sel_datatable) {
		return;
	}
	context.globalAlpha = slider2alpha(barplotConfig.getTransparency());
	var displayConfig = sel_datatable.getDisplayConfig(module);
	for (var idx2 = 0; idx2 < sample_group_cnt; ++idx2) {
		var sel_group = barplotConfig.getGroupAt(idx2);
		var sel_sample = barplotConfig.getSampleAt(idx2);
		var bg = undefined;
		var height = undefined;
		if (sel_sample) {
			if (USE_MODIF_ID_FOR_COLORS) {
				bg = displayConfig.getColorSizeSampleByModifId(sel_sample.name, modif_id);
				height = displayConfig.getBarplotSampleHeightByModifId(sel_sample.name, modif_id, maxy);
				var bg2 = displayConfig.getColorSizeSample(sel_sample.name, gene_name);
				var height2 = displayConfig.getBarplotSampleHeight(sel_sample.name, gene_name, maxy);
			} else {
				bg = displayConfig.getColorSizeSample(sel_sample.name, gene_name);
				height = displayConfig.getBarplotSampleHeight(sel_sample.name, gene_name, maxy);
			}
		} else if (sel_group) {
			if (USE_MODIF_ID_FOR_COLORS) {
				bg = displayConfig.getColorSizeGroupByModifId(sel_group, modif_id);
				height = displayConfig.getBarplotGroupHeightByModifId(sel_group, modif_id, maxy);
			} else {
				bg = displayConfig.getColorSizeGroup(sel_group, gene_name);
				height = displayConfig.getBarplotGroupHeight(sel_group, gene_name, maxy);
			}
		} else {
			break; // EV: added 2014-11-10
		}

		if (bg != undefined && height != undefined) {
			var fg = getFG_from_BG(bg);
			context.fillStyle = "#" + bg;
			fillStrokeRect(context, start_x, start_y-height, cell_w, height);
			start_x += cell_w;
		}
	}

	overlay.addBoundBox([topx, start_y-maxy, start_x-topx, maxy], gene_name, "barplot", undefined, modif_id);
}

function datatable_select(id, onchange, sel_datatable) {
	var html = "<select id='" + id + "' onchange='" + onchange + "'>";

	html += "<option value='_none_'>Select a datatable</option>\n";
	for (var datatable_name in navicell.dataset.datatables) {
		var datatable = navicell.dataset.datatables[datatable_name];
		var selected = sel_datatable && sel_datatable.getId() == datatable.getId() ? " selected": "";
		html += "<option value='" + datatable.getCanonName() + "'" + selected + ">" + datatable.name + "</option>\n";
	}
	return html + "</select>";
}

function sample_or_group_select(id, onchange, sel_group, sel_sample) {
	var html = "<select id='" + id + "' onchange='" + onchange + "'>";
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var select_title = group_cnt ? 'Select a group or sample' : 'Select a sample';
	html += "<option value='_none_'>" + select_title + "</option>\n";
	var group_names = get_group_names();
	if (group_names.length) {
		group_names.sort();
		for (var idx in group_names) {
			var group_name = group_names[idx];
			var group = navicell.group_factory.group_map[group_name];
			var selected = sel_group && sel_group.getId() == group.getId() ? " selected": "";
			//html += "<option value='g_" + group.getId() + "'" + selected + ">" + group.name + "</option>\n";
			html += "<option value='g_" + group.getCanonName() + "'" + selected + ">" + group.name + "</option>\n";
		}
	}
	var sample_names = get_sample_names();
	for (var idx in sample_names) {
		var sample_name = sample_names[idx];
		var sample = navicell.dataset.samples[sample_name];
		var selected = sel_sample && sel_sample.getId() == sample.getId() ? " selected": "";
		//html += "<option value='s_" + sample.getId() + "'" + selected + ">" + sample_name + "</option>\n";
		html += "<option value='s_" + sample.getCanonName() + "'" + selected + ">" + sample_name + "</option>\n";
	}

	return html + "</select>";
}

function get_glyph_config_message(num, head) {
	var msg_cont = head ? "<br/>&nbsp;&nbsp;" : "<br/>";
	var msg_beg = head ? ("You must:<br/>" + msg_cont) : "";
	var msg = "";

	if ($("#glyph_editor_gs_" + num).val() == "_none_") {
		var group_cnt = mapSize(navicell.group_factory.group_map);
		msg = msg_beg + (group_cnt ? 'select a sample or group' : 'select a sample');
	}
	if ($("#glyph_editor_datatable_shape_" + num).val() == "_none_") {
		msg += (msg ? msg_cont : msg_beg);
		msg += "select a datatable to be used for Shape";
	}
	if ($("#glyph_editor_datatable_color_" + num).val() == "_none_") {
		msg += (msg ? msg_cont : msg_beg);
		msg += "select a datatable to be used for Color";
	}
	if ($("#glyph_editor_datatable_size_" + num).val() == "_none_") {
		msg += (msg ? msg_cont : msg_beg);
		msg += "select a datatable to be used for Size";
	}
	return msg;
}

function get_heatmap_config_message(head) {
	var msg_cont = head ? "<br/>&nbsp;&nbsp;" : "<br/>";
	var msg_beg = head ? ("You must:<br/>" + msg_cont) : "";
	var msg = "";

	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;
	var datatable_cnt = mapSize(navicell.dataset.datatables);

	var found = false;
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		var val = $("#heatmap_editor_gs_" + idx).val();
		if (val != undefined && val != "_none_") {
			found = true;
			break;
		}
	}
	if (!found) {
		msg = msg_beg + (group_cnt ? 'select at least one sample or group' : 'select at least one sample');
	}

	found = false;
	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var val = $("#heatmap_editor_datatable_" + idx).val();
		if (val != undefined && val != "_none_") {
			found = true;
			break;
		}
	}
	if (!found) {
		msg += (msg ? msg_cont : msg_beg);
		msg += datatable_cnt > 1 ? "select at least one datatable" : "select a datatable";
	}
	return msg;
}

function get_barplot_config_message(head) {
	var msg_cont = head ? "<br/>&nbsp;&nbsp;" : "<br/>";
	var msg_beg = head ? ("You must:<br/>" + msg_cont) : "";
	var msg = "";

	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;
	var datatable_cnt = mapSize(navicell.dataset.datatables);

	var found = false;
	for (var idx = 0; idx < sample_group_cnt; ++idx) {
		var val = $("#barplot_editor_gs_" + idx).val();
		if (val != undefined && val != "_none_") {
			found = true;
			break;
		}
	}
	if (!found) {
		msg = msg_beg + (group_cnt ? 'select at least one sample or group' : 'select at least one sample');
	}

	found = false;
	for (var idx = 0; idx < datatable_cnt; ++idx) {
		var val = $("#barplot_editor_datatable_" + idx).val();
		if (val != undefined && val != "_none_") {
			found = true;
			break;
		}
	}
	if (!found) {
		msg += (msg ? msg_cont : msg_beg);
		msg += "select a datatable";
	}
	return msg;
}

function get_map_staining_config_message(head) {
	var msg_cont = head ? "<br/>&nbsp;&nbsp;" : "<br/>";
	var msg_beg = head ? ("You must:<br/>" + msg_cont) : "";
	var msg = "";

	var sample_cnt = mapSize(navicell.dataset.samples);
	var group_cnt = mapSize(navicell.group_factory.group_map);
	var sample_group_cnt = sample_cnt + group_cnt;
	var datatable_cnt = mapSize(navicell.dataset.datatables);

	var found = false;
	var val = $("#map_staining_editor_gs").val();
	if (val != undefined && val != "_none_") {
		found = true;
	}
	if (!found) {
		msg = msg_beg + (group_cnt ? 'select a sample or group' : 'select a sample');
	}

	found = false;
	var val = $("#map_staining_editor_datatable_color").val();
	if (val != undefined && val != "_none_") {
		found = true;
	}
	if (!found) {
		msg += (msg ? msg_cont : msg_beg);
		msg += "select a datatable to be used for Color";
	}
	return msg;
}

function glyph_editor_set_editing(num, val, what) {
	$("#glyph_editing_" + num).html(val ? EDITING_CONFIGURATION : "");
	var module = get_module_from_doc(window.document);
	var drawing_config = navicell.getDrawingConfig(module);
	if (val) {
		document.win.glyph_editor_apply(num, drawing_config.getEditingGlyphConfig(num));
		document.win.update_glyph_editor(document, null, num, drawing_config.getEditingGlyphConfig(num));
	}
	if (what != undefined) {
		if ($("#glyph_editor_datatable_" + what).val() != '_none_') {
			$("#glyph_editor_datatable_config_" + what).removeClass("zz-hidden");	
		} else {
			$("#glyph_editor_datatable_config_" + what).addClass("zz-hidden");	
		}
	}
	var msg = get_glyph_config_message(num, false);
	$("#glyph_editor_msg_div_" + num).html(msg);
}

function glyph_step_display_config(what, num, map_name) {
	var val = $("#glyph_editor_datatable_" + what + "_" + num).val();
	if (val != '_none_') {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		if (datatable) {
			var doc = (map_name && maps ? maps[map_name].document : null);
			datatable.showDisplayConfig(doc, what);
		}
	}
}

function draw_glyph_in_canvas(module, glyphConfig, ignore_sel_modif_id, doc)
{
	var num = glyphConfig.num;
	var sel_shape_datatable = glyphConfig.getShapeDatatable();
	var sel_color_datatable = glyphConfig.getColorDatatable();
	var sel_size_datatable = glyphConfig.getSizeDatatable();
	var sel_gene_id = $("#glyph_select_gene_" + num, doc).val();
	var sel_gene = sel_gene_id ? navicell.dataset.getGeneById(sel_gene_id) : null;
	var sel_modif_id = (ignore_sel_modif_id ? "" : $("#glyph_select_modif_id_" + num, doc).html());
	var sel_m_genes = (ignore_sel_modif_id ? "" : $("#glyph_select_m_genes_" + num, doc).html());
	var sel_group = glyphConfig.getGroup();
	var sel_sample = glyphConfig.getSample();
	if ((sel_gene || sel_modif_id) && sel_shape_datatable && sel_color_datatable && sel_size_datatable && (sel_group || sel_sample)) {
		var shape, color, size;
		var gene_name = (sel_gene ? sel_gene.name : '');
		if (sel_sample) {
			var sample_name = sel_sample.name;
			if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeSampleByModifId(sample_name, sel_modif_id);
				color = sel_color_datatable.getDisplayConfig(module).getColorSampleByModifId(sample_name, sel_modif_id);
				size = sel_size_datatable.getDisplayConfig(module).getSizeSampleByModifId(sample_name, sel_modif_id);
			} else {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeSample(sample_name, gene_name);
				color = sel_color_datatable.getDisplayConfig(module).getColorSample(sample_name, gene_name);
				size = sel_size_datatable.getDisplayConfig(module).getSizeSample(sample_name, gene_name);
			}
		} else {
			if (sel_modif_id && USE_MODIF_ID_FOR_COLORS) {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeGroupByModifId(sel_group, sel_modif_id);
				color = sel_color_datatable.getDisplayConfig(module).getColorGroupByModifId(sel_group, sel_modif_id);
				size = sel_size_datatable.getDisplayConfig(module).getSizeGroupByModifId(sel_group, sel_modif_id);
			} else {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeGroup(sel_group, gene_name);
				color = sel_color_datatable.getDisplayConfig(module).getColorGroup(sel_group, gene_name);
				size = sel_size_datatable.getDisplayConfig(module).getSizeGroup(sel_group, gene_name);
			}
		}

		var drawing_canvas = glyphConfig.getDrawingCanvas();
		if (drawing_canvas) {
			var context = drawing_canvas.getContext('2d');
			context.clearRect(0, 0, drawing_canvas.width, drawing_canvas.height);
			draw_glyph_perform(context, drawing_canvas.width/2, drawing_canvas.height/2, shape, color, size, 8, true, glyphConfig.getTransparency());
		}
		return true;
	}
	return false;
}

function glyph_select_sample(glyph_num, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_glyph_editor_perform", get_win(map_name), "select_sample", glyph_num, $("#glyph_editor_gs_" + glyph_num, doc).val());
}

function glyph_select_datatable_shape(glyph_num, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_glyph_editor_perform", get_win(map_name), "select_datatable_shape", glyph_num, $("#glyph_editor_datatable_shape_" + glyph_num, doc).val());
}

function glyph_select_datatable_color(glyph_num, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_glyph_editor_perform", get_win(map_name), "select_datatable_color", glyph_num, $("#glyph_editor_datatable_color_" + glyph_num, doc).val());
}

function glyph_select_datatable_size(glyph_num, map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_glyph_editor_perform", get_win(map_name), "select_datatable_size", glyph_num, $("#glyph_editor_datatable_size_" + glyph_num, doc).val());
}

function update_glyph_editor(doc, params, num, glyphConfig, ignore_sel_modif_id) {
	// TBD: take modif_id into account
	var module = get_module_from_doc(doc);
	var drawing_config = navicell.getDrawingConfig(module);
	if (!glyphConfig) {
		glyphConfig = drawing_config.getEditingGlyphConfig(num);
	}
	var map_name = doc ? doc.map_name : "";
	var div = $("#glyph_editor_div_" + num, doc);
	var topdiv = div.parent().parent();
	var empty_cell_style = "background: " + topdiv.css("background") + "; border: none;";
	var table = $("#glyph_editor_table_" + num, doc);
	var sel_gene_id = $("#glyph_select_gene_" + num, doc).val();
	var sel_gene = sel_gene_id ? navicell.dataset.getGeneById(sel_gene_id) : null;
	var sel_modif_id = (ignore_sel_modif_id ? "" : $("#glyph_select_modif_id_" + num, doc).html());
	var sel_m_genes = (ignore_sel_modif_id ? "" : $("#glyph_select_m_genes_" + num, doc).html());

	table.children().remove();
	var html = "";
	html += "<tbody>";

	html += "<table><tr><td style='" + empty_cell_style + "'>";

	html += "<table cellpadding='6'><tr>";
	html += "<td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Sample or Group</span></td>";
	html += "<td colspan='2' style='" + empty_cell_style + "'>";
	var sel_group = glyphConfig.getGroup();
	var sel_sample = glyphConfig.getSample();
	html += sample_or_group_select("glyph_editor_gs_" + num, 'glyph_select_sample(' + num + ', "' + map_name + '")', sel_group, sel_sample);
	html += "</td>";
	html += "</tr>";
	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td></tr>";

	html += "<tr><td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Shape</span></td>";

	html += "<td style='" + empty_cell_style + "'>";
	var sel_shape_datatable = glyphConfig.getShapeDatatable();
	html += datatable_select("glyph_editor_datatable_shape_" + num, 'glyph_select_datatable_shape(' + num + ', "' + map_name + '")', sel_shape_datatable);
	html += "</td>";

	html += "<td style='border: none; text-decoration: underline; font-size: 9px; text-align: left;" + empty_cell_style + "'><a href='#' onclick='glyph_step_display_config(\"shape\", " + num + ", \"" + map_name + "\")'><span id='glyph_editor_datatable_config_shape_" + num + "' class='" + (sel_shape_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";
	html += "</tr>";

	html += "<tr><td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Color</span></td>";

	html += "<td style='" + empty_cell_style + "'>";
	var sel_color_datatable = glyphConfig.getColorDatatable();
	html += datatable_select("glyph_editor_datatable_color_" + num, 'glyph_select_datatable_color(' + num + ', "' + map_name + '")', sel_color_datatable);
	html += "</td>";

	html += "<td style='border: none; text-decoration: underline; font-size: 9px; text-align: left;" + empty_cell_style + "'><a href='#' onclick='glyph_step_display_config(\"color\", " + num + ", \"" + map_name + "\")'><span id='glyph_editor_datatable_config_color_" + num + "' class='" + (sel_color_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";

	html += "</tr>";

	html += "<tr><td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Size</span></td>";
	html += "<td style='" + empty_cell_style + "'>";
	var sel_size_datatable = glyphConfig.getSizeDatatable();
	html += datatable_select("glyph_editor_datatable_size_" + num, 'glyph_select_datatable_size(' + num + ', "' + map_name + '")', sel_size_datatable);
	html += "</td>";

	html += "<td style='border: none; text-decoration: underline; font-size: 9px; text-align: left;" + empty_cell_style + "'><a href='#' onclick='glyph_step_display_config(\"size\", " + num + ", \"" + map_name + "\")'><span id='glyph_editor_datatable_config_size_" + num + "' class='" + (sel_size_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";
	html += "</tr>";

	html += "</table>";
	html += "</td>";
	var CANVAS_W = 250;
	var CANVAS_H = 250;
	html += "<td style='width: " + CANVAS_W + "px; height: " + CANVAS_H + "px' id='glyph_editor_td_canvas_" + num + "' style='background: white;'></td>";
	html += "</tr>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td></tr>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td style='" + empty_cell_style + "'><div style='text-align: center' class='slider-title'>Glyph Transparency</div></td></tr>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td><div id='glyph_editor_slider_div_" + num + "'></div></td></tr>";
	html += "</table>";
	html += "</tbody>";

	table.append(html);

	var slider = $("#glyph_editor_slider_div_" + num, doc);
	slider.slider({
		slide: function(event, ui) {
			nv_perform("nv_glyph_editor_perform", get_win(map_name), "set_transparency", num, ui.value);
			draw_glyph_in_canvas(module, glyphConfig, ignore_sel_modif_id, doc);
		}
	});

	slider.slider("value", glyphConfig.getTransparency());
	add_transparency_slider_labels(slider);

	var draw_canvas = doc.createElement('canvas');
	draw_canvas.style.left = '0px';
	draw_canvas.style.top = '0px';

	draw_canvas.width = CANVAS_W;
	draw_canvas.height = CANVAS_H;
	draw_canvas.style.width = draw_canvas.width + 'px';
	draw_canvas.style.height = draw_canvas.height + 'px';

	draw_canvas.style.position = 'relative';
	var context = null;
	var td = $("#glyph_editor_td_canvas_" + num, doc).get(0);
	if (td) {
		td.appendChild(draw_canvas);
		context = draw_canvas.getContext('2d');

		context.clearRect(0, 0, CANVAS_W, CANVAS_H);
	}

	drawing_config.getEditingGlyphConfig(num).setCanvasAndSlider(draw_canvas, slider);
	drawing_config.getGlyphConfig(num).setCanvasAndSlider(draw_canvas, slider);

	if (!draw_glyph_in_canvas(module, glyphConfig, ignore_sel_modif_id, doc) && context) {
		context.clearRect(0, 0, CANVAS_W, CANVAS_H);
	}

	html = "<table cellspacing='5'><tr><td><span style='font-size: small; font-weight: bold'>Size on Map</span></td>";
	var size = glyphConfig.getSize();

	html += "<tr><td>&nbsp;</td>";
	html += "<td><select id='glyph_editor_size_" + num + "' onchange='glyph_editor_set_editing(" + num + ", true)'>";
	html += "<option value='1'" + (size == 1 ? " selected" : "") +">Tiny</option>";
	html += "<option value='2'" + (size == 2 ? " selected" : "") +">Small</option>";
	html += "<option value='4'" + (size == 4 ? " selected" : "") +">Medium</option>";
	html += "<option value='6'" + (size == 6 ? " selected" : "") +">Large</option>";
	html += "<option value='8' " + (size == 8 ? " selected" : "") +">Very Large</option>";
	html += "</select><td>";
	html += "</tr>";

	var scale_size = glyphConfig.getScaleSize();
	html += "<tr><td>&nbsp;</td>";
	html += "<td><select id='glyph_editor_scale_size_" + num + "' onchange='glyph_editor_set_editing(" + num + ", true)'>\n";
	html += "<option value='0'" + (scale_size == 0 ? " selected" : "") +">Do not depend on scale</option>\n";
	html += "<option value='1'" + (scale_size == 1 ? " selected" : "") +">Depend on scale</option>\n";
	html += "<option value='2'" + (scale_size == 2 ? " selected" : "") +">Depend on sqrt(scale)</option>\n";
	html += "<option value='3'" + (scale_size == 3 ? " selected" : "") +">Depend on sqrt(scale)/2</option>\n";
	html += "<option value='4'" + (scale_size == 4 ? " selected" : "") +">Depend on sqrt(scale)/3</option>\n";
	html += "<option value='5'" + (scale_size == 5 ? " selected" : "") +">Depend on sqrt(scale)/4</option>\n";
	html += "</select><td>";
	html += "</tr></table>";

	$("#glyph_editor_size_div_" + num, doc).html(html);

	//html = "Apply this configuration to gene:&nbsp;";
	html = "Apply this configuration to gene" + (sel_m_genes ? "s" : "") + ":&nbsp;";
	html += "<select id='glyph_select_gene_" + num + "' onchange='update_glyph_editor(document, null, " + num + ", navicell.getDrawingConfig(\"" + module + "\").getEditingGlyphConfig( + " + num + "), true)'>\n";
	html += "<option value='_none_'></option>\n";
	var sorted_gene_names = navicell.dataset.getSortedGeneNames();
	for (var idx in sorted_gene_names) {
		var gene_name = sorted_gene_names[idx];
		var gene = navicell.dataset.genes[gene_name];
		var selected = sel_gene && sel_gene.getId() == gene.getId() ? " selected": "";
		//html += "<option value='" + navicell.dataset.genes[gene_name].getId() + "'" + selected + ">" + gene_name + "</option>\n";
		html += "<option value='" + navicell.dataset.genes[gene_name].getId() + "'" + selected + ">" + gene_name + (DISPLAY_MODIF_ID && selected && sel_modif_id ? (" (" + sel_modif_id + ")") : "") + "</option>\n";
	}
	if (sel_m_genes && !sel_gene) {
		html += "<option value='" + sel_m_genes + "' selected>" + (sel_m_genes ? sel_m_genes : "") + "</option>\n";
	}
	html += "</select>";

	html += "<div id='glyph_select_m_genes_" + num + "'>" + (sel_m_genes ? sel_m_genes : "") + "</div>";
	html += "<div id='glyph_select_modif_id_" + num + "'>" + (sel_modif_id ? sel_modif_id : "") + "</div>";

	$("#glyph_gene_choice_" + num, doc).html(html);

	$("#glyph_select_m_genes_" + num, doc).css("display", "none");
	$("#glyph_select_modif_id_" + num, doc).css("display", "none");
}


function draw_glyph(module, num, overlay, context, scale, modif_id, gene_name, topx, topy)
{
	// TBD: take modif_id into account
	if (!module) {
		module = get_module();
	}
	var drawing_config = navicell.getDrawingConfig(module);
	var glyphConfig = drawing_config.getGlyphConfig(num);

	topy -= 2;
	var scale2 = glyphConfig.getScale(scale);
	var g_size = glyphConfig.getSize()*scale2;
	topx += 8;

	var sel_group = glyphConfig.getGroup();
	var sel_sample = glyphConfig.getSample();
	var sel_shape_datatable = glyphConfig.getShapeDatatable();
	var sel_color_datatable = glyphConfig.getColorDatatable();
	var sel_size_datatable = glyphConfig.getSizeDatatable();

	var bound = null;
	if (sel_shape_datatable && sel_color_datatable && sel_size_datatable && (sel_group || sel_sample)) {
		var shape, color, size;
		if (sel_sample) {
			if (modif_id && USE_MODIF_ID_FOR_COLORS) {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeSampleByModifId(sel_sample.name, modif_id);
				color = sel_color_datatable.getDisplayConfig(module).getColorSampleByModifId(sel_sample.name, modif_id);
				size = sel_size_datatable.getDisplayConfig(module).getSizeSampleByModifId(sel_sample.name, modif_id);
			} else {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeSample(sel_sample.name, gene_name);
				color = sel_color_datatable.getDisplayConfig(module).getColorSample(sel_sample.name, gene_name);
				size = sel_size_datatable.getDisplayConfig(module).getSizeSample(sel_sample.name, gene_name);
			}
		} else {
			if (modif_id && USE_MODIF_ID_FOR_COLORS) {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeGroupByModifId(sel_group, modif_id);
				color = sel_color_datatable.getDisplayConfig(module).getColorGroupByModifId(sel_group, modif_id);
				size = sel_size_datatable.getDisplayConfig(module).getSizeGroupByModifId(sel_group, modif_id);
			} else {
				shape = sel_shape_datatable.getDisplayConfig(module).getShapeGroup(sel_group, gene_name);
				color = sel_color_datatable.getDisplayConfig(module).getColorGroup(sel_group, gene_name);
				size = sel_size_datatable.getDisplayConfig(module).getSizeGroup(sel_group, gene_name);
			}
			//console.log("group: " + gene_name + " " + sel_group.getId() + " " + shape + " " + color + " " + size);
		}

		//console.log("glyph shape etc. " + shape + " " + color + " " + size);
		var start_x = topx + (size*g_size)/8; // must depends on scale2 also
		var start_y = topy; // must depends on scale2 also
		bound = draw_glyph_perform(context, start_x, start_y, shape, color, (size*g_size)/4, 1, false, glyphConfig.getTransparency());
	}
	if (bound) {
		overlay.addBoundBox(bound, gene_name, "glyph", num, modif_id);
	}
	return bound;
}

var LINE_SEPARATOR_STYLE = "#000000";
var LINE_SEPARATOR_WIDTH = 1;

function fillStrokeRect(context, x, y, w, h) {
	if (!w || !h) {
		return;
	}
	context.fillRect(x, y, w, h);

	var o_strokeStyle = context.strokeStyle;
	var o_lineWidth = context.lineWidth;
	context.strokeStyle = LINE_SEPARATOR_STYLE;
	context.lineWidth = LINE_SEPARATOR_WIDTH;

	context.strokeRect(x, y, w, h);

	context.strokeStyle = o_strokeStyle;
	context.lineWidth = o_lineWidth;
}

function fillStroke(context) {
	context.fill();

	var o_strokeStyle = context.strokeStyle;
	var o_lineWidth = context.lineWidth;
	context.strokeStyle = LINE_SEPARATOR_STYLE;
	context.lineWidth = LINE_SEPARATOR_WIDTH;

	context.stroke();

	context.strokeStyle = o_strokeStyle;
	context.lineWidth = o_lineWidth;
}

function slider2alpha(transparency)
{
	return ((transparency-1) * -0.7)/99 + 1;
}

function draw_glyph_perform(context, pos_x, pos_y, shape, color, size, scale, is_middle, transparency) {
	if (!context) {
		return;
	}

	size *= 1.5;
	shape = navicell.shapes[shape];

	var globalAlpha = context.globalAlpha;
	context.globalAlpha = slider2alpha(transparency);
	context.fillStyle = "#" + color;

	var dim = size*scale*1.;
	var dim2 = dim/2.;
	var ret;

	if (!is_middle) {
		pos_y -= dim2 + 1;
	}
	if (shape == 'Square') {
		fillStrokeRect(context, pos_x-dim2, pos_y-dim2, dim, dim);
		ret = [pos_x-dim2, pos_y-dim2, dim, dim];
	} else if (shape == 'Rectangle') {
		var dim_w = 2*size*scale;
		var dim_h = size*scale;
		fillStrokeRect(context, pos_x-dim_w/2, pos_y-dim_h/2, dim_w, dim_h);
		ret = [pos_x-dim_w/2, pos_y-dim_h/2, dim_w, dim_h];
	} else if (shape == 'Diamond') {
		context.beginPath();
		context.moveTo(pos_x-dim2, pos_y);
		context.lineTo(pos_x, pos_y-dim2);
		context.lineTo(pos_x+dim2, pos_y);
		context.lineTo(pos_x, pos_y+dim2);
		context.closePath();
		fillStroke(context);
		ret = [pos_x-dim2, pos_y-dim2, dim, dim];
	} else if (shape == 'Circle') {
		context.beginPath();
		context.arc(pos_x, pos_y, dim2, 0., Math.PI*2);
		context.closePath();
		fillStroke(context);
		ret = [pos_x-dim2, pos_y-dim2, dim, dim];
	} else if (shape == 'Triangle') {
		var side = dim/Math.sqrt(3.);
		context.beginPath();
		context.moveTo(pos_x-side, pos_y+dim2);
		context.lineTo(pos_x, pos_y-dim2);
		context.lineTo(pos_x+side, pos_y+dim2);
		context.closePath();
		fillStroke(context);
		ret = [pos_x-dim2, pos_y-dim2, dim, dim];
	} else if (shape == 'Hexagon') {
		var side = dim2/2;
		context.beginPath();
		context.moveTo(pos_x-dim2, pos_y);
		context.lineTo(pos_x-dim2+side, pos_y-dim2);
		context.lineTo(pos_x+dim2-side, pos_y-dim2);
		context.lineTo(pos_x+dim2, pos_y);
		context.lineTo(pos_x+dim2-side, pos_y+dim2);
		context.lineTo(pos_x-dim2+side, pos_y+dim2);
		context.closePath();
		fillStroke(context);
		ret = [pos_x-dim2, pos_y-dim2, dim, dim];
	} else {
		ret = null;
	}

	context.globalAlpha = globalAlpha;
	return ret;
}
 
function show_search_dialog()
{
	$("#search_dialog").dialog("open");
}

function map_staining_step_display_config(what, map_name) {
	var val = $("#map_staining_editor_datatable_" + what).val();
	if (val != '_none_') {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		if (datatable) {
			var doc = (map_name && maps ? maps[map_name].document : null);
			datatable.showDisplayConfig(doc, what);
		}
	}
}

function map_staining_editor_set_editing(val, what) {
	var module = get_module_from_doc(window.document);
	var drawing_config = navicell.getDrawingConfig(module);
	if (val) {
		map_staining_editor_apply(drawing_config.getEditingMapStainingConfig());
		update_map_staining_editor(document, null, drawing_config.getEditingMapStainingConfig());
	}
	var msg = get_map_staining_config_message(false);
	$("#map_staining_editor_msg_div").html(msg);
}

function map_staining_editor_apply(map_staining_config)
{
	var val = $("#map_staining_editor_gs").val();
	if (val == "_none_") {
		map_staining_config.setSampleOrGroup(undefined);
	} else {
		var prefix = val.substr(0, 2);
		/*
		var id = val.substr(2);
		if (prefix == 'g_') {
			var group = navicell.group_factory.getGroupById(id);
			map_staining_config.setSampleOrGroup(group);
		} else {
			var sample = navicell.dataset.getSampleById(id);
			map_staining_config.setSampleOrGroup(sample);
		}
		*/
		var canon_name = val.substr(2);
		if (prefix == 'g_') {
			var group = navicell.group_factory.getGroupByCanonName(canon_name);
			map_staining_config.setSampleOrGroup(group);
		} else {
			var sample = navicell.dataset.getSampleByCanonName(canon_name);
			map_staining_config.setSampleOrGroup(sample);
		}
	}

	val = $("#map_staining_editor_datatable_color").val();
	if (val == "_none_") {
		map_staining_config.setColorDatatable(undefined);
	} else {
		//var datatable = navicell.getDatatableById(val);
		var datatable = navicell.getDatatableByCanonName(val);
		map_staining_config.setColorDatatable(datatable);
	}
	map_staining_config.setTransparency(map_staining_config.getSlider().slider("value"));
}

function draw_map_staining_perform(context, canvas_w, canvas_h, points, color) {
	var min_x = Number.MAX_NUMBER;
	var min_y = Number.MAX_NUMBER;
	var max_x = Number.MIN_NUMBER;
	var max_y = Number.MIN_NUMBER;
	for (var kk = 0; kk < points.length; kk+=2) {
		var x = points[kk];
		if (x < min_x) {
			min_x = x;
		}
		if (x > max_x) {
			max_x = x;
		}
		var y = points[kk+1];
		if (y < min_y) {
			min_y = y;
		}
		if (y > max_y) {
			max_y = y;
		}
	}
	var margin_x = 5;
	var margin_y = 5;
	var ori_canvas_w = canvas_w;
	var ori_canvas_h = canvas_h;
	canvas_w -= 2*margin_x;
	canvas_h -= 2*margin_y;
	var ratio_w = canvas_w/(max_x - min_x);
	var ratio_h = canvas_h/(max_y - min_y);
	var delta_x = 0;
	var delta_y = 0;
	var ratio;
	if (ratio_w > ratio_h) {
		ratio = ratio_h;
		delta_x = ((max_y-min_y)-(max_x-min_x))/2;
	} else {
		ratio = ratio_w;
		delta_y = ((max_x-min_x)-(max_y-min_y))/2;
	}
	context.lineWidth = 1;
	context.globalAlpha = 0.5; // for testing
	context.fillStyle = "#" + color;

	for (var kk = 0; kk < points.length; kk+=2) {
		var x = points[kk];
		var y = points[kk+1];
		var xx  = (x-min_x+delta_x)*ratio+margin_x;
		var yy = (y-min_y+delta_y)*ratio+margin_y;
		if (kk == 0) { // EV: 2018-08-31
			context.moveTo(xx, yy);
		} else {
			context.lineTo(xx, yy);
		}
	}
	context.closePath();
	context.stroke();
	context.fill();
}

function map_staining_select_sample(map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_map_staining_editor_perform", get_win(map_name), "select_sample", $("#map_staining_editor_gs", doc).val());
}

function map_staining_select_datatable(map_name)
{
	var doc = (map_name && maps ? maps[map_name].document : null);
	nv_perform("nv_map_staining_editor_perform", get_win(map_name), "select_datatable", $("#map_staining_editor_datatable_color", doc).val());
}

function update_map_staining_editor(doc, params, mapStainingConfig) {
	var module = get_module_from_doc(doc);
	var drawing_config = navicell.getDrawingConfig(module);
	if (!mapStainingConfig) {
		mapStainingConfig = drawing_config.getEditingMapStainingConfig();
	}
	var map_staining_display_labels = $("#map_staining_display_labels").attr("checked") == "checked";
	var map_name = doc ? doc.map_name : "";
	var div = $("#map_staining_editor_div", doc);
	var topdiv = div.parent().parent();
	var empty_cell_style = "background: " + topdiv.css("background") + "; border: none;";
	var table = $("#map_staining_editor_table", doc);
	var sel_gene_id = $("#map_staining_select_gene", doc).val();
	var sel_gene = sel_gene_id ? navicell.dataset.getGeneById(sel_gene_id) : null;

	table.children().remove();
	var html = "";
	html += "<tbody>";

	html += "<table><tr><td style='" + empty_cell_style + "'>";

	html += "<table cellpadding='6'><tr>";
	html += "<td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Sample or Group</span></td>";
	html += "<td colspan='2' style='" + empty_cell_style + "'>";
	var sel_group = mapStainingConfig.getGroup();
	var sel_sample = mapStainingConfig.getSample();
	html += sample_or_group_select("map_staining_editor_gs", 'map_staining_select_sample("' + map_name + '")', sel_group, sel_sample);
	html += "</td>";
	html += "</tr>";
	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td></td>";

	html += "<tr><td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Color</span></td>";

	html += "<td style='" + empty_cell_style + "'>";

	var sel_color_datatable = mapStainingConfig.getColorDatatable();
	html += datatable_select("map_staining_editor_datatable_color", 'map_staining_select_datatable("' + map_name + '")', sel_color_datatable);
	html += "</td>";

	html += "<td style='border: none; text-decoration: underline; font-size: 9px; text-align: left;" + empty_cell_style + "'><a href='#' onclick='map_staining_step_display_config(\"color\", \"" + map_name + "\")'><span id='map_staining_editor_datatable_config_color' class='" + (sel_color_datatable ? "" : "zz-hidden") + "'>config</span></a></td>";

	html += "</tr>";

	html += "<tr><td style='" + empty_cell_style + "'></td></tr>";
	html += "<tr><td style='text-align: right; " + empty_cell_style + "'><span style='font-size: small; font-weight: bold'>Display labels</span></td>";

	html += "<td style='" + empty_cell_style + "'><input id='map_staining_display_labels' type='checkbox' " + (map_staining_display_labels ? "checked" : "") + "></input></td>";

	html += "</table>";
	html += "</td>";
	var CANVAS_W = 250;
	var CANVAS_H = 250;
	html += "<td style='width: " + CANVAS_W + "px; height: " + CANVAS_H + "px' id='map_staining_editor_td_canvas' style='background: white;'></td>";
	html += "</tr><tr><td style='" + empty_cell_style + "'>&nbsp;</td></tr>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td style='" + empty_cell_style + "'><div style='text-align: center' class='slider-title'>Map Staining Transparency</div></td></tr>";

	html += "<tr><td style='" + empty_cell_style + "'>&nbsp;</td>";
	html += "<td><div id='map_staining_editor_slider_div'></div></td>";
	html += "</tr></table>";

	html += "</tbody>";

	table.append(html);

	var slider = $("#map_staining_editor_slider_div", doc);
	slider.slider({
		slide: function(event, ui) {
			nv_perform("nv_map_staining_editor_perform", get_win(map_name), "set_transparency", ui.value);
		}
	});

	slider.slider("value", mapStainingConfig.getTransparency());
	add_transparency_slider_labels(slider);

	var draw_canvas = doc.createElement('canvas');
	draw_canvas.style.left = '0px';
	draw_canvas.style.top = '0px';

	draw_canvas.width = CANVAS_W;
	draw_canvas.height = CANVAS_H;
	draw_canvas.style.width = draw_canvas.width + 'px';
	draw_canvas.style.height = draw_canvas.height + 'px';

	draw_canvas.style.position = 'relative';

	drawing_config.getEditingMapStainingConfig().setCanvasAndSlider(draw_canvas, slider);
	drawing_config.getMapStainingConfig().setCanvasAndSlider(draw_canvas, slider);

	var context = null;
	var td = $("#map_staining_editor_td_canvas", doc).get(0);
	if (td) {
		td.appendChild(draw_canvas);
		context = draw_canvas.getContext('2d');

		context.clearRect(0, 0, CANVAS_W, CANVAS_H);
	}

	if (sel_gene && sel_color_datatable && (sel_group || sel_sample)) {
		var color;
		var gene_name = sel_gene.name;
		if (sel_sample) {
			var sample_name = sel_sample.name;
			color = sel_color_datatable.getDisplayConfig(module).getColorSample(sample_name, gene_name);
		} else {
			color = sel_color_datatable.getDisplayConfig(module).getColorGroup(sel_group, gene_name);
		}

		var voronoi_shape_map = navicell.mapdata.getVoronoiCells(module).getShapeMap();
		var last_points = null;
		for (var shape_id in sel_gene.getShapeIds(module)) {
			var voronoi_shape = voronoi_shape_map[shape_id];
			if (voronoi_shape && color != undefined && color.toString() != '') {
				var points = voronoi_shape[0];
				last_points = points;
				draw_map_staining_perform(context, CANVAS_W, CANVAS_H, points, color);
			}
		}
	} else if (context) {
		context.clearRect(0, 0, CANVAS_W, CANVAS_H);
	}

	html = "Apply this configuration to gene:&nbsp;";
	html += "<select id='map_staining_select_gene' onchange='update_map_staining_editor(document, null, navicell.getDrawingConfig(\"" + module + "\").getEditingMapStainingConfig())'>\n";
	html += "<option value='_none_'></option>\n";
	var sorted_gene_names = navicell.dataset.getSortedGeneNames();
	for (var idx in sorted_gene_names) {
		var gene_name = sorted_gene_names[idx];
		var gene = navicell.dataset.genes[gene_name];
		var selected = sel_gene && sel_gene.getId() == gene.getId() ? " selected": "";
		html += "<option value='" + navicell.dataset.genes[gene_name].getId() + "'" + selected + ">" + gene_name + "</option>\n";
	}
	html += "</select>";
	$("#map_staining_gene_choice", doc).html(html);
}


function get_map_pos(module) {
	var drawing_config = navicell.getDrawingConfig(module);
	if (drawing_config.displayDLOsOnAllGenes()) {
		return null;
	}
	var mappos = navicell.dataset.getSelectedMapPos(module);
	if (mapSize(mappos) > 0 && mapSize(mappos) < 20) {
		console.log("mappos " + mapSize(mappos));
		for (var key in mappos) {
			console.log(key);
		}
	}
	return mappos;
}

/*
function old_get_voronoi_color(module, gene_names, sel_color_datatable, sel_sample, sel_group)
{
	var display_config = sel_color_datatable.getDisplayConfig(module);
	var sample_name = sel_sample.name;
	if (gene_names.length == 1) {
		if (sel_sample) {
			return display_config.getColorSample(sample_name, gene_names[0]);
		}
		return display_config.getColorGroup(sel_group, gene_names[0]);
	}
	var red = 0;
	var green = 0;
	var blue = 0;
	var len = gene_names.length;
	console.log("get_voronoi_color: complex ? " + gene_names.length);
	for (var nn = 0; nn < len; ++nn) {
		var color;
		if (sel_sample) {
			color = RGBColor.fromHex(display_config.getColorSample(sample_name, gene_names[nn]));
		} else {
			color = RGBColor.fromHex(display_config.getColorGroup(sel_group, gene_names[nn]));
		}
		red += color.getRed();
		green += color.getGreen();
		blue += color.getBlue();
	}
	return (new RGBColor(red/gene_names.length, green/gene_names.length, blue/gene_names.length)).getRGBValue();
}
*/

function get_voronoi_color(module, modifs_id, sel_color_datatable, sel_sample, sel_group)
{
	var display_config = sel_color_datatable.getDisplayConfig(module);
	var sample_name = (sel_sample ? sel_sample.name : '');
	var red = 0;
	var green = 0;
	var blue = 0;
	var len = mapSize(modifs_id);
	for (var modif_id in modifs_id) {
		var value;
		if (sel_sample) {
			value = display_config.getColorSampleByModifId(sample_name, modif_id);
		} else {
			value = display_config.getColorGroupByModifId(sel_group, modif_id);
		}
		if (value == undefined || value.toString() == '') {
			//console.log("null value for " + modif_id);
			len--;
			continue;
		}

		var color = RGBColor.fromHex(value);
		
		red += color.getRed();
		green += color.getGreen();
		blue += color.getBlue();
	}
	/*
	if (len > 1) {
		console.log("get_voronoi_color: " + red + ", " + green + ", " + blue + " [" + len + "]");
	}
	*/
	/*
	if (len != 0 && red == 0 && green == 0 && blue == 0) {
		console.log("color is black but len is " + len + " " + not_null_value + " " + modif_id);
	}
	*/
	return len == 0 ? 0 : (new RGBColor(red/len, green/len, blue/len)).getRGBValue();
}

var CHECK_ANGLE = false;
var CHECK_INTERSECTS = false;
var CHECK_SEGMENT_LEN = true;
var MAX_SEGMENT_LEN = 1000;
var MIN_ANGLE = 0.01;

function sameSign(a,b){
	return a * b >= 0;
}

function intersects(x1, y1, x2, y2, x3, y3, x4, y4){
	if (x2 == x3 && y2 == y3) {
		return 0;
	}
	if (x1 == x4 && y1 == y4) {
		return 0;
	}
	var a1, a2, b1, b2, c1, c2;
	var r1, r2 , r3, r4;
	var denom, offset, num;

	// Compute a1, b1, c1, where line joining points 1 and 2
	// is "a1 x + b1 y + c1 = 0".
	a1 = y2 - y1;
	b1 = x1 - x2;
	c1 = (x2 * y1) - (x1 * y2);

	// Compute r3 and r4.
	r3 = ((a1 * x3) + (b1 * y3) + c1);
	r4 = ((a1 * x4) + (b1 * y4) + c1);

	// Check signs of r3 and r4. If both point 3 and point 4 lie on
	// same side of line 1, the line segments do not intersect.
	if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)){
		return 0; //return that they do not intersect
	}

	// Compute a2, b2, c2
	a2 = y4 - y3;
	b2 = x3 - x4;
	c2 = (x4 * y3) - (x3 * y4);

	// Compute r1 and r2
	r1 = (a2 * x1) + (b2 * y1) + c2;
	r2 = (a2 * x2) + (b2 * y2) + c2;

	// Check signs of r1 and r2. If both point 1 and point 2 lie
	// on same side of second line segment, the line segments do
	// not intersect.
	if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))){
		return 0; //return that they do not intersect
	}

	//Line segments intersect: compute intersection point.
	denom = (a1 * b2) - (a2 * b1);

	if (denom === 0) {
		return 1; //collinear
	}

	// lines_intersect
	return 1; //lines intersect, return true
}

function get_angle(x1, y1, x2, y2, x3, y3, x4, y4){
	if (x2 == x3 && y2 == y3) {
		var p1_x = x4 - x2;
		var p1_y = y4 - y2;
		var p2_x = x1 - x2;
		var p2_y = y1 - y2;
		return Math.atan2(p2_y - p1_y, p2_x - p1_x) * 180 / Math.PI
	}
	if (x1 == x4 && y1 == y4) {
		var p1_x = x3 - x2;
		var p1_y = y3 - y2;
		var p2_x = x2 - x2;
		var p2_y = y2 - y2;
		return Math.atan2(p2_y - p1_y, p2_x - p1_x) * 180 / Math.PI
	}
	return 0;
}

function segments_intersect(segments)
{
	if (!CHECK_ANGLE && !CHECK_INTERSECTS) {
		return 0;
	}
	for (var idx in segments) {
		if (idx == 0) {continue;}
		var segment = segments[idx];
		for (var idx1 = 0; idx1 < idx; idx1++) {
			var last_segment = segments[idx1];
			if (CHECK_ANGLE) {
				var angle = get_angle(last_segment[0], last_segment[1], last_segment[2], last_segment[3], segment[0], segment[1], segment[2], segment[3]);
				if (angle != 0 && Math.abs(angle) < IN_ANGLE) {
					//console.log("angle: " + angle + " " + (last_segment[0]) + " " +  (last_segment[1]) + " -- " +  (last_segment[2]) + " " +  (last_segment[3]) + "\n" +  (segment[0]) + " " + (segment[1]) + " -- " +  (segment[2]) + " " + (segment[3]));
					return 1;
				}
			}
			if (CHECK_INTERSECTS) {
				if (intersects(last_segment[0], last_segment[1], last_segment[2], last_segment[3], segment[0], segment[1], segment[2], segment[3])) {
					//console.log("intersets: " + (last_segment[0]) + " " +  (last_segment[1]) + " -- " +  (last_segment[2]) + " " +  (last_segment[3]) + "\n" +  (segment[0]) + " " + (segment[1]) + " -- " +  (segment[2]) + " " + (segment[3]));
					return 1;
				}
			}
		}
	}
	return 0;
}

function add_segment(last_bx, last_by, bx, by, segments)
{
	if (last_bx == -1 && last_by == -1) {return;}
	segments.push([last_bx, -last_by, bx, -by]);
	if (CHECK_SEGMENT_LEN) {
		if (Math.abs(bx - last_bx) > MAX_SEGMENT_LEN || Math.abs(by - last_by) > MAX_SEGMENT_LEN) {
			//console.log("BAD: " + last_bx + " " + last_by + " -- " + bx + " " + by);
			return 1;
		}
	}

	return 0;
}

function draw_voronoi(module, context, div, image_mode, delta_x, delta_y)
{
	var map_staining_display_labels = $("#map_staining_display_labels").attr("checked") == "checked";
	var drawing_config = navicell.getDrawingConfig(module);
	var mapStainingConfig = drawing_config.getMapStainingConfig();
	var sel_color_datatable = mapStainingConfig.getColorDatatable();
	if (!sel_color_datatable) {
		window.console.log("no color datatable");
		return;
	}

	var sel_group = mapStainingConfig.getGroup();
	var sel_sample = mapStainingConfig.getSample();
	if (!sel_group && !sel_sample) {
		window.console.log("no sel_sample or sel_group");
		return;
	}

	var overlayProjection = overlay.getProjection();
	var mapProjection = overlay.map_.getProjection();
	var scale = Math.pow(2, overlay.map_.zoom);
	var voronoi_shape_map = navicell.mapdata.getVoronoiCells(module).getShapeMap();
	context.lineWidth = 1;
	context.globalAlpha = slider2alpha(mapStainingConfig.getTransparency());
//	context.font = "normal 12px";
	context.font = "normal 14px";
	context.strokeStyle = "#000000";
	var map_pos = get_map_pos(module);
	var map_pos_size = mapSize(map_pos);

	//console.log("drawing voronoi");
	for (var shape_id in voronoi_shape_map) {
		if (map_pos && !map_pos[shape_id]) {
			continue;
		}
		var modifs_id = navicell.dataset.getModifsByShapeId(module, shape_id);
		var color;
		if (!modifs_id) {
			color = 0;
		} else {
			color = get_voronoi_color(module, modifs_id, sel_color_datatable, sel_sample, sel_group);
		}		
		var points = voronoi_shape_map[shape_id][0];
		context.beginPath();
		var min_x = Number.MAX_NUMBER;
		var min_y = Number.MAX_NUMBER;
		var max_x = Number.MIN_NUMBER;
		var max_y = Number.MIN_NUMBER;
		var segments = [];
		var last_bx = -1;
		var last_by = -1;
		var first_bx = -1;
		var first_by = -1;
		var bx, by;
		var break_loop = 0;
		for (var kk = 0; kk < points.length; kk+=2) {
			var xx = points[kk];
			var yy = points[kk+1];
			var gpt = new google.maps.Point(xx, yy);
			var latlng = mapProjection.fromPointToLatLng(gpt);
			if (GMAPS_V3_3x) {
				var pix = overlayProjection.fromLatLngToContainerPixel(latlng);
				bx = pix.x - (image_mode ? delta_x : 0);
				by = pix.y - (image_mode ? delta_y : 0);
			} else {
				var pix = overlayProjection.fromLatLngToDivPixel(latlng);
				bx = pix.x - (image_mode ? delta_x : div.left);
				by = pix.y - (image_mode ? delta_y : div.top);
			}
			if (kk == 0) { // EV: 2018-08-31
				context.moveTo(bx, by);
			} else {
				context.lineTo(bx, by);
			}
			if (first_bx == -1 && first_by == -1) {
				first_bx = bx;
				first_by = by;
			}
			if (add_segment(last_bx, last_by, bx, by, segments)) {
				break_loop = 1;
				break;
			}
			last_bx = bx;
			last_by = by;
			if (bx < min_x) {
				min_x = bx;
			}
			if (by < min_y) {
				min_y = by;
			}
			if (bx > max_x) {
				max_x = bx;
			}
			if (by > max_y) {
				max_y = by;
			}
		}
		context.closePath();
		if (break_loop || add_segment(bx, by, first_bx, first_by, segments) || segments_intersect(segments)) {
			console.log("voronoi:, skipping shape fill");
			continue;
		}
		if (color) {
			context.fillStyle = "#" + color;
			context.fill();

			if (map_staining_display_labels) {
				context.strokeStyle = "#000000";
			}
		} else {
			if (map_staining_display_labels) {
				context.stroke();
				context.strokeStyle = "#FF0000";
			}
		}
		if (map_staining_display_labels) {
			context.strokeText(shape_id, (min_x + max_x)/2-40, (min_y + max_y)/2+3);
		}
	}		
}

function WaitCursor(elems, win) {
	this.ocursors = {};
	if (!win) {
		win = window;
	}
	this.win = win;
	this.elems = elems;
	this.elems.push('body');
	this.elems.push('#map');
	this.elems.push('#map_canvas');
	for (var idx in this.elems) {
		var elem = this.elems[idx];
		if (elem in this.ocursors) {
			continue;
		}
		var elem_obj = $(elem, this.win.document);
		//console.log("wait cursor on " + elem);
		this.ocursors[elem] = elem_obj.css("cursor");
		elem_obj.css("cursor", "wait");
	}
}

WaitCursor.prototype = {
	restore: function() {
		//console.log("WAIT_CURSOR RESTORE");
		for (var idx in this.elems) {
			var elem = this.elems[idx];
			$(elem, this.win.document).css("cursor", this.ocursors[elem]);
		}
	}
}
