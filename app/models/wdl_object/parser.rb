class WdlObject
  class Parser
    def initialize(wdl_text)
      @raw = wdl_text
    end

    def parse_tasks
      parse_sections("task")
    end

    def parse_workflow
      parse_sections("workflow", 1).first
    end

    def parse_task_name
      raw[/^\s*task\s+(\w+)\s*\{\s*$/, 1]
    end

    def parse_command
      parse_sub_section("command")
    end

    def parse_runtime
      parse_sub_section("runtime")
    end

    # Parse inputs
    #   * inputs defined at the top of task (as per draft-2 openwdl spec)
    #   * inputs defined inside of input{} section (as per 1.0 openwdl spec)
    # Format:
    #   File bbFrom
    #   String outputDir = "."
    def parse_task_inputs(wdl = raw)
      inputs = []

      # parse top level inputs definition
      wdl.each_line.each_with_index do |line, index|
        # break if line's matched any top level section definition
        break if line =~ /^.+?\s*\{\s*$/ && index != 0

        input = line[/^\s*(\S+\s+\S+)\s*(=.+)?$/, 1]

        inputs << input.strip if input
      end

      # parse inputs in "input" section
      if wdl == raw
        sub_inputs = parse_task_inputs(parse_sub_section("input") || "")
        inputs.concat(sub_inputs)
      end

      inputs
    end

    def parse_task_outputs
      raw_outputs = parse_sub_section("output") || ""
      outputs = []

      raw_outputs.each_line do |line|
        # output is always an one-line string
        outputs << line.strip if line =~ /^\s*\S+\s+\S+\s*=.+$/
      end

      outputs
    end

    def parse_workflow_name
      raw && raw[/^\s*workflow\s+(\S+)\s*\{\s*$/, 1]
    end

    def parse_calls
      calls = []

      raw.each_line do |line|
        calls << line.strip if line =~ /^\s*call\s+\S+$/
      end

      calls
    end

    private

    attr_reader :raw

    # mostly for parsing a command, runtime or output
    def parse_sub_section(name)
      raw[/\s*#{name}\s*{\s*(.+?)\s+}\s+/m, 1]
    end

    # parse workflow or task (or any top-level section)
    def parse_sections(name, limit = 0)
      results = []
      opened_brackets = 0
      section_lines = []
      in_section = false

      raw.each_line do |line|
        if !in_section && line =~ /^\s*#{name}\s+\w+\s*\{\s*$/
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
        break if limit > 0 && results.size == limit
        section_lines = []
      end

      results
    end
  end
end
