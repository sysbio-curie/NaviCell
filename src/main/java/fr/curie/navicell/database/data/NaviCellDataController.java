package fr.curie.navicell.database.data;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.HashSet;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Arrays;

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

// import fr.curie.navicell.database.NaviCellMapRepository;
// import fr.curie.navicell.database.NaviCellMap;
// import fr.curie.navicell.database.NaviCellMapException;
import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
import fr.curie.navicell.database.tags.NaviCellTag;
import fr.curie.navicell.database.tags.NaviCellTagRepository;
import fr.curie.navicell.sbgnrender.SBGNRenderer;
import fr.curie.navicell.database.species.NaviCellSpecies;

import fr.curie.navicell.storage.StorageProperties;
import fr.curie.navicell.storage.StorageService;
import org.json.JSONObject;
import org.json.JSONException;
import org.json.JSONArray;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

// @CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class NaviCellDataController {

  private final StorageService storageService;
  
  @Autowired
  public NaviCellDataRepository repository;
  
  
	@Autowired
	public NaviCellDataController(StorageService storageService) {
		this.storageService = storageService;
	}
    
  
  @GetMapping("/api/data")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellData> all(Authentication authentication) {
    if (authentication != null){
    
      List result = new ArrayList<>();
      for (NaviCellData datum: repository.findAll()) {
        if (datum.username != null && datum.username.equals(authentication.getName()) || datum.isPublic) {
          result.add(datum);
        }
      }
      return result;
    } else return new ArrayList<>();
  }


  @PostMapping("/api/data")
	@ResponseStatus(value = HttpStatus.CREATED)
  NaviCellData uploadData(Authentication authentication, @RequestParam("name") String name, @RequestParam(name="file", required=false) Optional<MultipartFile> file, @RequestParam(name="file-url", required=false) Optional<String> file_url, @RequestParam("type") int type, @RequestParam(name="session_id", required=false) Optional<String> session_id) {
    
    try{
        NaviCellData entry = new NaviCellData(authentication, this.storageService, name, file, file_url, type, session_id);  
        repository.save(entry);
        return entry;
    }
    
    catch (NaviCellDataException e) {
      throw new NaviCellDataControllerException(e.getMessage());
    }
    
    
  }
 
  @DeleteMapping("/api/data/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  void delete(Authentication authentication, @PathVariable("id") String id)  {
    if (authentication != null) {
      SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
      Optional<NaviCellData> entry = repository.findById(id);
      if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
        this.storageService.deleteDataByFolder(entry.get().folder);
        repository.deleteById(id);
    }}
  } 
  
  @PutMapping("/api/data/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  void modify(Authentication authentication, @PathVariable("id") String id, @RequestParam("is_public") boolean isPublic)  {
    if (authentication != null) {
      SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
      Optional<NaviCellData> entry = repository.findById(id);
      if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
        NaviCellData map = entry.get();
        map.isPublic = isPublic;
        repository.save(map);
      }
    }
  }
}
