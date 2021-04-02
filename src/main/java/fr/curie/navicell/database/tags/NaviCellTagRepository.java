package fr.curie.navicell.database.tags;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellTagRepository extends MongoRepository<NaviCellTag, String> {

  public List<NaviCellTag> findByName(String name);
}