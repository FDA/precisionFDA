package precisionFDA.model;

import static precisionFDA.data.TestNotesData.*;
import static precisionFDA.utils.Utils.getCurrentDateTimeValue;

public class NoteProfile {

    private String noteCreatedText;

    private String noteTitleText;

    private String noteRawText;

    private String noteRichText;

    private String commentCreatedText;

    public NoteProfile(final String noteTitleText, final String noteRawText,
                       final String noteRichText, final String noteCreatedText,
                       final String commentCreatedText) {
        this.noteTitleText = noteTitleText;
        this.noteRawText = noteRawText;
        this.noteRichText = noteRichText;
        this.noteCreatedText = noteCreatedText;
        this.commentCreatedText = commentCreatedText;
    }

    public String getNoteTitleText() {
        return noteTitleText;
    }

    public String getNoteRawText() {
        return noteRawText;
    }

    public String getNoteRichText() {
        return noteRichText;
    }

    public String getNoteCreatedText() {
        return noteCreatedText;
    }

    public String getCommentCreatedText() {
        return commentCreatedText;
    }

    public void setNoteCreatedText() {
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

    public void setNoteTitleText(String title) {
        this.noteTitleText = title;
    }

    public void setNoteRawText(String rowBody) {
        this.noteRawText = rowBody;
    }

    public void setNoteRichText(String richBody) {
        this.noteRichText = richBody;
    }

}


