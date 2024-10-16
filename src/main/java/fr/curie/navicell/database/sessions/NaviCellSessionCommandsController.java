// package fr.curie.navicell.database.sessions;
// import java.io.ByteArrayInputStream;
// import java.io.File;
// import java.io.FileReader;
// import java.io.IOException;
// import java.io.InputStreamReader;
// import java.io.InputStream;
// import java.nio.charset.StandardCharsets;
// import java.nio.file.Files;
// import java.nio.file.Paths;
// import java.util.List;
// import java.util.Optional;
// import java.util.Set;
// import javax.servlet.http.HttpServletResponse;
// import javax.naming.AuthenticationException;

// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.HashSet;
// import org.apache.commons.collections4.ListUtils;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.RestController;

// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.multipart.MultipartFile;

// import org.springframework.boot.context.properties.EnableConfigurationProperties;
// import org.springframework.security.core.Authentication;

// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.ResponseStatus;
// import org.springframework.web.bind.annotation.ResponseBody;

// import fr.curie.navicell.database.maps.NaviCellMapRepository;
// import fr.curie.navicell.database.maps.NaviCellMap;
// import fr.curie.navicell.database.maps.NaviCellMapException;
// // import fr.curie.navicell.database.maps.NaviCellSpeciesRepository;
// // import fr.curie.navicell.database.species.NaviCellSpecies;

// import fr.curie.navicell.storage.StorageProperties;
// import fr.curie.navicell.storage.StorageService;
// import org.json.JSONObject;
// import org.json.JSONException;
// import org.json.JSONArray;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.core.io.InputStreamResource;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;

// // @CrossOrigin(origins = "*", maxAge = 3600)
// @RestController
// public class NaviCellSessionCommandsController {
  
//   @Autowired
//   public NaviCellSessionRepository sessions_repository;
  
// 	@Autowired
//   public NaviCellSessionCommandsRepository commands_repository;
  
//   @GetMapping("/api/sessions")
//   @ResponseStatus(value = HttpStatus.OK)
//   List<NaviCellSession> allSessions(Authentication authentication ) {
//     if (authentication != null) {
//       return sessions_repository.findByUsername(authentication.getName());
//     }
//     return new ArrayList<>();
//   }
  
//   @PutMapping("/api/sessions/{id}")
//   void updateSession(Authentication authentication, @PathVariable("id") String id, @RequestParam("commands") String commands) {
//     if (authentication != null) {
//       Optional<NaviCellSession> entry = sessions_repository.findById(id);
//       if (entry.isPresent() && (entry.get().username.equals(authentication.getName()))) {
//         NaviCellSession session = entry.get();
//         session.commands = Arrays.asList(commands.split("\\r\\n\\r\\n"));
//         sessions_repository.save(session);
//       }
//     }
//   }
  
//   @PostMapping("/api/sessions")
//   @ResponseStatus(value = HttpStatus.CREATED)
//   Optional<NaviCellSession> createSession(Authentication authentication, @RequestParam("name") String name, @RequestParam("mapId") String mapId) {
//     if (authentication != null) {
//       NaviCellSessionCommands
//       NaviCellSession entry = new NaviCellSession(name, mapId, authentication.getName());
//       sessions_repository.save(entry);
//       return Optional.of(entry);
//     }
//     return Optional.empty();
//   }
  
//   @DeleteMapping("/api/sessions/{id}")
//   @ResponseStatus(value = HttpStatus.OK)
//   void delete(Authentication authentication, @PathVariable("id") String id)  {
//     if (authentication != null) {
//       SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
//       Optional<NaviCellSession> entry = sessions_repository.findById(id);
//       if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
//         sessions_repository.deleteById(id);
//     }}
//   }
//   @GetMapping("/api/sessions/{id}.nvc")
//   void downloadSession(Authentication authentication, @PathVariable("id") String id, HttpServletResponse response) {
//     System.out.println("Downloading session " + id);
//     // if (authentication != null) {
//     //   SimpleGrantedAuthority authority = (SimpleGrantedAuthority) authentication.getAuthorities().toArray()[0];
//       Optional<NaviCellSession> entry = sessions_repository.findById(id);
//     //   if (entry.isPresent() && (entry.get().username.equals(authentication.getName()) || authority.getAuthority().equals("admin"))) {
//       if (entry.isPresent()) { 
      
//       System.out.println("We can download it");
        
//         String nvc_string = String.join("\r\n\r\n", entry.get().commands);
//         System.out.println(nvc_string);
//         try {
//           InputStream input_stream = new ByteArrayInputStream(nvc_string.getBytes(StandardCharsets.UTF_8));
          
//           // get your file as InputStream
//           // InputStream is = ...;
//           // copy it to response's OutputStream
//           response.setContentType("text/plain");
//           response.setHeader("Content-Disposition", "attachment; filename=\""  + id + ".nvc\""); 
//           org.apache.commons.io.IOUtils.copy(input_stream, response.getOutputStream());
          
          
//           response.flushBuffer();
          
//         } catch (IOException ex) {
//           // log.info("Error writing file to output stream. Filename was '{}'", fileName, ex);
//           throw new RuntimeException("IOError writing file to output stream");
//         }
        
        
//         // InputStreamResource resource = new InputStreamResource(
//         //   
//         // );
        
        
//         // return ResponseEntity.ok()
//         //   // .headers(headers)
//         //   .contentLength(nvc_string.length())
//         //   .contentType(MediaType.APPLICATION_OCTET_STREAM)
//         //   .body(resource);  
        
        
        
        
        
        
       
        
        
        
        
        
          
//       } 
//       // else 
//       //   return ResponseEntity.status(HttpStatus.NOT_FOUND);
      
      
      
    
//     // }
//     // else {
//     //   System.out.println("Authentication is null")
//     // }
//     // return ResponseEntity.status(HttpStatus.FORBIDDEN);
//   }
// }
