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

var JXTREE_HELP = "Search syntax is as follows:\n\nPATTERN [/MOD]\n\nwhere PATTERN is a sequence of regular expressions\n- if regex are separated by comma, OR search is performed\n- if regex are separated by space, AND search is performed\n\nwhere MOD is a semi-colon separated list of MOD_ITEM\n\n where MOD_ITEM is under the form\n\nin=label\nin=tag\nin=annot\nin=all\n\ntoken=word\ntoken=regex\n\nop=eq\nop=neq\n\nclass=all\nclass=all_included\nclass=all_but_included\nclass=<i>class_name</i>,<i>class_name</i>,...\nclass!=<i>class_name</i>,<i>class_name</i>,...\n\nhighlight=off\nhighlight=on\n\nDefault is: /in=label;in=tag;token=word;op=eq;class=all_but_included;highlight=off\n\nExamples:\nrbx\nxp rbx\nxp,rbx\nxp rbx /in=label\nxp rbx /in=label;class=protein\nxp rbx /class=protein,gene\nxp rbx /class!=protein,gene\nxp rbx /op=neq;in=label;class=protein,gene\nxp rxb /token=regex;in=all";

function JXTreeMatcher(pattern, hints) {
	pattern = pattern.trim();

	if (pattern == "/?") {
		this.help = JXTREE_HELP;
		return null;
	}

	if (!hints) {
		hints = {};
	}

	this.hints = hints;
	this.hints.highlight = false;
	this.search_cs = "i";
	this.search_token = 0;
	this.search_in = 0;
	this.search_not = false;
	this.search_user_find = false;
	this.bubble = false;

	var tokens = pattern.split("/");
	this.class_filters = [];
	this.error = "";

	if (tokens.length == 2) {
		pattern = tokens[0].trim();
		var ori_mod_pattern = tokens[1].trim();
		if (ori_mod_pattern == "?") {
			this.help = JXTREE_HELP;
			return null;
		}
		var mod_pattern = ori_mod_pattern.toUpperCase();
		var mod_pattern_items = mod_pattern.split(";");
		for (var nn = 0; nn < mod_pattern_items.length; ++nn) {
			var mod_pattern_item = mod_pattern_items[nn].trim();
			if (!mod_pattern_item) {
				continue;
			}
			var mm = mod_pattern_item.split("=");
			if (mm.length != 2) {
				this.error = "\"/" + ori_mod_pattern + "\"";
				break;
			}
			var mod = mm[0].trim();
			var what = mm[1].trim();
			if (mod == "OP") {
				if (what == "NEQ") {
					this.search_not = true;
				} else if (what == "EQ") {
					this.search_not = false;
				} else {
					this.error = "\"/" + ori_mod_pattern + "\" : expected eq or neq after op=, got " + what;
					break;
				}
			} else if (mod == "TOKEN") {
				if (what == "WORD") {
					this.search_token = JXTreeMatcher.TOKEN_WORD;
				} else if (what == "REGEX") {
					this.search_token = JXTreeMatcher.TOKEN_REGEX;
				} else {
					this.error = "\"/" + ori_mod_pattern + "\" : expected regex, word or substr after token=, got " + what;
					break;
				}
			} else if (mod == "IN" || mod == "@") {
				if (what == "LABEL") {
					this.search_in |= JXTreeMatcher.IN_LABEL;
				} else if (what == "ANNOT") {
					this.search_in |= JXTreeMatcher.IN_ANNOT;
				} else if (what == "TAG") {
					this.search_in |= JXTreeMatcher.IN_TAG;
				} else if (what == "ALL") {
					this.search_in |= JXTreeMatcher.IN_ALL;
				} else {
					this.error = "\"/" + ori_mod_pattern + "\" : expected name, annot or all after in=, got " + what;
					break;
				}
			} else if (mod == "HIGHLIGHT") {
				if (what == "ON") {
					this.hints.highlight = true;
				} else if (what == "OFF") {
					this.hints.highlight = false;
				} else {
					this.error = "\"/" + ori_mod_pattern + "\" : expected on or off after highlight=, got " + what;
					break;
				}
			} else {
				if (mod == "CLASS" || mod == "CLASS!") {
					var class_filter = {};
					class_filter.is_not = mod[mod.length-1] == "!";
					class_filter.classes = what.split(",");
					this.class_filters.push(class_filter);
					if (hints.class_list) {
						for (var kk = 0; kk < class_filter.classes.length; ++kk) {
							var cls = class_filter.classes[kk];
							if (cls == "ALL" || cls == "ALL_INCLUDED" || cls == "ALL_BUT_INCLUDED") {
								continue;
							}
							var found = false;
							for (var cls2 in hints.class_list) {
								if (cls == cls2) {
									found = true;
									break;
								}
							}
							if (!found) {
								this.error = "Invalid modificator \"/" + ori_mod_pattern + "\" : unknown class \"" + cls + "\"\n\n";
								this.error += "Valid classes are:\n"
								for (var cls2 in hints.class_list) {
									this.error += cls2 + "\n";
								}
								return null;
							}
						}
					}
				} else {
					this.error = "\"/" + ori_mod_pattern + "\" : expected name, annot or all after in=, got " + what;
					break;
				}
			}
		}
		if (this.error) {
			this.error = "Invalid modificator: " + this.error + "\n\n";
			this.error += JXTREE_HELP;
			return;
		}
	}

	if (!this.search_in) {
		this.search_in = JXTreeMatcher.IN_LABEL|JXTreeMatcher.IN_TAG;
	}
	if ((this.search_in & (JXTreeMatcher.IN_TAG|JXTreeMatcher.IN_ANNOT)) != 0) {
		this.search_user_find = true;
	}
	if (!this.search_token) {
		this.search_token = JXTreeMatcher.TOKEN_WORD;
	}

	if (!this.class_filters.length) {
		var class_filter = {};
		class_filter.is_not = false;
		class_filter.classes = ["ALL_BUT_INCLUDED"];
		this.class_filters.push(class_filter);
	}

	var patterns = pattern.split(',');
	if (patterns.length > 1) {
		this.and_search = false;
		this.or_search = true;
	} else {
		patterns = pattern.split(/[ \t]+/);
		this.and_search = true;
		this.or_search = false;
	}

	this.regex_arr = [];
	this.patterns = [];
	if (this.search_token == JXTreeMatcher.TOKEN_REGEX) {
		for (var nn = 0; nn < patterns.length; ++nn) {
			var pattern = patterns[nn].trim();
			if (pattern) {
				if (pattern[0] != '^') {
					pattern = "\\w*" + pattern;
				}
				if (pattern[pattern.length-1] != '$') {
					pattern = pattern + "\\w*";
				}
				this.regex_arr.push(new RegExp("\\b" + pattern + "\\b", this.search_cs));
			}
		}
	} else if (this.search_token == JXTreeMatcher.TOKEN_WORD) {
		var re = new RegExp("\\*", "g");
		for (var nn = 0; nn < patterns.length; ++nn) {
			var pattern = patterns[nn].trim().replace(re, ".*");;
			if (pattern) {
				this.regex_arr.push(new RegExp("\\b" + pattern + "\\b", this.search_cs));
			}
		}
	}
}

