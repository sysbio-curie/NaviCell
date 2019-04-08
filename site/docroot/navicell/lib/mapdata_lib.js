/*
 * Eric Viara (Sysra), $Id$
 *
 * Copyright (C) 2013 Curie Institute, 26 rue d'Ulm, 75005 Paris, France
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


var GLYPH_COUNT = 5;
var DISPLAY_TIMEOUT = 500;
var MAX_DISCRETE_VALUES = 30;
var DATATABLE_LIST = 'Datatable list';
var MULTI_REV_SHAPE_MAP = true;
var GMAPS_V3_3x = false; // google map new version; finally, code modified can be as previous
var GMAPS_V3_3x_force = true; // google map new version

var cache_value_cnt = 0;
var no_cache_value_cnt = 0;
var NO_CHANGE_STEP_COUNT = true;
var EMPTY_VALUE_DEFAULT_COLOR = "DDDDDD";

if (!window.console) {
	window.console = new function()
	{
		this.log = function(str) {};
		this.dir = function(str) {};
	};
}

function getOverlay() {
	return overlay;
}

function Debug()
{
}

Debug.MASK = 0;
Debug.MAPPOS = 0x1;
Debug.MAPSTAIN = 0x2;

Debug.MAP = {};
Debug.MAP[Debug.MAPPOS] = "MAPPOS";
Debug.MAP[Debug.MAPSTAIN] = "MAPSTAIN";

Debug.RMAP = {};

Debug.init = function() {
	for (var key in Debug.MAP) {
		var value = Debug.MAP[key];
		Debug.RMAP[value] = key;
	}
}

Debug.console = function(dbglevel, msg)
{
	if ((Debug.MASK & dbglevel) != 0) {
		console.log("DEBUG " + Debug.MAP[dbglevel] + " " + msg);
	}
}

Debug.getAllKeys = function()
{
	var keys = [];
	for (var nn = 0; nn < arr.length; ++nn) {
		var key = arr[nn];
		keys.push(key);
	}
	return keys;
}

Debug.reset = function()
{
	Debug.MASK = 0;
}

Debug.add = function(str)
{
	var arr = str.split("+");
	var mask = 0;
	for (var nn = 0; nn < arr.length; ++nn) {
		var key = arr[nn];
		var value = Debug.RMAP[key];
		if (value) {
			mask |= value;
		} else {
			console.log("DEBUG: cannot find key " + key + ", available keys are " + Debug.getAllKeys());
		}
	}
	Debug.MASK |= mask;
}

Debug.set = function(str)
{
	Debug.reset();
	Debug.add(str);
}

Debug.init();

function mapSize(map) {
	var size = 0;
	for (var key in map) {
		if (typeof map[key] != 'function') {
			size++;
		}
	}
	return size;
}

function mapValues(map) {
	var values = [];
	for (var key in map) {
		values.push(map[key]);
	}
	return values;
}

function mapKeys(map) {
	var keys = [];
	for (var key in map) {
		keys.push(key);
	}
	return keys;
}

function mapDisplay(map, msg) {
	if (!msg) {
		msg = '';
	} else {
		msg += ' ';
	}
	console.log("Map " + msg + "{");
	for (var key in map) {
		console.log("  " + key + " => " + map[key]);
	}
	console.log("}");
}

function array_push_all(arr, to_append) {
	for (var nn = 0; nn < to_append.length; ++nn) {
		arr.push(to_append[nn]);
	}
}

function print_stack()
{
	var e = new Error('dummy');
	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		.replace(/^\s+at\s+/gm, '')
		.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
	console.log(stack);
}

if (!Number.MAX_NUMBER) {
	Number.MAX_NUMBER = 4000000000; // not the correct value, but ok for our purposes
}

if (!Number.MIN_NUMBER) {
	Number.MIN_NUMBER = -4000000000; // not the correct value, but ok for our purposes
}

var INPUT_SEPS = ["\t", ";", ",", " "];
var COLOR_SIZE_CONFIG = "color_size";
var EDITING_CONFIGURATION = "configuration not applied...";
var NO_SAMPLE = "<span style='font-style: italic; font-size: smaller'>[gene&nbsp;list]</span>";
var GENE_SET = "[GENE]";
var INVALID_VALUE = '* INVALID *';

function load_info(url, module_name)
{
	navicell.mapdata.info_ready[module_name] = new $.Deferred();
	var SIMULATE_HEAVY_LOAD_INFO = false;
	if (SIMULATE_HEAVY_LOAD_INFO) {
		for (var nn = 0; nn < 15; ++nn) {
			$.ajax(url,
			       {
				       async: true,
				       dataType: 'json',
				       cache: false,
				       success: function(data) {
					       //console.log("navicell: info [" + url + "] loaded #" + nn);
				       }
			       });
		}
	}

	$.ajax(url,
	       {
		       async: true,
		       dataType: 'json',
		       
		       success: function(data) {
			       //console.log("navicell: info [" + url + "] loaded !");
			       navicell.mapdata.addInfo(module_name, data);
		       },
			       
		       error: function() {
			       //console.log("navicell: error loading [" + url + "] jxtree");
		       }
	       }
	      );
}

function load_voronoi(url, module_name)
{
	navicell.mapdata.voronoi_ready[module_name] = new $.Deferred();
	$.ajax(url,
	       {
		       async: true,
		       dataType: 'text',
		       
		       success: function(data) {
			       //console.log("navicell: voronoi [" + url + "] loaded !");
			       navicell.mapdata.addVoronoiCells(module_name, data);
		       },
			       
		       error: function() {
			       //console.log("navicell: error loading voronoi [" + url + "]");
		       }
	       }
	      );
}

function load_mapurls(url)
{
    $.ajax(url,
	   {
	       async: true,
	       dataType: 'text',
	       
	       success: function(data) {
		   console.log("navicell: mapurls [" + url + "] loaded successfully!");
		   navicell.mapdata.setMapURLs(data);
	       },
			       
	       error: function() {
		   console.log("navicell: mapurls [" + url + "] loading error !");
	       }
	   }
	  );
}

//
// Mapdata class
//
// Encapsulate all module entities, including map positions
//

var SIMPLE_COMMENT_REGEX = new RegExp("(^#.*)|( *#.*)", "g");
var jxtree_mapfun_map = {};

jxtree_mapfun_map['label'] = function(datanode) {
	if (datanode.name) {
		return datanode.name;
	}
	if (!datanode.label) {
		//console.log("NULL LABEL " + datanode + " " + mapSize(datanode));
		/*
		for (var key in datanode) {
			console.log(key + " -> " + datanode[key].length);
		}
		*/
		if (datanode["class"]) {
			return datanode["class"];
		}
		return "<unknown>";
	}
	return datanode.label;
}

jxtree_mapfun_map['left_label'] = function(datanode) {
	var left_label = datanode.left_label;
	if (left_label) {
		if (left_label.indexOf("blog:") == 0) {
			var alt = left_label.substr(5);
			left_label = "<a href='#'><img align=\"top\" class=\"blogfromright\" border=\"0\" src=\"../../../map_icons/misc/blog.png\" alt=\"" + alt + "\"/></a>";
		}
	}
	return left_label;
}

jxtree_mapfun_map['right_label'] = function(datanode) {
	return datanode.right_label;
}

jxtree_mapfun_map['data'] = function(datanode) {
	if (datanode.data) {
		return datanode.data;
	}
	if (datanode.id) {
		return {id: datanode.id, cls: datanode["class"], modifs: datanode.modifs, included: datanode.a};
	}
	if (datanode.name) {
		return {id: datanode.name, cls: datanode["class"], modifs: datanode.modifs, included: datanode.a};
	}
	return null;
}

jxtree_mapfun_map['children'] = function(datanode) {
	if (datanode.entities)  {
		return datanode.entities;
	}
	if (datanode.modifs) {
		return datanode.modifs;
	}
	if (datanode.children) {
		return datanode.children;
	}
	if (datanode.modules) {
		return datanode.modules;
	}
	if (datanode.maps) {
		return datanode.maps;
	}
	return datanode.children;
}

jxtree_mapfun_map['id'] = function(datanode) {
	return datanode.id;
}

function jxtree_mapfun(datanode, field) {
	var mapfun = jxtree_mapfun_map[field];
	return mapfun ? mapfun(datanode) : null;
}

function jxtree_get_node_class(node, included) {
	var data = node.getUserData();
	if (data && data.cls) {
		return data.cls + (included ? ":INCLUDED" : "");
	}
	if (node.getParent()) {
		return jxtree_get_node_class(node.getParent(), included || (data && data.included));
	}
	return null;
}

// TBD: 2013-10-29: find function to modify !
// searching perharps not in the good place, and, at least, jxtree find is not correct with nodes
// must compare to jstree searching !

/*
function jxtree_user_find(matcher, node) {
	var data = node.getUserData();
	if (data && data.id) {
		if (data.modifs) {
			console.log("data " + data.id + " has modifs");
		}
		if ((matcher.search_in & JXTreeMatcher.IN_ANNOT) != 0) {
			var info = navicell.mapdata.getInfo(node.jxtree.module_name, data.id);
			if (info) {
				if (matcher.match(info)) {
					return true;
				}
			}
		}
		if ((matcher.search_in & JXTreeMatcher.IN_TAG) != 0) {
			var tag_map = navicell.mapdata.getTagMap(node.jxtree.module_name, data.id);
			if (tag_map) {
				for (var tag in tag_map) {
					if (matcher.match(tag)) {
						return true;
					}
				}
			}
		}
	}
	return false;
}
*/

/*
function jxtree_user_find_id(matcher, node) {
        var data = node.getUserData();
        if (data && data.id) {
                if (matcher.match(data.id)) {
                        return true;
                }
        }
        return false;
}
*/

function jxtree_user_find_regex(matcher, regex, node) {
	var data = node.getUserData();
	if (data && data.id) {
		if (jxtree_user_find_id_regex(matcher, regex, node)) {
			return true;
		}
		if ((matcher.search_in & JXTreeMatcher.IN_ANNOT) != 0) {
			var info = navicell.mapdata.getInfo(node.jxtree.module_name, data.id);
			if (info) {
				if (info.match(regex)) {
					return true;
				}
			}
		}
		if ((matcher.search_in & JXTreeMatcher.IN_TAG) != 0) {
			var tag_map = navicell.mapdata.getTagMap(node.jxtree.module_name, data.id);
			if (tag_map) {
				for (var tag in tag_map) {
					if (tag.match(regex)) {
						return true;
					}
				}
			}
		}
	}
	return false;
}

function jxtree_user_find_id_regex(matcher, regex, node) {
        var data = node.getUserData();
        if (data && data.id) {
		if (data.id.match(regex)) {
                        return true;
                }
        }
        return false;
}

function VoronoiCells(module_name, data) {
	var voronoiShapeMap = {};
	var lines = data.split(LINE_BREAK_REGEX);
	var len = lines.length;
	var shape_map = navicell.mapdata.getShapeMap(module_name);
	if (!shape_map) {
		console.log("SHAPE_MAP DOES NOT exist for module " + module_name);
	}
	var found = 0;
	var not_found = 0;
	for (var nn = 0; nn < len; ++nn) {
		var arr = lines[nn].split("\t");
		var points = [];
		var neighbourghs = [];
		var shape_id = arr[0];
		if (!shape_id) {
			continue;
		}
		for (var kk = 1; kk < arr.length; ++kk) {
			if (!arr[kk].length) {
				continue;
			}
			if (arr[kk].match(NUM_REGEX)) {
				points.push(parseFloat(arr[kk]));
			} else {
				neighbourghs.push(arr[kk]);
				if (shape_map && shape_map[arr[kk]]) {
					found++;
				} else {
					not_found++;
				}
			}
		}
		voronoiShapeMap[shape_id] = [points, neighbourghs];
		if (shape_map && shape_map[shape_id]) {
			found++;
		} else {
			not_found++;
		}
	}
	this.voronoiShapeMap = voronoiShapeMap;
}


VoronoiCells.prototype = {

	getShapeMap: function() {
		return this.voronoiShapeMap;
	}
};

function Mapdata(to_load_count) {
	this.to_load_count = to_load_count;

	this.ready = {};
	this.is_ready = {};
	this.straight_data = {};
	this.info_ready = {};
	this.voronoi_ready = {};
	this.deferred_module_bubble = {};
	this.module_postid = {};
}

var CANON_REGEX = new RegExp(" ", "g");
var CLEAN_HTML_REGEX = new RegExp("<[^<>]+>|&nbsp;", "g");
var TAG_REGEX = new RegExp(">\\w+:\\w+</a>|&nbsp;(\\w| )+&nbsp;", "g");
var TAG_CLEAN_REGEX = new RegExp("</a>|&nbsp;|>", "g");
var LINE_BREAK_REGEX = /\r\n?|\n/;
var LINE_BREAK_REGEX_G = new RegExp("\r\n?|\n", "g");
var SEP_REGEX = new RegExp("[ \t;,\.\-]", "g");
var NUM_REGEX = new RegExp("^-?[0-9]+(\.[0-9]*)?$");
var INT_REGEX = new RegExp("^-?[0-9]+$");

function canon_name(str) {
	//console.log("canon [" + str + "] -> [" + str.replace(CANON_REGEX, '_') + "]");
	return str.replace(CANON_REGEX, '_');
}

function is_number(str)
{
	return str.toString().match(NUM_REGEX);
}

function is_int(str)
{
	return str.toString().match(INT_REGEX);
}

var time_cnt = 0;

Mapdata.prototype = {
	// Mapdata for each module
	module_mapdata: {},
	module_mapdata_by_id: {},
	module_mapdata_by_entity_id: {},
	module_desc: {},
	module_info: {},
	module_tag_map: {},
	module_voronoi: {},
	module_bubble: {},
	module_jxtree: {},
	module_res_jxtree: {},
	module_classes: {},
	module_modif_map: {},
	module_shape_map: {},
	module_rev_shape_map: {},
	class_list: {},

	// Hashmap from hugo name to entity information (including positions)
	hugo_map: {},

	getModuleDescriptions: function() {
		return this.module_desc;
	},

	getModuleList: function() {
		var modules = [];
		for (var module_name in this.module_mapdata) {
			modules.push(module_name);
		}
		return modules;
	},

	getPostModuleLink: function(postid) {
		return this.module_postid[postid];
	},

	getMapByModifId: function(module_name, modif_id) {
		if (this.module_modif_map[module_name]) {
			return this.module_modif_map[module_name][modif_id];
		}
		return null;
	},

	getBubbleContents: function(module_name) {
		function LScanner(module_name) {
			this.module_name = module_name;
			this.contents = [];
		}
		LScanner.prototype = {
			scanNode: function(node) {
				if (node.isChecked()) {
					var data = node.getUserData();
					if (data && data.id) {
						//var contents = navicell.mapdata.getBubbleContent(this.module_name, data.id);
						var contents = navicell.mapdata.getBubble(this.module_name, data.id);
						console.log("contents for " + data.id + " " + (contents ? contents.length : "no"));
						if (contents) {
							this.contents.push(contents);
						}
					}
				}
			}
		}
		var scanner = new LScanner(module_name);

		var jxtree = navicell.mapdata.getJXTree(module_name);
		jxtree.scanTree(scanner);

		var jxrestree = navicell.mapdata.getResJXTree(module_name);
		if (jxrestree) {
			jxrestree.scanTree(scanner);
		}
		console.log("SCANNER: " + scanner.contents.length);
		return scanner.contents;
	},

	getJXTree: function(module_name) {
		return this.module_jxtree[module_name];
	},

	getResJXTree: function(module_name) {
		return this.module_res_jxtree[module_name];
	},

	useJXTreeSimpleFind: function(jxtree) {
		var user_find = jxtree.user_find;
		jxtree.userFind(jxtree_user_find_id_regex);
		return user_find;
	},

	restoreJXTreeFind: function(jxtree, user_find) {
		jxtree.userFind(user_find);
	},

	getHugoNames: function() {
		var hugo_names = [];
		for (var hugo_name in this.hugo_map) {
			hugo_names.push(hugo_name);
		}
		//console.log("getHugoNames: " + mapSize(this.hugo_map) + " " + hugo_names.length);
		return hugo_names;
	},

	getHugoNamesByModule: function(module_name) {
		var hugo_names = [];
		for (var hugo_name in this.hugo_map) {
			if (this.hugo_map[hugo_name][module_name]) {
				hugo_names.push(hugo_name);
			}
		}
		return hugo_names;
	},

	// no effect... should fixed that
	searchFor: function(win, what, div, display) {
		if (what.trim() == "/?") {
			return;
		}
		$("#result_tree_header", win.document).html(display ? "Searching for \"" + what + "\"..." : "");
		if (div) {
			$(div, win.document).css("display", "none");
		}
	},

	findJXTreeContinue: function(win, to_find, no_ext, action, hints, open_bubble) {
		var module_name = win.document.navicell_module_name;
		var mapdata = this;
		var jxtree = mapdata.module_jxtree[module_name];
		var res_jxtree = null;

		if (no_ext) {
			var user_find = mapdata.useJXTreeSimpleFind(jxtree);
			res_jxtree = jxtree.find(to_find, action, hints);
			mapdata.restoreJXTreeFind(jxtree, user_find);
		} else {
			res_jxtree = jxtree.find(to_find, action, hints);
		}

		if (res_jxtree == null) {
			if (hints.error || hints.help) {
				var dialog = $("#info_dialog", win.document);
				var msg = hints.error ? hints.error : hints.help;
				var title = hints.error ? "Searching Error" : "Search Help";
				dialog.html("<div style='text-align: vertical-center'>" + "<br/>" + msg.replace(new RegExp("\n", "g"), "<br>") + "</div>");
				dialog.dialog({
					autoOpen: false,
					width: 430,
					height: 750,
					modal: false,
					title: title,
					buttons: {
						"OK": function() {
							$(this).dialog("close");
						}
					}
				});
				dialog.dialog("open");
			}
			return;
		}

		if (action == 'subtree' && res_jxtree) {
			var o_open_bubble = win.nv_open_bubble;
			win.nv_open_bubble = open_bubble;

			if (!no_ext) {
				var idx = to_find.indexOf(" /");
				var to_display = idx > 0 ? to_find.substring(0, idx) : to_find;
				$("#result_tree_header", win.document).html(res_jxtree.found + " elements matching \"" + to_display + "\"");
			} else if (hints.result_title) {
				$("#result_tree_header", win.document).html(hints.result_title);
			}

			if (!hints.select_neighbours) {
				uncheck_all_entities(win);
			}

			res_jxtree.context = {win: win};

			tree_context_prologue(res_jxtree.context);
			$.each(res_jxtree.getRootNodes(), function() {
				this.checkSubtree(JXTree.CHECKED);
				this.showSubtree(JXTree.OPEN);
			});

			if (hints.highlight) {
				var scanner = new JXTreeScanner(module_name);
				res_jxtree.scanTree(scanner);
				for (var idx1 in scanner.arrid) {
					var id = scanner.arrid[idx1];
					var info = navicell.mapdata.getMapdataById(module_name, id);
					if (info) {
						array_push_all(win.overlay.highlight_boxes, boxes_from_positions(null, info.positions));
					}
				}
			}

			tree_context_epilogue(res_jxtree.context, hints.select_neighbours);

			if (hints.div) {
				$(hints.div, win.document).css("display", "block");
			}

			mapdata.module_res_jxtree[module_name] = res_jxtree;

			if (win.overlay) {
				win.overlay.draw(win.document.navicell_module_name);
			}
			time_cnt++;
			$("img.blogfromright", win.document).click(open_blog_click);
			$("img.mapmodulefromright", win.document).click(open_module_map_click);

			win.nv_open_bubble = o_open_bubble;
		}
	},

	findJXTree: function(win, to_find, no_ext, action, hints, open_bubble) {
		var module_name = win.document.navicell_module_name;
		var mapdata = this;
		if (!hints) {
			hints = {};
		}
		hints.class_list = this.class_list;
		this.whenInfoReady(module_name, function() {
			var jxtree = mapdata.module_jxtree[module_name];
			if (no_ext) {
				var to_find_str = "^(";
				for (var nn = 0; nn < to_find.length; ++nn) {
					if (nn) {
						to_find_str += '|';
					}
					to_find_str += to_find[nn];
				}
				to_find_str += ")$";
				to_find_str += " /class=all";
				hints.case_sensitive = true;
				mapdata.searchFor(win, to_find_str, hints.div, false);
				mapdata.findJXTreeContinue(win, to_find_str, no_ext, action, hints, open_bubble);
			} else {
				mapdata.searchFor(win, to_find, hints.div, true);
				// EV: 2015-02-02, don't remember why setTimeout ? maybe clockwise cursor...Trying without timeout.
				mapdata.findJXTreeContinue(win, to_find, no_ext, action, hints, open_bubble);
				/*
				setTimeout(function() {
					mapdata.findJXTreeContinue(win, to_find, no_ext, action, hints, open_bubble);
				}, 20);
				*/
			}

			return;
		});
	},

	addInfo: function(module_name, info) {
		this.module_bubble[module_name] = info;
		var info_map = {};
		var tag_map = {};
		for (var id in info) {
			var info_id = info[id];
			info_map[id] = info_id.replace(CLEAN_HTML_REGEX, " ");
			// tag detection is fragile as it is based on the fuzzy syntax of information;
			// on the other hand, information is automatically generated by the factory,
			// so I guess it should work as long as info generation is not modified in factory
			var arr = info_id.match(TAG_REGEX);
			if (arr && arr.length) {
				var tmap = {};
				for (var nn = 0; nn < arr.length; ++nn) {
					var tag = arr[nn].replace(TAG_CLEAN_REGEX, "");
					tmap[tag] = 1;
				}
				tag_map[id] = tmap;
			}
		}
		this.module_info[module_name] = info_map;
		this.module_tag_map[module_name] = tag_map;
		this.info_ready[module_name].resolve();
	},

	addVoronoiCells: function(module_name, data) {
		this.module_voronoi[module_name] = new VoronoiCells(module_name, data);
		this.voronoi_ready[module_name].resolve();
	},

	getInfo: function(module_name, id) {
		var info = this.module_info[module_name];
		if (info) {
			return info[id];
		}
		return null;
	},

	getVoronoiCells: function(module_name) {
		return this.module_voronoi[module_name];
	},

	getTagMap: function(module_name, id) {
		var tag_map = this.module_tag_map[module_name];
		if (tag_map) {
			return tag_map[id];
		}
		return null;
	},

	getClass: function(module_name, id) {
		var classes = this.module_classes[module_name];
		if (classes) {
			return classes[id];
		}
		return null;
	},

	getBubble: function(module_name, id) {
		var bubble = this.module_bubble[module_name];
		if (bubble) {
			return bubble[id];
		}
		return null;
	},

	isReady: function(module_name) {
		return this.is_ready[module_name] ? true : false;
	},

	whenReady: function(module_name, f) {
		var ready = this.ready[module_name];
		if (!ready) {
			console.log("ARG for [" + module_name + "]");
		}
		ready.then(f);
	},

	whenInfoReady: function(module_name, f) {
		var ready = this.info_ready[module_name];
		ready.then(f);
	},

	buildEntityTreeWhenReady: function(win, div_name, projection, whenloaded) {
		var map = win.map;
		var module_name = map.map_name;
		if (this.isReady(module_name)) {
			this.buildEntityTree(win, div_name, projection, whenloaded);
		} else {
			var mapdata = this;
			this.whenReady(module_name, function() {
				mapdata.buildEntityTree(win, div_name, projection, whenloaded);
			});
		}
	},

	buildEntityTree: function(win, div_name, projection, whenloaded) {
		var map = win.map;
		var module_name = map.map_name;
		var data = this.straight_data[module_name];

		var datatree;
		if (module_name.match(/master$/)) {
			var maps_modules = data[data.length-1];
			var cls = maps_modules["class"];
			if (cls == "MAP" || cls == "MODULE") {
				data.pop();
				datatree = [maps_modules, {name: 'Entities', children: data}];
			} else {
				datatree = {name: 'Entities', children: data};
			}
		} else {
			datatree = {name: 'Entities', children: data};
		}

		var jxtree = new JXTree(win.document, datatree, $(div_name, win.document).get(0), jxtree_mapfun);
		$.each(jxtree.getRootNodes(), function() {
			this.toggleOpen();
		});

		jxtree.userFind(jxtree_user_find_regex);

		jxtree.context = {win: win};

		var mapdata = this;
		jxtree.onClickBefore(function(node, checked) {
			win.tree_node_click_before(node.jxtree.context, checked);
		});

		jxtree.onClickAfter(function(node, checked) {
			win.tree_node_click_after(node.jxtree.context, checked);
			win.overlay.draw(module_name);
		});

		this.deferred_module_bubble[module_name] = {};
		this.module_classes[module_name] = {};

		jxtree.checkStateChanged(function(node, state) {
			var data = node.getUserData();
			if (data && data.id) {
				var checked = state == JXTree.CHECKED;
				if (!data.clickmap_tree_node) {
					var info = mapdata.getMapdataById(module_name, data.id);
					if (info && info.positions) {
						var cls = jxtree_get_node_class(node);
						data.clickmap_tree_node = new win.ClickmapTreeNode(map, module_name, data.id, cls, node.label, info.positions, mapdata);
						mapdata.module_classes[module_name][data.id] = cls;
					} else {
					}
				}					
				win.tree_node_state_changed(node.jxtree.context, data.clickmap_tree_node, checked);
			}
		});
		jxtree.module_name = module_name;
		this.module_jxtree[module_name] = jxtree;

		whenloaded();

		this.whenInfoReady(module_name, function() {
			var deferred_module_bubble = mapdata.deferred_module_bubble[module_name];
			for (var id in deferred_module_bubble) {
				var bubble_list = deferred_module_bubble[id];
				if (bubble_list) {
					var bubble = mapdata.getBubble(module_name, id);
					for (var nn = 0; nn < bubble_list.length; ++nn) {
						bubble_list[nn].setContent("<div class=\"info_window\">" + bubble + "</div>");
					}
				}
			}
				
		});
	},

	getBubbleContent: function(module_name, data_id) {
		var bubble = this.getBubble(module_name, data_id);
		if (bubble) {
			return bubble.getContent();
		}
		return '';
	},

	setBubbleContent: function(bubble, module_name, data_id) {
		var bubble_content = this.getBubble(module_name, data_id);
		if (bubble_content) {
			bubble.setContent("<div class=\"info_window\">" + bubble_content + "</div>");
		} else {
			bubble.setContent("Loading data...");
			if (!this.deferred_module_bubble[module_name][data_id]) {
				this.deferred_module_bubble[module_name][data_id] = [];
			}
			this.deferred_module_bubble[module_name][data_id].push(bubble);
		}
	},

	// Returns the size of the hugo map
	entityCount: function() {
		return mapSize(this.hugo_map);
	},

	getMapdataById: function(module_name, modif_id) {
		return this.module_mapdata_by_id[module_name][modif_id];
	},

	getMapdataByEntityId: function(module_name, entity_id) {
		return this.module_mapdata_by_entity_id[module_name][entity_id];
	},

	// Adds a module mapdata: fills the hugo_map hashmap
	addModuleMapdata: function(module_name, module_mapdata) {

		this.module_mapdata[module_name] = module_mapdata;
		this.module_mapdata_by_id[module_name] = {};
		this.module_mapdata_by_entity_id[module_name] = {};

		var modif_map = {};
		var shape_map = {};
		var rev_shape_map = {};
		for (var ii = 0; ii < module_mapdata.length; ++ii) {
			var maps = module_mapdata[ii].maps;
			var modules = module_mapdata[ii].modules;
			var entities = module_mapdata[ii].entities;
			var entity_class = module_mapdata[ii]["class"];
			var postinf = module_mapdata[ii]["postinf"];
			if (module_mapdata[ii]["class"]) {
				this.class_list[module_mapdata[ii]["class"]] = true;
			}
			if (postinf) {
				postinf = postinf.split(" ");
				this.module_postid[postinf[0]] = postinf[1];
			}
			if (maps) {
				for (var jj = 0; jj < maps.length; ++jj) {
					var map = maps[jj];
					this.module_mapdata_by_id[module_name][map.id] = map;
					this.module_desc[map.id] = map;
					var map_modules = map.modules;
					if (map_modules) {
						for (var kk = 0; kk < map_modules.length; ++kk) {
							var module = map_modules[kk];
							this.module_mapdata_by_id[module_name][module.id] = module;
							this.module_desc[module.id] = module;
						}
					}
				}
			} else if (modules) {
				for (var jj = 0; jj < modules.length; ++jj) {
					var module = modules[jj];
					if (module.postinf) {
						var postinf = module.postinf.split(" ");
						this.module_postid[postinf[0]] = postinf[1];
					}
					this.module_mapdata_by_id[module_name][module.id] = module;
					this.module_desc[module.id] = module;
				}
			} else if (entities) {
				for (var jj = 0; jj < entities.length; ++jj) {
					var entity_map = entities[jj];
					var hugo_arr = entity_map['hugo'];
					if (hugo_arr && hugo_arr.length > 0) {
						for (var kk = 0; kk < hugo_arr.length; ++kk) {
							var hugo = hugo_arr[kk];
							if (!this.hugo_map[hugo]) {
								this.hugo_map[hugo] = {};
							}
							if (!this.hugo_map[hugo][module_name]) {
								this.hugo_map[hugo][module_name] = [];
							}
							this.hugo_map[hugo][module_name].push(entity_map);
						}
					}
					var modif_arr = entity_map.modifs;
					if (modif_arr) {
						for (var kk = 0; kk < modif_arr.length; ++kk) {
							var modif = modif_arr[kk];
							//var o_modif = this.module_mapdata_by_id[module_name][modif.id];
							modif.entity = entity_map;
							this.module_mapdata_by_id[module_name][modif.id] = modif;
							this.module_mapdata_by_entity_id[module_name][entity_map.id] = modif;
							if (modif.positions) {
								modif_map[modif.id] = [];
								for (var ll = 0; ll < modif.positions.length; ++ll) {
									var pos = modif.positions[ll];
									if (pos.w && pos.h) {
										var box = [pos.x, pos.w, pos.y, pos.h, pos.said];
										modif_map[modif.id].push(box);
									}
									if (pos.said) {
										shape_map[pos.said] = pos;
										if (entity_class == "COMPLEX") {
											//console.log("COMPLEX FOUND " + pos.said);
											if (MULTI_REV_SHAPE_MAP) {
												if (!rev_shape_map[modif.id]) {
													rev_shape_map[modif.id] = [];
												}
												rev_shape_map[modif.id].push(pos.said);
											} else {
												if (rev_shape_map[modif.id]) {
													console.log("rev_shape_map already set for " + modif.id + " to " + rev_shape_map[modif.id] + " vs. " + pos.said);
												}
												rev_shape_map[modif.id] = pos.said;
											}
										}
										//console.log("setting rev_shape_map " + modif.id + " to " + pos.said);
									}
								}
							}
						}
					}
				}
			}
		}
	
		this.module_modif_map[module_name] = modif_map;
		this.module_shape_map[module_name] = shape_map;
		this.module_rev_shape_map[module_name] = rev_shape_map;
		return !--this.to_load_count;
	},

	getModifMap: function(module_name) {
		return this.module_modif_map[module_name];
	},

	getShapeMap: function(module_name) {
		return this.module_shape_map[module_name];
	},

	load_mapdata: function(url, module_name) {
		this.ready[module_name] = new $.Deferred();
		this.ready[module_name].then(function() {
			mapdata.is_ready[module_name] = true;
		});

		navicell.module_names.push(module_name);
		var mapdata = this;
		console.log("navicell: loading [" + url + "]");
		$.ajax(url,
		       {
			       async: true,
			       dataType: 'json',
			       
			       success: function(data) {
				       console.log("navicell: loaded succesfully [" + url + "]");
				       mapdata.straight_data[module_name] = data;
				       if (mapdata.addModuleMapdata(module_name, data)) {
				       }
				       mapdata.ready[module_name].resolve();
			       },
			       
			       error: function() {
				       console.log("navicell: error loading [" + url + "] mapdata");
			       }
		       }
		      );
	},

	setMapURLs: function(data) {
	    if (!this.mapurl_map) {
		this.mapurl_map = {};
	    }
	    console.log("set map urls");
	    var lines = data.split(LINE_BREAK_REGEX);
	    var len = lines.length;
	    for (var nn = 0; nn < len; ++nn) {
		var line = lines[nn].replace(SIMPLE_COMMENT_REGEX, "");
		if (line) {
		    var arr = line.split("\t");
		    if (arr.length == 2) {
			var pattern = "{{" + arr[0] + "}}";
			this.mapurl_map[pattern] = arr[1];
			//console.log("setting " + pattern + " " + arr[1]);
		    }
		}
	    }
	},
    
    getMapURL: function(pattern) {
	//console.log("getmapurl: " + pattern + " " + this.mapurl_map[pattern]);
	return this.mapurl_map[pattern];
    },
    
    getClass: function() {return "Mapdata";}
};

