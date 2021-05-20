package fr.curie.navicell.database.maps;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellMapRepository extends MongoRepository<NaviCellMap, String> {

  // public List<NaviCellMap> findById(String id);
  public List<NaviCellMap> findAllByOrderByName();
  public List<NaviCellMap> findByNameOrderByName(String name);
  public List<NaviCellMap> findByNetworkPathOrderByName(String network_path);
  public List<NaviCellMap> findByImagePathOrderByName(String image_path);
  public List<NaviCellMap> findByUsernameOrderByName(String username);
  public List<NaviCellMap> findByIsPublicOrderByName(boolean isPublic);
}