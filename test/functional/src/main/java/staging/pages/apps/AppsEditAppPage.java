package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.locators.CommonLocators;
import staging.pages.AbstractPage;
import staging.pages.overview.OverviewPage;

import static staging.data.TestVariables.*;

public class AppsEditAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

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

    public AppsEditAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
    }

    public WebElement getEditAppSaveRevisionButton() {
        return editAppSaveRevisionButton;
    }

    public Link getOverviewPageIcon() {
        return overviewPageIcon;
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

    public String getInstanceValue() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().getText();
    }

    public boolean isInstanceDefaultValueDisplayed() {
        return getEditVMEnvInstanceDrop().getFirstSelectedOption().isDisplayed();
    }

    public OverviewPage openOverviewPage() {
        getOverviewPageIcon().click();
        alertAccept(2, 200);
        return new OverviewPage(getDriver());
    }

    public AppsSavedAppPage saveRevision() {
        log.info("click save revision");
        getEditAppSaveRevisionButton().click();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsEditAppPage enterNewAppTitle() {
        log.info("edit New App title");
        getAppsNewAppTitleInput().clear();
        setIsAppTitleEditedFlag(true);
        getAppsNewAppTitleInput().sendKeys(getAppTitle());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage editReadmeTab() {
        log.info("open and edit ReadMe tab");
        getEditAppReadmeTab().click();
        getEditAppReadmeTextArea().clear();
        getEditAppReadmeTextArea().sendKeys(getReadMeRowText());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openReadmeReviewTab() {
        log.info("open ReadMe review tab");
        getEditAppReadmePreviewTab().click();
        waitUntilDisplayed(getEditAppReadmePreviewArea());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openVMEnvTab() {
        log.info("open VM Env tab");
        getEditVMEnv().click();
        waitUntilDisplayed(getEditVMEnvInstancePackageInput());
        return new AppsEditAppPage(getDriver());
    }
}
