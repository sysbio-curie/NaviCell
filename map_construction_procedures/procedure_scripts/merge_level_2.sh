#!/bin/bash 
java -Xmx3000M -cp .:BiNoM_all.jar  fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures --mergepngs --png1 rcd_master-2_noscaling.png  --png2 rcd_master-2_noscaling_noreactions.png --transparency2 0.7  --pngout rcd_master-2_merged.png