// 2013-10-28: seems to be obsolete
function mapdata_display_markers(module_name, win, hugo_names)
{
	var id_arr = [];
	var arrpos = [];
	for (var nn = 0; nn < hugo_names.length; ++nn) {
		var hugo_module_map = navicell.mapdata.hugo_map[hugo_names[nn]];
		if (!hugo_module_map) {
			console.log("gene " + hugo_names[nn] + " not found");
			continue;
		}
		var entity_map_arr = hugo_module_map[module_name];
		if (!entity_map_arr) {
			console.log("gene " + hugo_names[nn] + " empty");
			continue;
		}
		for (var ii = 0; ii < entity_map_arr.length; ++ii) {
			var entity_map = entity_map_arr[ii];
			var modif_arr = entity_map.modifs;
			if (modif_arr) {
				for (var kk = 0; kk < modif_arr.length; ++kk) {
					var modif = modif_arr[kk];
					var positions = modif.positions;
					if (positions) {
						id_arr.push(modif.id);
					}
				}
			}
		}
	}
	win.show_markers(id_arr);
}

//
// Dataset class
//
// Main object gathering all data information
//

function JXTreeScanner(module_name) {
	this.module_name = module_name;
	this.arrid = [];
	this.arrpos = [];
	this.mappos = {};
}

JXTreeScanner.prototype = {
	scanNode: function(node) {
		if (node.isChecked()) {
			var data = node.getUserData();
			if (data && data.id) {
				this.arrid.push(data.id);
				var pos = navicell.dataset.getGeneInfoByModifId(this.module_name, data.id);
				if (pos) {
					array_push_all(this.arrpos, pos[1]);
				}
				var shape_info = navicell.mapdata.getMapByModifId(this.module_name, data.id);
				if (shape_info) {
					for (var nn = 0; nn < shape_info.length; ++nn) {
						var said = shape_info[nn][4];
						if (said) {
							this.mappos[said] = true;
						}
					}
				}
			}
		}
	},

	getArrayPos: function() {
		return this.arrpos;
	},

	getMapPos: function() {
		return this.mappos;
	}
};

function Dataset(name) {
	this.name = name;

	this.genes = {};
	this.genes_id = {};
	this.gene_id = 1;
	this.sorted_gene_names = [];

	this.datatable_id = 1;
	this.datatables = {};
	this.datatables_id = {};
	this.datatables_canon_name = {};

	this.sample_id = 1;
	this.samples = {};
	this.samples_canon_name = {};
	this.samples_id = {};

	this.modifs_id = {};

	this.gene_shape_map = {};
	this.gene_shape_modif_map = {};
	this.gene_set_shape_map = {}; // ???
	this.module_arrpos = {};
}

Dataset.prototype = {
	name: "",
	datatables: {},
	datatables_id: {},
	datatables_canon_name: {},
	genes: {},
	samples: {},

	geneCount: function() {
		return mapSize(this.genes);
	},

	sampleCount: function() {
		return mapSize(this.samples);
	},

	datatableCount: function() {
		return mapSize(this.datatables);
	},

	getDatatables: function() {
		return this.datatables;
	},

	readDatatable: function(biotype_name, name, file, url, win, async) {
		var datatable = new Datatable(this, biotype_name, name, file, url, this.datatable_id++, win, async);
		var dataset = this;
		datatable.ready.then(function() {
			if (!datatable.error) {
				dataset.addDatatable(datatable);
			}
		});
		return datatable;
	},

	addDatatable: function(datatable) {
		this.datatables_id[datatable.getId()] = datatable;
		this.registerDatatableNames(datatable);
		//this.datatables[datatable.name] = datatable;
		//this.datatables_canon_name[datatable.getCanonName()] = datatable;
		//this.datatables_canon_name[datatable.canon_name] = datatable;
	},

	registerDatatableNames: function(datatable) {
		this.datatables[datatable.name] = datatable;
		this.datatables_canon_name[datatable.canon_name] = datatable;
	},

	unregisterDatatableNames: function(datatable) {
		delete this.datatables[datatable.name];
		delete this.datatables_canon_name[datatable.canon_name];
	},

	getDatatableByName: function(name) {
		return this.datatables[name];
	},

	getDatatableById: function(id) {
		return this.datatables_id[id];
	},

	getDatatableByCanonName: function(canon_name) {
		return this.datatables_canon_name[canon_name];
	},

	removeDatatable: function(datatable) {
		if (this.datatables[datatable.name] == datatable) {
			for (var sample_name in datatable.sample_index) {
				var sample = this.samples[sample_name];
				if (!--sample.refcnt) {
					delete this.samples_id[sample.id];
					delete this.samples[sample_name];
					delete this.samples_canon_name[sample.getCanonName()];
				}
			}
			for (var gene_name in datatable.gene_index) {
				var gene = this.genes[gene_name];
				if (!--gene.refcnt) {
					delete this.genes_id[gene.getId()];
					delete this.genes[gene_name];
				}
			}
			delete this.datatables[datatable.name];

			this.sorted_gene_names = mapKeys(this.genes);
			this.sorted_gene_names.sort();

			navicell.group_factory.buildGroups();
		}
	},

	getGeneInfoByModifId: function(module_name, modif_id) {
		if (this.modifs_id[module_name]) {
			return this.modifs_id[module_name][modif_id];
		}
		return null;
	},

	getGenesByShapeId: function(module_name, shape_id) {
		if (this.gene_shape_map[module_name]) {
			return this.gene_shape_map[module_name][shape_id];
		}
		return null;
	},

	getModifsByShapeId: function(module_name, shape_id) {
		if (this.gene_shape_modif_map[module_name]) {
			return this.gene_shape_modif_map[module_name][shape_id];
		}
		return null;
	},

	getGeneSetByShapeId: function(module_name, shape_id) {
		if (this.gene_set_shape_map[module_name]) {
			return this.gene_set_shape_map[module_name][shape_id];
		}
		return null;
	},

	syncModifs: function() {
		this.modifs_id = {};
		this.gene_shape_map = {};
		this.gene_shape_modif_map = {};
		this.gene_set_shape_map = {};
		for (var jj = 0; jj < navicell.module_names.length; ++jj) {
			var module_name = navicell.module_names[jj];
			this.modifs_id[module_name] = {};
			this.gene_shape_map[module_name] = {};
			this.gene_shape_modif_map[module_name] = {};
			this.gene_set_shape_map[module_name] = {};
			for (var gene_name in this.genes) {
				var gene = this.genes[gene_name];
				var hugo_module_map = this.genes[gene_name].hugo_module_map;
				var entity_map_arr = hugo_module_map[module_name];
				if (!entity_map_arr) {
					continue;
				}
				for (var ii = 0; ii < entity_map_arr.length; ++ii) {
					var entity_map = entity_map_arr[ii];
					var modif_arr = entity_map.modifs;
					if (modif_arr) {
						for (var nn = 0; nn < modif_arr.length; ++nn) {
							var modif = modif_arr[nn];
							var positions = modif.positions;
							var arrpos = [];
							if (positions) {
								for (var kk = 0; kk < positions.length; ++kk) {
									var pos = positions[kk];
									arrpos.push({id : modif.id, p : new google.maps.Point(pos.x, pos.y), gene_name: gene_name, said: pos.said});
									if (pos.said) {
										if (!this.gene_shape_map[module_name][pos.said]) {
											this.gene_shape_map[module_name][pos.said] = [];
										}
										this.gene_shape_map[module_name][pos.said].push(gene_name);
										if (!this.gene_shape_modif_map[module_name][pos.said]) {
											this.gene_shape_modif_map[module_name][pos.said] = {};
										}
										this.gene_shape_modif_map[module_name][pos.said][modif.id] = true;
										gene.addShapeId(module_name, pos.said);
									}
									if (pos.cid) {
										if (MULTI_REV_SHAPE_MAP) {
											var cid_said_arr = navicell.mapdata.module_rev_shape_map[module_name][pos.cid];
											if (cid_said_arr) {
												for (var ll = 0; ll < cid_said_arr.length; ++ll) {
													var cid_said = cid_said_arr[ll];
													if (!this.gene_shape_map[module_name][cid_said]) {
														this.gene_shape_map[module_name][cid_said] = [];
													}
													this.gene_shape_map[module_name][cid_said].push(gene_name);
													if (!this.gene_shape_modif_map[module_name][cid_said]) {
														this.gene_shape_modif_map[module_name][cid_said] = {};
													}
													this.gene_shape_modif_map[module_name][cid_said][modif.id] = true;
												}
											}
										} else {
											var cid_said = navicell.mapdata.module_rev_shape_map[module_name][pos.cid];
											if (cid_said) {
												if (!this.gene_shape_map[module_name][cid_said]) {
													this.gene_shape_map[module_name][cid_said] = [];
												}
												this.gene_shape_map[module_name][cid_said].push(gene_name);
											}
										}
									}
								}
							}
							if (!this.modifs_id[module_name][modif.id]) {
								this.modifs_id[module_name][modif.id] = [[gene], arrpos];
							} else {
								var genes = this.modifs_id[module_name][modif.id][0];
								var found = false;
								for (var zz = 0; zz < genes.length; ++zz) {
									if (genes[zz] == gene) {
										found = true;
										break;
									}
								}
								if (!found) {
									this.modifs_id[module_name][modif.id][0].push(gene);
								} else {
									var x_arrpos = this.modifs_id[module_name][modif.id][1];
									if (arrpos[0].p.x != x_arrpos[0].p.x || arrpos[0].p.y != x_arrpos[0].p.y) {
										console.log("BAD POS " + arrpos[0].p.x + " vs. " +  x_arrpos[0].p.x + " " +  arrpos[0].p.y + " vs. " +  x_arrpos[0].p.y);
									}
								}
							}
							//this.modifs_id[module_name][modif.id] = [gene, arrpos];
						}
					}
				}
			}
		}

		this.module_arrpos = {};
		for (var jj = 0; jj < navicell.module_names.length; ++jj) {
			var module_name = navicell.module_names[jj];
			var arrpos = [];
			for (var modif_id in this.modifs_id[module_name]) {
				var gene_info = this.modifs_id[module_name][modif_id];
				array_push_all(arrpos, gene_info[1]);
			}
			this.module_arrpos[module_name] = arrpos;
		}
	},

	getArrayPos: function(module_name) {
		return this.module_arrpos[module_name];
	},

	_scanTree: function(module_name) {
		var jxtree = navicell.mapdata.getJXTree(module_name);
		var jxtreeScanner = new JXTreeScanner(module_name);
		jxtree.scanTree(jxtreeScanner);
		var jxrestree = navicell.mapdata.getResJXTree(module_name);
		if (jxrestree) {
			jxrestree.scanTree(jxtreeScanner);
		}
		return jxtreeScanner;
	},

	getSelectedArrayPos: function(module_name) {
		var jxtreeScanner = this._scanTree(module_name);
		return jxtreeScanner.getArrayPos();
	},
	
	getSelectedMapPos: function(module_name) {
		var jxtreeScanner = this._scanTree(module_name);
		return jxtreeScanner.getMapPos();
	},
	
	getSamples: function() {
		return this.samples;
	},
	
	getSample: function(sample_name) {
		return this.samples[sample_name];
	},
	
	getSampleById: function(sample_id) {
		return this.samples_id[sample_id];
	},
	
	getSampleByCanonName: function(sample_canon_name) {
		return this.samples_canon_name[sample_canon_name];
	},
	
	// behaves as a sample factory
	addSample: function(sample_name) {
		if (!this.samples[sample_name]) {
			var sample = new Sample(sample_name, this.sample_id++);
			this.samples[sample_name] = sample;
			this.samples_canon_name[sample.getCanonName()] = sample;
			this.samples_id[sample.id] = sample;
		} else {
			this.samples[sample_name].refcnt++;
		}
		return this.samples[sample_name];
	},

	getGeneByName: function(gene_name) {
		return this.genes[gene_name];
	},
	
	getGeneById: function(gene_id) {
		return this.genes_id[gene_id];
	},
	
	getSortedGeneNames: function() {
		return this.sorted_gene_names;
	},

	// behaves as a gene factory
	addGene: function(gene_name, hugo_module_map) {
		if (!this.genes[gene_name]) {
			var gene = new Gene(gene_name, hugo_module_map, this.gene_id++);
			this.genes[gene_name] = gene;
			this.genes_id[gene.getId()] = gene;
			this.sorted_gene_names = mapKeys(this.genes);
			this.sorted_gene_names.sort();
		} else {
			this.genes[gene_name].refcnt++;
		}
		return this.genes[gene_name];
	},

	updateDatatable: function(win, datatable_name, new_datatable_name, new_datatable_type) {
		if (!this.datatables[datatable_name]) {
			return true;
		}
		if (datatable_name == new_datatable_name) {
			var datatable = this.datatables[datatable_name];
			datatable.biotype = navicell.biotype_factory.getBiotype(new_datatable_type);
			return true;
		}
		if (this.datatables[new_datatable_name]) {
			return false;
		}					
		var datatable = this.datatables[datatable_name];
		delete this.datatables[datatable_name];
		datatable.setName(new_datatable_name);
		datatable.biotype = navicell.biotype_factory.getBiotype(new_datatable_type);
		this.datatables[new_datatable_name] = datatable;
		var module = get_module(win);
		if (datatable.displayContinuousConfig[module]) {
			datatable.displayContinuousConfig[module].update();
		} else if (datatable.displayUnorderedDiscreteConfig[module]) {
			datatable.displayUnorderedDiscreteConfig[module].update();
		}
		return true;
	},

	drawDLO: function(module, overlay, context, scale, modif_id, gene_name, topx, topy) {
		var size = 2;
		var bound = null;
		var drawing_config = navicell.getDrawingConfig(module);
		for (var num = 1; num <= GLYPH_COUNT; ++num) {
			if (drawing_config.displayGlyphs(num)) {
				bound = draw_glyph(module, num, overlay, context, scale, modif_id, gene_name, topx, topy);
				if (bound) {
					topx = bound[0] + bound[2] - 2;
				}
			}
		}
		if (bound) {
			topx -= 6;
		}
		if (drawing_config.displayHeatmaps()) {
			draw_heatmap(module, overlay, context, scale, modif_id, gene_name, topx, topy);
		}
		if (drawing_config.displayBarplots()) {
			draw_barplot(module, overlay, context, scale, modif_id, gene_name, topx, topy);
		}
	},

	getClass: function() {return "Dataset";}
};

//
// Datatable class
//
// Encapsulate datatable contents (but only for genes existing in map) and type
//

function ImportSynchronizer() {
	this.count = 0;
	this.error = "";
}

ImportSynchronizer.prototype = {

	start: function(count, wait_cursor_on, win) {
		this.count = count;
		this.wait_cursor = wait_cursor_on ? new WaitCursor(wait_cursor_on, win) : null;
		this.error = "";
	},

	success: function() {
		this.count--;
		if (!this.count && this.wait_cursor) {
			this.wait_cursor.restore();
		}
	},

	setError: function(error) {
		this.error = error;
		if (this.error && this.wait_cursor) {
			this.wait_cursor.restore();
		}
	},

	isReady: function() {
		if (this.error) {
			return this.error;
		}
		return this.count == 0;
	}
};

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g,'');
	}
}

function make_button(name, id, onclick) {
	return "<input type='button' style='-moz-border-radius: 4px; border-radius: 4px; font-size: x-small' class='ui-widget ui-button ui-dialog-buttonpane ui-button-text ui-button-text-only ui-state-default ui-widget-content' id='" + id + "' value='" + name + "' onclick='" + onclick + "'></input>";
}

function is_empty_value(value) {
	if (!value) {
		return true;
	}
	var tvalue = value.trim().toUpperCase();
	return tvalue == '' || tvalue == '_' || tvalue == '-' || tvalue == 'NA' || tvalue == 'N/A' || tvalue == 'NAN';
}

function force_datatable_display(id) {
	var datatable = navicell.dataset.datatables_id[id];
	if (datatable) {
		datatable.forceDisplay();
	}
}

function assert(cond) {
	if (!cond) {
		console.log("** ASSERT FAILED **");
		console.trace();
	}
}

DisplayContinuousConfig.DEFAULT_STEP_COUNT = 5;

function DisplayContinuousConfig(datatable, win, discrete_ordered) {
	this.datatable = datatable;
	this.win = win;
	this.module = get_module(win);
	this.discrete_ordered = {}
	this.discrete_ordered['sample'] = discrete_ordered;
	this.discrete_ordered['group'] = false;
	this.has_empty_values = datatable.hasEmptyValues();
	this.use_absval = {};
	for (var tab in DisplayContinuousConfig.tabnames) {
		var tabname = DisplayContinuousConfig.tabnames[tab];
		this.use_absval[tabname] = {};
	}
	this.use_gradient = {};
	this.use_intervals = {};
	this.use_intervals['sample'] = {};
	this.use_intervals['group'] = {};
	this.default_step_count = {};
	this.default_step_count['sample'] = {};
	this.default_step_count['group'] = {};
	if (discrete_ordered) {
		this.use_gradient['color'] = true;
		this.use_gradient['shape'] = true;
		this.use_gradient['size'] = true;
		step_cnt = this.datatable.getDiscreteValues().length-1;
		if (this.has_empty_values) {
			--step_cnt;
		}
		this.default_step_count['sample']['color'] = step_cnt;
		this.default_step_count['sample']['shape'] = step_cnt;
		this.default_step_count['sample']['size'] = step_cnt;
		this.default_step_count['group']['color'] = 1;
		this.default_step_count['group']['shape'] = step_cnt;
		this.default_step_count['group']['size'] = step_cnt;

		this.use_intervals['sample']['color'] = false;
		this.use_intervals['sample']['shape'] = false;
		this.use_intervals['sample']['size'] = false;
		this.use_intervals['group']['color'] = false;
		this.use_intervals['group']['shape'] = true;
		this.use_intervals['group']['size'] = true;
	} else {
		this.use_gradient['color'] = true;
		this.use_gradient['shape'] = false;
		this.use_gradient['size'] = false;

        // set default step count value to 2 
		this.default_step_count['sample']['color'] = 2;
		this.default_step_count['sample']['shape'] = DisplayContinuousConfig.DEFAULT_STEP_COUNT;
		this.default_step_count['sample']['size'] = DisplayContinuousConfig.DEFAULT_STEP_COUNT;
		this.default_step_count['group']['color'] = 2;
		this.default_step_count['group']['shape'] = DisplayContinuousConfig.DEFAULT_STEP_COUNT;
		this.default_step_count['group']['size'] = DisplayContinuousConfig.DEFAULT_STEP_COUNT;

		this.use_intervals['sample']['color'] = false;
		this.use_intervals['sample']['shape'] = true;
		this.use_intervals['sample']['size'] = true;
		this.use_intervals['group']['color'] = false;
		this.use_intervals['group']['shape'] = true;
		this.use_intervals['group']['size'] = true;
	}

	this.group_method = {};
	this.sample_method = {};
	this.setGroupMethod('color', Group.CONTINUOUS_AVERAGE);
	this.setGroupMethod('shape', Group.CONTINUOUS_AVERAGE);
	this.setGroupMethod('size', Group.CONTINUOUS_AVERAGE);

	var def_sample_method = this.datatable.minval < 0 ? Group.CONTINUOUS_ABS_MAXVAL: Group.CONTINUOUS_MAXVAL;
	this.setSampleMethod('color', def_sample_method);
	this.setSampleMethod('shape', def_sample_method);
	this.setSampleMethod('size', def_sample_method);

	this.divs = {};
	this.buildDiv('color');
	this.buildDiv('shape');
	this.buildDiv('size');
	this.setStepCount();
}

