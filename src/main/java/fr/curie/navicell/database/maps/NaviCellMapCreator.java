package fr.curie.navicell.database.maps;

import java.io.File;
// import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
// import java.util.List;
// import java.util.HashSet;
import java.util.Optional;
import java.util.Vector;
import java.util.ArrayList;
import java.util.UUID;
// import java.util.Arrays;
// import java.lang.Thread;
// import java.lang.Boolean;
import java.nio.file.Path;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import javax.imageio.ImageIO;
import fr.curie.BiNoM.pathways.navicell.ProduceClickableMap;
import fr.curie.BiNoM.pathways.utils.acsn.ACSNProcedures;
import fr.curie.cd2sbgnml.Cd2SbgnmlScript;
import fr.curie.cd2sbgnml.Sbgnml2CdScript;
// import org.apache.commons.collections4.ListUtils;
// import org.springframework.beans.factory.annotation.Autowired;

// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.multipart.MultipartFile;

// import org.springframework.boot.context.properties.EnableConfigurationProperties;
// import org.springframework.security.core.Authentication;

// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.ResponseStatus;

// import fr.curie.navicell.database.species.NaviCellSpeciesRepository;
// import fr.curie.navicell.database.tags.NaviCellTag;
// import fr.curie.navicell.database.tags.NaviCellTagRepository;
import fr.curie.navicell.sbgnrender.SBGNRenderer;
import fr.curie.navicell.sbgnrender.SBGNPerformLayout;
import fr.curie.navicell.sbgnrender.SBGNRendererException;
// import fr.curie.navicell.database.species.NaviCellSpecies;

// import fr.curie.navicell.storage.StorageProperties;
import fr.curie.navicell.storage.StorageService;
import fr.curie.navicell.storage.StorageException;
// import org.json.JSONObject;
// import org.json.JSONException;
// import org.json.JSONArray;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.apache.commons.io.FilenameUtils;
import java.awt.image.BufferedImage;
import java.awt.Graphics;
import java.awt.Color;





public class NaviCellMapCreator {

  public static void createMap(NaviCellMap map, StorageService storageService, SBGNRenderer sbgn_render, byte[] network_file, byte[] image_file, String extension, String layout) throws NaviCellMapException 
  {
    
    if (network_file.length == 0) {
      throw new NaviCellMapException("Error : Empty file !");
    }
    
    String folder_created = createFolder(storageService);
    while (folder_created.length() == 0) {
      folder_created = createFolder(storageService);
    }
    map.folder = folder_created;
    map.tags = new ArrayList<>();
    System.out.println("Size of file : " + network_file.length);
    // String extension = FilenameUtils.getExtension(network_file.getOriginalFilename());
    if (!extension.equals("xml")) {
       throw new NaviCellMapException("Unknown file type : " + extension);
    }
      
    // Simple case, no conversion needed
    Path network_path = storageService.storeMapFile(network_file, map.folder, "master.xml");
    map.networkPath = storageService.getMapsLocation().relativize(network_path).toString();
    
    
    Path tmpDir = null;
    try {
      System.out.println("Creating temp dir");
      tmpDir = Files.createTempDirectory(null);
      System.out.println(image_file.length);
      System.out.println(image_file);
      if (image_file.length == 0) {

        if (layout.length() > 0 && Boolean.parseBoolean(layout)) { 
          System.out.println("We want a layout");
          map.networkPath = performLayout(storageService, tmpDir, map.folder, map.networkPath);
          // this.createSBGNML(storageService);
        
        }
        System.out.println("Creating sbgn");
        map.sbgnPath = createSBGNML(storageService, tmpDir, map.folder, map.networkPath);
        System.out.println("Starting rendering");
        map.imagePath = createImage(storageService, sbgn_render, tmpDir, map.folder, map.networkPath, map.sbgnPath);
      } else {
        Path image_path = storageService.storeMapFile(image_file, map.folder, "master.png");
        map.imagePath = storageService.getMapsLocation().relativize(image_path).toString();
      }
      
      System.out.println("Creating zooms");
      createZooms(storageService, tmpDir, map.imagePath);
      System.out.println("Creating map");
      map.url = buildMap(storageService, map.name, map.folder, map.imagePath);  

      tmpDir.toFile().deleteOnExit();

    }
    catch (IOException e) {
      System.err.print(e); 
      System.out.println("ERROR IN CONSTRUCTOR");

      throw new NaviCellMapException("Map Creation Error : " + e);

      // if (tmpDir != null) {
        // tmpDir.toFile().deleteOnExit();
      // }
    }
     
   }
   
   
   
   
   
