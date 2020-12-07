package fr.curie.navicell.database;

import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellSpecies {

  @Id
  public String id;

  public String name;
  public String type;
  public String mapId;
  
  
  public NaviCellSpecies() {
    
  }
  
  public NaviCellSpecies(String name, String type, String mapId) {
    this.name = name;
    this.type = type;
    this.mapId = mapId;
  }

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'name': '%s', 'type': '%s', 'map': '%s'}",
        id, name, type, mapId);
  }

}