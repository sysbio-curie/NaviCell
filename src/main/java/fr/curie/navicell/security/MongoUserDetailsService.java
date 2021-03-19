package fr.curie.navicell.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class MongoUserDetailsService implements UserDetailsService{
  
  private UserRepository repository;  
  
  public MongoUserDetailsService(UserRepository repository) {
    this.repository = repository;
    // this.repository.deleteAll();
    // MongoUser t_user = new MongoUser("user", "$2a$10$AjHGc4x3Nez/p4ZpvFDWeO6FGxee/cVqj5KHHnHfuLnIOzC5ag4fm");
		// this.repository.save(t_user);
  }
  
  @Override
  public UserDetails loadUserByUsername(String Username) throws UsernameNotFoundException {
    
    try
    {
      MongoUser user = repository.findByUsername(Username);
      if(user==null) {
        throw new UsernameNotFoundException("User not found");
      }    
      
      List<SimpleGrantedAuthority> authorities;
      if (user.isRoot) {
        authorities = Arrays.asList(new SimpleGrantedAuthority("admin")); 
      } else {
        authorities = Arrays.asList(new SimpleGrantedAuthority("user"));
      }
      return new User(user.getUsername(), user.getPassword(), authorities);//.get();
      
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return null;
    }
  }
}
