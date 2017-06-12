package fr.curie.jnavicell;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.UnsupportedEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;

/**
 * Java binding for NaviCell REST API.
 * 
 * @author eb
 *
 */
@SuppressWarnings("unchecked")
public class NaviCell {

	/**
	 * URL of the NaviCell map
	 */
	private String map_url = "https://navicell.curie.fr/navicell/maps/cellcycle/master/index.php";
	
	/**
	 * NaviCell proxy URL
	 */
	private String proxy_url = "https://navicell.curie.fr/cgi-bin/nv_proxy.php";
	
	/**
	 * Simple counter for message IDs
	 */
	private int msg_id = 1000;
	
	/**
	 * List of all the gene symbols (HUGO) contained in the NaviCell map.
	 */
	private Set<String> hugo_list = new HashSet<String>();
	
	/**
	 * List of NaviCell biotypes (JSONArray object)
	 */
	private JSONArray biotype_list;
	
	/**
	 * List of all modules contained in the NaviCell map (JSONArray object).
	 */
	private JSONArray module_list;
	
	/**
	 * List of all datatables currently loaded in the NaviCell session (JSONArray object)..
	 */
	private JSONArray datatable_list;
	
	/**
	 * List of all samples loaded in the current NaviCell session (JSONArray object).
	 */
	private JSONArray datatable_sample_list; 
	
	/**
	 * List of all the genes contained in the datatables loaded in the current NaviCell session (JSONArray object).
	 */
	private JSONArray datatable_gene_list;
	
	/**
	 * NaviCell session ID.
	 */
	private String session_id = "";
	
	/**
	 * Maximum size for data string. 
	 * If size is greater than this limit, the data is cut and send by packsize 'packets' 
	 */
	private int packsize = 500000;
	
	/**
	 * Constructor
	 */
	public NaviCell() {
		// nothing to be done here.
	}

	/**
	 * Set the map_url address (NaviCell or ACSN map).
	 * 
	 * @param url string: valid NaviCell map web address.
	 */
	public void setMapUrl(String url) {
		map_url = url;
	}
	
	/**
	 * Set the proxy URL.
	 * @param url
	 */
	public void setProxyUrl (String url) {
		proxy_url = url;
	}
	
	/**
	 * Get the list of gene symbols (HUGO).
	 * @return set
	 */
	public Set<String> getHugoList() {
		return(hugo_list);
	}

	/**
	 * Get the list of biotypes.
	 * @return JSONArray
	 */
	public JSONArray getBiotypeList() {
		return(biotype_list);
	}
	
	/**
	 * Get the list of modules.
	 * @return JSONArray
	 */
	public JSONArray getModuleList() {
		return(module_list);
	}

	/**
	 * Get the list of datatables.
	 * @return JSONArray
	 */
	public JSONArray getDatatableList() {
		return(datatable_list);
	}

	/**
	 * Get the list of all datatables samples.
	 * @return JSONArray
	 */
	public JSONArray getDatatableSampleList() {
		return(datatable_sample_list);
	}

	/**
	 * Get the list of all datatables genes.
	 * @return JSONArray
	 */
	public JSONArray getDatatableGeneList() {
		return(datatable_gene_list);
	}

	/**
	 * Get map URL.
	 * @return string
	 */
	public String getMapUrl() {
		return(map_url);
	}
	
	/**
	 * Get proxy URL
	 * @return string
	 */
	public String getProxyUrl() {
		return(proxy_url);
	}
	
	/**
	 * Get the session ID
	 * @return string
	 */
	public String getSessionId () {
		return(session_id);
	}
	
	

	/* ------------------------------------------------------------------------
	 * Session and utility functions.
	 * ------------------------------------------------------------------------
	 */
	
	
	/**
	 * Encode URL for NaviCell server.
	 * @param module (String)
	 * @param action (String)
	 * @param args list of objects for the 'args' array
	 * @return UrlEncodedFormEntity url
	 */
	private UrlEncodedFormEntity buildUrl(String module, String action, ArrayList<Object> args) {
		
		UrlEncodedFormEntity url = null;
		
		// encode command string
		JSONArray ja = new JSONArray();
		for (Object obj : args)
			ja.add(obj);
		JSONObject jo = new JSONObject();
		jo.put("module", module);
		jo.put("args", ja);
		jo.put("msg_id", msg_id);
		jo.put("action", action);
		String str_data = "@COMMAND " + jo.toJSONString();
		
		ArrayList<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair("id", session_id));
		params.add(new BasicNameValuePair("mode", "cli2srv"));
		params.add(new BasicNameValuePair("perform", "send_and_rcv"));
		params.add(new BasicNameValuePair("data", str_data));
		//System.out.println(params);
		
