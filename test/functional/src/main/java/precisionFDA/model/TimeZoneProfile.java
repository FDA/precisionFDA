package precisionFDA.model;

public class TimeZoneProfile {

    private String zoneCode;

    private String location;

    private String codeAndLocation;

    private String codeOfLocation;

    public TimeZoneProfile(final String zoneCode,
                           final String location,
                           final String codeAndLocation,
                           final String codeOfLocation) {
        this.zoneCode = zoneCode;
        this.location = location;
        this.codeAndLocation = codeAndLocation;
        this.codeOfLocation = codeOfLocation;
    }

    public String getZoneCode() {
        return zoneCode;
    }

    public String getLocation() {
        return location;
    }

    public String getCodeAndLocation() {
        return codeAndLocation;
    }

    public String getCodeOfLocation() {
        return codeOfLocation;
    }
}