var STEP_MAX_SIZE = 36.;
var DISCRETE_SIZE_COEF = 2.;
var TABS_DIV_ID = 1;
var KSUFFIX = 1;

DisplayContinuousConfig.LT_MIN = 1;
DisplayContinuousConfig.GT_MAX = 2;

DisplayContinuousConfig.prototype = {

	getActiveTab: function() {
		return this.active;
	},

	setActiveTab: function(active) {
		this.active = active;
	},

	setStepCount: function() {
		this.values = {};
		this.colors = {};
		this.sizes = {};
		this.shapes = {};

		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			this.use_absval[tabname] = {};
			this.values[tabname] = {};
			this.colors[tabname] = {};
			this.sizes[tabname] = {};
			this.shapes[tabname] = {};
			this.setStepCount_config(this.default_step_count[tabname]['color'], 'color', tabname);
			this.setStepCount_config(this.default_step_count[tabname]['shape'], 'shape', tabname);
			this.setStepCount_config(this.default_step_count[tabname]['size'], 'size', tabname);
		}
		this.datatable.refresh(this.win);
	},

	setStepCount_config: function(step_cnt, config, tabname) {
		step_cnt *= 1.;
		var step_cnt_1 = this.use_gradient[config] ? step_cnt+1 : step_cnt;
		var keep = this.values[tabname][config] && step_cnt_1 == this.getStepCount(config, tabname);
		this.values[tabname][config] = [];
		var values = this.values[tabname][config];
		var minval = this.getDatatableMinval(config, tabname);
		var maxval = this.getDatatableMaxval(config, tabname);
		if (this.discrete_ordered[tabname]) {
		    if (this.has_empty_values) {
			values.push(Number.MIN_NUMBER);
		    }
		    var discrete_values = this.datatable.getDiscreteValues();
		    for (var idx in discrete_values) {
			var value = discrete_values[idx];
			if (!is_empty_value(value)) {
			    values.push(value);
			}
		    }
		} else {
		    var step = (maxval - minval)/(step_cnt);
		    if (this.has_empty_values) {
			values.push(Number.MIN_NUMBER);
		    }
		    values.push(minval);
		    // modif ebo/ev
		    //if (step_cnt == 2 && maxval > 0 && minval < 0) {
		    if (this.centerOnZero(step_cnt, minval, maxval)) {
			values.push(0.);
		    } else {
			for (var nn = 0; nn < step_cnt-1; ++nn) {
			    var value = minval + (nn+1.)*step;
			    value = parseInt(value*100.)/100;
			    values.push(value);
			}
		    }
		    values.push(this.datatable.maxval);
		}
	        if (this.has_empty_values && !keep) {
			step_cnt++;
		}
		if (!keep) {
			this.colors[tabname][config] = new Array(step_cnt_1);
			this.sizes[tabname][config] = new Array(step_cnt_1);
			this.shapes[tabname][config] = new Array(step_cnt_1);
			this.setDefaults(step_cnt, config, tabname);
		}
		this.update_config(config, tabname);
		/*
		// AZ code
		var avg = (minval + maxval)/2;
		var dt_values = this.datatable.getValues();
		var posthr = getPositiveThreshold(dt_values, avg);
		var negthr = getNegativeThreshold(dt_values, avg);
		//console.log("avg: " + avg + " " + posthr + " " + negthr);
		*/
	},


        centerOnZero: function(step_cnt, minval, maxval) {
	    return step_cnt == 2 && maxval > 0 && minval < 0;
	},

	setStepInfo: function(config, tabname, idx, value, color, size, shape) {
		//console.log("setStepInfo: " + config + " " + idx + " " + value + " " + color);
		if (value != Number.MIN_NUMBER) {
			var idx_1 = this.use_gradient[config] ? idx : idx+1;
			this.values[tabname][config][idx_1] = value;
		} else {
		}
		this.colors[tabname][config][idx] = color;
		this.sizes[tabname][config][idx] = size;
		this.shapes[tabname][config][idx] = shape;
	},

	setUseAbsValue: function(config, use_absval) {
		this.use_absval['sample'][config] = use_absval;
	},

	setDefaults: function(step_cnt, config, tabname) {
	    if (this.use_gradient[config]) {
		step_cnt++;
	    }
	    var step_cnt_1, beg;
	    if (this.has_empty_values) {
		this.setStepInfo(config, tabname, 0, Number.MIN_NUMBER, EMPTY_VALUE_DEFAULT_COLOR, 4, 0);
		step_cnt_1 = step_cnt-1;
		beg = 1;
	    } else {
		step_cnt_1 = step_cnt;
		beg = 0;
	    }
	    var colors = color_gradient(new RGBColor(0, 255, 0), new RGBColor(255, 0, 0), step_cnt_1); 
	    for (var ii = beg; ii < step_cnt; ++ii) {
		// set middle color to white for 2 step count (default) 
		if (step_cnt_1 == 3 &&
		    ((this.has_empty_values && ii == 2) ||
		     (!this.has_empty_values && ii == 1))) {
                    this.setStepInfo(config, tabname, ii, Number.MIN_NUMBER, "FFFFFF", 4+2*ii, ii);
		} else {
		    this.setStepInfo(config, tabname, ii, Number.MIN_NUMBER, colors[ii-beg].getRGBValue(), 4+2*ii, ii);
		}
	    }
	},

	getStepIndex: function(config, tabname, value, gradient_mode) {
		if (value == undefined || value.toString() == '') {
			//return 0;
			return -1;
		}
		var ivalue = parseFloat(value);
		if (isNaN(ivalue)) {
			return -1;
		}
		value *= 1.;
		var values = this.values[tabname][config];
		var len = values.length;
		var offset = this.has_empty_values ? 1 : 0;
		if (gradient_mode) {
			if (value < values[offset]) {
				return len+DisplayContinuousConfig.LT_MIN;
			}
			if (value >= values[len-1]) {
				return len+DisplayContinuousConfig.GT_MAX;
			}
		}

		for (var nn = 1+offset; nn < len; ++nn) {
			if (value <= values[nn]) { // EV: 2015-06-11 patch: changed < to <=
				return nn-1;
			}
		}
		return len-1;
	},

	getStepCount: function(config, tabname) {
		if (this.use_gradient[config]) {
			return this.values[tabname][config].length-this.has_empty_values;
		} else {
			return this.values[tabname][config].length-this.has_empty_values-1;
		}
	},

	getDatatableMinval: function(config, tabname) {
		if (!this.use_absval[tabname][config]) {
			return this.datatable.minval;
		}
		return this.datatable.minval_abs;
	},

	getDatatableMaxval: function(config, tabname) {
		if (!this.use_absval[tabname][config]) {
			return this.datatable.maxval;
		}
		return this.datatable.maxval_abs;
	},

	getDatatableValue: function(config, tabname, value) {
		if (value == undefined || value.toString() == '') {
			return value;
		}
		var ivalue = parseFloat(value);
		if (isNaN(ivalue)) {
			return value;
		}
		value *= 1.;
		if (!this.use_absval[tabname][config]) {
			return value;
		}
		return Math.abs(value);
	},

	setSampleMethod: function(config, sample_method) {
		this.sample_method[config] = sample_method;
	},

	setGroupMethod: function(config, group_method) {
		this.group_method[config] = group_method;
		this.use_absval['group'][config] = 
			group_method == Group.CONTINUOUS_ABS_AVERAGE ||
			group_method == Group.CONTINUOUS_ABS_MINVAL ||
			group_method == Group.CONTINUOUS_ABS_MAXVAL;
	},

	getDatatableSampleValue: function(config, value) {
		return this.getDatatableValue(config, 'sample', value);
	},

	getDatatableGroupValue: function(config, value) {
		return this.getDatatableValue(config, 'group', value);
	},

	getValueAt: function(config, tabname, idx) {
		if (this.use_gradient[config]) {
			return this.values[tabname][config][idx];
		} else {
			return this.values[tabname][config][idx+1];
		}
	},

	getColorAt: function(config, tabname, idx) {
		return this.colors[tabname][config][idx];
	},

	getSizeAt: function(config, tabname, idx) {
		return this.sizes[tabname][config][idx];
	},

	getShapeAt: function(config, tabname, idx) {
		return this.shapes[tabname][config][idx];
	},

	getHeatmapStyleSample: function(sample_name, gene_name) {
		var color = this.getColorSample(sample_name, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getHeatmapStyleSampleByModifId: function(sample_name, modif_id) {
		var color = this.getColorSampleByModifId(sample_name, modif_id);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getHeatmapStyleGroup: function(group, gene_name) {
		var color = this.getColorGroup(group, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getHeatmapStyleGroupByModifId: function(group, modif_id) {
		var color = this.getColorGroupByModifId(group, modif_id);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getBarplotStyleSample: function(sample_name, gene_name) {
		return this.getHeatmapStyleSample(sample_name, gene_name);
	},

	getBarplotStyleSampleByModifId: function(sample_name, modif_id) {
		return this.getHeatmapStyleSampleByModifId(sample_name, modif_id);
	},

	getBarplotStyleGroup: function(group, gene_name) {
		return this.getHeatmapStyleGroup(group, gene_name);
	},

	getBarplotStyleGroupByModifId: function(group, modif_id) {
		return this.getHeatmapStyleGroupByModifId(group, modif_id);
	},

	_getBarplotHeight: function(tabname, value, max) {
		if (value != undefined && value.toString() != '') {
			value *= 1.;
			var minval = this.getDatatableMinval('color', tabname);
			var maxval = this.getDatatableMaxval('color', tabname);
			return max * (value-minval) / (maxval - minval);
		}
		return 0;
	},

	getBarplotSampleHeight: function(sample_name, gene_name, max) {
		var value = this.getColorSizeSampleValue(sample_name, gene_name);
		return this._getBarplotHeight('sample', value, max);
	},

	getBarplotSampleHeightByModifId: function(sample_name, modif_id, max) {
		var value = this.getColorSizeSampleValueByModifId(sample_name, modif_id);
		return this._getBarplotHeight('sample', value, max);
	},

	getBarplotGroupHeight: function(group, gene_name, max) {
		var value = group.getValue(this.module, this.datatable, gene_name, null, this.group_method['color']);
		return this._getBarplotHeight('group', value, max);
	},

	getBarplotGroupHeightByModifId: function(group, modif_id, max) {
		var value = group.getValue(this.module, this.datatable, null, modif_id, this.group_method['color']);
		return this._getBarplotHeight('group', value, max);
	},

	_getColor: function(value, tabname) {
		var config = 'color';
		var use_gradient = this.use_gradient[config] && !this.discrete_ordered[tabname];
		var idx = this.getStepIndex(config, tabname, value, use_gradient);
		if (idx < 0) {
			return undefined;
		}
		var colors = this.colors[tabname][config];
		if (use_gradient) {
			var len = colors.length;
			if (idx < 1 && this.has_empty_values) {
				return colors[0];
			}
			if (idx == len+DisplayContinuousConfig.LT_MIN) {
				var idx_beg = this.has_empty_values?1:0;
				var color = RGBColor.fromHex(colors[idx_beg]);
				return new RGBColor(color.getRed(), color.getGreen(), color.getBlue()).getRGBValue();
			}
			if (idx == len+DisplayContinuousConfig.GT_MAX) {
				if (!colors[len-1]) {
					console.log("ERROR: color.length=" + len + ", tabname=" + tabname + ", config=" + config);
				}
				var color = RGBColor.fromHex(colors[len-1]);
				return new RGBColor(color.getRed(), color.getGreen(), color.getBlue()).getRGBValue();
			}
			var minval = this.getDatatableMinval(config, tabname);
			var maxval = this.getDatatableMaxval(config, tabname);
			minval = this.values[tabname][config][idx];
			maxval = this.values[tabname][config][idx+1];
			return get_color_gradient(RGBColor.fromHex(colors[idx]), RGBColor.fromHex(colors[idx+1]), minval, maxval, value).getRGBValue();
		} else {
			return colors[idx];
		}
	},

	_getSize: function(value, tabname) {
		var idx = this.getStepIndex('size', tabname, value);
		if (idx < 0) {
			return undefined;
		}
		return this.sizes[tabname]['size'][idx];
	},

	_getShape: function(value, tabname) {
		var idx = this.getStepIndex('shape', tabname, value);
		if (idx < 0) {
			return undefined;
		}
		return this.shapes[tabname]['shape'][idx];
	},

	displayShapes: function(tabname) {
		console.log("display shapes " + tabname);
		var shapes = this.shapes[tabname]['shape'];
		for (var idx in shapes) {
			console.log("shape at " + idx + " " + shapes[idx]);
		}
	},

	makeValueInput: function(id, config, tabname, idx) {
		if (this.discrete_ordered[tabname]) {
			return "<td id='step_value_" + tabname + '_' + config + '_' + id + "_" + idx + "'>" + this.getValueAt(config, tabname, idx) + "</td>";
		}
//		return "<td><input type='text' class='input-value' id='step_value_" + tabname + '_' + config + '_' + id + "_" + idx + "' value='" + this.getValueAt(config, tabname, idx) + "' onchange='DisplayContinuousConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'></input></td>";
		return "<td><input type='text' class='input-value' id='step_value_" + tabname + '_' + config + '_' + id + "_" + idx + "' value='" + this.getValueAt(config, tabname, idx) + "' onchange='DisplayContinuousConfig.setInputValue(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'></input></td>";
	},

	makeColorInput: function(id, config, tabname, idx) {
		//return "<td><input id='step_config_" + tabname + '_' + config + '_' + id + "_" + idx + "' value='" + this.getColorAt(config, tabname, idx) + "' class='color input-value' onchange='DisplayContinuousConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'></input></td>";
		return "<td><input id='step_config_" + tabname + '_' + config + '_' + id + "_" + idx + "' value='" + this.getColorAt(config, tabname, idx) + "' class='color input-value' onchange='DisplayContinuousConfig.setInputColor(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'></input></td>";
	},

	makeSelectSize: function(id, config, tabname, idx) {
		var selsize = this.getSizeAt(config, tabname, idx);
		//var html = "<td><select id='step_size_" + tabname + '_' + config + '_' + id + "_" + idx + "' onchange='DisplayContinuousConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'>";
		var html = "<td><select id='step_size_" + tabname + '_' + config + '_' + id + "_" + idx + "' onchange='DisplayContinuousConfig.setSelectSize(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'>";
		var maxsize = STEP_MAX_SIZE/2;
		for (var size = 0; size < maxsize; size += 1) {
			var size2 = 2*size;
			html += "<option value='" + size2 + "' " + (size2 == selsize ? "selected" : "") + ">" + size2 + "</option>";
		}
		html += "</select></td>";
		return html;
	},

	makeSelectShape: function(id, config, tabname, idx) {
		var selshape = this.getShapeAt(config, tabname, idx);
		//var html = "<td><select id='step_shape_" + tabname + '_' + config + '_' + id + "_" + idx + "' onchange='DisplayContinuousConfig.setEditing(\"" + id + "\", true, \"" + config + "\")''>";
		var html = "<td><select id='step_shape_" + tabname + '_' + config + '_' + id + "_" + idx + "' onchange='DisplayContinuousConfig.setSelectShape(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")''>";
		if (selshape >= navicell.shapes.length) {
			selshape = navicell.shapes.length-1;
		}
		for (var shape_idx in navicell.shapes) {
			var shape = navicell.shapes[shape_idx];
			html += "<option value='" + shape_idx + "' " + (shape_idx == selshape ? "selected" : "") + ">" + shape + "</option>";
		}
		html += "</select></td>";
		return html;
	},

	makeSelectMultiGeneMethod: function(config, type) {
		var datatable = this.datatable;
		var method;
		var selected;
		var str = "";
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		if (type == 'group') {
			method = this.group_method[config];
			str = "<select id='group_method_" + config + '_' + id + "' style='font-size: 70%' onchange='DisplayContinuousConfig.setGroupMethod(\"" + config + "\", \"" + id + "\", \"" + method + "\")'>\n";
		} else if (type == 'sample') {
			method = this.sample_method[config];
			str = "<select id='sample_method_" + config + '_' + id + "' style='font-size: 70%' onchange='DisplayContinuousConfig.setSampleMethod(\"" + config + "\", \"" + id + "\", \"" + method + "\")'>\n";
		}
		selected = (method == Group.CONTINUOUS_AVERAGE) ? " selected" : "";
		str += "<option value='" + Group.CONTINUOUS_AVERAGE + "'" + selected + ">Average</option>\n";
		selected = (method == Group.CONTINUOUS_MEDIAN) ? " selected" : "";
		str += "<option value='" + Group.CONTINUOUS_MEDIAN + "'" + selected + ">Median</option>\n";
		selected = (method == Group.CONTINUOUS_MINVAL) ? " selected" : "";
		str += "<option value='" + Group.CONTINUOUS_MINVAL + "'" + selected + ">Min Value</option>\n";

		selected = (method == Group.CONTINUOUS_MAXVAL) ? " selected" : "";
		str += "<option value='" + Group.CONTINUOUS_MAXVAL + "'" + selected + ">Max Value</option>\n";

		if (this.datatable.minval < 0) {
			selected = (method == Group.CONTINUOUS_ABS_AVERAGE) ? " selected" : "";
			str += "<option value='" + Group.CONTINUOUS_ABS_AVERAGE + "'" + selected + ">Average Absolute</option>\n";

			selected = (method == Group.CONTINUOUS_ABS_MINVAL) ? " selected" : "";
			str += "<option value='" + Group.CONTINUOUS_ABS_MINVAL + "'" + selected + ">Min Absolute Value</option>\n";

			selected = (method == Group.CONTINUOUS_ABS_MAXVAL) ? " selected" : "";
			str += "<option value='" + Group.CONTINUOUS_ABS_MAXVAL + "'" + selected + ">Max Absolute Value</option>\n";
		}
		str += "</select>";
		return str;
	},

	getValue: function(config, tabname, sample_name, gene_name) {
		var value = this.datatable.getValue(sample_name, gene_name);
		//console.log("getValueByGene: " + gene_name + " value1=" + value + ", value2=" + this.getDatatableValue(config, tabname, value));
		return this.getDatatableValue(config, tabname, value);
	},

	getValueByModifId: function(config, tabname, sample_name, modif_id) {
		// should be replaced by:
		var value = this.datatable.getValueByModifId(this.module, sample_name, modif_id, this.sample_method[config]);
		//console.log("getValueByModifId: " + modif_id + " value1=" + value + ", value2=" + this.getDatatableValue(config, tabname, value));
		return this.getDatatableValue(config, tabname, value);
		/*
		var info = navicell.dataset.getGeneInfoByModifId(this.module, modif_id);
		if (info) {
			var genes = info[0];
			var total_value = 0.;
			// if average !
			for (var nn = 0; nn < genes.length; ++nn) {
				var gene_name = genes[nn].name;
				total_value += this.datatable.getValue(sample_name, gene_name)*1.;
			}
			return this.getDatatableValue(config, tabname, total_value / genes.length);
		}
		return 0;
		*/
	},

	getShapeSampleValue: function(sample_name, gene_name) {
		return this.getValue('shape', 'sample', sample_name, gene_name);
	},

	getShapeSampleValueByModifId: function(sample_name, modif_id) {
		return this.getValueByModifId('shape', 'sample', sample_name, modif_id);
	},

	getShapeGroupValue: function(group, gene_name) {
		return group.getValue(this.module, this.datatable, gene_name, null, this.group_method['shape']);
	},

	getShapeGroupValueByModifId: function(group, modif_id) {
		return group.getValue(this.module, this.datatable, null, modif_id, this.group_method['shape']);
	},

	getColorSampleValue: function(sample_name, gene_name) {
		return this.getValue('color', 'sample', sample_name, gene_name);
	},

	getColorSampleValueByModifId: function(sample_name, modif_id) {
		return this.getValueByModifId('color', 'sample', sample_name, modif_id);
	},

	getColorGroupValue: function(group, gene_name) {
		return group.getValue(this.module, this.datatable, gene_name, null, this.group_method['color']);
	},

	getColorGroupValueByModifId: function(group, modif_id) {
		return group.getValue(this.module, this.datatable, null, modif_id, this.group_method['color']);
	},

	getColorSizeSampleValue: function(sample_name, gene_name) {
		return this.getColorSampleValue(sample_name, gene_name);
	},

	getColorSizeSampleValueByModifId: function(sample_name, modif_id) {
		return this.getColorSampleValueByModifId(sample_name, modif_id);
	},

	getColorSizeGroupValue: function(group, gene_name) {
		return this.getColorGroupValue(group, gene_name);
	},

	getSizeSampleValue: function(sample_name, gene_name) {
		return this.getValue('size', 'sample', sample_name, gene_name);
	},

	getSizeSampleValueByModifId: function(sample_name, modif_id) {
		return this.getValueByModifId('size', 'sample', sample_name, modif_id);
	},

	getSizeGroupValue: function(group, gene_name) {
		return group.getValue(this.module, this.datatable, gene_name, null, this.group_method['size']);
	},

	getSizeGroupValueByModifId: function(group, modif_id) {
		return group.getValue(this.module, this.datatable, null, modif_id, this.group_method['size']);
	},

	getShapeSample: function(sample_name, gene_name) {
		var value = this.getShapeSampleValue(sample_name, gene_name);
		return this._getShape(value, 'sample');
	},

	getShapeSampleByModifId: function(sample_name, modif_id) {
		var value = this.getShapeSampleValueByModifId(sample_name, modif_id);
		return this._getShape(value, 'sample');
	},

	getShapeGroup: function(group, gene_name) {
		var value = this.getShapeGroupValue(group, gene_name);
		return this._getShape(value, 'group');
	},

	getShapeGroupByModifId: function(group, modif_id) {
		var value = this.getShapeGroupValueByModifId(group, modif_id);
		return this._getShape(value, 'group');
	},

	getColorSample: function(sample_name, gene_name) {
		var value = this.getColorSampleValue(sample_name, gene_name);
		return this._getColor(value, 'sample');
	},

	getColorSampleByModifId: function(sample_name, modif_id) {
		var value = this.getColorSampleValueByModifId(sample_name, modif_id);
		return this._getColor(value, 'sample');
	},

	getColorGroup: function(group, gene_name) {
		var value = this.getColorGroupValue(group, gene_name);
		return this._getColor(value, 'group');
	},

	getColorGroupByModifId: function(group, modif_id) {
		var value = this.getColorGroupValueByModifId(group, modif_id);
		return this._getColor(value, 'group');
	},

	getColorSizeSample: function(sample_name, gene_name) {
		return this.getColorSample(sample_name, gene_name);
	},

	getColorSizeSampleByModifId: function(sample_name, modif_id) {
		return this.getColorSampleByModifId(sample_name, modif_id);
	},

	getColorSizeGroup: function(group, gene_name) {
		return this.getColorGroup(group, gene_name);
	},

	getColorSizeGroupByModifId: function(group, modif_id) {
		return this.getColorGroupByModifId(group, modif_id);
	},

	getSizeSample: function(sample_name, gene_name) {
		var value = this.getSizeSampleValue(sample_name, gene_name);
		return this._getSize(value, 'sample');
	},

	getSizeSampleByModifId: function(sample_name, modif_id) {
		var value = this.getSizeSampleValueByModifId(sample_name, modif_id);
		return this._getSize(value, 'sample');
	},

	getSizeGroup: function(group, gene_name) {
		var value = this.getSizeGroupValue(group, gene_name);
		return this._getSize(value, 'group');
	},

	getSizeGroupByModifId: function(group, modif_id) {
		var value = this.getSizeGroupValueByModifId(group, modif_id);
		return this._getSize(value, 'group');
	},

	update: function() {
		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			this.update_config('color', tabname);
			this.update_config('shape', tabname);
			this.update_config('size', tabname);
		}
	},

	update_config: function(config, tabname) {
		var minval = this.getDatatableMinval(config, tabname);
		var maxval = this.getDatatableMaxval(config, tabname);
		var mod = config + '_';
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		var id_suffix = tabname + '_' + mod + id 
		var doc = this.win.document;
		var table = $("#step_config_table_" + id_suffix, doc);
		table.children().remove();
		var html = "<thead>";
		var really_dont_use_gradient = !this.use_gradient[config];
		var beg = 0;
		if (tabname == 'group' && config != 'color' && this.discrete_ordered['sample']) {
			really_dont_use_gradient = true;
			beg = 1;
		}
		if (really_dont_use_gradient) {
			html += "<th></th>";
		}
		html += "<th>&nbsp;Value&nbsp;</th>";
		if (config == 'color') {
			html += "<th>Color</th>";
		}
		if (config == 'size') {
			html += "<th>Size</th>";
		}
		if (config == 'shape') {
			html += "<th>Shape</th>";
		}
		html += "</thead><tbody>";
		if (this.has_empty_values) {
			html += "<tr>";
			if (really_dont_use_gradient) {
				html += "<td></td>";
			}
			html += "<td style='font-size: smaller;'>NA</td>";
			if (config == 'color') {
				html += this.makeColorInput(id, config, tabname, 0);
			}
			if (config == 'size') {
				html += this.makeSelectSize(id, config, tabname, 0);
			}
			if (config == 'shape') {
				html += this.makeSelectShape(id, config, tabname, 0);
			}
			html += "</tr>\n";
		}
		if (false) {
			html += "<tr><td></td>";
			html += "<td>" + minval + " (minimum)</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>";
			html += "</tr>\n";
		}
		var step_cnt = this.getStepCount(config, tabname);
		for (var idx = beg; idx < step_cnt; idx++) {
			if (really_dont_use_gradient) {
				//html += "<tr><td><span class='less-than'>Less&nbsp;than</span></td>";
				html += "<tr><td><span class='less-than'>Less&nbsp;or&nbsp;equal&nbsp;to</span></td>";
			} else {
				html += "<tr>";
			}
			if (!this.use_gradient[config] && idx == step_cnt-1) {
				html += "<td>" + maxval + "</td>";
			} else {
				html += this.makeValueInput(id, config, tabname, idx+this.has_empty_values);
			}
			if (config == 'color') {
				html += this.makeColorInput(id, config, tabname, idx+this.has_empty_values);
			} else if (config == 'size') {
				html += this.makeSelectSize(id, config, tabname, idx+this.has_empty_values);
			} else if (config == 'shape') {
				html += this.makeSelectShape(id, config, tabname, idx+this.has_empty_values);
			}
			html += "</tr>\n";
		}
		html += "</tbody>";
		table.append(html);

		var table_info = $("#step_info_table_" + id_suffix, doc);
		table_info.children().remove();
		var html = "<tbody>";
		var use_absval = this.use_absval[tabname][config];
		var min_label = (use_absval ? "Min&nbsp;Abs&nbsp;Value" : "Min&nbsp;Value");
		var max_label = (use_absval ? "Max&nbsp;Abs&nbsp;Value" : "Max&nbsp;Value");
		var width = (use_absval && tabname != 'group' ? '120px' : '150px');
		html += "<tr><td style='background: #EEEEEE'>&nbsp;</td></tr>";
		html += "<tr>";
		if (!this.discrete_ordered[tabname]) {
			html += "<td id='min_val_label_" + id_suffix + "'><span class='config-label'>" + min_label + "</span></td>";
			html += "<td id='min_val_" + id_suffix + "'>" + minval + "</td>";
			html += "<td width='10px'>&nbsp;</td>";
		}
		if (tabname == 'sample') {
			if (!this.discrete_ordered[tabname]) {
				if (this.datatable.minval < 0) {
					html += "<td width='" + width + "'rowspan='2'><span class='config-label'>&nbsp;&nbsp;Use&nbsp;abs&nbsp;values&nbsp;</span><input id='step_config_absval_" + id_suffix + "' type='checkbox' onchange='DisplayContinuousConfig.setSampleAbsval(\"" + config + "\", \"" + id + "\")'" + (use_absval ? " checked" : "") + "></input></td>"
					html += "</tr><tr>";
				}
				/*
				// multiple hugo
				//
				*/
			} else {
				html += "<td width='" + width + "'>&nbsp;</td>";
			}
		} else {
			html += "<td width='" + width + "' style='text-align: center'><span class='config-label' style='text-align: center'>Group&nbsp;Method</span></td>";
		}
		html += "</tr><tr>";
		if (!this.discrete_ordered[tabname]) {
			html += "<td id='max_val_label_" + id_suffix + "'><span class='config-label'>" + max_label + "</span></td>";
			html += "<td id='max_val_" + id_suffix + "'>" + maxval + "</td>";
		}
		if (tabname == 'group') {
			html += "<td width='10px'>&nbsp;</td>";
			html += "<td width='" + width + "' style='text-align: center'>" + this.makeSelectMultiGeneMethod(config, 'group') + "</td>";
		} else if (!this.discrete_ordered[tabname]) {
			// multiple hugo
			html += "</tr><tr>";
			html += "<tr><td>&nbsp;</td></tr>";
			//html += "<td width='10px'>&nbsp;</td>";
			html += "<td colspan='4' width='" + width + "' style='text-align: center'><span class='config-label' style='text-align: center'>Select&nbsp;value&nbsp;for&nbsp;a<br/>group&nbsp;of&nbsp;genes&nbsp;by</span></td>";
			html += "</tr><tr>";
			//html += "<td></td><td></td><td width='10px'>&nbsp;</td>";
			//html += "<td width='10px'>&nbsp;</td>";
			html += "<td colspan='4' width='" + width + "' style='text-align: center'>" + this.makeSelectMultiGeneMethod(config, 'sample') + "</td>";
			//
		}
		html += "</tr>";
		html += "</tbody>";
		table_info.append(html);

		var count = $("#step_config_count_" + id_suffix, doc);

		var title = $("#step_config_title_" + mod + id, doc);
		var Config = config.charAt(0).toUpperCase() + config.slice(1)
		title.html("<span style='font-style: italic'>" + this.datatable.name + "</span> Datatable<br><span style='font-size: smaller'>" + Config + " Configuration</span>");

		jscolor.init(this.win);
	},

	buildDiv: function(config) {
		var doc = this.win.document;
		var mod = config + '_';
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		var ksuffix = "";
		var div_id = "step_config_" + mod + id + ksuffix;
		var html = "<div align='center' class='step-config' id='" + div_id + "'>\n";
		html += "<h3 id='step_config_title_" + mod + id + "'></h3>";
		html += "<ul>";
		html += "<li><a class='ui-button-text' href='#step_config_sample_" + mod + id + ksuffix + "' onclick='DisplayContinuousConfig.switch_sample_tab(\"" + id + "\", \"" + config + "\")'>Samples</a></li>";
		html += "<li><a class='ui-button-text' href='#step_config_group_" + mod + id + ksuffix + "' onclick='DisplayContinuousConfig.switch_group_tab(\"" + id + "\", \"" + config + "\")'>Groups</a></li>";
		html += "</ul>";

		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			var default_step_cnt = this.default_step_count[tabname][config];
			var id_suffix = tabname + '_' + mod + id + ksuffix
			var div_editing_id = "step_config_editing_" + id_suffix;
			html += "<div id='step_config_" + id_suffix + "'>";
			html += "<div style='text-align: left' id='" + div_editing_id + "' class='step-config-editing'></div>";
			html += "<h4 style='font-size: 80%'>" + DisplayContinuousConfig.tablabels[tabname] + "</h4>";
			html += "<table class='step-config-table' id='step_config_table_" + id_suffix + "'>";
			html += "</table>";
			html += "<table class='step-info-table' id='step_info_table_" + id_suffix + "'>";
			html += "</table>";
			
			if (!this.discrete_ordered[tabname]) {
				html += "<br/><span class='config-small-label'>Step Count</span>\n";
				html += "<select style='font-size: 70%' id='step_config_count_" + id_suffix + "' onchange='DisplayContinuousConfig.stepCountChange(\"" + tabname + "\", \"" + config + "\", \"" + id + "\")'>";
				for (var step = 1; step <= 10; ++step) {
					html += "<option value='" + step + "' " + (step == default_step_cnt ? "selected" : "") + ">" + step + "</option>";
				}
			}
			html += "</select>";
			html += "</div>";
		}

		html += "</div>";
		$('body', doc).append(html);
		var div = $("#" + div_id, doc);
		this.divs[config] = div;
		div.tabs({beforeLoad: function( event, ui ) { event.preventDefault(); return; } }); 

		//DisplayContinuousConfig.switch_sample_tab(id, config, doc);
		var suffix = mod + id;
		this.setActiveTab(0);
		$("#step_config_sample_" + suffix, doc).css("display", "block");
		$("#step_config_group_" + suffix, doc).css("display", "none");
	},

	getDiv: function(config) {
		return this.divs[config];
	},

	getClass: function() {
		return "DisplayContinuousConfig";
	}
};

DisplayContinuousConfig.stepCountChange = function(tabname, config, id, step_cnt, called_from_api) {
	var win = window;
	var obj = $("#step_config_count_" + tabname + '_' + config + '_' + id, win.document);
	if (!called_from_api) {
		//var step_cnt = $(elem_name, win.document).val();
		var step_cnt = obj.val();
		nv_perform("nv_display_continuous_config_perform", win, "step_count_change", tabname, config, id, step_cnt);
		return;
	}
	//var datatable = navicell.dataset.datatables_id[id];
	var datatable = navicell.dataset.getDatatableByCanonName(id);
	if (datatable) {
		var module = get_module();
		//var step_cnt = $("#step_config_count_" + tabname + '_' + config + '_' + id, win.document).val();
		//$(elem_name, win.document).val(step_cnt);
		obj.val(step_cnt);
		var displayContinuousConfig = datatable.getDisplayConfig(module);
		displayContinuousConfig.setStepCount_config(step_cnt, config, tabname);
		DisplayContinuousConfig.setEditing(datatable.getCanonName(), true, config, win);
	}
}

DisplayContinuousConfig.setSampleAbsval = function(config, id, checked, called_from_api) {
	var win = window;
	var obj = $("#step_config_absval_sample_" + config + '_' + id, win.document);
	if (!called_from_api) {
		//var checked = $(elem_name, win.document).attr("checked");
		var checked = obj.attr("checked");
		nv_perform("nv_display_continuous_config_perform", win, "set_sample_absval", config, id, checked);
		return;
	}
	if (checked) {
		obj.attr("checked", "checked");
	} else {
		obj.removeAttr("checked");
	}
	//var checked = $("#step_config_absval_sample_" + config + '_' + id, win.document).attr("checked");
	//var datatable = navicell.dataset.getDatatableById(id);
	var datatable = navicell.dataset.getDatatableByCanonName(id);
	var module = get_module();
	if (datatable) {
		var displayContinuousConfig = datatable.getDisplayConfig(module);
		displayContinuousConfig.setUseAbsValue(config, checked == 'checked');
		if (!NO_CHANGE_STEP_COUNT) {
			var step_cnt = displayContinuousConfig.getStepCount(config, 'sample');
			if (displayContinuousConfig.use_gradient[config]) {
				step_cnt--;
			}
			displayContinuousConfig.setStepCount_config(step_cnt, config, 'sample');
		}
		DisplayContinuousConfig.setEditing(id, true, config, win);
	}
}

DisplayContinuousConfig.setSampleMethod = function(config, id, method, called_from_api) {
	var win = window;
	var obj = $("#sample_method_" + config + '_' + id, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_sample_method", config, id, obj.val());
		return;
	}
	//var datatable = navicell.getDatatableById(id);
	var datatable = navicell.getDatatableByCanonName(id);
	var module = get_module();
	console.log("setSampleMethod: " + datatable + " " + config + " " + id + " " + method + " " + obj.val());
	if (datatable) {
		//var obj = $("#sample_method_" + config + '_' + id, win.document);
		obj.val(method);
		var displayContinuousConfig = datatable.getDisplayConfig(module);
		displayContinuousConfig.setSampleMethod(config, obj.val());
		if (!NO_CHANGE_STEP_COUNT) {
			var step_cnt = displayContinuousConfig.getStepCount(config, 'sample');
			if (displayContinuousConfig.use_gradient[config]) {
				step_cnt--;
			}
			displayContinuousConfig.setStepCount_config(step_cnt, config, 'sample');
		}
		DisplayContinuousConfig.setEditing(id, true, config, win);
	}
}

DisplayContinuousConfig.setGroupMethod = function(config, id, method, called_from_api) {
	var win = window;
	var obj = $("#group_method_" + config + '_' + id, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_group_method", config, id, obj.val());
		return;
	}
	//var datatable = navicell.getDatatableById(id);
	var datatable = navicell.getDatatableByCanonName(id);
	var module = get_module();
	if (datatable) {
		obj.val(method);
		var displayContinuousConfig = datatable.getDisplayConfig(module);
		displayContinuousConfig.setGroupMethod(config, obj.val());
		if (!NO_CHANGE_STEP_COUNT) {
			var step_cnt = displayContinuousConfig.getStepCount(config, 'group');
			if (displayContinuousConfig.use_gradient[config]) {
				step_cnt--;
			}
			displayContinuousConfig.setStepCount_config(step_cnt, config, 'group');
		}
		DisplayContinuousConfig.setEditing(id, true, config, win);
	}
}

DisplayContinuousConfig.setInputValue = function(datatable_id, config, tabname, idx, value, called_from_api) {
	var win = window;
	var obj = $("#step_value_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_input_value", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(value);
	DisplayContinuousConfig.setEditing(datatable_id, true, config, win);
}

DisplayContinuousConfig.setInputColor = function(datatable_id, config, tabname, idx, color, called_from_api) {
	var win = window;
	var obj = $("#step_config_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_input_color", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(color);
	var fg = getFG_from_BG(color);
	obj.css("background-color", "#" + color);
	obj.css("color", "#" + fg);
	DisplayContinuousConfig.setEditing(datatable_id, true, config, win);
}

DisplayContinuousConfig.setSelectSize = function(datatable_id, config, tabname, idx, size, called_from_api) {
	var win = window;
	var obj = $("#step_size_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_select_size", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(size);
	DisplayContinuousConfig.setEditing(datatable_id, true, config, win);
}

DisplayContinuousConfig.setSelectShape = function(datatable_id, config, tabname, idx, shape, called_from_api) {
	var win = window;
	var obj = $("#step_shape_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_select_shape", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(shape);
	DisplayContinuousConfig.setEditing(datatable_id, true, config, win);
}

DisplayContinuousConfig.setEditing = function(datatable_id, val, config, win) {
	if (!win) {
		win = window;
	}
	/*
	  // non sense
	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", win, "set_editing", datatable_id, val, config);
		return;
	}
	*/
	//var datatable = navicell.getDatatableById(datatable_id);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	var module = get_module(win);
	var div = datatable.getDisplayConfig(module).getDiv(config);

	if (div) {
		var active = div.tabs("option", "active");
		var tabname = DisplayContinuousConfig.tabnames[active];
		if (tabname) {
			$("#step_config_editing_" + tabname + '_' + config + '_' + datatable_id, win.document).html(val ? EDITING_CONFIGURATION : "");
		}
	}
}

DisplayUnorderedDiscreteConfig.setAdvancedConfiguration = function(datatable_id, config, checked, called_from_api) {
	var tabname = 'group';
	var id_suffix = tabname + '_' + config + "_" + datatable_id;
	var obj = $("#discrete_color_advanced_" + id_suffix);
	if (!called_from_api) {
		checked = obj.attr("checked");
		nv_perform("nv_display_unordered_discrete_config_perform", window, "set_advanced_configuration", datatable_id, config, checked);
		return;
	}
	//var datatable = navicell.dataset.datatables_id[id];
	var datatable = navicell.dataset.getDatatableByCanonName(datatable_id);
	var module = get_module();
	var displayUnorderedConfig = datatable.getDisplayConfig(module);
	//var checked = $("#discrete_color_advanced_" + id_suffix).attr("checked");
	console.log("setSampleMethod: " + datatable + " " + config + " " + datatable_id + " " + checked);
	if (checked) {
		obj.attr("checked", "checked");
	} else {
		obj.removeAttr("checked");
	}
	//displayUnorderedConfig.advanced = (checked == "checked");
	displayUnorderedConfig.advanced = checked;
	displayUnorderedConfig.update_config(config, tabname, {checked: checked});
}

DisplayUnorderedDiscreteConfig.setColors = function(datatable_id, config, same_color, called_from_api) {
	// TBD: must use nv_perform and use called_from_api
	//var datatable = navicell.dataset.datatables_id[id];
	var datatable = navicell.dataset.getDatatableByCanonName(datatable_id);
	var module = get_module();
	var displayUnorderedConfig = datatable.getDisplayConfig(module);
	var tabname = 'sample';
	var id_suffix = tabname + '_' + config + "_" + datatable_id;
	DisplayUnorderedDiscreteConfig.setEditing(datatable.getCanonName(), true, config);
	var checked = $("#discrete_color_same_" + id_suffix).attr("checked");
	var color = $("#discrete_color_same_color_" + id_suffix).val();
	var beg_gradient = $("#discrete_color_beg_gradient_" + id_suffix).val();
	var end_gradient = $("#discrete_color_end_gradient_" + id_suffix).val();
	if (checked == "checked") {
		displayUnorderedConfig.useColors(config, "same_color", color);
		displayUnorderedConfig.update_colors(config, tabname, {checked: "same_color", color: color, beg_gradient: beg_gradient, end_gradient: end_gradient});
	}
	if (same_color) {
		return;
	}
	checked = $("#discrete_color_palette_" + id_suffix).attr("checked");
	if (checked == "checked") {
		displayUnorderedConfig.useColors(config, "palette");
		displayUnorderedConfig.update_colors(config, tabname, {checked: "palette", color: color, beg_gradient: beg_gradient, end_gradient: end_gradient});
	} else {
		checked = $("#discrete_color_gradient_" + id_suffix).attr("checked");
		if (checked == "checked") {
			displayUnorderedConfig.useColors(config, "gradient", beg_gradient, end_gradient);
			displayUnorderedConfig.update_colors(config, tabname, {checked: "gradient", color: color, beg_gradient: beg_gradient, end_gradient: end_gradient});
		}
	}
}

DisplayUnorderedDiscreteConfig.setDiscreteCond = function(datatable_id, config, tabname, idx, cond, called_from_api) {
	var win = window;
	var obj = $("#discrete_cond_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", win, "set_discrete_cond", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(cond);
	DisplayUnorderedDiscreteConfig.setEditing(datatable_id, true, config);
}

DisplayUnorderedDiscreteConfig.setDiscreteValue = function(datatable_id, config, tabname, idx, value, called_from_api) {
	var win = window;
	var obj = $("#discrete_value_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", win, "set_discrete_value", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(value);
	DisplayUnorderedDiscreteConfig.setEditing(datatable_id, true, config);
}

DisplayUnorderedDiscreteConfig.setDiscreteColor = function(datatable_id, config, tabname, idx, color, called_from_api) {
	var win = window;
	var obj = $("#discrete_color_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", win, "set_discrete_color", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(color);
	var fg = getFG_from_BG(color);
	obj.css("background-color", "#" + color);
	obj.css("color", "#" + fg);
	DisplayUnorderedDiscreteConfig.setEditing(datatable_id, true, config);
}

DisplayUnorderedDiscreteConfig.setDiscreteSize = function(datatable_id, config, tabname, idx, size, called_from_api) {
	var win = window;
	var obj = $("#discrete_size_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", win, "set_discrete_size", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(size);
	DisplayUnorderedDiscreteConfig.setEditing(datatable_id, true, config);
}

DisplayUnorderedDiscreteConfig.setDiscreteShape = function(datatable_id, config, tabname, idx, shape, called_from_api) {
	var win = window;
	var obj = $("#discrete_shape_" + tabname + '_' + config + '_' + datatable_id + "_" + idx, win.document);
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", win, "set_discrete_shape", datatable_id, config, tabname, idx, obj.val());
		return;
	}

	obj.val(shape);
	DisplayUnorderedDiscreteConfig.setEditing(datatable_id, true, config);
}

DisplayUnorderedDiscreteConfig.setEditing = function(datatable_id, val, config, win) {
	//var datatable = navicell.getDatatableById(datatable_id);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	if (!win) {
		win = window;
	}
	var module = get_module(win);
	var div = datatable.getDisplayConfig(module).getDiv(config);

	if (div) {
		var active = div.tabs("option", "active");
		var tabname = DisplayContinuousConfig.tabnames[active];
		if (tabname) {
			$("#discrete_config_editing_" + tabname + '_' + config + '_' + datatable_id, win.document).html(val ? EDITING_CONFIGURATION : "");
		}
	}
}

DisplayContinuousConfig.switch_sample_tab = function(datatable_id, config, doc, called_from_api) {
	var win = window;

	if (!doc) {
		doc = win.document;
	}

	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", doc.win, "switch_sample_tab", datatable_id, config);
		return;
	}

	var module = get_module(win);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	var displayConfig = datatable.getDisplayConfig(module);
	
	displayConfig.setActiveTab(0);

	var suffix = config + '_' + datatable_id;
	$("#step_config_sample_" + suffix, doc).css("display", "block");
	$("#step_config_group_" + suffix, doc).css("display", "none");
}

DisplayContinuousConfig.switch_group_tab = function(datatable_id, config, doc, called_from_api) {
	var win = window;

	if (!doc) {
		doc = window.document;
	}

	if (!called_from_api) {
		nv_perform("nv_display_continuous_config_perform", doc.win, "switch_group_tab", datatable_id, config);
		return;
	}

	var module = get_module(win);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	var displayConfig = datatable.getDisplayConfig(module);

	displayConfig.setActiveTab(1);

	var suffix = config + '_' + datatable_id;
	$("#step_config_sample_" + suffix, doc).css("display", "none");
	$("#step_config_group_" + suffix, doc).css("display", "block");
}

DisplayContinuousConfig.tabnames = ['sample', 'group'];
DisplayContinuousConfig.tablabels = {'sample' : 'Sample Configuration', 'group' :'Group Configuration'};

function DisplayUnorderedDiscreteConfig(datatable, win) {
	this.datatable = datatable;
	this.win = win;
	this.module = get_module(win);
	this.advanced = false;
	this.has_empty_values = datatable.hasEmptyValues();
	this.values = [];
	this.values_idx = {};
	this.biotype_is_set = datatable.biotype.isSet();
	var discrete_values = datatable.getDiscreteValues();
	for (var value in discrete_values) {
		this.values.push(discrete_values[value]);
	}
	this.values.sort();
	for (var idx = 0; idx < this.values.length; ++idx) {
		var value = this.values[idx];
		this.values_idx[value] = idx;
	}
	this.buildDivs();
	this.buildValues();
	this.update();
}

DisplayUnorderedDiscreteConfig.prototype = {
	
	getActiveTab: function() {
		return this.active;
	},

	setActiveTab: function(active) {
		this.active = active;
	},

	buildDivs: function() {
		this.divs = {};
		this.buildDiv('color');
		this.buildDiv(COLOR_SIZE_CONFIG);
		this.buildDiv('shape');
		this.buildDiv('size');
	},

	buildDiv: function(config) {
		var mod = config + '_';
		var doc = this.win.document;
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		var div_id = "discrete_config_" + mod + id;
		var html = "<div align='center' class='discrete-config' id='" + div_id + "'>\n";

		html += "<h3 id='discrete_config_title_" + mod + id + "'></h3>";
		html += "<ul>";
		html += "<li><a class='ui-button-text' href='#discrete_config_sample_" + mod + id + "' onclick='DisplayUnorderedDiscreteConfig.switch_sample_tab(\"" + id + "\", \"" + config + "\")'>Samples</a></li>";
		if (!this.biotype_is_set) {
			html += "<li><a class='ui-button-text' href='#discrete_config_group_" + mod + id + "' onclick='DisplayUnorderedDiscreteConfig.switch_group_tab(\"" + id + "\", \"" + config + "\")'>Groups</a></li>";
		}
		html += "</ul>";

		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			if (this.biotype_is_set && tabname == 'group') {
				continue;
			}
			var id_suffix = tabname + '_' + mod + id 
			var div_editing_id = "discrete_config_editing_" + id_suffix;

			html += "<div id='discrete_config_" + id_suffix + "'>";
			html += "<div style='text-align: left' id='" + div_editing_id + "' class='discrete-config-editing'></div>";
			html += "<h4 style='font-size: 80%'>" + DisplayContinuousConfig.tablabels[tabname] + "</h4>";
			html += "<table class='discrete-config-table' id='discrete_config_table_" + id_suffix + "'>";
			html += "</table>";
			html += "<table class='discrete-info-table' id='discrete_info_table_" + id_suffix + "'>";
			html += "</table>";
			html += "</div>";
		}
		html += "</div>";
		$('body', doc).append(html);
		var div = $("#" + div_id, doc);
		this.divs[config] = div;
		div.tabs({beforeLoad: function( event, ui ) { event.preventDefault(); return; } }); 
		//DisplayUnorderedDiscreteConfig.switch_sample_tab(mod + id, doc);
		var suffix = mod + id;
		this.setActiveTab(0);
		$("#discrete_config_sample_" + suffix, doc).css("display", "block");
		$("#discrete_config_group_" + suffix, doc).css("display", "none");
	},

	getDatatableValue: function(config, value) {
		return value;
	},

	getDiv: function(config) {
		return this.divs[config];
	},

	buildValues: function() {
		var size = this.values.length;
		this.colors = {};
		this.sizes = {};
		this.shapes = {};
		this.conds = {};
		var configs = ['color', COLOR_SIZE_CONFIG, 'shape', 'size'];
		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			if (this.biotype_is_set && tabname == 'group') {
				continue;
			}
			this.colors[tabname] = {};
			this.sizes[tabname] = {};
			this.shapes[tabname] = {};
			this.conds[tabname] = {};
			var incr = tabname == 'group' ? 1 : 0;
			for (var idx in configs) {
				var config = configs[idx];
				this.colors[tabname][config] = new Array(size+incr);
				this.sizes[tabname][config] = new Array(size+incr);
				this.shapes[tabname][config] = new Array(size+incr);
				this.conds[tabname][config] = new Array(size+incr);
				this.setDefaults(config, tabname);
			}
		}
		this.update();
	},

	getValueAt: function(idx) {
		return this.values[idx];
	},

	getValueCount: function() {
		return this.values.length;
	},

	setValueInfo: function(config, tabname, idx, color, size, shape, cond) {
		if (idx < this.colors[tabname][config].length) {
			this.colors[tabname][config][idx] = color;
			//console.log("setValueInfo shape etc. " + idx + " -> " + shape + " " + color + " " + size + " " + config + " " + tabname);
			this.sizes[tabname][config][idx] = size;
			this.shapes[tabname][config][idx] = shape;
			this.conds[tabname][config][idx] = cond;
		}
	},

	setDefaults: function(config, tabname) {
		var step_cnt = this.getValueCount();
		var colors;
		var step_cnt_1, beg;
		if (tabname == 'sample' && this.has_empty_values) {
			this.setValueInfo(config, tabname, 0,  EMPTY_VALUE_DEFAULT_COLOR, 4, 0, Group.DISCRETE_IGNORE);
			step_cnt_1 = step_cnt-1;
			beg = 1;
		} else {
			step_cnt_1 = step_cnt;
			beg = 0;
		}
		if (this.biotype_is_set) {
			colors = color_gradient(new RGBColor(0, 0, 120), new RGBColor(0, 0, 120), step_cnt_1);
		} else {
			colors = color_palette(step_cnt_1);
		}
		for (var ii = beg; ii < step_cnt; ++ii) {
			this.setValueInfo(config, tabname, ii, colors[ii-beg].getRGBValue(), ii*2+4, ii, false && ii == 0 ? Group.DISCRETE_IGNORE : Group.DISCRETE_GT_0);
		}
		if (tabname == 'group') {
			this.setValueInfo(config, tabname, step_cnt, "FFFFFF", 0, 0, Group.DISCRETE_IGNORE);
		}
	},

	useColors: function(config, mode, use_color1, use_color2) {
		var step_cnt = this.getValueCount();
		var step_cnt_1, beg;
		if (this.has_empty_values) {
			step_cnt_1 = step_cnt-1;
			beg = 1;
		} else {
			step_cnt_1 = step_cnt;
			beg = 0;
		}
		var colors = undefined;
		if (mode == 'palette') {
			colors = color_palette(step_cnt_1);
		} else if (mode == 'gradient') {
			colors = color_gradient(RGBColor.fromHex(use_color1), RGBColor.fromHex(use_color2), step_cnt_1);
		}

		if (colors) {
			for (var ii = beg; ii < step_cnt; ++ii) {
				this.colors['sample'][config][ii] = colors[ii-beg].getRGBValue();
			}
		} else if (mode == 'same_color') {
			for (var ii = beg; ii < step_cnt; ++ii) {
				this.colors['sample'][config][ii] = use_color1;
			}
		}
	},

	getColorAt: function(idx, config, tabname) {
		return this.colors[tabname][config][idx];
	},

	getSizeAt: function(idx, config, tabname) {
		/*
		console.log("getSizeAt " + idx + " " + config + " " + tabname + " -> " + this.sizes[tabname][config][idx]);
		if (!this.sizes[tabname][config][idx]) {
			console.log("undefined size for " + idx + " " + config + " " + tabname);
		}
		*/
		return this.sizes[tabname][config][idx];
	},

	getShapeAt: function(idx, config, tabname) {
		return this.shapes[tabname][config][idx];
	},

	update: function() {
		for (var tab in DisplayContinuousConfig.tabnames) {
			var tabname = DisplayContinuousConfig.tabnames[tab];
			if (this.biotype_is_set && tabname == 'group') {
				continue;
			}
			this.update_config('color', tabname);
			this.update_config(COLOR_SIZE_CONFIG, tabname);
			this.update_config('shape', tabname);
			this.update_config('size', tabname);
		}
	},

	getValue: function(sample_name, gene_name) {
		return this.datatable.getValue(sample_name, gene_name);
	},

	getValueByModifId: function(sample_name, modif_id) {
		//return this.datatable.getValueByModifId(this.module, sample_name, modif_id, Group.CONTINUOUS_ABS_MAXVAL);
		var info = navicell.dataset.getGeneInfoByModifId(this.module, modif_id);
		//console.log("getValueByModifId: " + this.module + " " + modif_id);
		if (info) { // TBD WRONG: should use something else (getAcceptedConditionByModifId???)
			var genes = info[0];
			/*if (this.getValue(sample_name, genes[0].name))*/ {
				//console.log("getValueByModifId -> [" + sample_name + "], [" + genes[0].name + "], [" + this.getValue(sample_name, genes[0].name) + "]");
			}
			return this.getValue(sample_name, genes[0].name);
		}
		//console.log("getValueByModifId: undefined");
		return undefined;
	},

	getValueIndex: function(sample_name, gene_name) {
		var value = this.getValue(sample_name, gene_name);
		return this.values_idx[value];
	},

	// WARNING: DisplayUnorderedDiscreteConfig.*ByModifId is only partly implemented, missing getValueByModifId
	getValueIndexByModifId: function(sample_name, modif_id) {
		var value = this.getValueByModifId(sample_name, modif_id);
		return this.values_idx[value];
	},

	getColorSampleValue: function(sample_name, gene_name) {
		return this.getValue(sample_name, gene_name);
	},

	getColorSampleValueByModifId: function(sample_name, modif_id) {
		return this.getValueByModifId(sample_name, modif_id);
	},

	getColorSizeSampleValue: function(sample_name, gene_name) {
		return this.getValue(sample_name, gene_name);
	},

	getColorSizeSampleValueByModifId: function(sample_name, modif_id) {
		return this.getValueByModifId(sample_name, modif_id);
	},

	getColorSample: function(sample_name, gene_name) {
		return this.getColorAt(this.getValueIndex(sample_name, gene_name), 'color', 'sample');
	},

	getColorSizeSample: function(sample_name, gene_name) {
		return this.getColorAt(this.getValueIndex(sample_name, gene_name), COLOR_SIZE_CONFIG, 'sample');
	},

	getShapeSample: function(sample_name, gene_name) {
		return this.getShapeAt(this.getValueIndex(sample_name, gene_name), 'shape', 'sample');
	},

	getSizeSample: function(sample_name, gene_name) {
		return this.getSizeAt(this.getValueIndex(sample_name, gene_name), 'size', 'sample');
	},

	getColorSampleByModifId: function(sample_name, modif_id) {
		//console.log("getColorSampleByModifId: " + this.getValueIndexByModifId(sample_name, modif_id));
		return this.getColorAt(this.getValueIndexByModifId(sample_name, modif_id), 'color', 'sample');
	},

	getColorSizeSampleByModifId: function(sample_name, modif_id) {
		return this.getColorAt(this.getValueIndexByModifId(sample_name, modif_id), COLOR_SIZE_CONFIG, 'sample');
	},

	getShapeSampleByModifId: function(sample_name, modif_id) {
		return this.getShapeAt(this.getValueIndexByModifId(sample_name, modif_id), 'shape', 'sample');
	},

	getSizeSampleByModifId: function(sample_name, modif_id) {
		return this.getSizeAt(this.getValueIndexByModifId(sample_name, modif_id), 'size', 'sample');
	},

	getHeatmapStyleSample: function(sample_name, gene_name) {
		var color = this.getColorSample(sample_name, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getBarplotStyleSample: function(sample_name, gene_name) {
		var color = this.getColorSizeSample(sample_name, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getBarplotSampleHeight: function(sample_name, gene_name, max) {
		var idx = this.getValueIndex(sample_name, gene_name);
		var size = this.getSizeAt(idx, COLOR_SIZE_CONFIG, 'sample') * 1.;
		var maxsize = STEP_MAX_SIZE/2;
		return max * (size/maxsize);
	},

	getHeatmapStyleSampleByModifId: function(sample_name, modif_id) {
		var color = this.getColorSampleByModifId(sample_name, modif_id);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	getBarplotStyleSampleByModifId: function(sample_name, modif_id) {
		var color = this.getColorSizeSampleByModifId(sample_name, modif_id);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return " style='text-align: center'";
	},

	// WARNING: DisplayUnorderedDiscreteConfig.*ByModifId is only partly implemented, missing some methods...
	getBarplotSampleHeightByModifId: function(sample_name, modif_id, max) {
		var idx = this.getValueIndexByModifId(sample_name, modif_id);
		var size = this.getSizeAt(idx, COLOR_SIZE_CONFIG, 'sample') * 1.;
		var maxsize = STEP_MAX_SIZE/2;
		return max * (size/maxsize);
	},

	_getAcceptedCondition_perform: function(group, gene_name, modif_id, config, raw) {
		var conds = this.conds['group'][config];
		//var id_suffix = 'group_' + config + '_' + this.datatable.getId();
		var id_suffix = 'group_' + config + '_' + this.datatable.getCanonName();
		var doc = this.win.document;
		for (var idx in conds) {
			if (conds[idx]) {
				var idx2 = $("#discrete_value_" + id_suffix + "_" + idx, doc).val();
				if (idx2 != undefined) {
					//console.log("idx2: " + idx2 + " " + conds[idx] + " " + this.values[idx2] + ", raw=" + raw);
					if (idx2 == -1) {
						for (var idx3 = 0; idx3 < this.values.length; ++idx3) {
							if (this.values[idx3]) {
								if (group.acceptCondition(this.module, this.datatable, gene_name, modif_id, this.values[idx3], conds[idx])) {
									return raw ? -(idx+1) : idx;
								}
							}
						}
					} else {
						if (group.acceptCondition(this.module, this.datatable, gene_name, modif_id, this.values[idx2], conds[idx])) {
							return idx;
						}
					}
				}
			}
		}
		return conds.length-1;
	},

	getAcceptedCondition: function(group, gene_name, config, raw) {
		return this._getAcceptedCondition_perform(group, gene_name, null, config, raw);
	},

	getAcceptedConditionByModifId: function(group, modif_id, config, raw) {
		return this._getAcceptedCondition_perform(group, null, modif_id, config, raw);
	},

	condString: function(idx, config) {
		var all = idx < 0 ? true : false;
		var label;
		if (idx < 0) {
			idx = -(idx-1);
			label = "#Any Value (but not NA)";
		} else {
			var doc = this.win.document;
			//var id_suffix = 'group_' + config + '_' + this.datatable.getId();
			var id_suffix = 'group_' + config + '_' + this.datatable.getCanonName();
			var idx2 = $("#discrete_value_" + id_suffix + "_" + idx, doc).val();
			var value = this.values[idx2];
			if (!value) {
				value = "NA";
			}
			label = "#" + value;
		}
		var conds = this.conds['group'][config];
		var cond = conds[idx];
		if (cond == Group.DISCRETE_IGNORE) {
			return 'ignore ' + label;
		}
		if (cond == Group.DISCRETE_EQ_0) {
			return label + ' = 0';
		}
		if (cond == Group.DISCRETE_GT_0) {
			return label + ' > 0';
		}
		if (cond == Group.DISCRETE_EQ_ALL) {
			return label + ' = all';
		}
		return '';
	},
	
	getColorGroupValue: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, 'color', true);
		if (idx == this.values.length) {
			return "no matching condition";
		}
		return this.condString(idx, 'color');
	},

	getColorGroupValueByModifId: function(group, modif_id) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, 'color', true);
		if (idx == this.values.length) {
			return "no matching condition";
		}
		return this.condString(idx, 'color');
	},

	getColorSizeGroupValue: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, COLOR_SIZE_CONFIG, true);
		if (idx == this.values.length) {
			return "no matching condition";
		}
		return this.condString(idx, COLOR_SIZE_CONFIG);
	},

	getColorSizeGroupValueByModifId: function(group, modif_id) {
		var idx = this.getAcceptedCondition(group, modif_id, COLOR_SIZE_CONFIG, true);
		if (idx == this.values.length) {
			return "no matching condition";
		}
		return this.condString(idx, COLOR_SIZE_CONFIG);
	},

	getColorGroup: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, 'color');
		return this.getColorAt(idx, 'color', 'group');
	},

	getColorGroupByModifId: function(group, modif_id) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, 'color');
		return this.getColorAt(idx, 'color', 'group');
	},

	getColorSizeGroup: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, COLOR_SIZE_CONFIG);
		return this.getColorAt(idx, COLOR_SIZE_CONFIG, 'group');
	},

	getColorSizeGroupByModifId: function(group, modif_id) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, COLOR_SIZE_CONFIG);
		return this.getColorAt(idx, COLOR_SIZE_CONFIG, 'group');
	},

	getShapeGroup: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, 'shape');
		return this.getShapeAt(idx, 'shape', 'group');
	},

	getShapeGroupByModifId: function(group, modif_id) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, 'shape');
		return this.getShapeAt(idx, 'shape', 'group');
	},

	getSizeGroup: function(group, gene_name) {
		var idx = this.getAcceptedCondition(group, gene_name, 'size');
		return this.getSizeAt(idx, 'size', 'group');
	},

	getSizeGroupByModifId: function(group, modif_id) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, 'size');
		return this.getSizeAt(idx, 'size', 'group');
	},

	getHeatmapStyleGroup: function(group, gene_name) {
		var color = this.getColorGroup(group, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return '';
	},

	getHeatmapStyleGroupByModifId: function(group, modif_id) {
		var color = this.getColorGroupByModifId(group, modif_id);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return '';
	},

	getBarplotStyleGroup: function(group, gene_name) {
		var color = this.getColorSizeGroup(group, gene_name);
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return '';
	},

	getBarplotStyleGroupByModifId: function(group, modif_id) {
		var color = this.getColorSizeGroupByModifId(group, modif_id); // EV 2014-12-11
		if (color) {
			var fg = getFG_from_BG(color);
			return " style='background: #" + color + "; color: #" + fg + "; text-align: center;'";
		}
		return '';
	},

	getBarplotGroupHeight: function(group, gene_name, max) {
		var idx = this.getAcceptedCondition(group, gene_name, COLOR_SIZE_CONFIG);
		var size = this.getSizeAt(idx, COLOR_SIZE_CONFIG, 'group');
		var maxsize = STEP_MAX_SIZE/2;
		return max * (size/maxsize);
	},

	getBarplotGroupHeightByModifId: function(group, modif_id, max) {
		var idx = this.getAcceptedConditionByModifId(group, modif_id, COLOR_SIZE_CONFIG);
		var size = this.getSizeAt(idx, COLOR_SIZE_CONFIG, 'group');
		var maxsize = STEP_MAX_SIZE/2;
		return max * (size/maxsize);
	},

	getConditionAt: function(idx, config) {
		return this.conds['group'][config][idx];
	},

	update_colors: function(config, tabname, params) {
		var mod = config + '_';
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		var id_suffix = tabname + '_' + mod + id 
		var doc = this.win.document;
		var is_sample = tabname == 'sample';
		var step_cnt = this.values.length;
		var step_cnt_1 = step_cnt + !is_sample;
		for (var idx = 0; idx < step_cnt_1; idx++) {
			var color = this.getColorAt(idx, config, tabname);
			var jscolor = $("#discrete_color_" + id_suffix + "_" + idx, doc);
			jscolor.val(color);
			var fg = getFG_from_BG(color);
			jscolor.css("background-color", "#" + color);
			jscolor.css("color", "#" + fg);
		}
	},

	update_config: function(config, tabname, params) {
		var mod = config + '_';
		//var id = this.datatable.getId();
		var id = this.datatable.getCanonName();
		var id_suffix = tabname + '_' + mod + id 
		var doc = this.win.document;
		var table = $("#discrete_config_table_" + id_suffix, doc);
		var is_sample = tabname == 'sample';
		table.children().remove();
		var html = "<thead>";
		var prefix;
		if (is_sample) {
			html += "<th>Value</th>";
			prefix = '';
		} else {
			html += "<th colspan='2'>Condition</th>";
			prefix = '#';
		}
		if (config == 'color' || config == COLOR_SIZE_CONFIG) {
			html += "<th>Color</th>";
		}
		if (config == 'size' || config == COLOR_SIZE_CONFIG) {
			html += "<th>Size</th>";
		}
		if (config == 'shape') {
			html += "<th>Shape</th>";
		}
		html += "</thead><tbody>";
		var step_cnt = this.values.length;
		var step_cnt_1;
		var step_last;
		var beg;
		if (is_sample) {
			step_cnt_1 = step_cnt;
			step_last = step_cnt;
			beg = 0;
		} else {
			if (this.advanced) {
				step_cnt_1 = step_cnt+1;
				beg = 0;
			} else {
				if (false && this.has_empty_values) {
					step_cnt_1 = 3;
					beg = 1;
				} else {
					step_cnt_1 = 2;
					beg = 0;
				}
			}
			step_last = step_cnt_1-1;
		}
		for (var idx = beg; idx < step_cnt_1; idx++) {
			html += "<tr>";
			if (idx == step_last) {
				html += "<td style='text-align: center; font-style: italic' colspan='2'>no matching condition</td>";
			} else {
				var value = this.getValueAt(idx-beg, config, tabname);
				if (!is_sample) {
					var selcond = this.getConditionAt(idx, config);
//					html += "<td><select id='discrete_cond_" + id_suffix + "_" + idx + "' style='font-size: smaller' onchange='DisplayUnorderedDiscreteConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'>";
					html += "<td><select id='discrete_cond_" + id_suffix + "_" + idx + "' style='font-size: smaller' onchange='DisplayUnorderedDiscreteConfig.setDiscreteCond(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ", \"" + selcond + "\")'>";
					if (false && this.advanced) {
						html += "<option value='" + Group.DISCRETE_IGNORE + "' " + (selcond == Group.DISCRETE_IGNORE ? "selected" : "") + "><span style='font-style: italic; font-size: 60%'>ignore</span></option>";
					}
					html += "<option value='" + Group.DISCRETE_EQ_0 + "' " + (selcond == Group.DISCRETE_EQ_0 ? "selected" : "") + ">No group element equals</option>";
					html += "<option value='" + Group.DISCRETE_GT_0 + "' " + (selcond == Group.DISCRETE_GT_0 ? "selected" : "") + ">At least one element equals</option>";
					html += "<option value='" + Group.DISCRETE_EQ_ALL + "' " + (selcond == Group.DISCRETE_EQ_ALL ? "selected" : "") + ">All group elements equals</option>";
					html += "</select></td>";

					//html += "<td><select id='discrete_value_" + id_suffix + "_" + idx + "' style='font-size: smaller' onchange='DisplayUnorderedDiscreteConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'>";
					html += "<td><select id='discrete_value_" + id_suffix + "_" + idx + "' style='font-size: smaller' onchange='DisplayUnorderedDiscreteConfig.setDiscreteValue(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'>";
					var beg2;
					if (tabname == 'sample' && this.has_empty_values) {
						var value2 = this.getValueAt(0, config, tabname);
						html += "<option value='0' " + (value2 == value ? "selected" : "") + "><span style='font-style: italic; font-size: 60%'>" + (value2 ? value2 : "NA") + "</span></option>";
						beg2 = 1;
					} else {
						beg2 = 0;
					}
					var not_na_selected = (idx == beg && this.advanced ? "selected" : "");
					html += "<option value='-1' selected><span style='font-style: italic; font-size: 60%' " + not_na_selected + ">Any Value (but not NA)</span></option>";
					for (var idx2 = beg2; idx2 < step_cnt; idx2++) {
						var value2 = this.getValueAt(idx2, config, tabname);
						html += "<option value='" + idx2 + "' " + (this.advanced && !not_na_selected && value2 == value ? "selected" : "") + "><span style='font-style: italic; font-size: 60%'>" + (value2 ? value2 : "NA") + "</span></option>";
					}
					html += "</select></td>";
				} else {
					if (value == undefined || value.toString() == '') {
						html += "<td><span style='text-align: center'>" + prefix + "NA</span></td>";
					} else {
						html += "<td>" + prefix + value + "</td>";
					}
				}
			}
			if (config == 'color' || config == COLOR_SIZE_CONFIG) {
				var color = (idx == step_last ?  this.getColorAt(step_cnt, config, tabname) : this.getColorAt(idx, config, tabname));
				//html += "<td><input id='discrete_color_" + id_suffix + "_" + idx + "' value='" + color + "' class='color' onchange='DisplayUnorderedDiscreteConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'></input></td>";
				html += "<td><input id='discrete_color_" + id_suffix + "_" + idx + "' value='" + color + "' class='color' onchange='DisplayUnorderedDiscreteConfig.setDiscreteColor(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'>";
			}
			if (config == 'size' || config == COLOR_SIZE_CONFIG) {
				//html += "<td><select id='discrete_size_" + id_suffix + "_" + idx + "' onchange='DisplayUnorderedDiscreteConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'>";
				html += "<td><select id='discrete_size_" + id_suffix + "_" + idx + "' onchange='DisplayUnorderedDiscreteConfig.setDiscreteSize(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'>";
				var selsize = this.getSizeAt(idx, config, tabname);
				if (idx == step_cnt) {
					selsize = 4;
				}
				var maxsize = this.getValueCount()*DISCRETE_SIZE_COEF+2;
				for (var size = -2; size < maxsize; size += 1) {
					var size2 = DISCRETE_SIZE_COEF*(size+2);
					html += "<option value='" + size2 + "' " + (size2 == selsize ? "selected" : "") + ">" + size2 + "</option>";
				}
				html += "</select></td>";
			}
			if (config == 'shape') {
				//html += "<td><select id='discrete_shape_" + id_suffix + "_" + idx + "' onchange='DisplayUnorderedDiscreteConfig.setEditing(\"" + id + "\", true, \"" + config + "\")'>";
				html += "<td><select id='discrete_shape_" + id_suffix + "_" + idx + "' onchange='DisplayUnorderedDiscreteConfig.setDiscreteShape(\"" + id + "\", \"" + config + "\", \"" + tabname + "\", " + idx + ")'>";
				var selshape = this.getShapeAt(idx, config, tabname);
				if (selshape > navicell.shapes.length) {
					selshape = navicell.shapes.length-1;
				}
				for (var shape_idx in navicell.shapes) {
					var shape = navicell.shapes[shape_idx];
					html += "<option value='" + shape_idx + "' " + (shape_idx == selshape ? "selected" : "") + ">" + shape + "</option>";
				}
				html += "</select></td>";
			}
			html += "</tr>\n";
		}

		if ((config == 'color' || config == COLOR_SIZE_CONFIG) && is_sample && !this.datatable.biotype.isSet()) {
			var onchange = " onchange='DisplayUnorderedDiscreteConfig.setColors(\"" + id + "\", \"" + config + "\")'";
			var onchange2 = " onchange='DisplayUnorderedDiscreteConfig.setColors(\"" + id + "\", \"" + config + "\", true)'";
			html += "<tr><td colspan='2' style='background: #EEEEEE;'><table>";
			html += "<tr><td class='config-label'>&nbsp;</td></tr>";
			var checked = "";
			if (params) {
				if (params.checked == "palette") {
					checked = " checked";
				} else {
					checked = "";
				}
			} else {
				checked = " checked";
			}
			html += "<tr><td colspan='1' class='config-label'><input name='discrete_color_choice_\"" + id_suffix + "' type='radio'" + checked + " id='discrete_color_palette_" + id_suffix + "'" + onchange + ">&nbsp;Use color palette</td></tr>";
			if (params && params.checked == "gradient") {
				checked = " checked";
			} else {
				checked = "";
			}
			var HAS_GRADIENT = false;
			if (HAS_GRADIENT) {
				var beg_gradient;
				var end_gradient;
				if (params) {
					beg_gradient = params.beg_gradient;
					end_gradient = params.end_gradient;
				} else {
					beg_gradient = "00FF00";
					end_gradient = "FF0000";
				}
				html += "<tr rowspan='1'><td colspan='1' class='config-label'><div style='vertical-align: center;'><span style='vertical-align: center;'><input name='discrete_color_choice_\"" + id_suffix + "' type='radio'" + checked + " id='discrete_color_gradient_" + id_suffix + "'" + onchange + ">&nbsp;Use color gradient</span></div></td>";
				html += "<td style='background: #EEEEEE'><table>";
				html += "<tr><td><input id='discrete_color_beg_gradient_" + id_suffix + "' value='" + beg_gradient + "' class='color'" + onchange + "></td></tr>";
				html += "<tr><td><input id='discrete_color_end_gradient_" + id_suffix + "' value='" + end_gradient + "' class='color'" + onchange + "></td></tr>";
				html += "</table></td></tr>";
			}
			var color = "";
			if (params && params.checked == "same_color") {
				checked = " checked";
			} else {
				checked = "";
			}
			if (params) {
				color = params.color;
			}
			if (!color) {
				color = "0000AA";
			}
			html += "<tr><td colspan='1' class='config-label'><input name='discrete_color_choice_\"" + id_suffix + "' type='radio'" + checked + " id='discrete_color_same_" + id_suffix + "'" + onchange + ">&nbsp;Use one color</td><td><input id='discrete_color_same_color_" + id_suffix + "' value='" + color + "' class='color'" + onchange2 + "></td></tr>";
			html += "</table></td></tr>";
		}
		if ((config == 'color' || config == COLOR_SIZE_CONFIG) && !is_sample) {
			var checked = params ? params.checked : "";
			var onchange = " onchange='DisplayUnorderedDiscreteConfig.setAdvancedConfiguration(\"" + id + "\", \"" + config + "\", " + (checked ? "True" : "False") + ")'";
			html += "<tr><td colspan='2' style='background: #EEEEEE;'>&nbsp;</td></tr>";
			html += "<tr><td class='config-label'><input id='discrete_color_advanced_" + id_suffix + "' type='checkbox' " + (checked ? "checked" : "") + " " + onchange + ">&nbsp;Avanced configuration</td></tr>";
		}
		html += "</tbody>";
		table.append(html);

		var title = $("#discrete_config_title_" + mod + id, doc);
		if (config == COLOR_SIZE_CONFIG) {
			var Config = "Color/Size";
		} else {
			var Config = config.charAt(0).toUpperCase() + config.slice(1)
		}
		title.html("<span style='font-style: italic'>" + this.datatable.name + "</span> Datatable<br><span style='font-size: smaller'>" + Config + " Configuration</span>");
		jscolor.init(this.win);
	}
};

