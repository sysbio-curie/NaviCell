/**
 * Eric Viara & Stuart Pook, $Id: clickmap_map.js 26694 2015-03-31 10:23:06Z eviara $
 *
 * Copyright (C) 2011-2012 Curie Institute, 26 rue d'Ulm, 75005 Paris, France
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

var filter = ".navicell";
var old_marker_mode = "1";

var medium_icon;
var small_icon;
var big_icon;
var use_jxtree;

var ICON_SMALL_W = 0.32;
var ICON_SMALL_H = 14;
var ICON_SMALL_ANCHOR_X = 4;
var ICON_SMALL_ANCHOR_Y = 14;

var ICON_MEDIUM_W = 0.5;
var ICON_MEDIUM_H = 34;
var ICON_MEDIUM_ANCHOR_X = 10;
var ICON_MEDIUM_ANCHOR_Y = 34;

var ICON_BIG_W = 0.75;
var ICON_BIG_H = 68;
var ICON_BIG_ANCHOR_X = 20;
var ICON_BIG_ANCHOR_Y = 68

var ICON_VBIG_W = 0.80;
var ICON_VBIG_H = 70;
var ICON_VBIG_ANCHOR_X = 20;
var ICON_VBIG_ANCHOR_Y = 68

var icon_map = {};

var bubble_list = [];

function CHECK_NO_JXTREE(fun) {
	if (use_jxtree) {
		console.log("the function \"" + fun + "\" should NOT be used with jxtree");
	}
}

function center_marker_position(map, marker_positions)
{
	if (marker_positions.length > 0) {
		map.setCenter(marker_positions[0]);
	}
}

function panMapToBounds(map, bounds)
{
	if (!bounds.isEmpty() && !map.getBounds().intersects(bounds)) {
		map.panToBounds(bounds);
	}
}

function setup_icons()
{
	var normal_marker_colour = "FE7569";	
	var new_marker_colour = "5555FF";
	
	function simple_icon(colour, scale, w, h, anchor_x, anchor_y)
	{
		var url = "http://chart.apis.google.com/chart?chst=d_map_spin&chld="
			+ scale // scale_factor
			+ "|0" // rotation_deg
			+ "|" + colour // fill_color
			+ "|20" // font_size
			+ "|_" // font_style Either '_' for normal text or 'b' for boldface text
			+ "|%E2%80%A2" // One or more lines of text, delimited by | characters
			;
		
		return new google.maps.MarkerImage(url);
	}

 	function custom_icon(url) {
		return new google.maps.MarkerImage(url);
	}

	// http://stackoverflow.com/questions/7095574/google-maps-api-3-custom-marker-color-for-default-dot-marker/7686977#7686977
	function make_icon(old_icon, new_icon) {
		old_icon.type = "normal";
		new_icon.type = "new";
		old_icon.new_icon = new_icon;
		old_icon.old_icon = old_icon;
		new_icon.new_icon = new_icon;
		new_icon.old_icon = old_icon;
		return old_icon;
	}

	function icon(w, h, anchor_x, anchor_y)
	{
		var old_icon = simple_icon("EEEEEE", w, h, anchor_x, anchor_y);
		var new_icon = simple_icon("5555FF", w, h, anchor_x, anchor_y);
		old_icon.type = "normal";
		new_icon.type = "new";
		old_icon.new_icon = new_icon;
		old_icon.old_icon = old_icon;
		new_icon.new_icon = new_icon;
		new_icon.old_icon = old_icon;
		return old_icon;
	}
	
	small_icon = icon(0.4, 17, 5, 17);	
	medium_icon = icon(0.5, 34, 10, 34);
	big_icon = icon(0.75, 68, 20, 68);	

	function colored_icon(rgb, w, h, anchor_x, anchor_y)
	{
		var new_icon = simple_icon(rgb, w, h, anchor_x, anchor_y);
		//var old_icon = simple_icon("EEEEEE", w, h, anchor_x, anchor_y);
		var old_icon = new_icon;
		return make_icon(old_icon, new_icon);
	}

	icon_map["PROTEIN"] = colored_icon("D8FACC", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["PROTEIN:INCLUDED"] = colored_icon("D8FACC", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["GENE"] = colored_icon("FFF86F", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["GENE:INCLUDED"] = colored_icon("FFF86F", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["RNA"] = colored_icon("66FF66", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["RNA:INCLUDED"] = colored_icon("66FF66", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["ANTISENSE_RNA"] = colored_icon("EC7470", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["ANTISENSE_RNA:INCLUDED"] = colored_icon("EC7470", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["SIMPLE_MOLECULE"] = colored_icon("DAF66B", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["SIMPLE_MOLECULE:INCLUDED"] = colored_icon("DAF66B", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["ION"] = colored_icon("94A2FC", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["ION:INCLUDED"] = colored_icon("94A2FC", ICON_SMALL_W, ICON_SMALL_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);

	icon_map["DRUG"] = colored_icon("E55FFF", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["DRUG:INCLUDED"] = colored_icon("E55FFF", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["PHENOTYPE"] = colored_icon("C0A5FE", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["PHENOTYPE:INCLUDED"] = colored_icon("C0A5FE", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["UNKNOWN"] = colored_icon("E55FFF", ICON_MEDIUM_W, ICON_MEDIUM_H, ICON_MEDIUM_ANCHOR_X, ICON_MEDIUM_ANCHOR_Y);
	icon_map["UNKNOWN:INCLUDED"] = colored_icon("E55FFF", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["REACTION"] = colored_icon("00AA00", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);
	icon_map["REACTION:INCLUDED"] = colored_icon("00AA00", ICON_SMALL_W, ICON_SMALL_H, ICON_SMALL_ANCHOR_X, ICON_SMALL_ANCHOR_Y);

	icon_map["MODULE"] = colored_icon("5555FF", ICON_BIG_W, ICON_BIG_H, ICON_BIG_ANCHOR_X, ICON_BIG_ANCHOR_Y);

	var complex_icon = custom_icon("../../../map_icons/entity/ACSN_complex_marker_small.png");
	icon_map["COMPLEX"] = make_icon(complex_icon, complex_icon);
}

function get_icon(cls) {
	if (icon_map[cls]) {
		return icon_map[cls];
	}
	return medium_icon;
}

function make_marker_visible(marker)
{
	if (!navicell.drawing_config || navicell.drawing_config.displayMarkers()) {
		if (!use_jxtree) {
			marker.setIcon(marker.getIcon().new_icon);
		}
		marker.setVisible(true);
		//marker.setAnimation(google.maps.Animation.DROP);
		marker.type = "new";
		new_markers.push(marker);
	}
}

function hide_old_markers()
{
	for (var nn = 0; nn < marker_list.length; ++nn) {
		var marker = marker_list[nn];
		if (marker.type == "old") {
			marker.setVisible(false);
		}
	}
}

function hide_all_markers()
{
	for (var nn = 0; nn < marker_list.length; ++nn) {
		var marker = marker_list[nn];
		marker.setVisible(false);
	}
}

function set_old_markers_color(val)
{
	for (var nn = 0; nn < marker_list.length; ++nn) {
		var marker = marker_list[nn];
		if (marker.type == "old") {
			marker.setIcon(val ? marker.getIcon().old_icon : marker.getIcon().new_icon);
		}
	}
}

function make_new_markers_old()
{
	var keep = !navicell.drawing_config || navicell.drawing_config.displayOldMarkers();
	var diffcol = !navicell.drawing_config || navicell.drawing_config.displayOldMarkersWithDifferentColor();
	while (new_markers.length != 0)
	{
		var i = new_markers.pop();
		i.type = "old";
		if (!keep) {
			i.setVisible(false);
		} else if (diffcol) {
			i.setIcon(i.getIcon().old_icon);
		}
	}
}

// http://www.contentwithstyle.co.uk/content/make-sure-that-firebug-console-debug-doesnt-break-everything/index.html
if (!window.console) {
	window.console = new function()
	{
		this.log = function(str) {};
		this.dir = function(str) {};
	};
}

function extend(bounds, marker)
{
	var marker_width = 20; // should calculate this from the shape
	var marker_height = 33; // should calculate this from the shape
	
	var map = marker.getMap();
	var scale = 1 << map.getZoom();
	var xoffset = marker_width / 2 / scale
	var proj = map.getProjection();
	if (typeof proj !== 'undefined')
	{
		var point = proj.fromLatLngToPoint(marker.getPosition());
		var height_in_world_coords = marker_height / scale;
		bounds.extend(proj.fromPointToLatLng(new google.maps.Point(point.x - xoffset, point.y - height_in_world_coords)));
		bounds.extend(proj.fromPointToLatLng(new google.maps.Point(point.x + xoffset, point.y)));
	}
}

var check_node_inhibit = false;

function show_markers_ref(markers, ref)
{
	if (use_jxtree) {
		var jxtree = navicell.mapdata.getJXTree(window.document.navicell_module_name);
		$.each(markers, function() {
			var id = this;
			var node = jxtree.getNodeByUserId(id);
			if (node) {
				node.checkSubtree(JXTree.CHECKED);
				node.openSupertree(JXTree.OPEN);
			}
		});
		return;
	}

	var o_check_node_inhibit = check_node_inhibit;
	check_node_inhibit = true;
	make_new_markers_old();
	if (overlay) {
		overlay.reset();
	}
	var bounds = new google.maps.LatLngBounds();
	$.each
	(
		markers,
		function (key, id)
		{
			var elements = $("li#" + id + filter);
			elements.each
			(
				function ()
				{
					get_markers_for_modification(this, projection, map);
					if (navicell.dataset) {
						var gene_info = navicell.dataset.getGeneInfoByModifId(window.document.navicell_module_name, this.id);
						if (gene_info) {
							array_push_all(overlay.arrpos, gene_info[1]);
						}
					}
					if (this.markers) {
						this.markers.forEach
						(
							function(i)
							{
								i.setVisible(false);
								extend(bounds, i);
							}
						);
						this.markers.forEach(make_marker_visible);
						ref.check_node(this);
						if (this.peers) {
							this.peers.each
							(
								function(i)
								{
									ref.check_node(this);
								}
							);
						}
					}
				}
			);
		}
	);
	panMapToBounds(map, bounds);
	if (overlay) {
		overlay.draw(window.document.navicell_module_name);
	}
	check_node_inhibit = o_check_node_inhibit;
}

function show_markers(markers)
{
	if (!use_jxtree) {
		var ref = jQuery.jstree._reference(jtree);
		show_markers_ref(markers, ref);
	}
}

function jstree_uncheck_all()
{
	// never reached
	CHECK_NO_JXTREE("jstree_uncheck_all");
	hide_all_markers();
	jtree.jstree("uncheck_all");
	overlay.reset();
	overlay.draw(window.document.navicell_module_name);
}

function clickmap_refresh(partial)
{
	if (partial) {
		if (navicell.drawing_config && !navicell.drawing_config.displayMarkers()) {
			hide_all_markers();
		} else {
			refresh_old_markers();
		}

		overlay.reset();
		var cnt = 0;
		for (var element_id in checked_elements) {
			if (checked_elements[element_id]) {
				var gene_info = navicell.dataset.getGeneInfoByModifId(window.document.navicell_module_name, element_id);
				if (gene_info) {
					array_push_all(overlay.arrpos, gene_info[1]);
				}
				cnt++;
			}
		}
		overlay.draw(window.document.navicell_module_name);
		return;
	}
	
	for (var nn = 0; nn < marker_list.length; ++nn) {
		var marker = marker_list[nn];
		marker.keep_old = marker.type == "old";
	}

	if (!use_jxtree) {
		refreshing = true;
		var undets = $(".jstree-undetermined");
		var objs = jquery_to_dom($(".jstree-checked"));

		jtree.jstree("uncheck_node", objs);
		jtree.jstree("check_node", objs);


		for (var nn = 0; nn < marker_list.length; ++nn) {
			var marker = marker_list[nn];
			if (marker.keep_old) {
				marker.type = "old";
			} else {
				new_markers.push(marker);
			}
		}

		refresh_old_markers();

		refreshing = false;
		undets.addClass("jstree-undetermined");
	}
}

function set_old_marker_mode(val) {
	old_marker_mode = val;
}

function refresh_old_markers() {
	if (old_marker_mode == "0") {
		hide_old_markers();
	} else if (old_marker_mode == "1") {
		set_old_markers_color(true);
	} else if (old_marker_mode == "2") {
		set_old_markers_color(false);
	}
}

function start_map(map_name, map_elementId, min_zoom, max_zoom, tile_width, tile_height, width, height, xshift, yshift, has_nobg)
{
	var lat_ = 90;
	var lng_ = 180;
	lat_ = 50;
	lng_ = 50;
	function ClickMapProjection()
	{
		// http://code.google.com/apis/maps/documentation/javascript/examples/map-projection-simple.html
	};
	ClickMapProjection.prototype.fromPointToLatLng = function(point, noWrap) {
		var y = point.y;
		var x = point.x;
		var lng = -x / tile_width * (2 * lng_) + lng_;
		var lat = y / tile_height * (2 * lat_) - lat_;
		var r = new google.maps.LatLng(lat, lng, noWrap);
		return r;
	};
	ClickMapProjection.prototype.fromLatLngToPoint = function(latLng)
	{
		var x = -(latLng.lng() - lng_) / (2 * lng_) * tile_width;
		var y = (latLng.lat() + lat_) / (2 * lat_) * tile_height;
		var r = new google.maps.Point(x, y);
		return r;
	}
	
	var element = document.getElementById(map_elementId);

	map = new google.maps.Map(element, {
		copyright_owner: 'Institut Curie',
		center : new google.maps.LatLng(10, 10),
		disableDefaultUI: true,
		zoomControl: true,
		disableDoubleClickZoom: true,
		overviewMapControl: false, // disconnecting minimap
		overviewMapControlOptions :
		{
			opened: true
		},
		zoom : min_zoom,
		mapTypeId : "navicell"
	});

	map.setOptions({draggableCursor:'default', draggingCursor: 'move'});

	google.maps.event.addListener(map, 'zoom_changed', function() {
		nv_record_action(window, "nv_set_zoom", map.getZoom());
	});


	google.maps.event.addListener(map, 'center_changed', function() {
		var center = map.getCenter();
		nv_record_action(window, "nv_set_center", "ABSOLUTE", center.lng(), center.lat());
		if (!window.map_ori_center) {
			window.map_ori_center = map.getCenter();
		}
	});


	window.map = map;

	projection = new ClickMapProjection();

	var mapTypes = navicell.addMapTypes(map_name, new MapTypes(map, has_nobg));

	var map_type_info = mapTypes.getMapTypeInfo();
	for (var id in map_type_info) {
		var map_type = new google.maps.ImageMapType({
			getTileUrl: function(coord, zoom) {
				var ntiles = 1 << zoom;
				if (coord.y < 0 || coord.y >= ntiles)
					return null;
				if (coord.x < 0 || coord.x >= ntiles)
					return null;
			
				var r = coord.x + "_" + coord.y;
				return "tiles/" + zoom + "/" + r + navicell.getMapTypes(get_module()).tile_suffix + ".png";
			},
			tileSize : new google.maps.Size(tile_width, tile_height),
			maxZoom : max_zoom,
			minZoom : min_zoom
		});
	
		map_type.projection = projection;
		mapTypes.set(id, map_type);
	}
	
	mapTypes.setDefaultMapType();

	var bounds = new google.maps.LatLngBounds();
	bounds.extend(map_type.projection.fromPointToLatLng(new google.maps.Point(xshift + width, yshift + height)));
	bounds.extend(map_type.projection.fromPointToLatLng(new google.maps.Point(xshift, yshift)));
	map.fitBounds(bounds);

	window.map_ori_center = null;
	window.map_ori_bounds = bounds;

	return { map : map, projection : map_type.projection};
}

function get_markers_for_modification(element, projection, map)
{
	CHECK_NO_JXTREE("get_markers_for_modifications");

	if (element.markers == null)
	{
		var position = $(element).attr("position");
		if (position == null)
		{
			var cls = $(element).attr("class");
			var nid = /\bs\d+\b/.exec(cls);
			if (!nid) {
				nid = /\b[a-zA-Z0-9_]+_+s\d+\b/.exec(cls);
			}
			var selector = "li#" + nid;
			var idl = $(selector);
			idl.each
			(
				function ()
				{
					get_markers_for_modification(this, projection, map);
				}
			);
			element.id = nid; // EV 2013-08-27
		}
		else
		{
			var id = $(element).attr("id");
			var cls = $(element).parent().parent().attr("id");
			var css_cls = $(element).attr("class");
			var icon = medium_icon;
			if (cls == "REACTION") {
				icon = small_icon;
			} else if (cls == "modules" || /\bmodule\b/.test(css_cls)) {
				icon = big_icon;
			}

			element.markers = Array();
			var positions = position.split(" ");
			for (var index = 0; index < positions.length; index++)
			{
				var item = positions[index];
				var xy = item.split(";");
				var p = new google.maps.Point(xy[0], xy[1]);
				var name = jtree.jstree("get_text", element, "en");
				var marker = new google.maps.Marker
				(
						{
							position: projection.fromPointToLatLng(p),
							map: map,
							title: name + " (" + id + ")",
							visible: false,
							icon : icon
						}
				);
				marker_list.push(marker);
				google.maps.event.addListener
				(
					marker, 'click', function()
					{
						if (element.bubble == null)
						{
							var ln = jtree.jstree("get_text", element, "ln");
							element.bubble = new google.maps.InfoWindow
							(
								{
									content: ln,
									maxWidth: 350
								}
							);
							bubble_list.push(element.bubble);
						}
						element.bubble.open(map, marker);
					}
				);
				element.markers.push(marker);
			};
			element.peers = $("li." + id);
			element.peers.each
			(
				function()
				{
					var s = element.peers.not(this).add(element);
					this.peers = s;
					this.markers = element.markers;
				}
			);
			element.id = id; // EV 2013-08-27
		}
	}
	return element.markers;
}

// http://groups.google.com/group/jstree/browse_thread/thread/7ed7cd132d2c19b

$.expr[':'].jstree_contains_plusTitle = function (a, i, m)
{
	CHECK_NO_JXTREE("jstree...");
	var s = m[3].toLowerCase();
	// http://stackoverflow.com/questions/1018855/finding-elements-with-text-using-jquery
	var r = $(a).filter("a").parent().children().filter("a").filter(function(index) {
		return $(this).children().length == 2 && $(this).text().toLowerCase().match(s);
	});
	if (r.length != 0)
		return true;
	// normal jstree_contains search first (see jquery.jstree.js line 3403)
	if ((a.textContent || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0)
		return false;

	if ((a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0)
		return false;
		// custom search within title if nothing found
	if ((a.title || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0)
		return false;
	return false;
	
};

function start_right_hand_panel(selector, source, map, projection, whenloaded, firstEntityName)
{
	if (use_jxtree) {
		$(selector).html("<div id='loading-jxtree'><br/><br/><span class='loading-jstree-head-msg'>Loading all entities<br>(proteins, genes, RNAs...)</span><br/><br/>This action might take a few seconds when applied to the whole Atlas.<br/>If a pop-up message proposes you<br/>to kill or wait, choose wait.</div>");
		build_jxtree(selector, map, projection, whenloaded, firstEntityName);
	} else {
		build_jstree(selector, source, map, projection, whenloaded, firstEntityName);
	}
}

function build_jxtree(selector, map, projection, whenloaded, firstEntityName)
{
	var search_field = $('#query_text');
	var search_label = "\u2002Search (e.g. " + firstEntityName + ")\u00a0 /? for help";
	
	//http://stackoverflow.com/questions/699065/submitting-a-form-on-enter-with-jquery
	search_field.keypress(function(e) {
		if (e.which == 13) {
        		search_field.blur();
    			var val = $(this).val().trim();
			if (use_jxtree) {
				if (val[0] == '@' && val[1] == '!' && val[2] == '!') {
					$("#command-dialog").dialog("open");
				} else if (val[0] == '@' && val[1] == '!') { // for instance: @! nv_find_entities(window, "C.*")
					var cmd = val.substring(2);
					nv_decoder(cmd);
				} else if (val == '@nv2') {
					nv2();
				} else if (val == '@nv1') {
					nv1();
				} else {
					if (val != "/?") {
						$("#right_tabs", window.document).tabs("option", "active", 1);
					}
					if (window.overlay && window.overlay.hasHighlight()) {
						val += (val.indexOf(" /") >= 0 ? ";" : " /") + "highlight=on";
					}
					nv_perform('nv_find_entities', window, val);
				}
			}
			
		}
	});

	search_field.val(search_label);
	search_field.focus(function(e) {
		// http://drupal.org/node/154137
		if ($(this).val() == search_label)
		{
			$(this).val("");
		}
	});

	build_entity_tree_when_ready(window, selector, null, whenloaded);
}

function build_jstree(selector, source, map, projection, whenloaded, firstEntityName)
{
	CHECK_NO_JXTREE("build_jstree");
	
	var tree = $(selector);
	var search_field = $('#query_text');
	var search_label = "\u2002Search (e.g. " + firstEntityName + ")\u00a0";
	
	//http://stackoverflow.com/questions/699065/submitting-a-form-on-enter-with-jquery
	search_field.keypress(function(e) {
		if (e.which == 13) {
        		search_field.blur();
    			var t = $(this).val();
    			tree.jstree("search", t);
			
		}
	});
	search_field.val(search_label);
	search_field.focus(function(e) {
		// http://drupal.org/node/154137
		if ($(this).val() == search_label)
		{
			$(this).val("");
		}
	});

	jtree = tree
		.bind("loaded.jstree", whenloaded)
		.jstree({
			"themes" : {
				"theme" : "default",
				"dots" : false,
				"icons" : false
			},
			core : {
				strings : {
					loading: "<div><br/><br/><span class='loading-jstree-head-msg'>Loading all entities<br>(proteins, genes, RNAs...)</span><br/><br/>This action might take a few minutes<br/>when applied to the whole Atlas.<br/>If a pop-up message proposes you<br/>to kill or wait, choose wait.</div>"
				},
				"animation" : 200,
				"initially_open" : [ "entities" ]
			},
			"xml_data" : {
				"ajax" : {
					"url" : source
				},
				"xsl" : "nest"
			},
			"languages" : [ "en", "ln" ],
			"checkbox" :
			{
				"checked_parent_open" : false
			},
			"search" :
			{
				"search_method" : "jstree_contains_plusTitle"
			},
			plugins : [ "themes", "search", "xml_data", "ui", "checkbox", "languages" ],
			html_titles : true
		}).bind("uncheck_node.jstree", function(event, data) {
			var rm_arrpos = [];
			var f = function(index, element)
			{
				if (navicell.dataset) {
					if (element.id) {
						checked_elements[element.id] = false;
					}
					var gene_info = navicell.dataset.getGeneInfoByModifId(window.document.navicell_module_name, element.id);
					if (gene_info) {
						array_push_all(rm_arrpos, gene_info[1]);
					}
				}

				if (element.markers) {
					$.each(element.markers, function(key, i) { i.setVisible(false); });
					if (element.peers) {
						element.peers.each
						(
							function()
							{
								jQuery.jstree._reference(jtree).uncheck_node(this);
							}
						);
					}
				}
			};
			{
				$(this).jstree("get_unchecked", data.args[0], true).filter(filter).each(f);
				if (data.args[0].parentNode) {
					$(data.args[0].parentNode.parentNode).filter(filter).each(f);
				} else {
				}
				if (overlay && rm_arrpos.length) {
					overlay.remove(rm_arrpos);
					overlay.draw(window.document.navicell_module_name);
				}
			}
		}).bind("check_node.jstree", function(event, data) {
			if (check_node_inhibit) {
				return;
			}
			if (overlay) {
				overlay.reset();
			}
			check_node_inhibit = true;
			make_new_markers_old();
			var bounds = new google.maps.LatLngBounds();
			var f = function(index, element)
			{
				get_markers_for_modification(element, projection, map);
				
				if (navicell.dataset) {
					if (element.id) {
						checked_elements[element.id] = true;
					}
					var gene_info = navicell.dataset.getGeneInfoByModifId(window.document.navicell_module_name, element.id);
					if (gene_info) {
						array_push_all(overlay.arrpos, gene_info[1]);
					}
				}

				if (element.markers) {
					$.each(element.markers,
					       function(key, i)
					       {
						       if (!i.getVisible())
						       {
							       extend(bounds, i);
							       make_marker_visible(i);
						       }
					       }
					      );
					if (element.peers) {
						element.peers.each
							(
								function ()
								{
									jQuery.jstree._reference(jtree).check_node(this);
								}
							);
					}
				}
			};
			
			{
				jtree.jstree("get_checked", data.args[0], true).filter(filter).each(f);
				if (data.args[0].parentNode) {
					$(data.args[0].parentNode.parentNode).filter(filter).each(f);
				}
			}
			panMapToBounds(map, bounds);
			check_node_inhibit = false;
			if (overlay) {
				overlay.draw(window.document.navicell_module_name);
			}
		}).bind("search.jstree", function (e, data) {
		});
};

function open_blog_click(e)
{
	try
	{
		show_blog(e.currentTarget.alt);
	}
	catch (f)
	{
	}
	return false;
}

function open_module_map_click(e)
{
	try
	{
		//show_map_and_markers(e.currentTarget.alt, []);
		nv_perform("nv_open_module", window, e.currentTarget.alt, []);
	}
	catch (f)
	{
		console.log("open_module_map_click: " + f);
	}
	return false;
}

function dbg_sleep(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}

function clickmap_start(blogname, map_name, panel_selector, map_selector, source, min_zoom, max_zoom, tile_width, tile_height, width, height, xshift, yshift, firstEntityName, has_nobg)
{
	use_jxtree = !source;
	document.win = window;

	if (!maps)
	{
		maps = Object();
	}
	maps[map_name] = window;
	window.document.map_name = map_name;

	new_markers = Array();

	var map = start_map(map_name, map_selector, min_zoom, max_zoom, tile_width, tile_height, width, height, xshift, yshift, has_nobg);

	map.map.map_name = map_name;

	var whenready = function(e, data)
	{
		if (use_jxtree) {
			$("#loading-jxtree").css("display", "none");
		}
		if (to_open && to_open.length > 0)
		{
			if (use_jxtree) {
				to_open.no_ext = true;
				navicell.mapdata.findJXTree(window, to_open, true, 'select');
			} else {
				// http://stackoverflow.com/questions/3585527/why-doesnt-jstree-open-all-work-for-me
				var e = $(panel_selector).find("#entities"); // $("#entities");
				data.inst.open_all(e, false); // otherwise the tree is not checked
				show_markers_ref(to_open, data.inst);
				var children = data.inst._get_children(e);
				for (var i = 0; i < children.length; i++) {
					data.inst.close_all(children[i], false);
				}
			}
		}
		$("img.blogfromright").click(open_blog_click);
		$("img.mapmodulefromright").click(open_module_map_click);
	
	};
        start_right_hand_panel(panel_selector, source, map.map, map.projection, whenready, firstEntityName);
	var tell_opener = function()
	{
		var blog = maps[""];
		if (blog && !blog.closed)
		{
			blog.maps = maps;
		}
	};
	tell_opener();
	setup_icons();
	setInterval(tell_opener, 1000);
	navicell.declareWindow(window);
}

function show_blog(postid)
{
	var ori_postid = postid;
	if (parseInt(postid) != postid) {
		postid = navicell.mapdata.getPostModuleLink(postid);
		if (!postid) {
			return;
		}
	}
	var blog = maps[""];
	if (typeof blog !== 'undefined' && !blog.closed)
	{
		blog.location = blog_link(postid, ori_postid);
	}
	else
	{
		blog = window.open(blog_link(postid, ori_postid));
		maps[""] = blog;
	}
	blog.focus();
}

function show_map_and_markers(map_name, ids)
{
	var map = maps[map_name];
	if (map && !map.closed)
	{
		if (!map.to_open)
			map.to_open = ids;
		else if (map.to_open.length < 1)
			map.show_markers(ids);
		else
			map.to_open.concat(ids);
		map.focus();
	}
	else
	{
		if (map_name.indexOf(".html") > 0) {
			map = window.open(map_name);
		} else {
			map = window.open("../" + map_name + "/index.html");
		}
		map.to_open = ids;
		map.maps = maps;
		map.navicell = navicell;
		map.document.map_name = map_name;
		maps[map_name] = map;
	}
}

function uncheck_all_entities(win)
{
	if (!win) {
		win = window;
	}

	if (use_jxtree) {
		var jxtree = navicell.mapdata.getJXTree(win.document.navicell_module_name);
		if (jxtree) {
			$.each(jxtree.getRootNodes(), function() {
				this.checkSubtree(false);
			});
		}
		var res_jxtree = navicell.mapdata.getResJXTree(win.document.navicell_module_name);
		if (res_jxtree) {
			$.each(res_jxtree.getRootNodes(), function() {
				this.checkSubtree(false);
			});
		}
	} else if (jQuery.jstree._reference(jtree)) {
		jQuery.jstree._reference(jtree).uncheck_all();
	}
	
	$.each(win.marker_list, function() {
		this.setVisible(false);
	});
	
	$.each(win.bubble_list, function() {
		this.close();
	});

	overlay.reset();
	overlay.draw(win.document.navicell_module_name);
}

function bubble_open(marker)
{
	var context = marker.context;
	var bubble;
	if (context.bubble) {
		bubble = context.bubble;
	} else {
		bubble = context.bubble = new google.maps.InfoWindow
		(
			{
				content: "",
				maxWidth: 350
			}
		);
		context.mapdata.setBubbleContent(context.bubble, context.module_name, context.id);
		bubble_list.push(bubble);

		bubble.is_opened = false;
		bubble.addListener('closeclick', function () {
			bubble.is_opened = false;
		});
	}

	bubble.open(context.map, marker);
	bubble.is_opened = true;
}

function bubble_close(marker) {
	var context = marker.context;
	var bubble = context.bubble;
	if (bubble) {
		bubble.close();
		bubble.is_opened = false;
	}
}

function bubble_is_opened(marker) {
	var context = marker.context;
	var bubble = context.bubble;
	return bubble && bubble.is_opened;
}

function bubble_toggle(marker)
{
	var context = marker.context;
	var bubble = context.bubble;
	if (bubble_is_opened(marker)) {
		bubble_close(marker);
	} else {
		bubble_open(marker);
	}
}

function ClickmapTreeNode(map, module_name, id, cls, name, _positions, mapdata)
{
	var icon = get_icon(cls);
	var positions;
	if (_positions.length) {
		positions = _positions;
	} else {
		positions = [];
		positions.push(_positions);
	}

	this.markers = [];
	for (var nn = 0; nn < positions.length; ++nn) {
		var pos = positions[nn];
		var p = new google.maps.Point(pos.x, pos.y);
		var marker = new google.maps.Marker(
			{
				position: projection.fromPointToLatLng(p),
				map: map,
				title: name + " (" + id + ")",
				visible: false,
				icon: icon
			}
		);

		marker.context = {map: map, mapdata: mapdata, module_name: module_name, id: id, bubble: null};

		google.maps.event.addListener
		(
			marker, 'click', function()
			{
				bubble_toggle(this);
			}
		);

		this.markers.push(marker);
		marker_list.push(marker);
	}
}

function tree_context_prologue(tree_context) {
	tree_context.marker_bounds = [];
	tree_context.marker_positions = [];
}

function tree_context_epilogue(tree_context, dont_center) {
	if (!dont_center) {
		center_marker_position(tree_context.win.map, tree_context.marker_positions);
	}
}

function tree_node_click_before(tree_context, checked) {
	if (!checked) {
		tree_context_prologue(tree_context);
		new_markers = Array();
	}
}

function tree_node_click_after(tree_context, checked) {
	if (checked) {
		tree_context_epilogue(tree_context);
	}
}

function tree_node_state_changed(tree_context, tree_node, checked) {
	if (!tree_node) {
		return;
	}
	$.each(tree_node.markers, function() {
		if (checked) {
			make_marker_visible(this);
			if (nv_open_bubble) {
				bubble_open(this);
			}
			if (tree_context.marker_bounds) { // obsolete
				var marker_bound = new google.maps.LatLngBounds();
				extend(marker_bound, this);
				tree_context.marker_bounds.push(marker_bound);
			}
			if (tree_context.marker_positions) {
				tree_context.marker_positions.push(this.getPosition());
			}
		} else {
			this.setVisible(false);
		}
	});
}

