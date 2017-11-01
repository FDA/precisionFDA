package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.data.TestRunData;
import staging.locators.AppsLocators;
import staging.locators.CommonLocators;
import staging.model.AppProfile;
import staging.pages.AbstractPage;

import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class AppsEditAppPage extends AbstractPage {

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

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_SAVE_REVISION_BUTTON)
    private WebElement editAppSaveRevisionButton;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_TAB_LINK)
    private Link editAppReadmeTab;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_TEXTAREA)
    private TextInput editAppReadmeTextArea;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_PREVIEW_TAB_LINK)
    private Link editAppReadmePreviewTab;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_README_PREVIEW_TEXTAREA)
    private WebElement editAppReadmePreviewArea;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_VMENV_TAB_LINK)
    private Link editVMEnv;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_VMENV_INSTANCE_DROP)
    private Select editVMEnvInstanceDrop;

    @FindBy(xpath = AppsLocators.APPS_EDIT_APP_VMENV_INSTANCE_PACKAGE_INPUT)
    private WebElement editVMEnvInstancePackageInput;

    @FindBy(xpath = AppsLocators.APPS_CREATE_APP_CREATE_BUTTON)
    private Button appCreateAppButton;

    public AppsEditAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_EDIT_APP_TITLE_INPUT));
    }

    public WebElement getEditAppSaveRevisionButton() {
        return editAppSaveRevisionButton;
    }

    public TextInput getAppsNewAppTitleInput() {
        return appsNewAppTitleInput;
    }

    public Link getEditAppReadmeTab() {
        return editAppReadmeTab;
    }

    public Link getEditAppReadmePreviewTab() {
        return editAppReadmePreviewTab;
    }

    public String getReadmePreviewText() {
        return getEditAppReadmePreviewArea().getText();
    }

    public WebElement getEditAppReadmePreviewArea() {
        return editAppReadmePreviewArea;
    }

    public TextInput getEditAppReadmeTextArea() {
        return editAppReadmeTextArea;
    }

    public Select getEditVMEnvInstanceDrop() {
        return editVMEnvInstanceDrop;
    }

    public Link getEditVMEnv() {
        return editVMEnv;
    }

    public WebElement getEditVMEnvInstancePackageInput() {
        return editVMEnvInstancePackageInput;
    }

    public TextInput getAppsNewAppNameInput() {
        return appsNewAppNameInput;
    }

    public String getInstanceValue() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().getText();
    }

    public boolean isInstanceDefaultValueDisplayed() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().isDisplayed();
    }

    public AppsSavedAppPage saveRevision(AppProfile appProfile) {
        log.info("save revision");
        getEditAppSaveRevisionButton().click();
        appProfile.setCurRevAppCreatedText(TestRunData.getCurrentTimezone());
        return new AppsSavedAppPage(getDriver());
    }

    public void fillAppName(String name) {
        log.info("fill name");
        getAppsNewAppNameInput().clear();
        getAppsNewAppNameInput().sendKeys(name);
    }

    public void fillAppTitle(String title) {
        log.info("fill title");
        getAppsNewAppTitleInput().clear();
        getAppsNewAppTitleInput().sendKeys(title);
    }

    public void fillReadme(String readMeRowText) {
        log.info("fill readme");
        getEditAppReadmeTextArea().clear();
        sleep(1000);
        getEditAppReadmeTextArea().sendKeys(Keys.BACK_SPACE);
        sleep(500);
        getEditAppReadmeTextArea().sendKeys(readMeRowText);
    }

    public AppsEditAppPage openReadmePreviewTab() {
        log.info("open Readme review tab");
        getEditAppReadmePreviewTab().click();
        waitUntilDisplayed(getEditAppReadmePreviewArea());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openScriptTab() {
        log.info("open Script tab");
        waitUntilDisplayed(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
        getEditAppScriptTab().click();
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openReadmeEditTab() {
        log.info("open Readme edit tab");
        getEditAppReadmeTab().click();
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openVMEnvTab() {
        log.info("open VM Env tab");
        getEditVMEnv().click();
        waitUntilDisplayed(getEditVMEnvInstancePackageInput());
        return new AppsEditAppPage(getDriver());
    }

    public AppsSavedAppPage saveRevisionAfterReadmeEdit(AppProfile appProfile) {
        appProfile.setCurRevReadMeRawText(appProfile.getTempReadMeRowText());
        appProfile.setCurRevReadMeRichText(appProfile.getTempReadMeRichText());
        AppsSavedAppPage appsSavedAppPage = saveRevision(appProfile);
        return appsSavedAppPage;
    }

    public Link getEditAppScriptTab() {
        return editAppScriptTab;
    }

    public TextInput getEditAppScriptTextArea() {
        return editAppScriptTextArea;
    }

    public Button getAppCreateAppButton() {
        return appCreateAppButton;
    }

    public void fillScriptArea(String script) {
        log.info("fill script");
        getEditAppScriptTextArea().clear();
        getEditAppScriptTextArea().sendKeys(script);
    }

    public AppsSavedAppPage clickCreate(AppProfile appProfile) {
        log.info("click Create button");
        getAppCreateAppButton().click();
        appProfile.setInitAppCreatedText(TestRunData.getCurrentTimezone());
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage fillAndSaveNewApp(AppProfile appProfile) {
        log.info("fill and save new app");

        fillAppName(appProfile.getInitNameText());
        fillAppTitle(appProfile.getInitTitleText());

        appProfile.setCurRevNameText(appProfile.getInitNameText());
        appProfile.setCurRevTitleText(appProfile.getInitTitleText());

        if (appProfile.getInitScriptText().length() > 0) {
            openScriptTab();
            fillScriptArea(appProfile.getInitScriptText());
            appProfile.setCurRevScriptText(appProfile.getInitScriptText());
        }

        if (appProfile.getInitReadMeRawText().length() > 0) {
            openReadmeEditTab();
            fillReadme(appProfile.getInitReadMeRawText());
            appProfile.setCurRevReadMeRawText(appProfile.getInitReadMeRawText());
            appProfile.setCurRevReadMeRichText(appProfile.getInitReadMeRichText());
            appProfile.setTempReadMeRawText(appProfile.getInitReadMeRawText());
            appProfile.setTempReadMeRichText(appProfile.getInitReadMeRichText());
        }

        AppsSavedAppPage appsSavedAppPage = clickCreate(appProfile);

        return appsSavedAppPage;
    }

    public AppsSavedAppPage editAndSaveAppTitleWithNewValue(AppProfile appProfile) {
        log.info("edit app title with new data");
        String newTitle = appProfile.getCurRevTitleText() + " upd " + getRunTimeLocalUniqueValue();
        fillAppTitle(newTitle);
        appProfile.setCurRevTitleText(newTitle);
        AppsSavedAppPage appsSavedAppPage = saveRevision(appProfile);
        return appsSavedAppPage;
    }

    public void editReadmeWithNewValue(AppProfile appProfile) {
        log.info("edit readme with new data");
        String add = getRunTimeLocalUniqueValue();
        String tempReadmeRow = appProfile.getInitReadMeRawText() + " upd " + add;
        String tempReadmeRich = appProfile.getInitReadMeRichText() + " upd " + add;
        fillReadme(tempReadmeRow);
        appProfile.setTempReadMeRawText(tempReadmeRow);
        appProfile.setTempReadMeRichText(tempReadmeRich);
    }

    public AppsSavedAppPage editAndSaveAppWithNewValues(AppProfile appProfile) {
        log.info("edit and save app with new data");

        String add = getRunTimeLocalUniqueValue();
        String newTitle = appProfile.getCurRevTitleText() + add;
        String newReadMeRow = appProfile.getCurRevReadMeRowText() + add;
        String newReadMeRich = appProfile.getCurRevReadMeRichText() + add;
        String newScript = appProfile.getCurRevScriptText() + add;

        fillAppTitle(newTitle);
        appProfile.setCurRevTitleText(newTitle);

        openScriptTab();
        fillScriptArea(newScript);
        appProfile.setCurRevScriptText(newScript);

        openReadmeEditTab();
        fillReadme(newReadMeRow);
        appProfile.setCurRevReadMeRawText(newReadMeRow);
        appProfile.setCurRevReadMeRichText(newReadMeRich);

        AppsSavedAppPage appsSavedAppPage = saveRevision(appProfile);
        return appsSavedAppPage;
    }


}
