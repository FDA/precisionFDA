package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import ru.yandex.qatools.htmlelements.loader.HtmlElementLoader;

import java.util.List;

import static org.junit.Assert.fail;

public abstract class AbstractPage {

    private final WebDriver driver;

    private final Logger log = Logger.getLogger(this.getClass());

    private static final int DEFAULT_TIMEOUT = 10;

    public AbstractPage(final WebDriver driver) {
        HtmlElementLoader.populatePageObject(this, driver);
        this.driver = driver;
    }

    // ***** Waits and sleep ***** //

    public void waitUntilDisplayed(final WebElement element) {
        waitUntilDisplayed(element, 60);
    }

    public void waitUntilDisplayed(final WebElement element, final Integer timeout) {
        waitUntilDisplayed(element, timeout, true);
    }

    private void waitUntilDisplayed(final WebElement element, final Integer timeout, final boolean isLog) {
        try {
            (new WebDriverWait(driver, timeout)).ignoring(StaleElementReferenceException.class)
                    .until(new ExpectedCondition<Boolean>() {
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
                log.error("Element is not displayed, but expected", e);
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
            waitUntilDisplayed(element, DEFAULT_TIMEOUT, false);
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

    public void waitUntilNotDisplayed(final By locator) {
        new WebDriverWait(driver, DEFAULT_TIMEOUT).until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public void waitUntilNotDisplayed(final By locator, final int timeout) {
        new WebDriverWait(driver, timeout).until(ExpectedConditions.invisibilityOfElementLocated(locator));
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
        final String pageName = this.getClass().getName().replace("staging.pages.", "");
        log.info("Waiting for " + pageName + " page to load");
        if (isElementPresent(pageIdentifier, DEFAULT_TIMEOUT)) {
            log.info(pageName + " page is open");
            return true;
        } else {
            log.error("This is not " + pageName + " page. Something is wrong");
            return false;
        }
    }


    public boolean waitForPageToLoadAndVerifyBy(final By pageIdentifier, int timeout) {
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


    public boolean waitForPageToLoadAndVerifyWe(final WebElement pageIdentifier) {
        final String pageName = this.getClass().getName().replace("Page", "").replace("email.pages.", "");
        log.info("Waiting for " + pageName + " page to load");
        if (isElementPresent(pageIdentifier, DEFAULT_TIMEOUT)) {
            log.info(pageName + " page is opened.");
            return true;
        } else {
            log.error("This is not " + pageName + " page. Something is wrong.");
            return false;
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