JXTreeMatcher.TOKEN_WORD = 1;
JXTreeMatcher.TOKEN_REGEX = 2;

JXTreeMatcher.IN_LABEL = 1;
JXTreeMatcher.IN_TAG = 2;
JXTreeMatcher.IN_ANNOT = 4;
JXTreeMatcher.IN_ALL = (JXTreeMatcher.IN_LABEL|JXTreeMatcher.IN_TAG|JXTreeMatcher.IN_ANNOT);

JXTreeMatcher.prototype = {
};

var jxtree_mute = true;

function JXTree(_document, datatree, div, mapfun) {
	if (!_document) {
		_document = document;
	}
	this.document = _document;
	this.mapfun = mapfun;
	this.label_map = {};
	this.node_id = 0;
	this.check_state_changed = null;
	this.open_state_changed = null;
	this.on_click_before = null;
	this.on_click_after = null;
	this.user_find = null;
	this.div = div;
	this.node_map = {};
	this.node_user_map = {};
	this.roots = [];
	if (datatree) {
		this.buildFromData(datatree, div);
	}
}

JXTree.UNCHECKED = 4;
JXTree.CHECKED = 5;
JXTree.UNDETERMINED = 6;
JXTree.CLOSED = 10;
JXTree.OPEN = 11;

JXTree.prototype = {
	buildFromData: function(datatree, div) {
		if (datatree.length) {
			var jxtree = this;
			$.each(datatree, function() {
				var root = jxtree.buildRoot(this, div);
				jxtree.addRoot(root);
			});
		} else {
			var root = this.buildRoot(datatree, div);
			this.addRoot(root);
		}
	},

	buildRoot: function(datatree, div) {
		var root = null;
		var mapfun = this.mapfun;
		if (!mapfun) {
			root = new JXTreeNode(this, datatree.label, datatree.left_label, datatree.right_label, datatree.data, datatree.id);
			this.buildNodes(root, datatree.children);
		} else {
			root = new JXTreeNode(this, mapfun(datatree, 'label'), mapfun(datatree, 'left_label'), mapfun(datatree, 'right_label'), mapfun(datatree, 'data'), mapfun(datatree, 'id'));
			this.buildNodes(root, mapfun(datatree, 'children'));
		}
		if (div) {
			root.buildHTML(div);
			root.show(true);
		}
		return root;
	},

	buildNodes: function(root_node, children_data) {
		if (!children_data) {
			return;
		}
		for (var nn = 0; nn < children_data.length; ++nn) {
			var child_data = children_data[nn];
			var child_node;
			var mapfun = this.mapfun;
			if (!mapfun) {
				child_node = new JXTreeNode(this, child_data.label, child_data.left_label, child_data.right_label, child_data.data, child_data.id);
			} else {
				child_node = new JXTreeNode(this, mapfun(child_data, 'label'), mapfun(child_data, 'left_label'), mapfun(child_data, 'right_label'), mapfun(child_data, 'data'), mapfun(child_data, 'id'));
			}
			root_node.addChild(child_node);
			this.buildNodes(child_node, mapfun(child_data, 'children'));
		}
	},

	newNode: function(node) {
		var node_id = ++this.node_id;
		node.setId(node_id);
		this.node_map[node_id] = node;
		if (node.user_id) {
			this.node_user_map[node.user_id] = node;
		}
		return node_id;
	},

	complete: function(datatree, div) {
		if (!this.div) {
			this.div = div;
		}
		if (!this.roots) {
			if (datatree) {
				this.buildFromData(datatree, this.div);
			}
		}
		if (this.roots && this.div) {
			for (var nn = 0; nn < this.roots.length; ++nn) {
				var root = this.roots[nn];
				if (!root.nd_elem) {
					root.buildHTML(this.div);
					root.show(true);
				}
			}
		}
	},

	addRoot: function(root) {
		this.roots.push(root);
	},

	scanTree: function(scanner) {
		$.each(this.roots, function() {
			this.scanNode(scanner);
		});
	},

	clone: function(node_map) {
		var cloned_jxtree = new JXTree(this.document);
		var jxtree = this;
		$.each(this.roots, function() {
			var root = this.cloneSubtree(cloned_jxtree, node_map);
			if (root) {
				cloned_jxtree.addRoot(root);
			}
		});
		return cloned_jxtree;
	},

	getRootNodes: function() {
		return this.roots;
	},

	getNodeCount: function() {
		return this.node_id;
	},

	onClickBefore: function(action) {
		this.on_click_before = action;
	},

	onClickAfter: function(action) {
		this.on_click_after = action;
	},

	userFind: function(action) {
		this.user_find = action;
	},

	checkStateChanged: function(action) {
		this.check_state_changed = action;
	},

	openStateChanged: function(action) {
		this.open_state_changed = action;
	},

	getNodeByUserId: function(user_id) {
		return this.node_user_map[user_id];
	},

	find: function(pattern, action, hints) {
		pattern = pattern.trim();
		var matcher = new JXTreeMatcher(pattern, hints);
		if (matcher.error || matcher.help) {
			if (hints) {
				hints.error = matcher.error;
				hints.help = matcher.help;
			}
			return null;
		}
		var nodes = [];
		if (pattern) {
			var user_find = this.user_find;
			for (var id in this.node_map) {
				var node = this.node_map[id];
				if (node.isLeaf()) {
					if (node.match(matcher)) {
						nodes.push(node);
					}
				}
			}
		}
		if (action == 'select') {
			for (var nn = 0; nn < this.roots.length; ++nn) {
				this.roots[nn].checkSubtree(JXTree.UNCHECKED);
			}
			for (var nn = 0; nn < nodes.length; ++nn) {
				var node = nodes[nn];
				node.checkSubtree(JXTree.CHECKED);
				node.openSupertree(JXTree.OPEN);
			}
		}
		if (action == 'subtree') {
			var node_map = {};
			for (var nn = 0; nn < nodes.length; ++nn) {
				node_map[nodes[nn].getId()] = true;
			}
			var jxsubtree = this.clone(node_map);
			if (hints && hints.div) {
				if (true) {
					$(hints.div).empty();
				} else {
					var div_id = $(hints.div).attr("id");
					var parent = $(hints.div).parent();
					$(hints.div).remove();
					parent.append("<div id='" + div_id + "'></div>");
					hints.div = $("#" + div_id).get(0);
				}
				jxsubtree.complete(null, hints.div);
				for (var nn = 0; nn < jxsubtree.roots.length; ++nn) {
					jxsubtree.roots[nn].openSubtree(JXTree.OPEN);
				}
			}
			jxsubtree.userFind(this.user_find);
			jxsubtree.checkStateChanged(this.check_state_changed);
			jxsubtree.openStateChanged(this.open_state_changed);
			jxsubtree.onClickBefore(this.on_click_before);
			jxsubtree.onClickAfter(this.on_click_after);
			jxsubtree.found = nodes.length;
			return jxsubtree;
		}
		return nodes.length;
	}
};

