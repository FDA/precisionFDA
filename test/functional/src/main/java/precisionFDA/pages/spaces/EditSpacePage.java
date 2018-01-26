package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.SpacesLocators;
import precisionFDA.model.SpaceProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Select;
import ru.yandex.qatools.htmlelements.element.TextInput;

public class EditSpacePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_HOST_LEAD_INPUT)
    private TextInput editSpaceHostLeadInput;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_NAME_INPUT)
    private TextInput editSpaceNameInput;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_DESCR_TEXTAREA)
    private TextInput editSpaceDescrTextarea;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_GUEST_LEAD_INPUT)
    private TextInput editSpaceGuestLeadInput;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_TYPE_SELECT)
    private Select editSpaceTypeSelect;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_CTS_INPUT)
    private TextInput editSpaceCTSInput;

    @FindBy(xpath = SpacesLocators.EDIT_SPACE_CREATE_BUTTON)
    private WebElement editSpaceCreateButton;

    public EditSpacePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.EDIT_SPACE_HOST_LEAD_INPUT));
    }

    public TextInput getEditSpaceHostLeadInput() {
        return editSpaceHostLeadInput;
    }

    public TextInput getEditSpaceNameInput() {
        return editSpaceNameInput;
    }

    public TextInput getEditSpaceDescrTextarea() {
        return editSpaceDescrTextarea;
    }

    public Select getEditSpaceTypeSelect() {
        return editSpaceTypeSelect;
    }

    public TextInput getEditSpaceCTSInput() {
        return editSpaceCTSInput;
    }

    public TextInput getEditSpaceGuestLeadInput() {
        return editSpaceGuestLeadInput;
    }

    public WebElement getEditSpaceCreateButton() {
        return editSpaceCreateButton;
    }

    public void fillSpaceForm(SpaceProfile spaceProfile) {
        log.info("fill new space form");
        getEditSpaceNameInput().sendKeys(spaceProfile.getSpaceName());
        getEditSpaceDescrTextarea().sendKeys(spaceProfile.getSpaceDescription());
        getEditSpaceHostLeadInput().sendKeys(spaceProfile.getSpaceHostLead());
        getEditSpaceGuestLeadInput().sendKeys(spaceProfile.getSpaceGuestLead());

    }

    public SpacesPage clickCreate() {
        log.info("click Create");
        waitUntilClickable(getEditSpaceCreateButton());
        getEditSpaceCreateButton().click();
        return new SpacesPage(getDriver());
    }

}
