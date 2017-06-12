if (!navicell.mapdata) {
	navicell.mapdata = new Mapdata(6);
	navicell.mapdata.load_mapdata("../_common/master_mapdata.json", "MPhase:master");
	navicell.mapdata.load_mapdata("../_common/RUM1_mapdata.json", "MPhase:RUM1");
	navicell.mapdata.load_mapdata("../_common/WEE1_mapdata.json", "MPhase:WEE1");
	navicell.mapdata.load_mapdata("../_common/CDC25_mapdata.json", "MPhase:CDC25");
	navicell.mapdata.load_mapdata("../_common/SLP1_mapdata.json", "MPhase:SLP1");
	navicell.mapdata.load_mapdata("../_common/CDC2_mapdata.json", "MPhase:CDC2");
}

