package staging.cases;

import org.apache.log4j.Logger;
import org.openqa.selenium.WebDriver;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.*;
import staging.pages.MainPage;
import staging.pages.OpenMainPage;
import staging.pages.PrecisionFDAPage;
import staging.utils.SettingsProperties;
import staging.utils.Utils;
import tools.CommonActions;
import tools.TestResultListener;

import java.util.concurrent.TimeUnit;

import static org.testng.Assert.assertTrue;
import static staging.utils.Utils.globalSalt;

@Listeners(TestResultListener.class)
public abstract class AbstractTest {

    protected static WebDriver driver;
    private final Logger log = Logger.getLogger(this.getClass());

    @BeforeClass
    public void setUp() throws Exception {
        log.info("set browser type");

        String currentDirectory = System.getProperty("user.dir");


        // Google Chrome

//        System.setProperty("webdriver.chrome.driver", currentDirectory + SettingsProperties.getProperty("pathToChromeDriver"));
//        DesiredCapabilities capabilities = DesiredCapabilities.chrome();
//        capabilities.setCapability(CapabilityType.ACCEPT_SSL_CERTS, true);
//
//        ChromeOptions options = new ChromeOptions();
//        options.addArguments("--headless", "--disable-gpu");
//
//        capabilities.setCapability(ChromeOptions.CAPABILITY, options);
//        driver = new ChromeDriver(capabilities);


        // Firefox

        FirefoxBinary firefoxBinary = new FirefoxBinary();
        firefoxBinary.addCommandLineOptions("--headless");
        System.setProperty("webdriver.gecko.driver", currentDirectory + SettingsProperties.getProperty("pathToFirefoxDriver"));
        System.setProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE, "/dev/null");
        FirefoxOptions firefoxOptions = new FirefoxOptions();
        firefoxOptions.setBinary(firefoxBinary);
        driver = new FirefoxDriver(firefoxOptions);

        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

        //create debug folder
        String folderPath = System.getProperty("user.dir") + "/target/debug-log/" + globalSalt;
        log.info("create folder: " + folderPath);
        Utils.createFolder(folderPath);
    }

    @AfterClass
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

    public String getPageTitle() {
        String title = driver.getTitle();
        log.info("title is: " + title);
        return title;
    }

    public static WebDriver getDriver() {
        return driver;
    }

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        MainPage mainPage = openMainPage();
        PrecisionFDAPage precisionFDAPage = CommonActions.loginToFDA(mainPage);

        log.info("check navigation panel is displayed");
        assertTrue(precisionFDAPage.getNavigationPanelWE().isDisplayed());

        log.info("check correct username is displayed");
        assertTrue(precisionFDAPage.getUsernameLink().getText().equals("Automation Test"));
    }

}
