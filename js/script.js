const width = 3200;
const height = 1400;
const margin = 100; // SVG kenarlarından uzaklık

const svg = d3
  .select("#chart")
  .attr("width", width)
  .attr("height", height);

const color = d3.scaleOrdinal(d3.schemeCategory10);

Promise.all([
  d3.json("data/hisse_iliskileri.json"),
  d3.json("data/fiyatlar.json"),
]).then(function (files) {
  var iliskiler = files[0];
  var fiyatlar = files[1];

  var nodes = {};
  var links = [];

  iliskiler.hisse_iliskileri.forEach(function (d) {
    var source = d.hisse1;
    var target = d.hisse2;
    var relation = d.iliski;

    var link = { source: source, target: target, relation: relation };
    links.push(link);

    if (!nodes[source]) nodes[source] = { name: source, value: 1 };
    if (!nodes[target]) nodes[target] = { name: target, value: 1 };
  });

  fiyatlar.forEach(function (d) {
    var hisse = d.hisse;
    var fiyat = parseFloat(d.fiyat.replace(",", "."));
    var fark = parseFloat(d.fark.replace(",", "."));

    if (!nodes[hisse]) return;

    nodes[hisse].fiyat = fiyat;
    nodes[hisse].nodeColor = fark < 0 ? "#91110d" : "#0d9e53";
    console.log(hisse ," : ",fiyat);
  });

  var simulation = d3
    .forceSimulation(Object.values(nodes))
    .force(
      "link",
      d3
        .forceLink(links)
        .id(function (d) { return d.name; })
        .distance(300)
    ) // Bağları daha uzaklaştır
    .force("charge", d3.forceManyBody().strength(-800)) // Düğümleri birbirinden daha uzak tutmak için charge kuvvetini artır
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collide",
      d3
        .forceCollide()
        .radius(function (d) { return Math.min(scaleRadius(d.fiyat) + 50, 100); })
        .iterations(5)
    ) // Yarıçapı maksimum 100 olarak sınırla ve çarpışmaları azalt
    .force(
      "x",
      d3
        .forceX()
        .strength(0.1)
        .x(function (d) { return d.nodeColor === "#91110d" ? width / 4 : (3 * width) / 4; }) // Düğümleri renklere göre sağa ve sola ayır
    ) // X ekseni için düğümleri merkeze çek
    .force(
      "y",
      d3
        .forceY()
        .strength(0.1)
        .y(function (d) { return height / 2 + Math.random() * height / 4; }) // Düğümleri rastgele dikeyde dağıt
    ) // Y ekseni için düğümleri merkeze çek
    .alphaDecay(0.01) // Simülasyonun hızlıca durmasını önle
    .on("tick", ticked);

  var link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", function (d) { return d.relation === "Korele" ? "#067bd4" : "#d40658"; });

  var nodeGroup = svg
    .selectAll(".node")
    .data(Object.values(nodes))
    .enter()
    .append("g")
    .attr("class", "node");

  var node = nodeGroup
    .append("circle")
    .attr("r", function (d) { return Math.min(scaleRadius(d.fiyat + 50), 100); }) // Yarıçapı maksimum 100 olarak sınırla
    .style("fill", function (d) { return d.nodeColor || "gray"; })
    .style("stroke", "#fff")
    .style("stroke-width", "2px")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  var label = nodeGroup
    .append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("font-size", function (d) { return calculateTextSize(d); })
    .text(function (d) { return d.name; });

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    nodeGroup.attr("transform", function (d) {
      d.x = Math.max(margin, Math.min(width - margin, d.x));
      d.y = Math.max(margin, Math.min(height - margin, d.y));
      return "translate(" + d.x + "," + d.y + ")";
    });

    label.style("font-size", function (d) { return calculateTextSize(d); });
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    node
      .filter(function (n) { return n !== d; })
      .each(function (n) { n.fx = n.x; n.fy = n.y; });
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    node
      .filter(function (n) { return n !== d; })
      .each(function (n) { n.fx = null; n.fy = null; });
  }

  function scaleRadius(fiyat) {
    return Math.sqrt(fiyat) * 5 || 20;
  }

  function calculateTextSize(d) {
    var radius = Math.min(scaleRadius(d.fiyat + 50), 100); // Yarıçapı maksimum 100 olarak sınırla
    if (radius < 20) return "10px";
    else if (radius < 40) return "14px";
    else if (radius < 60) return "18px";
    else return "24px";
  }
});