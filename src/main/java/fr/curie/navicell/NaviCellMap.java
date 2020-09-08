package fr.curie.navicell;

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


import org.springframework.data.annotation.Id;
import org.springframework.web.multipart.MultipartFile;

import fr.curie.BiNoM.pathways.navicell.ProduceClickableMap;
import fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures;
import fr.curie.cd2sbgnml.Cd2SbgnmlScript;
import fr.curie.navicell.storage.StorageException;
import fr.curie.navicell.storage.StorageService;

import org.apache.commons.io.FilenameUtils;
import java.awt.image.BufferedImage;

public class NaviCellMap {

  @Id
  public String id;

  public String folder;
  public String name;
  public String networkPath;
  public String sbgnPath;
  public String imagePath;
  public String url;
  // public String configPath;
  
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
  
  public NaviCellMap(StorageService storageService, String name, MultipartFile network_file) {
    
    boolean folder_created = this.createFolder(storageService);
    while (!folder_created) {
      folder_created = this.createFolder(storageService);
    }
    
    String initials = "";
    for (String s : name.split(" ")) {
      initials+=s.charAt(0);
    }
    
    Path network_path = storageService.store(network_file, this.folder, initials + "_master.xml");
    
    // Creating SBGN-ML file    
    Cd2SbgnmlScript.convert(network_path.toString(), "temp_sbgnml.xml");
    
    // Here I'm storing it to make it accessible via the API webserver
    Path sbgnml_path = storageService.store(new File("temp_sbgnml.xml"), this.folder, "sbgnml.xml");
    
    // Creating the PNG rendered file
    // Here we call the rendering API with the link to the sbgn-ml file
    // System.out.println(this.folder + File.separatorChar + FilenameUtils.getBaseName(sbgnml_path.toString()) + ".xml");
    SBGNRenderer.render(this.folder + File.separatorChar + FilenameUtils.getBaseName(sbgnml_path.toString()) + ".xml", "temp_sbgnml.png");
    
    Path image_path = storageService.store(new File("temp_sbgnml.png"), this.folder, "sbgnml.png");
    
    try {
      Files.delete(Paths.get("temp_sbgnml.xml"));
      Files.delete(Paths.get("temp_sbgnml.png"));
    }
    catch (IOException e) {
      System.out.println("File cannot be deleted : " + e);
    }
    
    this.name = name;
    this.networkPath = network_path.toString();
    this.imagePath = image_path.toString();
    this.sbgnPath = sbgnml_path.toString();

    try {
      String path = FilenameUtils.getPath(this.imagePath);
      String ext = FilenameUtils.getExtension(this.imagePath);
      String prefix = FilenameUtils.getPrefix(this.imagePath);
      String fullprefix = prefix + path + initials + "_master-";
      
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
      
      BufferedImage imageBuff = new BufferedImage(map1.getWidth(), map1.getHeight(), BufferedImage.TYPE_INT_RGB);
      Graphics g = imageBuff.createGraphics();
      g.drawImage(map1, 0, 0, new Color(255,255,255), null);
      g.dispose();
      ImageIO.write(imageBuff, "PNG", new File(fullprefix + max_zoom + "." + ext));
      Path new_max_zoom = Paths.get(fullprefix + max_zoom + "." + ext);
      
      
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
      
      final String[][] xrefs;

      BufferedReader xref_stream = open_file("/var/navicell/xrefs.txt");
      xrefs = load_xrefs(xref_stream, "/var/navicell/xrefs.txt");      
      
      Files.createDirectories(Paths.get(storageService.getLocation().toString(), this.folder));
      
      ProduceClickableMap.run(
        initials + "_", new File(prefix+path), true, false, this.name.replace(" ", ""), null, xrefs, true, 
        null, null, null, null, false, false, // Wordpress
        new File(Paths.get(storageService.getLocation().toString(), this.folder).toString()),
        false, true, false
      );
      
      this.url = "maps/" + this.folder + "/master/index.html";
    }
    catch (IOException e) {
      System.out.println(e);
    }
    catch (Exception e) {
      System.out.println(e);
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