DisplayUnorderedDiscreteConfig.switch_sample_tab = function(datatable_id, config, doc, called_from_api) {
	var win = window;
	if (!doc) {
		doc = win.document;
	}
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "switch_sample_tab", datatable_id, config);
		return;
	}
	var module = get_module(win);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	var displayConfig = datatable.getDisplayConfig(module);
	
	displayConfig.setActiveTab(0);

	var suffix = config + '_' + datatable_id;
	$("#discrete_config_sample_" + suffix, doc).css("display", "block");
	$("#discrete_config_group_" + suffix, doc).css("display", "none");
}

DisplayUnorderedDiscreteConfig.switch_group_tab = function(datatable_id, config, doc, called_from_api) {
	var win = window;
	if (!doc) {
		doc = win.document;
	}
	if (!called_from_api) {
		nv_perform("nv_display_unordered_discrete_config_perform", doc.win, "switch_group_tab", datatable_id, config);
		return;
	}
	var module = get_module(win);
	var datatable = navicell.getDatatableByCanonName(datatable_id);
	var displayConfig = datatable.getDisplayConfig(module);
	
	displayConfig.setActiveTab(1);

	var suffix = config + '_' + datatable_id;
	$("#discrete_config_sample_" + suffix, doc).css("display", "none")
	$("#discrete_config_group_" + suffix, doc).css("display", "block");
}

