/**
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

//var MAX_SCREEN_WIDTH = 2500;
//var MAX_SCREEN_HEIGHT = 2000;
var MAX_SCREEN_WIDTH = 8192;
var MAX_SCREEN_HEIGHT = 8192;
var ESP_LATLNG = 0.01;
var CENTER_HIGHLIGHT_SHAPE = true;
var CENTER_HIGHLIGHT_CIRCLE = !CENTER_HIGHLIGHT_SHAPE;
var DEAL_CENTER = false;
var BNN = 1;

USGSOverlay.prototype = new google.maps.OverlayView();

var contextmenu_data = null;

function nv_set_contextmenu_data(ctx_data) {
	contextmenu_data = ctx_data;
}

function overlay_init(map) {
	overlay = new USGSOverlay(map);
}

function USGSOverlay(map) {
	this.win = window;
	this.map_ = map;
	this.div_ = null;
	this.setMap(map);
	this.reset(true);
	this.highlight_boxes = [];
	this.image_mode = false;

	//this.arrpos = [];

	// test
	// this.map_.getDiv().style.opacity = "0.4"; // this.map_.getDiv().style.filter  = 'alpha(opacity=60)' // for IE
	// works but not ok for our purpose. Look at:
	// google: javascript copy canvas to image
	// google: opaque png
}

function is_included(box, clicked_boundbox) {
	return box[0] >= clicked_boundbox[0] && box[0]+box[2] <= clicked_boundbox[0]+clicked_boundbox[2] &&
		box[1] >= clicked_boundbox[1] && box[1]+box[3] <= clicked_boundbox[1]+clicked_boundbox[3];
}

function click_node(overlay, node, mode, center, clicked_boundbox, was_checked) {
	var overlayProjection = overlay.getProjection();
	var mapProjection = overlay.map_.getProjection();

	console.log("click_node: " + mode);
	var is_checked = false;
	if (mode == 'toggle') {
		is_checked = node.isChecked() || was_checked;
		if (is_checked) {
			node.checkSubtree(JXTree.UNCHECKED);
		} else {
			node.checkSubtree(JXTree.CHECKED);
			node.openSupertree(JXTree.OPEN);
		}
	} else if (mode == 'select') {
		node.checkSubtree(JXTree.CHECKED);
		node.openSupertree(JXTree.OPEN);
	} else if (mode == 'unselect') {
		node.checkSubtree(JXTree.UNCHECKED);
	}

	is_checked = node.isChecked();
	//is_checked = node.isChecked();
	var clickmap_tree_node = node.getUserData().clickmap_tree_node;

	var latlng;
	if (clicked_boundbox) {
		if (!clicked_boundbox.gpt) {
				clicked_boundbox.gpt = new google.maps.Point(clicked_boundbox[0], clicked_boundbox[2]);
		}
		latlng = mapProjection.fromPointToLatLng(clicked_boundbox.gpt);
	} else {
		latlng = null;
	}

	console.log("clickmap_tree_node: " + clickmap_tree_node);
	if (clickmap_tree_node) {
		$.each(clickmap_tree_node.markers, function() {
			var diff_lat;
			var diff_lng;
			if (latlng) {
				diff_lat = Math.abs(latlng.lat() - this.getPosition().lat());
				diff_lng = Math.abs(latlng.lng() - this.getPosition().lng());
			}
			if (!latlng || (diff_lat <= ESP_LATLNG && diff_lng <= ESP_LATLNG)) {
				if (mode == "select") {
					if (overlay.win.nv_open_bubble) {
						bubble_open(this);
					}
					if (center) {
						var bounds = new google.maps.LatLngBounds();
						extend(bounds, this);
						overlay.win.map.setCenter(bounds.getNorthEast());
					}
				} else if (mode == "unselect") {
					bubble_close(this);
				} else if (mode == "toggle") {
					if (is_checked) {
						if (overlay.win.nv_open_bubble) {
							bubble_open(this);
						}
						if (center) {
							var bounds = new google.maps.LatLngBounds();
							extend(bounds, this);
							overlay.win.map.setCenter(bounds.getNorthEast());
						}
					} else {
						bubble_close(this);
					}
				}
			}
		});
	}
}

function scaled_boxes_from_boxes(overlay, boxes) {
	var overlayProjection = overlay.getProjection();
	var mapProjection = overlay.map_.getProjection();
	var scale = Math.pow(2, overlay.map_.zoom);
	var div = overlay.div_;
	var array = [];
	var div_left = this.image_mode ? this.delta_x : div.left;
	var div_top = this.image_mode ? this.delta_y : div.top;
	for (var idx in boxes) {
		var box = boxes[idx];
		//var box = [pos.x, pos.w, pos.y, pos.h, pos.said];
		//console.log("box[0] " + box[0] + " " + box[2] + " " + box[1] + " " + box[3]);
		if (!box.gpt) {
			box.gpt = new google.maps.Point(box[0], box[2]);
		}
		var latlng = mapProjection.fromPointToLatLng(box.gpt);
		if (GMAPS_V3_3x) {
			var pix = overlayProjection.fromLatLngToContainerPixel(latlng);
			var bx = pix.x;
			var by = pix.y;
		} else {
			var pix = overlayProjection.fromLatLngToDivPixel(latlng);
			var bx = pix.x - div_left;
			var by = pix.y - div_top;
		}
		var bw = box[1]*scale;
		var bh = box[3]*scale;
		array.push([pix.x, bw, pix.y, bh]);
		//console.log("box -> " + [pix.x, bw, pix.y, bh]);
	}
	return array;
}

function boxes_from_positions(overlay, positions) {
	// no need of overlay
	var array = [];
	for (var idx in positions) {
		var pos = positions[idx];
		var box = [pos.x, pos.w, pos.y, pos.h, pos.said];
		array.push(box);
	}
	return array;
}

function collect_neighbours(info, get_info, get_neighbours, get_positions, level, select_entities, boxes) {
	var module = overlay.win.document.navicell_module_name;
	var str = info.id;
	//console.log("nb: " + info.id);
	array_push_all(boxes, boxes_from_positions(overlay, get_positions(info)));
	select_entities.push(info.id);
	var neighbours = get_neighbours(info);
	if (neighbours) {
		for (var idx in neighbours) {
			var neighbour = neighbours[idx];
			str += (str.length > 0 ? ", " : "") + neighbour;
			//var info2 = navicell.mapdata.getMapdataById(module, neighbour);
			var info2 = get_info(module, neighbour);
			if (info2) {
				select_entities.push(neighbour);
				//console.log("nb: " + info2.id);
				array_push_all(boxes, boxes_from_positions(overlay, get_positions(info2)));
				if (level > 1) {
					var neighbours2 = get_neighbours(info2);
					if (neighbours2) {
						for (var idx2 in neighbours2) {
							var neighbour2 = neighbours2[idx2];
							var info3 = get_info(module, neighbour2);
							if (info3 && info3.id != info.id) {
								select_entities.push(neighbour2);
								str += (str.length > 0 ? ", " : "") + neighbour2;
								//console.log("nb: " + info3.id);
								array_push_all(boxes, boxes_from_positions(overlay, get_positions(info3)));
							}
						}
					}
				}
			}
		}
	}
	return str;
}

function compute_neighbours() {
	var module = overlay.win.document.navicell_module_name;
	var info = navicell.mapdata.getMapdataById(module, overlay.clicked_node_ctxmenu.user_id);

	var boxes;
	var select_entities;
	boxes = [];
	select_entities = [];
	if (info) {
		var str = collect_neighbours(info,
					     function(module, id) {return navicell.mapdata.getMapdataById(module, id);},
					     function(info) {return info.species_neighbours;},
					     function(info) {return info.positions;}, 2, select_entities, boxes);
		console.log("str: " + str + " " + boxes.length + " " + select_entities.length);
	}
	overlay.RGN_highlight_boxes = boxes;
	overlay.RGN_select_entities = select_entities;

	info = navicell.mapdata.getMapdataById(module, overlay.clicked_node_ctxmenu.user_id);

	boxes = [];
	select_entities = [];
	var select_entities2 = [];
	if (info && info.entity) {
		collect_neighbours(info,
				   function(module, id) {return navicell.mapdata.getMapdataByEntityId(module, id);},
				   function(info) {return info.entity.entity_neighbours;},
				   function(info) {
					   var positions = [];
					   for (var idx1 in info.entity.modifs) {
						   var modif = info.entity.modifs[idx1];
						   for (var idx2 in modif.positions) {
							   positions.push(modif.positions[idx2]);
						   }
					   }
					   return positions;
				   },
				   1, select_entities, boxes);
		for (var idx1 in select_entities) {
			var id = select_entities[idx1];
			var modif = navicell.mapdata.getMapdataByEntityId(module, id);
			if (modif) {
				for (var idx2 in modif.entity.modifs) {
					var modif2 = modif.entity.modifs[idx2];
					select_entities2.push(modif2.id);
				}
			} else {
				select_entities2.push(id);
			}
		}
	}
	overlay.IE_highlight_boxes = boxes;
	overlay.IE_select_entities = select_entities;
	overlay.IE_select_entities2 = select_entities2;
}

// TBD: must be callable from API
function contextmenu_callback(key, options) {
	var module = overlay.win.document.navicell_module_name;
	window.console.log(module + " " + overlay.clicked_node_ctxmenu);
	$.each(overlay.win.bubble_list, function() {
		this.close();
	});
	if (key == "center") {
		overlay.win.map.setCenter(overlay.clicked_latlng_ctxmenu);
		nv_perform("nv_select_entity", overlay.win, overlay.clicked_node_ctxmenu.user_id, "select", false, overlay.clicked_boundbox_ctxmenu);
	} else if (key == "reaction_select" || key == "reaction_select_highlight") {
		overlay.neighbour_of_box = overlay.clicked_center_box_ctxmenu;
		if (key == "reaction_select_highlight") {
			array_push_all(overlay.highlight_boxes, overlay.RGN_highlight_boxes);
		}
		navicell.mapdata.findJXTree(overlay.win, overlay.RGN_select_entities, true, 'subtree', {div: $("#result_tree_contents", overlay.win.document).get(0), select_neighbours: true, result_title: ' '});
		$("#right_tabs", window.document).tabs("option", "active", 1);
	} else if (key == "interact_select" || key == "interact_select_highlight") {
		overlay.neighbour_of_box = overlay.clicked_center_box_ctxmenu;
		if (key == "interact_select_highlight") {
			array_push_all(overlay.highlight_boxes, overlay.IE_highlight_boxes);
		}
		navicell.mapdata.findJXTree(overlay.win, overlay.IE_select_entities2, true, 'subtree', {div: $("#result_tree_contents", overlay.win.document).get(0), select_neighbours: true, result_title: ' '});
		$("#right_tabs", window.document).tabs("option", "active", 1);
	} else if (key == "highlight") {
		if (!is_selected_species_highlighted()) {
			overlay.highlight_boxes.push(overlay.clicked_center_box_ctxmenu);
		} else {
			var boxes = [];
			for (var idx in overlay.highlight_boxes) {
				var box = overlay.highlight_boxes[idx];
				var equals = true;
				for (var nn = 0; nn < 4; ++nn) {
					if (box[nn] != overlay.clicked_center_box_ctxmenu[nn]) {
						equals = false;
						break;
					}
				}
				if (!equals) {
					boxes.push(box);
				}
			}
			overlay.highlight_boxes = boxes;
		}
	}
	overlay.clicked_center_box = null;
	overlay.draw(module);
}

function is_selected_species_highlighted() {
	if (overlay) {
		var species_box = overlay.clicked_center_box_ctxmenu;
		for (var idx in overlay.highlight_boxes) {
			var box = overlay.highlight_boxes[idx];
			var equals = true;
			for (var nn = 0; nn < 4; ++nn) {
				if (box[nn] != species_box[nn]) {
					equals = false;
					break;
				}
			}
			if (equals) {
				return true;
			}
		}
	}
	return false;
}

function contextmenu_callback_old(key, options) {
	// TBD: already computed by compute_neighbours:
	// 1. must use this information and deal with it
	// 2. suppress messages in result panel
	var m = "clicked: " + key;
	var module = overlay.win.document.navicell_module_name;
	window.console.log(m + " " + overlay.clicked_node_ctxmenu);
	if (key == "center") { // || key == "center_highlight") {
		$.each(overlay.win.bubble_list, function() {
			this.close();
		});
		overlay.win.map.setCenter(overlay.clicked_latlng_ctxmenu);
		nv_perform("nv_select_entity", overlay.win, overlay.clicked_node_ctxmenu.user_id, "select", false, overlay.clicked_boundbox_ctxmenu);
	} else if (key == "reaction_select" || key == "reaction_select_highlight") {
		var info = navicell.mapdata.getMapdataById(module, overlay.clicked_node_ctxmenu.user_id);

		if (info) {
			var boxes = [];
			var select_entities = [];
			var str = collect_neighbours(info,
						     function(module, id) {return navicell.mapdata.getMapdataById(module, id);},
						     function(info) {return info.species_neighbours;},
						     function(info) {return info.positions;}, 2, select_entities, boxes);
			console.log("neighbourgs of " + overlay.clicked_node_ctxmenu.user_id + " : " + str);
			//overlay.highlight_boxes = key == "reaction_select_highlight" ? boxes : null;
			if (key == "reaction_select_highlight") {
				array_push_all(overlay.highlight_boxes, boxes);
			}
			navicell.mapdata.findJXTree(overlay.win, select_entities, true, 'subtree', {div: $("#result_tree_contents", overlay.win.document).get(0), select_neighbours: true, result_title: "\"" + info.name + "\" + reaction&nbsp;graph&nbsp;neighbours (" + (boxes.length-1) + ")"});
			$("#right_tabs", window.document).tabs("option", "active", 1);
		}
	} else if (key == "interact_select" || key == "interact_select_highlight") {
		var info = navicell.mapdata.getMapdataById(module, overlay.clicked_node_ctxmenu.user_id);

		console.log("interact? " + info.positions + " " + info.entity.postid + " " + info['entity']['postid']);
		if (info && info.entity) {
			var boxes = [];
			var select_entities = [];
			var str = collect_neighbours(info,
						     function(module, id) {return navicell.mapdata.getMapdataByEntityId(module, id);},
						     function(info) {return info.entity.entity_neighbours;},
						     function(info) {
							     var positions = [];
							     for (var idx1 in info.entity.modifs) {
								     var modif = info.entity.modifs[idx1];
								     for (var idx2 in modif.positions) {
									     positions.push(modif.positions[idx2]);
								     }
							     }
							     return positions;
						     },
						     1, select_entities, boxes);
			//overlay.highlight_boxes = key == "interact_select_highlight" ? boxes : null;
			if (key == "interact_select_highlight") {
				array_push_all(overlay.highlight_boxes, boxes);
			}
			var select_entities2 = [];
			var str = "";
			for (var idx1 in select_entities) {
				var id = select_entities[idx1];
				var modif = navicell.mapdata.getMapdataByEntityId(module, id);
				if (modif) {
					for (var idx2 in modif.entity.modifs) {
						var modif2 = modif.entity.modifs[idx2];
						select_entities2.push(modif2.id);
						str += (str.length > 0 ? ", " : "") + modif2.id;
					}
				} else {
					select_entities2.push(id);
					str += (str.length > 0 ? ", " : "") + id;
				}
			}
			console.log("interacting neighbours of " + overlay.clicked_node_ctxmenu.user_id + " : " + str + " " + boxes.length);
			navicell.mapdata.findJXTree(overlay.win, select_entities2, true, 'subtree', {div: $("#result_tree_contents", overlay.win.document).get(0), select_neighbours: true, result_title: "\"" + info.name + "\" + interacting&nbsp;entities (" + (select_entities.length-1) + ")"});
			$("#right_tabs", window.document).tabs("option", "active", 1);
		}
	}

	if (key == "highlight") {
		overlay.highlight_boxes.push(overlay.clicked_center_box_ctxmenu);
	} else if (key == "unhighlight") {
		var boxes = [];
		for (var idx in overlay.highlight_boxes) {
			var box = overlay.highlight_boxes[idx];
			var equals = true;
			for (var nn = 0; nn < 4; ++nn) {
				if (box[nn] != overlay.clicked_center_box_ctxmenu[nn]) {
					equals = false;
					break;
				}
			}
			if (!equals) {
				boxes.push(box);
			}
		}
		overlay.highlight_boxes = boxes;
	}
	//overlay.clicked_center_box = key == "center_highlight" ? overlay.clicked_center_box_ctxmenu : null;
	overlay.clicked_center_box = null;
	overlay.draw(module);
}

function event_ckmap(e, type, overlay) {
	var x = e.pixel.x;
	var y = e.pixel.y;
	//var event = (overlay.win.event ? overlay.win.event : overlay.event);
	var event = overlay.win.event;
	var button = (event ? event.button : -1);

	var is_click = button <= 0 && (type == "click" || (type == "mouseup" && event && event.ctrlKey));
	var overlayProjection = overlay.getProjection();
	var mapProjection = overlay.map_.getProjection();
	var scale = Math.pow(2, overlay.map_.zoom);
	var div = overlay.div_;

	if (type != 'mouseover' && event) {
		console.log("type=" + type + " alt " + event.altKey + " " + event.ctrlKey + " " + event.shiftKey + " button=" + button + " " + x + " " + y);
		var latlng = mapProjection.fromPointToLatLng({x: x, y: y}, 0, 1);
		console.log("lat-lng: " + latlng.lat() + " " + latlng.lng() + " " + div.left + " " + div.top + " " + overlay.draw_canvas_.style.left + " " + overlay.draw_canvas_.style.top);
	}

	var found = false;
	var module = overlay.win.document.navicell_module_name;

	var jxtree = navicell.mapdata.getJXTree(module);
	var modif_map = navicell.mapdata.getModifMap(module);
	var clicked_node = null;
	var clicked_boundbox = null;
	var clicked_latlng = null;
	var clicked_center_box = null;
	for (var id in modif_map) {
		var boxes = modif_map[id];
		//console.log("boxes.length: " + id + " " + boxes.length + " " + x + " " + y);
		for (var kk = 0; kk < boxes.length; ++kk) {
			var box = boxes[kk];
			if (!box.gpt) {
				box.gpt = new google.maps.Point(box[0], box[2]);
			}
			var latlng = mapProjection.fromPointToLatLng(box.gpt);
			if (GMAPS_V3_3x) {
				var pix = overlayProjection.fromLatLngToContainerPixel(latlng);
				var bx = pix.x;
				var by = pix.y;
			} else {
				// the following function will call projection.fromLatLngToPoint
				var pix = overlayProjection.fromLatLngToDivPixel(latlng);
				var bx = pix.x - div.left;
				var by = pix.y - div.top;
			}
			var bw = box[1]*scale;
			var bh = box[3]*scale;
			if (x >= bx && x <= bx+bw && y >= by && y <= by+bh) {
				if (type == 'click' || type == 'mouseup') {
					if (type != 'mouseup' || button == 2) {
						//if (type != 'click') {
						var said = box[4];
						console.log("click ID " + id + " said=" + said + " in " + module + " " + button);
						var node = jxtree.getNodeByUserId(id);
						if (node) {
							if (clicked_boundbox) {
								if (!is_included(box, clicked_boundbox)) {
									continue;
								}
							}
							clicked_boundbox = box;
							clicked_node = node;
							clicked_latlng = latlng;
							if (type == 'mouseup') {
								//clicked_center_box = [pix.x, bw, pix.y, bh];
								clicked_center_box = box;
							}
						}
					}
				} else if (type == 'mouseover') {
					found = true;
					break;
				}
			}
		}
		if (found) {
			break;
		}
	}

	if (type == 'click') {
		console.log("clicked_node: " + clicked_node);
	}
	overlay.clicked_center_box_ctxmenu = clicked_center_box;
	overlay.clicked_latlng_ctxmenu = clicked_latlng;
	overlay.clicked_node_ctxmenu = clicked_node;
	overlay.clicked_boundbox_ctxmenu = clicked_boundbox;
	if (clicked_node) {
		console.log("type: " + type);
		//if (type != 'mouseup') {
		//if (button <= 0) {
		if (is_click) {
			if (overlay.hasHighlight() > 0) {
				var info = navicell.mapdata.getMapdataById(module, clicked_node.user_id);
				array_push_all(overlay.highlight_boxes, boxes_from_positions(overlay, info.positions));
			}
			var o_open_bubble = overlay.win.nv_open_bubble;
			//overlay.win.nv_open_bubble = (type == 'click'); // center ??
			overlay.win.nv_open_bubble = true;
			//var mode = (type == 'click' ? 'toggle' : 'select');
			var mode = 'toggle';
			var was_checked = false;
			if (mode == 'toggle') {
				var jxtree = navicell.mapdata.getJXTree(module);
				var node = jxtree.getNodeByUserId(clicked_node.user_id);
				was_checked = node.isChecked();
			}
			if (event && !event.ctrlKey) {
				nv_perform("nv_uncheck_all_entities", overlay.win);
			}
			console.log("was_checked: " + was_checked);
			nv_perform("nv_select_entity", overlay.win, clicked_node.user_id, mode, false, clicked_boundbox, was_checked);
			overlay.win.nv_open_bubble = o_open_bubble;
		}
		if (type == 'mouseup' && button == 2) {
			var info = navicell.mapdata.getMapdataById(module, clicked_node.user_id);

			if (info) {
				var name = info.name;
				if (name.length > 20) {
					name = info.name.substr(0, 20) + "...";
				} else {
					name = info.name;
				}
				compute_neighbours();
				$('.species-contextmenu-data-title').attr('data-menutitle', name);
				$('.species-contextmenu-highlight').attr('highlight-menutitle',
									 (is_selected_species_highlighted() ? "Unhighlight" : "Highlight") + " Species");
				var cnt = overlay.IE_select_entities.length-1;
				if (cnt > 0) {
					$('.species-contextmenu-interacting-entities').attr('interacting-menutitle', "Entities (" + cnt + ")");
				} else {
					$('.species-contextmenu-interacting-entities').attr('interacting-menutitle', "No Entities");
				}
				cnt = overlay.RGN_select_entities.length-1;
				if (cnt > 0) {
					$('.species-contextmenu-reaction-neighbours').attr('neighbours-menutitle', "Neighbours (" + cnt + ")");
				} else {
					$('.species-contextmenu-reaction-neighbours').attr('neighbours-menutitle', "No Neighbours");
				}
				if (event) {
					console.log("let's go");
					event.data = contextmenu_data;
					$.contextMenu.handle.contextmenu(event);
					console.log("ok?");
				}
			}
		}
	}

	var map_name = overlay.map_.map_name;
	var cursor = found ? 'pointer' : 'default';
	if (overlay.cursor != cursor) {
		overlay.map_.setOptions({draggableCursor: cursor, draggingCursor: 'move'});
		overlay.cursor = cursor;
	}
	if (type == 'click' && !navicell.getDrawingConfig(module).displayDLOsOnAllGenes()) {
		overlay.draw(module); // new: warning to performance !
	}
}

USGSOverlay.prototype.onAdd = function() {

	function simpleBindShim(thisArg, func) {
		return function() { func.apply(thisArg); };
	}

	google.maps.event.addListener(this.getMap(), 'center_changed', simpleBindShim(this, this.draw));

	var overlay = this;

	var isFirefox = typeof InstallTrigger !== 'undefined';
	if (!isFirefox) {
		google.maps.event.addListener(this.getMap(), 'mouseup', function(e) {
			event_ckmap(e, 'mouseup', overlay);
		});
	} else {
		this.getMap().getDiv().onmouseup = function(event) {
			overlay.win.event = event;
			event_ckmap({pixel: {x: event.layerX, y: event.layerY}}, 'mouseup', overlay);
			//		console.log("onmouseup: " + event.button + " " + event.layerX + " " + event.layerY + " " + event.pageX + " " + event.pageY);
		}
	}

	google.maps.event.addListener(this.getMap(), 'click', function(e, e2) {
		var x = e.pixel.x;
		var y = e.pixel.y;
		var doc = overlay.win.document;
		var module = overlay.win.document.navicell_module_name;
		console.log("click at " + x + " " + y + " module " + module);
		for (var nn = 0; nn < overlay.boundBoxes.length; ++nn) {
			var box = overlay.boundBoxes[nn][0];
			if (x >= box[0] && x <= box[0]+box[2] && y >= box[1] && y <= box[1]+box[3]) {
				//console.log("found : x=" + box[0] + ", w=" + box[2] + ", y=" + box[1] + ", h=" + box[3]);
				var gene_name = overlay.boundBoxes[nn][1];
				var m_gene_names = "";
				var modif_id = overlay.boundBoxes[nn][4];
				var gene_id;
				var info = navicell.dataset.getGeneInfoByModifId(module, modif_id);
				if (info) {
					var genes = info[0];
					if (genes.length > 1) {
						for (var nn = 0; nn < genes.length; ++nn) {
							if (nn > 0) {
								m_gene_names += ", ";
							}
							m_gene_names += genes[nn].name;
						}
						if (DISPLAY_MODIF_ID) {
							m_gene_names += " (" + modif_id + ")";
						}
						gene_name = m_gene_names;
						gene_id = "";
					} else {
						gene_id = navicell.dataset.getGeneByName(gene_name).id;
					}
				}
				var type = overlay.boundBoxes[nn][2];
				var hint = overlay.boundBoxes[nn][3];
				console.log("click on: " + gene_name + " " + gene_id + " " + type + " " + modif_id);
				if (type == "heatmap") {
					$("#heatmap_select_gene", doc).val(gene_id);
					if (m_gene_names) {
						$("#heatmap_select_m_genes", doc).html(m_gene_names);
					} else {
						$("#heatmap_select_m_genes", doc).html("");
					}

					$("#heatmap_select_modif_id", doc).html(modif_id);
					$("#heatmap_editor_div", doc).dialog("open");
					update_heatmap_editor(doc);
				} else if (type == "barplot") {
					$("#barplot_select_gene", doc).val(gene_id);
					if (m_gene_names) {
						$("#barplot_select_m_genes", doc).html(m_gene_names);
					} else {
						$("#barplot_select_m_genes", doc).html("");
					}

					$("#barplot_select_modif_id", doc).html(modif_id);
					$("#barplot_editor_div", doc).dialog("open");
					update_barplot_editor(doc);
				} else if (type == "glyph") {
					$("#glyph_select_gene_" + hint, doc).val(gene_id);
					if (m_gene_names) {
						$("#glyph_select_m_genes_" + hint, doc).html(m_gene_names);
					} else {
						$("#glyph_select_m_genes_" + hint, doc).html("");
					}

					$("#glyph_select_modif_id_" + hint, doc).html(modif_id);
					$("#glyph_editor_div_" + hint, doc).dialog("open");
					update_glyph_editor(doc, null, hint);
				}
				break;
			}
		}
		event_ckmap(e, 'click', overlay);
	});

	google.maps.event.addListener(this.getMap(), 'mousemove', function(e, e2) {
		var x = e.pixel.x;
		var y = e.pixel.y;
		var found = false;
		for (var nn = 0; nn < overlay.boundBoxes.length; ++nn) {
			var box = overlay.boundBoxes[nn][0];
			if (x >= box[0] && x <= box[0]+box[2] && y >= box[1] && y <= box[1]+box[3]) {
				found = true;
				break;
			}
		}
		var map_name = overlay.map_.map_name;
		var cursor = found ? 'pointer' : 'default';
		if (overlay.cursor != cursor) {
			overlay.map_.setOptions({draggableCursor: cursor, draggingCursor: 'move'});
			overlay.cursor = cursor;
		}

		if (!found) {
			event_ckmap(e, 'mouseover', overlay);
		}
	});
	this.setMap(this.map_);

	var div = document.createElement('div');
	div.id = "innermap";
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.position = 'absolute';

	div.left = 0;
	div.top = 0;
	div.style.left = '0px';
	div.style.top = '0px';

	var draw_canvas = document.createElement('canvas');
	draw_canvas.id = "map_canvas"; // 2015-06-11
	draw_canvas.style.left = '0px';
	draw_canvas.style.top = '0px';

	draw_canvas.width = MAX_SCREEN_WIDTH;
	draw_canvas.height = MAX_SCREEN_HEIGHT;
	draw_canvas.style.width = draw_canvas.width + 'px';
	draw_canvas.style.height = draw_canvas.height + 'px';

	draw_canvas.style.position = 'absolute';
	div.appendChild(draw_canvas);

	this.div_ = div;
	this.draw_canvas_ = draw_canvas;

	if (draw_canvas.getContext) {
		this.context = draw_canvas.getContext('2d');
		this.context.save();
	}

	var panes = this.getPanes();
	console.log("panes.overlayLayer: " + panes.overlayLayer.style.width);
	panes.overlayLayer.appendChild(div);

	this.draw();
}

USGSOverlay.prototype.resize = function() {
	if (this.div_ == null) {
		return;
	}
	var overlayProjection = this.getProjection();
	if (GMAPS_V3_3x) {
		var ne = overlayProjection.fromLatLngToContainerPixel(this.map_.getBounds().getSouthWest());
		var sw = overlayProjection.fromLatLngToContainerPixel(this.map_.getBounds().getNorthEast());
	} else {
		var ne = overlayProjection.fromLatLngToDivPixel(this.map_.getBounds().getSouthWest());
		var sw = overlayProjection.fromLatLngToDivPixel(this.map_.getBounds().getNorthEast());
	}

	var width = sw.x;
	var height = ne.y;
	if (GMAPS_V3_3x_force) {
		var width = sw.x - ne.x;
		var height = ne.y - sw.y;
	} else {
		var width = ne.x - sw.x;
		var height = sw.y - ne.y;
	}
	//console.log("ne " + ne.x + " " + ne.y + " " + sw.x + " " + sw.y);
	//console.log("width " + width + " " + height);

	var div = this.div_;
	if (div.width != width || div.height != height) {
		div.width = width;
		div.height = height;
		div.style.width = width + 'px';
		div.style.height = height + 'px';
	}

	if (GMAPS_V3_3x_force) {
		var left = ne.x;
		var top = sw.y;
	} else {
		var left = sw.x;
		var top = ne.y;
	}
	//console.log("width " + width + " height " + height + " left " + left + " top " + top);
	if (div.left != left || div.top != top) {
		div.left = left;
		div.top = top;
		div.style.left = left + 'px';
		div.style.top = top + 'px';
	}
}

USGSOverlay.prototype.initHighlight = function() {
	var context = this.context;
	context.fillStyle = "#FFFFFF";
	context.globalAlpha = 0.65;
//	context.globalAlpha = 0.70;
	context.fillRect(0, 0, MAX_SCREEN_WIDTH, MAX_SCREEN_HEIGHT);
}

USGSOverlay.prototype.highlight = function(boxes) {
	boxes = scaled_boxes_from_boxes(this, boxes);
	this.initHighlight();
	var context = this.context;
	var div = this.div_;
	var div_left = this.image_mode ? this.delta_x : div.left;
	var div_top = this.image_mode ? this.delta_y : div.top;
	for (var idx in boxes) {
		var box = boxes[idx];
		if (GMAPS_V3_3x) {
			var x = box[0];
			var y = box[2];
		} else {
			var x = box[0] - div_left;
			var y = box[2] - div_top;
		}
		var w = box[1];
		var h = box[3];
		context.clearRect(x-1, y-1, w+2, h+2);
	}
}

USGSOverlay.prototype.hasHighlight = function() {
	return this.highlight_boxes.length > 0;
}

USGSOverlay.prototype.drawExportImage = function(module, context, delta_x, delta_y) {
	var o_context = this.context;
	this.context = context;
	this.image_mode = true;
	this.delta_x = delta_x;
	this.delta_y = delta_y;
	this.draw(module);
	this.image_mode = false;
	this.context = o_context;
}

USGSOverlay.prototype.draw = function(module) {

	if (this.div_ == null) {
		return;
	}
	if (!this.context) {
		this.boundBoxes = [];
		return;
	}
	this.resize();

	if (!this.image_mode) {
		this.context.clearRect(0, 0, MAX_SCREEN_WIDTH, MAX_SCREEN_HEIGHT);
	}
	this.boundBoxes = [];

	if (!module) {
		module = get_module();
	}

	var drawing_config = navicell.getDrawingConfig(module);
	if (drawing_config.displayDLOs()) {
		if (drawing_config.displayMapStaining()) {
			draw_voronoi(module, this.context, this.div_, this.image_mode, this.delta_x, this.delta_y);
		}

		var arrpos = null;
		if (drawing_config.displayDLOsOnAllGenes()) {
			this.arrpos = navicell.dataset.getArrayPos(module);
		} else {
			this.arrpos = navicell.dataset.getSelectedArrayPos(module);
		}

		/*
		console.log("filling black!");
		this.context.fillStyle = "#00ff00";
		this.context.fillRect(20, 20, MAX_SCREEN_WIDTH, MAX_SCREEN_HEIGHT);
		return;
		*/
		var arrpos = this.arrpos;
		if (arrpos && arrpos.length) {
			var div = this.div_;
			var overlayProjection = this.getProjection();
			var mapProjection = this.map_.getProjection();
			var scale = Math.pow(2, this.map_.zoom);

			var MARGIN = 30;
			var div_width = this.image_mode ? MAX_SCREEN_WIDTH : div.width;
			var div_height = this.image_mode ? MAX_SCREEN_HEIGHT : div.height+MARGIN;
			var div_left = this.image_mode ? this.delta_x : div.left;
			var div_top = this.image_mode ? this.delta_y : div.top;
			cache_value_cnt = 0;
			no_cache_value_cnt = 0;
			//console.log("image_mode " + this.image_mode + " " + div.width + " " + div.height);
			//console.log("div width: " + div_width + " height: " + div_height + " left: " + div_left + " (" + div.left + ") top: " + div_top + " (" + div.top + ") " + arrpos.length);
			for (var nn = 0; nn < arrpos.length; ++nn) {
				var latlng = mapProjection.fromPointToLatLng(arrpos[nn].p);
				if (GMAPS_V3_3x) {
					var pix = overlayProjection.fromLatLngToContainerPixel(latlng);
					var pos_x = pix.x;
					var pos_y = pix.y;
					// TEST:
					pos_x -= div.left;
					pos_y -= div.top;
				} else {
					var pix = overlayProjection.fromLatLngToDivPixel(latlng);
					var pos_x = pix.x - div_left;
					var pos_y = pix.y - div_top;
				}
				if (nn == 0) {
					//console.log("latlng: " + latlng.lat() + " " + latlng.lng());
					//console.log("pix: " + pix.x + " " + pix.y);
				}
				if (this.image_mode ||
				    /*(pos_x > -MARGIN && pos_y >= 0)) {*/ // to complete: EV-2018-08-29
				    (pos_x > -MARGIN && pos_x < div_width &&
				     pos_y >= 0 && pos_y < div_height)) {
					navicell.dataset.drawDLO(module, this, this.context, scale, arrpos[nn].id, arrpos[nn].gene_name, pos_x, pos_y);
					//console.log("drawn " + pos_x + " " + pos_y);
					//console.log("drawn");
				} else {
					//console.log("not drawed " + pos_x + " " + pos_y);
					//console.log("not drawed");
				}
			}
			//console.log("CACHE_VALUE_CNT " + cache_value_cnt + " " + no_cache_value_cnt);
		}
	}
	if (this.highlight_boxes.length > 0) {
		this.highlight(this.highlight_boxes);
	}
	if (overlay.neighbour_of_box) {
		this.context.strokeStyle = "#FF0000";
		this.context.lineWidth = 2;
		var div = this.div_;
		var boxes = scaled_boxes_from_boxes(this, [overlay.neighbour_of_box]);
		var box = boxes[0];
		var div_left = this.image_mode ? this.delta_x : div.left;
		var div_top = this.image_mode ? this.delta_y : div.top;
		if (GMAPS_V3_3x) {
			var x = box[0];
			var y = box[2];
		} else {
			var x = box[0] - div_left;
			var y = box[2] - div_top;
		}
		var w = box[1];
		var h = box[3];
		var dim = w > h ? w : h;
		var dim2 = dim/2;
		var dim4 = dim2/2;
		this.context.beginPath();
		this.context.arc(x+dim2, y+dim4, dim2+5, 0., Math.PI*2);
		this.context.closePath();
		this.context.stroke();

	}
}

