package precisionFDA.data;

import precisionFDA.model.NoteProfile;

import static precisionFDA.data.TestCommonData.getTestRunUniqueFinalValue;
import static precisionFDA.data.TestCommonData.getText1000Symbols;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestNotesData {

    public static final String NEW_NOTE_RAW_BODY_PREFIX = "# __Auto__ *test* note ";

    public static final String NEW_NOTE_RICH_BODY_PREFIX = "Auto test note ";

    public static final String NEW_NOTE_TITLE_PREFIX = "autotest note title ";

    public static final String NOTE_TO_DELETE_TITLE_PREFIX = "note to delete title ";

    public static final String NOTE_TO_EDIT_TITLE_PREFIX = "note to edit title ";

    public static final String NOTE_TO_EDIT_RAW_BODY_PREFIX = "# __Auto__ *test* edit note ";

    public static final String NOTE_TO_EDIT_RICH_BODY_PREFIX = "Auto test edit note ";

    public static final String NOTE_COMMENT_PREFIX = "Auto test note comment ";

    public static final String DEFAULT_TIME_ZONE = "GMT";

    public static NoteProfile mainNoteProfile = new NoteProfile(getNewMainTitleText(), getNewMainRawBodyText(), getNewMainRichBodyText(), "", "");

    public static NoteProfile getNoteToDelete() {
        return new NoteProfile(getTitleToDeleteText(), getRowBodyToDeleteText(), getRichBodyToDeleteText(), "", "");
    }

    public static NoteProfile getNoteToEdit() {
        return new NoteProfile(getTitleToEditText(), getRowBodyToEditText(), getRichBodyToEditText(), "", "");
    }

    public static NoteProfile getNoteTimeZone() {
        return new NoteProfile(getTimeZoneTitleText(), getNewMainRawBodyText(), getNewMainRichBodyText(), "", "");
    }

    public static NoteProfile getMainNoteProfile() {
        return mainNoteProfile;
    }

    public static String getNewMainTitleText() {
        return NEW_NOTE_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getNewMainRawBodyText() {
        return NEW_NOTE_RAW_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols();
    }

    public static String getNewMainRichBodyText() {
        return NEW_NOTE_RICH_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols();
    }

    public static String getTitleToDeleteText() {
        return NOTE_TO_DELETE_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRowBodyToDeleteText() {
        return NEW_NOTE_RAW_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRichBodyToDeleteText() {
        return NEW_NOTE_RICH_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getNoteCommentText() {
        return NOTE_COMMENT_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getTitleToEditText() {
        return NOTE_TO_EDIT_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRowBodyToEditText() {
        return NOTE_TO_EDIT_RAW_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRichBodyToEditText() {
        return NOTE_TO_EDIT_RICH_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getTimeZoneTitleText() {
        return NEW_NOTE_TITLE_PREFIX + getRunTimeLocalUniqueValue() + " " + TestCommonData.getCurrentTimezone();
    }

}
