"use strict"

//var rootLink = 'https://chrispi.lima-city.de/';
var rootLink = 'http://localhost/wienerlinien/';

// Button für Stationen
function createButton(val, target) {
    $('#balken2').empty();
    $('<br>')
        .appendTo('#balken2:last-child');
    $('<a>')
        .addClass('dropdown-trigger btn indigo darken-2')
        .appendTo('#balken2:last-child')
        .attr({'href':'#', 'data-target':'stationen'})
        .html('Linie ' + target + ' Stationen');
    $('<i>')
        .addClass("material-icons left")
        .html('room')
        .appendTo('#balken2 a');

    $('<ul>')
        .addClass('dropdown-content')
        .attr('id', 'stationen')
        .appendTo('#balken2:last-child');
    var count = 0;
    for( let i = 0; i < val.length; i++ ) {
        $('<li>')
            .attr('id', count)
            .appendTo('#balken2 ul')
            .html(val[i][0]);
        count++;
    }
    $('.dropdown-trigger').dropdown({'hover': false, 'constrainWidth': false});
};

function buttonShowAll (target) {
    $('<a>')
        .addClass('waves-effect waves-light btn indigo darken-2')
        .appendTo('#balken2:last-child')
        .html('Zeige ' + target + ' Strecke')
        .attr('id', 'allButton');
    $('<i>')
        .addClass('material-icons left')
        .appendTo('#balken2 a:last-child')
        .html('show_chart');
};

function createIcon (path) {
    var iconz = L.icon({
        iconUrl: path,
        iconSize: [24, 24],
        popUpAnchor: [0,0]
    });
    return iconz;
}

