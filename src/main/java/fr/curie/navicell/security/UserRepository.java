package fr.curie.navicell.security;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import fr.curie.navicell.security.MongoUser;
import org.springframework.security.core.userdetails.User;

public interface UserRepository extends MongoRepository<MongoUser, String>, UserRepositoryCustom {

    public List<MongoUser> findAll();
    public MongoUser findByUsername(String username);
    public void deleteById(String id);
    public void deleteUserData(MongoUser user);
}