  private static String createFolder(StorageService storage) {
    try {
      String folder = UUID.randomUUID().toString();
      storage.createMapFolder(folder);  
      return folder;
    }
    catch (StorageException e) {
      return "";
    }
  }
  
  
  private static String performLayout(StorageService storageService, Path tmpDir, String folder, String networkPath) throws NaviCellMapException {
    try{
    
      String sbgnPath = createSBGNML(storageService,tmpDir, folder, networkPath);
      SBGNPerformLayout.render(folder + File.separatorChar + FilenameUtils.getBaseName(sbgnPath) + ".xml", "sbgnml_layout.xml", tmpDir);
      
      Sbgnml2CdScript.convert(
        Paths.get(tmpDir.toString(), "sbgnml_layout.xml").toString(), 
        Paths.get(tmpDir.toString(), "temp_cd2.xml").toString()
      );
      // ProduceClickableMap.setPositions(Paths.get(this.sbgnPath).toFile(), Paths.get(tmpDir.toString(), "temp_cd2.xml").toFile());
      Path network_path = storageService.storeMapFile(Paths.get(tmpDir.toString(), "temp_cd2.xml").toFile(), folder, "master.xml");
      // this.networkPath = storageService.getMapsLocation().relativize(network_path).toString();
      return storageService.getMapsLocation().relativize(network_path).toString();
    }
    catch (SBGNRendererException e) {
      System.out.println("ERROR IN PERFORM LAYOUT");
      // System.err.println(e);
      throw new NaviCellMapException("SBGNPerformLayout Error : " + e);

    }
    
  }
  
  private static String createSBGNML(StorageService storage, Path tmpdir, String folder, String networkPath) {
    // Creating SBGN-ML file    
    
    Path tmpSBGN = Paths.get(tmpdir.toString(), "temp_sbgnml.xml");
    System.out.println(networkPath.toString());
    System.out.println(Paths.get(storage.getMapsLocation().toString(), networkPath.toString()).toString());
    Cd2SbgnmlScript.convert(Paths.get(storage.getMapsLocation().toString(), networkPath.toString()).toString(), tmpSBGN.toString());

    // Here I'm storing it to make it accessible via the API webserver
    Path sbgnml_path = storage.storeMapFile(new File(tmpSBGN.toString()), folder, "sbgnml.xml");
    return storage.getMapsLocation().relativize(sbgnml_path).toString();
  }
  
  private static String createImage(StorageService storage, SBGNRenderer sbgn_render, Path tmpDir, String folder, String networkPath, String sbgnPath) throws NaviCellMapException {
    // Creating the PNG rendered file
    // Here we call the rendering API with the link to the sbgn-ml file
    // System.out.println(this.folder + File.separatorChar + FilenameUtils.getBaseName(sbgnml_path.toString()) + ".xml");
    try {
  
      float[] borders = ProduceClickableMap.getBorders(Paths.get(storage.getMapsLocation().toString(), networkPath).toFile());
    
      System.out.println("Borders : " + borders[0] + " -> " + borders[2] + ", " + borders[1] + " -> " + borders[3]);
      
      sbgn_render.render(
        storage.getMapsLocation().toString() + File.separatorChar + folder + File.separatorChar + FilenameUtils.getBaseName(sbgnPath) + ".xml", "temp_sbgnml.png", tmpDir,
        Optional.ofNullable("png"),  Optional.ofNullable("#fff"), Optional.ofNullable("1"), Optional.empty(),  Optional.empty(), Optional.empty(), Optional.empty(),  Optional.empty(), Optional.empty()
      );

      BufferedImage map1 = ImageIO.read(new File(Paths.get(tmpDir.toString(), "temp_sbgnml.png").toString()));
      int full_width = map1.getWidth() + (int) (borders[0] + borders[2] - 20.0);
      int full_height = map1.getHeight() + (int) (borders[1] + borders[3] - 20);
      System.out.println("Map created with dimensions : " + map1.getWidth() + ", " + map1.getHeight());
      BufferedImage imageBuff = new BufferedImage(full_width, full_height, BufferedImage.TYPE_INT_ARGB);
      Graphics g = imageBuff.createGraphics();
      g.setColor(Color.WHITE);
      g.fillRect(0, 0, full_width, full_height);
      g.drawImage(map1, (int) borders[0]-10, (int)borders[1]-10, new Color(255,255,255), null);
      g.dispose();
      ImageIO.write(imageBuff, "PNG", new File(Paths.get(tmpDir.toString(), "temp_sbgnml_rescaled.png").toString()));
  
    }
    catch (SBGNRendererException e) {
      throw new NaviCellMapException("SBGNRenderer Error : " + e);
    }
    catch (IOException e) {
      throw new NaviCellMapException("IOException Error : " + e);
    }
    
    Path image_path = storage.storeMapFile(new File(Paths.get(tmpDir.toString(), "temp_sbgnml_rescaled.png").toString()), folder, "sbgnml.png");
    return storage.getMapsLocation().relativize(image_path).toString();
    
    // try {
    //   Files.delete(Paths.get("temp_sbgnml.xml"));
    //   Files.delete(Paths.get("temp_sbgnml.png"));
    //   Files.delete(Paths.get("temp_sbgnml_rescaled.png"));
    // }
    // catch (IOException e) {
    //   throw new NaviCellMapException("File cannot be deleted : " + e);
    // }
  }

