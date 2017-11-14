package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.AppsLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;

public class AppsJobLogPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOB_LOG_PAGE_LOG_AREA)
    private WebElement appsJobLogPageLogArea;

    public AppsJobLogPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOB_LOG_PAGE_LOG_AREA));
    }

    public WebElement getAppsJobLogPageLogArea() {
        return appsJobLogPageLogArea;
    }

    public String getFullJobLogText() {
        return getAppsJobLogPageLogArea().getText();
    }

    public String getScriptResultFromLog(AppProfile appProfile) {
        String scriptLog = getAppsJobLogPageLogArea().getText();
        scriptLog = scriptLog.replace(appProfile.getInitScriptText(), "");
        return scriptLog;
    }
}
