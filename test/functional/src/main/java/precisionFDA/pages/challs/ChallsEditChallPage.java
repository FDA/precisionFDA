package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.model.ChallProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.data.TestChallsData.getChallAtDateTime;

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

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_ENDS_INPUT)
    private TextInput editChallEndsInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_CARD_IMAGE_INPUT)
    private TextInput editChallCardImageInput;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON)
    private WebElement editChallUserOptions;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_CREATE_BUTTON)
    private WebElement editChallCreateButton;

    public ChallsEditChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_EDIT_CHALL_FORM_STATUS_SELECT));
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

    public TextInput getEditChallStartsInput() {
        return editChallStartsInput;
    }

    public TextInput getEditChallEndsInput() {
        return editChallEndsInput;
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
        log.info("fill challenge form");
        getEditChallNameInput().sendKeys(challProfile.getChallName());
        getEditChallDescrInput().sendKeys((challProfile.getChallDescr()));

        String optionFullText = getOptionTextByPartialText(challProfile.getChallScoringAppUser(), ChallsLocators.CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON);
        getEditChallUserSelect().selectByVisibleText(optionFullText);

        // generate date/time and save
        String startsAt = getChallAtDateTime(challProfile.getChallStartsAtFromNowSec());
        String endsAt = getChallAtDateTime(challProfile.getChallStartsAtFromNowSec() + challProfile.getDurationSec());
        challProfile.setChallStartsAt(startsAt);
        challProfile.setChallEndsAt(endsAt);

        getEditChallStartsInput().sendKeys(startsAt);
        getEditChallEndsInput().sendKeys(endsAt);

        getEditChallCardImageInput().sendKeys(challProfile.getChallCardImage());
    }

    public ChallsCreatedChallPage clickCreate() {
        log.info("click Create");
        waitUntilDisplayed(getEditChallCreateButton());
        getEditChallCreateButton().click();
        return new ChallsCreatedChallPage(getDriver());
    }



}
