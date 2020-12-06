package fr.curie.navicell;
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


// @EnableConfigurationProperties(NaviCellProperties.class)
@CrossOrigin(origins = "*", maxAge = 3600)
// @EnableConfigurationProperties(StorageProperties.class)
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
    }
  }
  
  @PostMapping("/api/maps")
	@ResponseStatus(value = HttpStatus.CREATED)
	public void handleFileUpload(@RequestParam("name") String name, @RequestParam("network-file") MultipartFile network_file) {
    try{
      NaviCellMap entry = new NaviCellMap(this.storageService, name, network_file, species_repository);
      repository.save(entry);
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
}
