package fr.curie.navicell.database;

import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellSpecies {

  @Id
  public String id;

  public String name;
  public NaviCellMap map;
  
  public NaviCellSpecies() {
    
  }
  
  public NaviCellSpecies(String name, NaviCellMap map) {
    this.name = name;
    this.map = map;
  }

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'name': '%s', 'map': '%s'}",
        id, name, map.name);
  }

}