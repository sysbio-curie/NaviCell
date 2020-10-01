CFG=/etc/apache2/sites-enabled/000-default.conf
NAVICELL_CFG=/etc/apache2/sites-available/navicell.conf
echo $NAVICELL_CFG
LINE=`cat $CFG | grep -n "</VirtualHost>" | cut -d":" -f1`
head -n $((LINE-1)) $CFG > $NAVICELL_CFG
echo "\tProxyPreserveHost On\n\tProxyRequests Off\n\n\tProxyPass /api/  http://localhost:8080/api/\n\tProxyPassReverse /api/  http://localhost/api/\n" >> $NAVICELL_CFG
tail -n +$LINE $CFG >> $NAVICELL_CFG
cat $NAVICELL_CFG