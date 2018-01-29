package precisionFDA.model;

public class QuestionProfile {

    private String expertQuestion1;

    private String expertQuestion2;

    private String expertAnswer1;

    private String expertAnswer2;

    public QuestionProfile(final String expertQuestion1, final String expertQuestion2,
                           final String expertAnswer1, final String expertAnswer2) {
        this.expertQuestion1 = expertQuestion1;
        this.expertQuestion2 = expertQuestion2;
        this.expertAnswer1 = expertAnswer1;
        this.expertAnswer2 = expertAnswer2;
    }

    public String getExpertQuestion1() {
        return expertQuestion1;
    }

    public String getExpertQuestion2() {
        return expertQuestion2;
    }

    public String getExpertAnswer1() {
        return expertAnswer1;
    }

    public String getExpertAnswer2() {
        return expertAnswer2;
    }
}