function HeatmapConfig(win) {
	this.win = win;
	this.setSlider(null);
	this.reset();
}

HeatmapConfig.prototype = {

	reset: function(reset_sample_only) {
		this.samples_or_groups = [];
		if (!reset_sample_only) {
			this.datatables = [];
			this.setSize(4);
			this.setScaleSize(4);
			this.setTransparency(1);
		}
	},

	setTransparency: function(transparency) {
		if (transparency < 1) {
			transparency = 1;
		}
		this.transparency = transparency;
	},

	getTransparency: function() {
		return this.transparency;
	},

	setSlider: function(slider) {
		this.slider = slider;
	},

	getSlider: function() {
		return this.slider;
	},

	setAllSamples: function() {
		this.shrink();
		for (var sample_name in navicell.dataset.samples) {
			var sample = navicell.dataset.samples[sample_name];
			this.samples_or_groups.push(sample);
		}
		return this.samples_or_groups.length;
	},

	setAllGroups: function() {
		this.shrink();
		for (var group_name in navicell.group_factory.group_map) {
			var group = navicell.group_factory.group_map[group_name];
			this.samples_or_groups.push(group);
		}
		return this.samples_or_groups.length;
	},

	cloneFrom: function(heatmap_config) {
		this.reset();
		for (var nn = 0; nn < heatmap_config.datatables.length; ++nn) {
			this.datatables.push(heatmap_config.datatables[nn]);
		}
		for (var nn = 0; nn < heatmap_config.samples_or_groups.length; ++nn) {
			this.samples_or_groups.push(heatmap_config.samples_or_groups[nn]);
		}
		this.setSize(heatmap_config.getSize());
		this.setScaleSize(heatmap_config.getScaleSize());
		this.setTransparency(heatmap_config.getTransparency());
	},

	setSize: function(size) {
		this.size = size*1.;
	},

	setScaleSize: function(scale_size) {
		this.scale_size = scale_size*1;
	},

	getSize: function() {
		return this.size;
	},

	getScaleSize: function() {
		return this.scale_size;
	},

	getScale: function(scale) {
		if (this.scale_size == 0) {
			return 1;
		}
		if (this.scale_size == 1) {
			return scale*1;
		}
		return Math.sqrt(scale*1.)/(this.scale_size-1);
	},

	shrink: function() {
		var new_samples_or_groups = []
		var samples_or_groups_map = {};
		for (var idx = 0; idx < this.samples_or_groups.length; idx++) {
			var sample_or_group = this.samples_or_groups[idx];
			if (sample_or_group && !samples_or_groups_map[sample_or_group.getId()]) {
				new_samples_or_groups.push(sample_or_group);
				samples_or_groups_map[sample_or_group.getId()] = true;
			}
		}
		this.samples_or_groups = new_samples_or_groups;

		var new_datatables = []
		var datatables_map = []
		for (var idx = 0; idx < this.datatables.length; idx++) {
			var datatable = this.datatables[idx];
			if (datatable && !datatables_map[datatable.getId()]) {
				new_datatables.push(datatable);
				datatables_map[datatable.getId()] = true;
			}
		}
		this.datatables = new_datatables;
	},

	syncDatatables: function() {
		var new_datatables = []
		for (var idx = 0; idx < this.datatables.length; idx++) {
			var datatable = this.datatables[idx];
			if (datatable && navicell.dataset.getDatatableById(datatable.getId())) {
				new_datatables.push(datatable);
			}
		}
		this.datatables = new_datatables;
	},

	getDatatableCount: function() {
		return this.datatables.length;
	},

	getSampleOrGroupCount: function() {
		return this.samples_or_groups.length;
	},

	getSamplesOrGroups: function() {
		return this.samples_or_groups;
	},
	
	setSamplesOrGroups: function(samples_or_groups) {
		this.shrink();
		this.samples_or_groups = samples_or_groups;
	},
	
	setDatatableAt: function(idx, datatable) {
		if (idx >= this.datatables.length) {
			this.datatables.length = idx+1;
		}
		this.datatables[idx] = datatable;
	},

	getDatatableAt: function(idx) {
		if (idx >= this.datatables.length) {
			return undefined;
		}
		return this.datatables[idx];
	},

	setSampleOrGroupAt: function(idx, sample_or_group) {
		if (idx >= this.samples_or_groups.length) {
			this.samples_or_groups.length = idx+1;
		}
		this.samples_or_groups[idx] = sample_or_group;
	},

	getSampleOrGroupAt: function(idx) {
		if (idx >= this.samples_or_groups.length) {
			return undefined;
		}
		return this.samples_or_groups[idx];
	},

	getGroupAt: function(idx) {
		var sample_or_group = this.getSampleOrGroupAt(idx);
		return sample_or_group && sample_or_group.isGroup() ? sample_or_group : undefined;
	},

	getSampleAt: function(idx) {
		var sample_or_group = this.getSampleOrGroupAt(idx);
		return sample_or_group && sample_or_group.isSample() ? sample_or_group : undefined;
	}
};

