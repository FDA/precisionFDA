def parse_log(log)
  result = log.sub(",\n", "")
  json = JSON.parse result, symbolize_names: true
  Struct.new(*json.keys).new(*json.values)
end
