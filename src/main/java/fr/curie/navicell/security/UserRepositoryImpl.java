package fr.curie.navicell.security;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.core.MongoTemplate;

import fr.curie.navicell.database.maps.NaviCellMap;
import fr.curie.navicell.database.maps.NaviCellMapRepository;
import fr.curie.navicell.database.species.NaviCellSpecies;
import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
import fr.curie.navicell.security.MongoUser;
import fr.curie.navicell.storage.StorageService;

import org.springframework.security.core.userdetails.User;
import org.springframework.beans.factory.annotation.Autowired;

public class UserRepositoryImpl implements UserRepositoryCustom  {
    
    // @Autowired
    public final NaviCellMapRepository map_repository;
    public final NaviCellSpeciesRepository species_repository;
    public final StorageService storage;
    
    public UserRepositoryImpl(NaviCellMapRepository map_repository, NaviCellSpeciesRepository species_repository, StorageService storage) {
        this.map_repository = map_repository;
        this.species_repository = species_repository;
        this.storage = storage;
    }
    
    public void deleteUserData(MongoUser user) {
        System.out.println("Using the override of deleteById");
     
        List<NaviCellMap> results = this.map_repository.findByUsername(user.getUsername());
        
        for (NaviCellMap result : results) {
        
            this.species_repository.deleteByMapId(result.id);
            this.storage.deleteMapByFolder(result.folder);
        }

        this.map_repository.deleteAll(results);
    }
}