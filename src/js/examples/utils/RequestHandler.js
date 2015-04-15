define(function(require) {
    'use strict';

    var _ = require('lodash');
    var Moment = require('moment');

    var testTableData = [
        {"spacecraft": "Amos", "name": "Amos", "mission": 'Communications sat, Israel', "launched": 5, "lastLaunchDate": 832204800000, "lastCommunication": Moment().subtract(3, 'minutes').valueOf()},
        {"spacecraft": "Hipparcos", "name": "Hipparcos", "mission": 'Astrometry (ESA)', "launched": 1, "lastLaunchDate": 618537600000, "lastCommunication": Moment().subtract(4, 'minutes').valueOf()},
        {"spacecraft": "Universitetskiy", "name": "Tatyana", "mission": 'Student satellite, Russia', "launched": 1, "lastLaunchDate": 1253145600000, "lastCommunication": Moment().subtract(1, 'minutes').valueOf()},
        {"spacecraft": "ISS", "name": "Aryabhata", "mission": 'Test satellite (India)', "launched": 1, "lastLaunchDate": 167097600000, "lastCommunication": 167529600000},
        {"spacecraft": "SEO", "name": "Bhaskara", "mission": 'Earth observing sat (India)', "launched": 1, "lastLaunchDate": 297561600000, "lastCommunication": 624585602301},
        {"spacecraft": "STARS-2", "name": "Kukai", "mission": 'Tether experiment', "launched": 2, "lastLaunchDate": 1393459200000, "lastCommunication": Moment().subtract(2, 'minutes').valueOf()},
        {"spacecraft": "Sina", "name": "Sina(h)-1", "mission": 'Test satellite', "launched": 1, "lastLaunchDate": 1130371200000, "lastCommunication": 1145577603301},
        {"spacecraft": "Ghauri", "name": "Ghauri", "mission": 'Missile', "launched": 2, "lastLaunchDate": 924048000000},
        {"spacecraft": "Marcopolo", "name": "Marcopolo", "mission": 'Communications sat, England', "launched": 2, "lastLaunchDate": 650937600000, "lastCommunication": 104353920521},
        {"spacecraft": "Giotto", "name": "Giotto", "mission": 'Comet probe (ESA)', "launched": 1, "lastLaunchDate": 489110400000, "lastCommunication": 711849600040},
        {"spacecraft": "MPLM-3", "name": "Donatello", "mission": 'Space station module, not flown', "launched": 0},
        {"spacecraft": "XMM", "name": "XMM-Newton", "mission": 'X-ray astronomy', "launched": 1, "lastLaunchDate": 962409610000, "lastCommunication": Moment().subtract(1, 'second').valueOf()},
    ];

    var pieChartData = [
        {"name": "Chrome", "value": 2090, "children": [
                {"name": 38, "value": 1933, "percent": 92.5},
                {"name": "Others", "value": 157, "percent": 7.5, "children": [
                    {"name": 37, "value": 41, "percent": 26.1},
                    {"name": 40, "value": 26, "percent": 16.6},
                    {"name": 33, "value": 24, "percent": 15.3},
                    {"name": 35, "value": 20, "percent": 12.7},
                    {"name": 39, "value": 18, "percent": 11.5},
                    {"name": 36, "value": 12, "percent": 7.6},
                    {"name": 21, "value": 4, "percent": 2.5},
                    {"name": 32, "value": 4, "percent": 2.5},
                    {"name": 29, "value": 4, "percent": 2.5},
                    {"name": 34, "value": 3, "percent": 1.9},
                    {"name": 28, "value": 1, "percent": 0.6}
                ]}
            ], "percent": 91.9},
        {"name": "Firefox", "value": 147, "children": [
            {"name": 33, "value": 77, "percent": 52.4},
            {"name": 32, "value": 30, "percent": 20.4},
            {"name": 31, "value": 23, "percent": 15.6},
            {"name": 27, "value": 8, "percent": 5.4},
            {"name": "Others", "value": 9, "percent": 6.2, "children": [
                {"name": 30, "value": 3, "percent": 33.3},
                {"name": 28, "value": 2, "percent": 22.2},
                {"name": 24, "value": 2, "percent": 22.2},
                {"name": 20, "value": 1, "percent": 11.1},
                {"name": 34, "value": 1, "percent": 11.1}
            ]}
        ], "percent": 6.5},
        {"name": "Others", "value": 36, "percent": 1.6, "children": [
            {"name": "IE", "value": 14, "children": [
                {"name": 10, "value": 9, "percent": 64.3},
                {"name": 11, "value": 5, "percent": 35.7}
            ], "percent": 38.9},
            {"name": "Chromium", "value": 8, "children": [
                {"name": 37, "value": 8, "percent": 100}
            ], "percent": 22.2},
            {"name": "Safari", "value": 12, "children": [
                {"name": 8, "value": 6, "percent": 50},
                {"name": 7, "value": 5, "percent": 41.7},
                {"name": 192, "value": 1, "percent": 8.3}
            ], "percent": 33.3},
            {"name": "Mobile Safari", "value": 2, "children": [
                {"name": 8, "value": 1, "percent": 50},
                {"name": 7, "value": 1, "percent": 50}
            ], "percent": 5.6}
        ]}
    ];

    var searchData = [
        {"id": 10, "name": "Beazer Homes USA, Inc."},
        {"id": 16, "name": "Huntington Bancshares Inc."},
        {"id": 35, "name": "ExxonMobil Corporation"},
        {"id": 61, "name": "Pitney Bowes Inc."},
        {"id": 23, "name": "Xerox Corp"},
        {"id": 47, "name": "Occidental Petroleum Corp"},
        {"id": 68, "name": "Air Products and Chemicals, Inc."},
        {"id": 9, "name": "Solutia Inc"},
        {"id": 76, "name": "Frontier Oil Corp"},
        {"id": 82, "name": "Johnson & Johnson"},
        {"id": 46, "name": "Phoenix Companies Inc"},
        {"id": 54, "name": "Imperial Sugar Company"},
        {"id": 94, "name": "Hollywood Entertainment Corp."},
        {"id": 22, "name": "3Com Corp"},
        {"id": 87, "name": "Tiffany & Co"},
        {"id": 29, "name": "American Greetings Corporation"},
        {"id": 60, "name": "Zions Bancorporation"},
        {"id": 107, "name": "LSI Logic Corporation"},
        {"id": 15, "name": "Nike Inc"},
        {"id": 115, "name": "Popular Inc"},
        {"id": 119, "name": "Dow Chemical Company"},
        {"id": 45, "name": "J.P. Morgan Chase & Co."},
        {"id": 99, "name": "General Mills Inc"},
        {"id": 111, "name": "W.R. Grace & Co"},
        {"id": 4, "name": "Broadwing, Inc."},
        {"id": 67, "name": "American Eagle Outfitters, Inc."},
        {"id": 93, "name": "E*Trade Group, Inc."},
        {"id": 8, "name": "Starbucks Corp"},
        {"id": 75, "name": "York International Corp"},
        {"id": 34, "name": "Harsco Corp."},
        {"id": 59, "name": "Fifth Third Bancorp"},
        {"id": 21, "name": "Wyndham International Inc"},
        {"id": 106, "name": "Ciena Corp."},
        {"id": 66, "name": "ABM Industries Incorporated"},
        {"id": 81, "name": "United Defense Industries Inc."},
        {"id": 7, "name": "IKON Office Solutions Inc."},
        {"id": 124, "name": "Volt Information Sciences Inc"},
        {"id": 53, "name": "First American Financial Corp."},
        {"id": 86, "name": "Champion Enterprises Inc."},
        {"id": 114, "name": "NSTAR"},
        {"id": 28, "name": "Walter Industries Inc"},
        {"id": 98, "name": "Aetna Inc."},
        {"id": 44, "name": "UST Inc"},
        {"id": 105, "name": "KeySpan Corp."},
        {"id": 126, "name": "Home Depot Inc."},
        {"id": 33, "name": "Radio Shack Corporation"},
        {"id": 74, "name": "Pulte Homes Inc"},
        {"id": 123, "name": "Magellan Health Services Inc."},
        {"id": 128, "name": "Target Corp."},
        {"id": 14, "name": "Yellow Corporation"},
        {"id": 110, "name": "BMC Software, Inc."},
        {"id": 65, "name": "Cytec Industries Inc."},
        {"id": 118, "name": "Walgreen Co"},
        {"id": 27, "name": "Gap Inc."},
        {"id": 52, "name": "National Rural Utilities Cooperative Finance Corporation"},
        {"id": 80, "name": "Illinois Tool Works Inc."},
        {"id": 20, "name": "Abercrombie & Fitch Co."},
        {"id": 58, "name": "National Commerce Financial Corporation"},
        {"id": 97, "name": "Tyson Foods Inc"},
        {"id": 43, "name": "Xcel Energy Inc"},
        {"id": 104, "name": "Dow Jones & Company, Inc."},
        {"id": 122, "name": "Ruddick Corp"},
        {"id": 3, "name": "ACT Manufacturing Inc."},
        {"id": 73, "name": "Petco Animal Supplies Inc."},
        {"id": 92, "name": "C. H. Robinson Worldwide Inc."},
        {"id": 13, "name": "Visteon Corporation"},
        {"id": 85, "name": "Lexmark International Inc."},
        {"id": 36, "name": "Oxford Health Plans Inc"},
        {"id": 64, "name": "Yum Brands Inc."},
        {"id": 2, "name": "Harley-Davidson Inc."},
        {"id": 32, "name": "A.G. Edwards Inc."},
        {"id": 101, "name": "Sunoco Inc."},
        {"id": 26, "name": "Fairchild Semiconductor International Inc."},
        {"id": 72, "name": "MGM Mirage"},
        {"id": 57, "name": "3M Company"},
        {"id": 91, "name": "Dollar General Corporation"},
        {"id": 6, "name": "Zale Corporation"},
        {"id": 103, "name": "Gateway Inc."},
        {"id": 109, "name": "HCA Inc."},
        {"id": 42, "name": "R.R. Donnelley & Sons Company"},
        {"id": 121, "name": "Abbott Laboratories"},
        {"id": 79, "name": "Johnson Controls Inc."},
        {"id": 129, "name": "M & T Bank Corporation"},
        {"id": 113, "name": "Exelon Corporation"},
        {"id": 12, "name": "Kohl's Corp."},
        {"id": 51, "name": "Xilinx Inc"},
        {"id": 96, "name": "PacifiCare Health Systems Inc"},
        {"id": 37, "name": "Idacorp Inc."},
        {"id": 90, "name": "Thomas & Betts Corporation"},
        {"id": 117, "name": "IMC Global Inc."},
        {"id": 19, "name": "Vulcan Materials Company"},
        {"id": 71, "name": "New York Times Company"},
        {"id": 127, "name": "CellStar Corp."},
        {"id": 125, "name": "Ace Hardware Corporation"},
        {"id": 31, "name": "L-3 Communications Holdings Inc."},
        {"id": 63, "name": "American Power Conversion Corporation"},
        {"id": 1, "name": "Quotaware Inc"},
        {"id": 50, "name": "Genzyme Corporation"},
        {"id": 56, "name": "Bank One Corporation"},
        {"id": 41, "name": "McDonald's Corporation"},
        {"id": 84, "name": "Sabre Holdings Corp"},
        {"id": 25, "name": "Universal Forest Products Inc"},
        {"id": 120, "name": "American Water Works Company, Inc."},
        {"id": 78, "name": "U.S. Bancorp"},
        {"id": 89, "name": "Brown Shoe Company, Inc."},
        {"id": 38, "name": "Wells Fargo & Company"},
        {"id": 102, "name": "CH2M Hill Cos. Ltd."},
        {"id": 116, "name": "Qualcomm Inc"},
        {"id": 11, "name": "United Auto Group Inc"},
        {"id": 100, "name": "Merrill Lynch & Co. Inc."},
        {"id": 70, "name": "Gannett Co., Inc."},
        {"id": 112, "name": "Lands' End Inc."},
        {"id": 108, "name": "Quanta Services Inc."},
        {"id": 18, "name": "W.R. Berkley Corporation"},
        {"id": 39, "name": "Dana Corporation"},
        {"id": 49, "name": "Maxtor Corporation"},
        {"id": 95, "name": "Office Depot Inc."},
        {"id": 24, "name": "Cigna Corp"},
        {"id": 83, "name": "Sears Roebuck & Co"},
        {"id": 77, "name": "Earthlink, Inc."},
        {"id": 88, "name": "OfficeMax Inc"},
        {"id": 17, "name": "Ferro Corp."},
        {"id": 69, "name": "Paychex Inc"},
        {"id": 48, "name": "J.C. Penny Co."},
        {"id": 62, "name": "Gold Kist Inc."},
        {"id": 40, "name": "Harris Corp."},
        {"id": 55, "name": "Revlon Inc"},
        {"id": 30, "name": "IDT Corporation"},
        {"id": 5, "name": "KeyCorp"}
    ];

    return {
        /**
         * Make an ajax request.
         * @param  {string} url - Url to request
         * @param  {[type]} data - Query string parameters to send with request
         * @param  {function} successCallback - Method to execute upon success
         * @param  {function} errorCallback - Method to execute upon failure
         * @param  {object|null} scope - Scope to execute callbacks
         */
        request: function(url, data, successCallback, errorCallback, scope) {
            setTimeout(function() {
                switch (url) {
                    case '/test/table':
                        successCallback(_.cloneDeep(testTableData));
                        break;
                    case '/test/piechart':
                        successCallback(_.cloneDeep(pieChartData));
                        break;
                    case '/test/search':
                        successCallback(_.cloneDeep(searchData));
                        break;
                }
                return {
                    abort: function(){}
                };
            }, 500);
        }
    };
});
