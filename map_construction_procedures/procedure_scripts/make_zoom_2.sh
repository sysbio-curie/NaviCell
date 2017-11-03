#!/bin/bash 
java -Xmx3000M -cp .:BiNoM_all.jar fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures --makezoomlevel2 --xml rcd_master.xml --xmlout rcd_master-2_noscaling.xml --fontsize 20
