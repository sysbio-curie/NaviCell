package fr.curie.navicell.database.tags;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
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

// @CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class NaviCellTagController {
  
  @Autowired
  private NaviCellMapRepository repository;
  
  @Autowired
  public NaviCellTagRepository tags_repository;
  
	
  @GetMapping("api/tags")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellTag> all_tags() {
    return tags_repository.findAll();
  }
  
  @GetMapping("api/tags/name/{name}")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellTag> tagsByName(Authentication authentication, @PathVariable("name") String name) {
    List<NaviCellMap> maps_allowed;

    if (authentication != null) {
      maps_allowed = ListUtils.union(
        repository.findByUsername(authentication.getName()),
        repository.findByIsPublic(true)
      );
    } else {
      maps_allowed = repository.findByIsPublic(true);
    }
    
    // System.out.println(maps_allowed.toString());
    // System.out.println("Size of available maps : " + maps_allowed.size());
    List<String> map_ids = new ArrayList<>();
    for (int i=0; i < maps_allowed.size(); i++) {
      map_ids.add(maps_allowed.get(i).id);
    }
    
    
    List<NaviCellTag> result = tags_repository.findByName(name);
    // System.out.println(result.toString());
    // System.out.println(map_ids);
    List<NaviCellTag> final_result = new ArrayList<>(result);
    for (int i=0; i < result.size(); i++){
      if (!map_ids.contains(result.get(i).mapId)) {
        final_result.remove(result.get(i));
      }
    }
    return final_result;
  
  }
  
  
}