USGSOverlay.prototype.unhighlight = function() {
	this.highlight_boxes = [];
	this.neighbour_of_box = null;
}

USGSOverlay.prototype.reset = function() {
	this.arrpos = [];
}

USGSOverlay.prototype.addBoundBox = function(box, gene_name, chart_type, hint, modif_id) {
	this.boundBoxes.push([box, gene_name, chart_type, hint, modif_id]);
}

USGSOverlay.prototype.remove_old = function(rm_arrpos) {
	if (!rm_arrpos.length) {
		return;
	}
	var arrpos = [];
	for (var ii = 0; ii < this.arrpos.length; ++ii) {
		var pos = this.arrpos[ii];
		var keep = 1;
		for (var jj = 0; jj < rm_arrpos.length; ++jj) {
			if (rm_arrpos[jj].id == pos.id) {
				keep = 0;
				break;
			}
		}
		if (keep) {
			arrpos.push(pos);
		}
	}
	this.arrpos = arrpos;
}

USGSOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
}


// By Mathurin, take a screenshot in a customized hidden canvas
// will be moved to screenshot.js
var screenShot = null;

// can be set with nv_export_image_set_maxsize(size)
var EXPORT_IMAGE_MAX_WIDTH = 2048;
var EXPORT_IMAGE_FULL_MAP = false;

