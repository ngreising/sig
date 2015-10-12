      require([
        "esri/symbols/SimpleLineSymbol","esri/tasks/FeatureSet","esri/tasks/RouteTask","esri/tasks/RouteParameters","esri/geometry/Point","esri/symbols/SimpleMarkerSymbol","esri/graphic",
        "esri/basemaps","esri/map", "esri/dijit/Search", "esri/layers/FeatureLayer", "esri/InfoTemplate", "dojo/domReady!"
      ], function (SimpleLineSymbol, FeatureSet, RouteTask, RouteParameters, Point, SimpleMarkerSymbol,Graphic,esriBasemaps, Map, Search, FeatureLayer, InfoTemplate) {
        esriBasemaps.delorme = {
          baseMapLayers: [{url: "http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer"}
          ],
          thumbnailUrl: "http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png",
          title: "Delorme"
        };
        
        var selections = [];
        var markers = [];
        var iconPath = "M24.0,2.199C11.9595,2.199,2.199,11.9595,2.199,24.0c0.0,12.0405,9.7605,21.801,21.801,21.801c12.0405,0.0,21.801-9.7605,21.801-21.801C45.801,11.9595,36.0405,2.199,24.0,2.199zM31.0935,11.0625c1.401,0.0,2.532,2.2245,2.532,4.968S32.4915,21.0,31.0935,21.0c-1.398,0.0-2.532-2.2245-2.532-4.968S29.697,11.0625,31.0935,11.0625zM16.656,11.0625c1.398,0.0,2.532,2.2245,2.532,4.968S18.0555,21.0,16.656,21.0s-2.532-2.2245-2.532-4.968S15.258,11.0625,16.656,11.0625zM24.0315,39.0c-4.3095,0.0-8.3445-2.6355-11.8185-7.2165c3.5955,2.346,7.5315,3.654,11.661,3.654c4.3845,0.0,8.5515-1.47,12.3225-4.101C32.649,36.198,28.485,39.0,24.0315,39.0z";
        var routeTask = new RouteTask("http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Long_Route");
        var routeSymbol = SimpleLineSymbol().setColor(new dojo.Color([0,0,255,0.5])).setWidth(5);
        var routeParams = new RouteParameters();
        var lastRoute = null;
        //routeParams.__proto__.findBestSequence=true;
        //routeParams.__proto__.preserveFirstStop= false;
        //routeParams.__proto__.preserveLastStop= false;
        //routeParams.__proto__.returnStops = true;
        routeParams.findBestSequence=true;
        routeParams.preserveFirstStop= false;
        routeParams.preserveLastStop= false;
        routeParams.returnStops = true;
        
        routeParams.stops = new FeatureSet();
        
        var map = new Map("map", {
           basemap: "delorme",
            center: [-111.879655861, 40.571338776], // long, lat
            zoom: 13,
            sliderStyle: "small"
        });

         var s = new Search({
            enableButtonMode: true, //this enables the search widget to display as a single button
            enableLabel: false,
            enableInfoWindow: true,
            showInfoWindowOnSelect: false,
            map: map
         }, "search");
         
         

         var sources = s.get("sources");

         //Push the sources used to search, by default the ArcGIS Online World geocoder is included. In addition there is a feature layer of US congressional districts. The districts search is set up to find the "DISTRICTID". Also, a feature layer of senator information is set up to find based on the senator name. 

         sources.push({
            featureLayer: new FeatureLayer("http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CongressionalDistricts/FeatureServer/0"),
            searchFields: ["DISTRICTID"],
            displayField: "DISTRICTID",
            exactMatch: false,
            outFields: ["DISTRICTID", "NAME", "PARTY"],
            name: "Congressional Districts",
            placeholder: "3708",
            maxResults: 6,
            maxSuggestions: 6,

            //Create an InfoTemplate and include three fields
            infoTemplate: new InfoTemplate("Congressional District", "District ID: ${DISTRICTID}</br>Name: ${NAME}</br>Party Affiliation: ${PARTY}"),
            enableSuggestions: true,
            minCharacters: 0
         });

         sources.push({
            featureLayer: new FeatureLayer("http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/US_Senators/FeatureServer/0"),
            searchFields: ["Name"],
            displayField: "Name",
            exactMatch: false,
            name: "Senator",
            outFields: ["*"],
            placeholder: "Senator name",
            maxResults: 6,
            maxSuggestions: 6,

            //Create an InfoTemplate

            infoTemplate: new InfoTemplate("Senator information", "Name: ${Name}</br>State: ${State}</br>Party Affiliation: ${Party}</br>Phone No: ${Phone_Number}<br><a href=${Web_Page} target=_blank ;'>Website</a>"),
            
            enableSuggestions: true,
            minCharacters: 0
         });

         //Set the sources above to the search widget
         s.set("sources", sources);
         
         //Adds the solved route to the map as a graphic
         function showRoute(solveResult) {
           map.graphics.remove(lastRoute);
           lastRoute = map.graphics.add(solveResult.result.routeResults[0].route.setSymbol(routeSymbol));
         }
         
         //Displays any error returned by the Route Task
        function errorHandler(err) {
          alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));
          //routeParams.stops.features.splice(0, 0, lastStop);
          //map.graphics.remove(routeParams.stops.features.splice(1, 1)[0]);
        }
        routeTask.on("solve-complete", showRoute);
        routeTask.on("error", errorHandler);
         
         s.on("select-result", function (result) {
              console.log(result);
              var r = result.result;
              var m = new SimpleMarkerSymbol();
              console.log(result.result.feature.geometry.x);
              //m.setPath(iconPath);
              var p = new Point(r.feature.geometry.x, r.feature.geometry.y, r.feature.geometry.spatialReference);
              console.log('Point', p);
              var g = new Graphic(p, m);
              map.graphics.add(g);
              //m.setColor = [0,0,0,255];
              markers.push(m);
              selections.push(r);
              console.log('Selections', selections);
              console.log('Markers', markers);
              console.log('Graphic', g);
           
              stopSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CROSS).setSize(15);
              stopSymbol.outline.setWidth(4);
              var stop = map.graphics.add(new esri.Graphic(p, stopSymbol));
              routeParams.stops.features.push(stop);
           
              if (routeParams.stops.features.length >= 2) {
                routeTask.solve(routeParams);
                //lastStop = routeParams.stops.features.splice(0, 1)[0];
              }
           }
         );

         s.startup();
         
      });