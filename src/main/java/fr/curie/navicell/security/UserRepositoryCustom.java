package fr.curie.navicell.security;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import fr.curie.navicell.security.MongoUser;
import org.springframework.security.core.userdetails.User;

public interface UserRepositoryCustom {

    public void deleteUserData(MongoUser user);
}