//
// TBD: MUST factorize with HeatmapConfig (probably inheritance)
//

function BarplotConfig(win) {
	this.win = win;
	this.setSlider(null, null);
	this.reset();
}

BarplotConfig.prototype = {

	reset: function(reset_sample_only) {
		this.samples_or_groups = [];
		if (!reset_sample_only) {
			this.datatables = [];
			this.setHeight(4);
			this.setWidth(4);
			this.setScaleSize(4);
			this.setTransparency(1);
		}
	},

	setTransparency: function(transparency) {
		if (transparency < 1) {
			transparency = 1;
		}
		this.transparency = transparency;
	},

	getTransparency: function() {
		return this.transparency;
	},

	setSlider: function(slider) {
		this.slider = slider;
	},

	getSlider: function() {
		return this.slider;
	},

	setAllSamples: function() {
		this.shrink();
		for (var sample_name in navicell.dataset.samples) {
			var sample = navicell.dataset.samples[sample_name];
			this.samples_or_groups.push(sample);
		}
		return this.samples_or_groups.length;
	},

	setAllGroups: function() {
		this.shrink();
		for (var group_name in navicell.group_factory.group_map) {
			var group = navicell.group_factory.group_map[group_name];
			this.samples_or_groups.push(group);
		}
		return this.samples_or_groups.length;
	},

	cloneFrom: function(barplot_config) {
		this.reset();
		for (var nn = 0; nn < barplot_config.datatables.length; ++nn) {
			this.datatables.push(barplot_config.datatables[nn]);
		}
		for (var nn = 0; nn < barplot_config.samples_or_groups.length; ++nn) {
			this.samples_or_groups.push(barplot_config.samples_or_groups[nn]);
		}
		this.setHeight(barplot_config.getHeight());
		this.setWidth(barplot_config.getWidth());
		this.setScaleSize(barplot_config.getScaleSize());
		this.setTransparency(barplot_config.getTransparency());
	},

	setWidth: function(width) {
		this.width = width*1.;
	},

	setHeight: function(height) {
		this.height = height*1.;
	},

	setScaleSize: function(scale_size) {
		this.scale_size = scale_size*1;
	},

	getWidth: function() {
		return this.width;
	},

	getHeight: function() {
		return this.height;
	},

	getScaleSize: function() {
		return this.scale_size;
	},

	getScale: function(scale) {
		if (this.scale_size == 0) {
			return 1.;
		}
		if (this.scale_size == 1) {
			return scale*1.;
		}
		return Math.sqrt(scale*1.)/(this.scale_size-1);
	},

	shrink: function() {
		var new_samples_or_groups = []
		var samples_or_groups_map = {};
		for (var idx = 0; idx < this.samples_or_groups.length; idx++) {
			var sample_or_group = this.samples_or_groups[idx];
			if (sample_or_group && !samples_or_groups_map[sample_or_group.getId()]) {
				new_samples_or_groups.push(sample_or_group);
				samples_or_groups_map[sample_or_group.getId()] = true;
			}
		}
		this.samples_or_groups = new_samples_or_groups;

		var new_datatables = []
		var datatables_map = []
		for (var idx = 0; idx < this.datatables.length; idx++) {
			var datatable = this.datatables[idx];
			if (datatable && !datatables_map[datatable.getId()]) {
				new_datatables.push(datatable);
				datatables_map[datatable.getId()] = true;
			}
		}
		this.datatables = new_datatables;
	},

	syncDatatables: function() {
		var new_datatables = []
		for (var idx = 0; idx < this.datatables.length; idx++) {
			var datatable = this.datatables[idx];
			if (datatable && navicell.dataset.getDatatableById(datatable.getId())) {
				new_datatables.push(datatable);
			}
		}
		this.datatables = new_datatables;
	},

	setDatatableAt: function(idx, datatable) {
		if (idx >= this.datatables.length) {
			this.datatables.length = idx+1;
		}
		this.datatables[idx] = datatable;
	},

	getDatatableAt: function(idx) {
		if (idx >= this.datatables.length) {
			return undefined;
		}
		return this.datatables[idx];
	},

	getSampleOrGroupCount: function() {
		return this.samples_or_groups.length;
	},

	setSampleOrGroupAt: function(idx, sample_or_group) {
		if (idx >= this.samples_or_groups.length) {
			this.samples_or_groups.length = idx+1;
		}
		this.samples_or_groups[idx] = sample_or_group;
	},

	getSamplesOrGroups: function() {
		return this.samples_or_groups;
	},
	
	setSamplesOrGroups: function(samples_or_groups) {
		this.shrink();
		this.samples_or_groups = samples_or_groups;
	},
	
	getSampleOrGroupAt: function(idx) {
		if (idx >= this.samples_or_groups.length) {
			return undefined;
		}
		return this.samples_or_groups[idx];
	},

	getGroupAt: function(idx) {
		var sample_or_group = this.getSampleOrGroupAt(idx);
		return sample_or_group && sample_or_group.isGroup() ? sample_or_group : undefined;
	},

	getSampleAt: function(idx) {
		var sample_or_group = this.getSampleOrGroupAt(idx);
		return sample_or_group && sample_or_group.isSample() ? sample_or_group : undefined;
	}
};

function GlyphConfig(win, num) {
	this.win = win;
	this.num = num;
	this.setCanvasAndSlider(null, null);
	this.reset();
}

GlyphConfig.prototype = {

	reset: function() {
		this.sample_or_group = null;
		this.shape_datatable = null;
		this.color_datatable = null;
		this.size_datatable = null;
		this.setSize(4);
		this.setScaleSize(4);
		this.setTransparency(1);
	},

	setCanvasAndSlider: function(drawing_canvas, slider) {
		this.drawing_canvas = drawing_canvas;
		this.slider = slider;
	},

	getSlider: function() {
		return this.slider;
	},

	getDrawingCanvas: function() {
		return this.drawing_canvas;
	},

	setSize: function(size) {
		this.size = size*1.;
	},

	setScaleSize: function(scale_size) {
		this.scale_size = scale_size*1;
	},

	getSize: function() {
		return this.size;
	},

	getScaleSize: function() {
		return this.scale_size;
	},

	setTransparency: function(transparency) {
		if (transparency < 1) {
			transparency = 1;
		}
		this.transparency = transparency;
	},

	getTransparency: function() {
		return this.transparency;
	},

	syncDatatables: function() {
		var datatable;
		datatable = this.getShapeDatatable();
		if (datatable && !navicell.dataset.getDatatableById(datatable.getId())) {
			this.setShapeDatatable(null);
		}
		datatable = this.getColorDatatable();
		if (datatable && !navicell.dataset.getDatatableById(datatable.getId())) {
			this.setColorDatatable(null);
		}
		datatable = this.getSizeDatatable();
		if (datatable && !navicell.dataset.getDatatableById(datatable.getId())) {
			this.setSizeDatatable(null);
		}
	},

	getScale: function(scale) {
		if (this.scale_size == 0) {
			return 1;
		}
		if (this.scale_size == 1) {
			return scale*1;
		}
		return Math.sqrt(scale*1.)/(this.scale_size-1);
	},

	setSampleOrGroup: function(sample_or_group) {
		this.sample_or_group = sample_or_group;
	},

	getSampleOrGroup: function() {
		return this.sample_or_group;
	},

	getGroup: function() {
		var sample_or_group = this.getSampleOrGroup();
		return this.sample_or_group && sample_or_group.isGroup() ? sample_or_group : undefined;
	},

	getSample: function() {
		var sample_or_group = this.getSampleOrGroup();
		return sample_or_group && sample_or_group.isSample() ? sample_or_group : undefined;
	},

	setShapeDatatable: function(datatable) {
		this.shape_datatable = datatable;
	},

	getShapeDatatable: function() {
		return this.shape_datatable;
	},

	setColorDatatable: function(datatable) {
		this.color_datatable = datatable;
	},

	getColorDatatable: function() {
		return this.color_datatable;
	},

	setSizeDatatable: function(datatable) {
		this.size_datatable = datatable;
	},

	getSizeDatatable: function() {
		return this.size_datatable;
	},

	cloneFrom: function(glyph_config) {
		this.reset();

		this.sample_or_group = glyph_config.sample_or_group;
		this.size = glyph_config.size;
		this.scale_size = glyph_config.scale_size;
		this.shape_datatable = glyph_config.shape_datatable;
		this.color_datatable = glyph_config.color_datatable;
		this.size_datatable = glyph_config.size_datatable;
		this.transparency = glyph_config.transparency;
		this.drawing_canvas = glyph_config.drawing_canvas;
	}
};

function MapStainingConfig(win) {
	this.win = win;
	this.setCanvasAndSlider(null, null);
	this.reset();
}

MapStainingConfig.DEFAULT_TRANSPARENCY = 70;

MapStainingConfig.prototype = {

	reset: function() {
		this.sample_or_group = null;
		this.color_datatable = null;
		this.setTransparency(MapStainingConfig.DEFAULT_TRANSPARENCY);
	},

	setTransparency: function(transparency) {
		if (transparency < 1) {
			transparency = 1;
		}
		this.transparency = transparency;
	},

	getTransparency: function() {
		return this.transparency;
	},

	setCanvasAndSlider: function(drawing_canvas, slider) {
		this.drawing_canvas = drawing_canvas;
		this.slider = slider;
	},

	getSlider: function() {
		return this.slider;
	},

	syncDatatables: function() {
		var datatable;
		datatable = this.getColorDatatable();
		if (datatable && !navicell.dataset.getDatatableById(datatable.getId())) {
			this.setColorDatatable(null);
		}
	},

	setSampleOrGroup: function(sample_or_group) {
		this.sample_or_group = sample_or_group;
	},

	getSampleOrGroup: function() {
		return this.sample_or_group;
	},

	getGroup: function() {
		var sample_or_group = this.getSampleOrGroup();
		return this.sample_or_group && sample_or_group.isGroup() ? sample_or_group : undefined;
	},

	getSample: function() {
		var sample_or_group = this.getSampleOrGroup();
		return sample_or_group && sample_or_group.isSample() ? sample_or_group : undefined;
	},

	setColorDatatable: function(datatable) {
		this.color_datatable = datatable;
	},

	getColorDatatable: function() {
		return this.color_datatable;
	},

	cloneFrom: function(map_staining_config) {
		this.reset();

		this.sample_or_group = map_staining_config.sample_or_group;
		this.color_datatable = map_staining_config.color_datatable;
		this.setTransparency(map_staining_config.getTransparency());
	}
};

// TBD datatable id management
function Datatable(dataset, biotype_name, name, file, url, datatable_id, win, async) {
	var reader;
	var ready;
	if (file) {
		reader = new FileReader();
		ready = $.Deferred(reader.onload);
	} else {
		reader = null;
		ready = $.Deferred();
	}

	this.ready = ready;
	ready.datatable = this;
	if (dataset.datatables[name]) {
		this.error = "datatable " + name + " already exists";
		//navicell.import_synchronizer.setError(this.error);
		ready.resolve(this);
		return;
	}
	this.minval = Number.MAX_NUMBER;
	this.maxval = Number.MIN_NUMBER;
	this.minval_abs = Number.MAX_NUMBER;
	this.maxval_abs = Number.MIN_NUMBER;
	this.error = "";
	this.warning = "";
	this.id = datatable_id;
	this.dataset = dataset;
	this.biotype = navicell.biotype_factory.getBiotype(biotype_name);
	if (!this.biotype) {
		this.error = "Unknown type: \"" + biotype_name + "\"";
		//navicell.import_synchronizer.setError(this.error);
		ready.resolve(this);
		return;
	}

	this.discrete_values_map = {};
	this.discrete_values = [];
	this.empty_value_cnt = 0;
	this.windows = {}
	this.dialogs = {}
	this.data_table_gene = {};
	this.data_table_sample = {};
	this.switch_button = {};
	this.data_matrix = {};
	this.current_view = {};
	this.displayContinuousConfig = {};
	this.displayUnorderedDiscreteConfig = {};

	this.setName(name);

	this.gene_index = {};
	this.sample_index = {};
	this.data = [];

	navicell.DTStatusMustUpdate = true;

	var datatable = this;

	if (url) {
		if (url.match(/^@DATA\n/)) {
			datatable.loadData(url.substring(6), ready, win); // TBD: change 6 to "@DATA".length+1
		} else {
			$.ajax(url,
			       {
				       //crossDomain: true, // 2015-12-10: disconnected because of demo running problem with files
				       async: async,
				       dataType: 'text',
				       success: function(data) {
					       datatable.loadData(data, ready, win);
				       },
				       
				       error: function() {
					       datatable.loadDataError(ready, "error loading [" + url + "]");
				       }
			       }
			      );
		}
	} else {
		reader.readAsBinaryString(file);
		
		reader.onload = function() { 
			var data = reader.result;
			datatable.loadData(data, ready, win);
		}
		reader.onerror = function(e) {  // If anything goes wrong
			datatable.loadDataError(ready, e);
		}
	}
}

var MAX_MATRIX_SIZE = 8000;

var DATATABLE_HAS_TABS = 0;

