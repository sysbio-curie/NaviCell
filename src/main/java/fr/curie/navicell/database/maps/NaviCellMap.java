package fr.curie.navicell.database.maps;

// import java.util.Optional;
// import java.util.UUID;
// import java.util.Vector;

// import javax.imageio.ImageIO;
// import java.awt.Graphics;
// import java.awt.Color;
// import java.io.BufferedReader;
// import java.io.InputStreamReader;
// import java.io.File;
// import java.io.FileNotFoundException;
// import java.io.FileReader;
// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
import java.util.List;
// import java.util.ArrayList;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
// import org.springframework.web.multipart.MultipartFile;

// import fr.curie.BiNoM.pathways.navicell.ProduceClickableMap;
// import fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures;
// import fr.curie.cd2sbgnml.Cd2SbgnmlScript;
// import fr.curie.cd2sbgnml.Sbgnml2CdScript;
// import fr.curie.navicell.storage.StorageException;
// import fr.curie.navicell.storage.StorageService;
// import fr.curie.navicell.sbgnrender.SBGNPerformLayout;
// import fr.curie.navicell.sbgnrender.SBGNRenderer;
// import fr.curie.navicell.sbgnrender.SBGNRendererException;
// import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
// import org.apache.commons.io.FilenameUtils;
// import java.awt.image.BufferedImage;

public class NaviCellMap {

  @Id
  public String id;

  public String folder;
  public String name;
  public String networkPath;
  public String sbgnPath;
  public String imagePath;
  public String url;
  public String username;
  public boolean isPublic;
  public List<String> tags;
  public String description;
  public boolean isBuilding;
  
  
  public NaviCellMap(String name, String username) {
    this.name = name;
    this.username = username;
    this.isBuilding = true;
    this.isPublic = false;
    this.networkPath = "";
    this.sbgnPath = "";
    this.imagePath = "";    
    
  }
  
  // public NaviCellMap(String username, StorageService storageService, SBGNRenderer sbgn_render, String name, byte[] network_file, String extension, String layout) throws NaviCellMapException {
    
  //   NaviCellMapCreator.createMap(this, name, storageService, sbgn_render, username, network_file, extension, layout);
  // }
  

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'folder': '%s', 'name': '%s', 'network_path': '%s', 'sbgn_path': '%s', 'image_path': '%s'}",
        id, folder, name, networkPath, sbgnPath, imagePath);
  }

}