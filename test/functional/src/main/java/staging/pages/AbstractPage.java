package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.loader.HtmlElementLoader;

import java.util.List;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.fail;

public abstract class AbstractPage {

    private final WebDriver driver;

    private final Logger log = Logger.getLogger(this.getClass());

    private static final int DEFAULT_TIMEOUT = 10;

    public static String currentRunTime;

    public AbstractPage(final WebDriver driver) {
        HtmlElementLoader.populatePageObject(this, driver);
        this.driver = driver;
    }

    // ***** Waits and sleep ***** //

    public void waitUntilDisplayed(final WebElement element) {
        waitUntilDisplayed(element, 30);
    }

    public void waitUntilDisplayed(final WebElement element, final Integer timeout) {
        waitUntilDisplayed(element, timeout, true);
    }

    private void waitUntilDisplayed(final WebElement element, final Integer timeout, final boolean isLog) {
        Wait<WebDriver> fluentWait = new FluentWait<WebDriver>(driver)
                .withTimeout(timeout, SECONDS)
                .pollingEvery(1, SECONDS)
                .ignoring(NoSuchElementException.class);
        try {
                fluentWait.until(new ExpectedCondition<Boolean>() {
                        public Boolean apply(final WebDriver d) {
                            if (element == null) {
                                return false;
                            } else {
                                return element.isDisplayed();
                            }
                        }
                });
        } catch (final TimeoutException e) {
            if (isLog) {
                log.error("Element <" + element + "> is not displayed, but expected", e);
            }
            throw e;
        }
    }

    public void waitUntilDisplayed(final By locator) {
        waitUntilDisplayed(locator, DEFAULT_TIMEOUT);
    }

    public void waitUntilDisplayed(final By locator, final int timeout) {
        waitUntilDisplayed(locator, timeout, true);
    }

    private void waitUntilDisplayed(final By locator, final int timeout, final boolean isLog) {
        try {
            (new WebDriverWait(driver, timeout)).ignoring(StaleElementReferenceException.class)
                    .until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (final TimeoutException e) {
            if (isLog) {
                log.error("Element is not displayed, but expected!", e);
            }
            throw e;
        }
    }

    public void waitUntilClickable(final By locator) {
        (new WebDriverWait(driver, DEFAULT_TIMEOUT)).until(ExpectedConditions.elementToBeClickable(locator));
    }

    public void waitUntilClickable(final WebElement element) {
        (new WebDriverWait(driver, DEFAULT_TIMEOUT)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(final WebDriver d) {
                if (element == null) {
                    return false;
                } else {
                    return element.isDisplayed() && element.isEnabled();
                }
            }
        });
    }

