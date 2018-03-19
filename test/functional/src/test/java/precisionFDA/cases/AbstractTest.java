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
import precisionFDA.pages.AnyPage;
import precisionFDA.pages.NavPanelPage;
import precisionFDA.pages.StartPage;
import precisionFDA.pages.about.AboutPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.comps.CompsPage;
import precisionFDA.pages.discs.DiscsPage;
import precisionFDA.pages.docs.DocsPage;
import precisionFDA.pages.experts.ExpertsPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.guidelines.GuidelinesPage;
import precisionFDA.pages.licenses.LicensesPage;
import precisionFDA.pages.login.LoginPrecisionPage;
import precisionFDA.pages.notes.NotesPage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.platform.PlatformPage;
import precisionFDA.pages.profile.ProfilePage;
import precisionFDA.pages.profile.PublicProfilePage;
import precisionFDA.pages.spaces.SpacesPage;
import precisionFDA.pages.platform.MainPlatformPage;
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

    SoftAssertions SoftAssert;

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        // driver = DriverFactory.getInstance().getDriver();
        new DriverFactory().getInstance().getDriver();
        sleep(5000);
        if (("" + getDriver()).toLowerCase().contains("null")) {
            sleep(10000);
        }
        log.info("DRIVER = " + getDriver());
        getDriver().manage().window().setSize(new Dimension(1920, 1080));
    }

    public WebDriver getDriver() {
        return DriverFactory.getInstance().getDriver();
    }

    @AfterClass(alwaysRun = true)
    public void afterClass() {
        closeBrowser();
        sleep(5000);
    }

    public void closeBrowser() {
        if (getDriver() != null) {
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
        System.setProperty("org.uncommons.reportng.escape-output", "false");
        deleteTempFiles();
        createFolder(getDebugLogCommonFolderPath());
        createFolder(getCurrentRunLogFolderPath());
        String relativeFullLogFilePath = "../../" + getDebugLogCommonFolderName() + "full.log";
        Reporter.log("<a target='_blank' href='" + relativeFullLogFilePath + "'>full log</a><br><br>");
        setEnv();
        String displayedURL = getPfdaStartUrl();
        displayedURL = displayedURL.replace("https://", "").replace("http://", "");
        log.info("=== Environment is: "
                + displayedURL.substring(0, 7)
                + "..."
                + " ===");
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        //
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

            String source = getPageSource(getDriver());
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
                loggerLevel = getDictInfo();
            }
            String fileName = fileNameWithNoExt + ".png";
            String message = "taking screenshot when " + finishedCaseName + " case is finished";
            Utils.reportScreenshot(message, fileName, loggerLevel, getDriver());
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
        String title = getDriver().getTitle();
        log.info("actual page title is: " + title);
        return title;
    }

    public OverviewPage openOverviewPage() {
        log.info("open Overview page");
        String url = getPfdaStartUrl();
        getDriver().get(url);
        return new OverviewPage(getDriver());
    }

    public StartPage openStartPage() {
        log.info("open Start page");
        String url = getPfdaStartUrl();
        getDriver().get(url);
        return new StartPage(getDriver());
    }

    public FilesPage openFilesPage() {
        log.info("open Files page");
        getCommonPage().openFilesPage();
        return new FilesPage(getDriver());
    }

    public AppsPage openAppsPage() {
        log.info("open Apps page");
        getCommonPage().openAppsPage();
        return new AppsPage(getDriver());
    }

    public SpacesPage openSpacesPage() {
        log.info("open Spaces page");
        getCommonPage().openSpacesPage();
        return new SpacesPage(getDriver());
    }

    public ChallsPage openChallsPage() {
        log.info("open Challenges page");
        getCommonPage().openChallsPage();
        return new ChallsPage(getDriver());
    }

    public NotesPage openNotesPage() {
        log.info("open Notes page");
        getCommonPage().openNotesPage();
        return new NotesPage(getDriver());
    }

    public CompsPage openCompsPage() {
        log.info("open Comparisons page");
        getCommonPage().openCompsPage();
        return new CompsPage(getDriver());
    }

    public ExpertsPage openExpertsPage() {
        log.info("open Experts page");
        getCommonPage().openExpertsPage();
        return new ExpertsPage(getDriver());
    }

    public DiscsPage openDiscsPage() {
        log.info("open Discussions page");
        getCommonPage().openDiscsPage();
        return new DiscsPage(getDriver());
    }

    public ProfilePage openProfilePage() {
        log.info("open Profile page");
        getCommonPage().openProfilePage();
        return new ProfilePage(getDriver());
    }

    public PublicProfilePage openPublicProfilePage() {
        log.info("open Public Profile page");
        getCommonPage().openPublicProfilePage();
        return new PublicProfilePage(getDriver());
    }

    public LicensesPage openLicensePage() {
        log.info("open License page");
        getCommonPage().openLicensePage();
        return new LicensesPage(getDriver());
    }

    public AboutPage openAboutPage() {
        log.info("open About page");
        getCommonPage().openAboutPage();
        return new AboutPage(getDriver());
    }

    public GuidelinesPage openGuidelinesPage() {
        log.info("open Guidelines page");
        getCommonPage().openGuidelinesPage();
        return new GuidelinesPage(getDriver());
    }

    public DocsPage openDocsPage() {
        log.info("open Docs page");
        getCommonPage().openDocsPage();
        return new DocsPage(getDriver());
    }

    public LoginPrecisionPage openLoginPrecisionPage() {
        log.info("open Precision FDA Login page");
        String loginPageURL = getPfdaLoginPageUrl();
        // log.info("PFDA login page: " + loginPageURL);
        getDriver().manage().deleteAllCookies();
        getDriver().get(loginPageURL);
        return new LoginPrecisionPage(getDriver());
    }

    public void logoutFromPlatform() {
        log.info("logout from platform");
        PlatformPage platformPage = openPlatform();
        if (platformPage.isLoginPasswordInputDisplayed()) {
            log.info("already logged out");
        }
        else if (platformPage.isProjectsLinkDisplayed()) {
            log.info("logged in now; will log out");
            getMainPlatformPage().logout();
        }
        else {
            log.error("unknown page: should be platform page");
        }
    }

    public PlatformPage openPlatform() {
        log.info("open Platform");
        String platformLoginPage = getPlatformLoginPageUrl();
        // log.info("platform login page: " + platformLoginPage);
        getDriver().get(platformLoginPage);
        return new PlatformPage(getDriver());
    }

    public NavPanelPage getCommonPage() {
        return new NavPanelPage(getDriver());
    }

    public AnyPage getAnyPage() {
        return new AnyPage(getDriver());
    }

    public MainPlatformPage getMainPlatformPage() {
        return new MainPlatformPage(getDriver());
    }

    public DocsPage getDocsPage() {
        return new DocsPage(getDriver());
    }

    public void alertAccept(int timeOutInSeconds, int sleepInMillis) {
        Wait<WebDriver> fluentWait = new FluentWait<WebDriver>(getDriver())
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
            String headlessModeCmdStr = "" + System.getProperty("headless");

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