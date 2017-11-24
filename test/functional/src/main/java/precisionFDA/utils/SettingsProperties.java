package precisionFDA.utils;

import java.io.InputStream;
import java.util.Properties;

public final class SettingsProperties {

    private SettingsProperties() {

    }

    private static Properties PROP_LIST;

    static {
        PROP_LIST = loadProperties();
    }

    public static Properties getPropList() {
        return PROP_LIST;
    }

    public static String getProperty(final String propName) {
        return getPropList().getProperty(propName);
    }

    private static java.util.Properties loadProperties() {
        final java.util.Properties properties = new java.util.Properties();
        InputStream input = null;

        String settingsFile = "devSettings.properties";

        String env = System.getProperty("env");
        if (("" + env).equalsIgnoreCase("null")) {
            env = "dev";
        }

        if (env.equalsIgnoreCase("loc")) {
            settingsFile = "locSettings.properties";
        }

        try {
            input = SettingsProperties.class.getClassLoader().getResourceAsStream(settingsFile);
            properties.load(input);
            input.close();
        } catch (final Exception e) {}

        return properties;
    }

}