function export_image_button_enable(enable)
{
	var button = $("#export_image");
	//button.attr("disabled", !enable);
	button.button(enable ? "enable" : "disable");
}

function screenshot_epilogue()
{
	if (screenShot) {
		var mainmap = document.getElementById("map");
		export_image_button_enable(true);
		mainmap.removeChild(screenShot);
		$("#export_image_link").html("");
		$(screenShot).remove();
		screenShot = null;
	}
}

function visible_screenshot()
{
	screenshot_epilogue();
        var mm = document.getElementById("innermap");
	screenShot = document.createElement('canvas');
        var mainmap = document.getElementById("map");
	mainmap.appendChild(screenShot);
	
        // CSS dimensions and canvas dimension have to be equal to get a 1:1 scaling

        var px = new RegExp("px|em", "g");

	var width = $(mm).css("width");
	var height = $(mm).css("height");
        width = parseInt(width.replace(px, ""));
        height = parseInt(height.replace(px, ""));

        //var mmWidth = width;
	$(screenShot).attr("height", height);
        $(screenShot).attr("width", width);

        $(screenShot).css("height", $(screenShot).attr("height"));
        $(screenShot).css("width", $(screenShot).attr("width"));

        var ctx = screenShot.getContext("2d");
        ctx.clearRect(0, 0, screenShot.width, screenShot.height);
	console.log("xWIDTH " + screenShot.width + " HEIGHT " + screenShot.height);

        xOffset = parseInt($("#innermap").css("left").replace(px, ""));
        yOffset = parseInt($("#innermap").css("top").replace(px, ""));
	
    var tiles_div = $("#innermap").parent().next().next().next();
    var tiles = tiles_div.children().first().children();
    console.log("len: " + tiles.length + " " +  $(screenShot).css("height") + " " +  $(screenShot).css("width"));
        for (var ii = 0 ; ii < tiles.length ; ii++) {
            var tile = $("img", tiles.eq(ii));
	    if (!tile || !tile.css("width")) {
		continue;
	    }
            var tile_width = parseInt(tile.css("width").replace(px, ""))
            var tile_height = parseInt(tile.css("height").replace(px, ""));
            var tile_xx = parseInt(tiles.eq(ii).css("left").replace(px, ""));
            var tile_yy = parseInt(tiles.eq(ii).css("top").replace(px, ""));
	    console.log("tile width: " + tile_width + " height " + tile_height + " " + tile_xx + " " + (tile_xx-xOffset) + " " + tile_yy + " " + (tile_yy-yOffset));
            ctx.drawImage(tile[0], 0, 0, tile_width, tile_height, tile_xx-xOffset, tile_yy-yOffset, tile_width, tile_height);
        }

        // Draw the overlay
	ctx.drawImage(mm.firstChild, 0, 0, mm.width, mm.height, 0, 0, mm.width, mm.height);
        // Save the screenshot canvas as URL and provide a link to that URL
	var url;
	try {
		url = screenShot.toDataURL();
	} catch(e) {
		console.log(e);
		error_dialog("Export Image", "Image cannot be generated: may be beyond image borders", window);
		screenshot_epilogue();
		return;
	}
	export_image_button_enable(false);
        console.log(url.substring(0, 40));
        $("#export_image_link").html("<span style='font-size: x-small; padding-left: 5px'><a a style='text-decoration: none; color: blue' onclick='screenshot_epilogue()' href='" + url + "' target='_blank' download='nv_image.png'>download image</a></span>");
}

