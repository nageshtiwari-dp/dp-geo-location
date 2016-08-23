/**
 * dp-geo-location [v1.0]
 *
 * Author:
 * Nageshwar Tiwari
 * Docplexus.in
 */
 
(function($) {
    geoLocationFn = function(options) {
        var defaults = {};
        var settings = $.extend(defaults, options);
        var positionObj = null;
        var latitude = null;
        var longitude = null;

        var handleLocation = function(position){
            positionObj = position;
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            postLocationToServer(position);
        }

        var handleError = function(error) {
            positionObj = "error";
            postLocationToServer(null);
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied the request for Geolocation");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location information is unavailable");
                    break;
                case error.TIMEOUT:
                    console.log("The request to get user location timed out");
                    break;
                case error.UNKNOWN_ERROR:
                    console.log("An unknown error occurred");
                    break;
            }
        }

        var postLocationToServer = function(position) {
            var url = document.URL;
            url = url.replace("http://www.docplexus.in", "");

            var referrer = document.referrer;
            referrer = referrer.replace("http://www.docplexus.in", "");
            var geoPrecision = 3;

            if (position == null) {
                $.post("http://www.docplexus.in/user/location/save", {
                    location : "",
                    referrer : referrer,
                    url : url
                });
            } else {
                $.post("http://www.docplexus.in/user/location/save", {
                    location : position.coords.latitude.toFixed(geoPrecision) + ","
                            + position.coords.longitude.toFixed(geoPrecision),
                    referrer : referrer,
                    url : url
                });
            }
        }

        var getAddressFromLocation = function(cords) {
            var addressJson = "";
            if (cords != undefined && cords != null) {
                var geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + cords.latitude + "," + cords.longitude;
                $.ajax({
                    dataType : "json",
                    url : geocodingAPI,
                    success : function(json) {
                        addressJson += '{';
                        var fullAddress = json.results[0].formatted_address;
                        var comp = json.results[0].address_components;
                        for (var i = 0; i < comp.length; i++) {
                            var obj = comp[i];
                            if (obj.types[0] == "route")
                                addressJson += '"route"' + ':"' + obj.long_name
                                        + '" ,';
                            else if (obj.types[0] == "neighborhood")
                                addressJson += '"neighborhood"' + ':"'
                                        + obj.long_name + '" ,';
                            else if (obj.types[0] == "sublocality_level_2")
                                addressJson += '"sub_area"' + ':"'
                                        + obj.long_name + '" ,';
                            else if (obj.types[0] == "sublocality_level_1")
                                addressJson += '"area"' + ':"' + obj.long_name
                                        + '" ,';
                            else if (obj.types[0] == "locality")
                                addressJson += '"city"' + ':"' + obj.long_name
                                        + '" ,';
                            else if (obj.types[0] == "administrative_area_level_2")
                                addressJson += '"district"' + ':"'
                                        + obj.long_name + '" ,';
                            else if (obj.types[0] == "administrative_area_level_1")
                                addressJson += '"state"' + ':"' + obj.long_name
                                        + '" ,';
                            else if (obj.types[0] == "country")
                                addressJson += '"country"' + ':"'
                                        + obj.long_name + '" ,';
                            else if (obj.types[0] == "postal_code")
                                addressJson += '"postal_code"' + ':"'
                                        + obj.long_name + '" ,';
                        }
                        addressJson += '"full_address"' + ':"' + fullAddress
                                + '"';
                        addressJson += '}';
                    },
                    async : false
                });
            }
            return addressJson;
        }

        var fetchGeoLocation = function(callbackFn) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(handleLocation, handleError);
            } else {
                console.log("Geolocation is not supported by this browser");
            }
        }

        fetchGeoLocation();

        return {
            getCords : function() {
                if(positionObj=="error") return "error";
                if(latitude!=null && longitude!=null) return {"latitude": latitude, "longitude": longitude};
                else return null;
            },
            getPositionObj : function() {
                if(positionObj=="error") return "error";
                if(latitude!=null && longitude!=null) return positionObj;
                else return null;
            },
            getAddress : function() {
                if(positionObj=="error") return "error";
                if(latitude!=null && longitude!=null) return getAddressFromLocation({"latitude": latitude, "longitude": longitude});
                else return null;
            },
            getAddressFromCords : function(cords) {
                if(positionObj=="error") return "error";
                if(latitude!=null && longitude!=null && cords!=undefined && cords!=null) return getAddressFromLocation({"latitude": cords.latitude, "longitude": cords.longitude});
                else return null;
            }
        };
    }
}(jQuery));
