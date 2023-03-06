var events_list_global;
const table_col_flag = [0, 0, 0, 0, 0];

function search(){
    clearResultArea();
    if (document.getElementById("keyword").value =="") {
        return 0;
    }
        if(!document.getElementById("auto_location").checked){
            console.log("use the given location")
            var googleGeoApi_base_url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBDUst685JCxVXkMy_kDYnslTN3yscwF1c&address="
            var location = document.getElementById("location").value;
            if (location == "") {
                console.log("location is not given");
                return 0;
            }
            console.log(location)
            googleGeoApi_base_url += location
            console.log(googleGeoApi_base_url)
            var response = fetch(googleGeoApi_base_url)
            response.then(res => res.json())
                    .then(function(geo_data){
                        console.log("res:", geo_data)
                        if (geo_data.results.length == 0) {
                            console.log("nothing is found");
                            noRecords();
                        } else {
                            var lat = geo_data["results"][0]["geometry"]["location"]["lat"]
                            var lng = geo_data["results"][0]["geometry"]["location"]["lng"]
                            requestBackend(lat, lng)
                        }
                    })
        }
        else{
            geo_url = "https://ipinfo.io/?token=56092a13281c15"
            var responsePromise = fetch(geo_url);
            responsePromise
                .then(function(response) {
                        return response.json();
                    })
                .then(function(geoData){
                    console.log(geoData)
                    var location = geoData["loc"]
                    var location_lat = location.substring(0, location.indexOf(','))
                    var location_log = location.substring(location.indexOf(',') + 1, location.length)
                    latitude = location_lat
                    longitude = location_log
                    console.log(latitude, longitude)
                    requestBackend(latitude, longitude)
                })
        }
}

function requestBackend(lat_used, long_used){
    // var backend_url = "http://127.0.0.1:8080/search?"
    // var backend_url = "http://event-finder-project-377803.wl.r.appspot.com/search?"
    var backend_url = "/search?"
    var keyword = document.getElementById("keyword").value;
    var category = document.getElementById("category").value;
    var distance = document.getElementById("distance").value;
    if(distance == ''){
        distance = 10
    }
    backend_url += "keyword=" + keyword
    backend_url += "&category=" + category
    backend_url += "&distance=" + distance
    backend_url += "&latitude=" + lat_used
    backend_url += "&longitude=" + long_used
    console.log(backend_url);
    var response = fetch(backend_url)
    response.then(res => res.json())
            .then(function(events_data){
                if(events_data.page.totalElements == 0){
                    noRecords();    
                }
                else{
                    clearResultArea();
                    var searchResultTableHead = document.getElementById('searchResultHead')
                    var tableHead = document.createElement('tr');
                    tableHead.innerHTML = '<th>Date</th><th>Icon</th><th onClick="sort(2)">Event</th><th onClick="sort(3)")>Genre</th><th onClick="sort(4)">Venue</th>'
                    searchResultTableHead.appendChild(tableHead)
                    var searchResultTable = document.getElementById('searchResult')
                    var events_list = events_data["_embedded"]["events"]
                    events_list_global = events_list
                    for(var i = 0; i < events_list.length; ++i){
                        var newTableRow = document.createElement('tr');
                        var image_url = ''
                        if(events_list[i].hasOwnProperty("images") && events_list[i].images.length > 0){
                            if(events_list[i].images[0].hasOwnProperty("url")){
                                image_url = events_list[i].images[0].url
                            }
                        }
                        var genre = 'N/A'
                        if(events_list[i].hasOwnProperty("classifications")){
                            if(events_list[i].classifications[0].hasOwnProperty("segment")){
                                genre = events_list[i].classifications[0].segment.name
                            }
                        }
                        var localDate = ''
                        var localTime = ''
                        if(events_list[i].hasOwnProperty("dates") && events_list[i].dates.hasOwnProperty("start")){
                            if(events_list[i].dates.start.hasOwnProperty("localDate")){
                                localDate = events_list[i].dates.start.localDate
                            }
                            if(events_list[i].dates.start.hasOwnProperty("localTime")){
                                localTime = events_list[i].dates.start.localTime
                            }
                        }
                        var eventName = ''
                        if(events_list[i].hasOwnProperty("name")){
                            eventName = events_list[i].name
                        }
                        var venuesName = ''
                        if(events_list[i].hasOwnProperty("_embedded") && events_list[i]._embedded.hasOwnProperty("venues") && events_list[i]._embedded.venues.length > 0){
                            if(events_list[i]._embedded.venues[0].hasOwnProperty("name")){
                                venuesName = events_list[i]._embedded.venues[0].name
                            }
                        }
                        newTableRow.innerHTML = '<td>' + localDate + '<br>' + localTime + '</td><td>'
                                                + '<img src=' + image_url +' style="width: 80px; height:60px"></img>' +'</td><td>'
                                                + '<a href="#detail_div" onClick="displayDetail(' + i +')" style="text-decoration: none; font-color: black">' + eventName + '</a>' +'</td><td>'
                                                + genre +'</td><td>'
                                                + venuesName +'</td>';
                        searchResultTable.appendChild(newTableRow);
                    }
                }
            })
}

