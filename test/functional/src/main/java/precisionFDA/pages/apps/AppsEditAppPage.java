package precisionFDA.pages.apps;

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
import precisionFDA.data.TestDict;
import precisionFDA.data.TestCommonData;
import precisionFDA.locators.AppsLocators;
import precisionFDA.locators.CommonLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;

import java.util.List;

import static precisionFDA.data.TestChallsData.*;
import static precisionFDA.data.TestChallsData.getTestChallAppInputFileFieldName1;
import static precisionFDA.data.TestDict.getDictFile;
import static precisionFDA.data.TestDict.getDictString;
import static precisionFDA.data.TestCommonData.*;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;
import static precisionFDA.utils.Utils.sleep;

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

    @FindBy(xpath = AppsLocators.APPS_ADD_INPUT_FIELD_BUTTON)
    private Button appAddInputFieldButton;

    @FindBy(xpath = AppsLocators.APPS_ADD_OUTPUT_FIELD_BUTTON)
    private Button appAddOutputFieldButton;

    @FindBy(xpath = AppsLocators.APPS_ADD_INPUT_STRING_ITEM)
    private Link appAddInputStringItem;

    @FindBy(xpath = AppsLocators.APPS_ADD_INPUT_FILE_ITEM)
    private Link appAddInputFileItem;

    @FindBy(xpath = AppsLocators.APPS_ADD_OUTPUT_STRING_ITEM)
    private Link appAddOutputStringItem;

    @FindBy(xpath = AppsLocators.APPS_ADD_OUTPUT_FILE_ITEM)
    private Link appAddOutputFileItem;

    @FindBy(xpath = AppsLocators.APPS_INPUT_NAME_FIELD)
    private TextInput appInputNameField;

    @FindBy(xpath = AppsLocators.APPS_INPUT_LABEL_FIELD)
    private TextInput appInputLabelField;

    @FindBy(xpath = AppsLocators.APPS_INPUT_HELP_FIELD)
    private TextInput appInputHelpField;

    @FindBy(xpath = AppsLocators.APPS_INPUT_DEFAULT_FIELD)
    private TextInput appInputDefaultField;

    @FindBy(xpath = AppsLocators.APPS_OUTPUT_NAME_FIELD)
    private TextInput appOutputNameField;

    @FindBy(xpath = AppsLocators.APPS_OUTPUT_LABEL_FIELD)
    private TextInput appOutputLabelField;

    @FindBy(xpath = AppsLocators.APPS_OUTPUT_HELP_FIELD)
    private TextInput appOutputHelpField;

    public AppsEditAppPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
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

    public Button getAppAddInputFieldButton() {
        return appAddInputFieldButton;
    }

    public Button getAppAddOutputFieldButton() {
        return appAddOutputFieldButton;
    }

    public Link getAppAddInputStringItem() {
        return appAddInputStringItem;
    }

    public Link getAppAddInputFileItem() {
        return appAddInputFileItem;
    }

    public Link getAppAddOutputStringItem() {
        return appAddOutputStringItem;
    }

    public Link getAppAddOutputFileItem() {
        return appAddOutputFileItem;
    }

    public Link getOverviewPageIcon() {
        return overviewPageIcon;
    }

    public WebElement getAppInputNameField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_INPUT_NAME_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppInputLabelField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_INPUT_LABEL_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppInputHelpField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_INPUT_HELP_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppInputDefaultField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_INPUT_DEFAULT_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppOutputNameField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_OUTPUT_NAME_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppOutputLabelField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_OUTPUT_LABEL_FIELD));
        return fields.get(fields.size() - 1);
    }

    public WebElement getAppOutputHelpField() {
        List<WebElement> fields = getDriver().findElements(By.xpath(AppsLocators.APPS_OUTPUT_HELP_FIELD));
        return fields.get(fields.size() - 1);
    }

    public String getInstanceValue() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().getText();
    }

    public boolean isInstanceDefaultValueDisplayed() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().isDisplayed();
    }

    public boolean isNewAppTitleInputDisplayed() {
        return isElementPresent(getAppsNewAppTitleInput(), 2);
    }

    public AppsSavedAppPage saveRevision(AppProfile appProfile) {
        log.info("save revision");
        getEditAppSaveRevisionButton().click();
        appProfile.setCurRevAppCreatedText(TestCommonData.getCurrentTimezone());
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
        appProfile.setInitAppCreatedText(TestCommonData.getCurrentTimezone());
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage fillAndSaveNewApp(AppProfile appProfile) {
        log.info("fill and save new app");

        fillAppName(appProfile.getInitNameText());
        fillAppTitle(appProfile.getInitTitleText());

        appProfile.setCurRevNameText(appProfile.getInitNameText());
        appProfile.setCurRevTitleText(appProfile.getInitTitleText());

        if (appProfile.getInitScriptText().length() > 0) {
            addInputField(getDictString());
            addOutputField(getDictString());

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

    public AppsSavedAppPage fillAndSaveAppForChallenge(AppProfile appProfile) {
        log.info("fill and save app for challenge");

        fillAppName(appProfile.getInitNameText());
        fillAppTitle(appProfile.getInitTitleText());

        appProfile.setCurRevNameText(appProfile.getInitNameText());
        appProfile.setCurRevTitleText(appProfile.getInitTitleText());

        addInputField(getDictFile(), getTestChallAppInputFileFieldName1());
        // addInputField(getDictFile(), getTestChallAppInputFileFieldName2());

        addOutputField(getDictFile(), getTestChallAppOutputFileFieldName1());
        // addOutputField(getDictFile(), getTestChallAppOutputFileFieldName2());
        // addOutputField(getDictString(), getTestChallAppOutputStrFieldName1());

        openScriptTab();
        fillScriptArea(appProfile.getInitScriptText());
        appProfile.setCurRevScriptText(appProfile.getInitScriptText());

        AppsSavedAppPage appsSavedAppPage = clickCreate(appProfile);

        return appsSavedAppPage;
    }

    public AppsSavedAppPage fillAndSaveAppForWorkflow(AppProfile appProfile) {
        log.info("fill and save app for workflow");

        fillAppName(appProfile.getInitNameText());
        fillAppTitle(appProfile.getInitTitleText());

        appProfile.setCurRevNameText(appProfile.getInitNameText());
        appProfile.setCurRevTitleText(appProfile.getInitTitleText());

        addInputField(getDictFile(), getTestChallAppInputFileFieldName1());
        // addInputField(getDictFile(), getTestChallAppInputFileFieldName2());

        addOutputField(getDictFile(), getTestChallAppOutputFileFieldName1());
        // addOutputField(getDictFile(), getTestChallAppOutputFileFieldName2());
        // addOutputField(getDictString(), getTestChallAppOutputStrFieldName1());

        openScriptTab();
        fillScriptArea(appProfile.getInitScriptText());
        appProfile.setCurRevScriptText(appProfile.getInitScriptText());
        sleep(1000);
        AppsSavedAppPage appsSavedAppPage = clickCreate(appProfile);

        return appsSavedAppPage;
    }

    public void addInputField(String type, String name) {
        log.info("add input field");
        getAppAddInputFieldButton().click();

        if (type == TestDict.getDictString()) {
            waitUntilDisplayed(getAppAddInputStringItem());
            getAppAddInputStringItem().click();
            waitUntilDisplayed(getAppInputDefaultField());
            getAppInputNameField().sendKeys(name);
            getAppInputLabelField().sendKeys(getInputLabelFieldName());
            getAppInputHelpField().sendKeys(getInputHelpFieldName());
            getAppInputDefaultField().sendKeys(getInputDefaultFieldName());
        }

        if (type == TestDict.getDictFile()) {
            waitUntilDisplayed(getAppAddInputStringItem());
            getAppAddInputFileItem().click();
            waitUntilDisplayed(getAppInputHelpField());
            getAppInputNameField().sendKeys(name);
            getAppInputLabelField().sendKeys(getInputLabelFieldName());
            getAppInputHelpField().sendKeys(getInputHelpFieldName());
        }
    }

    public void addInputField(String type) {
        addInputField(type, getInputNameFieldName());
    }

    public void addOutputField(String type, String name) {
        log.info("add output field");
        getAppAddOutputFieldButton().click();

        if (type == TestDict.getDictString()) {
            waitUntilDisplayed(getAppAddOutputStringItem());
            getAppAddOutputStringItem().click();
            waitUntilDisplayed(getAppOutputHelpField());
            getAppOutputNameField().sendKeys(name);
            getAppOutputLabelField().sendKeys(getOutputLabelFieldName());
            getAppOutputHelpField().sendKeys(getOutputHelpFieldName());
        }

        if (type == TestDict.getDictFile()) {
            waitUntilDisplayed(getAppAddOutputStringItem());
            getAppAddOutputFileItem().click();
            waitUntilDisplayed(getAppOutputHelpField());
            getAppOutputNameField().sendKeys(name);
            getAppOutputLabelField().sendKeys(getOutputLabelFieldName());
            getAppOutputHelpField().sendKeys(getOutputHelpFieldName());
        }
    }

    public void addOutputField(String type) {
        addOutputField(type, getOutputNameFieldName());
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
