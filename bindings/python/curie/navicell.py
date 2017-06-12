# This program is free software; you can redistribute it and/or modify
# it under the terms of the (LGPL) GNU Lesser General Public License as
# published by the Free Software Foundation; either version 3 of the 
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Library Lesser General Public License for more details at
# ( http://www.gnu.org/licenses/lgpl.html ).
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
# written by NaviCell Team at Institut Curie 26 rue d'Ulm, France
# Eric Viara (eric.viara@curie.fr)
# Eric Bonnet (eric.bonnet@curie.fr)
#
# Python Binding for NaviCell
#
# package: curie.navicell
# version: 1.2
# date: December 2014
#

r"""
This module implements the Python Binding for NaviCell.

It can be used as a module or by using the "nvpy" python companion script.

As a module, for instance:

from curie.navicell import NaviCell, Options

# 1. Instantiate and set Options:
options = Options()
options.proxy_url = 'https://navicell.curie.fr/cgi-bin/nv_proxy.php'
options.map_url = 'https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php'

# If you want to specify a particular Web Browser, you have to set options.browser_command, otherwise the default browser will be used.
# For instance, to use firefox on MacOS:
options.browser_command = 'open -a Firefox %s'
# To use google chrome on Linux:
options.browser_command = '/usr/bin/google-chrome %s'

# 2. Instantiate a NaviCell client handle
nv = NaviCell(options)

# 3. Launch browser
nv.launchBrowser()

# 4. Command interaction examples:
nv.setZoom('', 10)
nv.getHugoList()
nv.getBiotypeList()

At the command line, using nvpy:
nvpy --browser-command 'open -a Firefox %s' --proxy-url 'https://navicell.curie.fr/cgi-bin/nv_proxy.php' --map-url 'https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php' --launch-browser
or:
python3 -i nvpy ...

To make things easier, the proxy URL, the map URL and the browser command can be put in environment variables as follows:
export NV_PROXY_URL='https://navicell.curie.fr/cgi-bin/nv_proxy.php'
export NV_MAP_URL='https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php'
export NV_BROWSER_COMMAND='open -a Firefox %s' # on MacOS

Then:
nvpy --launch-browser

What is displayed:
===================================
 Welcome in NaviCell python client
===================================

Use python variable 'nv' as the NaviCell object
Type 'nv.examples()' to get examples
>>> # then, you can type interaction commands:
>>> nv.setZoom('', 10)
>>> nv.getHugoList()

"""

__version__ = '1.3'
__author__ = ['Eric Viara <eric.viara@curie.fr>', 'Eric Bonnet <eric.bonnet@curie.fr>']

import subprocess, sys, os
import json
import http.client, urllib.request, urllib.parse, urllib.error
import datetime, time
import webbrowser

_NV_PACKSIZE = 500000
#_NV_PACKSIZE = 5000 # reduce packsize for testing
_NV_CONTINUOUS = 'CONTINUOUS'
_NV_UNORDERED_DISCRETE = 'UNORDERED_DISCRETE'
_NV_ORDERED_DISCRETE = 'ORDERED_DISCRETE'

class Proxy:
    """
    class used to communicate with NaviCell proxy on web server side.
    Generally speaking, for internal use by NaviCell class only.
    """

    def _init_attrs__(self, proxy_url, is_https, str = ''):
        self._is_https = is_https
        if not str:
            url = proxy_url
        else:
            url = proxy_url[len(str):]
        idx = url.find("/")
        if idx != -1:
            self._host = url[0:idx]
            self._url = url[idx:]
        else:
            raise Exception("invalid format " + proxy_url)

    def __init__(self, proxy_url, map_url = ''):
        """ Instantiate a Proxy client to communicate with the NaviCell proxy server.

        Args:
            :param proxy_url (string): the proxy URL using HTTP or HTTPS protocol
        """

        if not proxy_url:
            if map_url:
                idx = map_url.find('/navicell/')
                if idx < 0:
                    raise Exception('invalid map url [' + map_url + '] must contains /navicell')
                proxy_url = map_url[0:idx] + '/cgi-bin/nv_proxy.php'
            else:
                raise Exception("empty proxy URL")

        idx = proxy_url.find("http://")
        if idx != -1:
            self._init_attrs__(proxy_url, False, "http://")
        else:
            idx = proxy_url.find("https://")
            if idx != -1:
                self._init_attrs__(proxy_url, True, "https://")
            else:                
                self._init_attrs__(proxy_url, False)

    def getURL(self):
        """ Return the Proxy URL. """
        return self._url

    def getHost(self):
        """ Return the Proxy Host. """
        return self._host

    def isHttps(self):
        """ Return True if the protocol is HTTPS based. """
        return self._is_https

    def getProtocol(self):
        """ Return the protocol: HTTP or HTTPS. """
        if self._is_https:
            return "https";
        return "http";

    def newConnection(self):
        """ Creates a new connexion to the HTTP server. """
        if self._is_https:
            return http.client.HTTPSConnection(self._host)
        return http.client.HTTPConnection(self._host)

class BrowserLauncher:
    """ Utility class to launch a browser and display a given NaviCell map. """

    def __init__(self, browser_command, map_url):
        """ Instantiate a BrowserLauncher.

        Args:
            :param browser_command (string): the full browser command
            :param map_url (string): the URL of the NaviCell map
        """

        if not map_url:
            raise Exception("map url is not set")
        self.map_url = map_url
        self.browser_command = browser_command

    def launch(self, session_id, proxy_url):
        """ Launchs the browser with the given session ID.

        Args:
            :param session_id (string): the NaviCell session ID

        """

        if self.map_url[len(self.map_url)-1] != '&':
            suffix = '?'
        else:
            suffix = ''

        if self.browser_command:
            controller = webbrowser.get(self.browser_command)
        else:
            controller = webbrowser

        controller.open(self.map_url + suffix + "id=" + session_id + "&proxy_url=" + proxy_url)

        #self.cmd.append(self.map_url + suffix + "id=" + session_id)
        #subprocess.check_call(self.self)

class Options:
    """ Option wrapper to be given to NaviCell constructor.

    options = Options()
    options.browser_command = ...
    options.proxy_url = ...
    options.map_url = ...

    nv = NaviCell(options)
    
    """
    def __init__(self):
        """ Instantiate an NaviCell option wrapper. """

        self.map_url = ''
        self.proxy_url = ''
        self.browser_command = ''

