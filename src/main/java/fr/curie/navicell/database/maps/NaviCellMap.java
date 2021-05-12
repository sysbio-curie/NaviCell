package fr.curie.navicell.database.maps;

import java.util.List;
import org.springframework.data.annotation.Id;

public class NaviCellMap {

  @Id
  public String id;

  public String folder;
  public String name;
  public String networkPath;
  public String sbgnPath;
  public String imagePath;
  public String url;
  public String username;
  public boolean isPublic;
  public List<String> tags;
  public String description;
  public boolean isBuilding;
  
  
  public NaviCellMap(String name, String username) {
    this.name = name;
    this.username = username;
    this.isBuilding = true;
    this.isPublic = false;
    this.networkPath = "";
    this.sbgnPath = "";
    this.imagePath = "";    
    
  }

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'folder': '%s', 'name': '%s', 'network_path': '%s', 'sbgn_path': '%s', 'image_path': '%s'}",
        id, folder, name, networkPath, sbgnPath, imagePath);
  }

}