package fr.curie.navicell.database.maps;
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
import java.lang.Boolean;
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
import org.apache.commons.io.FilenameUtils;

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
public class NaviCellMapController {

  private final StorageService storageService;
  private final SBGNRenderer sbgn_renderer;
  
  @Autowired
  private NaviCellMapRepository repository;
  
  @Autowired
  public NaviCellSpeciesRepository species_repository;
  
  @Autowired
  public NaviCellTagRepository tags_repository;
  
  
	@Autowired
	public NaviCellMapController(StorageService storageService, SBGNRenderer sbgn_render) {
		this.storageService = storageService;
    this.sbgn_renderer = sbgn_render;
	}
    
  @GetMapping("/api/maps/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  Optional<NaviCellMap> findMapById(@PathVariable("id") String id) {
    return repository.findById(id);
  }
  
  @GetMapping("/api/maps")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellMap> all(Authentication authentication) {
    if (authentication != null){
    
      List result = new ArrayList<>();
      for (NaviCellMap map: repository.findAll()) {
        if (map.username.equals(authentication.getName()) || map.isPublic) {
          result.add(map);
        }
      }
      return result;
    } else return new ArrayList<>();
    // else
    //   return repository.findByIsPublic(true);
  }

  boolean tagIntersect(List<String> tags1, List<String> tags2) {
    for (int i=0; i < tags1.size(); i++) {
      if (tags2.contains(tags1.get(i))) {
        return true;
      }
    }
    return false;
  }
  
  @GetMapping("/api/maps/public")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellMap> publicMaps(Authentication authentication) {
    // if (tags.isPresent()) {
    //   String[] tokens = tags.get().split(",");
    //   for (int i=0; i < tokens.length; i++) {
    //     tokens[i] = tokens[i].strip().toLowerCase();
    //   }
    //   List<NaviCellMap> filtered_maps = new ArrayList<>();
    //   for (NaviCellMap map : repository.findAll()) {
    //     if (map.isPublic && tagIntersect(map.tags, Arrays.asList(tokens))) {
    //       filtered_maps.add(map);
    //     }
    //   }
    //   return filtered_maps;
    //   // for     
    // } else
      return repository.findByIsPublic(true);
  }

  @PostMapping("/api/maps/public")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellMap> publicMapsByTags(Authentication authentication, @RequestParam("tags") String tags) {
    String[] tokens = tags.split(",");
    for (int i=0; i < tokens.length; i++) {
      tokens[i] = tokens[i].strip().toLowerCase();
    }
    List<NaviCellMap> filtered_maps = new ArrayList<>();
    for (NaviCellMap map : repository.findAll()) {
      if (map.isPublic && tagIntersect(map.tags, Arrays.asList(tokens))) {
        filtered_maps.add(map); 
      }
    }
    return filtered_maps;
  
  }


  // @DeleteMapping("/api/maps")
  // @ResponseStatus(value = HttpStatus.OK)
  // void deleteAll() {
  //   this.storageService.deleteAll();
  //   repository.deleteAll();
  // }
  
