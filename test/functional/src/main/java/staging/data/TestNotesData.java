package staging.data;

import static staging.data.TestCommonData.getTestRunUniqueFinalValue;

public class TestNotesData {

    public static final String NEW_NOTE_ROW_BODY_PREFIX = "# __Auto__ *test* note ";

    public static final String NEW_NOTE_RICH_BODY_PREFIX = "Auto test note ";

    public static final String NEW_NOTE_TITLE_PREFIX = "autotest note title ";

    public static final String NOTE_TO_DELETE_TITLE_PREFIX = "note to delete title ";

    public static final String NOTE_TO_EDIT_TITLE_PREFIX = "note to edit title ";

    public static final String NOTE_TO_EDIT_ROW_BODY_PREFIX = "# __Auto__ *test* edit note ";

    public static final String NOTE_TO_EDIT_RICH_BODY_PREFIX = "Auto test edit note ";

    public static final String ADDITIONAL_PART_FOR_EDIT = "_NEW";

    public static final String NOTE_COMMENT_PREFIX = "Auto test note comment ";

    public static final String TIME_ZONE = "GMT";

    public static boolean isNoteTitleEditedFlag;

    public static boolean isNoteBodyEditedFlag;

    public static String getAddonForNoteTitle() {
        if (isNoteTitleEditedFlag) {
            return ADDITIONAL_PART_FOR_EDIT;
        }
        else {
            return "";
        }
    }

    public static String getAddonForNoteBody() {
        if (isNoteBodyEditedFlag) {
            return ADDITIONAL_PART_FOR_EDIT;
        }
        else {
            return "";
        }
    }

    public static void setIsNoteTitleEditedFlag(boolean flag) {
        isNoteTitleEditedFlag = flag;
    }

    public static void setIsNoteBodyEditedFlag(boolean flag) {
        isNoteBodyEditedFlag = flag;
    }

    public static String getMainTitleText() {
        return NEW_NOTE_TITLE_PREFIX + getTestRunUniqueFinalValue() + getAddonForNoteTitle();
    }

    public static String getMainRowBodyText() {
        return NEW_NOTE_ROW_BODY_PREFIX + getTestRunUniqueFinalValue() + getAddonForNoteBody();
    }

    public static String getMainRichBodyText() {
        return NEW_NOTE_RICH_BODY_PREFIX + getTestRunUniqueFinalValue() + getAddonForNoteBody();
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

    public static String getUpdatedTitleText() {
        return NEW_NOTE_TITLE_PREFIX + getTestRunUniqueFinalValue() + ADDITIONAL_PART_FOR_EDIT;
    }

    public static String getUpdatedRowBodyText() {
        return NEW_NOTE_ROW_BODY_PREFIX + getTestRunUniqueFinalValue() + ADDITIONAL_PART_FOR_EDIT;
    }

    public static String getUpdatedRichBodyText() {
        return NEW_NOTE_RICH_BODY_PREFIX + getTestRunUniqueFinalValue() + ADDITIONAL_PART_FOR_EDIT;
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


}
