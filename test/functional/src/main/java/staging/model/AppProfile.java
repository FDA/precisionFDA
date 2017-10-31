package staging.model;

import static staging.data.TestAppData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class AppProfile {

    private String appInitNameText;

    private String appInitTitleText;

    private String appInitScriptCodeText;

    private String appInitCreationDateTimeText;

    private String appInitReadMeRowText;

    private String appInitReadMeRichText;

    private String appCurRevNameText;

    private String appCurRevTitleText;

    private String appCurRevScriptCodeText;

    private String appCurRevCreationDateTimeText;

    private String appCurRevReadMeRowText;

    private String appCurRevReadMeRichText;

    private String appTempReadMeRowText;

    private String appTempReadMeRichText;

    private String jobNameText;

    private String jobCreationDateTimeText;

    private String expectedJobOutputText;

    private String appCommentCreatedText;

    public AppProfile(final String appInitNameText,
                      final String appCurRevNameText,

                      final String appInitTitleText,
                      final String appCurRevTitleText,

                      final String appInitScriptCodeText,
                      final String appCurRevScriptCodeText,

                      final String appInitReadMeRowText,
                      final String appTempReadMeRowText,
                      final String appCurRevReadMeRowText,

                      final String appInitReadMeRichText,
                      final String appTempReadMeRichText,
                      final String appCurRevReadMeRichText,

                      final String appInitCreationDateTimeText,
                      final String appCurRevCreationDateTimeText,

                      final String jobNameText,
                      final String jobCreationDateTimeText,
                      final String expectedJobOutputText,

                      final String appCommentCreatedText) {

        this.appInitNameText = appInitNameText;
        this.appCurRevNameText = appCurRevNameText;

        this.appInitTitleText = appInitTitleText;
        this.appCurRevTitleText = appCurRevTitleText;

        this.appInitScriptCodeText = appInitScriptCodeText;
        this.appCurRevScriptCodeText = appCurRevScriptCodeText;

        this.appInitReadMeRowText = appInitReadMeRowText;
        this.appTempReadMeRowText = appTempReadMeRowText;
        this.appCurRevReadMeRowText = appCurRevReadMeRowText;

        this.appInitReadMeRichText = appInitReadMeRichText;
        this.appTempReadMeRichText = appTempReadMeRichText;
        this.appCurRevReadMeRichText = appCurRevReadMeRichText;

        this.appInitCreationDateTimeText = appInitCreationDateTimeText;
        this.appCurRevCreationDateTimeText = appCurRevCreationDateTimeText;

        this.jobNameText = jobNameText;
        this.jobCreationDateTimeText = jobCreationDateTimeText;
        this.expectedJobOutputText = expectedJobOutputText;

        this.appCommentCreatedText = appCommentCreatedText;
    }

    public String getAppInitNameText() {
        return this.appInitNameText.replace(" ", "-");
    }

    public String getAppInitTitleText() {
        return this.appInitTitleText;
    }

    public String getAppInitScriptCodeText() {
        return this.appInitScriptCodeText;
    }

    public String getAppInitCreationDateTimeText() {
        return this.appInitCreationDateTimeText;
    }

    public String getInitReadMeRowText() {
        return this.appInitReadMeRowText;
    }

    public String getInitReadMeRichText() {
        return this.appInitReadMeRichText;
    }

    public String getAppCurRevNameText() {
        return this.appCurRevNameText;
    }

    public String getAppCurRevTitleText() {
        return this.appCurRevTitleText;
    }

    public String getAppCurRevScriptCodeText() {
        return this.appCurRevScriptCodeText;
    }

    public String getAppCurRevCreationDateTimeText() {
        return this.appCurRevCreationDateTimeText;
    }

    public String getCurRevReadMeRowText() {
        return this.appCurRevReadMeRowText;
    }

    public String getCurRevReadMeRichText() {
        return this.appCurRevReadMeRichText;
    }

    public String getTempReadMeRowText() {
        return this.appTempReadMeRowText;
    }

    public String getTempReadMeRichText() {
        return this.appTempReadMeRichText;
    }

    public String getJobNameText() {
        return jobNameText;
    }

    public String getAppCommentCreatedText() {
        return appCommentCreatedText;
    }

    public String getJobCreationDateTimeText() {
        return this.jobCreationDateTimeText;
    }

    public String getExpectedJobOutputText() {
        return this.expectedJobOutputText;
    }

    public void setAppInitCreationDateTimeText() {
        this.appInitCreationDateTimeText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setAppInitCreationDateTimeText(String timezone) {
        this.appInitCreationDateTimeText = getCurrentDateTimeValue(timezone);
    }

    public void setJobCreationDateTimeText() {
        this.jobCreationDateTimeText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setJobCreationDateTimeText(String timezone) {
        this.jobCreationDateTimeText = getCurrentDateTimeValue(timezone);
    }

    public void setAppCurRevNameText(String name) {
        this.appCurRevNameText = name;
    }

    public void setAppCurRevTitleText(String title) {
        this.appCurRevTitleText = title;
    }

    public void setAppCurRevScriptCodeText(String code) {
        this.appCurRevScriptCodeText = code;
    }

    public void setAppCurRevCreationDateTimeText() {
        this.appCurRevCreationDateTimeText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setAppCurRevCreationDateTimeText(String timezone) {
        this.appCurRevCreationDateTimeText =  getCurrentDateTimeValue(timezone);
    }

    public void setAppCurRevReadMeRowText(String row) {
        this.appCurRevReadMeRowText = row;
    }

    public void setAppCurRevReadMeRichText(String rich) {
        this.appCurRevReadMeRichText = rich;
    }

    public void setAppTempReadMeRowText(String row) {
        this.appTempReadMeRowText = row;
    }

    public void setAppTempReadMeRichText(String rich) {
        this.appTempReadMeRichText = rich;
    }

    public void setAppInitNameText(String name) {
        this.appInitNameText = name;
    }

    public void setAppInitTitleText(String title) {
        this.appInitTitleText = title;
    }

    public void setAppCommentCreatedText() {
        this.appCommentCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setAppCommentCreatedText(String timezone) {
        this.appCommentCreatedText = getCurrentDateTimeValue(timezone);
    }

}
