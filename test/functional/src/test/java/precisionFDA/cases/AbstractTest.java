package precisionFDA.cases;

import com.epam.reportportal.message.ReportPortalMessage;
import org.apache.log4j.Logger;
import org.assertj.core.api.SoftAssertions;
import org.openqa.selenium.*;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
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
import tools.CustomResultListener;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static precisionFDA.data.TestDict.*;
import static precisionFDA.data.TestRunData.*;
import static precisionFDA.data.TestRunData.getFinishedCaseName;
import static precisionFDA.data.TestRunData.getFinishedCaseStatus;
import static precisionFDA.utils.Utils.*;

@Listeners( { CustomResultListener.class } )
public abstract class AbstractTest {

    private Logger log = Logger.getLogger(getDictInfo().toUpperCase());

    protected WebDriver driver;

    SoftAssertions SoftAssert;

    @BeforeClass(alwaysRun = true)
    public void setUp() {
        driver = new DriverFactory().getInstance().getDriver();
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() throws Exception {
        closeBrowser();
        sleep(5000);
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

    @BeforeSuite(alwaysRun = true)
    public void beforeSuite() {
        deleteTempFiles();
        createFolder(getDebugLogFolder());
        createFolder(getDebugLogFolderPath());
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        // moveLogFileToCurrentLogFolder("full.print");
        // moveLogFileToCurrentLogFolder("error.print");
        // try {
        //     Runtime.getRuntime().exec( "pkill -f firefox" ).waitFor();
        // } catch (InterruptedException e) {
        //    e.printStackTrace();
        // } catch (IOException e) {
        //     e.printStackTrace();
        // }
        // try {
        //     Runtime.getRuntime().exec( "pkill -f geckodriver" ).waitFor();
        // } catch (InterruptedException e) {
        //     e.printStackTrace();
        // } catch (IOException e) {
        //     e.printStackTrace();
        // }
    }

    @BeforeMethod(alwaysRun = true)
    public void beforeTestCase() {
        SoftAssert = new SoftAssertions();
    }

    @AfterMethod(alwaysRun = true)
    public void afterTestCase() {
        boolean isGetScreenshot = false;
        boolean isGetSource = false;
        if (getFinishedCaseStatus().equalsIgnoreCase(getDictPassed())) {
            isGetScreenshot = isGetScreenshotOnPass();
            isGetSource = isGetPageSourceOnPass();
        }
        else if (getFinishedCaseStatus().equalsIgnoreCase(getDictFailed())) {
            isGetScreenshot = isGetScreenshotOnFail();
            isGetSource = isGetPageSourceOnFail();
        }

        //-------------

        String fileNameWithNoExt = getFinishedCaseStatus() + "_" +
                getRunSuiteName() + "_" +
                getFinishedCaseName() + "_" +
                getRunTimeLocalUniqueValue();

        //-------------

        if (isGetSource) {

            String filePathWithNoExt = getDebugLogFolderPath() + fileNameWithNoExt;

            String source = getPageSource(driver);
            try {
                createFile(filePathWithNoExt + ".txt", source);
                log.info("page source is here: " + filePathWithNoExt + ".txt");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        //---------------

        if (isGetScreenshot && isScreenshotFeatureOn()) {

            String loggerLevel;
            if (getFinishedCaseStatus().equalsIgnoreCase(getDictPassed())) {
                loggerLevel = getDictInfo();
            }
            else {
                loggerLevel = getDictError();
            }

            final Logger log = Logger.getLogger(loggerLevel.toUpperCase());

            String filePath = getDebugLogFolderPath() + fileNameWithNoExt + ".png";
            String message = loggerLevel.toUpperCase() + ": screenshot when " + getFinishedCaseName() + " test case is finished | Please see screenshot ==>";
            takeScreenshot(filePath, driver);
            try {
                ReportPortalMessage rpMessage = new ReportPortalMessage(new File(filePath), message);
                if (loggerLevel.equalsIgnoreCase(getDictError())) {
                    log.error(rpMessage);
                }
                else {
                    log.info(rpMessage);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

        //---------------

        printLine();
    }

    public void moveLogFileToCurrentLogFolder(String fileName) {
        String oldPath = getDebugLogFolder() + fileName;
        File file = new File(oldPath);
        String newPath = getDebugLogFolderPath() + fileName;
        file.renameTo(new File(newPath));
        file.delete();
    }

    public String getPageTitle() {
        String title = driver.getTitle();
        log.info("actual page title is: " + title);
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
        mainStagingPage.logout();
        return new LoginStagingPage(driver);
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

            LoggingPreferences logs = new LoggingPreferences();
            logs.enable(LogType.BROWSER, Level.SEVERE);

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
