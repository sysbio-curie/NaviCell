package fr.curie.navicell.sbgnrender;

import java.util.HashMap;
import java.util.Optional;
import java.util.Properties;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SBGNRenderer {
    
    // @Autowired
    private SBGNRenderProperties properties;
    
    @Autowired
    public SBGNRenderer(SBGNRenderProperties properties) {
        this.properties = properties;
    }
    
    public void render(String input, String output, Path tmpdir, 
        Optional<String> format, Optional<String> bg, Optional<String> scale, Optional<String> max_width, Optional<String> max_height, 
        Optional<String> quality, Optional<String> layout, Optional<String> layout_quality, Optional<String> async
    ) throws SBGNRendererException {
            
        HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
        
        chromePrefs.put("download.default_directory", tmpdir.toString());
        chromePrefs.put("download.prompt_for_download", false);
        chromePrefs.put("download.directory_upgrade", true);
        
        System.setProperty("webdriver.chrome.whitelistedIps", properties.getWhiteListedIps());
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");        
        options.addArguments("--allow-file-access-from-files");
        options.addArguments("--disabled-web-security");
    
        options.setExperimentalOption("prefs", chromePrefs);
        
        WebDriver driver = new ChromeDriver(options);
        
        String format_str = format.isPresent() ? "&format=" + format.get() : "";
        String scale_str = scale.isPresent() ? "&scale=" + scale.get() : "";
        String bg_str = bg.isPresent() ? "&bg=" + bg.get() : "";
        String max_width_str = max_width.isPresent() ? "&max_width=" + max_width.get() : "";
        String max_height_str = max_height.isPresent() ? "&max_height=" + max_height.get() : "";
        String quality_str = quality.isPresent() ? "&quality=" + quality.get() : "";
        String layout_str = layout.isPresent() ? "&layout=" + layout.get() : "";
        String layout_quality_str = layout_quality.isPresent() ? "&layout_quality=" + layout_quality.get() : "";
        
        String extension = format.isPresent() ? format.get() : "png";
        // String driver_url = "file:///var/navicell/src/main/resources/index.html?url=/var/navicell/site/docroot/navicell/maps/" + input + format_str + scale_str + bg_str + max_width_str + max_height_str + quality_str + layout_str + layout_quality_str;
        String driver_url = "file://" + this.properties.getLocation() + "?url=" + input + format_str + scale_str + bg_str + max_width_str + max_height_str + quality_str + layout_str + layout_quality_str;
        // String driver_url = "file:///var/navicell/src/main/resources/index.html?url=" + input + format_str + scale_str + bg_str + max_width_str + max_height_str + quality_str + layout_str + layout_quality_str;
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
        
        while( !Files.exists(Paths.get(tmpdir.toString(), "network." + extension)) ) {
            try {
                System.out.println("Waiting for download");   
                TimeUnit.SECONDS.sleep(1);
            }
            catch (InterruptedException e) { }
        }
        driver.quit();
            
        File output_file = new File(Paths.get(tmpdir.toString(), output).toString());
        new File(Paths.get(tmpdir.toString(), "network." + extension).toString()).renameTo(output_file);
        System.out.println("returning from render");
    }
    
}