Datatable.prototype = {
	dataset: null,
	biotype: null,
	name: "",
	canon_name: "",
	html_name: "",
	gene_index: {},
	sample_index: {},
	data: [],
	ready: null,
	minval: null,
	maxval: null,

	loadData: function(data, ready, win) {
		var dataset = this.dataset;

		var lines = data.split(LINE_BREAK_REGEX);
		var gene_length = lines.length;

		var firstline;
		var sample_cnt = 0;
		var sep = null;

		for (var ii = 0; ii < INPUT_SEPS.length; ++ii) {
			sep = INPUT_SEPS[ii];
			firstline = lines[0].trim().split(sep);
			sample_cnt = firstline.length-1;
			if (!firstline[firstline.length-1]) {
				--sample_cnt;
			}
			if (sample_cnt >= 1) {
				break;
			}
		}

		var biotype_is_set = this.biotype.isSet();
		if (sample_cnt < 1) {
			if (!biotype_is_set) {
				this.error = "invalid file format: tabular, comma or space separated file expected";
				//navicell.import_synchronizer.setError(this.error);
				ready.resolve(this);
				return;
			}
			firstline.push(NO_SAMPLE);
			sample_cnt = 1;
		} else {
			if (biotype_is_set) {
				this.error = "invalid file format: only one column expected";
				//navicell.import_synchronizer.setError(this.error);
				ready.resolve(this);
				return;
			}
		}

		var samples_to_add = [];
		var genes_to_add = [];
		for (var sample_nn = 0; sample_nn < sample_cnt; ++sample_nn) {
			var sample_name = firstline[sample_nn+1];
			if (sample_name.length > 1) {
				samples_to_add.push(sample_name);
				this.sample_index[sample_name] = sample_nn;
			}
		}
		
		for (var gene_nn = 0, gene_jj = 1; gene_jj < gene_length; ++gene_jj) {
			var line = lines[gene_jj].trim().split(sep);
			var line_cnt = line.length-1;
			if (!line[line.length-1]) {
				--line_cnt;
			}
			if (biotype_is_set) {
				line_cnt++;
			}
			if (line_cnt < sample_cnt) {
				this.warning += "line #" + (gene_jj+1) + " has less than " + sample_cnt + " samples";
			} else if (line_cnt > sample_cnt) {
				this.error += "line #" + (gene_jj+1) + " has more than " + sample_cnt + " samples";
				//navicell.import_synchronizer.setError(this.error);
				ready.resolve(this);
				return;

			}
			var gene_name = line[0];
			if (!navicell.mapdata.hugo_map[gene_name]) {
				continue;
			}
			genes_to_add.push(gene_name);

			this.gene_index[gene_name] = gene_nn;
			this.data[gene_nn] = [];
			for (var sample_nn = 0; sample_nn < line_cnt; ++sample_nn) {
				var value;
				if (biotype_is_set) {
					value = GENE_SET;
				} else {
					value = line[sample_nn+1];
				}
				var err = this.setData(gene_nn, sample_nn, value);
				if (err) {
					console.log("data error " + err);
					this.error = "datatable " + name + " invalid data: " + err;
					//navicell.import_synchronizer.setError(this.error);
					ready.resolve(this);
					return;
				}
			}
			++gene_nn;
		}

		var has_new_samples = false;
		for (var nn = 0; nn < samples_to_add.length; ++nn) {
			var sample = dataset.addSample(samples_to_add[nn]);
			if (!has_new_samples) {
				has_new_samples = sample.refcnt == 1;
			}
		}

		for (var nn = 0; nn < genes_to_add.length; ++nn) {
			var gene_name = genes_to_add[nn];
			dataset.addGene(gene_name, navicell.mapdata.hugo_map[gene_name]);
		}

		this.epilogue(win);
		ready.resolve(this);
		dataset.syncModifs();
	},

	loadDataError: function(ready, e) {
		this.error = e.toString();
		//navicell.import_synchronizer.setError(this.error);
		console.log("Error", e);    // Just log it
		ready.resolve(this);
	},

	// 2013-05-31
	// TBD: need methods:
	// - to get positions from an id or a set of ids (called from
	//   show_markers or from the jstree search),
	// - to get positions from a name or a set of names.
	// 
	// In the following method, we get positions sucessfully, but not from
	// an id but scanning the fill array => a map indexed by id (mind:
	// multiple id per gene) is missing.
	display: function(module_name, win, display_graphics, display_markers) {
		if (!display_graphics && !display_markers) {
			return;
		}
		var id_arr = [];
		var arrpos = [];
		for (var gene_name in this.gene_index) {
			var hugo_module_map = this.dataset.genes[gene_name].hugo_module_map;
			var entity_map_arr = hugo_module_map[module_name];
			if (!entity_map_arr) {
				continue;
			}
			for (var ii = 0; ii < entity_map_arr.length; ++ii) {
				var entity_map = entity_map_arr[ii];
				var modif_arr = entity_map.modifs;
				if (modif_arr) {
					for (var nn = 0; nn < modif_arr.length; ++nn) {
						var modif = modif_arr[nn];
						var positions = modif.positions;
						if (positions) {
							for (var kk = 0; kk < positions.length; ++kk) {
								arrpos.push({id : modif.id, p : new google.maps.Point(positions[kk].x, positions[kk].y), gene_name: gene_name});
							}
							id_arr.push(modif.id);
						}
					}
				}
			}
		}
		if (display_markers) {
			if (navicell.mapdata.getJXTree(win.document.navicell_module_name)) {
				navicell.mapdata.findJXTree(win, id_arr, true, 'select');
			} else {
				win.show_markers(id_arr);
			}
		}

		if (win.overlay) {
			win.overlay.draw(module_name);
		}
	},

	setName: function(name) {
		this.dataset.unregisterDatatableNames(this);
		//delete this.datatables[this.name];
		//delete this.datatables_canon_name[this.canon_name];
		this.name = name;
		this.canon_name = canon_name(name);
		//this.datatables[this.name] = this;
		//this.datatables_canon_name[this.canon_name] = this;
		this.dataset.registerDatatableNames(this);
		this.html_name = name.replace(/ /g, "&nbsp;");
	},

	getId: function() {
		return this.id;
	},

	getName: function() {
		return this.name;
	},

	getCanonName: function() {
		return this.canon_name;
	},

	getHTMLName: function() {
		return this.html_name;
	},

	hasEmptyValues: function() {
		return this.empty_value_cnt > 0;
	},

	setTabNum: function(tabnum) {
		this.tabnum = tabnum;
	},

	declareWindow: function(win) {
		var module = get_module(win);
		if (!this.windows[module]) {
			this.windows[module] = win;
		}
	},

	showingDataIsHuge: function() {
		if (this.biotype.isSet()) {
			return false;
		}
		var size = mapSize(this.gene_index) * mapSize(this.sample_index);
		return size > 50000;
	},

	showingMarkersIsHuge: function() {
		return mapSize(this.gene_index) > 1000;
	},

	makeDialogsForWindow: function(win) {
		var module = get_module(win);
		if (this.dialogs[module]) {
			return;
		}
		var doc = win.document;
		var tab_body = $("#dt_datatable_tabs", doc);
		$('body', doc).append("<div id='dt_data_dialog_" + this.id + "'><div id='dt_datatable_id" + this.id + "'><h3 id='dt_data_dialog_title_" + this.id + "' style='text-align: center;'><span style='font-style: italic;'>" + this.name + "</span> Datatable</h3><div class='switch-view-div'>" + make_button("", "switch_view_" + this.id, "switch_view(" + this.id + ")") + "</div><table id='dt_datatable_gene_table_id" + this.id + "' class='tablesorter datatable_table'></table><table id='dt_datatable_sample_table_id" + this.id + "' class='tablesorter datatable_table'></table></div></div>");
		this.data_div = $("#dt_datatable_id" + this.id, doc);
		this.data_table = $("#dt_datatable_table_id" + this.id, doc);
		this.data_table_gene[module] = $("#dt_datatable_gene_table_id" + this.id, doc);
		this.data_table_sample[module] = $("#dt_datatable_sample_table_id" + this.id, doc);
		this.switch_button[module] = $("#switch_view_" + this.id, doc);
		this.switch_button[module].css('font-size', '10px');
		this.switch_button[module].css('background', 'white');
		this.switch_button[module].css('color', 'darkblue');

		var width = this.biotype.isSet() ? 300: 900;

		this.data_matrix[module] = $("#dt_data_dialog_" + this.id, doc);

		this.data_matrix[module].dialog({
			autoOpen: false,
			width: width,
			height: 700,
			modal: false,
			buttons: {
				OK: function() {
					$(this).dialog('close');
				}
			}
		});

		if (this.biotype.isContinuous()) {
			this.displayContinuousConfig[module] = new DisplayContinuousConfig(this, win);
			this.displayUnorderedDiscreteConfig[module] = null;
		} else if (this.biotype.isUnorderedDiscrete()) {
			this.displayContinuousConfig[module] = null;
			this.displayUnorderedDiscreteConfig[module] = new DisplayUnorderedDiscreteConfig(this, win);
		} else if (this.biotype.isOrderedDiscrete()) {
			this.displayContinuousConfig[module] = new DisplayContinuousConfig(this, win, true);
			this.displayUnorderedDiscreteConfig[module] = null;
		} else if (this.biotype.isSet()) { // duplicated code for now
			this.displayContinuousConfig[module] = null;
			this.displayUnorderedDiscreteConfig[module] = new DisplayUnorderedDiscreteConfig(this, win);
		}
		this.current_view[module] = "gene";
		this.dialogs[module] = true;
	},

	epilogue: function(win) {
		for (var map_name in maps) {
			var doc = maps[map_name].document;
			this.declareWindow(doc.win);
		}
		if (this.biotype.isUnorderedDiscrete()) {
			this.discrete_values = mapKeys(this.discrete_values_map);
			this.discrete_values.sort();
		} else if (this.biotype.isOrderedDiscrete()) {
			this.discrete_values = mapKeys(this.discrete_values_map);
			this.discrete_values.sort(cmp=function(x, y) {return x-y;});
		} else if (this.biotype.isSet()) {
			this.discrete_values = mapKeys(this.discrete_values_map);
			this.discrete_values.sort();
		}
	},

	getDiscreteValues: function() {
		return this.discrete_values;
	},

	makeGeneView: function(module) {
		this.current_view[module] = "gene";
		if (!this.data_table_gene[module].ok) {
			this.data_table_gene[module].children().remove();
			this.data_table_gene[module].append(this.makeDataTable_genes(module));
			this.data_table_gene[module].tablesorter();
			this.data_table_gene[module].ok = true;
		}
		this.data_table_sample[module].css("display", "none");
		this.data_table_gene[module].css("display", "block");

		if (this.biotype.isSet()) {
			this.switch_button[module].css("display", "none");
		} else {
			this.switch_button[module].val("Switch to Samples / Genes");
		}
	},

	makeSampleView: function(module) {
		this.current_view[module] = "sample";
		if (!this.data_table_sample[module].ok) {
			this.data_table_sample[module].children().remove();
			this.data_table_sample[module].append(this.makeDataTable_samples(module));
			this.data_table_sample[module].tablesorter();
			this.data_table_sample[module].ok = true;
		}
		this.data_table_sample[module].css("display", "block");
		this.data_table_gene[module].css("display", "none");
		if (this.biotype.isSet()) {
			this.switch_button[module].css("display", "none");
		} else {
			this.switch_button[module].val("Switch to Genes / Samples");
		}
	},

	switchView: function(win) {
		var module = get_module(win);
		if (this.current_view[module] == "gene") {
			this.makeSampleView(module);
		} else {
			this.makeGeneView(module);
		}
	},

	refresh: function(win) {
		var module = get_module(win);
		if (this.current_view[module] == "gene") {
			this.makeGeneView(module);
		} else if (this.current_view[module] == "sample") {
			this.makeSampleView(module);
		}
	},

	getDataMatrixDiv: function(module) {
		if (!this.dialogs[module] && this.windows[module]) {
			this.makeDialogsForWindow(this.windows[module]);
		}
		return this.data_matrix[module];
	},

	getDisplayConfig: function(module) {
		if (!this.dialogs[module] && this.windows[module]) {
			this.makeDialogsForWindow(this.windows[module]);
		}
		if (this.displayContinuousConfig[module]) {
			return this.displayContinuousConfig[module];
		}
		return this.displayUnorderedDiscreteConfig[module];
	},

	makeDataTable_genes_csv: function(module) {
		var str = "Genes";
		if (!this.biotype_is_set) {
			for (var sample_name in this.sample_index) {
				str += "," + sample_name;
			}
		}
		str += "\n";
		for (var gene_name in this.gene_index) {
			str += gene_name;
			var limit = 0;
			if (!this.biotype_is_set) {
				for (var sample_name in this.sample_index) {
					var value = this.data[this.gene_index[gene_name]][this.sample_index[sample_name]];
					str += "," + value;
				}
			}
			str += "\n";
		}
		return str;
	},

	makeDataTable_genes: function(module) {
		if (this.biotype_is_set) {
			this.switch_button[module].val("");
		} else {
			this.switch_button[module].val("Switch to Samples / Genes");
		}
		var str = "<thead><th>Genes</th>";
		if (!this.biotype_is_set) {
			for (var sample_name in this.sample_index) {
				str += "<th>" + sample_name + "</th>";
			}
		}
		str += "</thead>";
		str += "<tbody>";
		for (var gene_name in this.gene_index) {
			str += "<tr><td>" + gene_name + "</td>";
			var limit = 0;
			if (!this.biotype_is_set) {
				for (var sample_name in this.sample_index) {
					var value = this.data[this.gene_index[gene_name]][this.sample_index[sample_name]];
					str += "<td>" + value + "</td>";
				}
			}
			str += "</tr>";
		}
		str += "</tbody>";
		return str;
	},

	getValue: function(sample_name, gene_name) {
		var gene_idx = this.gene_index[gene_name];
		var sample_idx = this.sample_index[sample_name];
		/*
		if (this.data[gene_idx][sample_idx]) {
			console.log("getValue: " + sample_name + " " + gene_name + " " + gene_idx + " " + sample_idx + " -> " + this.data[gene_idx][sample_idx]);
		}
		*/
		if (gene_idx != undefined && sample_idx != undefined) {
			return this.data[gene_idx][sample_idx];
		}
		if (sample_name == NO_SAMPLE) {
			return INVALID_VALUE;
		}
		return undefined;
	},

	getValueByModifId: function(module, sample_name, modif_id, method) {
		var info = navicell.dataset.getGeneInfoByModifId(module, modif_id);
		if (info) {
			var genes = info[0];
			if (method == Group.DISCRETE_VALUE) {
				return this.getValue(sample_name, genes[0].name); // warning: only one gene is taken into account
			}
			if (genes.length == 1) {
				return this.getValue(sample_name, genes[0].name)*1.;
			}
			if (!method) {
				method = this.minval < 0 ? Group.CONTINUOUS_ABS_MAXVAL: Group.CONTINUOUS_MAXVAL;
			}
			if (method == Group.CONTINUOUS_MEDIAN) {
				var values = [];
				for (var nn = 0; nn < genes.length; ++nn) {

					var gene_name = genes[nn].name;
					var value = this.getValue(sample_name, gene_name)*1.;
					values.push(value);
				}
				var len = values.length;
				values.sort(cmp=function(x, y) {return x-y;});
				var len2 = Math.floor(len/2);
				if (len == 1 || 0 == (len & 1)) {
					return values[len2];
				}
				return (values[len2-1]+values[len2])/2;
				
			}
			if (method == Group.CONTINUOUS_AVERAGE || method == Group.CONTINUOUS_ABS_AVERAGE) {
				var total_value = 0.;
				var total_absvalue = 0;
				for (var nn = 0; nn < genes.length; ++nn) {
					var gene_name = genes[nn].name;
					var value = this.getValue(sample_name, gene_name)*1.;
					total_value += value;
					total_absvalue += Math.abs(value);
				}
				if (method == Group.CONTINUOUS_AVERAGE) {
					return total_value / genes.length;
				}
				return total_absvalue / genes.length;
			}
			if (method == Group.CONTINUOUS_MINVAL || method == Group.CONTINUOUS_MAXVAL || method == Group.CONTINUOUS_ABS_MINVAL || method == Group.CONTINUOUS_ABS_MAXVAL) {
				var max = Number.MIN_NUMBER;
				var absmax = Number.MIN_NUMBER;
				var absmax_s = Number.MIN_NUMBER;

				var min = Number.MAX_NUMBER;
				var absmin = Number.MAX_NUMBER;
				var absmin_s = Number.MAX_NUMBER;

				for (var nn = 0; nn < genes.length; ++nn) {

					var gene_name = genes[nn].name;
					var value = this.getValue(sample_name, gene_name)*1.;
					var absvalue = Math.abs(value);
					if (value < min) {
						min = value;
					}
					if (absvalue < absmin) {
						absmin = absvalue;
						absmin_s = value;
					}
					if (value > max) {
						max = value;
					}
					if (absvalue > absmax) {
						absmax = absvalue;
						absmax_s = value;
					}
				}
				if (method == Group.CONTINUOUS_MINVAL) {
					return min == Number.MAX_NUMBER ? '' : min;
				}
				if (method == Group.CONTINUOUS_MAXVAL) {
					return max == Number.MIN_NUMBER ? '' : max;
				}
				if (method == Group.CONTINUOUS_ABS_MINVAL) {
					return absmin_s == Number.MAX_NUMBER ? '' : absmin_s;
				}
				if (method == Group.CONTINUOUS_ABS_MAXVAL) {
					return absmax_s == Number.MIN_NUMBER ? '' : absmax_s;
				}
				return undefined; // never reached
			}
		}
		console.log("no gene info for " + modif_id);
		return undefined;
	},

	makeDataTable_samples: function(module) {
		this.switch_button[module].val("Switch to Genes / Samples");
		var str = "<thead><th>Samples</th>";
		for (var gene_name in this.gene_index) {
			str += "<th>" + gene_name + "</th>";
		}
		str += "</thead>";
		str += "<tbody>";
		for (var sample_name in this.sample_index) {
			str += "<tr><td>" + sample_name + "</td>";
			var limit = 0;
			for (var gene_name in this.gene_index) {
				var value = this.data[this.gene_index[gene_name]][this.sample_index[sample_name]];
				str += "<td>" + value + "</td>";
			}
			str += "</tr>";
		}
		str += "</tbody>";
		return str;
	},

	getValues: function() {
		var values = [];
		for (var sample_name in this.sample_index) {
			for (var gene_name in this.gene_index) {
				var value = this.data[this.gene_index[gene_name]][this.sample_index[sample_name]];
				values.push(value);
			}
		}
		return values;
	},

	setData: function(gene_nn, sample_nn, value) {
		if (is_empty_value(value)) {
			this.empty_value_cnt++;
			value = '';
		} else {
			var ivalue = parseFloat(value);

			if (!isNaN(ivalue)) {
				if (ivalue < this.minval) {
					this.minval = ivalue;
				}
				if (ivalue > this.maxval) {
					this.maxval = ivalue;
				}
				var ivalue_abs = Math.abs(ivalue);
				if (ivalue_abs < this.minval_abs) {
					this.minval_abs = ivalue_abs;
				}
				if (ivalue_abs > this.maxval_abs) {
					this.maxval_abs = ivalue_abs;
				}
			} else if (this.biotype.isContinuous()) {
				return "expected numeric value, got '" + value + "'";
			}
		}
		if (this.biotype.isUnorderedDiscrete() || this.biotype.isOrderedDiscrete() || this.biotype.isSet()) {
			if (!this.discrete_values_map[value]) {
				if (mapSize(this.discrete_values_map) > MAX_DISCRETE_VALUES) {
					return 'maximum discrete values exceeded: ' + MAX_DISCRETE_VALUES;
				}
				this.discrete_values_map[value] = 1;
			}
		}
		this.data[gene_nn][sample_nn] = value;
		return '';
	},

	getSampleCount: function(gene_name) {
		if (!gene_name) {
			if (this.biotype.isSet()) {
				return 0;
			}
			return mapSize(this.sample_index);
		}
		var gene_idx = this.gene_index[gene_name];
		if (gene_idx == undefined) {
			return -1;
		}
		if (this.biotype.isSet()) {
			return 0;
		}
		var cnt = 0;
		for (var sample_name in this.sample_index) {
			var value = this.data[gene_idx][this.sample_index[sample_name]];
			if (value != '') {
				cnt++;
			}
		}
		
		return cnt;
	},

	getGeneNames: function(module_name) {
		var gene_names = []
		var hugo_map = navicell.mapdata.hugo_map;
		for (var gene_name in this.gene_index) {
			if (hugo_map[gene_name][module_name]) {
				gene_names.push(gene_name);
			}
		}
		return gene_names;
	},

	/*
	for (var gene_name in navicell.dataset.genes) {
		if (navicell.mapdata.hugo_map[gene_name][module_name]) {
			cnt++;
		}
	}
	*/

	getGeneCountPerModule: function(module_name) {
		if (!module_name) {
			return mapSize(this.gene_index);
		}
		var cnt = 0;
		var hugo_map = navicell.mapdata.hugo_map;
		for (var gene_name in this.gene_index) {
			if (hugo_map[gene_name][module_name]) {
				cnt++;
			}
		}
		return cnt;
	},

	getGeneCount: function(sample_name) {
		var sample_idx = this.sample_index[sample_name];
		if (sample_idx == undefined) {
			return -1;
		}
		var cnt = 0;
		for (var gene_name in this.gene_index) {
			var value = this.data[this.gene_index[gene_name]][sample_idx];
			if (value != '') {
				cnt++;
			}
		}
		
		return cnt;
	},

	getClass: function() {return "Datatable";}
};

function DrawingConfig(win) {
	this.win = win;

	this.display_markers = 1;
	this.display_old_markers = 1;

	this.display_charts = 0;
	this.heatmap_config = new HeatmapConfig(win);
	this.editing_heatmap_config = new HeatmapConfig(win);
	this.barplot_config = new BarplotConfig(win);
	this.editing_barplot_config = new BarplotConfig(win);

	this.map_staining_config = new MapStainingConfig(win);
	this.editing_map_staining_config = new MapStainingConfig(win);

	//this.piechart_config = new PiechartConfig();

	this.glyph_configs = [];
	this.editing_glyph_configs = [];
	this.display_glyphs = [];
	for (var num = 1; num <= GLYPH_COUNT; ++num) {
		this.glyph_configs.push(new GlyphConfig(win, num));
		this.editing_glyph_configs.push(new GlyphConfig(win, num));
		this.display_glyphs.push(0);
	}

	this.display_map_staining = 0;
	this.display_labels = 0;

	this.display_DLOs_on_all_genes = 1;
}

DrawingConfig.prototype = {

	getWindow: function() {
		return this.win;
	},

	getHeatmapConfig: function() {
		return this.heatmap_config;
	},

	getEditingHeatmapConfig: function() {
		return this.editing_heatmap_config;
	},

	getBarplotConfig: function() {
		return this.barplot_config;
	},

	getEditingBarplotConfig: function() {
		return this.editing_barplot_config;
	},

	getGlyphConfig: function(num) {
		return this.glyph_configs[num-1];
	},

	getEditingGlyphConfig: function(num) {
		return this.editing_glyph_configs[num-1];
	},

	getMapStainingConfig: function() {
		return this.map_staining_config;
	},

	getEditingMapStainingConfig: function() {
		return this.editing_map_staining_config;
	},

	displayMarkers: function() {
		return this.display_markers;
	},

	displayOldMarkers: function() {
		return this.display_old_markers != "0";
	},

	displayOldMarkersWithDifferentColor: function() {
		return this.display_old_markers == "1";
	},

	displayOldMarkersWithSameColor: function() {
		return this.display_old_markers == "2";
	},

	displayCharts: function() {
		return this.display_charts;
	},

	displayAnyGlyph: function() {
		for (var num = 1; num <= GLYPH_COUNT; ++num) {
			if (this.displayGlyphs(num)) {
				return true;
			}
		}
		return false;
	},

	displayGlyphs: function(num) {
		return this.display_glyphs[num-1];
	},

	displayMapStaining: function() {
		return this.display_map_staining;
	},

	displayLabels: function() {
		return this.display_labels;
	},

	displayHeatmaps: function() {
		return this.display_charts == "Heatmap";
	},

	displayBarplots: function() {
		return this.display_charts == "Barplot";
	},

	displayDLOs: function() {
		return this.displayCharts() || this.displayAnyGlyph() || this.displayMapStaining() || this.displayLabels();
	},

	displayDLOsOnAllGenes: function() {
		return this.display_DLOs_on_all_genes;
	},

	setDisplayDLOsOnAllGenes: function(val) {
		this.display_DLOs_on_all_genes = val;
	},

	setDisplayMapStaining: function(val) {
		this.display_map_staining = val;
	},

	setDisplayMarkers: function(val) {
		this.display_markers = val;
	},

	setDisplayOldMarkers: function(val) {
		this.display_old_markers = val;
	},

	setDisplayGlyphs: function(num, val) {
		this.display_glyphs[num-1] = val;
	},

	setDisplayCharts: function(val, chart_type) {
		if (!val) {
			this.display_charts = 0;
		} else {
			this.display_charts = chart_type;
		}
	},

	apply: function() {
		this.setDisplayDLOsOnAllGenes($("#drawing_config_display_all", this.win.document).attr("checked"));
		this.win.clickmap_refresh(true);
		this.win.drawing_editing(false);
	},

	sync: function() {
		for (var map_name in maps) {
			var doc = maps[map_name].document;
			if (doc == window.document) {
			}
			if (!this.display_charts) {
				$("#drawing_config_chart_display", doc).attr("checked", false);
			} else {
				$("#drawing_config_chart_display", doc).attr("checked", true);
				$("#drawing_config_chart_type", doc).val(this.display_charts);
			}
			$("#drawing_config_marker_display", doc).attr("checked", this.display_markers);
			$("#drawing_config_old_marker", doc).val(this.display_old_markers);
		}
	}
};

function get_module(win) {
	if (!win) {
		win = window;
	} else {
	}
	return win.document.navicell_module_name;
}

function get_module_from_doc(doc) {
	if (!doc) {
		doc = window.document;
	} else {
	}
	return doc.navicell_module_name;
}

function get_win(module) {
	for (var map_name in maps) {
		if (module == map_name) {
			return maps[map_name].document.win;
		}
	}
	return null;
}

function switch_view(id) {
	var module = get_module();
	var datatable = navicell.dataset.datatables_id[id];
	if (datatable) {
		datatable.switchView(window);
	}
}

//
// Annotation class
//

function Annotation(name, id) {
	this.name = name;
	this.canon_name = canon_name(name);
	this.is_group = false;
	this.id = id;
}

Annotation.prototype = {
	name: "",
	is_group: false,
	desc: "",

	setIsGroup: function(is_group) {
		this.is_group = is_group;
	},

	isGroup: function() {
		return this.is_group;
	},

	getId: function() {
		return this.id;
	},

	getName: function() {
		return this.name;
	},

	getCanonName: function() {
		return this.canon_name;
	},

	getClass: function() {return "Annotation";}
};

//
// AnnotationFactory class
//

function AnnotationFactory() {
	this.annot_id = 1;
	this.all_line_read = [];
}

AnnotationFactory.prototype = {
	annots_per_name: {},
	annots_per_canon_name: {},
	annots_per_id: {},
	ready: null,
	sample_read: 0,
	sample_annotated: 0,
	annot_samples: {},

	addAnnotValue: function(sample_name, annot_name, annot_value) {
		if (!this.annot_samples[sample_name]) {
			this.annot_samples[sample_name] = {};
		}
		if (!this.annot_samples[sample_name][annot_name]) {
			this.annot_samples[sample_name][annot_name] = {};
		}

		this.annot_samples[sample_name][annot_name][annot_value] = true;
	},

	sync: function() {
		var annotated = 0;
		for (var sample_name in this.annot_samples) {
			var sample = navicell.dataset.getSample(sample_name);
			if (sample) {
				for (var annot_name in this.annot_samples[sample_name]) {
					for (var annot_value in this.annot_samples[sample_name][annot_name]) {
						sample.addAnnotValue(annot_name, annot_value);
					}
				}
				annotated++;
			}
		}
		return annotated;
	},

	refresh: function() {
		if (!this.readannots(null, null)) {
			return;
		}

		var annots = this.annots_per_name;
		var annot_cnt = mapSize(annots);
		for (var annot_name in annots) {
			var annot = this.getAnnotation(annot_name);
			var annot_id = annot.id;
			var checked = $("#cb_annot_" + annot_id).attr("checked");
			annot.setIsGroup(checked);
		}
		navicell.group_factory.buildGroups();
		// TBD: factorize message with annot_set_group in dialoglib.js
		$("#dt_sample_annot_status").html("</br><span class=\"status-message\"><span style='font-weight: bold'>" + mapSize(navicell.group_factory.group_map) + "</span> groups of samples: groups are listed in My Data / Groups tab</span>");
	},

	startReading: function() {
		this.sample_read = 0;
		this.sample_annotated = 0;
		this.error = "";
		this.missing = "";
	},

	readannots: function(ready, error_trigger) {
		this.startReading();

		var lines = this.all_line_read;
		if (!lines.length) {
			if (ready) {
				ready.resolve();
			}
			return 0;
		}
		var header;
		var header_cnt;

		var sep = null;

		for (var ii = 0; ii < INPUT_SEPS.length; ++ii) {
			sep = INPUT_SEPS[ii];
			header = lines[0].trim().split(sep);
			header_cnt = header.length;
			if (!header[header.length-1]) {
				--header_cnt;
			}
			if (header_cnt > 1) {
				break;
			}
		}

		if (header_cnt < 2) {
			this.error = "invalid file format";
			//navicell.import_synchronizer.setError(this.error);
			console.log("ERROR: " + this.error);
			if (ready) {
				ready.resolve();
			}
		}
		var annot_cnt = header_cnt - 1;
		var sample_cnt = lines.length-1;
		var missing_cnt = 0;
		this.missing = "";
		for (var sample_nn = 0; sample_nn < sample_cnt; ++sample_nn) {
			var line = lines[sample_nn+1].trim().split(sep);
			var line_cnt = line.length-1;
			if (!line[line.length-1]) {
				--line_cnt;
			}
			if (line_cnt < 1) {
				continue;
			}
			if (line_cnt > annot_cnt) {
				this.error = "line #" + (sample_nn) + ", expected " + annot_cnt + " annotations, got " + line_cnt;
				//navicell.import_synchronizer.setError(this.error);
				console.log("ERROR2: " + this.error);
				if (ready) {
					ready.resolve();
				}
				if (error_trigger) {
					error_trigger(file);
				}
				return 0;
			}
			var sample_name = line[0];
			this.sample_read++;
			if (!navicell.dataset.getSample(sample_name)) {
				if (missing_cnt < 10) {
					if (this.missing) {
						this.missing += ", ";
					}
					this.missing += sample_name;
				} else if (missing_cnt == 10) {
					this.missing += "..."
				}
				missing_cnt++;
				continue;
			}
			for (var annot_nn = 0; annot_nn < line_cnt; ++annot_nn) {
				var annot_value = line[annot_nn+1];
				var annot_name = header[annot_nn+1];
				this.addAnnotValue(sample_name, annot_name, annot_value);
			}
		}
		if (this.sample_read > 0) {
			for (var nn = 1; nn < header_cnt; ++nn) {
				this.getAnnotation(header[nn]);
			}
		}
		this.sample_annotated = this.sync();
		if (ready) {
			ready.resolve();
		}
		return 1;
	},

	readurl: function(url) {
		console.log("READING [" + url + "]");

		this.startReading();
		var ready = this.ready = $.Deferred();
		var annot_factory = this;
		$.ajax(url,
		       {
			       async: true,
			       dataType: 'text',
			       cache: false,
			       success: function(text) {
				       var lines = text.split(LINE_BREAK_REGEX);
				       console.log("have read: " + lines.length);
				       array_push_all(annot_factory.all_line_read, lines);
				       annot_factory.readannots(ready, null);
			       },
			       error: function(e) {
				       var msg = "Loading Sample Annotations: cannot load URL " + url + " " + e.responseText;
				       //navicell.import_synchronizer.setError(msg);
				       annot_factory.error = msg;
				       ready.resolve(annot_factory);
				       error_dialog("Loading Sample Annotations", "Cannot load URL " + url + " " + e.responseText, window);
			       }
		       }
		      );
	},

	readfile: function(file, error_trigger) {
		this.startReading();
		var reader = new FileReader();
		reader.readAsBinaryString(file);

		var annot_factory = this;
		var ready = this.ready = $.Deferred(reader.onload);
		reader.onload = function() { 
			var text = reader.result;
			var lines = text.split(LINE_BREAK_REGEX);
			array_push_all(annot_factory.all_line_read, lines);
			annot_factory.readannots(ready);
		},
		reader.onerror = function(e) {  // If anything goes wrong
			var msg = "Loading Sample Annotations: cannot load file " + file.name;
			annot_factory.error = msg;
			ready.resolve(annot_factory);
			//navicell.import_synchronizer.setError(msg);
			error_dialog("Loading Sample Annotations", "Cannot load file " + file.name, window);
		}
	},

	readdata: function(data) {
		this.startReading();
		var ready = this.ready = $.Deferred();
		var lines = data.split(LINE_BREAK_REGEX);
		console.log("READDATA: " + lines.length);
		array_push_all(this.all_line_read, lines);
		this.readannots(ready);
	},

	getAnnotation : function(name, no_create) {
		if (!this.annots_per_name[name] && !no_create) {
			var annot = new Annotation(name, this.annot_id);
			this.annots_per_name[name] = annot;
			this.annots_per_canon_name[annot.canon_name] = annot;
			this.annots_per_id[this.annot_id] = annot;
			this.annot_id++;
		}
		return this.annots_per_name[name];
	},

	getAnnotationPerCanonName : function(canon_name) {
		return this.annots_per_canon_name[canon_name];
	},

	getAnnotationPerId : function(annot_id) {
		return this.annots_per_id[annot_id];
	},

	getAnnotCount: function() {
		return mapSize(this.annots_per_name);
	}
};

//
// Sample class
//

function Sample(name, id) {
	this.name = name;
	this.canon_name = canon_name(name);
	this.id = id;
	this.annots = {};
	this.refcnt = 1;
	this.groups = {};
}

Sample.prototype = {
	name: "",
	canon_name: "",
	annots: {},
	groups: {},

	isGroup: function() {
		return false;
	},

	isSample: function() {
		return true;
	},

	addAnnotValue: function(annot_name, value) {
		this.annots[annot_name] = value;
	},

	clearGroups: function() {
		this.groups = {}; // or clear the map ?
	},

	addGroup: function(group) {
		this.groups[group.name] = group;
	},

	getGroup: function(group_name) {
		return this.groups[group_name];
	},

	getId: function() {
		return this.id;
	},

	getName: function() {
		return this.name;
	},

	getCanonName: function() {
		return this.canon_name;
	},

	hasAnnots: function() {
		return mapSize(this.annots);
	},

	getClass: function() {return "Sample";}
};

//
// Gene class
//

function Gene(name, hugo_module_map, id) {
	this.name = name;
	this.hugo_module_map = hugo_module_map;
	this.refcnt = 1;
	this.id = id;
	this.shape_ids = {};
}

Gene.prototype = {
	name: "",
	hugo_module_map: {},

	getId: function() {
		return this.id;
	},

	addShapeId: function(module, shape_id) {
		if (!this.shape_ids[module]) {
			this.shape_ids[module] = {};
		}
		this.shape_ids[module][shape_id] = true;
	},

	getShapeIds: function(module) {
		var shape_ids = this.shape_ids[module];
		if (!shape_ids) {
			return {};
		}
		return shape_ids;
	},

	getClass: function() {return "Gene";}
};

