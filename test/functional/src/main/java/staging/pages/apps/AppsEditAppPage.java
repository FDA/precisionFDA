package staging.pages.apps;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.locators.CommonLocators;
import staging.pages.AbstractPage;
import staging.pages.overview.OverviewPage;

import static staging.data.TestVariables.*;

public class AppsEditAppPage extends AbstractPage {

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

    public AppsEditAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_EDIT_APP_SCRIPT_TAB_LINK));
    }

    public WebElement getEditAppSaveRevisionButton() {
        return editAppSaveRevisionButton;
    }

    public OverviewPage openOverviewPage() {
        overviewPageIcon.click();
        alertAccept(2, 200);
        return new OverviewPage(getDriver());
    }

    public AppsSavedAppPage saveRevision() {
        getEditAppSaveRevisionButton().click();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsEditAppPage enterNewAppTitle() {
        appsNewAppTitleInput.clear();
        setIsAppTitleEditedFlag(true);
        appsNewAppTitleInput.sendKeys(getAppTitle());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage editReadmeTab() {
        editAppReadmeTab.click();
        editAppReadmeTextArea.clear();
        editAppReadmeTextArea.sendKeys(getReadMeRowText());
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAppPage openReadmeReviewTab() {
        editAppReadmePreviewTab.click();
        waitUntilDisplayed(getEditAppReadmePreviewArea());
        return new AppsEditAppPage(getDriver());
    }

    public String getReadmePreviewText() {
        return getEditAppReadmePreviewArea().getText();
    }

    public WebElement getEditAppReadmePreviewArea() {
        return editAppReadmePreviewArea;
    }
}
