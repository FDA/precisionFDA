package staging.cases;

import org.apache.log4j.Logger;
import org.assertj.core.api.SoftAssertions;
import org.openqa.selenium.*;

import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.testng.annotations.*;
import staging.model.User;
import staging.pages.CommonPage;
import staging.pages.login.LoginPage;
import staging.utils.SettingsProperties;
import staging.utils.Utils;
import tools.CustomResultListener;

import java.io.File;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static staging.data.TestDict.getCaseStatusFailed;
import static staging.data.TestDict.getCaseStatusPassed;
import static staging.data.TestRunData.*;
import static staging.utils.Utils.*;

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
                try {
                    driver.switchTo().alert();
                    alertAccept(1, 100);
                }
                catch (NoAlertPresentException Ex)
                { //
                }
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
    }

    @AfterTest(alwaysRun = true)
    public void afterTest() {
        deleteTempFiles();
        // moveLogFile("full.print");
        // moveLogFile("error.print");
        // Runtime.getRuntime().exec( "pkill -f firefox" ).waitFor();
        // Runtime.getRuntime().exec( "pkill -f geckodriver" ).waitFor();
    }

    @BeforeMethod(alwaysRun = true)
    public void beforeCase() {
        SoftAssert = new SoftAssertions();
    }

    @AfterMethod(alwaysRun = true)
    public void afterCase() {

        if (getFinishedCaseStatus().equals(getCaseStatusPassed())) {
            casePostActions(getCaseStatusPassed(),
                    getFinishedCaseName(),
                    getRunSuiteName(),
                    isGetScreenshotOnPass(),
                    isGetPageSourceOnPass());
        }

        if (getFinishedCaseStatus().equals(getCaseStatusFailed())) {
            casePostActions(getCaseStatusFailed(),
                    getFinishedCaseName(),
                    getRunSuiteName(),
                    isGetScreenshotOnFail(),
                    isGetPageSourceOnFail());
        }
    }

    public void casePostActions(String caseStatus,
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

    public LoginPage openLoginPage(User user) {
        log.info("open Login page");

        String loginPageURL = SettingsProperties.getProperty("loginPageURL");
        driver.manage().deleteAllCookies();
        sleep(1000);
        Set<Cookie> allCookies = driver.manage().getCookies();
        for (Cookie cookie : allCookies) {
            driver.manage().deleteCookieNamed(cookie.getName());
        }
        sleep(1000);

        loginPageURL = loginPageURL.replace("{basicAuthUser}", user.getBasicAuthUsername())
                .replace("{basicAuthPassword}", user.getBasicAuthPassword());
        driver.get(loginPageURL);
        return new LoginPage(driver);
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
