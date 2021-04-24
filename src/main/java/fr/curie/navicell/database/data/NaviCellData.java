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
  
  public NaviCellData(Authentication authentication, StorageService storageService, String name, MultipartFile file, int type) throws NaviCellDataException {
    
    
    this.username = authentication.getName();
    this.isPublic = false; 
    
    if (file.isEmpty()) {
      throw new NaviCellDataException("Error : Empty file !");
    }
    
    boolean folder_created = this.createFolder(storageService);
    while (!folder_created) {
      folder_created = this.createFolder(storageService);
    }
  
    this.name = name;
    this.type = type;
    
    Path path = storageService.storeDataFile(file, this.folder, file.getOriginalFilename());
    this.path = path.toString();
  }
  

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'folder': '%s', 'name': '%s', 'path': '%s', 'type': '%d'}",
        id, folder, name, path, type);
  }

}