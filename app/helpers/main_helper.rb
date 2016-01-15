module MainHelper
  def format_graph(node, depth)
    item = node[0]
    deps = node[1]
    s = "<tr><td>"
    s += "&nbsp;&nbsp;" * depth
    if item.accessible_by?(@context)
      s += h(item.try(:name) || item.try(:title)) + " (" + item.uid + ")"
    else
      s += item.uid
    end
    s += "</td><td>"
    if item.public?
      s += "already public"
    elsif item.user_id == @context.user_id
      s += "[ ]"
    else
      s += "not yours"
    end
    s += "</td></tr>"
    deps.each do |dep|
      s += format_graph(dep, depth+1)
    end
    return s
  end

  def graph_nodes(graph)
    s = ""
    nodes = {}
    graph_nodes_recursive(nodes, graph)
    nodes.each_pair do |key, value|
      s += "g.setNode(#{key.inspect}, #{value.to_json});\n"
    end
    s
  end

  def graph_edges(graph)
    s = ""
    item = graph[0]
    deps = graph[1]
    deps.each do |dep|
      s += graph_edges(dep)
      s += "g.setEdge(#{dep[0].uid.inspect}, #{item.uid.inspect}, {label: ''});\n"
    end
    s
  end

  def tutorial_complete?(count)
    return count.nil? || count > 0
  end

  def tutorial_state(count)
    if count.nil? || count > 0
      return "default"
    else
      return "warning"
    end
  end

  private

  def graph_nodes_recursive(nodes, graph)
    item = graph[0]
    deps = graph[1]
    uid = item.uid
    if !nodes.has_key?(uid)
      nodes[uid] = {labelType: 'html', label: content_tag(:div, unilinkfw(item), class: 'track-box'), class: item.public? ? 'public' : (item.user_id == @context.user_id ? 'own' : 'not_yours')}
    end
    deps.each do |dep|
      graph_nodes_recursive(nodes, dep)
    end
  end

end
