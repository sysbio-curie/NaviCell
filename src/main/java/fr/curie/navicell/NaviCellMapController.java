package fr.curie.navicell;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

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

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import fr.curie.navicell.database.NaviCellMapRepository;
import fr.curie.navicell.database.NaviCellMap;
import fr.curie.navicell.database.NaviCellMapException;
import fr.curie.navicell.database.NaviCellSpeciesRepository;
import fr.curie.navicell.database.NaviCellSpecies;

import fr.curie.navicell.storage.StorageProperties;
import fr.curie.navicell.storage.StorageService;
import org.json.JSONObject;
import org.json.JSONException;
import org.json.JSONArray;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class NaviCellMapController {

  private final StorageService storageService;
  
  @Autowired
  private NaviCellMapRepository repository;
  
  @Autowired
  public NaviCellSpeciesRepository species_repository;
  
	@Autowired
	public NaviCellMapController(StorageService storageService) {
		this.storageService = storageService;
	}
    
  @GetMapping("/api/maps/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  Optional<NaviCellMap> findMapById(@PathVariable("id") String id) {
    return repository.findById(id);
  }
  
  @GetMapping("/api/maps")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellMap> all() {
    return repository.findAll();
  }


  @DeleteMapping("/api/maps")
  @ResponseStatus(value = HttpStatus.OK)
  void deleteAll() {
    this.storageService.deleteAll();
    repository.deleteAll();
  }
  
  @DeleteMapping("/api/maps/{id}")
  @ResponseStatus(value = HttpStatus.OK)
  void delete(@PathVariable("id") String id)  {
    Optional<NaviCellMap> entry = repository.findById(id);
    if (entry.isPresent()) {
      this.storageService.deleteByFolder(entry.get().folder);
      repository.deleteById(id);
      species_repository.deleteByMapId(id);
    }
  }
  
  @PostMapping("/api/maps")
	@ResponseStatus(value = HttpStatus.CREATED)
	public void handleFileUpload(@RequestParam("name") String name, @RequestParam("network-file") MultipartFile network_file) {
    try{
      NaviCellMap entry = new NaviCellMap(this.storageService, name, network_file, species_repository);
      repository.save(entry);

      String mapdata_path = this.storageService.getLocation() + "/" + entry.folder + "/_common/master_mapdata.json";
      System.out.println("Mapdata path : " + mapdata_path);
      
      try{
        JSONArray arr = new JSONArray(Files.readString(Paths.get(mapdata_path)));
        for (int i = 0; i < arr.length(); i++)
        {        
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
              NaviCellSpecies t_sp = new NaviCellSpecies(sname, t_class, entry.id);
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
  
  @GetMapping("api/species")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellSpecies> all_species() {
    return species_repository.findAll();
  }
  
  @GetMapping("api/species/name/{name}")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellSpecies> speciesByName(@PathVariable("name") String name) {
    return species_repository.findByName(name);
  }
  
  @GetMapping("api/species/type/{type}")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellSpecies> speciesByType(@PathVariable("type") String type) {
    return species_repository.findByType(type);
  }
  
  @GetMapping("api/species/type/{type}/name/{name}")
  @ResponseStatus(value = HttpStatus.OK)
  List<NaviCellSpecies> speciesByName(@PathVariable("type") String type, @PathVariable("name") String name) {
    return species_repository.findByTypeAndName(type, name);
  }
  
}
