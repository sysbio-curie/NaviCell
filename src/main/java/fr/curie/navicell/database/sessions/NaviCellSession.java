package fr.curie.navicell.database.sessions;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellSession {

  @Id
  public String id;

  public String name;
  public String username;
  public String mapId;
  public String commandsId;
  public boolean isRecording;
  
  
  public NaviCellSession() {
    
  }
  
  public NaviCellSession(String id, String name, String map_id, String username) {
    this.id = id;
    this.name = name;
    this.mapId = map_id;
    this.username = username;
    // this.commandsId
    this.isRecording = true;
  }
  
  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'name': '%s', 'mapId', '%s', 'user', '%s'}",
        id, name, mapId, username);
  }

}