$(document).ready(function (){
/**
 * TODO:
 * Location soll sich resetten wenn eine neue Location angegeben wurde
 * Button für Streckenübersicht mit verbundenen Stationen
 */
    var myMap = L.map('map', {center:[48.142442551082,16.3999582372354], zoom:13});
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'}).addTo(myMap);

    

    $('.dropdown-trigger').dropdown({'hover': false, 'constrainWidth': false});
    
    $('#dropdownMetro li').on('click', function() {
        var target = $(this).html();
        
        $.ajax({
            url: rootLink + 'json/ubahn.json',
            datatype:'json',
            success: function(reponse){

                var ubahndaten = reponse.lineData[0];
                for (var key in ubahndaten) {

                    if (key == target) {

                        $('<h2>').html(target).appendTo('#balken2');
                        createButton(ubahndaten[target].stationen, target); 
                        buttonShowAll(target);    
                        var allMarker = {};
                        $('#allButton').on('click', function () {
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData: 'getAll', type: 'ubahn'},
                                success: function (response) {
                                    if (allMarker !== 'undefinded') {
                                        myMap.removeLayer(allMarker);

                                    }
                                    var line = response.lineData[0];
                                    var coord = [];
                                    for (let tar in line) {
                        
                                        if (tar == target) {
                        
                                            var stations = line[target].stationen;
                                            for (let s = 0; s < stations.length; s++) {
                        
                                                myMap.setView([stations[0][1][0],stations[0][1][1]], 12);
                                                allMarker = L.marker([stations[s][1][0],stations[s][1][1]],{icon: createIcon('icons/sharp-subway.svg')}).addTo(myMap);
                                                var stName = stations[s][0];
                                                allMarker.bindPopup(stName);
                                                var lonlat = new L.LatLng(stations[s][1][0], stations[s][1][1]);
                                                coord.push(lonlat);
                                            }
                                            var polyline = new L.Polyline(coord, {
                                                color: 'red',
                                                weight: 5,
                                                opacity: 0.5,
                                                smoothFactor:1
                                            });
                                            polyline.addTo(myMap);
                                        }
                                    }
                                },
                                error: function () {
                                    console.log('nooo');
                                }
                            });
                        });

                        $('#stationen li').on('click', function() {

                            var numb = $(this).attr('id');
                            var rblUbahn = ubahndaten[target].stationen[numb][1][2];
                            myMap.setView([ubahndaten[target].stationen[numb][1][0], ubahndaten[target].stationen[numb][1][1]], 14);
                            var ubahnMarker = L.marker([ubahndaten[target].stationen[numb][1][0], ubahndaten[target].stationen[numb][1][1]], {icon: createIcon('icons/sharp-subway.svg')}).addTo(myMap);

                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData:'rbl', rblNumber: rblUbahn },
                                success: function(liveData) {

                                    var parsed = JSON.parse(liveData);
                                    console.log(parsed);
                                    var uContent = ubahndaten[target].stationen[numb][0] + '<br>Linie ' + parsed.response[0] + '<br>Endstation ' + parsed.response[2]+ '<br>Nächste Ubahn in ' + parsed.response[1] + ' Minuten';
                                    
                                    ubahnMarker.bindPopup(uContent).openPopup();
                                    
                                },
                                error: function (){
                                    alert('nooo');
                                }
                            });
                        }); 
                    }
                };
            }
        });
    });
    $('#dropdownBim li').on('click', function() {
        var target = $(this).html();
        $.ajax({
            url: rootLink + 'json/tram.json',
            datatype:'json',
            success: function(reponse){
                var bimDaten = reponse.lineData[0];
                for (var key in bimDaten) {
                    if (key == target) {
                        createButton(bimDaten[target].stationen, target); 
                        buttonShowAll(target);    

                        $('#allButton').on('click', function () {
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData: 'getAll', type: 'tram'},
                                success: function (response) {
                                    
                                    var line = response.lineData[0];
                                    var coord = [];
                                    for (let tar in line) {
                        
                                        if (tar == target) {
                        
                                            var stations = line[target].stationen;
                                            for (let s = 0; s < stations.length; s++) {
                        
                                                myMap.setView([stations[0][1][0],stations[0][1][1]], 12);
                                                var allMarker = L.marker([stations[s][1][0],stations[s][1][1]], {icon: createIcon('icons/sharp-railway.svg')}).addTo(myMap);
                                                var stName = stations[s][0];
                                                allMarker.bindPopup(stName);
                                                var lonlat = new L.LatLng(stations[s][1][0], stations[s][1][1]);
                                                coord.push(lonlat);
                                            }
                                            var polyline = new L.Polyline(coord, {
                                                color: 'red',
                                                weight: 5,
                                                opacity: 0.5,
                                                smoothFactor:1
                                            });
                                            polyline.addTo(myMap);
                                        }
                                    }
                                },
                                error: function () {
                                    console.log('nooo');
                                }
                            });
                        });
                        $('#stationen li').on('click', function() {

                            var numb = $(this).attr('id');
                            var rblBim = bimDaten[target].stationen[numb][1][2];
                            myMap.setView([bimDaten[target].stationen[numb][1][0], bimDaten[target].stationen[numb][1][1]], 14);
                            var bimMarker = L.marker([bimDaten[target].stationen[numb][1][0], bimDaten[target].stationen[numb][1][1]], {icon: createIcon('icons/sharp-railway.svg')}).addTo(myMap);
                            
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData:'rbl', rblNumber: rblBim },
                                success: function(liveData) {
                                    
                                    var parsed = JSON.parse(liveData);
                                    console.log(parsed);
                                    var tContent = bimDaten[target].stationen[numb][0] + '<br>Linie ' + parsed.response[0] + '<br>Endstation ' + parsed.response[2]+ '<br>Nächste Straßenbahn in ' + parsed.response[1] + ' Minuten';
                                    
                                    bimMarker.bindPopup(tContent).openPopup();
                                    
                                },
                                error: function (){
                                    alert('nooo');
                                }
                            });
                        }); 
                    }
                };
            }
        });
    });
    $('#dropdownBus li').on('click', function() {
        var target = $(this).html();
        
        $.ajax({
            url: rootLink + 'json/bus.json',
            datatype:'json',
            success: function(reponse){
                var busDaten = reponse.lineData[0];
                for (var key in busDaten) {
                    if (key == target) {
                        createButton(busDaten[target].stationen, target); 
                        buttonShowAll(target);    

                        $('#allButton').on('click', function () {
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData: 'getAll', type: 'bus'},
                                success: function (response) {
                                    
                                    var line = response.lineData[0];
                                    var coord = [];
                                    for (let tar in line) {
                        
                                        if (tar == target) {
                        
                                            var stations = line[target].stationen;
                                            for (let s = 0; s < stations.length; s++) {
                        
                                                myMap.setView([stations[0][1][0],stations[0][1][1]], 12);
                                                var allMarker = L.marker([stations[s][1][0],stations[s][1][1]], {icon: createIcon('icons/sharp-bus.svg')}).addTo(myMap);
                                                var stName = stations[s][0];
                                                allMarker.bindPopup(stName);
                                                var lonlat = new L.LatLng(stations[s][1][0], stations[s][1][1]);
                                                coord.push(lonlat);
                                            }
                                            var polyline = new L.Polyline(coord, {
                                                color: 'red',
                                                weight: 5,
                                                opacity: 0.5,
                                                smoothFactor:1
                                            });
                                            polyline.addTo(myMap);
                                        }
                                    }
                                },
                                error: function () {
                                    console.log('nooo');
                                }
                            });
                        });

                        $('#stationen li').on('click', function() {
                            var numb = $(this).attr('id');
                            var rblBus = busDaten[target].stationen[numb][1][2];
                            console.log(rblBus);
                            myMap.setView([busDaten[target].stationen[numb][1][0], busDaten[target].stationen[numb][1][1]], 14);
                            var busMarker = L.marker([busDaten[target].stationen[numb][1][0], busDaten[target].stationen[numb][1][1]],{icon: createIcon('icons/sharp-bus.svg')}).addTo(myMap);
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData:'rbl', rblNumber: rblBus },
                                success: function(liveData) {
                                    var parsed = JSON.parse(liveData);
                                    console.log(parsed);
                                    var bContent = busDaten[target].stationen[numb][0] + '<br>Linie ' + parsed.response[0] + '<br>Endstation ' + parsed.response[2]+ '<br>Nächster Bus in ' + parsed.response[1] + ' Minuten';
                                    
                                    busMarker.bindPopup(bContent).openPopup();
                                    
                                },
                                error: function (){
                                    alert('nooo');
                                }
                            });
                        }); 
                    }
                };
            }
        });
    });
    $('#dropdownNightline li').on('click', function() {
        var target = $(this).html();
        
        $.ajax({
            url: rootLink + 'json/nightline.json',
            datatype:'json',
            success: function(reponse){
                var nightDaten = reponse.lineData[0];
                for (var key in nightDaten) {
                    if (key == target) {
                        createButton(nightDaten[target].stationen, target); 
                        buttonShowAll(target);    

                        $('#allButton').on('click', function () {
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData: 'getAll', type: 'nightline'},
                                success: function (response) {
                                    
                                    var line = response.lineData[0];
                                    var coord = [];
                                    for (let tar in line) {
                        
                                        if (tar == target) {
                        
                                            var stations = line[target].stationen;
                                            for (let s = 0; s < stations.length; s++) {
                        
                                                myMap.setView([stations[0][1][0],stations[0][1][1]], 12);
                                                var allMarker = L.marker([stations[s][1][0],stations[s][1][1]], {icon: createIcon('icons/sharp-bus.svg')}).addTo(myMap);
                                                var stName = stations[s][0];
                                                allMarker.bindPopup(stName);
                                                var lonlat = new L.LatLng(stations[s][1][0], stations[s][1][1]);
                                                coord.push(lonlat);
                                            }
                                            var polyline = new L.Polyline(coord, {
                                                color: 'red',
                                                weight: 5,
                                                opacity: 0.5,
                                                smoothFactor:1
                                            });
                                            polyline.addTo(myMap);
                                        }
                                    }
                                },
                                error: function () {
                                    console.log('nooo');
                                }
                            });
                        });

                        $('#stationen li').on('click', function() {
                            var numb = $(this).attr('id');
                            var rblBus = nightDaten[target].stationen[numb][1][2];
                            console.log(rblBus);
                            myMap.setView([nightDaten[target].stationen[numb][1][0], nightDaten[target].stationen[numb][1][1]], 14);
                            var nightMarker = L.marker([nightDaten[target].stationen[numb][1][0], nightDaten[target].stationen[numb][1][1]],{icon: createIcon('icons/sharp-bus.svg')}).addTo(myMap);
                            $.ajax({
                                url: rootLink + 'lib/EchtzeitDatenAPI.php',
                                method: 'GET',
                                data: {getLiveData:'rbl', rblNumber: rblBus },
                                success: function(liveData) {
                                    var parsed = JSON.parse(liveData);
                                    console.log(parsed);
                                    var bContent = nightDaten[target].stationen[numb][0] + '<br>Linie ' + parsed.response[0] + '<br>Endstation ' + parsed.response[2]+ '<br>Nächster Bus in ' + parsed.response[1] + ' Minuten';
                                    
                                    nightMarker.bindPopup(bContent).openPopup();
                                    
                                },
                                error: function (){
                                    alert('nooo');
                                }
                            });
                        }); 
                    }
                };
            }
        });
    });



});