class NaviCell:
    """ NaviCell handle used to communicate with the NaviCell Web Service. """

    TABNAME_SAMPLES = 'sample'
    TABNAME_GROUPS = 'group'

    CONFIG_COLOR = 'color'
    CONFIG_SHAPE = 'shape'
    CONFIG_SIZE = 'size'
    CONFIG_COLOR_SIZE = 'color_size'

    METHOD_CONTINUOUS_AVERAGE = 1
    METHOD_CONTINUOUS_MEDIAN = 2
    METHOD_CONTINUOUS_MINVAL = 3
    METHOD_CONTINUOUS_MAXVAL = 4
    METHOD_CONTINUOUS_ABS_AVERAGE = 5
    METHOD_CONTINUOUS_ABS_MINVAL = 6
    METHOD_CONTINUOUS_ABS_MAXVAL = 7

    COND_DISCRETE_IGNORE = 0
    COND_DISCRETE_NO_ELEMENT = 1
    COND_DISCRETE_AT_LEAST_ONE_ELEMENT = 2
    COND_DISCRETE_ALL_ELEMENTS = 3
    COND_DISCRETE_VALUE = 4

    SHAPE_TRIANGLE = 0
    SHAPE_SQUARE = 1
    SHAPE_RECTANGLE = 2
    SHAPE_DIAMOND = 3
    SHAPE_HEXAGON = 4
    SHAPE_CIRCLE = 5

    def __init__(self, options):
        """ Instantiate a NaviCell handle.

        Args:
            :param options(curie.navicell.Options): browser_commmand, proxy_url and map_url to be used.

            Notices:
            - options.map_url has to be set. options.browser_command and options.map_url can be set (respectively)
              to False and empty string.
            - options can be an instance of any class as soon as browser_commmand, proxy_url and
              map_url attributes are provided. For instance, when used with nvpy, options is actually
              an instance of optparse.Values.

        """
        self.proxy = Proxy(options.proxy_url, options.map_url)

        if options.map_url:
            self._browser_launcher = BrowserLauncher(options.browser_command, options.map_url)

        self._msg_id = 1000
        self.session_id = "1"
        self.proxy_url = self.proxy.getURL()

        self._hugo_list = []
        self._hugo_map = {}

        self._async_buffer = []
        self._async_mode = False
        self._async_module = None
        self.trace = False
        self.packsize = _NV_PACKSIZE

    #
    # private methods
    #

    def _message_id(self):
        self._msg_id += 1
        return self._msg_id

    def _send(self, msg_id, params, straight=False):
        if not straight and self.session_id == "1":
            raise Exception('navicell session is not active')

        packcount = 0 # useful when sending datatable contents
        params['id'] = self.session_id
        if False:
            params['msg_id'] = msg_id

        if 'data' in params:
            datalen = len(params['data']) # useful when sending datatable contents
            if self.trace:
                print(params['data'])
            if datalen > self.packsize: # condition and code useful when sending datatable contents
                packcount = int(datalen/self.packsize)+1
                params['packcount'] = packcount
                data = params['data']
                params['data'] = "@@"

        encoded_params = urllib.parse.urlencode(params)
        headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
        conn = self.proxy.newConnection()

        url_params = ""
        for key in params:
            if key == 'data':
                continue
            if key == 'msg_id':
                continue
            if url_params:
                url_params += "&"
            url_params += str(key) + '=' + str(params[key])

        if 'data' in params:
            url_params += "&data=" + params['data']

        if self.trace:
            print("curl '" + self.proxy.getProtocol() + '://' + self.proxy.getHost() + self.proxy.getURL() + "' -d '" + url_params + "'")

        # MOVED BELOW
#        conn.request("POST", self.proxy.getURL(), encoded_params, headers)

        if packcount > 0: # condition and code useful when sending datatable contents
            fillparams = params
            fillparams['perform'] = 'filling'
            for packnum in reversed(range(packcount)): # testing packing order
#            for packnum in range(packcount):
                fillparams['packnum'] = packnum+1
                beg = packnum*self.packsize
                end = (packnum+1)*self.packsize
                if end > datalen:
                    end = datalen
                fillparams['data'] = data[beg:end]
                fill_encoded_params = urllib.parse.urlencode(fillparams)
                fillconn = self.proxy.newConnection()
                fillconn.request("POST", self.proxy.getURL(), fill_encoded_params, headers);
                fillconn.close()

        # MOVED
        conn.request("POST", self.proxy.getURL(), encoded_params, headers)
        response = conn.getresponse()
        data = response.read()
#        print ("status", response.status, "reason", response.reason, "data", data)
        conn.close()

        if response.status != 200:
            raise Exception('navicell error', response.reason);
            
        if data:
            if straight:
                return data.decode('utf-8')
            decoded_data = json.loads(data.decode('utf-8'))
            if not decoded_data['status']:
                return decoded_data['data']
            raise Exception('navicell error', decoded_data[data])
        if not data:
            return ''
        return data

### private methods for session management
    def _gen_session_id(self):
        return self._send(self._message_id(), {'mode': 'session', 'perform': 'genid'}, True)

    def _reset_current_session(self):
        self._send(self._message_id(), {'mode': 'session', 'perform': 'reset'}, True);

    def _check_session(self, session_id):
        checked = self._send(self._message_id(), {'mode': 'session', 'perform': 'check'}, True)
        return checked == "ok"

    def _waitForReady(self, module):
        while not self._isReady(module):
            time.sleep(0.05)
        return True

    def _isReady(self, module):
        return self._cli2srv('nv_is_ready', module, [], True)

    def _make_data(self, data):
        return "@COMMAND " + json.dumps(data)

    def _isImported(self):
        return self._cli2srv('nv_is_imported', '', [], True) #nv_is_imported to be implemented in nv_api.js

    def _waitForImported(self):
        while True:
            ret = self._isImported()
            if ret == True:
                return True
            if ret == False:
                time.sleep(0.1)
            else:
                raise Exception(ret)
        return True

    def flush(self):
        if self._async_buffer:
            msg_id = self._message_id()
            async_buffer = self._async_buffer
            self._async_buffer = []
            self._async_module = None
            self._send(msg_id, {'mode': 'cli2srv', 'perform': 'send_and_rcv', 'data': ' '.join(async_buffer)})

    def _cli2srv(self, action, module, args, force_sync = False):
        if self._async_mode:
            if self._async_module != None and module != self._async_module:
                self.flush()
            self._async_module = module
            if not force_sync:
                self._async_buffer.append(self._make_data({'action': action, 'module': module, 'args' : args}))
                return 0
            self.flush()
        msg_id = self._message_id()
        return self._send(msg_id, {'mode': 'cli2srv', 'perform': 'send_and_rcv', 'data': self._make_data({'action': action, 'module': module, 'args' : args})})

    def _notice_perform(self, module, action, arg1='', arg2='', arg3='', arg4='', arg5=''):
        self._cli2srv('nv_notice_perform', module, [action, arg1, arg2, arg3, arg4, arg5])

    def _drawing_config_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_drawing_config_perform', module, [action, arg1, arg2, arg3])

    def _mydata_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_mydata_perform', module, [action, arg1, arg2, arg3])

    def _heatmap_editor_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_heatmap_editor_perform', module, [action, arg1, arg2, arg3])

    def _barplot_editor_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_barplot_editor_perform', module, [action, arg1, arg2, arg3])

    def _glyph_editor_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_glyph_editor_perform', module, [action, arg1, arg2, arg3])

    def _map_staining_editor_perform(self, module, action, arg1='', arg2='', arg3=''):
        self._cli2srv('nv_map_staining_editor_perform', module, [action, arg1, arg2, arg3])

    def _display_continuous_config_perform(self, module, action, datatable, config_type, arg1='', arg2='', arg3='', arg4='', arg5=''):
        self._cli2srv('nv_display_continuous_config_perform', module, [action, datatable, config_type, arg1, arg2, arg3, arg4, arg5])

    def _display_unordered_discrete_config_perform(self, module, action, datatable, config_type, arg1='', arg2='', arg3='', arg4='', arg5=''):
        self._cli2srv('nv_display_unordered_discrete_config_perform', module, [action, datatable, config_type, arg1, arg2, arg3, arg4, arg5])

    def getSessionId(self):
        """ Return the session ID. """
        return self.session_id

    def _is_https(self):
        return self.protocol == 'https'

    def _get_datatable_config_type(self, datatable):
        biotype = None
        for dt in self.getDatatableList():
            if dt[0] == datatable:
                biotype = dt[1]
                break

        if biotype:
            for bt in self.getBiotypeList():
                if biotype == bt['name']:
                    return bt['subtype']

        return None

    #
    # public API
    #

