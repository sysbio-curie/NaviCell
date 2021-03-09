package fr.curie.navicell;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;

import fr.curie.navicell.security.JwtTokenUtil;
import org.springframework.security.core.userdetails.User;

import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController 
public class AuthController {

    @Autowired
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    
    public AuthController(AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("api/auth/login")
    public ResponseEntity<String> login(@RequestParam("login") String name, @RequestParam("password") String password) {

        try {
            Authentication authenticate = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(name, password));

            User user = (User) authenticate.getPrincipal();
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, jwtTokenUtil.generateAccessToken(user))
                    .build();
        } catch (BadCredentialsException ex) {
            System.out.println("AUTH : Bad credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            
        }
    }

    @GetMapping("api/auth/user")
    public ResponseEntity<String> currentUserName(Authentication authentication) {
        System.out.println("currentUserName");
        return ResponseEntity.ok().body(authentication.getName());
    }
}