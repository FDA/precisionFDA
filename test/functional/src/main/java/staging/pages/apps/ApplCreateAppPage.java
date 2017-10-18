package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.data.TestConstants;
import staging.locators.AppsLocators;
import staging.locators.CommonLocators;
import staging.pages.AbstractPage;
import staging.pages.overview.OverviewPage;

import static staging.data.TestConstants.getAppJobScriptBody;
import static staging.data.TestConstants.getAppName;
import static staging.data.TestConstants.getAppTitle;
import static staging.utils.Utils.getCurrentDateTimeUTCValue;

public class ApplCreateAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_NAME_INPUT)
    private TextInput appsNewAppNameInput;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_TITLE_INPUT)
    private TextInput appsNewAppTitleInput;

    @FindBy(xpath = CommonLocators.OVERVIEW_PAGE_ICON)
    private Link overviewPageIcon;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK)
    private Link editAppScriptTab;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_SCRIPT_TEXTAREA)
    private TextInput editAppScriptTextArea;

    @FindBy(xpath = AppsLocators.APPS_CREATE_APP_CREATE_BUTTON)
    private Button appCreateAppButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_SAVE_REVISION_BUTTON)
    private WebElement editAppSaveRevisionButton;

    public ApplCreateAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_EDIT_APP_NAME_INPUT));
    }

    public TextInput getAppsNewAppNameInput() {
        return appsNewAppNameInput;
    }

    public boolean isNewAppNameInputDisplayed() {
        return isElementPresent(getAppsNewAppNameInput());
    }

    public OverviewPage openOverviewPage() {
        overviewPageIcon.click();
        alertAccept(2, 200);
        return new OverviewPage(getDriver());
    }

    public ApplCreateAppPage fillCreateAppForm() {
        log.info("fill Create App form");
        appsNewAppNameInput.sendKeys(getAppName());
        appsNewAppTitleInput.sendKeys(getAppTitle());
        waitUntilDisplayed(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
        editAppScriptTab.click();
        editAppScriptTextArea.sendKeys(getAppJobScriptBody());
        return new ApplCreateAppPage(getDriver());
    }

    public AppsSavedAppPage clickCreate() {
        log.info("click Create button");
        appCreateAppButton.click();
        appCreateTimeUTC = getCurrentDateTimeUTCValue();
        return new AppsSavedAppPage(getDriver());
    }

}