function requestVenue(keyword) {
    // var backend_url = "http://127.0.0.1:8080/venue?"
    // var backend_url = "http://event-finder-project-377803.wl.r.appspot.com/venue?"
    var backend_url = "/venue?"
    backend_url += "keyword=" + keyword;
    backend_url = backend_url.replace(' ', '%20');
    var response = fetch(backend_url)
    response.then(res => res.json())
            .then(function(venue_data){
                console.log(venue_data);
                nameV = venue_data._embedded.venues[0].name;
                address = venue_data._embedded.venues[0].address.line1;
                city = venue_data._embedded.venues[0].city.name + "," + venue_data._embedded.venues[0].state.stateCode;
                postal = venue_data._embedded.venues[0].postalCode;
                var a = document.getElementById("address");
                a.innerHTML = address + "<br>" + city + "<br>" + postal;
                a = document.getElementById("nameV");
                a.innerHTML = nameV;
                a = document.getElementById("more");
                a.href = venue_data._embedded.venues[0].url;
                url = 'https://www.google.com/maps/search/?api=1&query=';
                url = url + nameV + ',' + address + ',' + city + ',' + postal;
                url = url.replace(' ', '+');
                url = url.replace(',', '%2C');
                a = document.getElementById('map');
                a.href = url;
                console.log(venue_data._embedded.venues[0].hasOwnProperty("images"));
                // if there is an image
                if (venue_data._embedded.venues[0].hasOwnProperty("images")) {
                    console.log("hello");
                    var img = document.createElement('img');
                    img.style.height = "50px";
                    img.style.width = "80px";
                    img.id = "icon";
                    img.src = venue_data._embedded.venues[0].images[0].url;
                    document.getElementById("venue_inner").insertBefore(img, document.getElementById("lower_venue"));
                }
            })

}

function sort(col) {
    var table = document.getElementById('searchResult');
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 0; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("td")[col];
        y = rows[i + 1].getElementsByTagName("td")[col];
        if (col == 2) {
            x = x.getElementsByTagName("a")[0];
            y = y.getElementsByTagName("a")[0];
        }
        console.log(x.innerHTML);
        console.log(y.innerHTML);
        var k;
        if (table_col_flag[col] == 0) {
            k = x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase();
        } else {
            k = x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase();
        }
        // Check if the two rows should switch place:
        if (k) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
    if (table_col_flag[col] == 0) {
        table_col_flag[col] = 1;
    } else {
        table_col_flag[col] = 0;
    }
}


function displayDetail(eventIndex){
    var event_content = events_list_global[eventIndex]
    var name = event_content.name
    var Date = event_content.dates.start.localDate + ' ' + event_content.dates.start.localTime
    var ArtistTeamList = ''
    if(event_content.hasOwnProperty("_embedded") && event_content._embedded.hasOwnProperty("attractions")){
        for(var i = 0; i < event_content._embedded.attractions.length; ++i){
            if(event_content._embedded.attractions[i].hasOwnProperty('url')){
                ArtistTeamList += '<a style = "color:rgb(38, 131, 193);" href="' + event_content._embedded.attractions[i].url + '" target="_blank" style="text-decoration:none;">' + event_content._embedded.attractions[i].name + '</a>'
            }
            else{
                ArtistTeamList += event_content._embedded.attractions[i].name
            }
            if(i != event_content._embedded.attractions.length-1){
                ArtistTeamList += " | "
            }
            if(i > 1 && i % 2 == 0){
                ArtistTeamList += " <br> "
            }
        }
    }
    venue();
    document.getElementById("venue_outer").style.display = 'none';
    if (document.getElementById("icon") != null) {
        document.getElementById("icon").remove();
    }
    var Venue = event_content._embedded.venues[0].name
    requestVenue(Venue);
    var GenresList = ''
    if(event_content.hasOwnProperty("classifications")){
        if(event_content.classifications[0].hasOwnProperty("subGenre") && event_content.classifications[0].subGenre.name != 'Undefined'){
            GenresList += event_content.classifications[0].subGenre.name 
        }
        if(event_content.classifications[0].hasOwnProperty("genre") && event_content.classifications[0].genre.name != 'Undefined'){
            GenresList += ' | ' + event_content.classifications[0].genre.name
        }
        if(event_content.classifications[0].hasOwnProperty("segment") && event_content.classifications[0].segment.name != 'Undefined'){
            GenresList += ' | ' + event_content.classifications[0].segment.name
        }
        if(event_content.classifications[0].hasOwnProperty("subType") && event_content.classifications[0].subType.name != 'Undefined'){
            GenresList += ' | ' + event_content.classifications[0].subType.name
        }
        if(event_content.classifications[0].hasOwnProperty("type") && event_content.classifications[0].type.name != 'Undefined'){
            GenresList += ' | ' + event_content.classifications[0].type.name
        }
    }
    var priceRanges = ''
    if(event_content.hasOwnProperty("priceRanges")){
        priceRanges = event_content.priceRanges[0].min + '-' + event_content.priceRanges[0].max + " " + event_content.priceRanges[0].currency;
    }
    var TicketStatus = event_content.dates.status.code
    var BuyTicketAt = event_content.url
    var SeatMap = ''
    if(event_content.hasOwnProperty("seatmap")){
        SeatMap = event_content.seatmap.staticUrl
    }
    
    var tempInnerHtml = ''
    var head = document.getElementById("name");
    head.innerHTML = name;
    tempInnerHtml = '<h2>Date</h2><p>' + Date + '</p>'
    if(ArtistTeamList != ''){
        tempInnerHtml += '<h2>Artist/Team</h2><p>' + ArtistTeamList + '</p>'
    }
    tempInnerHtml += '<h2>Venue</h2><p>' + Venue + '</p>'
    if(GenresList != ''){
        tempInnerHtml += '<h2>Genres</h2><p>' + GenresList + '</p>'
    }
    
    if(priceRanges != ''){
        tempInnerHtml += '<h2>Price Ranges</h2><p>' + priceRanges + '</p>'
    }
    tempInnerHtml += '<h2>Ticket Status</h2><p>' + '<button id = "status" type="button">' + TicketStatus + '</button></p>'
    tempInnerHtml += '<h2>Buy Ticket At</h2><p><a href="' + BuyTicketAt + '" target="_blank" style="text-decoration:none; color: rgb(38, 131, 193);">ticketmaster</a></p>'
    var textBlock = document.getElementById("text_info");
    textBlock.innerHTML = tempInnerHtml;
    change_button_color(TicketStatus);
    if(SeatMap != ''){
        var imageBlock = document.getElementById("seatMap");
        imageBlock.innerHTML = '<img width=100% src=' + SeatMap +'></img></div>';
    }
}

