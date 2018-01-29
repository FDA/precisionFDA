package precisionFDA.model;

import static precisionFDA.data.TestAppData.*;
import static precisionFDA.utils.Utils.getCurrentDateTimeValue;

public class AppProfile {

    private String initNameText;

    private String initTitleText;

    private String initScriptText;

    private String initAppCreatedText;

    private String initReadMeRawText;

    private String initReadMeRichText;

    private String curRevNameText;

    private String curRevTitleText;

    private String curRevScriptText;

    private String curRevAppCreatedText;

    private String curRevReadMeRawText;

    private String curRevReadMeRichText;

    private String tempReadMeRawText;

    private String tempReadMeRichText;

    private String jobNameText;

    private String jobCreatedText;

    private String expectedJobOutputText;

    private String appCommentCreatedText;

    public AppProfile(final String initNameText,
                      final String curRevNameText,

                      final String initTitleText,
                      final String curRevTitleText,

                      final String initScriptText,
                      final String curRevScriptText,

                      final String initReadMeRawText,
                      final String tempReadMeRawText,
                      final String curRevReadMeRawText,

                      final String initReadMeRichText,
                      final String tempReadMeRichText,
                      final String curRevReadMeRichText,

                      final String initAppCreatedText,
                      final String curRevAppCreatedText,

                      final String jobNameText,
                      final String jobCreatedText,
                      final String expectedJobOutputText,

                      final String appCommentCreatedText) {

        this.initNameText = initNameText;
        this.curRevNameText = curRevNameText;

        this.initTitleText = initTitleText;
        this.curRevTitleText = curRevTitleText;

        this.initScriptText = initScriptText;
        this.curRevScriptText = curRevScriptText;

        this.initReadMeRawText = initReadMeRawText;
        this.tempReadMeRawText = tempReadMeRawText;
        this.curRevReadMeRawText = curRevReadMeRawText;

        this.initReadMeRichText = initReadMeRichText;
        this.tempReadMeRichText = tempReadMeRichText;
        this.curRevReadMeRichText = curRevReadMeRichText;

        this.initAppCreatedText = initAppCreatedText;
        this.curRevAppCreatedText = curRevAppCreatedText;

        this.jobNameText = jobNameText;
        this.jobCreatedText = jobCreatedText;
        this.expectedJobOutputText = expectedJobOutputText;

        this.appCommentCreatedText = appCommentCreatedText;
    }

    public String getInitNameText() {
        return this.initNameText.replace(" ", "-");
    }

    public String getInitTitleText() {
        return this.initTitleText;
    }

    public String getInitScriptText() {
        return this.initScriptText;
    }

    public String getInitAppCreatedText() {
        return this.initAppCreatedText;
    }

    public String getInitReadMeRawText() {
        return this.initReadMeRawText;
    }

    public String getInitReadMeRichText() {
        return this.initReadMeRichText;
    }

    public String getCurRevNameText() {
        return this.curRevNameText;
    }

    public String getCurRevTitleText() {
        return this.curRevTitleText;
    }

    public String getCurRevScriptText() {
        return this.curRevScriptText;
    }

    public String getCurRevAppCreatedText() {
        return this.curRevAppCreatedText;
    }

    public String getCurRevReadMeRowText() {
        return this.curRevReadMeRawText;
    }

    public String getCurRevReadMeRichText() {
        return this.curRevReadMeRichText;
    }

    public String getTempReadMeRowText() {
        return this.tempReadMeRawText;
    }

    public String getTempReadMeRichText() {
        return this.tempReadMeRichText;
    }

    public String getJobNameText() {
        return jobNameText;
    }

    public String getAppCommentCreatedText() {
        return appCommentCreatedText;
    }

    public String getJobCreatedText() {
        return this.jobCreatedText;
    }

    public String getExpectedJobOutputText() {
        return this.expectedJobOutputText;
    }

    public void setAppInitCreationDateTimeText() {
        this.initAppCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setInitAppCreatedText(String timezone) {
        this.initAppCreatedText = getCurrentDateTimeValue(timezone);
    }

    public void setJobCreationDateTimeText() {
        this.jobCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setJobCreatedText(String timezone) {
        this.jobCreatedText = getCurrentDateTimeValue(timezone);
    }

    public void setCurRevNameText(String name) {
        this.curRevNameText = name;
    }

    public void setCurRevTitleText(String title) {
        this.curRevTitleText = title;
    }

    public void setCurRevScriptText(String code) {
        this.curRevScriptText = code;
    }

    public void setCurRevAppCreatedText() {
        this.curRevAppCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setCurRevAppCreatedText(String timezone) {
        this.curRevAppCreatedText =  getCurrentDateTimeValue(timezone);
    }

    public void setCurRevReadMeRawText(String raw) {
        this.curRevReadMeRawText = raw;
    }

    public void setCurRevReadMeRichText(String rich) {
        this.curRevReadMeRichText = rich;
    }

    public void setTempReadMeRawText(String raw) {
        this.tempReadMeRawText = raw;
    }

    public void setTempReadMeRichText(String rich) {
        this.tempReadMeRichText = rich;
    }

    public void setInitNameText(String name) {
        this.initNameText = name;
    }

    public void setInitTitleText(String title) {
        this.initTitleText = title;
    }

    public void setAppCommentCreatedText() {
        this.appCommentCreatedText = getCurrentDateTimeValue(DEFAULT_TIME_ZONE);
    }

    public void setAppCommentCreatedText(String timezone) {
        this.appCommentCreatedText = getCurrentDateTimeValue(timezone);
    }

}
