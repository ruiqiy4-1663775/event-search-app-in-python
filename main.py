from geolib import geohash
import requests
import json
from flask import Flask, request, jsonify
app = Flask(__name__)
@app.route('/')
def hello_world():
    return app.send_static_file('base.html')

@app.route('/venue', methods=["GET"])
def venue():
    print("venue")
    url = "https://app.ticketmaster.com/discovery/v2/venues?apikey=VWHOUdUAYiGRVynzacsAazCX9AlaG34M&keyword="
    arg = request.args
    info = arg.to_dict()
    print("++++++++", info)
    key = info["keyword"]
    key = key.replace(' ', '%20')
    url += key
    print(url)
    ticketmaster_response = requests.get(url)
    ticketmaster_response = ticketmaster_response.json()
    ticketmaster_response = jsonify(ticketmaster_response)
    return ticketmaster_response

@app.route('/search', methods=["GET"])
def do_search():
    print("search")
    url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=VWHOUdUAYiGRVynzacsAazCX9AlaG34M"
    arg = request.args
    info = arg.to_dict()
    print("++++++++", info)
    # geo point
    latitude = info["latitude"]
    longitude = info["longitude"]
    geoPoint = geohash.encode(latitude, longitude, 7)
    url += "&geoPoint=" + geoPoint
    # radius
    radius = info["distance"]
    url += "&radius=" + radius
    # segment id
    segment_choose = info["category"]
    if segment_choose != "Default":
        segment_id = ""
        if segment_choose == "Music":
            segment_id = "KZFzniwnSyZfZ7v7nJ"
        if segment_choose == "Sports":
            segment_id = "KZFzniwnSyZfZ7v7nE"
        if segment_choose == "ArtsTheatre":
            segment_id = "KZFzniwnSyZfZ7v7na"
        if segment_choose == "Film":
            segment_id = "KZFzniwnSyZfZ7v7nn"
        if segment_choose == "Miscellaneous":
            segment_id = "KZFzniwnSyZfZ7v7n1"
        url += "&segmentId=" + segment_id
    url += "&unit=" + "miles"
    keyword = info["keyword"]
    url += "&keyword=" + keyword
    ticketmaster_response = requests.get(url).json()
    ticketmaster_response = jsonify(ticketmaster_response)
    return ticketmaster_response



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
