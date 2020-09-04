/**
 * Stuart Pook, Copyright (C) 2011 Institut Curie
 *
 * Copyright (C) 2011-2012 Curie Institute, 26 rue d'Ulm, 75005 Paris, France
 * 
 * NaviCell is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * NaviCell is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA
 *
 * This file needs to be read by each post in the blog by code in the "Header and Footer" plugin,
 * section "HTML code to be inserted in the head section of each page"
 *
 * $Id: clickmap_blog.js 26694 2015-03-31 10:23:06Z eviara $
 */
var maps;

//http://www.clientcide.com/best-practices/dbug-a-consolelog-firebug-wrapper/
//dbug = {
//		firebug: false, debug: false, log: function(msg) {},
//		enable: function() { if(this.firebug) this.debug = true; dbug.log = console.debug; dbug.log('enabling dbug');	},
//		disable: function(){ if(this.firebug) this.debug = false; dbug.log = function(){}; }
//}
//if (typeof console != "undefined") { // safari, firebug
//	if (typeof console.debug != "undefined") { // firebug
//		dbug.firebug = true; if(window.location.href.indexOf("debug=true")>0) dbug.enable();
//	}
//}

// http://www.contentwithstyle.co.uk/content/make-sure-that-firebug-console-debug-doesnt-break-everything/index.html
var dbug = new function() {
	  this.log = function(str) {
	    try {
	      console.log(str);
	    } catch(e) {
	      // do nothing
	    }
	  };
	};
	
if (!window.console)
{
	window.console = new function() {
		this.log = function(str) {};
		this.dir = function(str) {};
	};
}

function show_map_and_markers(map_name, ids)
{
	if (!maps)
	{
		console.log("show_map_and_markers no maps");
		maps = Object();
		maps[""] = window;
	}
	
	var map = maps[map_name];
	if (map && !map.closed)
	{
		console.log("show_map_and_markers 2 map_name=", map_name, "map=", map, "maps=", maps);
				
		if (typeof map.to_open == 'undefined')
		{
			console.log("open missing");
			map.to_open = ids;
		}
		else if (map.to_open.length < 1)
		{
			console.log("open show_markers", map);
			map.show_markers(ids);
		}
		else
		{
			console.log("open concat", map.to_open, ids, map);
			map.to_open.concat(ids);
		}
		map.focus();
	}
	else
	{
		console.log("not open", map_name, maps);
		var url = map_location + "/" + map_name + "/index.html";
		console.log("opening " + url);
		map = window.open(url);
		map.to_open = ids;
		map.maps = maps;
		maps[map_name] = map;
	}
}

$(document).ready(
	function()
	{
		var f = function () {
			var map = $(this).find("span.map").attr("title");
			console.log("map", map);
			var ids = [];
			$(this).find("span.entity").each(function() { ids.push($(this).attr("title")); });
			if (ids.length == 0) {
				console.log("try again");
                                $(this).parent().parent().find("span.entity").each(function() { ids.push($(this).attr("title")); });
                        }
			console.log("ids", ids);
			show_map_and_markers(map, ids);
			return false;
		};
		
		$("a.show_map_and_markers").each(function(index, element) { element.onclick = f; });
	}
);
