package fr.curie.navicell.storage;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileOutputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileSystemStorageService implements StorageService {

	private final Path rootLocation;
	private final Path dataLocation;

	@Autowired
	public FileSystemStorageService(StorageProperties properties) {
		System.out.println("Root location : " + properties.getMapsLocation());
		this.rootLocation = Paths.get(properties.getMapsLocation());
		this.dataLocation = Paths.get(properties.getDataLocation());
	}

	@Override
	public Path storeMapFile(MultipartFile file, String folder, String name) {
		
		String filename;
		if (name == null) { 
			filename = StringUtils.cleanPath(file.getOriginalFilename()); 
		} else {
			filename = name;
		}
		
		try {
			if (file.isEmpty()) {
				throw new StorageException("Failed to store empty file " + filename);
			}
			if (filename.contains("..")) {
				// This is a security check
				throw new StorageException(
						"Cannot store file with relative path outside current directory "
								+ filename);
			}
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, this.rootLocation.resolve(folder + File.separatorChar + filename),
                    StandardCopyOption.REPLACE_EXISTING);
                return this.rootLocation.resolve(folder + File.separatorChar + filename);
			}
		}
		catch (IOException e) {
			throw new StorageException("Failed to store file " + filename, e);
		}
	}
	
	@Override
	public Path storeMapFile(byte[] file, String folder, String name) {
		
		String filename = name;
		
		try {
			if (file.length == 0) {
				throw new StorageException("Failed to store empty file " + filename);
			}
			if (filename.contains("..")) {
				// This is a security check
				throw new StorageException(
						"Cannot store file with relative path outside current directory "
								+ filename);
			}
			File outputFile = new File(this.rootLocation.resolve(folder + File.separatorChar + filename).toString());
			try (FileOutputStream outputStream = new FileOutputStream(outputFile)) {
				outputStream.write(file);
				return this.rootLocation.resolve(folder + File.separatorChar + filename);
			}
			// try (InputStream inputStream = file.getInputStream()) {
			// 	Files.copy(inputStream, this.rootLocation.resolve(folder + File.separatorChar + filename),
            //         StandardCopyOption.REPLACE_EXISTING);
                
			// }
		}
		catch (IOException e) {
			throw new StorageException("Failed to store file " + filename, e);
		}
	}

	@Override
	public Path storeMapFile(File file, String folder, String name) {
		
		String filename;
		if (name == null) { 
			filename = StringUtils.cleanPath(file.getName()); 
		} else {
			filename = name;
		}
		
		try {
			// if (file.isEmpty()) {
			// 	throw new StorageException("Failed to store empty file " + filename);
			// }
			if (filename.contains("..")) {
				// This is a security check
				throw new StorageException(
						"Cannot store file with relative path outside current directory "
								+ filename);
			}
			// try {
				Files.copy(Paths.get(file.getAbsolutePath()), this.rootLocation.resolve(folder + File.separatorChar + filename),
                    StandardCopyOption.REPLACE_EXISTING);
                return this.rootLocation.resolve(folder + File.separatorChar + filename);
			// }
		}
		catch (IOException e) {
			throw new StorageException("Failed to store file " + filename, e);
		}
	}
	
	@Override
	public Path storeDataFile(MultipartFile file, String folder, String name) {
		
		String filename;
		if (name == null) { 
			filename = StringUtils.cleanPath(file.getOriginalFilename()); 
		} else {
			filename = name;
		}
		
		try {
			if (file.isEmpty()) {
				throw new StorageException("Failed to store empty file " + filename);
			}
			if (filename.contains("..")) {
				// This is a security check
				throw new StorageException(
						"Cannot store file with relative path outside current directory "
								+ filename);
			}
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, this.dataLocation.resolve(folder + File.separatorChar + filename),
                    StandardCopyOption.REPLACE_EXISTING);
                return this.dataLocation.resolve(folder + File.separatorChar + filename);
			}
		}
		catch (IOException e) {
			throw new StorageException("Failed to store file " + filename, e);
		}
	}

	
	
	@Override
	public void createMapFolder(String folder) {
		Path new_path = Paths.get(this.rootLocation.toString(), folder);
		if (!Files.exists(new_path)) {
			try {
				Files.createDirectories(new_path);
			}
			catch (IOException e) {
				throw new StorageException("Failed to create directory", e);
			}
		}
		
	}
	
	@Override
	public void createDataFolder(String folder) {
		Path new_path = Paths.get(this.dataLocation.toString(), folder);
		if (!Files.exists(new_path)) {
			try {
				Files.createDirectories(new_path);
			}
			catch (IOException e) {
				throw new StorageException("Failed to create directory", e);
			}
		}
		
	}
	
	// @Override
	// public Stream<Path> loadAll() {
	// 	try {
	// 		return Files.walk(this.rootLocation, 1)
	// 			.filter(path -> !path.equals(this.rootLocation))
	// 			.map(this.rootLocation::relativize);
	// 	}
	// 	catch (IOException e) {
	// 		throw new StorageException("Failed to read stored files", e);
	// 	}

	// }
    
	// @Override
	// public Path loadMap(String filename) {
	// 	return rootLocation.resolve(filename);
	// }

	// @Override
	// public Resource loadAsResource(String filename) {
	// 	try {
	// 		Path file = load(filename);
	// 		Resource resource = new UrlResource(file.toUri());
	// 		if (resource.exists() || resource.isReadable()) {
	// 			return resource;
	// 		}
	// 		else {
	// 			throw new StorageFileNotFoundException(
	// 					"Could not read file: " + filename);

	// 		}
	// 	}
	// 	catch (MalformedURLException e) {
	// 		throw new StorageFileNotFoundException("Could not read file: " + filename, e);
	// 	}
	// }

	@Override
	public void deleteAll() {
		FileSystemUtils.deleteRecursively(rootLocation.toFile());
	}

	@Override
	public void init() {
		try {
			Files.createDirectories(rootLocation);
		}
		catch (IOException e) {
			throw new StorageException("Could not initialize storage", e);
		}
	}
	
	@Override
	public Path getMapsLocation() {
		return rootLocation;
	}
	
	@Override
	public Path getDataLocation() {
		return dataLocation;
	}
	
	@Override
	public void deleteMapByFolder(String folder) {
		if (folder != null)
		{
			try{
				FileSystemUtils.deleteRecursively(Paths.get(rootLocation.toString(), folder));
			}
			catch (IOException e) {
				throw new StorageException("Could not remove folder " + folder);
			}
		}
	}
	
	@Override
	public void deleteDataByFolder(String folder) {
		
		if (folder != null) {
			try{
				
				FileSystemUtils.deleteRecursively(Paths.get(dataLocation.toString(), folder));
			}
			catch (IOException e) {
				throw new StorageException("Could not remove folder " + folder);
			}
		}
	}
}