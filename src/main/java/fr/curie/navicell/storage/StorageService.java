package fr.curie.navicell.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;
import java.util.List;
import java.io.File;

public interface StorageService {

	void init();

	Path storeMapFile(byte[] file, String folder, String filename);
	Path storeMapFile(MultipartFile file, String folder, String filename);
	Path storeMapFile(File file, String folder, String filename);

	Path storeDataFile(MultipartFile file, String folder, String filename);
	Path storeDataFileFromURL(String file_url, String folder, String filename);
	
	void createMapFolder(String folder);
	void createDataFolder(String folder);
	
	// Stream<Path> loadAll();
	
	// Path load(String filename);

	// Resource loadAsResource(String filename);

	void deleteAll();
	
	void deleteMapByFolder(String folder);
	void deleteDataByFolder(String folder);
	
	Path getMapsLocation();
	Path getDataLocation();

}