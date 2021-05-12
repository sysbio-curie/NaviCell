package fr.curie.navicell.database.data;

import java.util.Optional;
import java.util.UUID;
import java.util.Vector;

import javax.imageio.ImageIO;
import java.awt.Graphics;
import java.awt.Color;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.web.multipart.MultipartFile;

import fr.curie.BiNoM.pathways.navicell.ProduceClickableMap;
import fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures;
import fr.curie.cd2sbgnml.Cd2SbgnmlScript;
import fr.curie.cd2sbgnml.Sbgnml2CdScript;
import fr.curie.navicell.storage.StorageException;
import fr.curie.navicell.storage.StorageService;
import fr.curie.navicell.sbgnrender.SBGNPerformLayout;
import fr.curie.navicell.sbgnrender.SBGNRenderer;
import fr.curie.navicell.sbgnrender.SBGNRendererException;
import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
import org.apache.commons.io.FilenameUtils;
import java.awt.image.BufferedImage;
import org.springframework.security.core.Authentication;

public class NaviCellData {

  @Id
  public String id;

  public String folder;
  public String name;
  public int type;
  public String path;
  public String username;
  public boolean isPublic;
  public String sessionId;
  
  private boolean createFolder(StorageService storage) {
    this.folder = UUID.randomUUID().toString();
    try {
      storage.createDataFolder(this.folder);  
      return true;
    }
    catch (StorageException e) {
      return false;
    }
  }
  public NaviCellData() {
    
  }
  
  public NaviCellData(Authentication authentication, StorageService storageService, String name, Optional<MultipartFile> file, Optional<String> file_url, int type, Optional<String> session_id) throws NaviCellDataException {
    
    this.isPublic = false; 
    
    if (authentication != null)
      this.username = authentication.getName();
    
    if (file.isPresent() && file.get().isEmpty()) {
      throw new NaviCellDataException("Error : Empty file !");
    }
    
    if (file_url.isPresent() && file_url.get().length() == 0) {
      throw new NaviCellDataException("Error : Empty url !");
    }
    
    if (!file.isPresent() && !file_url.isPresent()) {
      throw new NaviCellDataException("Error : No file nor url given");
    }
    
    boolean folder_created = this.createFolder(storageService);
    while (!folder_created) {
      folder_created = this.createFolder(storageService);
    }
  
    this.name = name;
    this.type = type;
    
    if (session_id.isPresent()) {
      this.sessionId = session_id.get();
    }
    
    if (file.isPresent()) {
      Path path = storageService.storeDataFile(file.get(), this.folder, file.get().getOriginalFilename());
      this.path = storageService.getDataLocation().relativize(path).toString();
      
    } else if (file_url.isPresent()) {
      Path path = storageService.storeDataFileFromURL(file_url.get(), this.folder, null);
      this.path = storageService.getDataLocation().relativize(path).toString();
    }
      
  }
  
  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'folder': '%s', 'name': '%s', 'path': '%s', 'type': '%d'}",
        id, folder, name, path, type);
  }

}