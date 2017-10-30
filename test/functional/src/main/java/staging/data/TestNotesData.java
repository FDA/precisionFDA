package staging.data;

import staging.model.NoteProfile;

import static staging.data.TestCommonData.getTestRunUniqueFinalValue;

public class TestNotesData {

    public static final String NEW_NOTE_ROW_BODY_PREFIX = "# __Auto__ *test* note ";

    public static final String NEW_NOTE_RICH_BODY_PREFIX = "Auto test note ";

    public static final String NEW_NOTE_TITLE_PREFIX = "autotest note title ";

    public static final String NOTE_TO_DELETE_TITLE_PREFIX = "note to delete title ";

    public static final String NOTE_TO_EDIT_TITLE_PREFIX = "note to edit title ";

    public static final String NOTE_TO_EDIT_ROW_BODY_PREFIX = "# __Auto__ *test* edit note ";

    public static final String NOTE_TO_EDIT_RICH_BODY_PREFIX = "Auto test edit note ";

    public static final String ADDITIONAL_PART_FOR_EDIT = "_UPDATE";

    public static final String NOTE_COMMENT_PREFIX = "Auto test note comment ";

    public static final String TIME_ZONE = "GMT";

    public static NoteProfile mainNote = new NoteProfile(getNewMainTitleText(), getNewMainRowBodyText(), getNewMainRichBodyText(), "");

    public static NoteProfile noteToDelete = new NoteProfile(getTitleToDeleteText(), getRowBodyToDeleteText(), getRichBodyToDeleteText(), "");

    public static NoteProfile noteToEdit = new NoteProfile(getTitleToEditText(), getRowBodyToEditText(), getRichBodyToEditText(), "");

    public static NoteProfile getMainNote() {
        return mainNote;
    }

    public static NoteProfile getNoteToEdit() {
        return noteToEdit;
    }

    public static NoteProfile getNoteToDelete() {
        return noteToDelete;
    }

    public static String getNewMainTitleText() {
        return NEW_NOTE_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getNewMainRowBodyText() {
        return NEW_NOTE_ROW_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getNewMainRichBodyText() {
        return NEW_NOTE_RICH_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getTitleToDeleteText() {
        return NOTE_TO_DELETE_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRowBodyToDeleteText() {
        return NEW_NOTE_ROW_BODY_PREFIX + getTestRunUniqueFinalValue();
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
        return NOTE_TO_EDIT_ROW_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getRichBodyToEditText() {
        return NOTE_TO_EDIT_RICH_BODY_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getAddon() {
        return ADDITIONAL_PART_FOR_EDIT;
    }


}
