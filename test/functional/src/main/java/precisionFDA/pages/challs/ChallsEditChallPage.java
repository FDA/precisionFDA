package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.model.ChallProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.data.TestDict.getDictArchived;
import static precisionFDA.data.TestDict.getDictOpen;
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

    public ChallsEditChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_EDIT_CHALL_FORM_STATUS_SELECT));
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

    public TextInput getEditChallCardImageInput() {
        return editChallCardImageInput;
    }

    public Select getEditChallStatusSelect() {
        return editChallStatusSelect;
    }

    public WebElement getEditChallCreateButton() {
        return editChallCreateButton;
    }

    public void fillChallForm(ChallProfile challProfile) {
        log.info("fill challenge form. Name is: " + challProfile.getChallName());
        getEditChallNameInput().sendKeys(challProfile.getChallName());

        String optionFullText = getOptionTextByPartialText(challProfile.getChallScoringAppUser(), ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON);
        getEditChallUserSelect().selectByVisibleText(optionFullText);

        // generate date/time and save
//        String startsAt = getChallAtDateTime(challProfile.getChallStartsAtFromNowMin());
//        String endsAt = getChallAtDateTime(challProfile.getChallStartsAtFromNowMin() + challProfile.getDurationMin());

        fillStartsAtInput(challProfile);
        fillEndsAtInput(challProfile);

        getPageTitle().click();

        getEditChallDescrInput().sendKeys((challProfile.getChallDescr()));

        getEditChallCardImageInput().sendKeys(challProfile.getChallCardImage());

        challProfile.setChallStartsAt(getEnteredStartsValue());
        challProfile.setChallEndsAt(getEnteredEndsValue());
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

    public ChallsCreatedChallPage clickCreate() {
        log.info("click Create");
        waitUntilDisplayed(getEditChallCreateButton());
        getEditChallCreateButton().click();
        return new ChallsCreatedChallPage(getDriver());
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
