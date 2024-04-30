Promise.all([
  d3.json("../data/hisse_iliskileri.json"),
  d3.json("../data/fiyatlar.json")
]).then(function(files) {
  var hisseIliskileri = Array.isArray(files[0]) ? files[0] : Object.values(files[0]);
  var fiyatlar = files[1];

  var nodes = {};
  var links = [];

  hisseIliskileri.forEach(function(d) {
      var source = d.hisse1;
      var target = d.hisse2;
      var relation = d.iliski;

      var relatedFiyatlar = fiyatlar.filter(function(f) {
          return f.hisse === source || f.hisse === target;
      });

      var fiyat = relatedFiyatlar[0] ? relatedFiyatlar[0].fiyat : 0;
      var fark = relatedFiyatlar[0] ? relatedFiyatlar[0].fark : "";

      if (!nodes[source])
          nodes[source] = {
              name: source,
              value: 1,
              fark: fark,
              fiyat: fiyat,
          };
      if (!nodes[target])
          nodes[target] = {
              name: target,
              value: 1,
              fark: fark,
              fiyat: fiyat,
          };

      var color = relation === "Korele" ? "#0283ed" : "#f05841";

      links.push({
          source: source,
          target: target,
          relation: relation,
          color: color,
          fark:fark,
          fiyat:fiyat,
      });
  });

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      radius = Math.min(width, height) / 2 - 50;

  var angle = (Math.PI * 2) / Object.keys(nodes).length;

  Object.values(nodes).forEach(function(node, i) {
      node.x = width / 2 + radius * Math.cos(angle * i);
      node.y = height / 2 + radius * Math.sin(angle * i);
  });

  var scaleRadius = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(nodes), (d) => d.fiyat))
      .range([30, 90]);

  var link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", function(d) {
          return d.color;
      });

  var nodeGroup = svg
      .selectAll(".node")
      .data(Object.values(nodes))
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
          d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

  var node = nodeGroup
      .append("circle")
      .attr("r", function(d) {
          return scaleRadius(d.fiyat);
      })
      .style("fill", function(d) {
          return d.fark && d.fark.charAt(0) === "-" ? "maroon" : "green";
      })
      .style("stroke", "#fff")
      .style("stroke-width", "2px");

  var label = nodeGroup
      .append("text")
      .attr("class", "node-label")
      .text(function(d) {
          return d.name;
      });

  var simulation = d3
      .forceSimulation(Object.values(nodes))
      .force(
          "link",
          d3.forceLink(links).id(function(d) {
              return d.name;
          })
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(120))
      .force("y", d3.forceY(height / 2))
      .force("x", d3.forceX(width / 2));

  simulation.on("tick", ticked);

  function ticked() {
      link
          .attr("x1", function(d) {
              return d.source.x;
          })
          .attr("y1", function(d) {
              return d.source.y;
          })
          .attr("x2", function(d) {
              return d.target.x;
          })
          .attr("y2", function(d) {
              return d.target.y;
          });

      node.attr("cx", function(d) {
              return d.x;
          })
          .attr("cy", function(d) {
              return d.y;
          });

      label
          .attr("x", function(d) {
              return d.x;
          })
          .attr("y", function(d) {
              return d.y + 5;
          });
  }

  function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
  }

  function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
  }

  function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
  }
});
