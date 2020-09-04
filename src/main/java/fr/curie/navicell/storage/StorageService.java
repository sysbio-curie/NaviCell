package fr.curie.navicell.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;
import java.util.List;
import java.io.File;

public interface StorageService {

	void init();

	Path store(MultipartFile file, String folder, String filename);
	Path store(File file, String folder, String filename);

	void createFolder(String folder);
	
	Stream<Path> loadAll();
	
	Path load(String filename);

	Resource loadAsResource(String filename);

	void deleteAll();

}