### session management
    def launchBrowser(self):
        """ Launchs the client browser according to options given at NaviCell instantation. """

        if not self._browser_launcher:
            raise Exception("no launcher configurated")
        self.session_id = self._gen_session_id() # request nv_proxy.php to get a session ID
        self._browser_launcher.launch(self.session_id, self.proxy_url) # launch browser using this session ID
        self._waitForReady('') # wait until navicell server is ready for further commands

    def listSessions(self):
        """ Display all active NaviCell Web Service sessions.
        Action granted according to security conditions defined in the Web Service configuration.
        """

        print(self._send(self._message_id(), {'mode': 'session', 'perform': 'list'}, True), end="")

    def clearSessions(self):
        """ Clear all active NaviCell Web Service sessions.
        Action granted according to security conditions defined in the Web Service configuration.
        """
        print(self._send(self._message_id(), {'mode': 'session', 'perform': 'clear'}, True), end="")

    def attachSession(self, session_id):
        """ Attach NaviCell handle to an existing NaviCell Web Service session.
        Action granted according to security conditions defined in the Web Service configuration.

        Args:
            :param session_id(string): session ID to which NaviCell handle must be attached
        """

        if self.session_id != "1":
            raise Exception("session id already set");
        o_session_id = self.session_id
        self.session_id = session_id
        if not self._check_session(session_id):
            self.session_id = o_session_id
            raise Exception("session id " + session_id + " is invalid");

    def attachLastSession(self):
        """ Attach NaviCell handle to the last existing NaviCell Web Service session.
        Action granted according to security conditions defined in the Web Service configuration.
        """

        session_id = self._send(self._message_id(), {'mode': 'session', 'perform': 'get', 'which' : '@@'}, True);
        self.attachSession(session_id)

    def attachRefererSession(self, referer):
        """ Attach NaviCell handle to the last existing NaviCell Web Service session launched from
        a given referer (IP client).
        Action granted according to security conditions defined in the Web Service configuration.

        Args:
            :param referer(string): IP client address of the referer
        """

        session_id = self._send(self._message_id(), {'mode': 'session', 'perform': 'get', 'which' : '@' + referer}, True);
        self.attachSession(session_id)

    def reset(self):
        """ Resets the current session. NaviCell handle cannot communicate anymore with the Web Service. """

        self._reset_current_session()
        self.session_id = "1"

### utility data methods
    def setASyncMode(self, async_mode):
        self._async_mode = async_mode

    def isASync(self):
        return self._async_mode

    def setTrace(self, trace):
        """ For debug only. Activates / Desactivates traces according to the trace argument. """
        self.trace = trace

    def makeData(self, data):
        """ Builds a string suitable for NaviCell Web Service from a python matrix of gene/sample values.

        Matrix format:
        - first line is: GENE word followed by a tab separated list of sample names,
        - each line begins with an gene name and must be followed by a tab separated list of gene/sample values.

        Eliminates genes not present in the NaviCell map.
        """
        self.getHugoList()
        hugo_map = self._hugo_map

        lines = data.split('\n')
        ret = lines[0]

        for line in lines:
            arr = line.split('\t')
            hugo = arr[0].replace("\n", "");
            if hugo in hugo_map:
                ret += line + "\n"
        return "@DATA\n" + ret

    def makeDataFromFile(self, filename):
        """ Builds a string suitable for NaviCell Web Service from a matrix of gene/sample values contained in a file.

        Matrix format:
        - first line is: GENE word followed by a tab separated list of sample names,
        - each line begins with an gene name and must be followed by a tab separated list of gene/sample values.

        Eliminates genes not present in the NaviCell map.
        """

        with open(filename) as f:
            self.getHugoList()
            hugo_map = self._hugo_map

            ret = ''
            for line in f:
                ret = line + "\n"
                break

            for line in f:
                arr = line.split('\t')
                hugo = arr[0].replace("\n", "");
                if hugo in hugo_map:
                    ret += line + "\n"
            return "@DATA\n" + ret

    def makeAnnotationData(self, data):
        """ Builds a string suitable for NaviCell Web Service from a python sample/annotation matrix.

        Matrix format:
        - first line is: NAME word followed by a tab separated list of annotation names.
        - each line begins with an sample name and must be followed by a tab separated list of
          sample/annotation values.

        """
        lines = data.split('\n')
        ret = lines[0]

        for line in lines:
            arr = line.split('\t')
            ret += line + "\n"
        return "@DATA\n" + ret

    def makeAnnotationDataFromFile(self, filename):
        """ Builds a string suitable for NaviCell Web Service from a python sample/annotation matrix contained in a file.

        Matrix format:
        - first line is: NAME word followed by a tab separated list of annotation names.
        - each line begins with an sample name and must be followed by a tab separated list of
          sample/annotation values.

        """
        with open(filename) as f:

            ret = ''
            for line in f:
                ret = line + "\n"
                break

            for line in f:
                arr = line.split('\t')
                ret += line + "\n"
            return "@DATA\n" + ret