    public void waitUntilNotDisplayed(final By locator) {
        new WebDriverWait(driver, DEFAULT_TIMEOUT).until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public void waitUntilNotDisplayed(final By locator, final int timeout) {
        new WebDriverWait(driver, timeout).until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public boolean isElementPresent(final By locator, final int timeout) {
        try {
            waitUntilDisplayed(locator, timeout, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final WebElement element, final int timeout) {
        try {
            waitUntilDisplayed(element, timeout, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final WebElement element) {
        try {
            waitUntilDisplayed(element, DEFAULT_TIMEOUT, true);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Link element) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), DEFAULT_TIMEOUT, true);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final WebElement element, String descr, final int timeout) {
        try {
            waitUntilDisplayed(element, timeout, false);
            log.info(descr + " is displayed");
            return true;
        } catch (final TimeoutException e) {
            log.info(descr + " is NOT displayed");
            return false;
        }
    }

    public void sleep(final long msec) {
        try {
            Thread.sleep(msec);
        } catch (final InterruptedException e) {
            fail(e.getMessage());
        }
    }

    // ***** Find element by ***** //

    public WebElement findElement(final By locator, final Integer timeout) {
        return new WebDriverWait(driver, timeout).until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public WebElement findElement(final By locator) {
        return findElement(locator, DEFAULT_TIMEOUT);
    }

    public WebElement findById(final String id) {
        return findElement(By.id(id));
    }

    public WebElement findByCss(final String selector) {
        return findElement(By.cssSelector(selector));
    }

    public WebElement findByXpath(final String selector) {
        return findElement(By.xpath(selector));
    }

    public List<WebElement> findAllByXpath(final String selector) {
        return driver.findElements(By.xpath(selector));
    }

    // ***** Verifying page content ***** //

    /**
     * Verify page content
     */

    public boolean waitForPageToLoadAndVerifyBy(final By pageIdentifier) {
        return waitForPageToLoadAndVerifyBy(pageIdentifier, DEFAULT_TIMEOUT);
    }


    public boolean waitForPageToLoadAndVerifyBy(final By pageIdentifier, int timeout) {
        waitUntilScriptsReady();
        sleep(500);
        final String pageName = this.getClass().getName().replace("staging.pages.", "");
        log.info("Waiting for " + pageName + " page to load");
        if (isElementPresent(pageIdentifier, timeout)) {
            log.info(pageName + " page is open");
            return true;
        } else {
            log.error("This is not " + pageName + " page. Something is wrong");
            return false;
        }
    }


    // ---- page scripts upload ----

    //Wait Until JS, JQuery and Angular are Ready
    public void waitUntilScriptsReady() {
        log.info("wait until page scripts are ready");
        waitUntilJSReady();
        waitForJQueryLoad();
    }

    public void waitUntilJSReady() {
        WebDriver jsWaitDriver = getDriver();
        WebDriverWait wait = new WebDriverWait(jsWaitDriver, 60);
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;
        ExpectedCondition<Boolean> jsLoad = driver -> ((JavascriptExecutor) jsWaitDriver)
                .executeScript("return document.readyState").toString().equals("complete");

        //Get JS is Ready
        boolean jsReady = (Boolean) jsExec.executeScript("return document.readyState").toString().equals("complete");

        //Wait Javascript until it is Ready
        if (!jsReady) {
            wait.until(jsLoad);
        }
    }

    public void waitForAngularLoad() {
        WebDriver jsWaitDriver = driver;
        WebDriverWait wait = new WebDriverWait(jsWaitDriver, 60);
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;

        String angularReadyScript = "return angular.element(document).injector().get('$http').pendingRequests.length === 0";

        //Wait for ANGULAR to load
        ExpectedCondition<Boolean> angularLoad = driver -> Boolean.valueOf(((JavascriptExecutor) driver)
                .executeScript(angularReadyScript).toString());

        //Get Angular is Ready
        boolean angularReady = Boolean.valueOf(jsExec.executeScript(angularReadyScript).toString());

        //Wait ANGULAR until it is Ready!
        if(!angularReady) {
            wait.until(angularLoad);
        }
    }

    public void waitForJQueryLoad() {
        WebDriver jsWaitDriver = driver;
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;
        WebDriverWait jsWait = new WebDriverWait(jsWaitDriver, 60);

        ExpectedCondition<Boolean> jQueryLoad = driver -> ((Long) ((JavascriptExecutor) jsWaitDriver)
                .executeScript("return jQuery.active") == 0);

        //Get JQuery is Ready
        boolean jqueryReady = (Boolean) jsExec.executeScript("return jQuery.active==0");

        //Wait JQuery until it is Ready!
        if(!jqueryReady) {
            jsWait.until(jQueryLoad);
        }
    }

    // ***** Switch to frame ***** //
    public void switchToFrame(final WebElement frame) {
        waitUntilDisplayed(frame); // just in case
        waitForFrameAndSwitch(frame);
        log.info("Switch to frame");
    }

    public void switchToDefaultContent() {
        log.info("Switch back to default content");
        getDriver().switchTo().defaultContent();
    }

    public void waitForFrameAndSwitch(final String frameId) {
        (new WebDriverWait(driver, 20)).until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(frameId));
    }

    private void waitForFrameAndSwitch(final WebElement frame) {
        (new WebDriverWait(driver, 20)).until(new ExpectedCondition<WebDriver>() {
            public WebDriver apply(final WebDriver driver) {
                try {
                    return driver.switchTo().frame(frame);
                } catch (final NoSuchFrameException e) {
                    return null;
                } catch (final NoSuchElementException e) {
                    return null;
                }
            }
        });
    }

    public void switchFromFrameToDefault() {
        getDriver().switchTo().defaultContent();

    }

    // ***** getters & setters ***** //
    public WebDriver getDriver() {
        return driver;
    }

}