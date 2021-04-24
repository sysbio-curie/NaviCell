package fr.curie.navicell.database.sessions;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellSessionRepository extends MongoRepository<NaviCellSession, String> {

  public Optional<NaviCellSession> findById(String id);
  public List<NaviCellSession> findByName(String name);
  public List<NaviCellSession> findByUsername(String username);
}