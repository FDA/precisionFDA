package precisionFDA.cases;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import precisionFDA.model.TimeZoneProfile;
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
import static precisionFDA.data.TimeZonesData.getChathamTimeZone;
import static precisionFDA.data.TimeZonesData.getPacificTimeZone;
import static precisionFDA.data.TimeZonesData.getUtcTimeZone;
import static precisionFDA.utils.Utils.applyTimezoneToDate;
import static precisionFDA.utils.Utils.isDateTimeCorrect;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Time Zone test suite")
public class TimeZoneTest extends AbstractTest {

    @DataProvider(name="getTimeZoneValue")
    public Object[][] getTimeZoneValue() {
        return new Object[][] {
                { getPacificTimeZone() },
                { getChathamTimeZone() }
        };
    }

    public TimeZoneProfile getTestTimeZone() {
        return getUtcTimeZone();
    }

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        UserProfile user = TestUserData.getTestUserOne();
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
    public void setTimeZone(TimeZoneProfile timeZone) {
        String descr = " | " + timeZone.getZoneTime() + " | " + timeZone.getLocation();
        printTestHeader("Test Case: check TimeZone can be set" + descr);
        ProfilePage profilePage = openOverviewPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        assertThat(
                profilePage.getSelectedTimeZone())
                .as("selected timezone")
                .isEqualTo(timeZone.getTimeAndLocation());
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin"})
    public void checkTimeStamps(TimeZoneProfile timeZone) {
        String descr = " | " + timeZone.getZoneTime() + " | " + timeZone.getLocation();

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

        assertThat(
                isDateTimeCorrect(notesPage.getFirstNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on Notes list" + descr)
                .isEqualTo(getDictTrue());

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        assertThat(
                isDateTimeCorrect(savedNotePage.getSavedNoteCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on saved Note form" + descr)
                .isEqualTo(getDictTrue());

        notesEditNotePage = savedNotePage.openNoteForEdit();

        assertThat(
                isDateTimeCorrect(notesEditNotePage.getCreatedText(), expNoteCreated))
                .as("Created date/time is correct one on edit note form page" + descr)
                .isEqualTo(getDictTrue());

        profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        notesPage = profilePage.openNotesPage();
        savedNotePage = notesPage.openCreatedNote(noteProfile);

        String actNoteCreated = savedNotePage.getSavedNoteCreatedText();
        String expNoteCreatedTimeZoneApplied = applyTimezoneToDate(expNoteCreated, timeZone.getZoneTime(), getTestTimeZone().getZoneTime());

        assertThat(
                isDateTimeCorrect(actNoteCreated, expNoteCreatedTimeZoneApplied))
                .as("Created date/time is correct one on saved Note form after TimeZone change from " + timeZone.getTimeAndLocation() +
                        " to " + getTestTimeZone().getTimeAndLocation())
                .isEqualTo(getDictTrue());
    }

    @Test(dataProvider = "getTimeZoneValue", dataProviderClass = TimeZoneTest.class,
            dependsOnMethods = { "successfulLogin"})
    public void checkAppsTimeStamps(TimeZoneProfile timeZone) {
        String descr = " | " + timeZone.getZoneTime() + " | " + timeZone.getLocation();
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

        assertThat(
                isDateTimeCorrect(appsSavedAppPage.getAppsSubmittedCommentTimeText(), appProfile.getAppCommentCreatedText()))
                .as("Comment submitted time is correct one" + descr)
                .isEqualTo(getDictTrue());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.editAndSaveAppTitleWithNewValue(appProfile);

        assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getCurRevAppCreatedText()))
                .as("Created date/time is correct one for the new revision" + descr)
                .isEqualTo(getDictTrue());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        assertThat(
                isDateTimeCorrect(appsSavedAppPage.getActSelectedAppCreated(), appProfile.getInitAppCreatedText()))
                .as("Created date/time is correct one for the first revision" + descr)
                .isEqualTo(getDictTrue());

        profilePage = openOverviewPage().openProfilePage();
        profilePage = profilePage.setTimeZone(getTestTimeZone());

        AppsRelevantPage appsRelevantPage = profilePage.openAppsPage().openAppsRelevantPage();
        appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);

        String actCreated = appsSavedAppPage.getActSelectedAppCreated();
        String expCreated = applyTimezoneToDate(appProfile.getCurRevAppCreatedText(), timeZone.getZoneTime(), getTestTimeZone().getZoneTime());

        assertThat(
                isDateTimeCorrect(actCreated, expCreated))
                .as("Created date/time is correct one App form after TimeZone change from "
                        + timeZone.getTimeAndLocation() + " to "
                        + getTestTimeZone().getTimeAndLocation())
                .isEqualTo(getDictTrue());
    }

}
