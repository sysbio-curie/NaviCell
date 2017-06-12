#!/bin/bash
#
# NaviCell generic run script
#
# nv_run_factory.sh
#
# Eric Viara Institut Curie copyright (c) November 2015
#

topdir=..

libdir=$topdir/lib

classpath=$libdir/navicell.jar:$libdir/binomlibext.jar:$libdir/cd4.jar:$libdir/celldesigner.jar:$libdir/CellDesigner401Jars.jar:$libdir/csml.jar:$libdir/cytoscape270.jar:$libdir/giny.jar:$libdir/imgscalr-lib-3.1-javadoc.jar:$libdir/imgscalr-lib-3.1-sources.jar:$libdir/imgscalr-lib-3.1.jar:$libdir/jwordpress/commons-collections-3.2.jar:$libdir/jwordpress/commons-configuration-1.5.jar:$libdir/jwordpress/commons-lang-2.3.jar:$libdir/jwordpress/jwordpress-0.5.1-cli.jar:$libdir/jwordpress/jwordpress-0.5.1.jar:$libdir/jwordpress/jwordpress-0.5.jar:$libdir/jwordpress/xmlrpc-client-1.1.jar:$libdir/MathMLIO.jar:$libdir/paxtools-4.2.1-no-jena.jar:$libdir/sbml.jar:$libdir/transpath.jar:$libdir/VDAOEngine.jar:$libdir/xgmml.jar:$topdir

java $JAVAOPTS -Dfile.encoding=UTF-8 -cp $classpath fr.curie.BiNoM.pathways.navicell.ProduceClickableMap $*