function JXTreeNode(jxtree, label, left_label, right_label, user_data, user_id) {
	this.jxtree = jxtree;
	this.label = label;
	this.jxtree.label_map[label] = this;
	this.left_label = left_label;
	this.right_label = right_label;
	this.user_data = user_data;
	this.user_id = user_id;
	this.children = [];
	this.check_state = JXTree.UNCHECKED;
	this.open_state = JXTree.CLOSED;

	this.nd_elem = null; // li node
	this.cb_elem = null; // checkbox
	this.oc_elem = null; // open/close icon

	this.jxtree.newNode(this);
}

JXTreeNode.prototype = {

	getId: function() {
		return this.id;
	},

	setId: function(id) {
		this.id = id;
	},

	clone: function(jxtree) {
		return new JXTreeNode(jxtree, this.label, this.left_label, this.right_label, this.user_data, this.user_id);
	},

	match: function(matcher) {
		if (matcher.class_filters.length) {
			for (var jj = 0; jj < matcher.class_filters.length; ++jj) {
				var class_filter = matcher.class_filters[jj];
				var node_cls = jxtree_get_node_class(this);  // BAD! should be an handler
				if (!node_cls) {
					continue;
				}
				node_cls = node_cls.toUpperCase();
				var cls_included = node_cls.match(/:INCLUDED/, "i");
				if (class_filter.is_not) {
					for (var nn = 0; nn < class_filter.classes.length; ++nn) {
						var cls = class_filter.classes[nn].trim();
						if (cls == "ALL" || node_cls == cls) {
							return false;
						}
						if (cls == "ALL_INCLUDED" && cls_included) {
							return false;
						}
						if (cls == "ALL_BUT_INCLUDED" && !cls_included) {
							return false;
						}
					}
				} else {
					var found = false;
					for (var nn = 0; nn < class_filter.classes.length; ++nn) {
						var cls = class_filter.classes[nn].trim();
						if (cls == "ALL" || node_cls == cls) {
							found = true;
							break;
						}
						if (cls == "ALL_INCLUDED" && cls_included) {
							found = true;
							break;
						}
						if (cls == "ALL_BUT_INCLUDED" && !cls_included) {
							found = true;
							break;
						}
					}
					if (!found) {
						return false;
					}
				}
			}
		}

		var match_cnt = 0;
		var search_in_label = (matcher.search_in & JXTreeMatcher.IN_LABEL) != 0;
		var search_in_user_find = matcher.search_user_find && this.jxtree.user_find;

		for (var nn = 0; nn < matcher.regex_arr.length; ++nn) {
			var regex = matcher.regex_arr[nn];
			var matches = false;
			if (search_in_label) {
				if (this.label.match(regex)) {
					matches = true;
				} 
			}
			if (!matches && search_in_user_find) {
				if (this.jxtree.user_find(matcher, regex, this)) {
					matches = true;
				}
			}
			if (matches) {
				match_cnt++;
				if (matcher.or_search) {
					return matcher.search_not ? false : true;
				}
			} else {
				if (matcher.and_search) {
					return matcher.search_not ? true : false;
				}
			}
		}
		return matcher.search_not ? (match_cnt == 0) : match_cnt > 0;
	},

	matchRegex: function(regex) {
		var label = this.label;
		if (label.match(regex)) {
			return true;
		} 
		if (this.jxtree.user_find && this.jxtree.user_find(regex, this)) {
			return true;
		}
		return false;
	},

	scanNode: function(scanner) {
		scanner.scanNode(this);
		if (this.isLeaf()) {
			return;
		}
		$.each(this.children, function() {
			this.scanNode(scanner);
		});
	},

	cloneSubtree: function(jxtree, node_map) {
		if (this.isLeaf()) {
			if (node_map == null || node_map == undefined || node_map[this.getId()]) {
				return this.clone(jxtree);
			}
			return null;
		}
		var children = [];
		for (var nn = 0; nn < this.children.length; ++nn) {
			var child = this.children[nn].cloneSubtree(jxtree, node_map);
			if (child) {
				children.push(child);
			}
		}
		if (children.length || node_map == null || node_map == undefined || node_map[this.getId()]) {
			var clone = this.clone(jxtree);
			for (var nn = 0; nn < children.length; ++nn) {
				clone.addChild(children[nn]);
			}
			return clone;
		}
		return null;
	},

	addChild: function(node) {
		this.children.push(node);
		node.parent = this;
	},

	setOpenState: function(open) {
		var open_state;
		if (open == true) {
			open_state = JXTree.OPEN;
		} else if (open == false) {
			open_state = JXTree.CLOSED;
		} else {
			open_state = open;
		}

		if (this.open_state != open_state) {
			this.open_state = open_state;
			if (this.oc_elem) {
				for (var nn = 0; nn < this.children.length; ++nn) {
					this.children[nn].show(this.open_state == JXTree.OPEN);
				}
				if (!this.isLeaf()) {
					if (this.open_state == JXTree.OPEN) {
						this.oc_elem.removeClass("jxtree-closed");
						this.oc_elem.addClass("jxtree-open");
					} else {
						this.oc_elem.removeClass("jxtree-open");
						this.oc_elem.addClass("jxtree-closed");
					}
				}
			}
		}
	},

	setCheckState: function(checked) {
		var check_state;
		if (checked == true) {
			check_state = JXTree.CHECKED;
		} else if (checked == false) {
			check_state = JXTree.UNCHECKED;
		} else {
			check_state = checked;
		}

		if (check_state != this.check_state) {
			if (this.jxtree.check_state_changed) {
				var check_state_new = this.jxtree.check_state_changed(this, check_state);
				if (check_state_new) {
					check_state = check_state_new;
				}
			}
			if (check_state != this.check_state) {
				this.check_state = check_state;
				this.setCheckboxClass();
			}
		}
	},

	getCheckState: function() {
		return this.check_state;
	},

	getChildren: function() {
		return this.children;
	},

	getParent: function() {
		return this.parent;
	},

	getUserData: function() {
		return this.user_data;
	},

	openSubtree: function(open_state) {
		this.setOpenState(open_state);
		for (var nn = 0; nn < this.children.length; ++nn) {
			this.children[nn].openSubtree(open_state);
		}
	},

	openSupertree: function(open_state) {
		if (this.parent) {
			this.parent.setOpenState(open_state);
			this.parent.openSupertree(open_state);
		}
	},

	isOpen: function() {
		return this.open_state == JXTree.OPEN;
	},

	isChecked: function() {
		return this.check_state == JXTree.CHECKED;
	},

	isUnchecked: function() {
		return this.check_state == JXTree.UNCHECKED;
	},

	isUndetermined: function() {
		return this.check_state == JXTree.UNDETERMINED;
	},

	show: function(show) {
		$(this.nd_elem).css("display", (show ? "block" : "none"));
	},

	showSubtree: function(show) {
		this.show(show);
		for (var nn = 0; nn < this.children.length; ++nn) {
			this.children[nn].showSubtree(show);
		}
	},

	showSupertree: function(show) {
		if (this.parent) {
			this.parent.show(show);
			this.parent.showSupertree(show);
		}
	},

	isLeaf: function() {
		return this.children.length == 0;
	},

	setCheckboxClass: function() {
		if (this.cb_elem) {
			this.cb_elem.removeClass("jxtree-checkbox-checked");
			this.cb_elem.removeClass("jxtree-checkbox-unchecked");
			this.cb_elem.removeClass("jxtree-checkbox-undetermined");

			if (this.isChecked()) {
				this.cb_elem.addClass("jxtree-checkbox-checked");
			} else if (this.isUnchecked()) {
				this.cb_elem.addClass("jxtree-checkbox-unchecked");
			} else if (this.isUndetermined()) {
				this.cb_elem.addClass("jxtree-checkbox-undetermined");
			}
		}
	},

	setSubtreeState: function(check_state) {
		this.setCheckState(check_state);

		for (var nn = 0; nn < this.children.length; ++nn) {
			this.children[nn].setSubtreeState(check_state);
		}
	},

	updateSupertreeState: function() {
		if (this.children.length > 0) {
			var check_state = this.children[0].getCheckState();
			for (var nn = 1; nn < this.children.length; ++nn) {
				if (this.children[nn].getCheckState() != check_state) {
					check_state = JXTree.UNDETERMINED;
					break;
				}
			}
			this.setCheckState(check_state);
		}
		if (this.parent) {
			this.parent.updateSupertreeState();
		}
	},

	buildHTML: function(container) {
		var ul = this.jxtree.document.createElement('ul');
		$(ul).css("padding-left", "0px");
		$(ul).addClass("jxtree");
		container.appendChild(ul);
		this.buildHTMLNodes(ul);
		container.appendChild(ul);
	},

	checkSubtree: function(check_state) {
		this.setSubtreeState(check_state);

		if (this.parent) {
			this.parent.updateSupertreeState();
		}
	},

	toggleOpen: function() {
		var open_state = (this.open_state == JXTree.OPEN ? JXTree.CLOSED : JXTree.OPEN);

		if (this.jxtree.open_state_changed) {
			var open_state_new = this.jxtree.open_state_changed(this, open);
			if (open_state_new) {
				open_state = open_state_new;
			}
		}

		this.setOpenState(open_state);
	},

	toggleCheck: function() {
		this.checkSubtree(!this.isChecked());
	},

	eventListeners: function() {
		var node = this;

		this.oc_elem.click(function() {
			node.toggleOpen();
		});

		this.cb_elem.click(function() {
			if (node.jxtree.on_click_before) {
				node.jxtree.on_click_before(node, node.isChecked());
			}
			node.toggleCheck();
			if (node.jxtree.on_click_after) {
				node.jxtree.on_click_after(node, node.isChecked());
			}
		});
	},

	buildHTMLNodes: function(container) {
		if (!this.label) {
			return null;
		}
		var li = this.jxtree.document.createElement('li');
		var ins_oc = this.jxtree.document.createElement('ins');
		li.appendChild(ins_oc);

		var ins_oc_obj = $(ins_oc);
		ins_oc_obj.addClass("jxtree-default");
		if (!this.isLeaf()) {
			ins_oc_obj.addClass("jxtree-open");
		} else {
			ins_oc_obj.addClass("jxtree-leaf");
		}

		var ins_cb = this.jxtree.document.createElement('ins');
		var ins_cb_obj = $(ins_cb);
		ins_cb_obj.addClass("jxtree-default");
		ins_cb_obj.addClass("jxtree-checkbox-unchecked");

		li.appendChild(ins_cb);

		var label = '';
		var ins = this.jxtree.document.createElement('ins');
		if (this.left_label) {
			label += this.left_label + ' '; //"&nbsp;";
		}
		label += this.label;
		if (this.right_label) {
			label +=  ' ' + this.right_label;
		}
		$(ins).html(label);
		li.appendChild(ins);

		var node = this;
		container.appendChild(li);

		if (this.children.length) {
			var ul = this.jxtree.document.createElement('ul');
			for (var nn = 0; nn < this.children.length; ++nn) {
				var li_child = this.children[nn].buildHTMLNodes(ul);
				if (li_child) {
					ul.appendChild(li_child);
				}
			}
			li.appendChild(ul);
		}

		this.oc_elem = ins_oc_obj;
		this.cb_elem = ins_cb_obj;
		this.nd_elem = li;

		this.eventListeners();

		this.open_state = JXTree.CLOSED;
		this.oc_elem.addClass("jxtree-closed");
		this.show(false);

		return this.nd_elem;
	}
};
