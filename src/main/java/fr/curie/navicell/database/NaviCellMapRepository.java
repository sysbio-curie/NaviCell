package fr.curie.navicell.database;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellMapRepository extends MongoRepository<NaviCellMap, String> {

  // public List<NaviCellMap> findById(String id);
  public List<NaviCellMap> findByName(String name);
  public List<NaviCellMap> findByNetworkPath(String network_path);
  public List<NaviCellMap> findByImagePath(String image_path);
  public List<NaviCellMap> findByUsername(String username);
  public List<NaviCellMap> findByIsPublic(boolean isPublic);
}