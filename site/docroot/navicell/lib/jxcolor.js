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

function RGBColor(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
}

RGBColor.prototype = {
	setRGB: function(red, green, blue) {
		this.red = red;
		this.green = green;
		this.blue = blue;
	},

	getRed: function() {
		return this.red;
	},

	getGreen: function() {
		return this.green;
	},

	getBlue: function() {
		return this.blue;
	},

	toHex: function(cc) {
		var str = cc.toString(16).substr(0, 2);
		while (str.length < 2) {
			str = "0" + str;
		}
		return str.toUpperCase();
	},

	getRGBValue: function() {
		return this.toHex(this.red) + this.toHex(this.green) + this.toHex(this.blue);
	}
};

RGBColor.fromHex = function(str) {
	var rgb1 = str.substring(0, 2);
	var rgb2 = str.substring(2, 4);
	var rgb3 = str.substring(4, 6);
	return new RGBColor(parseInt("0x" + rgb1), parseInt("0x" + rgb2), parseInt("0x" + rgb3));
}

RGBColor.COLOR_PALETTE = [];

RGBColor.buildColorPalette = function() {
	// must be as long as MAX_DISCRETE_VALUES
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x80, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0x80));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x80, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0x80));
}	
/* 24 colors from Eric Bonnet:
 "#FF0000FF" "#FF4000FF" "#FF8000FF" "#FFBF00FF" "#FFFF00FF" "#BFFF00FF"
 "#80FF00FF" "#40FF00FF" "#00FF00FF" "#00FF40FF" "#00FF80FF" "#00FFBFFF"
 "#00FFFFFF" "#00BFFFFF" "#0080FFFF" "#0040FFFF" "#0000FFFF" "#4000FFFF"
 "#8000FFFF" "#BF00FFFF" "#FF00FFFF" "#FF00BFFF" "#FF0080FF" "#FF0040FF" 
*/

