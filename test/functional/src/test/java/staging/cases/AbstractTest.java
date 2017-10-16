package staging.cases;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.*;
import staging.locators.CommonLocators;
import staging.model.Users;
import staging.pages.StartPage;
import staging.pages.CommonPage;
import staging.pages.login.GrantAccessLoginPage;
import staging.pages.login.LoginPage;
import staging.utils.SettingsProperties;
import tools.TestResultListener;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static org.testng.Assert.assertTrue;
import static staging.utils.Utils.createFile;
import static staging.utils.Utils.createFolder;
import static staging.utils.Utils.getCurrentDateSalt;

@Listeners(TestResultListener.class)
public abstract class AbstractTest {

    protected static WebDriver driver;
    private Logger log = Logger.getLogger("INFO");

    public static final String globalSalt = getCurrentDateSalt();

    public static String testSuiteName;

    public static String getDebugLogFolder() {
        return System.getProperty("user.dir") + "/target/debug-log/";
    }

    public static String getDebugLogFolderPath() {
        return getDebugLogFolder() + testSuiteName + "_" + globalSalt + "/";
    }

    @BeforeTest
    public void setUp() throws Exception {

        //initiate global params
        testSuiteName = this.getClass().getName().replace("staging.cases.", "");

        runBrowser();

        //create debug folder
        createFolder(getDebugLogFolder());
        createFolder(getDebugLogFolderPath());
        log.info("folder created: " + getDebugLogFolderPath());
    }

    public void runBrowser() {
        String currentDirectory = System.getProperty("user.dir");
        FirefoxBinary firefoxBinary = new FirefoxBinary();
        if (SettingsProperties.getProperty("headlessMode").equalsIgnoreCase("true")) {
            firefoxBinary.addCommandLineOptions("--headless");
        }
        System.setProperty("webdriver.gecko.driver", currentDirectory + SettingsProperties.getProperty("pathToFirefoxDriver"));
        System.setProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE, "/dev/null");
        FirefoxOptions firefoxOptions = new FirefoxOptions();
        firefoxOptions.setBinary(firefoxBinary);
        driver = new FirefoxDriver(firefoxOptions);
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
    }

    public void reopenBrowser() {
        log.info("reopen browser");
        closeBrowser();
        runBrowser();
    }

    @AfterTest
    public void tearDown() throws Exception {
        closeBrowser();
        //move log files
        moveLogFile("full.log");
        moveLogFile("error.log");
    }

    public void closeBrowser() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        log.info("check navigation panel is displayed");
        assertTrue(commonPage.isNavigationPanelDisplayed());

        log.info("check correct username is displayed");
        assertTrue(commonPage.isCorrectUserNameDisplayed(user));
    }

    @Test
    public StartPage openStartPage() {
        driver.get(SettingsProperties.getProperty("startURL"));
        return new StartPage(driver);
    }

    public void moveLogFile(String fileName) {
        String oldPath = getDebugLogFolder() + fileName;
        File file = new File(oldPath);
        String newPath = getDebugLogFolderPath() + fileName;
        file.renameTo(new File(newPath));
        file.delete();
    }

    public void logTestHeader(final String text) {
        int aim = 64;
        String line = "";
        log.info("");
        for (int i = 0; i <= aim; i ++) {
            line = line + "-";
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

    public CommonPage openCommonPage() {
        driver.findElement(By.xpath(CommonLocators.MAIN_LOGO)).click();
        return new CommonPage(driver);
    }

    public static void takeScreenshot(String filePath) {
        File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        try {
            org.apache.commons.io.FileUtils.copyFile(scrFile, new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getPageSource() {
        return driver.getPageSource();
    }

    public static void casePostActions(String status, String caseName, String getScreenshot, String getSource) {

        Logger log = Logger.getLogger("POST");

        String currentSalt = getCurrentDateSalt();

        String path = getDebugLogFolderPath() + status + "_" + caseName + "_" + currentSalt;

        if (getScreenshot.equalsIgnoreCase("true")) {
            //take screenshot
            takeScreenshot(path + ".png");
            log.info("screenshot is here: " + path + ".png");
        }

        if (getSource.equalsIgnoreCase("true")) {
            //save page source
            String source = getPageSource();
            try {
                createFile(path + ".txt", source);
                log.info("page source is here: " + path + ".txt");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public LoginPage openLoginPage(String basicAuthUser, String basicAuthPassword) {
        log.info("open Login page");

        String url = "https://" + basicAuthUser +
                ":" + basicAuthPassword + "" +
                "@staging.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=" +
                "https%3A%2F%2F52.90.134.199%2Freturn_from_login&client_id=precision_fda";

        driver.get(url);
        return new LoginPage(driver);
    }

    public CommonPage correctLoginToFDA(Users user) {
        LoginPage loginPage = openLoginPage(user.getBasicAuthUsername(), user.getBasicAuthPassword());
        GrantAccessLoginPage grantAccessLoginPage = loginPage.correctLoginToPrecisionFDA(user.getApplUsername(), user.getApplPassword());
        CommonPage commonPage = grantAccessLoginPage.grantAccess();
        return commonPage;
    }

    public LoginPage wrongLoginToFDA(Users user) {
        LoginPage loginPage = openLoginPage(user.getBasicAuthUsername(), user.getBasicAuthPassword());
        loginPage = loginPage.wrongLoginToPrecisionFDA(user.getApplUsername(), user.getApplPassword());
        return loginPage;
    }

}