		try {
			url = new UrlEncodedFormEntity(params, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
		return url;
	}
	
	/**
	 * Build a HttpClient object trusting any SSL certificate.
	 * @return HttpClient object
	 */
	@SuppressWarnings("deprecation")
	private HttpClient buildHttpClient() {
		HttpClientBuilder b = HttpClientBuilder.create();

		SSLContext sslContext = null;
		try {
			sslContext = new SSLContextBuilder().loadTrustMaterial(null, new TrustStrategy() {
				public boolean isTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
					return true;
				}
			}).build();
			b.setSslcontext(sslContext);
		}
		catch (Exception e) {
			e.printStackTrace();
		}

		// or SSLConnectionSocketFactory.getDefaultHostnameVerifier(), if you don't want to weaken
		//HostnameVerifier hostnameVerifier = SSLConnectionSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER;
		HostnameVerifier hostnameVerifier = SSLConnectionSocketFactory.getDefaultHostnameVerifier();
		SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(sslContext, hostnameVerifier);
		Registry<ConnectionSocketFactory> socketFactoryRegistry = RegistryBuilder.<ConnectionSocketFactory>create()
		        .register("http", PlainConnectionSocketFactory.getSocketFactory())
		        .register("https", sslSocketFactory)
		        .build();

		// allows multi-threaded use
		PoolingHttpClientConnectionManager connMgr = new PoolingHttpClientConnectionManager(socketFactoryRegistry);
		b.setConnectionManager(connMgr);

		HttpClient client = b.build();
		
		return client;
	}

	

	
	
