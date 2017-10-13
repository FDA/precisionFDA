package staging.blocks;

import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.annotations.Name;
import ru.yandex.qatools.htmlelements.annotations.Block;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.ProfileDropBlockLocators;

@Name("Profile drop-down menu")
@Block(@FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_BLOCK))
public class ProfileDropBlock extends AbstractBlock {

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_PROFILE_ITEM)
    private Link profileLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_PUBLIC_PROFILE_ITEM)
    private Link publicProfileLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_MANAGE_LICENSES_ITEM)
    private Link manageLicensesLink;

    public void openProfilePage() {
        profileLink.click();
    }

    public void openPublicProfilePage() {
        publicProfileLink.click();
    }

    public void openLicensesPage() {
        manageLicensesLink.click();
    }

}
