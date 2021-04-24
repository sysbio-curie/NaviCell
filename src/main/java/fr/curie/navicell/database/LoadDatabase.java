package fr.curie.navicell.database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import fr.curie.navicell.database.maps.NaviCellMapRepository;
import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
import fr.curie.navicell.database.tags.NaviCellTagRepository;
import fr.curie.navicell.database.sessions.NaviCellSessionRepository;
import fr.curie.navicell.database.sessions.NaviCellSessionCommandsRepository;
@Configuration
class LoadDatabase {

  private static final Logger log = LoggerFactory.getLogger(LoadDatabase.class);

  @Bean
  CommandLineRunner initDatabase(NaviCellMapRepository repository) {

    return args -> {
      // repository.deleteAll();
    };
  }
  @Bean
  CommandLineRunner initDatabaseSpecies(NaviCellSpeciesRepository species_repository) {

    return args -> {
      // species_repository.deleteAll();
    };
  }
  @Bean
  CommandLineRunner initDatabaseTags(NaviCellTagRepository tags_repository) {

    return args -> {
      // tags_repository.deleteAll();
    };
  }
  
  @Bean
  CommandLineRunner initDatabaseSessions(NaviCellSessionRepository sessions_repository) {

    return args -> {
      // sessions_repository.deleteAll();
    };
  }
  @Bean
  CommandLineRunner initDatabaseSessionsCmds(NaviCellSessionCommandsRepository sessions_cmds_repository) {

    return args -> {
      // sessions_cmds_repository.deleteAll();
    };
  }
}