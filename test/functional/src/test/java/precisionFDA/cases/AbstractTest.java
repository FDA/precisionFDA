package precisionFDA.cases;

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
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.annotations.*;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.CommonPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.docs.DocsPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.login.LoginPrecisionPage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.spaces.SpacesPage;
import precisionFDA.pages.staging.LoginStagingPage;
import precisionFDA.pages.staging.MainStagingPage;
import precisionFDA.utils.Utils;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static precisionFDA.data.TestDict.*;
import static precisionFDA.utils.TestRunConfig.*;
import static precisionFDA.data.TestCommonData.*;
import static precisionFDA.utils.TestRunConfig.isScreenshotFeatureOn;
import static precisionFDA.utils.Utils.*;

public abstract class AbstractTest {

    private Logger log = Logger.getLogger("");

    protected WebDriver driver;

    SoftAssertions SoftAssert;

    @BeforeClass(alwaysRun = true)
    public void setUp() {
        System.setProperty("org.uncommons.reportng.escape-output", "false");
        driver = new DriverFactory().getInstance().getDriver();
        driver.manage().window().setSize(new Dimension(1920, 1080));
        String env = getPfdaOverviewURL();
        env = env.replace("https://", "").replace("http://", "");
        log.info("=== Environment is: "
                + env.substring(0, 7)
                + "..."
                + " ===");
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() {
        closeBrowser();
        sleep(2000);
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
        createFolder(getDebugLogCommonFolderPath());
        createFolder(getCurrentRunLogFolderPath());
        String relativeFullLogFilePath = "../../" + getDebugLogCommonFolderName() + "full.log";
        Reporter.log("<a target='_blank' href='" + relativeFullLogFilePath + "'>full log</a><br><br>");
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
    public void afterTestCase(ITestResult result) {
        boolean isGetScreenshot;
        boolean isGetSource;
        String caseStatus;

        String finishedCaseName = result.getMethod().getMethodName();
        String runTimeSuiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        boolean isCaseSuccess = result.isSuccess();

        if (isCaseSuccess) {
            isGetScreenshot = isGetScreenshotOnPass();
            isGetSource = isGetPageSourceOnPass();
            caseStatus = getDictPassed();
        }
        else {
            isGetScreenshot = isGetScreenshotOnFail();
            isGetSource = isGetPageSourceOnFail();
            caseStatus = getDictFailed();
        }

        printLine();
        log.info("-- it was test case [" + finishedCaseName + "] from suite [" + runTimeSuiteName + "] --");
        printLine();
        log.info("--      " + caseStatus.toUpperCase() + "      --");
        printLine();

        //-------------

        String fileNameWithNoExt =
                caseStatus + "_" +
                runTimeSuiteName + "_" +
                finishedCaseName + "_" +
                getRunTimeLocalUniqueValue();

        //-------------

        if (isGetSource) {

            String filePathWithNoExt = getCurrentRunLogFolderPath() + fileNameWithNoExt;

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
            if (isCaseSuccess) {
                loggerLevel = getDictInfo();
            }
            else {
                loggerLevel = getDictError();
            }
            String fileName = fileNameWithNoExt + ".png";
            String message = "taking screenshot when " + finishedCaseName + " case is finished";
            Utils.reportScreenshot(message, fileName, loggerLevel, driver);
            String relativeFilePath = "../../" + getDebugLogCommonFolderName() + getCurrentRunLogFolderName() + fileName;
            Reporter.log(runTimeSuiteName + "." + finishedCaseName + ": <a target='_blank' href='"
                    + relativeFilePath + "'>" + fileName + "</a><br>");
        }

        //---------------

        printLine();
    }

    public void moveLogFileToCurrentLogFolder(String fileName) {
        String oldPath = getDebugLogCommonFolderPath() + fileName;
        File file = new File(oldPath);
        String newPath = getCurrentRunLogFolderPath() + fileName;
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
        String url = getPfdaOverviewURL();
        driver.get(url);
        return new OverviewPage(driver);
    }

    public FilesPage openFilesPage() {
        log.info("open Files page");
        String url = getPfdaFilesURL();
        driver.get(url);
        return new FilesPage(driver);
    }

    public AppsPage openAppsPage() {
        log.info("open Apps page");
        getCommonPage().openAppsPage();
        return new AppsPage(driver);
    }

    public SpacesPage openSpacesPage() {
        log.info("open Spaces page");
        getCommonPage().openSpacesPage();
        return new SpacesPage(driver);
    }

    public ChallsPage openChallsPage() {
        log.info("open Challenges page");
        getCommonPage().openChallsPage();
        return new ChallsPage(driver);
    }

    public LoginPrecisionPage openLoginPrecisionPage(UserProfile user) {
        log.info("open Precision FDA Login page");
        String loginPageURL = getLoginPfdaPageURL();
        driver.manage().deleteAllCookies();
        loginPageURL = loginPageURL
                .replace("_basicAuthUser_", user.getBasicAuthUsername())
                .replace("_basicAuthPassword_", user.getBasicAuthPassword())
                .replace("_pfdaStartUrl_", getPfdaOverviewURL());
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
        String stagingURL = getStagingURL();
        driver.get(stagingURL);
        return new MainStagingPage(driver);
    }

    public CommonPage getCommonPage() {
        return new CommonPage(driver);
    }

    public DocsPage getDocsPage() {
        return new DocsPage(driver);
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

            Boolean headlessMode;
            String headlessModeCmdStr = "" + System.getProperty("headlessMode");

            if (!headlessModeCmdStr.equalsIgnoreCase("null")) {
                headlessMode = Boolean.valueOf(headlessModeCmdStr);
            }
            else {
                headlessMode = getHeadlessModeConfig();
            }

            if (Boolean.valueOf(headlessMode)) {
                firefoxBinary.addCommandLineOptions("--headless");
            }

            System.setProperty("webdriver.gecko.driver", currentDirectory + getPathToFirefoxDriver());
            System.setProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE, "/dev/null");

            FirefoxOptions firefoxOptions = new FirefoxOptions();

            firefoxOptions.setBinary(firefoxBinary);
            firefoxOptions.addPreference("browser.download.folderList", 2);
            firefoxOptions.addPreference("browser.download.manager.showWhenStarting", false);
            firefoxOptions.addPreference("browser.download.dir", getPathToDownloadsFolder());
            firefoxOptions.addPreference("browser.helperApps.neverAsk.saveToDisk",
                    "text/plain, image/png, application/zlib, application/x-gzip, application/x-compressed, text/csv, " +
                            "application/x-gtar, multipart/x-gzip, application/tgz, " +
                            "application/gnutar, application/x-tar, application/gzip, application/tar+gzip, application/octet-stream");
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