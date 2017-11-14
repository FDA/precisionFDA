package precisionFDA.cases;

import org.apache.log4j.Logger;
import org.assertj.core.api.SoftAssertions;
import org.openqa.selenium.*;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.testng.annotations.*;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.CommonPage;
import precisionFDA.pages.login.LoginPrecisionPage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.staging.LoginStagingPage;
import precisionFDA.pages.staging.MainStagingPage;
import precisionFDA.utils.SettingsProperties;
import precisionFDA.utils.Utils;
import tools.CustomResultListener;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static precisionFDA.data.TestDict.getCaseStatusFailed;
import static precisionFDA.data.TestDict.getCaseStatusPassed;
import static precisionFDA.data.TestRunData.*;
import static precisionFDA.utils.Utils.*;

@Listeners(CustomResultListener.class)
public abstract class AbstractTest {

    private Logger log = Logger.getLogger("INFO");

    protected WebDriver driver;

    SoftAssertions SoftAssert;

    @BeforeClass(alwaysRun = true)
    public void setUp() {
        driver = new DriverFactory().getInstance().getDriver();
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() throws Exception {
        closeBrowser();
    }

    public void closeBrowser() {
        if (driver != null) {
            log.info("closing browser");
            try {
                DriverFactory.getInstance().removeDriver();
            }
            catch (WebDriverException e) {
                //
            }
        }
    }

    @BeforeTest
    public void beforeTest() {
        deleteTempFiles();
        createFolder(getDebugLogFolder());
        createFolder(getDebugLogFolderPath());
    }

    @AfterTest(alwaysRun = true)
    public void afterTest() {
        // moveLogFile("full.print");
        // moveLogFile("error.print");
        // Runtime.getRuntime().exec( "pkill -f firefox" ).waitFor();
        // Runtime.getRuntime().exec( "pkill -f geckodriver" ).waitFor();
    }

    @BeforeMethod(alwaysRun = true)
    public void beforeCase() {
        callBeforeCase();
    }

    @AfterMethod(alwaysRun = true)
    public void afterCase() {
        callAfterCase();
    }

    public void callBeforeCase() {
        SoftAssert = new SoftAssertions();
    }

    public void callAfterCase() {
        if (getFinishedCaseStatus().equals(getCaseStatusPassed())) {
            logAfterCaseData(getCaseStatusPassed(),
                    getFinishedCaseName(),
                    getRunSuiteName(),
                    isGetScreenshotOnPass(),
                    isGetPageSourceOnPass());
        }

        if (getFinishedCaseStatus().equals(getCaseStatusFailed())) {
            logAfterCaseData(getCaseStatusFailed(),
                    getFinishedCaseName(),
                    getRunSuiteName(),
                    isGetScreenshotOnFail(),
                    isGetPageSourceOnFail());
        }
    }

    public void logAfterCaseData(String caseStatus,
                                 String caseName,
                                 String suiteName,
                                 boolean isGetScreenshot,
                                 boolean isGetSource) {

        printLine();
        log.info("-- it was test case [" + caseName + "] from suite [" + suiteName + "] --");
        printLine();
        log.info("--      " + caseStatus.toUpperCase() + "      --");
        printLine();

        String filePathWithNoExt = getDebugLogFolderPath() +
                caseStatus + "_" +
                suiteName + "_" +
                caseName + "_" +
                getRunTimeLocalUniqueValue();

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
        printLine();
    }

    public void moveLogFile(String fileName) {
        String oldPath = getDebugLogFolder() + fileName;
        File file = new File(oldPath);
        String newPath = getDebugLogFolderPath() + fileName;
        file.renameTo(new File(newPath));
        file.delete();
    }

    public void printTestHeader(final String text) {
        printLine();
        log.info(text);
        printLine();
    }

    public void printLine() {
        log.info("----------------------------------------------------------------");
    }

    public String getPageTitle() {
        String title = driver.getTitle();
        return title;
    }

    public OverviewPage openOverviewPage() {
        log.info("open Overview page");
        String url = SettingsProperties.getProperty("precisionFdaURL");
        driver.get(url);
        return new OverviewPage(driver);
    }

    public LoginPrecisionPage openLoginPrecisionPage(UserProfile user) {
        log.info("open Precision FDA Login page");

        String loginPageURL = SettingsProperties.getProperty("loginPrecisionPageURL");
        driver.manage().deleteAllCookies();
        loginPageURL = loginPageURL.replace("{basicAuthUser}", user.getBasicAuthUsername())
                .replace("{basicAuthPassword}", user.getBasicAuthPassword());
        driver.get(loginPageURL);
        return new LoginPrecisionPage(driver);
    }

    public LoginStagingPage logoutFromAll() {
        log.info("total logout from Staging");
        MainStagingPage mainStagingPage = openStaging();
        LoginStagingPage loginStagingPage = mainStagingPage.logout();
        return loginStagingPage;
    }

    public MainStagingPage openStaging() {
        log.info("open Staging");
        String stagingURL = SettingsProperties.getProperty("stagingURL");
        driver.get(stagingURL);
        return new MainStagingPage(driver);
    }

    public CommonPage getCommonPage() {
        return new CommonPage(driver);
    }

    public void alertAccept(int timeOutInSeconds, int sleepInMillis) {
        Wait<WebDriver> fluentWait = new FluentWait<WebDriver>(driver)
                .withTimeout(timeOutInSeconds, SECONDS)
                .pollingEvery(sleepInMillis, MILLISECONDS)
                .ignoring(TimeoutException.class);
        Alert alert = fluentWait.until(alertIsPresent());
        if (alert != null) {
            alert.accept();
        }
    }

    public void sleep(final long msec) {
        try {
            Thread.sleep(msec);
        } catch (final InterruptedException e) {
            //
        }
    }

    public boolean isDockerFileDownloaded() {
        return isFileDownloaded(getDockerFileName());
    }

    public boolean isFileDownloaded(String fileName) {
        boolean isDownloaded = false;
        String downloadsPath = getPathToDownloadsFolder();
        File file = new File(downloadsPath + fileName);
        if (file.exists()) {
            isDownloaded = true;
        }
        return isDownloaded;
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
            firefoxOptions.addPreference("browser.download.folderList", 2);
            firefoxOptions.addPreference("browser.download.manager.showWhenStarting", false);
            firefoxOptions.addPreference("browser.download.dir", getPathToDownloadsFolder());
            firefoxOptions.addPreference("browser.helperApps.neverAsk.saveToDisk", "text/plain, image/png");
            firefoxOptions.addPreference("browser.download.manager.focusWhenStarting", false);
            firefoxOptions.addPreference("browser.download.manager.useWindow", false);
            firefoxOptions.addPreference("browser.download.manager.showAlertOnComplete", false);
            firefoxOptions.addPreference("browser.download.manager.closeWhenDone", false);

            WebDriver initDriver = new FirefoxDriver(firefoxOptions);
            initDriver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
            return initDriver;
        }
    }

}
