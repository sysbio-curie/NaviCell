package fr.curie.navicell.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("storage")
public class StorageProperties {

	/**
	 * Folder location for storing files
	 */
	private String mapsLocation;// = "/var/navicell/upload-dir/";
	private String dataLocation;// = "/var/navicell/upload-dir/";

	public String getMapsLocation() {
		return mapsLocation;
	}

	public void setMapsLocation(String location) {
		this.mapsLocation = location;
	}
	
	public String getDataLocation() {
		return dataLocation;
	}

	public void setDataLocation(String location) {
		this.dataLocation = location;
	}

}