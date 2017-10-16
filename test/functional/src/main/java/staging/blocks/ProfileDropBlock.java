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

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_ABOUT_ITEM)
    private Link aboutLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_GUIDELINES_ITEM)
    private Link guidelinesLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_DOCS_ITEM)
    private Link docsLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_MANAGE_LOGOUT_ITEM)
    private Link logoutLink;

    public void openProfilePage() {
        profileLink.click();
    }

    public void openPublicProfilePage() {
        publicProfileLink.click();
    }

    public void openLicensesPage() {
        manageLicensesLink.click();
    }

    public void openAboutPage() {
        aboutLink.click();
    }

    public void openGuidelinesPage() {
        guidelinesLink.click();
    }

    public void openDocsPage() {
        docsLink.click();
    }

    public void logout() {
        logoutLink.click();
    }

}
