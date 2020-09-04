package fr.curie.navicell;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.io.File;
import java.io.IOException;

public class SBGNRenderer {
    
    public static void render(String input, String output) {
        HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
        // chromePrefs.put("webdriver.chrome.driver", "/usr/bin/chromedriver");
        // chromePrefs.put("profile.default_content_settings.popups", 0);
        chromePrefs.put("download.default_directory", System.getProperty("user.dir"));
        
        // System.setProperty("webdriver.chrome.logfile", "D:\\chromedriver.log");
        // chromePrefs.put("webdriver.chrome.verboseLogging", "true");
        
        // chromePrefs.put("safebrowsing_for_trusted_sources_enabled", false);
        // chromePrefs.put("safebrowsing.enabled", false);
        // chromePrefs.put("whitelistedIps", "");
        System.setProperty("webdriver.chrome.whitelistedIps", "");
        
        ChromeOptions options = new ChromeOptions();
        // options.setBinary("/usr/bin/chromium");
        options.addArguments("--whitelisted-ips=''");
        options.addArguments("--headless");
        options.addArguments("--window-size=1920x1080");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");
        options.addArguments("--verbose");
        // options.addArguments("--disable-web-security");
        // options.addArguments("--allow-running-insecure-content");
        // options.addArguments("--allow-insecure-localhost");

        options.setExperimentalOption("prefs", chromePrefs);
        WebDriver driver = new ChromeDriver(options);
        System.out.println("http://navicell:8080/" + input);
        driver.get("http://newt-converter?url=http://navicell:8080/" + input);
        
        try {
            TimeUnit.SECONDS.sleep(1);
        }
        catch (InterruptedException e) {
            
        }
        File output_file = new File(output);
        boolean res = new File("truc.png").renameTo(output_file);
        System.out.println("Renamed ? " + res);
        
    }
    
}