RGBColor.buildColorPalette_old = function() {
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE6, 0x7E, 0x30));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7F, 0xDD, 0x4C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x88, 0x42, 0x1D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x79, 0xF8, 0xF8));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xFE));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xA7, 0x67, 0x26));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0x82, 0xC4, 0x6C));
	// replaced by:
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x60, 0x91, 0x50));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0x91, 0x28, 0x3B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF0, 0xC3, 0x00));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xAD, 0x39, 0x0E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x88, 0x4D, 0xA7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x30, 0x30, 0x30));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xAD, 0x4F, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5A, 0x5E, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCE, 0xCE, 0xCE));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0xFF));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xEF, 0xEF, 0xEF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7B, 0xA0, 0x5B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x37, 0x00, 0x28));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9D, 0x3E, 0x0C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xCB, 0x60));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x56, 0x82, 0x03));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x7F, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x1E, 0x7F, 0xCB));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF0, 0xFF, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x74, 0xD0, 0xF1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA9, 0xEA, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAE, 0x64, 0x2D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xD1, 0xB6, 0x06));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8B, 0x6C, 0x42));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC8, 0xAD, 0x7F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF5, 0xF5, 0xDC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAF, 0xA7, 0x7B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF0, 0xE3, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xF4, 0x8D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x76, 0x6F, 0x64));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF1, 0xE2, 0xBE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xE4, 0xC4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x85, 0x6D, 0x4D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4E, 0x3D, 0x28));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0xFF));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xE2));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xFE));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFD, 0xF0));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFB, 0xFC, 0xFA));
	//RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFD, 0xF0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF6, 0xFE, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF4, 0xFE, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE8, 0xD6, 0x30));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5B, 0x3C, 0x11));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x3A, 0x8E, 0xBA));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x54, 0x72, 0xAE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x04, 0x8B, 0x9A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x26, 0xC4, 0xEC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8E, 0xA2, 0xC6));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x77, 0xB5, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x22, 0x42, 0x7C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x33, 0x66));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x24, 0x44, 0x5C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xCC, 0xCB));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDF, 0xF2, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2C, 0x75, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBB, 0xD2, 0xE1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0xD0, 0xD0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x56, 0x73, 0x9A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x2F, 0xA7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x60, 0x50, 0xDC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x0F, 0x05, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x1B, 0x01, 0x9B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x06, 0x77, 0x90));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x66, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x1D, 0x48, 0x51));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x31, 0x8C, 0xE7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x42, 0x5B, 0x8A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE7, 0xA8, 0x54));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE2, 0xBC, 0x74));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6D, 0x07, 0x1A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6B, 0x0D, 0x0D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFC, 0xDC, 0x12));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x84, 0x2E, 0x1B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x61, 0x4E, 0x1A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x3F, 0x22, 0x04));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5B, 0x3C, 0x11));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCD, 0x85, 0x3F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6B, 0x57, 0x31));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBD, 0x33, 0xA4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x70, 0x29, 0x63));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCD, 0xCD, 0x0D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x61, 0x4B, 0x3A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2F, 0x1B, 0x0C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x35, 0x7A, 0xB7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x46, 0x2E, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x78, 0x5E, 0x2F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7E, 0x58, 0x35));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x5E, 0x4D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7E, 0x33, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x96, 0x00, 0x18));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xC3, 0xAC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF4, 0x66, 0x1B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x3A, 0x02, 0x0D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDE, 0x31, 0x63));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF4, 0x00, 0xA1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDA, 0x32, 0x87));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xEC, 0x3B, 0x83));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xC3, 0xAC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xD0, 0xC0, 0x7A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFB, 0xF2, 0xB7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x10));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7F, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0x6D, 0x5A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8B, 0x6C, 0x42));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x85, 0x53, 0x0F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5A, 0x3A, 0x22));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDB, 0x17, 0x02));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0xFF, 0x3C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDF, 0x6D, 0x14));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB9, 0xB2, 0x76));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x84, 0x5A, 0x3B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBA, 0x9B, 0x61));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6A, 0x45, 0x5D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x70, 0x35, 0x16));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6A, 0x4B, 0x21));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC6, 0x08, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0xE9, 0xE0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE7, 0x3E, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDC, 0x14, 0x3C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0xF1, 0xB8));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xE7, 0xF0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x69, 0xB4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB3, 0x67, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2B, 0xFA, 0xFA));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x15, 0x60, 0xBD));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x0B, 0x16, 0x16));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xED, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xE0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x01, 0xD7, 0x58));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBA, 0xBA, 0xBA));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xED, 0xED, 0xED));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAD, 0x4F, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x84, 0x84, 0x84));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x49, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x99, 0x51, 0x2B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE6, 0xE6, 0x97));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBF, 0x30, 0x30));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA4, 0x24, 0x24));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC7, 0x2C, 0x48));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE2, 0x50, 0x98));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0x3F, 0x92));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF4, 0x00, 0xA1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0x59, 0xC2));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC1, 0x54, 0xC1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xEE, 0x10, 0x10));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x64, 0x9B, 0x88));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC9, 0xA0, 0xDC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBB, 0xAE, 0x98));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE9, 0x38, 0x3F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6E, 0x0B, 0x14));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x60, 0x60, 0x60));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAF, 0xAF, 0xAF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xD2, 0xCA, 0xEC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x68, 0x5E, 0x43));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x67, 0x71, 0x79));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7F, 0x7F, 0x7F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCE, 0xCE, 0xCE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC1, 0xBF, 0xB1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCF, 0x0A, 0x1D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE2, 0x13, 0x13));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x94, 0x7F, 0x60));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDF, 0x73, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0x96, 0xA0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x6F, 0x7D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x79, 0x1C, 0xF8));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4B, 0x00, 0x82));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6F, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2E, 0x00, 0x6C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x78, 0x5E, 0x2F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0xD4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x87, 0xE9, 0x90));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0xEE, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF6, 0xDC, 0x12));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE7, 0xF0, 0x0D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDF, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xEF, 0xD8, 0x07));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xED, 0xFF, 0x0C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xEE, 0xD1, 0x53));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xF0, 0xBC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xE4, 0x36));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xF8, 0x6C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0xE3, 0x5F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x94, 0x81, 0x2B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x26, 0x61, 0x9C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8F, 0x59, 0x22));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x96, 0x83, 0xEC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAC, 0x1E, 0x44));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB6, 0x66, 0xD2));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFA, 0xF0, 0xE6));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x37, 0x2F, 0x25));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5B, 0x3C, 0x11));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDB, 0x00, 0x73));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0x00, 0x80));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xDE, 0x75));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x1F, 0xA0, 0x55));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xA3, 0x47));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x03, 0x22, 0x4C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x58, 0x29, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB3, 0xB1, 0x91));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xD4, 0x73, 0xD4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDE, 0x98, 0x16));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x16, 0xB8, 0x4E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x54, 0xF9, 0x8D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDA, 0xB3, 0x0A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x87, 0x59, 0x1A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC7, 0xCF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFC, 0x5D, 0x5D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0xE2, 0x69));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xFE, 0xFE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x10));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x12, 0x0D, 0x16));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x13, 0x0E, 0x0A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x13, 0x0E, 0x0A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2F, 0x1E, 0x0E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x95, 0x56, 0x28));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDF, 0xAF, 0x2C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDD, 0x98, 0x5C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x70, 0x8D, 0x23));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x66, 0xCC, 0xCC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF2, 0xFF, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xD7, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x7F, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCC, 0x55, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDA, 0x70, 0xD6));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFC, 0xD2, 0x1C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFC, 0xD2, 0x1C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x29, 0x21, 0x07));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xE3, 0x47));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xEF, 0xD5));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xED, 0xD3, 0x8C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCF, 0xA0, 0xE9));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x91, 0x28, 0x3B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x56, 0x73, 0x9A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0xBF, 0xB7));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xD5, 0x84, 0x90));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCC, 0xCC, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xCC, 0xCC, 0xCC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBE, 0xF5, 0x74));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFA, 0xF0, 0xC5));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x79, 0x80, 0x81));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB6, 0x78, 0x23));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC6, 0x08, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9E, 0x0E, 0x40));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4C, 0xA6, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x81, 0x14, 0x53));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4E, 0x16, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x91, 0x28, 0x3B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC3, 0xB4, 0x70));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA8, 0x98, 0x74));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x2D, 0x24, 0x1E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0x6C, 0x9E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC4, 0x69, 0x8F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF9, 0x42, 0x9E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x55, 0xA3));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x69, 0xB4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0xBF, 0xD2));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xC0, 0xCB));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFD, 0x3F, 0x92));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x99, 0x7A, 0x8D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0x7F, 0xBE));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0x28, 0xA2));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x14, 0xC1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x33, 0xCC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFC, 0x0F, 0xC0));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x86, 0x6A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x6F, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0x7F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0x23, 0x0C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA5, 0x26, 0x0A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB8, 0x20, 0x10));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBB, 0x0B, 0x0B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE3, 0x26, 0x36));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA9, 0x11, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xED, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x80, 0x18, 0x18));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF7, 0x23, 0x0C));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBC, 0x20, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFE, 0x1B, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x92, 0x00, 0x17));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC7, 0x15, 0x85));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x85, 0x06, 0x06));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAE, 0x4A, 0x34));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA9, 0x11, 0x01));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x98, 0x57, 0x17));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAD, 0x4F, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE0, 0x11, 0x5F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE0, 0xCD, 0xA9));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x00, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF3, 0xD6, 0x17));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x01, 0x31, 0xB4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x73, 0x08, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x85, 0x06, 0x06));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x01, 0x31, 0xB4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x8E, 0x8E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xF8, 0x8E, 0x55));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x91, 0xA4));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8D, 0x40, 0x24));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xAE, 0x89, 0x64));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x14, 0x94, 0x14));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x33, 0x99));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x01, 0xD7, 0x58));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0xFF, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9E, 0x9E, 0x9E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9F, 0x55, 0x1E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x7F, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA7, 0x55, 0x02));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x46, 0x3F, 0x32));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x92, 0x6D, 0x27));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x8A, 0x33, 0x24));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE9, 0x74, 0x51));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4E, 0x16, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDE, 0x29, 0x16));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFA, 0xEA, 0x73));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xBB, 0xAC, 0xAC));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x25, 0xFD, 0xE9));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE1, 0xCE, 0x9A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xE9, 0xC9, 0xB1));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xFF, 0x09, 0x21));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xDB, 0x17, 0x02));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0x00));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9F, 0xE8, 0x55));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x09, 0x6A, 0x09));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x83, 0xA6, 0x97));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xC2, 0xF7, 0x32));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xB0, 0xF2, 0xB6));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x18, 0x39, 0x1E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x95, 0xA5, 0x95));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x1B, 0x4F, 0x08));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x22, 0x78, 0x0F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x17, 0x57, 0x32));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x3A, 0x9D, 0x23));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0x56, 0x1B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x79, 0x89, 0x33));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x85, 0xC1, 0x7E));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x9E, 0xFD, 0x38));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x38, 0x6F, 0x48));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x59, 0x66, 0x43));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x67, 0x9F, 0x5A));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x97, 0xDF, 0xC6));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x3A, 0xF2, 0x4B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x01, 0x79, 0x6F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x4C, 0xA6, 0x6B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x34, 0xC9, 0x24));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x57, 0xD5, 0x3B));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x00, 0xFF, 0x7F));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x09, 0x52, 0x28));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x68, 0x9D, 0x71));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA5, 0xD1, 0x52));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x5A, 0x65, 0x21));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x7F, 0x00, 0xFF));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x68, 0x21, 0x45));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x72, 0x3E, 0x64));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0xA1, 0x06, 0x84));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x40, 0x82, 0x6D));
	RGBColor.COLOR_PALETTE.push(new RGBColor(0x6C, 0x02, 0x77));
}

