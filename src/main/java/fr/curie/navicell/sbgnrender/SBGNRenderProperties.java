package fr.curie.navicell.sbgnrender;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("sbgn-render")
public class SBGNRenderProperties {

	private String location;
	private String whiteListedIps;
	
	public String getWhiteListedIps() {
		return whiteListedIps;
	}
	
	public void setWhiteListedIps(String whiteListedIps) {
		this.whiteListedIps = whiteListedIps;
	}
	
	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

}