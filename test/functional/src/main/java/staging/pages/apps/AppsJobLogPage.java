package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.AppsLocators;
import staging.model.AppProfile;
import staging.pages.AbstractPage;

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

    public String getFullJobLogText() {
        return getAppsJobLogPageLogArea().getText();
    }

    public String getScriptResultFromLog(AppProfile appProfile) {
        String scriptLog = getAppsJobLogPageLogArea().getText();
        scriptLog = scriptLog.replace(appProfile.getAppInitScriptCodeText(), "");
        return scriptLog;
    }
}
