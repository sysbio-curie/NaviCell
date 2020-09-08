package fr.curie.navicell;

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
import java.nio.file.Paths;

public class SBGNRenderer {
    
    public static void render(String input, String output) {
        HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
        chromePrefs.put("download.default_directory", System.getProperty("user.dir"));
        chromePrefs.put("download.prompt_for_download", false);
        chromePrefs.put("download.directory_upgrade", true);
        
        System.setProperty("webdriver.chrome.whitelistedIps", "");
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");        
        options.setExperimentalOption("prefs", chromePrefs);
        
        WebDriver driver = new ChromeDriver(options);
        driver.get("http://newt-converter:8081?url=http://navicell/maps/" + input);
        
        WebDriverWait wait = new WebDriverWait(driver, 1000);
        wait.withMessage("Timeout executing script: ");
        
        final Object[] out = new Object[1];
        wait.until(
            new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver driver) {
                    
                    try {
                        out[0] = ((JavascriptExecutor) driver).executeScript("return document.sbgnReady");
                    }
                    catch (WebDriverException e) {
                        // Still loading, not answering
                        out[0] = null;
                    }
                    return (out[0] != null) && (out[0].toString() == "true");
                }
            }
        );
        
        while( !Files.exists(Paths.get("truc.png")) ) {
            try {
                TimeUnit.SECONDS.sleep(1);
            }
            catch (InterruptedException e) { }
        }
        File output_file = new File(output);
        new File("truc.png").renameTo(output_file);        
    }
    
}