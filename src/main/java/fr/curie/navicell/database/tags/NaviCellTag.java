package fr.curie.navicell.database.tags;

import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellTag {

  @Id
  public String id;

  public String name;
  public String mapId;
  
  
  public NaviCellTag() {
    
  }
  
  public NaviCellTag(String name, String map_id) {
    this.name = name;
    this.mapId = map_id;
  }
  
  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'name': '%s', 'mapId', '%s'}",
        id, name, mapId);
  }

}