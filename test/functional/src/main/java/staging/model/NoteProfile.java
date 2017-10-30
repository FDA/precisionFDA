package staging.model;

import static staging.data.TestNotesData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class NoteProfile {

    private String createdNoteText;

    private String titleNoteText;

    private String rowBodyNoteText;

    private String richBodyNoteText;

    public NoteProfile(final String titleNoteText, final String rowBodyNoteText,
                       final String richBodyNoteText, final String createdNoteText) {
        this.titleNoteText = titleNoteText;
        this.rowBodyNoteText = rowBodyNoteText;
        this.richBodyNoteText = richBodyNoteText;
        this.createdNoteText = createdNoteText;
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

    public void setCreatedNoteText() {
        this.createdNoteText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public void setMainTitleNoteText(String title) {
        this.titleNoteText = title;
    }

    public void setMainRowBodyNoteText(String rowBody) {
        this.rowBodyNoteText = rowBody;
    }

    public void setMainRichBodyNoteText(String richBody) {
        this.richBodyNoteText = richBody;
    }

}


