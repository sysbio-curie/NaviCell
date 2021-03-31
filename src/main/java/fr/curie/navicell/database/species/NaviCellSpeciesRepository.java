package fr.curie.navicell.database.species;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellSpeciesRepository extends MongoRepository<NaviCellSpecies, String> {

  public List<NaviCellSpecies> findByName(String name);
  public List<NaviCellSpecies> findByType(String type);
  public List<NaviCellSpecies> findByMapId(String mapId);
  public List<NaviCellSpecies> findByTypeAndName(String type, String name);
  public List<NaviCellSpecies> findByHugo(String hugo);
  
  public void deleteByMapId(String mapId);
}