#!/bin/bash 
java -Xmx3000M -cp .:BiNoM_all.jar fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures --removereactions --xml rcd_master.xml
