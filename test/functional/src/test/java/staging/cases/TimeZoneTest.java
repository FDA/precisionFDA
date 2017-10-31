package staging.cases;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.model.AppProfile;
import staging.model.NoteProfile;
import staging.model.User;
import staging.pages.apps.AppsEditAppPage;
import staging.pages.apps.AppsPage;
import staging.pages.apps.AppsSavedAppPage;
import staging.pages.notes.NotesEditNotePage;
import staging.pages.notes.NotesPage;
import staging.pages.notes.NotesSavedNotePage;
import staging.pages.overview.OverviewPage;
import staging.pages.profile.ProfilePage;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static staging.data.TestAppData.*;
import static staging.data.TestCommonData.getTrueResult;
import static staging.data.TestNotesData.getNoteTimeZone;
import static staging.utils.Utils.isDateTimeCorrect;

@Name("Time Zone test suite")
public class TimeZoneTest extends AbstractTest {

    @DataProvider(name="getTimeZoneValue")
    public Object[][] getTimeZoneValue() {
        return new Object[][] {
                {"GMT", "(GMT+00:00) UTC"},
                {"GMT+12:45", "(GMT+12:45) Chatham Is."},
                {"GMT+9:30", "(GMT+09:30) Darwin"},
                {"GMT+3", "(GMT+03:00) Moscow"},
                {"GMT+13", "(GMT+13:00) Tokelau Is."},
                {"GMT-5", "(GMT-05:00) Quito"},
                {"GMT-11", "(GMT-11:00) American Samoa"},
                {"GMT+10", "(GMT+10:00) Brisbane"},
                {"GMT+10", "(GMT+10:00) Hobart"},
                {"GMT-8", "(GMT-08:00) America/Los_Angeles"}
        };
    }

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        User user = User.getTestUser();
        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        SoftAssert.assertAll();
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin" })
    public void setTimeZone(String[] timeZone) {
        printTestHeader("Test Case: check TimeZone can be set | " + timeZone[1]);
        ProfilePage profilePage = getCommonPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        assertThat(
                profilePage.getSelectedTimeZone())
                .as("selected timezone")
                .isEqualTo(timeZone[1]);
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin", "setTimeZone"})
    public void checkNotesTimeStamps(String[] timeZone) {
        String timezoneDescr = " | " + timeZone[1];
        printTestHeader("Test Case: check that timestamps are correct through working with notes" + timezoneDescr);

        //set timezone
        ProfilePage profilePage = getCommonPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        //validation
        NoteProfile noteProfile = getNoteTimeZone();
        NotesEditNotePage notesEditNotePage = getCommonPage().openNotesPage().openNewNotePage(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), noteProfile.getNoteCreatedText()))
                .as("Created date/time is correct one on new note form page" + timezoneDescr)
                .isEqualTo(getTrueResult());

        notesEditNotePage.fillAndSaveNote(noteProfile);
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesPage.getFirstNoteCreatedText(), noteProfile.getNoteCreatedText()))
                .as("Created date/time is correct one on Notes list" + timezoneDescr)
                .isEqualTo(getTrueResult());

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSavedNoteCreatedText(), noteProfile.getNoteCreatedText()))
                .as("Created date/time is correct one on saved Note form" + timezoneDescr)
                .isEqualTo(getTrueResult());

        savedNotePage = savedNotePage.leaveComment(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSubmittedCommentTimeText(), noteProfile.getCommentCreatedText()))
                .as("Comment submitted time is correct one" + timezoneDescr)
                .isEqualTo(getTrueResult());

        notesEditNotePage = savedNotePage.openNoteForEdit();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), noteProfile.getNoteCreatedText()))
                .as("Created date/time is correct one on edit note form page" + timezoneDescr)
                .isEqualTo(getTrueResult());

        SoftAssert.assertAll();
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin", "setTimeZone"})
    public void checkAppsTimeStamps(String[] timeZone) {
        String timezoneDescr = " | " + timeZone[1];
        printTestHeader("Test Case: check that timestamps are correct through working with apps" + timezoneDescr);

        //set timezone
        ProfilePage profilePage = getCommonPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        //validation
        AppProfile appProfile = getCheckTimeZoneProfile();
        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewAppForm(appProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getAppInitCreationDateTimeText()))
                .as("Created date/time is correct one for newly created app" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsSavedAppPage = appsSavedAppPage.openCommentsTab().writeComment(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getAppsSubmittedCommentTimeText(), appProfile.getAppCommentCreatedText()))
                .as("Comment submitted time is correct one" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.editAndSaveAppTitleWithNewValue(appProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getAppCurRevCreationDateTimeText()))
                .as("Created date/time is correct one for the new revision" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getAppInitCreationDateTimeText()))
                .as("Created date/time is correct one for the first revision" + timezoneDescr)
                .isEqualTo(getTrueResult());

        SoftAssert.assertAll();
    }


}
