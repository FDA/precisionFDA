// Display labels match the legacy Rails list; option `value` is IANA for the API.

const TIME_ZONE_ROWS = [
  ['(GMT-12:00) International Date Line West', 'Etc/GMT+12'],
  ['(GMT-11:00) American Samoa', 'Pacific/Pago_Pago'],
  ['(GMT-11:00) Midway Island', 'Pacific/Midway'],
  ['(GMT-10:00) Hawaii', 'Pacific/Honolulu'],
  ['(GMT-09:00) Alaska', 'America/Juneau'],
  ['(GMT-08:00) Pacific Time (US & Canada)', 'America/Los_Angeles'],
  ['(GMT-08:00) Tijuana', 'America/Tijuana'],
  ['(GMT-07:00) Arizona', 'America/Phoenix'],
  ['(GMT-07:00) Mountain Time (US & Canada)', 'America/Denver'],
  ['(GMT-07:00) Chihuahua', 'America/Chihuahua'],
  ['(GMT-07:00) Mazatlan', 'America/Mazatlan'],
  ['(GMT-06:00) Central Time (US & Canada)', 'America/Chicago'],
  ['(GMT-06:00) Saskatchewan', 'America/Regina'],
  ['(GMT-06:00) Guadalajara', 'America/Mexico_City'],
  ['(GMT-06:00) Mexico City', 'America/Mexico_City'],
  ['(GMT-06:00) Monterrey', 'America/Monterrey'],
  ['(GMT-06:00) Central America', 'America/Guatemala'],
  ['(GMT-05:00) Eastern Time (US & Canada)', 'America/New_York'],
  ['(GMT-05:00) Indiana (East)', 'America/Indiana/Indianapolis'],
  ['(GMT-05:00) Bogota', 'America/Bogota'],
  ['(GMT-05:00) Lima', 'America/Lima'],
  ['(GMT-05:00) Quito', 'America/Lima'],
  ['(GMT-04:00) Atlantic Time (Canada)', 'America/Halifax'],
  ['(GMT-04:00) Caracas', 'America/Caracas'],
  ['(GMT-04:00) La Paz', 'America/La_Paz'],
  ['(GMT-04:00) Santiago', 'America/Santiago'],
  ['(GMT-03:30) Newfoundland', 'America/St_Johns'],
  ['(GMT-03:00) Brasilia', 'America/Sao_Paulo'],
  ['(GMT-03:00) Buenos Aires', 'America/Argentina/Buenos_Aires'],
  ['(GMT-03:00) Georgetown', 'America/Guyana'],
  ['(GMT-03:00) Greenland', 'America/Nuuk'],
  ['(GMT-03:00) Montevideo', 'America/Montevideo'],
  ['(GMT-02:00) Mid-Atlantic', 'Atlantic/South_Georgia'],
  ['(GMT-01:00) Azores', 'Atlantic/Azores'],
  ['(GMT-01:00) Cape Verde Is.', 'Atlantic/Cape_Verde'],
  ['(GMT+00:00) UTC', 'Etc/UTC'],
  ['(GMT+00:00) Dublin', 'Europe/Dublin'],
  ['(GMT+00:00) Edinburgh', 'Europe/London'],
  ['(GMT+00:00) Lisbon', 'Europe/Lisbon'],
  ['(GMT+00:00) London', 'Europe/London'],
  ['(GMT+00:00) Casablanca', 'Africa/Casablanca'],
  ['(GMT+00:00) Monrovia', 'Africa/Monrovia'],
  ['(GMT+01:00) Amsterdam', 'Europe/Amsterdam'],
  ['(GMT+01:00) Belgrade', 'Europe/Belgrade'],
  ['(GMT+01:00) Berlin', 'Europe/Berlin'],
  ['(GMT+01:00) Bern', 'Europe/Zurich'],
  ['(GMT+01:00) Bratislava', 'Europe/Bratislava'],
  ['(GMT+01:00) Brussels', 'Europe/Brussels'],
  ['(GMT+01:00) Budapest', 'Europe/Budapest'],
  ['(GMT+01:00) Copenhagen', 'Europe/Copenhagen'],
  ['(GMT+01:00) Ljubljana', 'Europe/Ljubljana'],
  ['(GMT+01:00) Madrid', 'Europe/Madrid'],
  ['(GMT+01:00) Paris', 'Europe/Paris'],
  ['(GMT+01:00) Prague', 'Europe/Prague'],
  ['(GMT+01:00) Rome', 'Europe/Rome'],
  ['(GMT+01:00) Sarajevo', 'Europe/Sarajevo'],
  ['(GMT+01:00) Skopje', 'Europe/Skopje'],
  ['(GMT+01:00) Stockholm', 'Europe/Stockholm'],
  ['(GMT+01:00) Vienna', 'Europe/Vienna'],
  ['(GMT+01:00) Warsaw', 'Europe/Warsaw'],
  ['(GMT+01:00) West Central Africa', 'Africa/Algiers'],
  ['(GMT+01:00) Zagreb', 'Europe/Zagreb'],
  ['(GMT+02:00) Athens', 'Europe/Athens'],
  ['(GMT+02:00) Bucharest', 'Europe/Bucharest'],
  ['(GMT+02:00) Cairo', 'Africa/Cairo'],
  ['(GMT+02:00) Harare', 'Africa/Harare'],
  ['(GMT+02:00) Helsinki', 'Europe/Helsinki'],
  ['(GMT+02:00) Jerusalem', 'Asia/Jerusalem'],
  ['(GMT+02:00) Kyiv', 'Europe/Kiev'],
  ['(GMT+02:00) Pretoria', 'Africa/Johannesburg'],
  ['(GMT+02:00) Riga', 'Europe/Riga'],
  ['(GMT+02:00) Sofia', 'Europe/Sofia'],
  ['(GMT+02:00) Tallinn', 'Europe/Tallinn'],
  ['(GMT+02:00) Vilnius', 'Europe/Vilnius'],
  ['(GMT+03:00) Baghdad', 'Asia/Baghdad'],
  ['(GMT+03:00) Istanbul', 'Europe/Istanbul'],
  ['(GMT+03:00) Kuwait', 'Asia/Kuwait'],
  ['(GMT+03:00) Minsk', 'Europe/Minsk'],
  ['(GMT+03:00) Moscow', 'Europe/Moscow'],
  ['(GMT+03:00) Nairobi', 'Africa/Nairobi'],
  ['(GMT+03:00) Riyadh', 'Asia/Riyadh'],
  ['(GMT+03:00) St. Petersburg', 'Europe/Moscow'],
  ['(GMT+03:30) Tehran', 'Asia/Tehran'],
  ['(GMT+04:00) Abu Dhabi', 'Asia/Muscat'],
  ['(GMT+04:00) Baku', 'Asia/Baku'],
  ['(GMT+04:00) Muscat', 'Asia/Muscat'],
  ['(GMT+04:00) Samara', 'Europe/Samara'],
  ['(GMT+04:00) Tbilisi', 'Asia/Tbilisi'],
  ['(GMT+04:00) Volgograd', 'Europe/Volgograd'],
  ['(GMT+04:00) Yerevan', 'Asia/Yerevan'],
  ['(GMT+04:30) Kabul', 'Asia/Kabul'],
  ['(GMT+05:00) Ekaterinburg', 'Asia/Yekaterinburg'],
  ['(GMT+05:00) Islamabad', 'Asia/Karachi'],
  ['(GMT+05:00) Karachi', 'Asia/Karachi'],
  ['(GMT+05:00) Tashkent', 'Asia/Tashkent'],
  ['(GMT+05:30) Chennai', 'Asia/Kolkata'],
  ['(GMT+05:30) Kolkata', 'Asia/Kolkata'],
  ['(GMT+05:30) Mumbai', 'Asia/Kolkata'],
  ['(GMT+05:30) New Delhi', 'Asia/Kolkata'],
  ['(GMT+05:30) Sri Jayawardenepura', 'Asia/Colombo'],
  ['(GMT+05:45) Kathmandu', 'Asia/Kathmandu'],
  ['(GMT+06:00) Almaty', 'Asia/Almaty'],
  ['(GMT+06:00) Astana', 'Asia/Almaty'],
  ['(GMT+06:00) Dhaka', 'Asia/Dhaka'],
  ['(GMT+06:00) Urumqi', 'Asia/Urumqi'],
  ['(GMT+06:30) Rangoon', 'Asia/Rangoon'],
  ['(GMT+07:00) Bangkok', 'Asia/Bangkok'],
  ['(GMT+07:00) Hanoi', 'Asia/Bangkok'],
  ['(GMT+07:00) Jakarta', 'Asia/Jakarta'],
  ['(GMT+07:00) Krasnoyarsk', 'Asia/Krasnoyarsk'],
  ['(GMT+07:00) Novosibirsk', 'Asia/Novosibirsk'],
  ['(GMT+08:00) Beijing', 'Asia/Shanghai'],
  ['(GMT+08:00) Chongqing', 'Asia/Chongqing'],
  ['(GMT+08:00) Hong Kong', 'Asia/Hong_Kong'],
  ['(GMT+08:00) Irkutsk', 'Asia/Irkutsk'],
  ['(GMT+08:00) Kuala Lumpur', 'Asia/Kuala_Lumpur'],
  ['(GMT+08:00) Perth', 'Australia/Perth'],
  ['(GMT+08:00) Singapore', 'Asia/Singapore'],
  ['(GMT+08:00) Taipei', 'Asia/Taipei'],
  ['(GMT+08:00) Ulaanbaatar', 'Asia/Ulaanbaatar'],
  ['(GMT+09:00) Osaka', 'Asia/Tokyo'],
  ['(GMT+09:00) Sapporo', 'Asia/Tokyo'],
  ['(GMT+09:00) Seoul', 'Asia/Seoul'],
  ['(GMT+09:00) Tokyo', 'Asia/Tokyo'],
  ['(GMT+09:00) Yakutsk', 'Asia/Yakutsk'],
  ['(GMT+09:30) Adelaide', 'Australia/Adelaide'],
  ['(GMT+09:30) Darwin', 'Australia/Darwin'],
  ['(GMT+10:00) Brisbane', 'Australia/Brisbane'],
  ['(GMT+10:00) Canberra', 'Australia/Canberra'],
  ['(GMT+10:00) Guam', 'Pacific/Guam'],
  ['(GMT+10:00) Hobart', 'Australia/Hobart'],
  ['(GMT+10:00) Melbourne', 'Australia/Melbourne'],
  ['(GMT+10:00) Port Moresby', 'Pacific/Port_Moresby'],
  ['(GMT+10:00) Sydney', 'Australia/Sydney'],
  ['(GMT+10:00) Vladivostok', 'Asia/Vladivostok'],
  ['(GMT+11:00) Magadan', 'Asia/Magadan'],
  ['(GMT+11:00) New Caledonia', 'Pacific/Noumea'],
  ['(GMT+11:00) Solomon Is.', 'Pacific/Guadalcanal'],
  ['(GMT+11:00) Srednekolymsk', 'Asia/Srednekolymsk'],
  ['(GMT+12:00) Auckland', 'Pacific/Auckland'],
  ['(GMT+12:00) Fiji', 'Pacific/Fiji'],
  ['(GMT+12:00) Kamchatka', 'Asia/Kamchatka'],
  ['(GMT+12:00) Marshall Is.', 'Pacific/Majuro'],
  ['(GMT+12:00) Wellington', 'Pacific/Auckland'],
  ["(GMT+13:00) Nuku'alofa", 'Pacific/Tongatapu'],
  ['(GMT+13:00) Samoa', 'Pacific/Apia'],
  ['(GMT+13:00) Tokelau Is.', 'Pacific/Fakaofo'],
] as const

function displayNameFromLabel(label: string): string {
  return label.replace(/^\([^)]*\)\s*/, '')
}

/** Legacy profile values were often the short display name (e.g. `Eastern Time (US & Canada)`). */
const legacyRailsNameToIana: Record<string, string> = Object.fromEntries(
  TIME_ZONE_ROWS.map(([label, iana]) => [displayNameFromLabel(label), iana]),
)

export const TIMEZONES = (() => {
  const seen = new Set<string>()
  const list: { value: string; label: string }[] = []
  for (const [label, value] of TIME_ZONE_ROWS) {
    if (seen.has(value)) {
      continue
    }
    seen.add(value)
    list.push({ value, label })
  }
  return list
})()

export function canonicalTimeZoneId(raw: string | null | undefined): string {
  if (raw == null || raw === '') {
    return ''
  }
  const id = raw.trim()
  if (TIMEZONES.some(z => z.value === id)) {
    return id
  }
  const legacy = legacyRailsNameToIana[id]
  if (legacy !== undefined) {
    return legacy
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: id })
    return id
  } catch {
    return ''
  }
}
