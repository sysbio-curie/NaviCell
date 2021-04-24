package fr.curie.navicell;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
// import fr.curie.navicell.security.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import fr.curie.navicell.security.UserRepository;
// import fr.curie.navicell.security.UserDetailsService;

import fr.curie.navicell.security.JwtTokenFilter;
import java.util.Arrays;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
    private final JwtTokenFilter jwtTokenFilter;

    public WebSecurityConfig(JwtTokenFilter jwtTokenFilter ) {
        this.jwtTokenFilter = jwtTokenFilter;
    }

	@Override
	@Bean
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		// http = http.cors().and().csrf().disable();
		http = http.csrf().disable();

        // Set session management to stateless
        http = http
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and();
		
		http.authorizeRequests()
		.antMatchers("/api/auth/*").permitAll()
		.antMatchers("/api/render").permitAll()
		// .antMatchers(HttpMethod.GET, "/api/render/**").permitAll()
		.antMatchers(HttpMethod.GET, "/api/tags").permitAll()
		.antMatchers(HttpMethod.GET, "/api/maps/*").permitAll()
		.antMatchers(HttpMethod.GET, "/api/data").permitAll()
		.antMatchers(HttpMethod.POST, "/api/maps/public").permitAll()
		.antMatchers(HttpMethod.POST, "/api/data").permitAll()
		.antMatchers(HttpMethod.GET, "/api/species/**").permitAll()
		.antMatchers(HttpMethod.GET, "/api/sessions/**").permitAll()
		.anyRequest().authenticated();
		
		// Add JWT token filter
		http.addFilterBefore(
			jwtTokenFilter,
			UsernamePasswordAuthenticationFilter.class
		);
	}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
	
	//  // Used by spring security if CORS is enabled.
	//  @Bean
	//  public CorsFilter corsFilter() {
	// 	 UrlBasedCorsConfigurationSource source =
	// 		 new UrlBasedCorsConfigurationSource();
	// 	 CorsConfiguration config = new CorsConfiguration();
	// 	 config.setAllowCredentials(true);
	// 	 config.addAllowedOrigin("*");
	// 	 config.addAllowedHeader("*");
	// 	 config.addAllowedMethod("*");
	// 	 source.registerCorsConfiguration("/**", config);
	// 	 return new CorsFilter(source);
	//  }
	
}