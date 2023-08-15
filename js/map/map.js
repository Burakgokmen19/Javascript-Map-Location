var map, vectorlayer, vectorsource, lineVectorlayer, lineVectorsource,polyVectorsource,polyVectorlayer,pointVectorlayer,pointVectorsource, crd, table, view;
var element, Select
vectorsource = new ol.source.Vector({ WrapX: false })
vectorlayer = new ol.layer.Vector({source: vectorsource})
lineVectorsource = new ol.source.Vector({ WrapX: false })
lineVectorlayer = new ol.layer.Vector({source: lineVectorsource})
polyVectorsource = new ol.source.Vector({ WrapX: false })
polyVectorlayer = new ol.layer.Vector({source: polyVectorsource})
pointVectorsource = new ol.source.Vector({ WrapX: false })
pointVectorlayer = new ol.layer.Vector({source: pointVectorsource})


var wkt =
  'POLYGON((10.689 -25.092, 34.595 ' +
  '-20.170, 38.814 -35.639, 13.502 ' +
  '-39.155, 10.689 -25.092))';

var format = new ol.format.WKT();

map = new ol.Map({
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([37.41, 8.82]),
    zoom: 4
  }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    vectorlayer,
    lineVectorlayer,
    polyVectorlayer,
    pointVectorlayer,
  ],
  target: 'map'
})

var draw = new ol.interaction.Draw({
  type: "Point",
  source: vectorsource
})
//Kordinat Bulma
draw.setActive(false);
map.addInteraction(draw);
draw.on("drawend", (event) => {
  var crd = event.feature.getGeometry().getCoordinates();
  jsPanel.create({
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'Coordinations',
    headerToolbar: "",
    content: `<label for="fname">X Coordinations:</label>
    <input type="text" id="X" value="${crd[0]}"><br><br>
    <label for="lname">Y Coordinations:</label>
    <input type="text" id="Y" value="${crd[1]}"><br><br>
    <label for="fname">     City:</label>
    <input type="text" id="city"/><br><br>
    <button type="submit" id="postButton" value="Kaydet ">Kaydet</button>`,
    panelSize: {
      width: () => { return Math.min(400, window.innerWidth * 0.6); },
      height: () => { return Math.min(400, window.innerHeight * 0.9); }



    },
    callback: function (panel) {
      var postButton = document.getElementById("postButton");
      postButton.addEventListener("click", () => {

        swal({
          title: "Başarılı",
          text: "Kordinatlar başarıyla Kaydedildi!",
          icon: "success",
          timer: "1000"
        });

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        raw = JSON.stringify({
          "id": 0,
          "name": document.getElementById("city").value,
          "x": crd[0],
          "y": crd[1]
        });
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("https://localhost:7143/api/Location", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
      })
    },
  });
})
addPatiButton = document.getElementById("pati");
addPatiButton.addEventListener("click", () => {
  draw.setActive(true);
});

deletePutButton = document.getElementById("deletePut");
deletePutButton.addEventListener("click", () => {
  draw.setActive(false);
  jsPanel.create({
    id: "panel2",
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'crud',
    content: "<table id = 'example'/>",
    panelSize: {
      width: () => { return Math.min(40000, window.innerWidth * 0.6); },
      height: () => { return Math.min(40000, window.innerHeight * 0.6); }

    }
  });

  fetch('https://localhost:7143/api/Location', {
    method: "GET",
    Headers: {
      "Content-Type": "application/json"
    },
  }).then(response => response.json())
    .then(data => {
      const dataTable = $("#example").DataTable({
        destroy: true,
        data: data.value,
        columns: [
          { data: 'id', title: 'Id' },
          { data: 'name', title: 'Name' },
          { data: 'x', title: 'X' },
          { data: 'y', title: 'Y' },
          {
            defaultContent: '<button type="submit" id="deleteButton" value="Sil ">Sil</button>'
          }
        ],
      });

      $('#example').on('click', '#deleteButton', (function () {
        swal({
          title: "Başarılı",
          text: "Kordinatlar başarıyla silindi!",
          icon: "success",
          timer: "1000"
        });
        deletedData = dataTable.row($(this).parents('tr')).data();
        deleteSelectedRow(deletedData.id);
        table = $('#example').DataTable();
        table.clear().draw();
        setTimeout(() => {
          fetch('https://localhost:7143/api/Location', {
            method: "GET",
            Headers: {
              "Content-Type": "application/json"
            },
          }).then(response => response.json())
            .then(data => {
              const dataTable = $("#example").DataTable({
                destroy: true,
                data: data.value,
                columns: [
                  { data: 'id', title: 'Id' },
                  { data: 'name', title: 'Name' },
                  { data: 'x', title: 'X' },
                  { data: 'y', title: 'Y' },
                  {
                    defaultContent: '<button type="submit" id="deleteButton" value="Sil ">Sil</button>'
                  }
                ],
              });
            });
          vectorsource.clear();
          fetch('https://localhost:7143/api/Location')
            .then(response => response.json())
            .then(data => {
              element = data.value;
              for (let index = 0; index < element.length; index++) {
                let feature = new ol.Feature({
                  geometry: new ol.geom.Point([element[index].x, element[index].y]),
                  name: element[index].name,
                  id: element[index].id,
                });
                feature.setId(element[index].id);
                vectorsource.addFeature(feature);

              };
            });
        }, 100);

        function deleteSelectedRow(id) {
          var data = {
            id: id,
            name: "",
            x: "",
            y: "",

          }

          fetch('https://localhost:7143/api/Location?id=' + id, {
            method: "Delete",
            headers: {
              "Content-Type": "application/json"
            },
          }).then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error))

        }
      }));
    });

});