function ExportImageLoader(exportImage, overlayImage, module, context, context2, ntiles, width, height, delta_x, delta_y, wait_cursor) {
	this.exportImage = exportImage;
	this.overlayImage = overlayImage;
	this.module = module;
	this.context = context;
	this.context2 = context2;
	this.total_img_cnt = ntiles*ntiles;
	this.img_cnt = 0;
	this.width = width;
	this.height = height;
	this.delta_x = delta_x;
	this.delta_y = delta_y;
	this.wait_cursor = wait_cursor;
}

/*
@! nv_export_image_enable()
@! nv_export_image_set_maxsize(1024)
@! nv_export_image_set_full_map(true)
@! nv_export_image_set_full_map(false)

merging images

sur CentOS
git clone 'http://git.imagemagick.org/repos/ImageMagick.git'
cd ImageMagick
./configure --prefix /bioinfo/users/eviara/ImageMagickPub

export MANPATH=~/ImageMagickPub/share/man

convert image_x_1_y_1.png image_x_2_y_1.png +append IMAGE_1.png
convert image_x_1_y_2.png image_x_2_y_2.png +append IMAGE_2.png
convert IMAGE_1.png IMAGE_2.png -append IMAGE.png

scripts/nv_assemble_images.sh

*/


function ExportImageLoaderIterator(exportImageLoader, count) {
	this.exportImageLoader = exportImageLoader;
	this.count = count;
	this.count2 = count*count;
	this.width_splitted = exportImageLoader.width/count;
	this.height_splitted = exportImageLoader.height/count;
	this.topelem = document.getElementById('export_image_link_multi_parts');
}

