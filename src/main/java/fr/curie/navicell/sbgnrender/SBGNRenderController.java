package fr.curie.navicell.sbgnrender;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.core.Authentication;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.util.StringUtils;

// @CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class SBGNRenderController {
  
  private SBGNRenderer sbgn_render;
  
  @Autowired
	public SBGNRenderController(SBGNRenderer sbgn_render) {
		this.sbgn_render = sbgn_render;
  }
  
  
  @PostMapping("api/render")
  // @ResponseStatus(value = HttpStatus.CREATED)
  public @ResponseBody byte[] render(
    @RequestParam("file") MultipartFile network_file, 
    @RequestParam("format") Optional<String> format,
    @RequestParam("bg") Optional<String> bg,
    @RequestParam("scale") Optional<String> scale,
    @RequestParam("max_width") Optional<String> max_width,
    @RequestParam("max_height") Optional<String> max_height,
    @RequestParam("quality") Optional<String> quality,
    @RequestParam("layout") Optional<String> layout,
    @RequestParam("layout_quality") Optional<String> layout_quality,
    @RequestParam("async") Optional<String> async
  ) {
    if (format.isPresent()) 
      System.out.println(format.get());
      
      
    if (!format.isPresent() || (format.get().equals("png") || format.get().equals("jpg") || format.get().equals("svg"))){
      Path tmpDir = null;
      String image_extension = format.isPresent() ? format.get() : "png";
      System.out.println("Good format : " + image_extension);
      try {

        String filename = StringUtils.cleanPath(network_file.getOriginalFilename()); 
        String extension = FilenameUtils.getExtension(network_file.getOriginalFilename());
        if (extension.equals("xml") || extension.equals("sbgn") || extension.equals("newt")) {
          
          System.out.println("Creating temp dir");
          tmpDir = Files.createTempDirectory(null);
          
          System.out.println("Creating file in " + Paths.get(tmpDir.toString(), filename).toString());

          try (InputStream inputStream = network_file.getInputStream()) {
            Files.copy(inputStream, Paths.get(tmpDir.toString(), filename),
                        StandardCopyOption.REPLACE_EXISTING);
          }
          
          this.sbgn_render.render(
            Paths.get(tmpDir.toString(), filename).toString(), "temp_sbgnml." + image_extension, tmpDir,
            format, bg, scale, max_width, max_height, quality, layout, layout_quality, async
          );
          
          System.out.println("Renderer image");
        
          BufferedImage bImage = ImageIO.read(new File(Paths.get(tmpDir.toString(), "temp_sbgnml." + image_extension).toString()));
          ByteArrayOutputStream bos = new ByteArrayOutputStream();
          ImageIO.write(bImage, image_extension, bos );
          byte [] data = bos.toByteArray();
    
          tmpDir.toFile().deleteOnExit();

          return data;

        } 
        
        
      
        
        
    
      

      }
      catch (IOException e) {
        System.err.println(e);
        if (tmpDir != null) {
          tmpDir.toFile().deleteOnExit();
        }
        
        // throw new SBGNRendererException("SBGN rendering Error : " + e);
      }
      catch (SBGNRendererException e) {
        System.err.println(e);
        if (tmpDir != null) {
          tmpDir.toFile().deleteOnExit();
        }
        
        // throw new SBGNRendererException("SBGN rendering Error : " + e);
      }
    }
    
    return new byte[0];

    
  }
}