//veritabanındaki kordinatları haritaya basma
fetch('https://localhost:7143/api/Location')
  .then(response => response.json())
  .then(data => {
    element = data.value;
    for (let index = 0; index < element.length; index++) {
      let feature = new ol.Feature({
        geometry: new ol.geom.Point([element[index].x, element[index].y]),
        name: element[index].name,
        id: element[index].id,
      });
      feature.setId(element[index].id);
      vectorsource.addFeature(feature);
    };
  });
// POPUP VE MODİFY 

view = new ol.View({
  center: [428125319374.4662, 4718488.7699046545],
  zoom: 6,
})
var popupelement = document.getElementById('popup');
var popup = new ol.Overlay({
  element: popupelement,
  positioning: 'bottom-center',
  stopEvent: false
});
map.addOverlay(popup);
map.on('click', function (evt) {
 let  feature = map.forEachFeatureAtPixel(evt.pixel,
    function (feature, layer) {
      return feature;
    });
  if (feature) {
    var coordinates = feature.getGeometry().getLastCoordinate();
    console.log(feature.getId());
    let point = feature.getGeometry();
    view.fit(point, { padding: [170, 50, 30, 150], minResolution: 100 })
    $(popupelement).popover('dispose');
    popup.setPosition(coordinates);
    $(popupelement).popover({
      container: popupelement,
      placement: 'top',
      animation: false,
      html: true,
      content: '<p>The location you clicked was:</p><code>' + feature.getGeometry().getLastCoordinate() + '</code>',
    });
    $(popupelement).popover('show');
    popup.setPosition(coordinates);
  } else {
    $(popupelement).popover('dispose');
  }

});

