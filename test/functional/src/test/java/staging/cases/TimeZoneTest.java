package staging.cases;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.AppProfile;
import staging.model.NoteProfile;
import staging.model.User;
import staging.pages.apps.AppsEditAppPage;
import staging.pages.apps.AppsPage;
import staging.pages.apps.AppsRelevantPage;
import staging.pages.apps.AppsSavedAppPage;
import staging.pages.notes.NotesEditNotePage;
import staging.pages.notes.NotesPage;
import staging.pages.notes.NotesSavedNotePage;
import staging.pages.overview.OverviewPage;
import staging.pages.profile.ProfilePage;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static staging.data.TestAppData.*;
import static staging.data.TestDict.getTrueResult;
import static staging.data.TestNotesData.getNoteTimeZone;
import static staging.utils.Utils.applyTimezoneToDate;
import static staging.utils.Utils.isDateTimeCorrect;

@Name("Time Zone test suite")
public class TimeZoneTest extends AbstractTest {

    @DataProvider(name="getTimeZoneValue")
    public Object[][] getTimeZoneValue() {
        return new Object[][] {
                {"GMT",         "(GMT+00:00) UTC"},
                {"GMT-8",       "(GMT-08:00) America/Los_Angeles"},
                {"GMT+12:45",   "(GMT+12:45) Chatham Is."}
        };
    }

    public String[] getTestTimeZone() {
        return new String[]
                {"GMT+2",       "(GMT+02:00) Athens"};
    }

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        User user = TestUserData.getTestUser();
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
            dependsOnMethods = { "successfulLogin" },
            enabled = false)
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
            dependsOnMethods = { "successfulLogin"})
    public void checkTimeStamps(String[] timeZone) {
        String timezoneDescr = " | " + timeZone[1];

        //set timezone
        ProfilePage profilePage = getCommonPage().openProfilePage();
        profilePage = profilePage.setTimeZone(timeZone);

        printTestHeader("Test Case: check that timestamps are correct through working with notes" + timezoneDescr);

        //validation
        NoteProfile noteProfile = getNoteTimeZone();
        NotesEditNotePage notesEditNotePage = profilePage.openNotesPage().openNewNoteSaveTime(noteProfile);

        String expNoteCreated = noteProfile.getNoteCreatedText();

        assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on new note form page" + timezoneDescr)
                .isEqualTo(getTrueResult());

        notesEditNotePage.fillAndSaveNote(noteProfile);
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesPage.getFirstNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on Notes list" + timezoneDescr)
                .isEqualTo(getTrueResult());

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSavedNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on saved Note form" + timezoneDescr)
                .isEqualTo(getTrueResult());

        savedNotePage = savedNotePage.leaveCommentSaveTime(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSubmittedCommentTimeText(), expNoteCreated))
                .as("Comment submitted time is correct one" + timezoneDescr)
                .isEqualTo(getTrueResult());

        notesEditNotePage = savedNotePage.openNoteForEdit();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on edit note form page" + timezoneDescr)
                .isEqualTo(getTrueResult());

        profilePage = getCommonPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        notesPage = profilePage.openNotesPage();
        savedNotePage = notesPage.openCreatedNote(noteProfile);

        String actNoteCreated = savedNotePage.getSavedNoteCreatedText();
        String expNoteCreatedTimeZoneApplied = applyTimezoneToDate(expNoteCreated, timeZone[0], getTestTimeZone()[0]);
        SoftAssert.assertThat(
                isDateTimeCorrect(actNoteCreated, expNoteCreatedTimeZoneApplied))
                .as("Created date/time is correct one on saved Note form after TimeZone change from " + timeZone[1] + " to " + getTestTimeZone()[1])
                .isEqualTo(getTrueResult());

        SoftAssert.assertAll();
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin"})
    public void checkAppsTimeStamps(String[] timeZone) {
        String timezoneDescr = " | " + timeZone[1];
        printTestHeader("Test Case: check that timestamps are correct through working with apps" + timezoneDescr);

        //set timezone
        ProfilePage profilePage = getCommonPage().openProfilePage();
        profilePage = profilePage.setTimeZone(timeZone);

        //validation
        AppProfile appProfile = getCheckTimeZoneProfile();
        AppsPage appsPage = profilePage.openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getInitAppCreatedText()))
                .as("Created date/time is correct one for newly created app" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsSavedAppPage = appsSavedAppPage.openCommentsTab().leaveCommentSaveTime(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getAppsSubmittedCommentTimeText(), appProfile.getAppCommentCreatedText()))
                .as("Comment submitted time is correct one" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.editAndSaveAppTitleWithNewValue(appProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getCurRevAppCreatedText()))
                .as("Created date/time is correct one for the new revision" + timezoneDescr)
                .isEqualTo(getTrueResult());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getInitAppCreatedText()))
                .as("Created date/time is correct one for the first revision" + timezoneDescr)
                .isEqualTo(getTrueResult());

        profilePage = getCommonPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        AppsRelevantPage appsRelevantPage = profilePage.openAppsPage().openAppsRelevantPage();
        appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        String actCreated = appsSavedAppPage.getActSelectedAppCreated();
        String expCreated = applyTimezoneToDate(appProfile.getCurRevAppCreatedText(), timeZone[0], getTestTimeZone()[0]);
        SoftAssert.assertThat(
                isDateTimeCorrect(actCreated, expCreated))
                .as("Created date/time is correct one App form after TimeZone change from " + timeZone[1] + " to " + getTestTimeZone()[1])
                .isEqualTo(getTrueResult());

        SoftAssert.assertAll();
    }


}
