package precisionFDA.data;

import precisionFDA.model.DiscProfile;

import static precisionFDA.data.TestCommonData.getTestRunUniqueFinalValue;
import static precisionFDA.data.TestCommonData.getText1000Symbols;

public class TestDiscsData {

    public static final String NEW_DISC_RAW_BODY_PREFIX = "# __Auto__ *test* discussion text ";

    public static final String NEW_DISC_RICH_BODY_PREFIX = "Auto test discussion text ";

    public static final String NEW_DISC_TITLE_PREFIX = "autotest discussion title ";

    public static final String DISC_TO_EDIT_TITLE_PREFIX = "discussion edited title ";

    public static final String DISC_TO_EDIT_RAW_BODY_PREFIX = "# __Auto__ *test* edited disc ";

    public static final String DISC_TO_EDIT_RICH_BODY_PREFIX = "Auto test edited disc ";

    public static final String DISC_COMMENT_PREFIX = "Auto test disc comment ";

    public static DiscProfile mainDiscProfile = new DiscProfile(
            getNewMainTitleText(),
            getNewMainRawBodyText(),
            getNewMainRichBodyText()
    );

    public static DiscProfile editDiscProfile = new DiscProfile(
            getEditTitleText(),
            getEditRawBodyText(),
            getEditRichBodyText()
    );

    public static DiscProfile getMainDiscProfile() {
        return mainDiscProfile;
    }

    public static DiscProfile getEditDiscProfile() {
        return editDiscProfile;
    }

    public static String getNewMainTitleText() {
        return NEW_DISC_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getNewMainRawBodyText() {
        return NEW_DISC_RAW_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols();
    }

    public static String getNewMainRichBodyText() {
        return NEW_DISC_RICH_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols();
    }

    public static String getDiscCommentText() {
        return DISC_COMMENT_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getEditTitleText() {
        return DISC_TO_EDIT_TITLE_PREFIX + getTestRunUniqueFinalValue() + "upd";
    }

    public static String getEditRawBodyText() {
        return DISC_TO_EDIT_RAW_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols() + "upd";
    }

    public static String getEditRichBodyText() {
        return DISC_TO_EDIT_RICH_BODY_PREFIX + getTestRunUniqueFinalValue() + getText1000Symbols() + "upd";
    }

}