putButton = document.getElementById("PutButton1");
putButton.addEventListener("click", () => {


  jsPanel.create({
    id: "panel2",
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'crud',
    content: "<table id = 'example'/>",
    panelSize: {
      width: () => { return Math.min(40000, window.innerWidth * 0.6); },
      height: () => { return Math.min(40000, window.innerHeight * 0.6); }

    }
  });

  fetch('https://localhost:7143/api/Location', {
    method: "GET",
    Headers: {
      "Content-Type": "application/json"
    },
  }).then(response => response.json())
    .then(data => {
      const dataTable = $("#example").DataTable({
        destroy: true,
        data: data.value,
        columns: [
          { data: 'id', title: 'Id' },
          { data: 'name', title: 'Name' },
          { data: 'x', title: 'X' },
          { data: 'y', title: 'Y' },
          {
            defaultContent: '<button type="submit" id="guncelleButton" value="Sil ">Güncelle</button>'
          }
        ],
      });
    });

    $('#example').on('click', '#guncelleButton', (function () {
      table = $('#example').DataTable();
      updatedData = table.row($(this).parents('tr')).data();

      jsPanel.create({
        id: "panel4",
        theme: 'dark',
        headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
        headerTitle: 'crud',
        content: "<table id = 'example'/>",
        panelSize: {
          width: () => { return Math.min(400, window.innerWidth * 0.6); },
      height: () => { return Math.min(400, window.innerHeight * 0.9); }

        },
        content: `
        <label for="id" >id:</label>
        <input type="text" id="id" value=""><br><br>
        <label for="fname">X Coordinations:</label>
        <input type="text" id="X" value=""><br><br>
        <label for="lname">Y Coordinations:</label>
        <input type="text" id="Y" value=""><br><br>
        <label for="fname">     City:</label>
        <input type="text" id="city"/><br><br>
        <button type="submit" id="putButton3" value="Kaydet ">Kaydet</button>`,
        callback: function () {
          let put = document.getElementById("putButton3");
    put.addEventListener("click",()=>{
      swal({
        title: "Başarılı",
        text: "Kordinatlar başarıyla Güncellendi!",
        icon: "success",
        timer: "1000"
      });

        let id = parseInt(document.getElementById("id").value);
        let x =parseFloat(document.getElementById("X").value);
        let y =parseFloat(document.getElementById("Y").value);
        let city =(document.getElementById("city").value);
          raw = JSON.stringify({
            "id": (id),
            "name": city,
            "x": (x),
            "y": (y)
          });
        
          var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
        
          fetch('https://localhost:7143/api/Location', {
            method: "PUT",
            headers: myHeaders,
            body: raw,
          }).then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error))
         
        
    })
        }
      });
     setTimeout(() => {
      document.getElementById("id").value=updatedData.id;
      document.getElementById("X").value=updatedData.x;
      document.getElementById("Y").value=updatedData.y;
      document.getElementById("city").value=updatedData.name;

     }, 200);
      
    }));

    

  const raster = new ol.layer.Tile({
    source: new ol.source.OSM(),
  });

  const extent = ol.proj.get('EPSG:3857').getExtent().slice();
  extent[0] += extent[0];
  extent[2] += extent[2];
  const modify = new ol.interaction.Modify({ source: vectorsource });
  map.addInteraction(modify);

 


})
polibutton = document.getElementById("Poligon");
polibutton.addEventListener("click",()=>{


 lineButton = document.getElementById("line")
 lineButton.addEventListener("click",()=>{
  
  let drawLine, snapLine;

  function addInteractions() {
    drawLine = new ol.interaction.Draw({
      source: lineVectorsource,
      type: "LineString",
    });
    map.addInteraction(drawLine);
    snapLine = new ol.interaction.Snap({ source: vectorsource });
    map.addInteraction(snapLine);
  }
  addInteractions();
  drawLine.setActive(true);
});


polygonButton = document.getElementById("polygon")
polygonButton.addEventListener("click",()=>{
  
  let drawpoly, snappoly;
  function addInteractions() {
    drawpoly = new ol.interaction.Draw({
      source: polyVectorsource,
      type: "Polygon",
    });
    map.addInteraction(drawpoly);
    snappoly = new ol.interaction.Snap({ source: vectorsource });
    map.addInteraction(snappoly);
    
  } 
  
  addInteractions();
  drawpoly.setActive(true)

})

})

