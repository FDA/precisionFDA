package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.model.ChallProfile;
import precisionFDA.model.FileProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.data.TestDict.getDictArchived;
import static precisionFDA.data.TestDict.getDictOpen;
import static precisionFDA.data.TestFilesData.getChallCardFile;
import static precisionFDA.utils.TestRunConfig.getPathToTempFilesFolder;
import static precisionFDA.utils.Utils.sleep;

public class ChallsEditChallPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_STATUS_SELECT)
    private Select editChallStatusSelect;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_NAME_INPUT)
    private TextInput editChallNameInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_DESCR_TEXTAREA)
    private TextInput editChallDescrInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_SELECT)
    private Select editChallUserSelect;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_STARTS_INPUT)
    private TextInput editChallStartsInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_STARTS_VISIBLE_ELEMENT)
    private WebElement editChallStartsVisibleElement;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_ENDS_VISIBLE_ELEMENT)
    private WebElement editChallEndsVisibleElement;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_ENDS_INPUT)
    private TextInput editChallEndsInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_CARD_IMAGE_INPUT)
    private TextInput editChallCardImageInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON)
    private WebElement editChallUserOptions;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_CREATE_BUTTON)
    private WebElement editChallCreateButton;

    @FindBy(xpath = ChallsLocators.CHALLS_BOOTSTRAP_CALENDAR_POPUP)
    private WebElement bootstrapCalendarPopup;

    @FindBy(xpath = ChallsLocators.CHALLS_BOOTSTRAP_CALENDAR_POPUP_INCR_MIN_ARROW)
    private Link bootstrapCalendarPopupIncrMinArrow;

    @FindBy(xpath = ChallsLocators.CHALLS_PAGE_TITLE)
    private WebElement pageTitle;

    @FindBy(xpath = ChallsLocators.CHALLS_BOOTSTRAP_CALENDAR_POPUP_TIME_ICON)
    private Link bootstrapCalendarPopupTimeIcon;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_UPDATE_BUTTON)
    private WebElement updateButton;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALLENGE_ANNOUNCE_RESULT_BUTTON_LINK)
    private Link announceResultButtonLink;

    @FindBy(xpath = ChallsLocators.EDIT_CHALL_BROWSE_IMAGE_BUTTON)
    private Button browseImageButton;

    @FindBy(xpath = ChallsLocators.EDIT_CHALL_MODAL_BROWSE_IMAGE_INPUT)
    private TextInput modalBrowseImageInput;

    @FindBy(xpath = ChallsLocators.EDIT_CHALL_MODAL_UPLOAD_IMAGE_BUTTON)
    private Button modalUploadImageButton;

    @FindBy(xpath = ChallsLocators.EDIT_CHALL_MODAL_UPLOAD_IMAGE_OK_BUTTON)
    private Button modalUploadImageOkButton;

    @FindBy(xpath = ChallsLocators.EDIT_CHALL_MODAL_BROWSE_IMAGE_VISIBLE)
    private WebElement modalUploadImageVisible;

    public ChallsEditChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_EDIT_CHALL_FORM_STATUS_SELECT));
    }

    public WebElement getModalUploadImageVisible() {
        return modalUploadImageVisible;
    }

    public Button getModalUploadImageOkButton() {
        return modalUploadImageOkButton;
    }

    public Button getBrowseImageButton() {
        return browseImageButton;
    }

    public TextInput getModalBrowseImageInput() {
        return modalBrowseImageInput;
    }

    public Button getModalUploadImageButton() {
        return modalUploadImageButton;
    }

    public Link getAnnounceResultButtonLink() {
        return announceResultButtonLink;
    }

    public WebElement getUpdateButton() {
        return updateButton;
    }

    public TextInput getEditChallStartsInput() {
        return editChallStartsInput;
    }

    public TextInput getEditChallEndsInput() {
        return editChallEndsInput;
    }

    public Link getBootstrapCalendarPopupTimeIcon() {
        return bootstrapCalendarPopupTimeIcon;
    }

    public WebElement getPageTitle() {
        return pageTitle;
    }

    public Link getBootstrapCalendarPopupIncrMinArrow() {
        return bootstrapCalendarPopupIncrMinArrow;
    }

    public WebElement getBootstrapCalendarPopup() {
        return bootstrapCalendarPopup;
    }

    public TextInput getEditChallNameInput() {
        return editChallNameInput;
    }

    public TextInput getEditChallDescrInput() {
        return editChallDescrInput;
    }

    public Select getEditChallUserSelect() {
        return editChallUserSelect;
    }

    public WebElement getEditChallStartsVisibleElement() {
        return editChallStartsVisibleElement;
    }

    public WebElement getEditChallEndsVisibleElement() {
        return editChallEndsVisibleElement;
    }

    public Select getEditChallStatusSelect() {
        return editChallStatusSelect;
    }

    public WebElement getEditChallCreateButton() {
        return editChallCreateButton;
    }

    public ChallsCreatedChallPage fillAndSaveChallForm(ChallProfile challProfile) {
        log.info("fill challenge form. Name is: " + challProfile.getChallName());

        // upload image
        FileProfile fileProfile = getChallCardFile();
        log.info("upload image");
        clickUploadImage();
        getModalBrowseImageInput().sendKeys(getPathToTempFilesFolder() + fileProfile.getFileName());
        isElementPresent(getModalUploadImageButton(), 10);
        getModalUploadImageButton().click();
        isElementPresent(getModalUploadImageOkButton(), 60);
        getModalUploadImageOkButton().click();

        getEditChallNameInput().sendKeys(challProfile.getChallName());

        String optionFullText = getOptionTextByPartialText(challProfile.getChallScoringAppUser(), ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON);
        getEditChallUserSelect().selectByVisibleText(optionFullText);

        fillStartsAtInput(challProfile);
        fillEndsAtInput(challProfile);

        getPageTitle().click();

        getEditChallDescrInput().sendKeys((challProfile.getChallDescr()));

        challProfile.setChallStartsAt(getEnteredStartsValue());
        challProfile.setChallEndsAt(getEnteredEndsValue());

        clickCreate();

        return new ChallsCreatedChallPage(getDriver());
    }

    public void clickUploadImage() {
        getBrowseImageButton().click();
        isElementPresent(getModalUploadImageVisible(), 20);
    }

    public void fillStartsAtInput(ChallProfile challProfile) {
        getEditChallStartsVisibleElement().click();
        WebElement calendar = getBootstrapCalendarPopup();
        waitUntilDisplayed(calendar, 2);

        getBootstrapCalendarPopupTimeIcon().click();
        sleep(200);

        Link arrow = getBootstrapCalendarPopupIncrMinArrow();

        for (int i = 0; i <= challProfile.getChallStartsAtFromNowMin(); i ++) {
            arrow.click();
            sleep(100);
        }
    }

    public void fillEndsAtInput(ChallProfile challProfile) {
        getEditChallEndsVisibleElement().click();
        WebElement calendar = getBootstrapCalendarPopup();
        waitUntilDisplayed(calendar, 2);

        getBootstrapCalendarPopupTimeIcon().click();
        sleep(200);

        Link arrow = getBootstrapCalendarPopupIncrMinArrow();

        for (int i = 0; i <= challProfile.getChallStartsAtFromNowMin() + challProfile.getDurationMin(); i ++) {
            arrow.click();
            sleep(100);
        }
    }

    public String getEnteredStartsValue() {
        return getEditChallStartsInput().getWrappedElement().getAttribute("value");
    }

    public String getEnteredEndsValue() {
        return getEditChallEndsInput().getWrappedElement().getAttribute("value");
    }

    public void clickCreate() {
        log.info("click Create");
        waitUntilDisplayed(getEditChallCreateButton());
        getEditChallCreateButton().click();
    }

    public void setOpenStatus() {
        getEditChallStatusSelect().selectByVisibleText(getDictOpen());
    }

    public void setArchivedStatus() {
        getEditChallStatusSelect().selectByVisibleText(getDictArchived());
    }

    public ChallsCreatedChallPage clickUpdate() {
        log.info("click Update");
        getUpdateButton().click();
        return new ChallsCreatedChallPage(getDriver());
    }

    public boolean isAnnounceResultButtonDisplayed() {
        return isElementPresent(getAnnounceResultButtonLink(), 5);
    }

    public ChallsCreatedChallPage clickAnnounceResult() {
        log.info("click Announce Result");
        getAnnounceResultButtonLink().click();
        return new ChallsCreatedChallPage(getDriver());
    }


}