  @DeleteMapping("/api/maps/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  void delete(Authentication authentication, @PathVariable("id") String id)  {
    if (authentication != null) {
      SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
      Optional<NaviCellMap> entry = repository.findById(id);
      if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
        this.storageService.deleteMapByFolder(entry.get().folder);
        repository.deleteById(id);
        species_repository.deleteByMapId(id);
    }}
  }
  
  @PutMapping("/api/maps/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  void modify(Authentication authentication, @PathVariable("id") String id, @RequestParam("is_public") boolean isPublic)  {
    if (authentication != null) {
      SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
      Optional<NaviCellMap> entry = repository.findById(id);
      if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
        NaviCellMap map = entry.get();
        map.isPublic = isPublic;
        repository.save(map);
      }
    }
  }
  
  public void createMap(String username, String name, byte[] network_file, byte[] image_file, String extension, String tags, String layout) {
    try{
      NaviCellMap entry = new NaviCellMap(name, username);
      repository.save(entry);
      NaviCellMapCreator.createMap(entry, this.storageService, this.sbgn_renderer, network_file, image_file, extension, layout);
      entry.isBuilding = false;
      repository.save(entry);

      String[] tokens = new String[0];
      if (tags.length() > 0) {
        tokens = tags.split(",");
        for (int i=0; i < tokens.length; i++) {
          tokens[i] = tokens[i].strip().toLowerCase();
          NaviCellTag new_tag = new NaviCellTag(tokens[i], entry.id);
          tags_repository.save(new_tag);
        }
      }

      entry.tags = Arrays.asList(tokens);
      repository.save(entry);
      System.out.println("Saved with the tags : ");
      for (int i=0; i < entry.tags.size(); i++) {
        System.out.println(entry.tags.get(i));
      }
      
      String mapdata_path = this.storageService.getMapsLocation() + "/" + entry.folder + "/_common/master_mapdata.json";
      System.out.println("Mapdata path : " + mapdata_path);
      
      try{
        JSONArray arr = new JSONArray(Files.readString(Paths.get(mapdata_path)));
        for (int i = 0; i < arr.length(); i++)
        {        
          // System.out.println(arr.getJSONObject(i));
          String t_class = arr.getJSONObject(i).getString("class");
          if (
            t_class.equals("PROTEIN") ||
            t_class.equals("GENE") ||
            t_class.equals("RNA") ||
            t_class.equals("ANTISENSE_RNA") ||
            t_class.equals("PHENOTYPE")
          ) {
            JSONArray species = arr.getJSONObject(i).getJSONArray("entities");
            for (int j=0; j < species.length(); j++) {
              String sname = species.getJSONObject(j).getString("name");
              String sid = species.getJSONObject(j).getJSONArray("modifs").getJSONObject(0).getString("id");
              NaviCellSpecies t_sp = new NaviCellSpecies(sid, sname, t_class, entry.id);
              JSONArray hugo = species.getJSONObject(j).getJSONArray("hugo");
              if (hugo.length() > 0) {
                System.out.println("New hugo : " + hugo.getString(0));
                t_sp.hugo = hugo.getString(0);
              }
              species_repository.save(t_sp);         
            }
          }
        }
      }
      catch (IOException e) {
        System.out.println(e.getMessage());
      }
      catch (JSONException e){
        System.out.println(e.getMessage());
      }
      
    }
    catch (NaviCellMapException e) {
      throw new NaviCellMapControllerException(e.getMessage());
    }
  }
  
  
  @PostMapping("/api/maps")
	@ResponseStatus(value = HttpStatus.CREATED)
	public void handleFileUpload(Authentication authentication, @RequestParam("name") String name, @RequestParam("network-file") MultipartFile network_file, @RequestParam(name="image-file", required=false) Optional<MultipartFile> image_file, @RequestParam("tags") String tags, @RequestParam("layout") String layout, @RequestParam(name="async", required=false) Optional<String> async) {
    if (async.isPresent() && Boolean.parseBoolean(async.get())) {
      
      try
      {
        // System.out.println("Size of file beginning of upload : " + network_file.getSize());
        NaviCellMap entry = new NaviCellMap(name, authentication.getName());
        repository.save(entry);
     
        System.out.println("Given image : " + (image_file.isPresent() ? "Present" : "Absent"));
        NaviCellMapCreatorThread thread = new NaviCellMapCreatorThread(
          entry, storageService, sbgn_renderer, repository, tags_repository, species_repository, 
          network_file.getBytes(), image_file.isPresent() ? image_file.get().getBytes() : new byte[0], 
          FilenameUtils.getExtension(network_file.getOriginalFilename()) , tags, layout
        );
        // System.out.println("Size of file after thread creation : " + network_file.getSize());

        thread.start();
      }
      catch (IOException e) {
        
      }
    } else {
      try{
        createMap(authentication.getName(), name, 
          network_file.getBytes(), image_file.isPresent() ? image_file.get().getBytes() : new byte[0], 
          FilenameUtils.getExtension(network_file.getOriginalFilename()), tags, layout
        );  
      }
      catch (IOException e) {
        
      }
    }
    
    
    
  }
  
}
