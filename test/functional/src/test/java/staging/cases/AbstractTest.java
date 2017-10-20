package staging.cases;

import org.apache.http.conn.HttpHostConnectException;
import org.apache.log4j.Logger;
import org.openqa.selenium.*;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.testng.annotations.*;
import staging.data.TestConstants;
import staging.data.TestVariables;
import staging.locators.CommonLocators;
import staging.model.Users;
import staging.pages.StartPage;
import staging.pages.CommonPage;
import staging.pages.login.GrantAccessLoginPage;
import staging.pages.login.LoginPage;
import staging.utils.SettingsProperties;
import staging.utils.Utils;
import tools.TestResultListener;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static staging.data.TestVariables.*;
import static staging.utils.Utils.*;

@Listeners(TestResultListener.class)
public abstract class AbstractTest {

    private Logger log = Logger.getLogger("INFO");

    protected WebDriver driver;

    public WebDriver initiateBrowser() {
        String currentDirectory = System.getProperty("user.dir");
        FirefoxBinary firefoxBinary = new FirefoxBinary();
        if (SettingsProperties.getProperty("headlessMode").equalsIgnoreCase("true")) {
            firefoxBinary.addCommandLineOptions("--headless");
        }
        System.setProperty("webdriver.gecko.driver", currentDirectory + SettingsProperties.getProperty("pathToFirefoxDriver"));
        System.setProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE, "/dev/null");

        FirefoxOptions firefoxOptions = new FirefoxOptions();
        firefoxOptions.setBinary(firefoxBinary);
        WebDriver initDriver = new FirefoxDriver(firefoxOptions);
        initDriver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
        return initDriver;
    }

    @BeforeClass(alwaysRun = true)
    public void setUp() {
        String suiteName = this.getClass().getName().replace("staging.cases.", "");
        setRunSuiteName(suiteName);
        driver = new DriverFactory().getInstance().getDriver();
        // driver = initiateBrowser();
    }

    public void reopenBrowser() {
        log.info("reopen browser");
        closeBrowser();
        driver = new DriverFactory().getInstance().getDriver();
        // driver = initiateBrowser();
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() throws Exception {
        closeBrowser();
    }

    public void closeBrowser() {
        if (driver != null) {
            log.info("closing browser");
            try {
                // driver.quit();
                DriverFactory.getInstance().removeDriver();
            }
            catch (WebDriverException e) {
                //
            }
        }
    }

    @BeforeTest
    public void beforeTest() {
        createFolder(getDebugLogFolder());
        createFolder(getDebugLogFolderPath());
        log.info("folder created: " + getDebugLogFolderPath());
    }

    @AfterTest(alwaysRun = true)
    public void afterTest() {
        // moveLogFile("full.log");
        // moveLogFile("error.log");
        // Runtime.getRuntime().exec( "pkill -f firefox" ).waitFor();
        // Runtime.getRuntime().exec( "pkill -f geckodriver" ).waitFor();
    }

    @AfterMethod(alwaysRun = true)
    public void afterCase() {
        if (getFinishedCaseStatus().equals(TestConstants.CASE_STATUS_PASSED)) {
            casePostActions(TestConstants.CASE_STATUS_PASSED, getFinishedCaseName(), isGetScreenshotOnPass(), isGetPageSourceOnPass());
        }

        if (getFinishedCaseStatus().equals(TestConstants.CASE_STATUS_FAILED)) {
            casePostActions(TestConstants.CASE_STATUS_FAILED, getFinishedCaseName(), isGetScreenshotOnFail(), isGetPageSourceOnFail());
        }
    }

    public void casePostActions(String caseStatus, String caseName, boolean isGetScreenshot, boolean isGetSource) {

        Logger log = Logger.getLogger("INFO");

        log.info("----------------------");
        log.info("-- it was test case: " + caseName + " --");
        log.info("----------------------");
        log.info("--      " + caseStatus.toUpperCase() + "      --");
        log.info("----------------------");

        String filePathWithNoExt = getDebugLogFolderPath() +
                caseStatus + "_" +
                getRunSuiteName() + "_" +
                caseName + "_" +
                getRunTimeUniqueValue();

        if (isGetScreenshot) {
            takeScreenshot(filePathWithNoExt + ".png", driver);
            log.info("screenshot is here: " + filePathWithNoExt + ".png");
        }

        if (isGetSource) {
            String source = Utils.getPageSource(driver);
            try {
                createFile(filePathWithNoExt + ".txt", source);
                log.info("page source is here: " + filePathWithNoExt + ".txt");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        log.info("----------------------");
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
        return title;
    }

    public boolean isPageTitleCorrect(String expectedTitle) {
        String actualTitle = getPageTitle();
        log.info("actual page title is: " + actualTitle);
        if (actualTitle.contains(expectedTitle)) {
            return true;
        }
        else {
            log.info("but it does not contain expected string: " + expectedTitle);
            return false;
        }
    }

    public CommonPage openCommonPage() {
        driver.findElement(By.xpath(CommonLocators.MAIN_LOGO)).click();
        return new CommonPage(driver);
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

    public void alertAccept(int timeOutInSeconds, int sleepInMillis) {
        Wait<WebDriver> fluentWait = new FluentWait<WebDriver>(driver)
                .withTimeout(timeOutInSeconds, SECONDS)
                .pollingEvery(sleepInMillis, MILLISECONDS)
                .ignoring(TimeoutException.class);
        Alert alert = fluentWait.until(ExpectedConditions.alertIsPresent());
        if (alert != null) {
            alert.accept();
        }
    }

    // ----- DriverFactory -----

    public static class DriverFactory {

        private DriverFactory() {
            //...
        }
        private static DriverFactory instance = new DriverFactory();

        public static DriverFactory getInstance() {
            return instance;
        }

        ThreadLocal<WebDriver> threadDriver = new ThreadLocal<WebDriver>() {
            @Override
            protected WebDriver initialValue() {
                return initiateFirefoxBrowser();
            }
        };

        public WebDriver getDriver() {
            return threadDriver.get();
        }

        public void removeDriver() {
            threadDriver.get().quit();
            threadDriver.remove();
        }

        public WebDriver initiateFirefoxBrowser() {
            String currentDirectory = System.getProperty("user.dir");
            FirefoxBinary firefoxBinary = new FirefoxBinary();
            if (SettingsProperties.getProperty("headlessMode").equalsIgnoreCase("true")) {
                firefoxBinary.addCommandLineOptions("--headless");
            }
            System.setProperty("webdriver.gecko.driver", currentDirectory + SettingsProperties.getProperty("pathToFirefoxDriver"));
            System.setProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE, "/dev/null");

            FirefoxOptions firefoxOptions = new FirefoxOptions();
            firefoxOptions.setBinary(firefoxBinary);
            WebDriver initDriver = new FirefoxDriver(firefoxOptions);
            initDriver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
            return initDriver;
        }
    }

}
