package fr.curie.navicell.sbgnrender;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
// import fr.curie.navicell.SBGNRendererException;

public class SBGNPerformLayout {
    
    public static void render(String input, String output, Path tmpDir) throws SBGNRendererException {
        HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
        chromePrefs.put("download.default_directory", tmpDir.toString());
        chromePrefs.put("download.prompt_for_download", false);
        chromePrefs.put("download.directory_upgrade", true);
        
        System.setProperty("webdriver.chrome.whitelistedIps", "");
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");        
        options.addArguments("--allow-file-access-from-files");
        options.addArguments("--disabled-web-security");
    
        options.setExperimentalOption("prefs", chromePrefs);
        
        WebDriver driver = new ChromeDriver(options);
        
        String driver_url = "file:///var/navicell/src/main/resources/index.html?url=/var/navicell/site/docroot/navicell/maps/" + input + "&layout=true&format=sbgn";
        System.out.println("Getting " + driver_url);
        driver.get(driver_url);
        
        WebDriverWait wait = new WebDriverWait(driver, 60 * 60 * 2);
        wait.withMessage("Timeout executing script: ");
        
        final Object[] out = new Object[1];
        wait.until(
            new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver driver) {
                    
                    try {
                        out[0] = ((JavascriptExecutor) driver).executeScript("return document.sbgnReady || document.sbgnError || document.sbgnNotFound;");// | document.sbgnNotFound | document.sbgnError;");
                        System.out.println("Answer : " + out[0]);
                    }
                    catch (WebDriverException e) {
                        // Still loading, not answering
                        System.out.println("Not answering...");
                        out[0] = null;
                    }
                    return (out[0] != null) && (out[0].toString() == "true");
                }
            }
        );
        
        if (((JavascriptExecutor) driver).executeScript("return document.sbgnNotProvided;").toString() == "true") {
            driver.quit();    
            throw new SBGNRendererException("SBGN Not provided");
            
        } else if (((JavascriptExecutor) driver).executeScript("return document.sbgnNotFound;").toString() == "true") {
            driver.quit();
            throw new SBGNRendererException("SBGN Not Found");
            
        }
        else if (((JavascriptExecutor) driver).executeScript("return document.sbgnNotParsed;").toString() == "true") {
            driver.quit();
            throw new SBGNRendererException("SBGN Error");
            
        } else if (((JavascriptExecutor) driver).executeScript("return document.sbgnReady;").toString() != "true") {
            driver.quit();
            throw new SBGNRendererException("Unknown SBGN Rendering error");
        } 
        
        while( !Files.exists(Paths.get(tmpDir.toString(), "network.xml")) ) {
            try {
                System.out.println("Waiting for download");   
                TimeUnit.SECONDS.sleep(1);
            }
            catch (InterruptedException e) { }
        }
        driver.quit();
            
        File output_file = new File(Paths.get(tmpDir.toString(), output).toString());
        new File(Paths.get(tmpDir.toString(), "network.xml").toString()).renameTo(output_file);
    }
    
}

