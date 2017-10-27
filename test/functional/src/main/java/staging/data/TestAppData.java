package staging.data;

import static staging.data.TestCommonData.getTestRunUniqueFinalValue;

public class TestAppData {

    public static boolean isAppTitleEditedFlag = false;

    public static final String TIME_ZONE = "GMT";

    static final String CREATE_APP_NAME_PREFIX = "autotest_app_name_";

    static final String CREATE_APP_TITLE_PREFIX = "autotest_app_title_";

    static final String CREATE_APP_JOB_NAME_PREFIX = "autotest_app_job_";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_1 = "echo ";

    public static final String CREATE_APP_SCRIPT_BODY_PREFIX_2 = "auto__";

    public static final String EDIT_APP_README_ROW_PREFIX = "# __Auto__ *test* app ";

    public static final String EDIT_APP_README_RICH_PREFIX = "Auto test app ";

    public static final String EDIT_APP_COMMENT_PREFIX = "Auto test app comment ";

    public static final String ADDITIONAL_PART_FOR_EDIT = "_NEW";

    public static final String getAppJobScriptOutput() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_2 + getTestRunUniqueFinalValue();
    }

    public static void setIsAppTitleEditedFlag(boolean flag) {
        isAppTitleEditedFlag = flag;
    }

    public static String getAdditionalEditPartString() {
        return ADDITIONAL_PART_FOR_EDIT;
    }

    public static String getAddonForAppTitle() {
        if (isAppTitleEditedFlag) {
            return getAdditionalEditPartString();
        }
        else {
            return "";
        }
    }

    public static final String getMainAppJobScriptBody() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_1 + getAppJobScriptOutput();
    }

    public static final String getMainAppJobName() {
        return CREATE_APP_JOB_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppName() {
        return CREATE_APP_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppTitle() {
        return CREATE_APP_TITLE_PREFIX + getTestRunUniqueFinalValue() + getAddonForAppTitle();
    }

    public static String getMainAppReadMeRowText() {
        return EDIT_APP_README_ROW_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getMainAppReadMeRichText() {
        return EDIT_APP_README_RICH_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getMainAppExpJobOutput() {
        return getAppJobScriptOutput();
    }

    public static String getAppCommentText() {
        return EDIT_APP_COMMENT_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getUpdatedAppTitle() {
        return CREATE_APP_TITLE_PREFIX + getTestRunUniqueFinalValue() + getAdditionalEditPartString();
    }

}
