d3.json("data/hisse_iliskileri.json").then(function (data) {
  var nodes = {};
  var links = [];

  data.hisse_iliskileri.forEach(function (d) {
    var source = d.hisse1;
    var target = d.hisse2;
    var relation = d.iliski;
    var fark = d.fark;
    var fiyat = d.fiyat;

    if (!nodes[source]) nodes[source] = { name: source, value: 1 };
    if (!nodes[target]) nodes[target] = { name: target, value: 1 };

    // İlişki durumuna göre renk belirleme
    var color = relation === "Korele" ? "blue" : "red";
    // Düğüm rengini farka göre belirleme
    var nodeColor = "red"

    links.push({
      source: source,
      target: target,
      relation: relation,
      color: color,
      nodeColor: nodeColor, // Düğüm rengi
    });
  });

  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2 - 50;

  var angle = (Math.PI * 2) / Object.keys(nodes).length;

  Object.values(nodes).forEach(function (node, i) {
    node.x = width / 2 + radius * Math.cos(angle * i);
    node.y = height / 2 + radius * Math.sin(angle * i);
  });

  // Bağlantıları çizmek için SVG seçiliyor
  var link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", function (d) {
      return d.color;
    }); // Bağlantı rengi belirleniyor

  // Düğümleri çizmek için SVG seçiliyor
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

  // Düğüm daireleri ekleniyor
  var node = nodeGroup
    .append("circle")
    .attr("r", 40)
    .style("fill", function (d) {
      return d.nodeColor;
    }) // Düğüm rengi belirleniyor
    .style("stroke", "#fff")
    .style("stroke-width", "2px");

  // Düğüm etiketleri ekleniyor
  var label = nodeGroup
    .append("text")
    .attr("class", "node-label")
    .text(function (d) {
      // Düğüm adının son üç harfini kaldırarak metni oluştur
      return d.name.slice(0, -3); // Son üç harfi kaldır
    });

  // Kuvvet simülasyonu tanımlanıyor
  var simulation = d3
    .forceSimulation(Object.values(nodes))
    .force(
      "link",
      d3.forceLink(links).id(function (d) {
        return d.name;
      })
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(120)) // Yarıçapı artırıyoruz
    .force("y", d3.forceY(height / 2)) // Y eksenindeki kuvveti belirliyoruz
    .force("x", d3.forceX(width / 2)); // X eksenindeki kuvveti belirliyoruz

  // Kuvvet simülasyonu güncelleme fonksiyonu tanımlanıyor
  simulation.on("tick", ticked);

  function ticked() {
    // Bağlantıların konumları güncelleniyor
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    // Düğümlerin konumları güncelleniyor
    node
      .attr("cx", function (d) {
        return (d.x = Math.max(20, Math.min(width - 20, d.x)));
      })
      .attr("cy", function (d) {
        return (d.y = Math.max(20, Math.min(height - 20, d.y)));
      });

    // Düğüm etiketlerinin konumları güncelleniyor
    label
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y + 5;
      });

    // Bağlantıların orta noktalarına boşluk ekleyerek çizim yapma
    link.attr("d", function (d) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return (
        "M" +
        d.source.x +
        "," +
        d.source.y +
        "A" +
        dr +
        "," +
        dr +
        " 0 0,1 " +
        d.target.x +
        "," +
        d.target.y
      );
    });
  }

  function dragstarted(event, d) {
    // Sürükleme başladığında kuvvet simülasyonu yeniden başlatılıyor
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    // Sürüklenen düğümün konumu güncelleniyor
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    // Sürükleme bittiğinde düğümün sabitlenmesi durduruluyor
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});