// U1 Koordinaten zum testen
/*     var coords =[
    ["48.142442551082", "16.3999582372354"],
    ["48.1457452971493", "16.3864835079736"],
    ["48.1538903631184", "16.3823243082082"],
    ["48.1621060403008", "16.3833843202434"],
    ["48.169038305165", "16.3803839471945"],
    ["48.174154518495", "16.3781920579012"],
    ["48.178132111491", "16.3765391577784"],
    ["48.1851879855188", "16.3764133936387"],
    ["48.1938777144884", "16.3702779002481"],
    ["48.2008475966667", "16.3688765284049"],
    ["48.2081338220924", "16.3716343563271"],
    ["48.2117496082805", "16.3778956138575"],
    ["48.2148144456506", "16.384650944794"],
    ["48.2185135557888", "16.3923315404733"],
    ["48.2240916436254", "16.4018896150963"],
    ["48.2289989006584", "16.4109805657716"],
    ["48.2323379601984", "16.4154990916507"],
    ["48.2379564234283", "16.4242307162123"],
    ["48.2436460592695", "16.433698959307"],
    ["48.2503041038334", "16.4433019496942"],
    ["48.257356019686", "16.4494464262376"],
    ["48.2627624278838", "16.4515754334609"],
    ["48.2706317965585", "16.4480720038529"],
    ["48.2777287364278", "16.4498416849626"]
]; */
/*     for (let i = 0; i < coords.length; i++) {
        L.marker([coords[i][0], coords[i][1]]).addTo(myMap);
    } */
