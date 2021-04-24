package fr.curie.navicell.database.data;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellDataRepository extends MongoRepository<NaviCellData, String> {

  // public List<NaviCellMap> findById(String id);
  public List<NaviCellData> findByName(String name);
  public List<NaviCellData> findByPath(String path);
  public List<NaviCellData> findByType(int type);
  public List<NaviCellData> findByUsername(String username);
  public List<NaviCellData> findByIsPublic(boolean isPublic);
}