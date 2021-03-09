package fr.curie.navicell.database;

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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.web.multipart.MultipartFile;

import fr.curie.BiNoM.pathways.navicell.ProduceClickableMap;
import fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures;
import fr.curie.cd2sbgnml.Cd2SbgnmlScript;
import fr.curie.navicell.storage.StorageException;
import fr.curie.navicell.storage.StorageService;
import fr.curie.navicell.sbgnrender.SBGNRenderer;
import fr.curie.navicell.sbgnrender.SBGNRendererException;
import org.apache.commons.io.FilenameUtils;
import java.awt.image.BufferedImage;
import org.springframework.security.core.Authentication;

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
  
  // @Autowired
  // public NaviCellSpeciesRepository species_repository;
  
  
  private boolean createFolder(StorageService storage) {
    this.folder = UUID.randomUUID().toString();
    try {
      storage.createFolder(this.folder);  
      return true;
    }
    catch (StorageException e) {
      return false;
    }
  }
  public NaviCellMap() {
    
  }
  
  public NaviCellMap(Authentication authentication, StorageService storageService, String name, MultipartFile network_file, NaviCellSpeciesRepository speciesRepository) throws NaviCellMapException {
    
    
    this.username = authentication.getName();
    this.isPublic = false; 
    
    if (network_file.isEmpty()) {
      throw new NaviCellMapException("Error : Empty file !");
    }
    
    boolean folder_created = this.createFolder(storageService);
    while (!folder_created) {
      folder_created = this.createFolder(storageService);
    }
  
    this.name = name;
  
    String extension = FilenameUtils.getExtension(network_file.getOriginalFilename());
    if (extension.equals("xml")) {
      
      // Simple case, no conversion needed
      Path network_path = storageService.store(network_file, this.folder, "master.xml");
      this.networkPath = network_path.toString();

    } else {
      throw new NaviCellMapException("Unknown file type : " + extension);

    }
  
    this.createSBGNML(storageService);
    this.createImage(storageService);
    this.createZooms(storageService);
    this.buildMap(storageService);  
  }
  
  private void createSBGNML(StorageService storage) {
        // Creating SBGN-ML file    
        Cd2SbgnmlScript.convert(this.networkPath, "temp_sbgnml.xml");
    
        // Here I'm storing it to make it accessible via the API webserver
        Path sbgnml_path = storage.store(new File("temp_sbgnml.xml"), this.folder, "sbgnml.xml");
        this.sbgnPath = sbgnml_path.toString();
  }
  private void createImage(StorageService storage) throws NaviCellMapException {
    // Creating the PNG rendered file
    // Here we call the rendering API with the link to the sbgn-ml file
    // System.out.println(this.folder + File.separatorChar + FilenameUtils.getBaseName(sbgnml_path.toString()) + ".xml");
    try {
  
      float[] borders = ProduceClickableMap.getBorders(new File(this.networkPath));
    
      System.out.println("Borders : " + borders[0] + " -> " + borders[2] + ", " + borders[1] + " -> " + borders[3]);
      
      
      SBGNRenderer.render(this.folder + File.separatorChar + FilenameUtils.getBaseName(this.sbgnPath) + ".xml", "temp_sbgnml.png");

      BufferedImage map1 = ImageIO.read(new File("temp_sbgnml.png"));
      int full_width = map1.getWidth() + (int) (borders[0] + borders[2] - 20.0);
      int full_height = map1.getHeight() + (int) (borders[1] + borders[3] - 20);
      System.out.println("Map created with dimensions : " + map1.getWidth() + ", " + map1.getHeight());
      BufferedImage imageBuff = new BufferedImage(full_width, full_height, BufferedImage.TYPE_INT_ARGB);
      Graphics g = imageBuff.createGraphics();
      g.setColor(Color.WHITE);
      g.fillRect(0, 0, full_width, full_height);
      g.drawImage(map1, (int) borders[0]-10, (int)borders[1]-10, new Color(255,255,255), null);
      g.dispose();
      ImageIO.write(imageBuff, "PNG", new File("temp_sbgnml_rescaled.png"));
  
    }
    catch (SBGNRendererException e) {
      throw new NaviCellMapException("SBGNRenderer Error : " + e);
    }
    catch (IOException e) {
      throw new NaviCellMapException("IOException Error : " + e);
    }
    
    Path image_path = storage.store(new File("temp_sbgnml_rescaled.png"), this.folder, "sbgnml.png");
    this.imagePath = image_path.toString();
    
    try {
      Files.delete(Paths.get("temp_sbgnml.xml"));
      Files.delete(Paths.get("temp_sbgnml.png"));
      Files.delete(Paths.get("temp_sbgnml_rescaled.png"));
    }
    catch (IOException e) {
      throw new NaviCellMapException("File cannot be deleted : " + e);
    }
  }

  private void createZooms(StorageService storage) throws NaviCellMapException {
    
    try {
      String path = FilenameUtils.getPath(this.imagePath);
      String ext = FilenameUtils.getExtension(this.imagePath);
      String prefix = FilenameUtils.getPrefix(this.imagePath);
      String fullprefix = prefix + path + "master-";
      
      BufferedImage map1 = ImageIO.read(new File(this.imagePath));
      int width = map1.getWidth();
      int height = map1.getHeight();
      int max_zoom = 0;
      
      // How many division by two to be of "screen size"
      while ( width > 640 || height > 480) {
          width /= 2;
          height /= 2;
          max_zoom += 1;
      }
      
      Path new_max_zoom = Paths.get(fullprefix + max_zoom + "." + ext);

      Files.copy(Paths.get(this.imagePath), new_max_zoom);        

      
      
      // Making reduced resolution
      width = map1.getWidth();
      height = map1.getHeight();
      int zoom = max_zoom;
      String old_image_path, new_image_path;
      while ( width > 640 || height > 480 ) {
        
        if (zoom == max_zoom) {
          old_image_path = new_max_zoom.toString();
        } else {
          old_image_path = fullprefix + zoom + "." + ext;
        }
        new_image_path = fullprefix + (zoom-1) + "." + ext;
        
        ACSNProcedures.doScalePng(old_image_path, new_image_path);  
        
        width /= 2;
        height /= 2;
        zoom -= 1;
      }
      
      // Deleting original image (still here as max image)      
      // Files.delete(Paths.get(entry.imagePath));
    }
    catch (IOException e) {
      throw new NaviCellMapException("IO Error : " + e.getMessage());
    }
    catch (Exception e) {
      throw new NaviCellMapException(e.getMessage());
    }
    
  }
  
  private void buildMap(StorageService storage) throws NaviCellMapException{
    try { 
      String path = FilenameUtils.getPath(this.imagePath);
      String prefix = FilenameUtils.getPrefix(this.imagePath);
      final String[][] xrefs;

      BufferedReader xref_stream = open_file("/var/navicell/xrefs.txt");
      xrefs = load_xrefs(xref_stream, "/var/navicell/xrefs.txt");      
      
      Files.createDirectories(Paths.get(storage.getLocation().toString(), this.folder));
      
      ProduceClickableMap.run(
        "", new File(prefix+path), true, false, this.name.replace(" ", ""), null, xrefs, true, 
        null, null, null, null, false, false, // Wordpress
        new File(Paths.get(storage.getLocation().toString(), this.folder).toString()),
        false, true, false
      );
      
      this.url = "maps/" + this.folder + "/master/index.html";
    }
    catch (IOException e) {
      throw new NaviCellMapException("IO Error : " + e);
    }
    catch (Exception e) {
      throw new NaviCellMapException(e.getMessage());
    }
    
  }
  private static BufferedReader open_file(String filename)
	{
		try
		{
			return new BufferedReader(new FileReader(filename));
		}
		catch (FileNotFoundException e1)
		{
			System.err.println(e1.getMessage());
			System.exit(1);
			return null;
		}
	}
  private static String[][] load_xrefs(BufferedReader xref_stream, String xref_file)
	{
		try
		{
			Vector<String[]> ret = new Vector<String[]>();
			String line;
			while ((line = xref_stream.readLine()) != null) {
				// EV: 2017-05-26
				//String[] cols = line.replaceAll("#.*", "").split("\t");
				String[] cols = line.replaceAll("(^#.*| #.*)", "").split("\t");
				if (cols.length >= 3) {
					ret.add(cols);
				}
			}
			Object[] arr = ret.toArray();
			String[][] xrefs = new String[arr.length][];
			for (int nn = 0; nn < arr.length; ++nn) {
				xrefs[nn] = (String[])arr[nn];
			}
			return xrefs;

		}
		catch (IOException e1)
		{
			System.err.println("failed to load Xref file " + xref_file + ": " + e1.getMessage());
			System.exit(1);
			return null;
		}
  }

  @Override
  public String toString() {
    return String.format(
        "{'id': '%s', 'folder': '%s', 'name': '%s', 'network_path': '%s', 'sbgn_path': '%s', 'image_path': '%s'}",
        id, folder, name, networkPath, sbgnPath, imagePath);
  }

}