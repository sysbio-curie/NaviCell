package fr.curie.navicell.security;

import org.springframework.data.annotation.Id;

public class MongoUser {
    @Id
    public String id;  
    public String username;
    
    public String password;  
    
    public boolean isRoot;
    public boolean isActive;
    
    public MongoUser() {}  
    
    public MongoUser(String username, String password, boolean isRoot) {
      this.username = username;
      this.password = password;
      this.isRoot = isRoot;
      this.isActive = isRoot;
    }  
    
    public void setPassword(String password) { this.password = password; }  
    public String getPassword() { return password; }  
    
    public void setUsername(String username) { this.username = username; }  
    public String getUsername() { return username; }
    
    @Override
    public String toString() {
      return String.format(
          "{'id': '%s', 'name': '%s', 'isRoot': '%s', 'isActive': '%s'}",
          id, username, isRoot, isActive);
    }
  }