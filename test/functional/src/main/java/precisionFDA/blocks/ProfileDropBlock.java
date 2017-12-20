package precisionFDA.blocks;

import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.annotations.Name;
import ru.yandex.qatools.htmlelements.annotations.Block;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.ProfileDropBlockLocators;

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

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_ADMINDASHBOARD_ITEM)
    private Link adminDashboardLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_DOCS_ITEM)
    private Link docsLink;

    @FindBy(xpath = ProfileDropBlockLocators.PROFILE_DROPDOWN_MANAGE_LOGOUT_ITEM)
    private Link logoutLink;

    public Link getProfileLink() {
        return profileLink;
    }

    public Link getAboutLink() {
        return aboutLink;
    }

    public Link getManageLicensesLink() {
        return manageLicensesLink;
    }

    public Link getDocsLink() {
        return docsLink;
    }

    public Link getPublicProfileLink() {
        return publicProfileLink;
    }

    public Link getGuidelinesLink() {
        return guidelinesLink;
    }

    public Link getAdminDashboardLink() {
        return adminDashboardLink;
    }

    public Link getLogoutLink() {
        return logoutLink;
    }

    public void openProfilePage() {
        getProfileLink().click();
    }

    public void openPublicProfilePage() {
        getPublicProfileLink().click();
    }

    public void openLicensesPage() {
        getManageLicensesLink().click();
    }

    public void openAboutPage() {
        getAboutLink().click();
    }

    public void openGuidelinesPage() {
        getGuidelinesLink().click();
    }

    public void openAdminDashboardPage() {
        getAdminDashboardLink().click();
    }

    public void openDocsPage() {
        getDocsLink().click();
    }

    public void logout() {
        getLogoutLink().click();
    }

}
