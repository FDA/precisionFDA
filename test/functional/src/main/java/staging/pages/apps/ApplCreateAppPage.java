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

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_TAB_LINK)
    private Link editAppReadmeTab;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_TEXTAREA)
    private TextInput editAppReadmeTextArea;

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

    public TextInput getEditAppReadmeTextArea() {
        return editAppReadmeTextArea;
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

    public Link getEditAppReadmeTab() {
        return editAppReadmeTab;
    }



    public boolean isNewAppNameInputDisplayed() {
        return isElementPresent(getAppsNewAppNameInput());
    }

    public ApplCreateAppPage fillCreateAppForm(String name, String title, String script, String readmeRow) {
        log.info("fill Create App form");
        getAppsNewAppNameInput().sendKeys(name);
        getAppsNewAppTitleInput().sendKeys(title);
        waitUntilDisplayed(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
        getEditAppScriptTab().click();
        getEditAppScriptTextArea().sendKeys(script);
        getEditAppReadmeTab().click();
        getEditAppReadmeTextArea().sendKeys(readmeRow);
        return new ApplCreateAppPage(getDriver());
    }

    public AppsSavedAppPage clickCreate(AppProfile appProfile) {
        log.info("click Create button");
        getAppCreateAppButton().click();
        appProfile.setAppInitCreationDateTimeText();
        return new AppsSavedAppPage(getDriver());
    }
}