  private static void createZooms(StorageService storage, Path tmpDir, String imagePath) throws NaviCellMapException {
    
    try {
      String path = FilenameUtils.getPath(Paths.get(storage.getMapsLocation().toString(), imagePath).toString());
      String ext = FilenameUtils.getExtension(imagePath);
      String prefix = FilenameUtils.getPrefix(Paths.get(storage.getMapsLocation().toString(), imagePath).toString());
      String fullprefix = prefix + path + "master-";
      
      BufferedImage map1 = ImageIO.read(new File(Paths.get(storage.getMapsLocation().toString(), imagePath).toString()));
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

      Files.copy(Paths.get(Paths.get(storage.getMapsLocation().toString(), imagePath).toString()), new_max_zoom);        

      
      
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
      throw new NaviCellMapException("Error creating zooms : " + e.getMessage());
    }
    
  }
  
  private static String buildMap(StorageService storage, String name, String folder, String imagePath) throws NaviCellMapException{
    try { 
      String path = FilenameUtils.getPath(Paths.get(storage.getMapsLocation().toString(), imagePath).toString());
      String prefix = FilenameUtils.getPrefix(Paths.get(storage.getMapsLocation().toString(), imagePath).toString());
      final String[][] xrefs;

      BufferedReader xref_stream = new BufferedReader(new InputStreamReader(  NaviCellMapCreator.class.getClassLoader().getResourceAsStream("xrefs.txt"), "UTF-8"));// open_file("/var/navicell/xrefs.txt");
      xrefs = load_xrefs(xref_stream);      
      
      Files.createDirectories(Paths.get(storage.getMapsLocation().toString(), folder));
      
      ProduceClickableMap.run(
        "", new File(prefix+path), true, false, name.replace(" ", ""), null, xrefs, true, 
        null, null, null, null, false, false, // Wordpress
        new File(Paths.get(storage.getMapsLocation().toString(), folder).toString()),
        false, true, false
      );
      
      System.out.println("Returning from running the map creation");
      return "maps/" + folder + "/master/index.html";
    }
    catch (IOException e) {
      throw new NaviCellMapException("IO Error : " + e);
    }
    catch (Exception e) {
      throw new NaviCellMapException(" Error producing map : " + e.getMessage());
    }
    
  }
  // private static BufferedReader open_file(String filename)
	// {
	// 	try
	// 	{
	// 		return new BufferedReader(new FileReader(filename));
	// 	}
	// 	catch (FileNotFoundException e1)
	// 	{
	// 		System.err.println(e1.getMessage());
	// 		System.exit(1);
	// 		return null;
	// 	}
	// }
  private static String[][] load_xrefs(BufferedReader xref_stream)
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
			System.err.println("failed to load Xref file : " + e1.getMessage());
			System.exit(1);
			return null;
		}
  }
}





