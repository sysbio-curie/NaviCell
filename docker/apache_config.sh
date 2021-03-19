CFG=/etc/apache2/sites-enabled/000-default.conf
NAVICELL_CFG=/etc/apache2/sites-available/navicell.conf
echo $NAVICELL_CFG
LINE=`cat $CFG | grep -n "</VirtualHost>" | cut -d":" -f1`
head -n $((LINE-1)) $CFG > $NAVICELL_CFG
echo """
<IfModule mod_alias.c>
                <IfModule mod_cgi.c>
                        Define ENABLE_USR_LIB_CGI_BIN
                </IfModule>

                <IfModule mod_cgid.c>
                        Define ENABLE_USR_LIB_CGI_BIN
                </IfModule>

                <IfDefine ENABLE_USR_LIB_CGI_BIN>
                        ScriptAlias /cgi-bin/ /var/www/html/proxy/
                        <Directory "/usr/lib/cgi-bin">
                                AllowOverride None
                                Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
                                Require all granted
                        </Directory>
                </IfDefine>
        </IfModule>
""" >> $NAVICELL_CFG
echo "\tProxyPreserveHost On\n\tProxyRequests Off\n\n\tProxyPass /api/  http://localhost:8080/api/\n\tProxyPassReverse /api/  http://localhost/api/\n" >> $NAVICELL_CFG
tail -n +$LINE $CFG >> $NAVICELL_CFG
cat $NAVICELL_CFG