package staging.cases;

import org.apache.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import staging.pages.MainPage;
import staging.pages.OpenMainPage;
import staging.utils.SettingsProperties;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.Config;

import java.util.concurrent.TimeUnit;

public abstract class AbstractTest {

    protected WebDriver driver;
    private final Logger log = Logger.getLogger(this.getClass());
    protected static final Config config = ConfigFactory.load();

    @BeforeMethod
    public void setUp() throws Exception {
        log.info("set browser type");
        // String currentDirectory = System.getProperty("user.dir");
        // System.setProperty("webdriver.chrome.driver", currentDirectory + SettingsProperties.getProperty("pathToChromeDriver"));
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
    }

    @AfterMethod
    public void tearDown() throws Exception {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public MainPage openMainPage() {
        OpenMainPage openMainPage = new OpenMainPage(driver);
        MainPage mainPage = openMainPage.openMainPage();
        return mainPage;
    }

    public void logTestHeader(final String text) {
        int aim = 64;
        String line = "";
        log.info("");
        for (int i = 0; i <= aim; i ++) {
            line = line + "*";
        }
        log.info(line);
        log.info(text);
        log.info(line);
    }

}
