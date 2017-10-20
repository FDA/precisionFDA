package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

import static staging.data.TestVariables.getAppJobScriptBody;
import static staging.data.TestVariables.getAppJobScriptOutput;

public class AppsJobLogPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOB_LOG_PAGE_LOG_AREA)
    private WebElement appsJobLogPageLogArea;

    public AppsJobLogPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOB_LOG_PAGE_LOG_AREA));
    }

    public WebElement getAppsJobLogPageLogArea() {
        return appsJobLogPageLogArea;
    }

    public boolean isJobResultCorrect() {
        String logText = getAppsJobLogPageLogArea().getText();
        boolean isScriptText = false;
        boolean isScriptResult = false;

        //check if script text is displayed
        if (logText.contains(getAppJobScriptBody())) {
            log.info("script text is displayed");
            isScriptText = true;
        }
        else {
            log.info("[WARNING] script text is NOT displayed. Expected: " + getAppJobScriptBody());
        }

        //check if script result is displayed
        logText = logText.replace(getAppJobScriptBody(), "");
        if (logText.contains(getAppJobScriptOutput())) {
            log.info("script result is displayed");
            isScriptResult = true;
        }
        else {
            log.info("[WARNING] script result is NOT displayed. Expected: " + getAppJobScriptOutput());
        }

        return isScriptText && isScriptResult;
    }
}
