class WDLObject
  # Contains common parsing methods for a WDL
  module Parseable
    # rubocop:disable Metrics/MethodLength
    def parse_sections(raw, name, options = {})
      opts = options.reverse_merge(limit: 0, with_identifier: false)

      results = []
      opened_brackets = 0
      section_lines = []
      in_section = false
      section_pattern =
        if opts[:with_identifier]
          /^\s*#{name}\s*[\w_]+\s*\{\s*$/
        else
          /^\s*#{name}\s*\{\s*$/
        end

      raw.each_line do |line|
        if !in_section && line =~ section_pattern
          in_section = true
          section_lines << line
          opened_brackets += 1
          next
        end

        next unless in_section

        if line =~ /\s*\w+\s*{\s*/
          opened_brackets += 1
        elsif line =~ /^\s*?}\s*?$/
          opened_brackets -= 1
        end

        section_lines << line

        next unless opened_brackets.zero?

        in_section = false
        results << section_lines.join

        break if opts[:limit] > 0 && results.size == opts[:limit]

        section_lines = []
      end

      results
    end

    def parse_section(raw, name, options = {})
      parse_sections(raw, name, options.merge(limit: 1)).first
    end

    # get a name of a task/workflow/call or any section with an identifier
    def parse_section_identifier(raw, section_name)
      raw[/^\s*#{section_name}\s+([a-zA-Z][a-zA-Z0-9_]+)\s*\{?\s*$/, 1]
    end

    # Parse inputs
    #   * inputs defined at the top of task (as per draft-2 openwdl spec)
    # Format of an input:
    #   File bbFrom
    def parse_inputs(raw)
      inputs = []

      # parse top level inputs definition
      raw.each_line.each_with_index do |line, index|
        # break if line's matched any top level section definition
        break if line =~ /^.+?\s*\{\s*$/ && index != 0

        input = line[/^\s*([A-Z][\w_\?]+\s+[a-zA-Z][a-zA-Z0-9_]+)\s*$/, 1]

        inputs << input.strip if input
      end

      inputs
    end

    def parse_outputs(raw)
      raw_outputs = parse_section(raw, "output") || ""

      raw_outputs.each_line.each_with_object([]) do |line, outputs|
        outputs << line.strip if line =~ /^\s*[A-Z][\w_?]+\s+[a-zA-Z][\w]+\s*=\s*\S+[\S\s]*$/
      end
    end

    # rubocop:enable Metrics/MethodLength
  end
end
