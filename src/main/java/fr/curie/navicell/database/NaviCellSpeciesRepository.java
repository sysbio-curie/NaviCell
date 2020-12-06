package fr.curie.navicell.database;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellSpeciesRepository extends MongoRepository<NaviCellSpecies, String> {

  public List<NaviCellSpecies> findByName(String name);
}