package precisionFDA.model;

public class TimeZoneProfile {

    private String location;

    private String codeOfLocation;

    private String value;

    public TimeZoneProfile(final String location,
                           final String codeOfLocation,
                           final String value) {
        this.location = location;
        this.codeOfLocation = codeOfLocation;
        this.value = value;
    }
    public String getLocation() {
        return location;
    }

    public String getCodeOfLocation() {
        return codeOfLocation;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}