ExportImageLoaderIterator.prototype = {

	_perform: function() {
		var canvas = document.createElement('canvas');
		
		canvas.width = this.width_splitted;
		canvas.height = this.height_splitted;
		var ctx = canvas.getContext('2d');
		var x = this.current_abs * this.width_splitted;
		var y = this.current_ord * this.height_splitted
		var img_lnk;
		ctx.drawImage(this.exportImageLoader.exportImage, x, y, this.width_splitted, this.height_splitted, 0, 0, this.width_splitted, this.height_splitted);
		var url = canvas.toDataURL();
		img_lnk = document.createElement('div');
		console.log("x=" + x + " y=" + y + " width=" + this.width_splitted + " height=" + this.height_splitted + " URL.length=" + url.length);
		this.topelem.appendChild(img_lnk);
		export_image_button_enable(false);
		$(img_lnk).html("<span style='font-size: x-small; padding-left: 5px'><a style='text-decoration: none; color: blue' href='" + url + "' target='_blank' download='nv_image_x_" + (this.current_abs+1) + "_y_" + (this.current_ord+1) + ".png'>download image part " + this.current_count + " / " + this.count2 + "</a></span>");

		var exportImageLoaderIterator = this;
		$(img_lnk).click(function() {
			export_image_button_enable(true);
			$(this).remove();
			exportImageLoaderIterator.next();
		});
		//delete ctx;
		$(canvas).remove();
	},

	start: function() {
		this.current_count = 1;
		this.current_abs = 0;
		this.current_ord = 0;
		this._perform();
	},

	next: function() {
		this.current_count++;
		if (this.current_ord+1 < this.count) {
			this.current_ord++;
		} else if (this.current_abs+1 < this.count) {
			this.current_abs++;
			this.current_ord = 0;
		} else {
			return;
		}
		console.log("next abs=" + this.current_abs + " ord=" + this.current_ord);
		this._perform();
	}
};
	

