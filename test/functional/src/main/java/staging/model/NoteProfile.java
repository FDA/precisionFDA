package staging.model;

import static staging.data.TestNotesData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class NoteProfile {

    private String noteCreatedText;

    private String titleNoteText;

    private String rowBodyNoteText;

    private String richBodyNoteText;

    private String commentCreatedText;

    public NoteProfile(final String titleNoteText, final String rowBodyNoteText,
                       final String richBodyNoteText, final String noteCreatedText,
                       final String commentCreatedText) {
        this.titleNoteText = titleNoteText;
        this.rowBodyNoteText = rowBodyNoteText;
        this.richBodyNoteText = richBodyNoteText;
        this.noteCreatedText = noteCreatedText;
        this.commentCreatedText = commentCreatedText;
    }

    public String getTitleNoteText() {
        return titleNoteText;
    }

    public String getRowBodyNoteText() {
        return rowBodyNoteText;
    }

    public String getRichBodyNoteText() {
        return richBodyNoteText;
    }

    public String getNoteCreatedText() {
        return noteCreatedText;
    }

    public String getCommentCreatedText() {
        return commentCreatedText;
    }

    public void setCreatedNoteText() {
        this.noteCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setNoteCreatedText(String timezone) {
        this.noteCreatedText = getCurrentDateTimeValue(timezone);
    }

    public void setCommentCreatedText() {
        this.commentCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setCommentCreatedText(String timezone) {
        this.commentCreatedText = getCurrentDateTimeValue(timezone);
    }

    public void setTitleNoteText(String title) {
        this.titleNoteText = title;
    }

    public void setRowBodyNoteText(String rowBody) {
        this.rowBodyNoteText = rowBody;
    }

    public void setRichBodyNoteText(String richBody) {
        this.richBodyNoteText = richBody;
    }

}


