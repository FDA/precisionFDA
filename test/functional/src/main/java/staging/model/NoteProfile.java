package staging.model;

import static staging.data.TestNotesData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class NoteProfile {

    private final String titleText;

    private final String rowBodyText;

    private final String richBodyText;

    private static String createNoteText;

    public NoteProfile(final String titleText, final String rowBodyText,
                final String richBodyText, final String createNoteText) {
        this.titleText = titleText;
        this.rowBodyText = rowBodyText;
        this.richBodyText = richBodyText;
        this.createNoteText = createNoteText;
    }

    public String getTitleText() {
        return titleText;
    }

    public String getRowBodyText() {
        return rowBodyText;
    }

    public String getRichBodyText() {
        return richBodyText;
    }

    public static NoteProfile getMainNote() {
        return new NoteProfile(getMainTitleText(), getMainRowBodyText(), getMainRichBodyText(), createNoteText);
    }

    public static NoteProfile getNoteToDelete() {
        return new NoteProfile(getTitleToDeleteText(), getRowBodyToDeleteText(), getRichBodyToDeleteText(), createNoteText);
    }

    public static NoteProfile getUpdatedNote() {
        return new NoteProfile(getUpdatedTitleText(), getUpdatedRowBodyText(), getUpdatedRichBodyText(), createNoteText);
    }

    public static NoteProfile getEditNotSavedNote() {
        return new NoteProfile(
                getTitleToEditText() + "update1",
                getRowBodyToEditText() + "update1",
                getRichBodyToEditText() + "update1",
                createNoteText);
    }

    public static NoteProfile getNoteToEdit() {
        return new NoteProfile(getTitleToEditText(), getRowBodyToEditText(), getRichBodyToEditText(), createNoteText);
    }

    public void setCreateNoteText() {
        this.createNoteText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public String getCreateNoteText() {
        return createNoteText.substring(0, 16);
    }

}