### datatable data: methods do not depend on module
    def importDatatables(self, datatable_url_or_data, datatable_name, datatable_biotype, params={}):
        """ Import one or several datatables.

        Args:
            :param datatable_url_or_data (string): datatable(s) to be imported:
             URL or data returned from makeData or makeDataFromFile expected.
            :param datatable_name (string): name of the datatable that will appear in the NaviCell session.
            :param datatable_biotype (string): biotype of the datatable file.
            :param params (map): opening hints.
        """
        self._cli2srv('nv_import_datatables', '', [datatable_biotype, datatable_name, '', datatable_url_or_data, params], True)
        self._waitForImported()

    def sampleAnnotationImport(self, sample_annotation_url_or_data):
        """ Import the given annotation data or URL.
        
        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param sample_annotation_url_or_data (string): sample annotation to be imported:
             URL or data returned from makeAnnotationData or makeAnnotationDataFromFile expected.
        """
#        self.sampleAnnotationOpen()
        self._cli2srv('nv_sample_annotation_perform', '', ['import', sample_annotation_url_or_data], True)
        self._waitForImported()

    def sampleAnnotationOpen(self, module):
        """ Open the sample annotation dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._cli2srv('nv_sample_annotation_perform', module, ['open'])

    def sampleAnnotationClose(self, module):
        """ Close the sample annotation dialog.
        Similar to a click on the 'Close' button of the sample annotation dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._cli2srv('nv_sample_annotation_perform', module, ['close'])

    def sampleAnnotationApply(self, module):
        """ Apply the changes in the sample annotation dialog.
        Similar to a click on the 'Apply' button of the sample annotation dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._cli2srv('nv_sample_annotation_perform', module, ['apply'])

    def sampleAnnotationCancel(self, module):
        """ Cancel the changes in the sample annotation dialog and close the window.
        Similar to a click on the 'Cancel' button of the sample annotation dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._cli2srv('nv_sample_annotation_perform', module, ['cancel'])

    def sampleAnnotationSelectAnnotation(self, module, annot, select=True):
        """ Select/unselect an annotation.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param annot (annot): annotation name
            :param select (boolean): select annotation if True, unselect otherwise
        """
        self._cli2srv('nv_sample_annotation_perform', module, ['select_annotation', annot, select])

    def getDatatableList(self):
        """ Return the datatables imported in the NaviCell map. """
        return self._cli2srv('nv_get_datatable_list', '', [], True)

    def getDatatableGeneList(self):
        """ Return the list of genes of the imported datatables which have been found in the map. """
        return self._cli2srv('nv_get_datatable_gene_list', '', [], True)

    def getDatatableSampleList(self):
        """ Return the list of samples of the imported datatables. """
        return self._cli2srv('nv_get_datatable_sample_list', '', [], True)

### entity search and select
    def findEntities(self, module, pattern, hints = {}, open_bubble = False):
        """ Find and select entities in the map.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param pattern (string): search pattern.
            :param hints (map): hint modifier. Valid keys are in, class, op, token.
            :param open_bubble (boolean): if True open associated bubbles, otherwise don't.

        For instance:
            findEntities('', 'rbx', {'token' : 'regex', 'in': 'label,tag,annot'}, True)
            which is equivalent to:
            findEntities('', 'rbx /token=regex;in=label,tag,annot', True)

	Complete search syntax is as follows:
	
	PATTERN [/MOD]
	
	where PATTERN is a sequence of regular expressions
	- if regex are separated by comma, OR search is performed
	- if regex are separated by space, AND search is performed
	
	where MOD is a semi-colon separated list of MOD_ITEM
	
	where MOD_ITEM is under the form
	
	in=label
	in=tag
	in=annot
	in=all
	
	token=word
	token=regex
	
	op=eq
	op=neq
	
	class=all
	class=all_included
	class=all_but_included
	class=class_name,class_name,...
	class!=class_name,class_name,...
	
	Default is: /in=label;in=tag;token=word;op=eq;class=all_but_included
	
	Examples:
	rbx
	xp rbx
	xp,rbx
	xp rbx /in=label
	xp rbx /in=label;class=protein
	xp rbx /class=protein,gene
	xp rbx /class!=protein,gene
	xp rbx /op=neq;in=label;class=protein,gene
	xp rxb /token=regex;in=all

        """
        if hints:
            mod_list = []
            for hint in ["in", "class", "op", "token"]:
                if hint in hints:
                    mod_list.append(hint + "=" + hints[hint])
            if len(mod_list) > 0:
                mod = '/'
                for ind in range(len(mod_list)):
                    if ind > 0:
                        mod += ";"
                    mod += mod_list[ind]
                pattern += " " + mod
        self._cli2srv('nv_find_entities', module, [pattern, open_bubble])

    def uncheckAllEntities(self, module):
        """ Unselect all entities in the map.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._cli2srv('nv_uncheck_all_entities', module, [])

    def selectEntity(self, module, entity_name):
        """ Select a given entity.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param entity_name (string): name of the entity to be selected
        """
        self._cli2srv('nv_find_entities', module, [entity_name])

### navigation
    def setZoom(self, module, zoom):
        """ Set the zoom level of a map to a given level.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param zoom (int): zoom level.
        
        """

        self._cli2srv('nv_set_zoom', module, [zoom])

    def setCenter(self, module, where, lng=0, lat=0):
        """ Set the center of the map.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param where(string): the location of center, valid values are:
              MAP_CENTER
              MAP_NORTH
              MAP_WEST
              MAP_EAST
              MAP_SOUTH
              MAP_NORTH_WEST
              MAP_NORTH_EAST
              MAP_SOUTH_WEST
              MAP_SOUTH_EAST
              RELATIVE
              ABSOLUTE
           :param lng(double): longitude if center is set to RELATIVE or ABSOLUTE, ignored otherwise
           :param lat(double): latitude if center is set to RELATIVE or ABSOLUTE, ignored otherwise

        """
        self._cli2srv('nv_set_center', module, [where, lng, lat])

### notice dialog
    def noticeMessage(self, module, header, msg, position='left top', width=0, height=0):
        """ Open the notice dialog and display a message.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param header (string): message header (title)
            :param msg (string): html message
            :param position (string): (optional) CSS position of the dialog, for instance 'left top', 'right top' etc.
            :param width (int): (optional) width in pixel
            :param height (int): (optional) height in pixel
        """
        self._notice_perform(module, 'set_message_and_open', header, msg, position, width, height)

    def noticeOpen(self, module):
        """ Open the notice dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._notice_perform(module, 'open')

    def noticeClose(self, module):
        """ Close the notice dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._notice_perform(module, 'close')

### mydata dialog
    def myDataOpen(self, module):
        """ Open the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'open')

    def myDataClose(self, module):
        """ Close the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'close')

    def myDataSelectDatatableTab(self, module):
        """ Select the 'Datatable' Tab in the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'select_datatables') # TBD: change select_datatables to select_datatable_tab here and in nv_api.js

    def myDataSelectSampleTab(self, module):
        """ Select the 'Sample' Tab in the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'select_samples') # TBD: ditto

    def myDataSelectGeneTab(self, module):
        """ Select the 'Gene' Tab in the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'select_genes') # TBD: ditto

    def myDataSelectGroupTab(self, module):
        """ Select the 'Group' Tab in the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'select_groups') # TBD: ditto

    def myDataSelectModuleTab(self, module):
        """ Select the 'Module' Tab in the MyData dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._mydata_perform(module, 'select_modules') # TBD: ditto

