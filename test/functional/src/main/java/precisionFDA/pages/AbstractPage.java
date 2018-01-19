package precisionFDA.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import precisionFDA.utils.Utils;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;
import ru.yandex.qatools.htmlelements.loader.HtmlElementLoader;

import java.util.List;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static precisionFDA.data.TestDict.getDictError;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public abstract class AbstractPage {

    protected WebDriver driver;

    private final Logger log = Logger.getLogger(this.getClass());

    private static final int DEFAULT_TIMEOUT = 10;

    public AbstractPage(final WebDriver driver) {
        HtmlElementLoader.populatePageObject(this, driver);
        this.driver = driver;
    }

    // ***** Waits and sleep ***** //

    public void waitUntilDisplayed(final WebElement element) {
        waitUntilDisplayed(element, DEFAULT_TIMEOUT);
    }

    public void waitUntilDisplayed(final WebElement element, final Integer timeout) {
        waitUntilDisplayed(element, timeout, true);
    }

    private void waitUntilDisplayed(final WebElement element, final Integer timeout, final boolean isLog) {
        Wait<WebDriver> fluentWait = new FluentWait<WebDriver>(getDriver())
                .withTimeout(timeout, SECONDS)
                .pollingEvery(500, MILLISECONDS)
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

    public void waitUntilDisplayed(final Link link) {
        waitUntilDisplayed(link.getWrappedElement());
    }

    public void waitUntilDisplayed(final Link link, int timeout) {
        waitUntilDisplayed(link.getWrappedElement(), timeout);
    }

    public void waitUntilDisplayed(final Select select, int timeout) {
        waitUntilDisplayed(select.getWrappedElement(), timeout);
    }

    public void waitUntilDisplayed(final Button button) {
        waitUntilDisplayed(button.getWrappedElement());
    }

    public void waitUntilDisplayed(final TextInput input) {
        waitUntilDisplayed(input.getWrappedElement());
    }

    public void waitUntilDisplayed(final TextInput input, int timeout) {
        waitUntilDisplayed(input.getWrappedElement(), timeout);
    }

    public void waitUntilDisplayed(final By locator) {
        waitUntilDisplayed(locator, DEFAULT_TIMEOUT);
    }

    public void waitUntilDisplayed(final By locator, final int timeout) {
        waitUntilDisplayed(locator, timeout, true);
    }

    private void waitUntilDisplayed(final By locator, final int timeout, final boolean isLog) {
        log.info("wait until displayed: " + locator);
        try {
            (new WebDriverWait(getDriver(), timeout)).ignoring(StaleElementReferenceException.class)
                    .until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (final TimeoutException e) {
            if (isLog) {
                log.error("Element is not displayed, but expected!", e);
            }
            throw e;
        }
    }

    public void waitUntilClickable(final By locator) {
        (new WebDriverWait(getDriver(), DEFAULT_TIMEOUT)).until(ExpectedConditions.elementToBeClickable(locator));
    }

    public void waitUntilClickable(final WebElement element) {
        waitUntilClickable(element, DEFAULT_TIMEOUT);
    }

    public void waitUntilClickable(final WebElement element, int timeout) {
        log.info("wait until clickable: " + element);
        (new WebDriverWait(getDriver(), timeout)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(final WebDriver d) {
                if (element == null) {
                    return false;
                } else {
                    return element.isDisplayed() && element.isEnabled();
                }
            }
        });
    }

    public void waitUntilClickable(final Link element) {
        waitUntilClickable(element, DEFAULT_TIMEOUT);
    }

    public void waitUntilClickable(final Link element, int timeout) {
        log.info("wait until clickable: " + element);
        (new WebDriverWait(getDriver(), timeout)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(final WebDriver d) {
                if (element == null) {
                    return false;
                } else {
                    return element.getWrappedElement().isDisplayed() && element.getWrappedElement().isEnabled();
                }
            }
        });
    }

    public void waitUntilClickable(final Button element) {
        waitUntilClickable(element, DEFAULT_TIMEOUT);
    }

    public void waitUntilClickable(final Button element, int timeout) {
        log.info("wait until clickable: " + element);
        (new WebDriverWait(getDriver(), timeout)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(final WebDriver d) {
                if (element == null) {
                    return false;
                } else {
                    return element.getWrappedElement().isDisplayed() && element.getWrappedElement().isEnabled();
                }
            }
        });
    }

    public void waitUntilNotDisplayed(final By locator) {
        new WebDriverWait(getDriver(), DEFAULT_TIMEOUT).until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public void waitUntilNotDisplayed(final By locator, final int timeout) {
        new WebDriverWait(getDriver(), timeout).until(ExpectedConditions.invisibilityOfElementLocated(locator));
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

    public boolean isElementPresent(final WebElement element, final int timeout, boolean isLog) {
        try {
            waitUntilDisplayed(element, timeout, isLog);
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

    public boolean isElementPresent(final Link element) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), DEFAULT_TIMEOUT, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Button element) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), DEFAULT_TIMEOUT, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Button element, final int timeout) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), timeout, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Link element, final int timeout) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), timeout, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Select element) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), DEFAULT_TIMEOUT, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final Select element, int timeout) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), timeout, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final TextInput element) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), DEFAULT_TIMEOUT, false);
            return true;
        } catch (final TimeoutException e) {
            return false;
        }
    }

    public boolean isElementPresent(final TextInput element, int timeout) {
        try {
            waitUntilDisplayed(element.getWrappedElement(), timeout, false);
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

    // -------- Find element by -----------

    public WebElement findElement(final By locator, final Integer timeout) {
        return new WebDriverWait(getDriver(), timeout).until(ExpectedConditions.visibilityOfElementLocated(locator));
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
        return getDriver().findElements(By.xpath(selector));
    }

    public String getOptionTextByPartialText(String partialText, String selectorByXpath) {
        List<WebElement> options = getDriver().findElements(By.xpath(selectorByXpath));
        String optionText = "";
        if (options.size() > 0) {
            for (WebElement we : options) {
                if (we.getText().contains(partialText)) {
                    optionText = we.getText();
                    break;
                }
            }
        }
        return optionText;
    }


    // ---- Verifying page content ----

    public boolean waitForPageToLoadAndVerifyBy(final By pageIdentifier) {
        return waitForPageToLoadAndVerifyBy(pageIdentifier, DEFAULT_TIMEOUT);
    }

    public boolean waitForPageToLoadAndVerifyBy(final By pageIdentifier, int timeout) {
        final String pageName = this.getClass().getName().replace("precisionFDA.pages.", "");
        log.info("Waiting for " + pageName + " page to load");
        if (isElementPresent(pageIdentifier, timeout)) {
            log.info(pageName + " page is open");
            return true;
        } else {
            String message = "It looks like a wrong page is open. Should be " + pageName;
            String fileName =
                    getDictError() + "_expected_" +
                    pageName + "_" +
                    getRunTimeLocalUniqueValue()
                    + ".png";
            Utils.reportScreenshot(message, fileName, getDictError(), getDriver());
            return false;
        }
    }

    // ---- page scripts upload ----

    //Wait Until JS, JQuery are Ready
    public void waitUntilScriptsReady() {
        log.info("wait until page scripts are ready");
        waitUntilJSReady();
        waitForJQueryLoad();
        //waitForAngularLoad();
    }

    public void waitUntilJSReady() throws JavascriptException {
        WebDriver jsWaitDriver = getDriver();
        WebDriverWait wait = new WebDriverWait(jsWaitDriver, 60);
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;

        try {
            ExpectedCondition<Boolean> jsLoad = driver -> ((JavascriptExecutor) jsWaitDriver)
                    .executeScript("return document.readyState").toString().equals("complete");
            boolean jsReady = (Boolean) jsExec.executeScript("return document.readyState").toString().equals("complete");
            if (!jsReady) {
                wait.until(jsLoad);
            }
        }
        catch (Exception e) {

        }
    }

    public void waitForAngularLoad() throws JavascriptException {
        WebDriver jsWaitDriver = getDriver();
        WebDriverWait wait = new WebDriverWait(jsWaitDriver, 60);
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;

        String angularReadyScript = "return angular.element(document).injector().get('$http').pendingRequests.length === 0";
        try {
            ExpectedCondition<Boolean> angularLoad = driver -> Boolean.valueOf(((JavascriptExecutor) driver)
                    .executeScript(angularReadyScript).toString());
            boolean angularReady = Boolean.valueOf(jsExec.executeScript(angularReadyScript).toString());
            if(!angularReady) {
                wait.until(angularLoad);
            }
        }
        catch (Exception e) {

        }
    }

    public void waitForJQueryLoad() throws JavascriptException {
        WebDriver jsWaitDriver = getDriver();
        JavascriptExecutor jsExec = (JavascriptExecutor) jsWaitDriver;
        WebDriverWait jsWait = new WebDriverWait(jsWaitDriver, 60);

        try {
            ExpectedCondition<Boolean> jQueryLoad = driver -> ((Long) ((JavascriptExecutor) jsWaitDriver)
                    .executeScript("return jQuery.active") == 0);
            boolean jqueryReady = (Boolean) jsExec.executeScript("return jQuery.active==0");
            if(!jqueryReady) {
                jsWait.until(jQueryLoad);
            }
        }
        catch (Exception e) {

        }
    }

    // ------ frames -------

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
        (new WebDriverWait(getDriver(), 20)).until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(frameId));
    }

    private void waitForFrameAndSwitch(final WebElement frame) {
        (new WebDriverWait(getDriver(), 20)).until(new ExpectedCondition<WebDriver>() {
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

    // -------- getters and setters ---------

    public WebDriver getDriver() {
        try {
            return driver;
        }
        catch (WebDriverException e) {
            return driver;
        }
    }

    // ------- alerts ------

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

    //-------- common actions ---------

    public CommonPage getCommonPage() {
        return new CommonPage(getDriver());
    }

}