RGBColor.buildColorPalette();

function color_palette(cnt, from) {
	var len = RGBColor.COLOR_PALETTE.length;
	if (cnt >= len) {
		return color_gradient(new RGBColor(0, 255, 0), new RGBColor(255, 0, 0), cnt);
	}
	if (!from) {
		from = 0;
	}
	var colors = [];
	var to = from+cnt;
	for (var nn = from; nn < to; ++nn) {
		colors.push(RGBColor.COLOR_PALETTE[nn]);
	}
	return colors;
}

function color_gradient(color1, color2, steps) {
	var steps_1 = (steps > 1 ? steps*1. - 1 : 1);
	var gradients = [];
        for (ii = 0; ii < steps; ii++) {
		var ratio = ii/steps_1;
		var red = color2.getRed() * ratio + color1.getRed() * (1 - ratio);
		var green = color2.getGreen() * ratio + color1.getGreen() * (1 - ratio);
		var blue = color2.getBlue() * ratio + color1.getBlue() * (1 - ratio);
		gradients.push(new RGBColor(red&255, green&255, blue&255));
	}
	return gradients;
}

function get_color_gradient(color1, color2, minval, maxval, value) {
	value *= 1.;
	var ratio = (value-minval)/(maxval-minval);
	/*
	console.log("ratio=" + ratio + ", minval=" + minval + ", maxval=" + maxval + ", value=" + value);
	console.log("color.red: " + color1.getRed() + " " + color2.getRed());
	console.log("color.green: " + color1.getGreen() + " " + color2.getGreen());
	console.log("color.blue: " + color1.getBlue() + " " + color2.getBlue());
	*/
	var red = color2.getRed() * ratio + color1.getRed() * (1. - ratio);
	var green = color2.getGreen() * ratio + color1.getGreen() * (1. - ratio);
	var blue = color2.getBlue() * ratio + color1.getBlue() * (1. - ratio);
	//console.log("red: " + red + " " + green + " " + blue);
	return new RGBColor(red&255, green&255, blue&255);
}