### heatmap editor
    def heatmapEditorOpen(self, module):
        """ Open the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'open')

    def heatmapEditorClose(self, module):
        """ Close the heatmap editor.
        Similar to a click on the 'Close' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'close')

    def heatmapEditorApply(self, module):
        """ Apply the changes in the heatmap editor.
        Similar to a click on the 'Apply' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'apply')

    def heatmapEditorApplyAndClose(self, module):
        """ Apply the changes in the heatmap editor and close the window.
        Similar to a click on the 'OK' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'apply_and_close')

    def heatmapEditorCancel(self, module):
        """ Cancel the changes in the heatmap editor and close the window.
        Similar to a click on the 'Cancel' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'cancel')

    def heatmapEditorClearSamples(self, module):
        """ Clear all samples and groups in the heatmap editor.
        Similar to a click on the 'Clear Samples' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'clear_samples')

    def heatmapEditorAllSamples(self, module):
        """ Select all samples in the heatmap editor.
        Similar to a click on the 'All Samples' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'all_samples')

    def heatmapEditorAllGroups(self, module):
        """ Select all groups in the heatmap editor.
        Similar to a click on the 'All Groups' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'all_groups')

    def heatmapEditorFromBarplot(self, module):
        """ Report samples and groups selected in the barplot editor to the heatmap editor.
        Similar to a click on the 'From Barplot' button of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._heatmap_editor_perform(module, 'from_barplot')

    def heatmapEditorSetTransparency(self, module, value):
        """ Set the transparency in the heatmap editor.
        Similar to a change of the transparency slider of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param value (double): transparency value.
        """
        self._heatmap_editor_perform(module, 'set_transparency', value)

    def heatmapEditorSelectSample(self, module, where, sample):
        """ Select a sample in the heatmap editor.
        Similar to a selection in a 'Select a sample' list of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param where (int): 0-based sample position in the heatmap.
            :param sample (string): sample name to be selected.
        """
        self._heatmap_editor_perform(module, 'select_sample', where, sample)

    def heatmapEditorSelectDatatable(self, module, where, datatable):
        """ Select a datatable in the heatmap editor.
        Similar to a selection in a 'Select a Datatable' list of the heatmap editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param where (int): 0-based datatable position in the heatmap.
            :param datatable (string): datatable name to be selected.
        """
        self._heatmap_editor_perform(module, 'select_datatable', where, datatable)

### barplot editor
    def barplotEditorOpen(self, module):
        """ Open the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'open')

    def barplotEditorClose(self, module):
        """ Close the barplot editor.
        Similar to a click on the 'Close' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'close')

    def barplotEditorApply(self, module):
        """ Apply the changes in the barplot editor.
        Similar to a click on the 'Apply' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'apply')

    def barplotEditorApplyAndClose(self, module):
        """ Apply the changes in the barplot editor and close the window.
        Similar to a click on the 'OK' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'apply_and_close')

    def barplotEditorCancel(self, module):
        """ Cancel the changes in the barplot editor and close the window.
        Similar to a click on the 'Cancel' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'cancel')

    def barplotEditorClearSamples(self, module):
        """ Clear all samples and groups in the barplot editor.
        Similar to a click on the 'Clear Samples' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'clear_samples')

    def barplotEditorAllSamples(self, module):
        """ Select all samples in the barplot editor.
        Similar to a click on the 'All Samples' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'all_samples')

    def barplotEditorAllGroups(self, module):
        """ Select all groups in the barplot editor.
        Similar to a click on the 'All Groups' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'all_groups')

    def barplotEditorFromHeatmap(self, module):
        """ Report samples and groups selected in the heatmap editor to the barplot editor.
        Similar to a click on the 'From Heatmap' button of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._barplot_editor_perform(module, 'from_heatmap')

    def barplotEditorSetTransparency(self, module, value):
        """ Set the transparency in the barplot editor.
        Similar to a change of the transparency slider of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param value (double): transparency value.
        """
        self._barplot_editor_perform(module, 'set_transparency', value)

    def barplotEditorSelectSample(self, module, where, sample):
        """ Select a sample in the barplot editor.
        Similar to a selection in a 'Select a sample' list of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param where (int): 0-based sample position in the barplot.
            :param sample (string): sample name to be selected.
        """
        self._barplot_editor_perform(module, 'select_sample', where, sample)

    def barplotEditorSelectDatatable(self, module, datatable):
        """ Select the datatable in the barplot editor.
        Similar to a selection in the 'Select a datatable' list of the barplot editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name to be selected.
        """
        self._barplot_editor_perform(module, 'select_datatable', datatable)

### glyph editor
    def glyphEditorOpen(self, module, num):
        """ Open the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
        """
        self._glyph_editor_perform(module, 'open', num)

    def glyphEditorClose(self, module, num):
        """ Close the glyph editor.
        Similar to a click on the 'Close' button of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
        """
        self._glyph_editor_perform(module, 'close', num)

    def glyphEditorApply(self, module, num):
        """ Apply the changes in the glyph editor.
        Similar to a click on the 'Apply' button of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
        """
        self._glyph_editor_perform(module, 'apply', num)

    def glyphEditorApplyAndClose(self, module, num):
        """ Apply the changes in the glyph editor and close the window.
        Similar to a click on the 'OK' button of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
        """
        self._glyph_editor_perform(module, 'apply_and_close', num)

    def glyphEditorCancel(self, module, num):
        """ Cancel the changes in the glyph editor and close the window.
        Similar to a click on the 'Cancel' button of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
        """
        self._glyph_editor_perform(module, 'cancel', num)

    def glyphEditorSetTransparency(self, module, num, value):
        """ Set the transparency in the glyph editor.
        Similar to a change of the transparency slider of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
            :param value (double): transparency value.
        """
        self._glyph_editor_perform(module, 'set_transparency', num, value)

    def glyphEditorSelectSample(self, module, num, sample):
        """ Select a sample in the glyph editor.
        Similar to a selection in the 'Select a sample' list of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
            :param sample (string): sample name to be selected.
        """
        self._glyph_editor_perform(module, 'select_sample', num, sample)

    def glyphEditorSelectShapeDatatable(self, module, num, datatable):
        """ Select the shape datatable (eg. used to select a shape) in the glyph editor.
        Similar to a selection in the 'Select a datatable' Shape list of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
            :param datatable (string): datatable name to be selected.
        """
        self._glyph_editor_perform(module, 'select_datatable_shape', num, datatable)

    def glyphEditorSelectColorDatatable(self, module, num, datatable):
        """ Select the color datatable (eg. used to select a color) in the glyph editor.
        Similar to a selection in the 'Select a datatable' Color list of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
            :param datatable (string): datatable name to be selected.
        """
        self._glyph_editor_perform(module, 'select_datatable_color', num, datatable)

    def glyphEditorSelectSizeDatatable(self, module, num, datatable):
        """ Select the size datatable (eg. used to select a size) in the glyph editor.
        Similar to a selection in the 'Select a datatable' Size list of the glyph editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph editor number; valid values are 1 to 5.
            :param datatable (string): datatable name to be selected.
        """
        self._glyph_editor_perform(module, 'select_datatable_size', num, datatable)

