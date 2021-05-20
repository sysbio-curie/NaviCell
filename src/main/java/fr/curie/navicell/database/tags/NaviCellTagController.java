package fr.curie.navicell.database.tags;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashMap;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashSet;
import org.apache.commons.collections4.ListUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.core.Authentication;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import fr.curie.navicell.database.maps.NaviCellMapRepository;
import fr.curie.navicell.database.maps.NaviCellMap;
import fr.curie.navicell.database.maps.NaviCellMapException;
// import fr.curie.navicell.database.maps.NaviCellSpeciesRepository;
// import fr.curie.navicell.database.species.NaviCellSpecies;

import fr.curie.navicell.storage.StorageProperties;
import fr.curie.navicell.storage.StorageService;
import org.json.JSONObject;
import org.json.JSONException;
import org.json.JSONArray;
import static java.util.stream.Collectors.*;
import static java.util.Map.Entry.*;
// @CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class NaviCellTagController {
  
  @Autowired
  private NaviCellMapRepository repository;
  
  @Autowired
  public NaviCellTagRepository tags_repository;
  
	
  @GetMapping("api/tags")
  @ResponseStatus(value = HttpStatus.OK)
  HashMap<String, Integer> all_tags() {
    
    HashMap<String, Integer> public_tags = new HashMap<String, Integer>();
    for (NaviCellMap public_map : repository.findByIsPublicOrderByName(true)) {
      for (String tag : public_map.tags) {
        public_tags.put(tag, (public_tags.containsKey(tag) ? public_tags.get(tag) + 1: 1));
      }
    }
    
    return public_tags
        .entrySet()
        .stream()
        .sorted(Collections.reverseOrder(Map.Entry.comparingByValue()))
        .collect(
            toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e2,
                LinkedHashMap::new));
    // return public_tags;
  }
  
  @GetMapping("api/tags/name/{name}")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellMap> mapsByTag(Authentication authentication, @PathVariable("name") String name) {
    List<NaviCellMap> maps_allowed;
    
    List<NaviCellTag> result = tags_repository.findByName(name);

    List<String> map_ids = new ArrayList<>();
    for (int i=0; i < result.size(); i++) {
      map_ids.add(result.get(i).mapId);
    }
    
    maps_allowed = new ArrayList<>();
    for (NaviCellMap map: repository.findAll()) {
      if (map_ids.contains(map.id)) {
        if ( map.isPublic || (authentication != null && map.username.equals(authentication.getName()))) {
          maps_allowed.add(map);
        }
      }
    }
    
    
    return maps_allowed;
  }
  
  
}
