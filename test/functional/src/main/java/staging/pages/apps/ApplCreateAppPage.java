package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.locators.CommonLocators;
import staging.model.AppProfile;
import staging.pages.AbstractPage;

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

    public Link getEditAppScriptTab() {
        return editAppScriptTab;
    }

    public TextInput getAppsNewAppTitleInput() {
        return appsNewAppTitleInput;
    }

    public TextInput getEditAppScriptTextArea() {
        return editAppScriptTextArea;
    }

    public Button getAppCreateAppButton() {
        return appCreateAppButton;
    }

    public boolean isNewAppNameInputDisplayed() {
        return isElementPresent(getAppsNewAppNameInput());
    }

    public ApplCreateAppPage fillCreateAppForm(AppProfile appProfile) {
        log.info("fill Create App form");
        getAppsNewAppNameInput().sendKeys(appProfile.getAppNameText());
        getAppsNewAppTitleInput().sendKeys(appProfile.getAppTitleText());
        waitUntilDisplayed(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
        getEditAppScriptTab().click();
        getEditAppScriptTextArea().sendKeys(appProfile.getAppScriptCodeText());
        return new ApplCreateAppPage(getDriver());
    }

    public AppsSavedAppPage clickCreate(AppProfile appProfile) {
        log.info("click Create button");
        getAppCreateAppButton().click();
        appProfile.setAppCreationDateTimeText();
        return new AppsSavedAppPage(getDriver());
    }
}
