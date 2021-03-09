package fr.curie.navicell.security;

import org.springframework.data.annotation.Id;

public class MongoUser {
    @Id
    public String id;  
    public String username;
    
    public String password;  
    
    public MongoUser() {}  
    
    public MongoUser(String username, String password) {
      this.username = username;
      this.password = password;
    }  
    
    public void setPassword(String password) { this.password = password; }  
    public String getPassword() { return password; }  
    
    public void setUsername(String username) { this.username = username; }  
    public String getUsername() { return username; }
  }