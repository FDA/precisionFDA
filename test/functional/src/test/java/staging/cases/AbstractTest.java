package staging.cases;

import org.apache.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.*;
import staging.pages.CommonPage;
import staging.pages.MainPage;
import staging.pages.OpenMainPage;
import staging.pages.PrecisionFDAPage;
import staging.utils.SettingsProperties;
import tools.Addons;
import tools.TestResultListener;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.testng.Assert.assertTrue;

@Listeners(TestResultListener.class)
public abstract class AbstractTest {

    protected static WebDriver driver;
    private final Logger log = Logger.getLogger("");

    public static final String globalSalt = getCurrentDateSalt();

    @BeforeTest
    public void setUp() throws Exception {
        log.info("setting browser");

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
        String folderPath = currentDirectory + "/target/debug-log";
        createFolder(folderPath);
        folderPath = folderPath + "/" + globalSalt;
        createFolder(folderPath);
        log.info("folder created: " + folderPath);
    }

    @AfterTest
    public void tearDown() throws Exception {
        if (driver != null) {
            driver.quit();
        }
        //move log files
        moveFile("full.log");
        moveFile("error.log");

    }

    public void moveFile(String fileName) {
        String oldPath = System.getProperty("user.dir") + "/target/debug-log/" + fileName;
        File file = new File(oldPath);
        String newPath = System.getProperty("user.dir") + "/target/debug-log/" + globalSalt + "/" + fileName;
        file.renameTo(new File(newPath));
        file.delete();
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

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        MainPage mainPage = openMainPage();
        PrecisionFDAPage precisionFDAPage = Addons.loginToFDA(mainPage);

        log.info("check navigation panel is displayed");
        assertTrue(precisionFDAPage.getNavigationPanelWE().isDisplayed());

        log.info("check correct username is displayed");
        assertTrue(precisionFDAPage.getUsernameLink().getText().equals("Automation Test"));
    }

    public PrecisionFDAPage openPrecisionFDAPage() {
        CommonPage commonPage = new CommonPage(driver);
        PrecisionFDAPage precisionFDAPage = commonPage.openPrecisionFDAPage();
        return precisionFDAPage;
    }

    public static void takeScreenshot(String filePath) {
        File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        try {
            org.apache.commons.io.FileUtils.copyFile(scrFile, new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void createFolder(String folderPath) {
        File file = new File(folderPath);
        file.mkdir();
    }

    public static void createFile(String folderPath, String content) throws IOException {
        File file = new File(folderPath);
        file.createNewFile();
        FileWriter fw = new FileWriter(file.getAbsoluteFile());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(content);
        bw.close();
    }

    public static String getCurrentDateSalt() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyddMM_HHmmssS");
        String salt = dateFormat.format(d);
        return salt;
    }

    public static String getPageSource() {
        return driver.getPageSource();
    }

}
