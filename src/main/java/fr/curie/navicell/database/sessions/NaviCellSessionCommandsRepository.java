package fr.curie.navicell.database.sessions;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NaviCellSessionCommandsRepository extends MongoRepository<NaviCellSessionCommands, String> {

  public Optional<NaviCellSessionCommands> findById(String id);
  public List<NaviCellSessionCommands> findBySessionId(String sessionId);
}