### map staining editor
    def mapStainingEditorOpen(self, module):
        """ Open the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._map_staining_editor_perform(module, 'open')

    def mapStainingEditorClose(self, module):
        """ Close the map staining editor.
        Similar to a click on the 'Close' button of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._map_staining_editor_perform(module, 'close')

    def mapStainingEditorApply(self, module):
        """ Apply the changes in the map staining editor.
        Similar to a click on the 'Apply' button of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._map_staining_editor_perform(module, 'apply')

    def mapStainingEditorApplyAndClose(self, module):
        """ Apply the changes in the map staining editor and close the window.
        Similar to a click on the 'OK' button of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._map_staining_editor_perform(module, 'apply_and_close')

    def mapStainingEditorCancel(self, module):
        """ Cancel the changes in the map staining editor and close the window.
        Similar to a click on the 'Cancel' button of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._map_staining_editor_perform(module, 'cancel')

    def mapStainingEditorSetTransparency(self, module, value):
        """ Set the transparency in the map staining editor.
        Similar to a change of the transparency slider of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param value (double): transparency value.
        """
        self._map_staining_editor_perform(module, 'set_transparency', value)

    def mapStainingEditorSelectSample(self, module, sample):
        """ Select the sample in the map staining editor.
        Similar to a selection in the 'Select a sample' list of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param sample (string): sample name to be selected.
        """
        self._map_staining_editor_perform(module, 'select_sample', sample)

    def mapStainingEditorSelectDatatable(self, module, datatable):
        """ Select the datatable used for colors in the map staining editor.
        Similar to a selection in the 'Select a datatable' Color list of the map staining editor.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name to be selected.
        """
        self._map_staining_editor_perform(module, 'select_datatable', datatable)

### drawing configuration
    def drawingConfigOpen(self, module):
        """ Open the drawing configuration dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'open')

    def drawingConfigClose(self, module):
        """ Close the drawing configuration dialog.
        Similar to a click on the 'Close' button of the drawing configuration dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'close')

    def drawingConfigApply(self, module):
        """ Apply the changes in the drawing configuration dialog.
        Similar to a click on the 'Apply' button of the drawing configuration dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'apply')

    def drawingConfigApplyAndClose(self, module):
        """ Apply the changes in the drawing configuration dialog and close the window.
        Similar to a click on the 'OK' button of the drawing configuration dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'apply_and_close')

    def drawingConfigCancel(self, module):
        """ Cancel the changes in the drawing configuration dialog and close the window.
        Similar to a click on the 'Cancel' button of the drawing configuration dialog.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'cancel')

    def drawingConfigSelectHeatmap(self, module, select=True):
        """ Select/unselect a heatmap chart.
        Similar to:
        - a selection/unselection of the 'Display' checkbox in the 'Chart' section, and:
         - a 'Heatmap' selection/unselection in the 'Chart Type' list

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param select (boolean): select Heatmap if True, unselect otherwise 
        """
        self._drawing_config_perform(module, 'select_heatmap', select)

    def drawingConfigSelectBarplot(self, module, select=True):
        """ Select/unselect a barplot chart.
        Similar to:
        - a selection/unselection of the 'Display' checkbox in the 'Chart' section, and:
        - a 'Barplot' selection/unselection in the 'Chart Type' list

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param select (boolean): select Barplot if True, unselect otherwise 
        """
        self._drawing_config_perform(module, 'select_barplot', select)

    def drawingConfigSelectGlyph(self, module, num, select=True):
        """ Select/unselect a given glyph.
        Similar to a selection/unselection of one of the 'Display' checkbox in the 'Glyphs' section

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param num (int): glyph number; valid values are 1 to 5.
            :param select (boolean): select the Glyph if True, unselect otherwise
        """
        self._drawing_config_perform(module, 'select_glyph', num, select)

    def drawingConfigSelectMapStaining(self, module, select=True):
        """ Select/unselect the map staining.
        Similar to a selection/unselection of the 'Display' checkbox in the 'Map Staining' section

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param select (boolean): select Map Staining if True, unselect otherwise
        """
        self._drawing_config_perform(module, 'select_map_staining', select)

    def drawingConfigDisplayAllGenes(self, module):
        """ Will display DLOs for all genes.
        Similar to the selection of the 'All Genes' checkbox in the 'Display DLOs' section

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'display_all_genes')

    def drawingConfigDisplaySelectedGenes(self, module):
        """ Will display DLOs for selected genes only.
        Similar to the selection of the 'Selected Genes' checkbox in the 'Display DLOs' section.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        self._drawing_config_perform(module, 'display_selected_genes')

