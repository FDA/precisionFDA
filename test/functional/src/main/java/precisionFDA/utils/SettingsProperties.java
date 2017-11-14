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

        try {
            input = SettingsProperties.class.getClassLoader().getResourceAsStream("settings.properties");
            properties.load(input);
            input.close();
        } catch (final Exception e) {}

        return properties;
    }

}