ExportImageLoader.prototype = {

	imgLoaded: function() {
		if (++this.img_cnt == this.total_img_cnt) {
			overlay.drawExportImage(this.module, this.context2, this.delta_x, this.delta_y);

			this.context.drawImage(this.overlayImage, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
			console.log("EXPORT_IMAGE_MAX_WIDTH: " + EXPORT_IMAGE_MAX_WIDTH);
			console.log("total image width: " + this.width);
			var topelem = document.getElementById('export_image_link');
			if (this.width > EXPORT_IMAGE_MAX_WIDTH) {
				var count = this.width/EXPORT_IMAGE_MAX_WIDTH;
				var exportImageLoaderIterator = new ExportImageLoaderIterator(this, count);
				exportImageLoaderIterator.start();
			} else {
				var img_lnk = document.createElement('div');
				topelem.appendChild(img_lnk);
				var url = this.exportImage.toDataURL();
				export_image_button_enable(false);
				$(img_lnk).html("<span style='font-size: x-small; padding-left: 5px'><a style='text-decoration: none; color: blue' href='" + url + "' target='_blank' download='nv_image.png'>download image</a></span>");
				$(img_lnk).click(function() {
					export_image_button_enable(true);
					$(this).remove();
				});
			}
			this.wait_cursor.restore();
		}
	}
};

function navicell_export_image(module)
{
	if (!EXPORT_IMAGE_FULL_MAP) {
		visible_screenshot();
		return;
	}

        var exportImage = document.getElementById("export_image_canvas");

	var zoom = overlay.map_.zoom;
	var ntiles = 1 << zoom;
	var tile_width = 256; // hard-coded to be changed
	var tile_height = 256; // hard-coded to be changed
	var width = ntiles * tile_width;
	var height = ntiles * tile_height;

        var px = new RegExp("px|em", "g");

	$(exportImage).attr("height", height);
        $(exportImage).attr("width", width + "px");

        $(exportImage).css("height", $(exportImage).attr("height"));
        $(exportImage).css("width", $(exportImage).attr("width"));


        ctx = exportImage.getContext("2d");
        ctx.clearRect(0, 0, exportImage.width, exportImage.height);

	var imgs = [];
        var tiles_div = $("#innermap").parent().next().next().next();
        var tiles = tiles_div.children().first().children();

	var tile_map = {};
	var nobg = "";
	for (var ii = 0; ii < tiles.length; ++ii) {
	    var tile = $("img", tiles.eq(ii));
	    if (!tile || !tile.css("left")) {
		continue;
	    }
	    var left = parseInt(tiles.eq(ii).css("left").replace(px, ""));
	    var top = parseInt(tiles.eq(ii).css("top").replace(px, ""));
	    var src = tile.attr("src");
	    if (!src) {
		console.log("notice: no src at " + ii + "/" + tiles.length);
		continue;
	    }
	    if (!nobg && src.indexOf("_nobg") > 0) {
		nobg = "_nobg";
	    }
	    tile_map[src] = [left, top];
	}

	var delta_x = 0;
	var delta_y = 0;
	for (var ii = 0; ii < ntiles; ++ii) {
		for (var jj = 0; jj < ntiles; ++jj) {
			var src = "tiles/" + zoom + "/" + ii + "_" + jj + nobg + ".png";
			if (tile_map[src]) {
				var x_offset = (ii*tile_width);
				var y_offset = (jj*tile_height);
				delta_x = tile_map[src][0] - x_offset; 
				delta_y = tile_map[src][1] - y_offset;
				break;
			}
		}
	}

	// new
        var overlayImage = document.getElementById("overlay_image_canvas");
	$(overlayImage).attr("height", height);
        $(overlayImage).attr("width", width + "px");
        $(overlayImage).css("height", $(overlayImage).attr("height"));
        $(overlayImage).css("width", $(overlayImage).attr("width"));
        var ctx2 = overlayImage.getContext("2d");
        ctx2.clearRect(0, 0, overlayImage.width, overlayImage.height);

	var wait_cursor = new WaitCursor(["#export_image", "body"]);
	var exportImageLoader = new ExportImageLoader(exportImage, overlayImage, module, ctx, ctx2, ntiles, width, height, delta_x, delta_y, wait_cursor);
	for (var ii = 0; ii < ntiles; ++ii) {
		var tile = tiles.eq(ii);
		if (!tile) {
			console.log("notice: no tile at " + ii + " " + jj + " / " + ntiles);
			continue;
		}
		//var left = parseInt(tile.css("left").replace(px, ""));
		//var top = parseInt(tile.css("top").replace(px, ""));
		imgs[ii] = [];
		for (var jj = 0; jj < ntiles; ++jj) {
			var img = document.createElement('img');
			var src = "tiles/" + zoom + "/" + ii + "_" + jj + nobg + ".png";
			$(img).attr("src", src);
			img.xx = ii;
			img.yy = jj;
			img.onload = function() {
				ctx.drawImage(this, 0, 0, tile_width, tile_height, ((this.xx)*tile_width), ((this.yy)*tile_height), tile_width, tile_height);
				exportImageLoader.imgLoaded();
			};
			imgs[ii].push(img);

		}
	}
	$('html').css('overflow', 'hidden');
	$('body').css('overflow', 'hidden');
	$(overlay.div_).css('overflow', 'hidden');
	$("#map_canvas").css('overflow', 'hidden');
}