### datatable config

    def datatableConfigOpen(self, module, datatable, config_type):
        """ Open the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'open', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'open', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigClose(self, module, datatable, config_type):
        """ Close the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'close', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'close', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigCancel(self, module, datatable, config_type):
        """ Cancel changes and close the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'cancel', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'cancel', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigApply(self, module, datatable, config_type):
        """ Apply changes the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'apply', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'apply', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigApplyAndClose(self, module, datatable, config_type):
        """ Apply changes and close the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        # for now, could use apply_and_close command when deployed
        self.datatableConfigApply(module, datatable, config_type)
        self.datatableConfigClose(module, datatable, config_type)

    def datatableConfigSetStepCount(self, module, datatable, config_type, tabname, step_count):
        """ Set the step count of the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param step_count (int): step count
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'step_count_change', tabname, config_type, datatable, step_count)

        if subtype == _NV_UNORDERED_DISCRETE:
            raise Exception("cannot set step count on datatable " + datatable + " unordered discrete configuration")

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetSampleAbsoluteValue(self, module, datatable, config_type, checked):
        """ Set the sample absolute value mode of the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param checked (boolean): set/unset sample absolute value mode
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_sample_absval', config_type, datatable, checked)

        if subtype == _NV_UNORDERED_DISCRETE:
            raise Exception("cannot set sample absolute value on datatable " + datatable + " unordered discrete configuration")

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetSampleMethod(self, module, datatable, config_type, method):
        """ Set the sample method of the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param method (int): method name; must be NaviCell.METHOD_CONTINUOUS_AVERAGE, NaviCell.METHOD_CONTINUOUS_MEDIAN,
             NaviCell.METHOD_CONTINUOUS_MINVAL, NaviCell.METHOD_CONTINUOUS_MAXVAL, NaviCell.METHOD_CONTINUOUS_ABS_AVERAGE,
             NaviCell.METHOD_CONTINUOUS_ABS_MINVAL or NaviCell.METHOD_CONTINUOUS_ABS_MAXVAL
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_sample_method', config_type, datatable, method)

        if subtype == _NV_UNORDERED_DISCRETE:
            raise Exception("cannot set sample method on datatable " + datatable + " unordered discrete configuration")

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetGroupMethod(self, module, datatable, config_type, method):
        """ Set the group method of the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param method (int): method name; must be NaviCell.METHOD_CONTINUOUS_AVERAGE, NaviCell.METHOD_CONTINUOUS_MEDIAN,
             NaviCell.METHOD_CONTINUOUS_MINVAL, NaviCell.METHOD_CONTINUOUS_MAXVAL, NaviCell.METHOD_CONTINUOUS_ABS_AVERAGE,
             NaviCell.METHOD_CONTINUOUS_ABS_MINVAL or NaviCell.METHOD_CONTINUOUS_ABS_MAXVAL
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_group_method', config_type, datatable, method)

        if subtype == _NV_UNORDERED_DISCRETE:
            raise Exception("cannot set group method on datatable " + datatable + " unordered discrete configuration")

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetColorAt(self, module, datatable, config_type, tabname, idx, color):
        """
        Set color at a specified index in the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param idx (int): color index
            :param color (string): hexa RGB color
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_input_color', datatable, config_type, tabname, idx, color)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_discrete_color', datatable, config_type, tabname, idx, color)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetValueAt(self, module, datatable, config_type, tabname, idx, value):
        """
        Set value at a specified index in the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param idx (int): value index
            :param value (double): value
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_input_value', datatable, config_type, tabname, idx, value)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_discrete_value', datatable, config_type, tabname, idx, value)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetSizeAt(self, module, datatable, config_type, tabname, idx, size):
        """
        Set size at a specified index in the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param idx (int): size index
            :param size (int): size value
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_select_size', datatable, config_type, tabname, idx, size)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_discrete_size', datatable, config_type, tabname, idx, size)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetShapeAt(self, module, datatable, config_type, tabname, idx, shape):
        """
        Set shape at a specified index in the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param idx (int): shape index
            :param shape (int): shape; must be NaviCell.SHAPE_TRIANGLE, NaviCell.SHAPE_SQUARE,
             NaviCell.SHAPE_RECTANGLE, NaviCell.SHAPE_DIAMOND, NaviCell.SHAPE_HEXAGON or
             NaviCell.SHAPE_CIRCLE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'set_select_shape', datatable, config_type, tabname, idx, shape)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_discrete_shape', datatable, config_type, tabname, idx, shape)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSetCondAt(self, module, datatable, config_type, tabname, idx, cond):
        """
        Set condition at a specified index in the datatable configuration dialog for the given type.

            Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param tabname (string): tab name in the configuration dialog;
             must be NaviCell.TABNAME_SAMPLES or NaviCell.TABNAME_GROUPS
            :param idx (int): condition index
            :param shape (int): condition; must be NaviCell.COND_DISCRETE_IGNORE,
             NaviCell.COND_DISCRETE_NO_ELEMENT, NaviCell.COND_DISCRETE_AT_LEAST_ONE_ELEMENT,
             NaviCell.COND_DISCRETE_ALL_ELEMENTS or NaviCell.COND_DISCRETE_VALUE

        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            raise Exception("cannot set group method on datatable " + datatable + " continuous configuration")

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_discrete_cond', datatable, config_type, tabname, idx, cond)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    # note: work only on color config, so maybe that 'config_type' argument is useless...

    def datatableConfigSetGroupAdvancedConfiguration(self, module, datatable, config_type, checked):
        """
        Set group advanced configuration in the datatable configuration dialog for the given type.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
            :param checked (boolean): set/unset advanced configuration
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            raise Exception("cannot set group advanced configuration on datatable " + datatable + " continuous configuration")

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'set_advanced_configuration', datatable, config_type, checked)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSwitchSampleTab(self, module, datatable, config_type):
        """
        Switch the datatable configuration dialog for the given type to the Samples tab.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'switch_sample_tab', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'switch_sample_tab', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    def datatableConfigSwitchGroupTab(self, module, datatable, config_type):
        """
        Switch the datatable configuration dialog for the given type to the Groups tab.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param datatable (string): datatable name
            :param config_type (string): configuration type; must be NaviCell.CONFIG_COLOR,
             NaviCell.CONFIG_SHAPE, NaviCell.CONFIG_SIZE or NaviCell.CONFIG_COLOR_SIZE
        """
        subtype = self._get_datatable_config_type(datatable)
        if not subtype:
            raise Exception("unknown datatable " + datatable)

        if subtype == _NV_CONTINUOUS or subtype == _NV_ORDERED_DISCRETE:
            return self._display_continuous_config_perform(module, 'switch_group_tab', datatable, config_type)

        if subtype == _NV_UNORDERED_DISCRETE:
            return self._display_unordered_discrete_config_perform(module, 'switch_group_tab', datatable, config_type)

        raise Exception("unknown datatable subtype " + datatable + " " + subtype)

    # EV: 2014-12-29: disconnected for now

##    def datatableConfigOpen(self, module, datatable, what):
##        self._datatable_config_perform(module, 'open', datatable, what)

##    def datatableConfigClose(self, module, datatable, what):
##        self._datatable_config_perform(module, 'close', datatable, what)

##    def datatableConfigApply(self, module, datatable, what):
##        self._datatable_config_perform(module, 'apply', datatable, what)

##    def datatableConfigCancel(self, module, datatable, what):
##        self._datatable_config_perform(module, 'cancel', datatable, what)

