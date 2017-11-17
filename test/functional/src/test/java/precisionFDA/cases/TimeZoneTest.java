package precisionFDA.cases;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.AppProfile;
import precisionFDA.model.NoteProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.apps.AppsEditAppPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.apps.AppsRelevantPage;
import precisionFDA.pages.apps.AppsSavedAppPage;
import precisionFDA.pages.notes.NotesEditNotePage;
import precisionFDA.pages.notes.NotesPage;
import precisionFDA.pages.notes.NotesSavedNotePage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.profile.ProfilePage;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static precisionFDA.data.TestAppData.*;
import static precisionFDA.data.TestDict.getDictTrue;
import static precisionFDA.data.TestNotesData.getNoteTimeZone;
import static precisionFDA.utils.Utils.applyTimezoneToDate;
import static precisionFDA.utils.Utils.isDateTimeCorrect;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Time Zone test suite")
public class TimeZoneTest extends AbstractTest {

    @DataProvider(name="getTimeZoneValue")
    public Object[][] getTimeZoneValue() {
        return new Object[][] {
                {"GMT",         "UTC",                          "(GMT+00:00) UTC"},
                {"GMT-8",       "Pacific Time (US & Canada)",   "(GMT-08:00) Pacific Time (US & Canada)"},
                {"GMT+13:45",   "Chatham Is.",                  "(GMT+13:45) Chatham Is."}
        };
    }

    public String[] getTestTimeZone() {
        return new String[]
                {"GMT+2",       "Athens",               "(GMT+02:00) Athens"};
    }

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        UserProfile user = TestUserData.getTestUser();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

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
        String descr = " | " + timeZone[0] + " | " + timeZone[1];
        printTestHeader("Test Case: check TimeZone can be set" + descr);
        ProfilePage profilePage = openOverviewPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        assertThat(
                profilePage.getSelectedTimeZone())
                .as("selected timezone")
                .isEqualTo(timeZone[1]);
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin"})
    public void checkTimeStamps(String[] timeZone) {
        String descr = " | " + timeZone[0] + " | " + timeZone[1];

        //set timezone
        ProfilePage profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(timeZone);

        printTestHeader("Test Case: check that timestamps are correct through working with notes" + descr);

        //validation
        NoteProfile noteProfile = getNoteTimeZone();
        NotesEditNotePage notesEditNotePage = profilePage.openNotesPage().openNewNoteSaveTime(noteProfile);

        String expNoteCreated = noteProfile.getNoteCreatedText();

        assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on new note form page" + descr)
                .isEqualTo(getDictTrue());

        notesEditNotePage.fillAndSaveNote(noteProfile);
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesPage.getFirstNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on Notes list" + descr)
                .isEqualTo(getDictTrue());

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSavedNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on saved Note form" + descr)
                .isEqualTo(getDictTrue());

        savedNotePage = savedNotePage.leaveCommentSaveTime(noteProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(savedNotePage.getSubmittedCommentTimeText(), expNoteCreated))
                .as("Comment submitted time is correct one" + descr)
                .isEqualTo(getDictTrue());

        notesEditNotePage = savedNotePage.openNoteForEdit();

        SoftAssert.assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on edit note form page" + descr)
                .isEqualTo(getDictTrue());

        profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        notesPage = profilePage.openNotesPage();
        savedNotePage = notesPage.openCreatedNote(noteProfile);

        String actNoteCreated = savedNotePage.getSavedNoteCreatedText();
        String expNoteCreatedTimeZoneApplied = applyTimezoneToDate(expNoteCreated, timeZone[0], getTestTimeZone()[0]);
        SoftAssert.assertThat(
                isDateTimeCorrect(actNoteCreated, expNoteCreatedTimeZoneApplied))
                .as("Created date/time is correct one on saved Note form after TimeZone change from " + timeZone[1] + " to " + getTestTimeZone()[1])
                .isEqualTo(getDictTrue());

        SoftAssert.assertAll();
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin"})
    public void checkAppsTimeStamps(String[] timeZone) {
        String descr = " | " + timeZone[0] + " | " + timeZone[1];
        printTestHeader("Test Case: check that timestamps are correct through working with apps" + descr);

        //set timezone
        ProfilePage profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(timeZone);

        //validation
        AppProfile appProfile = getCheckTimeZoneAppProfile();
        AppsPage appsPage = profilePage.openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getInitAppCreatedText()))
                .as("Created date/time is correct one for newly created app" + descr)
                .isEqualTo(getDictTrue());

        appsSavedAppPage = appsSavedAppPage.openCommentsTab().leaveCommentSaveTime(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getAppsSubmittedCommentTimeText(), appProfile.getAppCommentCreatedText()))
                .as("Comment submitted time is correct one" + descr)
                .isEqualTo(getDictTrue());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.editAndSaveAppTitleWithNewValue(appProfile);

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getCurRevAppCreatedText()))
                .as("Created date/time is correct one for the new revision" + descr)
                .isEqualTo(getDictTrue());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        SoftAssert.assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getInitAppCreatedText()))
                .as("Created date/time is correct one for the first revision" + descr)
                .isEqualTo(getDictTrue());

        profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        AppsRelevantPage appsRelevantPage = profilePage.openAppsPage().openAppsRelevantPage();
        appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        String actCreated = appsSavedAppPage.getActSelectedAppCreated();
        String expCreated = applyTimezoneToDate(appProfile.getCurRevAppCreatedText(), timeZone[0], getTestTimeZone()[0]);
        SoftAssert.assertThat(
                isDateTimeCorrect(actCreated, expCreated))
                .as("Created date/time is correct one App form after TimeZone change from " + timeZone[1] + " to " + getTestTimeZone()[1])
                .isEqualTo(getDictTrue());

        SoftAssert.assertAll();
    }


}
