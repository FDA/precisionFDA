package precisionFDA.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.ExpertsLocators;
import precisionFDA.model.ExpertProfile;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.utils.TestRunConfig.getPathToTempFilesFolder;

public class ExpertsEditExpertPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_BUTTON_ON_NEW_EXPERT_FORM)
    private WebElement createExpertButton;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_USERNAME_SELECT)
    private Select usernameSelect;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_ABOUT_INPUT)
    private TextInput aboutInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_BLOG_TITLE_INPUT)
    private TextInput blogTitleInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_BLOG_INPUT)
    private TextInput blogInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_PREVIEW_INPUT)
    private TextInput blogPreviewInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_UPLOAD_IMAGE_BUTTON)
    private Button uploadImageButton;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_VISIBILITY_SELECT)
    private Select visibilitySelect;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_FORM_PREFERRED_INPUT)
    private TextInput preferredInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_VISIBLE_BUTTON)
    private WebElement imageUploadBrowseButton;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_INPUT)
    private TextInput imageUploadBrowseInput;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_IMAGE_UPLOAD_BUTTON)
    private Button imageUploadButton;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE)
    private WebElement imageUploadComplete;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE_OK_BUTTON)
    private Button imageUploadCompleteOkButton;

    @FindBy(xpath = ExpertsLocators.EDIT_EXPERT_UPDATE_BUTTON)
    private WebElement updateButton;

    public ExpertsEditExpertPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.CREATE_EXPERT_FORM_UPLOAD_IMAGE_BUTTON));
    }

    public Button getImageUploadCompleteOkButton() {
        return imageUploadCompleteOkButton;
    }

    public WebElement getImageUploadComplete() {
        return imageUploadComplete;
    }

    public Button getImageUploadButton() {
        return imageUploadButton;
    }

    public TextInput getImageUploadBrowseInput() {
        return imageUploadBrowseInput;
    }

    public WebElement getImageUploadBrowseButton() {
        return imageUploadBrowseButton;
    }

    public TextInput getPreferredInput() {
        return preferredInput;
    }

    public WebElement getCreateExpertButton() {
        return createExpertButton;
    }

    public Select getUsernameSelect() {
        return usernameSelect;
    }

    public Select getVisibilitySelect() {
        return visibilitySelect;
    }

    public Button getUploadImageButton() {
        return uploadImageButton;
    }

    public TextInput getAboutInput() {
        return aboutInput;
    }

    public TextInput getBlogInput() {
        return blogInput;
    }

    public TextInput getBlogPreviewInput() {
        return blogPreviewInput;
    }

    public TextInput getBlogTitleInput() {
        return blogTitleInput;
    }

    public WebElement getUpdateButtonWE() {
        return updateButton;
    }

    public ExpertsEditExpertPage fillNewExpertForm(ExpertProfile expertProfile) {
        log.info("fill new expert form");

        getUsernameSelect().selectByValue(expertProfile.getExpertName());
        getPreferredInput().sendKeys(expertProfile.getExpertPreferredName());
        getAboutInput().sendKeys(expertProfile.getExpertAbout());
        getBlogTitleInput().sendKeys(expertProfile.getExpertBlogTitle());
        getBlogInput().sendKeys(expertProfile.getExpertBlog());
        getBlogPreviewInput().sendKeys(expertProfile.getExpertBlogPreview());

        getUploadImageButton().click();
        waitUntilDisplayed(getImageUploadBrowseButton());

        getImageUploadBrowseInput().sendKeys(getPathToTempFilesFolder()
                + expertProfile.getExpertImage());

        waitUntilDisplayed(getImageUploadButton());

        getImageUploadButton().click();
        waitUntilDisplayed(getImageUploadComplete(), 60);

        getImageUploadCompleteOkButton().click();

        return new ExpertsEditExpertPage(getDriver());
    }

    public ExpertsPage clickCreateExpert() {
        log.info("click Create Expert");
        waitUntilClickable(getCreateExpertButton());
        getCreateExpertButton().click();
        return new ExpertsPage(getDriver());
    }

    public boolean isVisibilitySelectorDisplayed() {
        return isElementPresent(getVisibilitySelect(), 2);
    }

    public void setPublicVisibility() {
        log.info("set Public");
        getVisibilitySelect().selectByVisibleText("Public");
    }

    public void setPrivateVisibility() {
        log.info("set Private");
        getVisibilitySelect().selectByVisibleText("Private");
    }

    public ExpertsCreatedExpertPage clickUpdate() {
        log.info("click update");
        getUpdateButtonWE().click();
        return new ExpertsCreatedExpertPage(getDriver());
    }




}
