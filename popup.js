var pledgeUrl = "https://kickstarter.getpebble.com/pledges/";
var inputUrl;

function checkURL() {
    var url = document.getElementById("URL").value;
    var regEx = new RegExp(/(https:\/\/)?(kickstarter\.getpebble\.com\/pledges\/)[^/\\]*/);

    if(regEx.test(url)){
        inputUrl = url;
        request(url, parsePageHtml);
    } else {
        var info = document.getElementById("Info");
        info.innerHTML = "I know you want your Pebble Time (Steel) so enter the URL correctly!";
    }
}
var request = function(url, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4) {
            return;
        }
        callback(xhr);
    };
    xhr.send();
};

var parsePageHtml = function(result){
    if(result.status == 200)
    {
        chrome.storage.sync.get("pebbleUrl", function(item){
            if(chrome.runtime.error) TeamNull(chrome.runtime.error);
            if(!item.pebbleUrl){
                chrome.storage.sync.set({'pebbleUrl': inputUrl});
            }
        });
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(result.responseText, "text/html");
        var jsonEl = htmlDoc.querySelector('[data-react-class="OrdersContainer"]');

        var jsonData = jsonEl.dataset.reactProps;
        var pledgeData = JSON.parse(jsonData);

        var name = pledgeData.pledge.name;

        var timeTrackingNumber = pledgeData.order.time_tracking_number;
        var steelTrackingNumber = pledgeData.order.steel_tracking_number;

        timeTrackingNumber = "q0498t"; //debugging

        if(timeTrackingNumber != null || steelTrackingNumber != null) {
            pledgeData.order.time_tracking_number = "2143";
            pledgeData.order.time_tracking_url = "localhost";
            ItIsTime(pledgeData.pledge.name, pledgeData.order);
        }
        else {
            TeamNull(null);
        }
    }else {
        TeamNull(result.status);
    }
};

var ItIsTime = function(name, data){
    document.getElementById("PebbleTimeInput").style.display = "none";
    var ptEl = document.getElementById("PT");
    var nameEl = document.createElement("div");
    var nameText = document.createTextNode("Hi " + name + "!");
    var p1 = document.createElement("p");
    var a1 = document.createElement("a");

    var p2 = document.createElement("p");
    var a2 = document.createElement("a");
    nameEl.appendChild(nameText);

    ptEl.appendChild(nameEl);

    var dataEl = document.createElement("p");
    var ttNumber = data.time_tracking_number;
    var stNumber = data.steel_tracking_number;
    var ttUrl = data.time_tracking_url;
    var stUrl = data.steel_tracking_url;

    if(ttNumber != null)
    {
        var info = document.createElement("p");
        var text = document.createTextNode("Your Pebble Time has shipped! Your tracking number is " + ttNumber + ". Click the url below to go to the tracking page:");
        info.appendChild(text);
        ptEl.appendChild(info);
        a1.setAttribute("href", ttUrl);
        a1.onclick = chrome.tabs.create({url: ttUrl});
        a1.innerHTML = "Its Time!";
        ptEl.appendChild(p1);
        ptEl.appendChild(a1);
    }

    if(stNumber != null)
    {
        var info = document.createElement("p");
        info.createTextNode("Your Pebble Time Steel has shipped!");
        ptEl.appendChild(info);
        p.createTextNode("Your tracking number is " + stNumber + ". Click the url below to go to the tracking page:");
        a2.setAttribute("href", stUrl);
        a2.onclick = chrome.tabs.create({url: stUrl});
        a2.innerHTML = "Its Coming!";
        ptEl.appendChild(p2);
        ptEl.appendChild(a2);
    }

    document.body.appendChild(ptEl);

};

var TeamNull = function(err){

    var input = document.getElementById("PT");
    var p = document.createElement("p");

    if(err){
        p.innerHTML = "Sorry, the extension could not connect to your Pledge page! (Or I F'ed up!). The error is:" + err

    } else {
        p.innerHTML = "#TeamNull!";
    }

    input.appendChild(p);
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("PebbleTimeInput").style.display = "none";
    chrome.storage.sync.get("pebbleUrl", function(item){
        if(chrome.runtime.error){console.log(chrome.runtime.error);}
        if(item.pebbleUrl){
            inputUrl = item.pebbleUrl;
            request(inputUrl, parsePageHtml);
        }else{
            document.getElementById("PebbleTimeInput").style.display = "block";
            var button = document.getElementById("URLEntered");
            button.addEventListener("click", checkURL);
        }
    });
});


function clearUrl() {
    chrome.storage.sync.remove("pebbleUrl", function(err){
        if(chrome.runtime.error) console.log("Error clearing pebble url!", chrome.runtime.error);
        if(err) console.log(err);
        console.log("hellow!");
    });
}
