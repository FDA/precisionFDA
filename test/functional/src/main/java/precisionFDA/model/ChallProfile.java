package precisionFDA.model;

public class ChallProfile {

    private String challName;

    private String challDescr;

    private String challScoringAppUser;

    private int challStartsAtFromNowMin;

    private int durationMin;

    private String challStartsAt;

    private String challEndsAt;

    private String challCardImage;

    private String challStatus;

    private String challInfo;

    private String challResults;

    public ChallProfile(final String challName,
                        final String challDescr, final String challScoringAppUser,
                        final int challStartsAtFromNowMin, final int durationMin,
                        final String challStartsAt, final String challEndsAt,
                        final String challCardImage, final String challStatus,
                        final String challInfo, final String challResults) {
        this.challName = challName;
        this.challDescr = challDescr;
        this.challScoringAppUser = challScoringAppUser;
        this.challStartsAtFromNowMin = challStartsAtFromNowMin;
        this.durationMin = durationMin;
        this.challStartsAt= challStartsAt;
        this.challEndsAt = challEndsAt;
        this.challCardImage = challCardImage;
        this.challStatus = challStatus;
        this.challInfo = challInfo;
        this.challResults = challResults;
    }

    public String getChallName() {
        return challName;
    }

    public String getChallDescr() {
        return challDescr;
    }

    public String getChallScoringAppUser() {
        return challScoringAppUser;
    }

    public int getChallStartsAtFromNowMin() {
        return challStartsAtFromNowMin;
    }

    public int getDurationMin() {
        return durationMin;
    }

    public String getChallStartsAt() {
        return challStartsAt;
    }

    public String getChallEndsAt() {
        return challEndsAt;
    }

    public String getChallCardImage() {
        return challCardImage;
    }

    public String getChallStatus() {
        return challStatus;
    }

    public String getChallInfo() {
        return challInfo;
    }

    public String getChallResults() {
        return challResults;
    }

    //==============

    public void setChallStartsAt(String startsAt) {
        this.challStartsAt = startsAt;
    }

    public void setChallEndsAt(String endsAt) {
        this.challEndsAt = endsAt;
    }
}


