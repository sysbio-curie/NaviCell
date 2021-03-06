package fr.curie.navicell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;


import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;

import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

import fr.curie.navicell.sbgnrender.SBGNRenderer;
// import fr.curie.navicell.NaviCellProperties;
import fr.curie.navicell.storage.StorageProperties;
import fr.curie.navicell.storage.StorageService;
import fr.curie.navicell.sbgnrender.SBGNRenderProperties;
@SpringBootApplication
@EnableConfigurationProperties({
  StorageProperties.class,
  SBGNRenderProperties.class
})
@RestController
public class NaviCellApplication  extends SpringBootServletInitializer {

	@Autowired
	public NaviCellApplication() {}
	
	@RequestMapping("/api/")
	@ResponseStatus(value=HttpStatus.OK)
	public String home() {
		return "Welcome to NaviCell v3 API";
	}

	public static void main(String[] args) {
		SpringApplication.run(NaviCellApplication.class, args);
	}

	@Bean
	CommandLineRunner init(StorageService storageService) {
		return (args) -> {
			storageService.init();
		};
	}
}