//
// Group class
//

function Group(annots, values, id) {
	this.annots = annots;
	this.values = values;
	this.samples = {};
	this.id = id;
	this.name = navicell.group_factory.buildName(annots, values);
	this.canon_name = canon_name(this.name);
	this.methods = navicell.group_factory.getSavedMethods(this.name);
	this.html_name = "";
	for (var nn = 0; nn < annots.length; ++nn) {
		this.html_name += (this.html_name.length > 0 ? "<br>" : "") + '<span class="group_name">' + annots[nn].replace(/ /g, '&nbsp;') + ':</span>&nbsp;<span class="group_value">' + values[nn].replace(/ /g, '&nbsp;')  + '</span>';
	}

	// must complete cache to other methods: median, max abs value etc.
	this.gene_average = {};
	this.gene_abs_average = {};
	this.gene_median = {};
	this.gene_median = {};
	this.gene_minval = {};
	this.gene_maxval = {};
	this.gene_abs_minval = {};
	this.gene_abs_maxval = {};

	this.modif_average = {};
	this.modif_abs_average = {};
	this.modif_median = {};
	this.modif_minval = {};
	this.modif_maxval = {};
	this.modif_abs_minval = {};
	this.modif_abs_maxval = {};
}

Group.CONTINUOUS_AVERAGE = "1";
Group.CONTINUOUS_MEDIAN = "2";
Group.CONTINUOUS_MINVAL = "3";
Group.CONTINUOUS_MAXVAL = "4";
Group.CONTINUOUS_ABS_AVERAGE = "5";
Group.CONTINUOUS_ABS_MINVAL = "6";
Group.CONTINUOUS_ABS_MAXVAL = "7";

Group.DISCRETE_IGNORE = 0;
Group.DISCRETE_EQ_0 = 1;
Group.DISCRETE_GT_0 = 2;
Group.DISCRETE_EQ_ALL = 3;
Group.DISCRETE_VALUE = 4;

Group.prototype = {
	annots: [],
	values: [],
	samples: {},
	name: "",
	canon_name: "",
	html_name: "",

	isGroup: function() {
		return true;
	},

	isSample: function() {
		return false;
	},

	addSample: function(sample) {
		this.samples[sample.name] = sample;
	},

	getId: function() {
		return this.id;
	},

	getName: function() {
		return this.name;
	},

	getCanonName: function() {
		return this.canon_name;
	},

	acceptCondition: function(module, datatable, gene_name, modif_id, cond_value, cond) {
		if (cond == Group.DISCRETE_IGNORE) {
			return false;
		}
		var eq_cnt = 0;
		for (var sample_name in this.samples) {
			var value = modif_id ? datatable.getValueByModifId(module, sample_name, modif_id, Group.DISCRETE_VALUE) : datatable.getValue(sample_name, gene_name);
			var eq = (cond_value == value);
			if (eq) {
				//console.log("equals == [" + value + "] [" + cond_value + "] " + modif_id + " ?");
				if (cond == Group.DISCRETE_EQ_0) {
					return false;
				}
				if (cond == Group.DISCRETE_GT_0) {
					return true;
				}
				eq_cnt++;
			}
		}

		if (cond == Group.DISCRETE_EQ_0) {
			return eq_cnt == 0;
		}
		if (cond == Group.DISCRETE_GT_0) {
			return eq_cnt > 0;
		}
		if (cond == Group.DISCRETE_EQ_ALL) {
			return eq_cnt == this.samples.length;
		}
		if (cond == Group.DISCRETE_NEQ_ALL) {
			return eq_cnt != this.samples.length;
		}
		return false;
	},

	getCacheValue: function(datatable, gene_cache_arr, gene_name, modif_cache_arr, modif_id) {
		if (gene_name) {
			if (!gene_cache_arr[datatable.id]) {
				gene_cache_arr[datatable.id] = {};
				no_cache_value_cnt++;
				return undefined;
			}
			if (gene_cache_arr[datatable.id][gene_name] != undefined) {
				cache_value_cnt++;
				return gene_cache_arr[datatable.id][gene_name];
			}
		} else {
			if (!modif_cache_arr[datatable.id]) {
				modif_cache_arr[datatable.id] = {};
				no_cache_value_cnt++;
				return undefined;
			}
			if (modif_cache_arr[datatable.id][modif_id] != undefined) {
				cache_value_cnt++;
				return modif_cache_arr[datatable.id][modif_id];
			}
		}
		no_cache_value_cnt++;
		return undefined;
	},

	setCacheValue: function(datatable, gene_cache_arr, gene_name, modif_cache_arr, modif_id, value) {
		if (gene_name) {
			gene_cache_arr[datatable.id][gene_name] = value;
		} else {
			modif_cache_arr[datatable.id][modif_id] = value;
		}
		return value;
	},

	getValue: function(module, datatable, gene_name, modif_id, method) {
		if (!method) {
			method = this.getMethod(datatable);
		}
		if (datatable.biotype.isContinuous() || datatable.biotype.isOrderedDiscrete()) {
			if (method == Group.CONTINUOUS_MEDIAN) {
				var values = [];
				for (var sample_name in this.samples) {
					//var value = datatable.getValue(sample_name, gene_name);
					var value = modif_id ? datatable.getValueByModifId(module, sample_name, modif_id) : datatable.getValue(sample_name, gene_name);
					if (value == undefined || value.toString() == '') {
						continue;
					}
					if (!is_number(value)) {
						continue;
					}
					value *= 1.;
					values.push(value);
				}
				var len = values.length;
				if (len == 0) {
					return undefined;
				}
				values.sort(cmp=function(x, y) {return x-y;});
				var len2 = Math.floor(len/2);
				if (len == 1 || 0 == (len & 1)) {
					return values[len2];
				}
				return (values[len2-1]+values[len2])/2;
				
			}
			if (method == Group.CONTINUOUS_AVERAGE || method == Group.CONTINUOUS_ABS_AVERAGE) {
				var retval;
				if (method == Group.CONTINOUS_AVERAGE) {
					retval = this.getCacheValue(datatable, this.gene_average, gene_name, this.modif_average, modif_id);
					if (retval != undefined && retval.toString() != '') {
						return retval;
					}
				} else {
					retval = this.getCacheValue(datatable, this.gene_abs_average, gene_name, this.modif_abs_average, modif_id);
					if (retval != undefined && retval.toString() != '') {
						return retval;
					}
				}
				// could use a cache:
				// this.average[datatable.id][gene_name]
				// this.abs_average[datatable.id][gene_name]
				// etc.
				var total_value = 0.;
				var total_absvalue = 0.;
				var cnt = 0.;
				for (var sample_name in this.samples) {
					//var value = datatable.getValue(sample_name, gene_name);
					var value = modif_id ? datatable.getValueByModifId(module, sample_name, modif_id) : datatable.getValue(sample_name, gene_name);
					if (value == undefined || value.toString() == '') {
						//console.log("NO value for " + sample_name + " " + modif_id);
						continue;
					}
					if (!is_number(value)) {
						continue;
					}
					value *= 1.;
					var absvalue = Math.abs(value);
					total_value += value;
					total_absvalue += absvalue;
					cnt++;
				}
				if (cnt) {
					var retval = (method == Group.CONTINUOUS_AVERAGE ? total_value/cnt : total_absvalue/cnt);
					//console.log("retval " + retval + " " + total_value + " " + total_absvalue + " " + cnt);
					if (method == Group.CONTINOUS_AVERAGE) {
						return this.setCacheValue(datatable, this.gene_average, gene_name, this.modif_average, modif_id, retval);
					}
					return this.setCacheValue(datatable, this.gene_abs_average, gene_name, this.modif_abs_average, modif_id, retval);
				}
				//console.log("UNDEFINED for " + this.canon_name);
				return undefined;
			}
			if (method == Group.CONTINUOUS_MINVAL || method == Group.CONTINUOUS_MAXVAL || method == Group.CONTINUOUS_ABS_MINVAL || method == Group.CONTINUOUS_ABS_MAXVAL) {
				var min = Number.MAX_NUMBER;
				var max = Number.MIN_NUMBER;
				var absmin = Number.MAX_NUMBER;
				var absmax = Number.MIN_NUMBER;
				var min_set = false;
				var max_set = false;
				var absmin_set = false;
				var absmax_set = false;
				for (var sample_name in this.samples) {
					//var value = datatable.getValue(sample_name, gene_name);
					var value = modif_id ? datatable.getValueByModifId(module, sample_name, modif_id) : datatable.getValue(sample_name, gene_name);
					if (value == undefined || value.toString() == '') {
						continue;
					}
					if (!is_number(value)) {
						continue;
					}
					value *= 1.;
					var absvalue = Math.abs(value);
					if (value < min) {
						min = value;
						min_set = true;
					}
					if (value > max) {
						max = value;
						max_set = true;
					}
					if (absvalue < absmin) {
						absmin = absvalue;
						absmin_set = true;
					}
					if (absvalue > absmax) {
						absmax = absvalue;
						absmax_set = true;
					}
				}
				if (method == Group.CONTINUOUS_MINVAL) {
					return min_set ? min : undefined;
				}
				if (method == Group.CONTINUOUS_MAXVAL) {
					return max_set ? max : undefined;
				}
				if (method == Group.CONTINUOUS_ABS_MINVAL) {
					return absmin_set ? absmin : undefined;
				}
				if (method == Group.CONTINUOUS_ABS_MAXVAL) {
					return absmax_set ? absmax : undefined;
				}
				return undefined;
			}
			return undefined;
		}
		var method_len = method.length;
		var method_value = method.substring(0, method_len-1);
		var mod = method.substring(method_len-1, method_len);
		var all = mod == '@';
		var not = mod == '-';
		var value_cnt = 0;
		var sample_cnt = 0;
		for (var sample_name in this.samples) {
			//var value = datatable.getValue(sample_name, gene_name);
			var value = modif_id ? datatable.getValueByModifId(module, sample_name, modif_id) : datatable.getValue(sample_name, gene_name);
			if (value == method_value) {
				value_cnt++;
			}
			sample_cnt++;
		}

		if (not) {
			return sample_cnt != value_cnt;
		}
		if ((value_cnt > 0 && !all) || sample_cnt == value_cnt) {
			return method_value;
		}
		return undefined;
	},

	getClass: function() {return "Group";}
};


//
// GroupFactory class
//

function GroupFactory() {
	this.group_id = 1;
	this.saved_methods = {};
}

GroupFactory.prototype = {
	group_map: {},
	group_canon_map: {},
	group_id_map: {},

	buildName: function(group_annots, group_values) {
		var str = "";
		for (var nn = 0; nn < group_annots.length; ++nn) {
			str += (str.length > 0 ? "; " : "") + group_annots[nn] + ": " + group_values[nn];
		}
		return str;
	},

	addGroup: function(group_annots, group_values) {
		var group_name = this.buildName(group_annots, group_values);
		if (!this.group_map[group_name]) {
			var group = new Group(group_annots, group_values, this.group_id++);
			this.group_map[group_name] = group;
			this.group_canon_map[group.getCanonName()] = group;
			this.group_id_map[group.getId()] = group;
		}
		return this.group_map[group_name];
	},

	getGroup: function(group_annots, group_values) {
		var group_name = this.buildName(group_annots, group_values);
		return this.group_map[group_name];
	},

	getGroupById: function(group_id) {
		return this.group_id_map[group_id];
	},

	getGroupByCanonName: function(group_canon_name) {
		return this.group_canon_map[group_canon_name];
	},

	getId: function() {
		return this.id;
	},

	getSavedMethods: function(group_name) {
		var methods = this.saved_methods[group_name];
		return methods ? methods : {};
	},

	buildGroups: function() {
		this.saved_methods = {};
		for (var group_name in this.group_map) {
			var group = this.group_map[group_name];
			this.saved_methods[group_name] = group.methods;
		}
		this.group_map = {};
		for (var sample_name in navicell.dataset.samples) {
			var sample = navicell.dataset.samples[sample_name];
			sample.clearGroups();
			var annot_arr = [];
			for (var annot_name in sample.annots) {
				annot_arr.push(navicell.annot_factory.annots_per_name[annot_name]);
			}
			if (annot_arr.length) {
				var annot_len = annot_arr.length;
				var group_annots = [];
				var group_values = [];
				for (var nn = 0; nn < annot_len; ++nn) {
					var annot = annot_arr[nn];
					if (annot.is_group) {
						group_annots.push(annot.name);
						group_values.push(sample.annots[annot.name]);
					}
				}
				
				if (group_annots.length) {
					var group = this.addGroup(group_annots, group_values);
					sample.addGroup(group);
					group.addSample(sample);
				}
			}
		}
	},

	getClass: function() {return "GroupFactory";}
};

function BiotypeType(type, subtype) {
	this.type = type;
	this.subtype = subtype;
}

BiotypeType.prototype = {

	isExpression: function() {
		return this.type == navicell.EXPRESSION;
	},

	isCopyNumber: function() {
		return this.type == navicell.COPYNUMBER;
	},

	isMutation: function() {
		return this.type == navicell.MUTATION;
	},

	isGeneList: function() {
		return this.type == navicell.GENELIST;
	},
	
	isContinuous: function() {
		return this.subtype == navicell.CONTINUOUS;
	},

	isOrderedDiscrete: function() {
		return this.subtype == navicell.ORDERED_DISCRETE;
	},

	isUnorderedDiscrete: function() {
		return this.subtype == navicell.UNORDERED_DISCRETE;
	},

	isSet: function() {
		return this.subtype == navicell.SET;
	},

	getTypeString: function() {
		switch(this.type) {
		case navicell.EXPRESSION:
			return "EXPRESSION"
		case navicell.COPYNUMBER:
			return "COPYNUMBER";
		case navicell.MUTATION:
			return"MUTATION";
		case navicell.GENELIST:
			return "GENELIST";
		default:
			return "<UNKNOWN>";
		}
	},

	getSubtypeString: function() {
		switch(this.subtype) {
		case navicell.CONTINUOUS:
			return "CONTINUOUS";
		case navicell.ORDERED_DISCRETE:
			return "ORDERED_DISCRETE";
		case navicell.UNORDERED_DISCRETE:
			return "UNORDERED_DISCRETE";
		case navicell.SET:
			return "SET";
		default:
			return "<UNKNOWN>";
		}
	},


};

function Biotype(name, type) {
	this.name = name;
	this.type = type; // BiotypeType
}

Biotype.prototype = {
	name: "",
	type: null,

	isContinuous: function() {
		return this.type.isContinuous();
	},

	isUnorderedDiscrete: function() {
		return this.type.isUnorderedDiscrete();
	},

	isOrderedDiscrete: function() {
		return this.type.isOrderedDiscrete();
	},

	isSet: function() {
		return this.type.isSet();
	}
};

function BiotypeFactory() {
	this.biotypes = {};
}

BiotypeFactory.prototype = {
	biotypes: {},

	getBiotypes: function() {
		return this.biotypes;
	},

	addBiotype: function(biotype) {
		this.biotypes[biotype.name] = biotype;
	},

	getBiotype: function(biotype_name) {
		biotype_name = biotype_name.trim();
		var biotype = this.biotypes[biotype_name];
		if (biotype) {
			return biotype;
		}
		// approximative search: case insensitive + suppress separators + substring
		var biotype_name_mod = biotype_name.toUpperCase().replace(SEP_REGEX, "");
		var biotype_name_len = biotype_name_mod.length;
		for (var bname in this.biotypes) {
			var bname_mod = bname.toUpperCase().replace(SEP_REGEX, "");
			var bname_len = bname_mod.length;
			if (biotype_name_len == bname_len) {
				if (bname_mod == biotype_name_mod) {
					return this.biotypes[bname];
				}
			} else if (biotype_name_len < bname_len) {
				if (bname_mod.substring(0, biotype_name_len) == biotype_name_mod) {
					return this.biotypes[bname];
				}
			} else if (biotype_name_len > bname_len) {
				if (biotype_name_mod.substring(0, bname_len) == bname_mod) {
					return this.biotypes[bname];
				}
			}
		}
		return null;
	}
};

//
// Session class
//

function MapTypes(map, has_nobg) {
	this.map = map;
	this.maptypes = {};
	this.has_nobg = has_nobg;
}

MapTypes.prototype = {
	getMapTypeInfo: function() {
		if (this.has_nobg) {
			return {"navicell" : "", "navicell_nobg" : "_nobg"};
		}
		return {"navicell" : ""};
	},

	setMapTypeByMapStaining: function(map_staining) {
		if (map_staining && this.has_nobg) {
			this.setMapType("navicell_nobg");
		} else {
			this.setMapType("navicell");
		}
	},

	setDefaultMapType: function() {
		this.setMapType("navicell");
	},

	setMapType: function(id) {
		var map_type = this.maptypes[id];
		if (map_type) {
			this.tile_suffix = this.getMapTypeInfo()[id];
			this.map.setMapTypeId(id);
		}
	},

	set: function(id, map_type) {
		this.map.mapTypes.set(id, map_type);
		this.maptypes[id] = map_type;
	}
};

if (typeof Storage != 'undefined') {
	function Session(name) {
		this.name = name;
	}

	Storage.prototype.setObject = function(key, value) {
		this.setItem(key, JSON.stringify(value));
	}

	Storage.prototype.getObject = function(key) {
		var value = this.getItem(key);
		return value && JSON.parse(value);
	}

	Session.prototype = {
		name: "",
		data: null,

		setData: function(data) {
			//jQuery.localStorage(this.name, data);
			localStorage.setObject(this.name, data);
		},

		getData: function() {
			//return jQuery.localStorage(this.name);
			return localStorage.getObject(this.name);
		},

		exists: function() {
			//return jQuery.localStorage(this.name) !== null;
			return localStorage.getObject(this.name) !== null;
		}
		
	};

	function NavicellSession(name) {
		this.session = new Session(name);
	}

	NavicellSession.prototype = {

		reset: function() {
			this.session.setData(null);
		},

		read: function() {
			navicell = this.session.getData();
		},

		write: function() {
			this.session.setData(navicell);
		},

		init: function() {
			var _navicell = this.session.getData();
			if (_navicell) {
				_navicell.dataset.geneCount = Dataset.prototype.geneCount;
				return _navicell;
			}
			return navicell_init();
		}
	}

}

//var navicell_session = new NavicellSession("navicell");
//navicell_session.reset();

var SIMPLIFY_TYPES = 1;
function navicell_init() {
	var _navicell = {}; // namespace

	_navicell.module_names = [];
	_navicell.dataset = new Dataset("navicell");
	_navicell.group_factory = new GroupFactory();
	_navicell.biotype_factory = new BiotypeFactory();
	_navicell.annot_factory = new AnnotationFactory();
	_navicell._drawing_config = {};
	_navicell.module_init = {};
	_navicell.mapTypes = {};

	_navicell.import_synchronizer = new ImportSynchronizer();
	_navicell.EXPRESSION = 1;
	_navicell.COPYNUMBER = 2;
	_navicell.MUTATION = 3;
	_navicell.GENELIST = 4;

	_navicell.CONTINUOUS = 10;
	_navicell.UNORDERED_DISCRETE = 20;
	_navicell.ORDERED_DISCRETE = 30;
	_navicell.SET = 40;

	if (SIMPLIFY_TYPES) {
		var biotypeExpr = new BiotypeType(_navicell.EXPRESSION, _navicell.CONTINUOUS);
		_navicell.biotype_factory.addBiotype(new Biotype("mRNA expression data", biotypeExpr));
		_navicell.biotype_factory.addBiotype(new Biotype("microRNA expression data", biotypeExpr));
		_navicell.biotype_factory.addBiotype(new Biotype("Protein expression data", biotypeExpr));
		_navicell.biotype_factory.addBiotype(new Biotype("Discrete Copy number data", new BiotypeType(_navicell.COPYNUMBER, _navicell.ORDERED_DISCRETE)));
		_navicell.biotype_factory.addBiotype(new Biotype("Continuous copy number data", new BiotypeType(_navicell.COPYNUMBER, _navicell.CONTINUOUS)));
		_navicell.biotype_factory.addBiotype(new Biotype("Mutation data", new BiotypeType(_navicell.MUTATION, _navicell.UNORDERED_DISCRETE)));
		_navicell.biotype_factory.addBiotype(new Biotype("Gene list",  new BiotypeType(_navicell.GENELIST, _navicell.SET)));
	} else {
		_navicell.biotype_factory.addBiotype(new Biotype("mRNA expression data", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("microRNA expression data", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("Protein expression data", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("Copy number data", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("Epigenic data: methylation profiles", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("Epigenic data: histone modifications", _navicell.CONTINUOUS));
		_navicell.biotype_factory.addBiotype(new Biotype("Polymorphism data: SNPs", _navicell.DISCRETE));
		_navicell.biotype_factory.addBiotype(new Biotype("Mutation data", _navicell.DISCRETE));
		// disconnected for now:
		// _navicell.biotype_factory.addBiotype(new Biotype("Interaction data", _navicell.SET));
		//_navicell.biotype_factory.addBiotype(new Biotype("Set data", _navicell.SET));
	}
	_navicell.getDatatableById = function(id) {
		return this.dataset.getDatatableById(id);
	}

	_navicell.getDatatableByCanonName = function(canon_name) {
		return this.dataset.getDatatableByCanonName(canon_name);
	}

	_navicell.isModuleInit = function(module) {
		return _navicell.module_init[module];
	},

	_navicell.setModuleInit = function(module) {
		_navicell.module_init[module] = 1;
	},

	_navicell.syncWindows = function() {
		var size = 0;
		for (var map_name in maps) {
			if (map_name.search(":") >= 0) {
				size++;
			}
		}
		var beforeunload = size > 1;
		var todel = [];
		for (var map_name in maps) {
			if (map_name.search(":") < 0) {
				continue;
			}
			var win = maps[map_name].document.win;
			if (beforeunload) {
				$(win).bind("beforeunload", function(e) { 
					return "Warning: closing " + map_name + " tab will make NaviCell instable";
				});
				console.log("unload should reset session");
				$(win).unload(function() {
					delete maps[win.document.map_name];
					_navicell.syncWindows();
					nv_reset_session(win);
				});
			} else {
				$(win).unbind("beforeunload");
				console.log("unload should reset session");
				$(win).unload(function() {
					nv_reset_session(win);
				});
			}
		}
	},

	_navicell.declareWindow = function(win) {
		var dataset = _navicell.dataset;
		var module = get_module(win);
		for (var datatable_name in dataset.datatables) {
			dataset.datatables[datatable_name].declareWindow(win);
		}
		_navicell._drawing_config[module] = new DrawingConfig(win);
		_navicell.syncWindows();
	},
	
	_navicell.getDrawingConfig = function(module) {
		return _navicell._drawing_config[module];
	},

	_navicell.addMapTypes = function(map_name, mapTypes) {
		_navicell.mapTypes[map_name] = mapTypes;
		return mapTypes;
	},

	_navicell.getMapTypes = function(map_name) {
		return _navicell.mapTypes[map_name];
	},

	_navicell.shapes = ["Triangle", "Square", "Rectangle", "Diamond", "Hexagon", "Circle"];

	return _navicell;
}

function jquery_to_dom(obj) {
	var dom_objs = [];
	for (var nn = 0; nn < obj.length; nn++) {
		dom_objs.push(obj.get(nn));
	}
	return dom_objs;
}

/*
function jquery_to_dom_r(dom_objs, obj) {
	if (obj.childNodes.length == 0) {
		dom_objs.push(obj);
	} else {
		for (var jj = 0; jj < obj.childNodes.length; ++jj) {
			var child = obj.childNodes[jj];
			dom_objs.push(child);
			jquery_to_dom_r(dom_objs, child);
		}
	}
}

function jquery_to_dom(obj) {
	var dom_objs = [];
	for (var nn = 0; nn < obj.length; nn++) {
		var o = obj.get(nn);
		jquery_to_dom_r(dom_objs, o);
	}
	return dom_objs;
}
*/

function stddev(f) {
	var x = 0;
	var x2 = 0;
	for (var i=0; i < f.length; i++){
		x += f[i];
		x2 += f[i]*f[i];
	}
	x /= f.length;
	x2 /= f.length;
	return Math.sqrt((x2-x*x)*f.length/(f.length-1));
}

function getPositiveThreshold(numbers, avg) {
	var thresh = 1;
	var positives = [];
	for (var i=0; i < numbers.length; i++) {
		var num = parseFloat(numbers[i]);
		if (!isNaN(num)) {
			if (num > avg) {
				positives.push(num);
			}
		}
	}

	return avg + stddev(positives);
}	

function getNegativeThreshold(numbers, avg) {
	var thresh = 1;
	var negatives = [];
	for (var i=0; i < numbers.length; i++) {
		var num = parseFloat(numbers[i]);
		if (!isNaN(num)) {
			if (num < avg) {
				negatives.push(num);
			}
		}
	}
	return avg - stddev(negatives);
}
	
function getFG_from_BG(color) {
	var rgb1 = color.substring(0, 2);
	var rgb2 = color.substring(2, 4);
	var rgb3 = color.substring(4, 6);
	rgb1 = parseInt("0x" + rgb1)/256.;
	rgb2 = parseInt("0x" + rgb2)/256.;
	rgb3 = parseInt("0x" + rgb3)/256.;
	return 0.213 * rgb1 + 0.715 * rgb2 + 0.072 * rgb3 < 0.5 ? 'FFF' : '000';
}

function build_entity_tree_when_ready(win, div_name, projection, whenloaded) {
	navicell.mapdata.buildEntityTreeWhenReady(win, div_name, projection, whenloaded);
}

var navicell;

if (typeof navicell == 'undefined') {
	navicell = navicell_init();
}

// .....................................................
// unit test
// .....................................................

/*
console.log("mapdata class: " + mapdata.getClass());

var group1 = group_factory.getGroup(new Annotation("Metrics"), "M");
var group2 = group_factory.getGroup(new Annotation("Metrics"), "normal");
var group3 = group_factory.getGroup(new Annotation("Metrics"), "M");

console.log("group1: " + group1.name);
console.log("group2: " + group2.name);
console.log("group3: " + group3.name);

console.log("group1vs2: " + (group1 == group2));
console.log("group1vs3: " + (group1 == group3));
*/
