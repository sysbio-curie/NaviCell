package fr.curie.navicell;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Optional;

import javax.naming.AuthenticationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import fr.curie.navicell.security.JwtTokenUtil;
import org.springframework.security.core.userdetails.User;

import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.core.context.SecurityContextHolder;
import fr.curie.navicell.security.MongoUser;
import fr.curie.navicell.security.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
@RestController 
public class AuthController {

    @Autowired
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository repository;
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public AuthController(AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, UserRepository repository ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.repository = repository;
    }

    @PostMapping("api/auth/login")
    public ResponseEntity<String> login(@RequestParam("login") String name, @RequestParam("password") String password) {

        try {
            Authentication authenticate = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(name, password));

            User user = (User) authenticate.getPrincipal();
            MongoUser muser = this.repository.findByUsername(authenticate.getName());
            if (muser.isActive) {
                return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, jwtTokenUtil.generateAccessToken(user))
                    .build();
            } else {
                System.out.println("AUTH : Inactive user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (BadCredentialsException ex) {
            System.out.println("AUTH : Bad credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            
        }
    }
    
    @PostMapping("api/auth/signup")
    public ResponseEntity<String> signup(@RequestParam("login") String name, @RequestParam("password") String password) {

        try {
            System.out.println(this.repository.count());
            
            MongoUser t_user = new MongoUser(name, passwordEncoder.encode(password), this.repository.count() == 0);
            this.repository.save(t_user);
            // List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
            // authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            
            // UserDetails user = new User("user@example.com", passwordEncoder.encode("s3cr3t"), authorities);
        //     Authentication authenticate = authenticationManager
        //             .authenticate(new UsernamePasswordAuthenticationToken(name, password));

        //     User user = (User) authenticate.getPrincipal();
            
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            System.out.println("AUTH : Bad credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            
        }
    }
    
    @GetMapping("api/auth/user")
    public ResponseEntity<String> currentUserName(Authentication authentication) {
        if (authentication != null) {
            return ResponseEntity.ok().body(authentication.getName());    
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }  
    }
    
    @GetMapping("api/auth/is_root")
    public ResponseEntity<String> isRoot(Authentication authentication) {
        if (authentication != null) {
            SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
            return ResponseEntity.ok().body(authority.getAuthority() == "admin" ? "true" : "false");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    @GetMapping("api/auth/users")
    public ResponseEntity<String> users(Authentication authentication) {
        if (authentication != null) {
            SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
            if (authority.getAuthority() == "admin") {
                return ResponseEntity.ok().body(("{'users': " + this.repository.findAll().toString() + "}").replace("'", "\""));
            }
            
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
    @PutMapping("/api/auth/users/{id}")
    public ResponseEntity<String> modify(Authentication authentication, @PathVariable("id") String id, @RequestParam("is_active") boolean isActive)  {
        if (authentication != null) {
            SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
            if (authority.getAuthority() == "admin") {
                Optional<MongoUser> entry = this.repository.findById(id);
                if (entry.isPresent()) {
                    System.out.println("Found user to modify");
                    MongoUser user = entry.get();
                    user.isActive = isActive;
                    this.repository.save(user);
                    return ResponseEntity.ok().build();
                }
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
       
    @DeleteMapping("/api/auth/users/{id}")
    public ResponseEntity<String> delete(Authentication authentication, @PathVariable("id") String id)  {
        if (authentication != null) {
            SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
            if (authority.getAuthority() == "admin") {
                Optional<MongoUser> entry = this.repository.findById(id);
                if (entry.isPresent()) {
                    this.repository.deleteUserData(entry.get());
                    this.repository.deleteById(id);
                    return ResponseEntity.ok().build();
                }
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    }
  
}