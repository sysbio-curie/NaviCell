package fr.curie.navicell.database.maps;
// import java.io.File;
// import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
// import java.util.List;
// import java.util.HashSet;
// import java.util.Optional;
// import java.util.ArrayList;
import java.util.Arrays;
import java.lang.Thread;
// import java.lang.Boolean;
// import org.apache.commons.collections4.ListUtils;
// import org.springframework.beans.factory.annotation.Autowired;

// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

// import org.springframework.boot.context.properties.EnableConfigurationProperties;
// import org.springframework.security.core.Authentication;

// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.ResponseStatus;

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
// import org.springframework.security.core.authority.SimpleGrantedAuthority;







class NaviCellMapCreatorThread extends Thread {

    StorageService storageService;
    SBGNRenderer sbgn_render;
    NaviCellMapRepository repository;
    NaviCellTagRepository tags_repository;
    NaviCellSpeciesRepository species_repository;



    byte[] network_file;
    byte[] image_file;
    String extension;
    String tags;
    String layout;
    NaviCellMap entry;
    public NaviCellMapCreatorThread(NaviCellMap entry, StorageService storageService, SBGNRenderer sbgn_render, NaviCellMapRepository repository, NaviCellTagRepository tags_repository, NaviCellSpeciesRepository species_repository, byte[] network_file, byte[] image_file, String extension, String tags, String layout) {
        super("MyThread");
        this.entry = entry;
        this.storageService = storageService;
        this.sbgn_render = sbgn_render;
        this.repository = repository;
        this.tags_repository = tags_repository;
        this.species_repository = species_repository;
        this.network_file = network_file;
        this.image_file = image_file;
        this.extension = extension;
        this.tags = tags;
        this.layout = layout;
    }


  public void createMap(NaviCellMap entry, StorageService storageService, SBGNRenderer sbgn_render, NaviCellMapRepository repository, NaviCellTagRepository tags_repository, NaviCellSpeciesRepository species_repository, byte []network_file, byte[] image_file, String extension, String tags, String layout) {
    try{
      
      NaviCellMapCreator.createMap(entry, storageService, sbgn_render, network_file, image_file, extension, layout);
      entry.isBuilding = false;
      
      // NaviCellMap entry = new NaviCellMap(username, storageService, sbgn_render, name, network_file, extension, layout);
      repository.save(entry);

      String[] tokens = new String[0];
      if (tags.length() > 0) {
        tokens = tags.split(",");
        for (int i=0; i < tokens.length; i++) {
          tokens[i] = tokens[i].strip();
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
      
      String mapdata_path = storageService.getMapsLocation() + "/" + entry.folder + "/_common/master_mapdata.json";
      System.out.println("Mapdata path : " + mapdata_path);
      
      try{
        JSONArray arr = new JSONArray(Files.readString(Paths.get(mapdata_path)));
        for (int i = 0; i < arr.length(); i++)
        {        
          // System.out.println(arr.getJSONObject(i));
          if (arr.getJSONObject(i).has("class")){
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
  
    public void run() {
        createMap(this.entry, this.storageService, this.sbgn_render, this.repository, this.tags_repository, this.species_repository, this.network_file, this.image_file, this.extension, this.tags, this.layout);
    }
}