// create the venue button
function venue() {
    var v = document.getElementById("venue_outer");
    var p = document.createElement("p");
    document.body.insertBefore(p, v);
    p.innerHTML = "Show Venue Details";
    p.style.textAlign = "center";
    p.style.fontSize = '25px';
    p.style.marginBottom = '0px';
    p.id = 'venueButtonText';
    var d = document.createElement("div");
    d.style.border = "solid";
    d.style.borderColor = "white";

    document.body.insertBefore(d, v);
    d.style.transform = 'rotate(45deg)';
    d.style.width = '20px';
    d.style.height = '20px';
    d.style.margin = 'auto';
    d.style.borderLeftWidth = '0px';
    d.style.borderTopWidth = '0px';
    d.style.marginTop = '0px';
    d.id = "venueButton";
    d.addEventListener("click", function() {showCard(p, d)});
}

function showCard(p, d) {
    p.remove();
    d.remove();
    document.getElementById("venue_outer").style.display = "block";
}


function change_button_color(TicketStatus) {
    var ele = document.getElementById("status"); 
    var color = '';
    if (TicketStatus ==  'onsale') {
        color = 'green';
        ele.innerHTML = 'On Sale';
    }  else if (TicketStatus ==  'offsale') {
        color = 'red';
        ele.innerHTML = 'Off Sale';
    }  else if (TicketStatus ==  'cancelled') {
        color = 'black';
        ele.innerHTML = 'Cancelled';
    }  else {
        color = 'orange';
        ele.innerHTML = 'Rescheduled';
    }
    ele.style.backgroundColor = color;
}

function noRecords() {
    var resultDiv = document.getElementById('noRecords');
    resultDiv.innerHTML = '<p style="color: red; padding-top:1%; padding-bottom:1%;">No Records has been found</p>'
}

function clearAll(){
    document.getElementById("form").reset();
    document.getElementById('location_div').style.display = 'block';
    document.getElementById('location').required = true;
    clearResultArea();
}

function clearResultArea(){
    var noRecords = document.getElementById("noRecords");
    noRecords.innerHTML = ''
    var searchResultHead = document.getElementById("searchResultHead");
    searchResultHead.innerHTML = ''
    var searchResult = document.getElementById("searchResult");
    searchResult.innerHTML = ''
    var detailResult = document.getElementById("name");
    detailResult.innerHTML = '';
    detailResult = document.getElementById("text_info");
    detailResult.innerHTML = '';
    detailResult = document.getElementById("seatMap");
    detailResult.innerHTML = '';
    var t = document.getElementById('venueButton');
    if (t != null) {t.remove()}
    t = document.getElementById('venueButtonText');
    if (t != null){t.remove()}
    document.getElementById("venue_outer").style.display = "none";
    t = document.getElementById("icon");
    if (t != null){t.remove()}
}

window.onload = function () {
    const checkbox = document.getElementById("auto_location");
    const locationContainer = document.getElementById('location_div');
    const test = document.getElementById('location');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
        locationContainer.style.display = 'none';
        test.required = false;
        } else {
        locationContainer.style.display = 'block';
        test.required = true;
        }
    });
}