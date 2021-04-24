package fr.curie.navicell.database.sessions;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import org.springframework.data.annotation.Id;


public class NaviCellSessionCommands {

  @Id
  public String id;

  public String sessionId;
  public List<String> commands;
  
  public NaviCellSessionCommands() {
    
  }
  
  public NaviCellSessionCommands(String sessionId) {
    this.sessionId = sessionId;
    this.commands = new ArrayList<>();
  }
  
  @Override
  public String toString() {
    String t_cmds = "";
    for (String t_cmd : commands ) {
      t_cmds += t_cmd + ",";
    }
    return String.format(
        "{'id': '%s', 'session_id': '%s', 'commands': '%s'}",
        id, sessionId, t_cmds);
  }

}