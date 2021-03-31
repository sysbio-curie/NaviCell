package fr.curie.navicell.database.species;

import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellSpecies {

  @Id
  public String id;

  public String speciesId;
  public String name;
  public String type;
  public String mapId;
  public String hugo = "";
  
  
  public NaviCellSpecies() {
    
  }
  
  public NaviCellSpecies(String speciesId, String name, String type, String mapId) {
    this.speciesId = speciesId;
    this.name = name;
    this.type = type;
    this.hugo = "";
    this.mapId = mapId;
  }
  
  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'speciesId': '%s', 'name': '%s', 'type': '%s', 'map': '%s'}",
        id, speciesId, name, type, mapId);
  }

}