###
    def prepareImportDialog(self, module, filename, name, biotype):
        """ Fill the import dialog fields.
        Data (datatable, gene list etc.) can then be imported by a user click on the Import button:
        the import itself cannot be trigged from javascript for security reasons, that's why a user
        action is required.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
            :param filename (string): path of the data file
            :param name (string): name of the data to be imported
            :param biotype (string): biotype of the data file.
        """
        self._cli2srv('nv_prepare_import_dialog', module, [filename, name, biotype])

    def getCommandHistory(self, module):
        """ Get the command history of the NaviCell Web Service.

        Args:
            :param module (string): module on which to apply the command; empty string for current map.
        """
        return self._cli2srv('nv_get_command_history', module, [], True)

    def executeCommands(self, module, commands):
        """ Execute a set of commands encoded in the NaviCell WS protocol. """
        return self._send(self._message_id(), {'mode': 'cli2srv', 'perform': 'send_and_rcv', 'data': commands});

### get methods
    def getModuleList(self):
        """ Return the module list of the NaviCell map.
        
        For instance, the module list returned from the CellCycle map:
        [{'name': 'E2F1', 'id': 'E2F1'},
        {'name': 'P21CIP', 'id': 'P21CIP'},
        {'name': 'CYCLIND', 'id': 'CYCLIND'},
        {'name': 'CYCLINE', 'id': 'CYCLINE'},
        {'name': 'E2F4', 'id': 'E2F4'},
        {'name': 'E2F6', 'id': 'E2F6'},
        {'name': 'CYCLINH', 'id': 'CYCLINH'},
        {'name': 'RB', 'id': 'RB'},
        {'name': 'INK4', 'id': 'INK4'},
        {'name': 'P27KIP', 'id': 'P27KIP'},
        {'name': 'APOPTOSIS_ENTRY', 'id': 'APOPTOSIS_ENTRY'},
        {'name': 'WEE', 'id': 'WEE'},
        {'name': 'CDC25', 'id': 'CDC25'},
        {'name': 'CYCLINA', 'id': 'CYCLINA'},
        {'name': 'CYCLINC', 'id': 'CYCLINC'},
        {'name': 'CYCLINB', 'id': 'CYCLINB'},
        {'name': 'APC', 'id': 'APC'}]
        """
        return self._cli2srv('nv_get_module_list', '', [], True)

    def getBiotypeList(self):
        """ Return the list of biotypes understood by NaviCell Web Service.
        
        In the current version, the returned biotype list is as follows:
        [{'name': 'mRNA expression data', 'subtype': 'CONTINUOUS', 'type': 'EXPRESSION'},
        {'name': 'microRNA expression data', 'subtype': 'CONTINUOUS', 'type': 'EXPRESSION'},
        {'name': 'Protein expression data', 'subtype': 'CONTINUOUS', 'type': 'EXPRESSION'},
        {'name': 'Discrete Copy number data', 'subtype': 'ORDERED_DISCRETE', 'type': 'COPYNUMBER'},
        {'name': 'Continuous copy number data', 'subtype': 'CONTINUOUS', 'type': 'COPYNUMBER'},
        {'name': 'Mutation data', 'subtype': 'UNORDERED_DISCRETE', 'type': 'MUTATION'},
        {'name': 'Gene list', 'subtype': 'SET', 'type': 'GENELIST'}]
        """
        return self._cli2srv('nv_get_biotype_list', '', [], True)

    # TBD: getHugoList(self, module = '')
    # returns HUGO list per module if module is set
    def getHugoList(self):
        """ Return the list of HUGOs (gene names) of the NaviCell map.
        """
        module = ''
        if not self._hugo_list:
            self._hugo_list = self._cli2srv('nv_get_hugo_list', '', [], True)
            hugo_map = {}
            for hugo_name in self._hugo_list:
                hugo_map[hugo_name] = True
            self._hugo_map = hugo_map

        return self._hugo_list

    def openModule(self, module2open):
        """ Open a module.
        This method works only under some conditions of the security configuration of the client browser (popup configuration).

        Args:
            :param module2open (string): module to be opened
        """
        self._cli2srv('nv_open_module', '', [module2open, []])

###
    def examples(self):
        """ Display some examples. """

        protocol = self.proxy.getProtocol()
        if self.proxy.isHttps():
            datalist_url = "datatable_list_url_secure.txt"
        else:
            datalist_url = "datatable_list_url.txt"

        print('nv.importDatatables("http://localhost/~eviara/data/cancer_cell_line_broad/datatable_list_localhost.txt", "", "Datatable list", {"open_drawing_editor": True, "import_display_markers": "checked", "import_display_heatmap": True})')
        print("")

        print('nv.importDatatables("' + protocol + '://acsn.curie.fr/navicell/demo/data/CCL_CopyNumber.txt", "CopyNumber", "Continuous copy number data", {"open_drawing_editor": True, "import_display_markers": "checked", "import_display_heatmap": True})')
        print("")

        print('nv.importDatatables("' + protocol + '://acsn.curie.fr/navicell/demo/data/' + datalist_url + '", "", "Datatable list", {"open_drawing_editor": True, "import_display_markers": "checked", "import_display_heatmap": True})')
        print("")
#        print('nv.importDatatables(nv.makeDataFromFile("/bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/CCL_Expression_neg.txt"), "MyExpr", "Protein expression data", {"open_drawing_editor": True, "import_display_markers": "checked", "import_display_heatmap": True})')
        print('nv.importDatatables(nv.makeDataFromFile("/bioinfo/users/eviara/projects/navicell/data_examples/cancer_cell_line_broad/CCL_Expression_neg.txt"), "MyExpr", "Protein expression data", {"open_drawing_editor": True, "import_display_markers": "checked"})')
        print("")
        
        print('nv.executeCommands("", "!!' + protocol + '://acsn.curie.fr/navicell/demo/commands/demo1.nvc")')
        print("")
        print('nv.executeCommands("", "!!http://localhost/~eviara/demo/demo1.nvc")')
        print("")

        print('nv.sampleAnnotationImport("http://localhost/~eviara/data/cancer_cell_line_broad/SampleAnnotations.txt")')
        print("")
        print('nv.sampleAnnotationOpen("")')
        print('nv.sampleAnnotationImport("https://acsn.curie.fr/navicell/demo/data/SampleAnnotations.txt")')
        print('nv.sampleAnnotationSelectAnnotation("", "Tissue")')
        print('nv.sampleAnnotationApply("")')
        print("")

        print('nv.findEntities("", "A*", {"in": "annot", "token": "word"}, False)')
        print("")
        print('nv.openModule("../../survival_light/master/index.html")')
        print("")
        print('nv.noticeMessage("", "", "<span style=\\"color: darkblue\\">Running NaviCell in demo mode<br/>Please wait...</span>", "left top", 350, 300)')
        print("")
        print('nv.noticeMessage("", "<span style=\\"color: darkred; font-size: 18px\\">Demo</span>", "<span style=\\"color: darkblue; font-size: 14px\\">NaviCell is currently running in demo mode<br/><br/>Please&nbsp;wait...</span>", "left center", 380, 320)')
        print("")