	/**
	 * Send a POST request to the NaviCell server.
	 * @param url
	 * @return String server response
	 */
	private String sendToServer(UrlEncodedFormEntity url) {
		String ret = "";
		try {
			//System.out.println(EntityUtils.toString(url));
			HttpPost httppost = new HttpPost(getProxyUrl());
			httppost.setEntity(url);
			HttpClient client = buildHttpClient();
			HttpResponse response = client.execute(httppost); 
			//System.out.println(response);
			ret = EntityUtils.toString(response.getEntity());
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return ret;
	}
	
	/**
	 * Generate a valid session ID.
	 * @throws UnsupportedEncodingException
	 */
	private void generateSessionID() throws UnsupportedEncodingException {
		
		ArrayList<NameValuePair> params = new ArrayList<NameValuePair>(4);
		params.add(new BasicNameValuePair("id", "1"));
		params.add(new BasicNameValuePair("perform", "genid"));
		params.add(new BasicNameValuePair("msg_id", Integer.toString(msg_id)));
		params.add(new BasicNameValuePair("mode", "session"));
		UrlEncodedFormEntity myUrl = null;
		myUrl = new UrlEncodedFormEntity(params, "UTF-8");
		
		String ID = sendToServer(myUrl);
		session_id = ID;
	}
	
	/**
	 * Increase message ID value.
	 */
	private void increaseMessageID() {
		msg_id++;
	}
	
	/**
	 * Wait for NaviCell server to be ready.
	 * @param module
	 */
	private void waitForReady(String module) {
		while (serverIsReady(module) == false) {
			try {
				//System.out.println("waiting for server..");
				Thread.sleep(500);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Returns true if NaviCell server is ready.
	 * @return boolean
	 */
	public boolean serverIsReady(String module) {
		boolean ret = false;
		increaseMessageID();

		UrlEncodedFormEntity url = buildUrl(module, "nv_is_ready", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONParser parser = new JSONParser();
			JSONObject o;
			try {
				o = (JSONObject) parser.parse(rep);
				if (o.get("data").toString().equals("true"))
					ret = true;
			} catch (org.json.simple.parser.ParseException e) {
				e.printStackTrace();
			}
		}
		
		return ret;
	}
	
	/**
	 * Returns true if NaviCell server is ready after data import.
	 * @return boolean
	 */
	private boolean isImported(String module) {
		boolean ret = false;
		increaseMessageID();

		UrlEncodedFormEntity url = buildUrl(module, "nv_is_imported", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONParser parser = new JSONParser();
			JSONObject o;
			try {
				o = (JSONObject) parser.parse(rep);
				if (o.get("data").toString().equals("true"))
					ret = true;
			} catch (org.json.simple.parser.ParseException e) {
				e.printStackTrace();
			}
		}
		return ret;
	}
	
	/**
	 * Wait for NaviCell server to be ready after data import.
	 * @param module
	 */
	private void waitForImported(String module) {
		while (isImported(module) == false) {
			try {
				//System.out.println("waiting for server..");
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Launch a browser session with the current ID and map URL.
	 */
	public void launchBrowser() {
		increaseMessageID();
		try {
			if (session_id == "") {
				generateSessionID();
			}
			String url = map_url + "?id=" + session_id + "&proxy_url=" + proxy_url;
			java.awt.Desktop.getDesktop().browse(java.net.URI.create(url));
			waitForReady("");
		}
		catch (java.io.IOException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
		}
	}

	
	/* ------------------------------------------------------------------------
	 * Navigation and zooming functions.
	 * ------------------------------------------------------------------------
	 */
	
	
	/**
	 * Set the zoom level on the current map.
	 * @param module
	 * @param zoomLevel
	 */
	public void setZoom(String module, int zoomLevel) {
		
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_set_zoom", new ArrayList<Object>(Arrays.asList(zoomLevel)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the relative position of the map center. 
	 * @param module
	 * @param location = 'MAP_CENTER' or 'MAP_EAST' or 'MAP_SOUTH' or MAP_NORTH' or 'MAP_SOUTH_WEST' or 'MAP_SOUTH_EAST' or 'MAP_NORTH_EAST'.
	 */
	public void setMapCenter(String module, String location) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_set_center", new ArrayList<Object>(Arrays.asList(location)));
		if (url != null) {
			sendToServer(url);
		}
	}

	/**
	 * Set the absolute position of the map center.
	 * @param module
	 * @param x x-coordinate (integer)
	 * @param y y-coordinate (integer)
	 */
	public void setMapCenterAbsolute(String module, int x, int y) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_set_center", new ArrayList<Object>(Arrays.asList("ABSOLUTE", x, y)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Move the map center (relative).
	 * @param module
	 * @param x relative x-coordinate
	 * @param y relative y-coordinate
	 */
	public void moveMapCenter(String module, int x, int y) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_set_center", new ArrayList<Object>(Arrays.asList("RELATIVE", x, y)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	
	/* ------------------------------------------------------------------------
	 * Entity selection functions.
	 * ------------------------------------------------------------------------
	 */

	/**
	 * Find and select an entity on the map.
	 * @param module
	 * @param entity entity name (String)
	 */
	public void selectEntity(String module, String entity) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_find_entities", new ArrayList<Object>(Arrays.asList(entity)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Find one or more entities on the map according to a pattern (e.g. AKT*).
	 * @param module
	 * @param pattern entity's name pattern (String)
	 * @param bubble display the bubble (boolean)
	 */
	public void findEntities(String module, String pattern, boolean bubble) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_find_entities", new ArrayList<Object>(Arrays.asList(pattern, bubble)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Uncheck all entities on the map.
	 * @param module
	 */
	public void uncheckEntities(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_uncheck_all_entities", new ArrayList<Object>());
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Un-highlight all entities on the map.
	 * @param module
	 */
	public void unhighlightAllEntities(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_unhighlight_all_entities", new ArrayList<Object>());
		if (url != null) {
			sendToServer(url);
		}
	}

	
	/* ------------------------------------------------------------------------
	 * Get info from maps functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Get the list of the HUGO gene symbols for the current map and set the field hugo_list.
	 * @param module
	 */
	public void getHugoList(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_hugo_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			for (int i=0;i<ar.size();i++)
				hugo_list.add((String) ar.get(i));
		}
	}
	
	/**
	 * get the list of NaviCell internal data types (biotypes).
	 * @param module
	 */
	public void getBiotypes(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_biotype_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			biotype_list = ar;
		}
	}

	/**
	 * Get the list of modules defined on the current map.
	 * @param module
	 */
	public void getModules(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_module_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			module_list = ar;
		}
	}

	/**
	 * Get the list of imported datatables.
	 * @param module
	 */
	public void getImportedDatatables(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_datatable_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			datatable_list = ar;
		}
	}

	/**
	 * Get the list of samples from all imported datatables.
	 * @param module
	 */
	public void getDatatableSamples(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_datatable_sample_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			datatable_sample_list = ar;
		}
	}
	
	/**
	 * Get the list of genes from all imported datatables.
	 * @param module
	 */
	public void getDatatableGenes(String module) {

		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_get_datatable_gene_list", new ArrayList<Object>());
		if (url != null) {
			String rep = sendToServer(url);
			JSONObject obj = (JSONObject) JSONValue.parse(rep);
			JSONArray ar = (JSONArray) obj.get("data");
			datatable_gene_list = ar;
		}
	}


	/* ------------------------------------------------------------------------
	 * Data import functions.
	 * ------------------------------------------------------------------------
	 */
	

	/**
	 * Load data from a file.
	 * if select is true, only genes present on the map are kept. The filtering 
	 * is done on HUGO gene symbols (hugo_list).
	 * @param fileName Path to the file
	 * @param select Boolean true: select genes preset on the map
	 * @return NaviCell compatible string data (String)
	 */
	public String loadDataFromFile(String fileName, Boolean select) {
		
		// get hugo gene list if it's not set
		if (select == true && hugo_list.size() == 0)
			getHugoList("");
		
		StringBuilder sb = new StringBuilder();
		try {
			BufferedReader br = new BufferedReader(new FileReader(new File(fileName)));
			String line;
			int ct=0;
			int count_genes=0;
			int count_lines=0;
			sb.append("@DATA\n");
			while((line = br.readLine()) != null) {
				if (select == true && ct>1) {
					String[] tokens = line.split("\\s|\\t");
					// select genes that are present on the map
					if (hugo_list.contains(tokens[0])) {
						sb.append(line+"\n");
						count_genes++;
					}
				}
				else {
					sb.append(line+"\n");
					count_lines++;
				}
				ct++;
			}
			br.close();
			if (select == true)
				System.out.println(count_genes + " genes selected.");
			else
				System.out.println(count_lines-1 + " samples selected.");
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return sb.toString();
	}
	
	/**
	 * Import data into current NaviCell session.
	 * @param module module name.
	 * @param fileName file (with complete path) name.
	 * @param biotype NaviCell data type.
	 * @param datatableName name of the datatable.
	 */
	public void importData(String module, String fileName, String biotype, String datatableName) {
		increaseMessageID();
		String str_data = loadDataFromFile(fileName, true);
		if (str_data.length() > packsize) {
			sendBigDataToServer(module, 
					"nv_import_datatables", 
					new ArrayList<Object>(Arrays.asList(biotype, datatableName, "", str_data, new JSONObject())));
			waitForImported(module);
		}
		else {
			UrlEncodedFormEntity url = buildUrl(module, "nv_import_datatables", 
					new ArrayList<Object>(Arrays.asList(biotype, datatableName, "", str_data, new JSONObject())));
			if (url != null) {
				sendToServer(url);
				waitForImported(module);
			}
		}
	}
	
	/**
	 * Import a sample annotation file.
	 * @param module
	 * @param fileName
	 */
	public void importSampleAnnotation(String module, String fileName) {
		increaseMessageID();
		String str_data = loadDataFromFile(fileName, false);
		if (str_data.length() > packsize) {
			sendBigDataToServer(module, 
					"nv_sample_annotation_perform", 
					new ArrayList<Object>(Arrays.asList("import", str_data)));
			waitForImported(module);
		}
		else {
			UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
					new ArrayList<Object>(Arrays.asList("import", str_data)));
			if (url != null) {
				sendToServer(url);
				waitForImported(module);
			}
		}
	}
	
	/**
	 * Slice large data strings into 'packets' and send them o the server.
	 * 
	 * @param module
	 * @param action
	 * @param args array of arguments for the COMMAND string
	 */
	private void sendBigDataToServer(String module, String action, ArrayList<Object> args) {
		
		// encode the command string
		JSONArray fill_ja = new JSONArray();
		for (Object obj : args)
			fill_ja.add(obj);
		JSONObject fill_jo = new JSONObject();
		fill_jo.put("module", module);
		fill_jo.put("action", action);
		fill_jo.put("args", fill_ja);
		
		String fill_cmd = "@COMMAND " + fill_jo.toJSONString();
		
		int packcount = 0; // number of 'packets'
		int cmd_len = fill_cmd.length();
		packcount = (int)(cmd_len/packsize)+1;
		
		// send command data string cut in 'packets'

		for (int i=0;i<packcount;i++) {
			int packnum = i+1;
			int stop = (i+1) * packsize;
			int start = 0;
			if (i>0)
				start = (i * packsize) + 1;
			if (stop > cmd_len)
				stop = cmd_len - 1;

			StringBuilder sb = new StringBuilder();
			for (int j=start;j<=stop;j++) 
				sb.append(fill_cmd.charAt(j));
			
			UrlEncodedFormEntity fill_url = null;

			ArrayList<NameValuePair> fill_params = new ArrayList<NameValuePair>();
			fill_params.add(new BasicNameValuePair("perform", "filling"));
			fill_params.add(new BasicNameValuePair("data", sb.toString()));
			fill_params.add(new BasicNameValuePair("id", session_id));
			fill_params.add(new BasicNameValuePair("packnum", Integer.toString(packnum)));
			fill_params.add(new BasicNameValuePair("packcount", Integer.toString(packcount)));
			fill_params.add(new BasicNameValuePair("mode", "cli2srv"));
			
			try {
				fill_url = new UrlEncodedFormEntity(fill_params, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}

			if (fill_url != null) {
				//System.out.println("sending packet " + (i+1));
				sendToServer(fill_url);
			}
		}
		
		// now encode global command string; this will trigger data rebuild from individual packets

		UrlEncodedFormEntity url = null;

		ArrayList<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair("data", "@@"));
		params.add(new BasicNameValuePair("id", session_id));
		params.add(new BasicNameValuePair("perform", "send_and_rcv"));
		params.add(new BasicNameValuePair("packcount", Integer.toString(packcount)));
		params.add(new BasicNameValuePair("mode", "cli2srv"));
		params.add(new BasicNameValuePair("msg_id", Integer.toString(msg_id)));

		try {
			url = new UrlEncodedFormEntity(params, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}

		if (url != null) sendToServer(url);
		
	}


	/* ------------------------------------------------------------------------
	 * Sample annotation editor functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Select annotation in the annotation editor window.
	 * @param module
	 * @param annotation_name string
	 * @param true_or_false boolean
	 */
	public void sampleAnnotationSelectAnnotation(String module, String annotation_name, boolean true_or_false) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
				new ArrayList<Object>(Arrays.asList("select_annotation", annotation_name, true_or_false)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes in the annotation editor.
	 * @param module
	 */
	public void sampleAnnotationSelectApply(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
				new ArrayList<Object>(Arrays.asList("apply")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Open the annotation editor window.
	 * @param module
	 */
	public void sampleAnnotationSelectOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
				new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the annotation editor window.
	 * @param module
	 */
	public void sampleAnnotationSelectClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
				new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel changes in the annotation editor window.
	 * @param module
	 */
	public void sampleAnnotationSelectCancel(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_sample_annotation_perform", 
				new ArrayList<Object>(Arrays.asList("cancel")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * Drawing Configuration Dialog functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open the drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply modifications for drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigApply(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("apply")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply modifications for drawing configuration dialog and close the window.
	 * @param module
	 */
	public void drawingConfigApplyAndClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("apply_and_close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel modifications for drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigCancel(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("cancel")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select Heatmap in drawing configuration dialog.
	 * @param module
	 * @param check Boolean 
	 */
	public void drawingConfigSelectHeatmap(String module, Boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("select_heatmap", check)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select Barplot in drawing configuration dialog.
	 * @param module
	 * @param check Boolean 
	 */
	public void drawingConfigSelectBarplot(String module, Boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("select_barplot", check)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select Glyph in drawing configuration dialog.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param check Boolean 
	 */
	public void drawingConfigSelectGlyph(String module, int glyph_num, Boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("select_glyph", glyph_num, check)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select Map Staining in drawing configuration dialog.
	 * @param module
	 * @param check Boolean 
	 */
	public void drawingConfigSelectMapStaining(String module, Boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("select_map_staining", check)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select 'Display all genes' option in drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigSelectDisplayAllGenes(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("display_all_genes")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select 'Display selected genes' option in drawing configuration dialog.
	 * @param module
	 */
	public void drawingConfigSelectDisplaySelectedGenes(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_drawing_config_perform", new ArrayList<Object>(Arrays.asList("display_selected_genes")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * My Data Dialog functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	

	/**
	 * Close 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the datatables tab active for 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogSetDatatables(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("select_datatables")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the Sample tab active for 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogSetSamples(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("select_samples")));
		if (url != null) {
			sendToServer(url);
		}
	}

	/**
	 * Set the Gene tab active for 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogSetGenes(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("select_genes")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the Groups tab active for 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogSetGroups(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("select_groups")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the Module tab active for 'My Data' dialog.
	 * @param module
	 */
	public void mydataDialogSetModules(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_mydata_perform", new ArrayList<Object>(Arrays.asList("select_modules")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * My Data Dialog functions.
	 * ------------------------------------------------------------------------
	 */

	/**
	 * Open the glyph editor dialog.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 */
	public void glyphEditorOpen(String module, int glyph_num) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("open", glyph_num)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the glyph editor dialog.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 */
	public void glyphEditorClose(String module, int glyph_num) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("close", glyph_num)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to the glyph editor dialog.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 */
	public void glyphEditorApply(String module, int glyph_num) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("apply", glyph_num)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to the glyph editor and close the dialog.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 */
	public void glyphEditorApplyAndClose(String module, int glyph_num) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("apply_and_close", glyph_num)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel changes on the glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 */
	public void glyphEditorCancel(String module, int glyph_num) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("cancel", glyph_num)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a sample in the glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param sample_name sample name (String)
	 */
	public void glyphEditorSelectSample(String module, int glyph_num, String sample_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("select_sample", glyph_num, sample_name)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Select datatable for glyph shape in glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param datatable_name datatable name (String)
	 */
	public void glyphEditorSelectShapeDatatable(String module, int glyph_num, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable_shape", glyph_num, datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}

	/**
	 * Select datatable for glyph color in glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param datatable_name datatable name (String)
	 */
	public void glyphEditorSelectColorDatatable(String module, int glyph_num, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable_color", glyph_num, datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select datatable for glyph size in glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param datatable_name datatable name (String)
	 */
	public void glyphEditorSelectSizeDatatable(String module, int glyph_num, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable_size", glyph_num, datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the transparency parameter in the glyph editor.
	 * @param module
	 * @param glyph_num glyph number (integer between 1 and 5)
	 * @param value transparency value (integer between 1 and 100)
	 */
	public void glyphEditorSetTransparency(String module, int glyph_num, int value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_glyph_editor_perform", new ArrayList<Object>(Arrays.asList("set_transparency", glyph_num, value)));
		if (url != null) {
			sendToServer(url);
		}
	}

	/* ------------------------------------------------------------------------
	 * Barplot editor functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open the barplot editor.
	 * @param module
	 */
	public void barplotEditorOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the barplot editor.
	 * @param module
	 */
	public void barplotEditorClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to the barplot editor.
	 * @param module
	 */
	public void barplotEditorApply(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("apply")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes and close the barplot editor.
	 * @param module
	 */
	public void barplotEditorApplyAndClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("apply_and_close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel changes in the barplot editor.
	 * @param module
	 */
	public void barplotEditorCancel(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("cancel")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a sample or group in the barplot editor.
	 * @param module
	 * @param col_num
	 * @param sample_name
	 */
	public void barplotEditorSelectSample(String module, int col_num, String sample_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("select_sample", col_num, sample_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a datatable in the barplot editor.
	 * @param module
	 * @param datatable_name
	 */
	public void barplotEditorSelectDatatable(String module, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable", datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Clear all samples in the barplot editor.
	 * @param module
	 */
	public void barplotEditorClearSamples(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("clear_samples")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select all samples in the barplot editor.
	 * @param module
	 */
	public void barplotEditorSelectAllSamples(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("all_samples")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select all groups in the barplot editor.
	 * @param module
	 */
	public void barplotEditorSelectAllGroups(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("all_groups")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the transparency parameter in the barplot editor. 
	 * @param module
	 * @param value transparency value (integer between 1 and 100)
	 */
	public void barplotEditorSetTransparency(String module, int value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_barplot_editor_perform", new ArrayList<Object>(Arrays.asList("set_transparency", value)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * Heatmap editor functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel changes in the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorCancel(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("cancel")));
		if (url != null) {
			sendToServer(url);
		}
	}

	
	/**
	 * Apply changes in the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorApply(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("apply")));
		if (url != null) {
			sendToServer(url);
		}
	}

	/**
	 * Apply changes to the heatmap editor and close the window.
	 * @param module
	 */
	public void heatmapEditorApplyAndClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("apply_and_close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a sample in the heatmap editor.
	 * @param module
	 * @param col_num column index (integer starting from 0)
	 * @param sample_name sample name (String)
	 */
	public void heatmapEditorSelectSample(String module, int col_num, String sample_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("select_sample", col_num, sample_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a datatable in the heatmap editor.
	 * @param module
	 * @param row_num row index (starting from 0)
	 * @param datatable_name datatable name (String)
	 */
	public void heatmapEditorSelectDatatable(String module, int row_num, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable", row_num, datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Clear the samples in the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorClearSamples(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("clear_samples")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select all the samples in the heatmap editor.
	 * @param module
	 */
	public void heatmapEditorSelectAllSamples(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("all_samples")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select all the groups in the heatmap editpr.
	 * @param module
	 */
	public void heatmapEditorSelectAllGroups(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("all_groups")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the transparency parameter in the heatmap editor.
	 * @param module
	 * @param value transparency value (integer between 1 and 100)
	 */
	public void heatmapEditorSetTransparency(String module, int value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_heatmap_editor_perform", new ArrayList<Object>(Arrays.asList("set_transparency", value)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	
	/* ------------------------------------------------------------------------
	 * Map staining editor functions.
	 * ------------------------------------------------------------------------
	 */

	
	/**
	 * Open the map staining editor.
	 * @param module
	 */
	public void mapStainingEditorOpen(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("open")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Close the map staining editor.
	 * @param module
	 */
	public void mapStainingEditorClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Cancel changes in map editor. 
	 * @param module
	 */
	public void mapStainingEditorCancel(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("cancel")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to the map editor.
	 * @param module
	 */
	public void mapStainingEditorApply(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("apply")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes and the map staining editor window.
	 * @param module
	 */
	public void mapStainingEditorApplyAndClose(String module) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("apply_and_close")));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a datatable in the map editor window.
	 * @param module
	 * @param datatable_name
	 */
	public void mapStainingEditorSelectDatatable(String module, String datatable_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("select_datatable", datatable_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Select a sample in the map staining editor.
	 * @param module
	 * @param sample_name
	 */
	public void mapStainingEditorSelectSample(String module, String sample_name) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("select_sample", sample_name)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set the transparency parameter in the map staining editor.
	 * @param module
	 * @param transparency_value integer value between 1 and 100
	 */
	public void mapStainingEditorSetTransparency(String module, int transparency_value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_map_staining_editor_perform", new ArrayList<Object>(Arrays.asList("set_transparency", transparency_value)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * Unordered discrete configuration editor functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open unordered discrete configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter String, either 'shape' or 'color' or 'size'.
	 */
	public void unorderedConfigOpen(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("open", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Open unordered discrete configuration editor for a given type of parameter. 
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter String, either 'shape' or 'color' or 'size'.
	 */
	public void unorderedConfigClose(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("close", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	

	/**
	 * Cancel changes for unordered discrete configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter String, either 'shape' or 'color' or 'size'.
	 */
	public void unorderedConfigCancel(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("cancel", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to unordered discrete configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter String, either 'shape' or 'color' or 'size'.
	 */
	public void unorderedConfigApply(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("apply", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Apply changes to unordered discrete configuration editor for a given type of parameter, and close the window. 
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter String, either 'shape' or 'color' or 'size'.
	 */
	public void unorderedConfigApplyAndClose(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("apply_and_close", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Open/close advanced configuration for unordered discrete configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter
	 * @param check
	 */
	public void unorderedConfigSetAdvancedConfig(String module, String datatable_name, String datatable_parameter, boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_advanced_configuration", datatable_name, datatable_parameter, check)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * "Set discrete value for unordered discrete configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter A string, 'shape' or 'color' or 'size'
	 * @param sample_or_group A string, either 'sample' or 'group'
	 * @param index integer value
	 * @param value double value
	 */
	public void unorderedConfigSetDiscreteValue(String module, String datatable_name, String datatable_parameter, 
			String sample_or_group, int index, double value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_discrete_value", datatable_name, datatable_parameter, 
						sample_or_group, index, value)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set color value for unordered discrete configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param color string hex code color value, e.g. 'FF0000'
	 */
	public void unorderedConfigSetDiscreteColor(String module, String datatable_name, String sample_or_group, int index, String color) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_discrete_color", datatable_name, "color",
						sample_or_group, index, color)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set size value for unordered discrete configuration editor. 
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param size integer value
	 */
	public void unorderedConfigSetDiscreteSize(String module, String datatable_name, String sample_or_group, int index, int size) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_discrete_size", datatable_name, "size",
						sample_or_group, index, size)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set shape value for unordered discrete configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param shape integer value
	 */
	public void unorderedConfigSetDiscreteShape(String module, String datatable_name, String sample_or_group, int index, int shape) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_discrete_shape", datatable_name, "shape",
						sample_or_group, index, shape)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Set condition value for unordered discrete configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter 'size' or 'shape' or 'color'
	 * @param sample_or_group 'sample' or 'group'
	 * @param index integer value
	 * @param condition integer value
	 */
	public void unorderedConfigSetDiscreteCondition(String module, String datatable_name, String datatable_parameter, 
			String sample_or_group, int index, int condition) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_discrete_cond", datatable_name, datatable_parameter, sample_or_group, index, condition)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/**
	 * Switch to sample tab for unordered discrete configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter string 'size' or 'shape' or 'color'.
	 */
	public void unorderedConfigSwitchSampleTab(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("switch_sample_tab", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	

	/**
	 * Switch to group tab for unordered discrete configuration editor. 
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter string, 'size' or 'shape' or 'color'
	 */
	public void unorderedConfigSwitchGroupTab(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_unordered_discrete_config_perform", 
				new ArrayList<Object>(Arrays.asList("switch_group_tab", datatable_name, datatable_parameter)));
		if (url != null) {
			sendToServer(url);
		}
	}
	
	/* ------------------------------------------------------------------------
	 * Continuous configuration editor functions.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Open continuous configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter string 'shape' or 'color' or 'size'
	 */
	public void continuousConfigOpen(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("open", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}

	/**
	 * Close the continuous configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter string 'shape' or 'color' or 'size'
	 */
	public void continuousConfigClose(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("close", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Cancel changes made in the continuous configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter  string 'shape' or 'color' or 'size'
	 */
	public void continuousConfigCancel(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("cancel", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Apply changes made to the continuous configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter  string 'shape' or 'color' or 'size'
	 */
	public void continuousConfigApply(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("apply", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Apply changes and close the continuous configuration editor.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter
	 */
	public void continuousConfigApplyAndClose(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("apply_and_close", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set absolute value mode for continuous configuration editor for a given type of parameter.
	 * @param module
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 * @param datatable_name
	 * @param check boolean true or false
	 */
	public void continuousConfigSetAbsVal(String module, String datatable_parameter, String datatable_name, boolean check) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_sample_absval", datatable_parameter, datatable_name, check)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set the method used when multiple symbols map to the same entity. 
	 * @param module
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 * @param datatable_name
	 * @param method_index integer value
	 */
	public void continuousConfigSetSampleMethod(String module, String datatable_parameter, String datatable_name, int method_index) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_sample_method", datatable_parameter, datatable_name, method_index)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}

	/**
	 * Set the method used when multiple symbols map to the same entity. 
	 * @param module
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 * @param datatable_name
	 * @param method_index integer value
	 */
	public void continuousConfigSetGroupMethod(String module, String datatable_parameter, String datatable_name, int method_index) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_group_method", datatable_parameter, datatable_name, method_index)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set the size selection to a given value for the 'size' parameter. 
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param size integer value
	 */
	public void continuousConfigSetSelectionSize(String module, String datatable_name, String sample_or_group, int index, int size) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_select_size", datatable_name, "size", sample_or_group, index, size)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set the shape selection to a given value for the 'shape' parameter. 
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param shape integer value
	 */
	public void continuousConfigSetSelectionShape(String module, String datatable_name, String sample_or_group, int index, int shape) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_select_shape", datatable_name, "shape", sample_or_group, index, shape)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Switch continuous configuration editor window to 'group' tab.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 */
	public void continuousConfigSwitchGroupTab(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("switch_group_tab", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Switch continuous configuration editor window to 'sample' tab.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 */
	public void continuousConfigSwitchSampleTab(String module, String datatable_name, String datatable_parameter) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("switch_sample_tab", datatable_name, datatable_parameter)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set continuous configuration step count parameter to a given value.
	 * @param module
	 * @param sample_or_group string 'sample' or 'group'
	 * @param datatable_parameter 'shape' or 'color' or 'size'
	 * @param datatable_name
	 * @param step_count integer value
	 */
	public void continuousConfigSetStepCount(String module, String sample_or_group, String datatable_parameter, String datatable_name,  int step_count) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("step_count_change", sample_or_group, datatable_parameter, datatable_name, step_count)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set continuous configuration color value.
	 * @param module
	 * @param datatable_name
	 * @param sample_or_group string 'sample or 'group'
	 * @param index integer value
	 * @param color_hex_value string for the color code e.g. 'FFDD00'
	 */
	public void continuousConfigSetColorAt(String module, String datatable_name, String sample_or_group, int index, String color_hex_value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_input_color", datatable_name, "color", sample_or_group, index, color_hex_value)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}
	
	/**
	 * Set continuous configuration value at a given index.
	 * @param module
	 * @param datatable_name
	 * @param datatable_parameter string 'size' or 'shape' or 'color'
	 * @param sample_or_group string 'sample' or 'group'
	 * @param index integer value
	 * @param continuous_value double value
	 */
	public void continuousConfigSetValueAt(String module, String datatable_name, String datatable_parameter, String sample_or_group, int index, double continuous_value) {
		increaseMessageID();
		UrlEncodedFormEntity url = buildUrl(module, "nv_display_continuous_config_perform", 
				new ArrayList<Object>(Arrays.asList("set_input_value", datatable_name, datatable_parameter, sample_or_group, index, continuous_value)));
		if (url != null) {
			System.out.println(sendToServer(url));
		}
	}

}
