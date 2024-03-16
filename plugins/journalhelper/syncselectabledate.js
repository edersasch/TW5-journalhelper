/*\
title: $:/plugins/edersasch/journalhelper/syncselectabledate.js
type: application/javascript
module-type: macro

synchronize the date content of a field with standard tiddler date content
and a date for an 'edit-text type="date"' format YYYY-MM-DD

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "syncselectabledate";

exports.params = [
    {name: "tiddler",                       default: ""},
    {name: "datefield",                     default: "created"},
    {name: "selectabledatefield",           default: "journaldate"}
];

/*
Run the macro
*/
exports.run = function(tiddler, datefield, selectabledatefield) {
    if (datefield === "" || selectabledatefield === "") {
        return;
    }
    if (tiddler === "") {
        tiddler = this.getVariable("currentTiddler");
    }
    const tid = this.wiki.getTiddler(tiddler);
    if (tid) {
        const tiddlerdate = tid.getFieldString(datefield);
        const selectabledate = tid.getFieldString(selectabledatefield);
        if (tiddlerdate !== "" || selectabledate !== "") {
            let yearstr = tiddlerdate.substring(0, 4);
            let monthstr = tiddlerdate.substring(4, 6);
            let daystr = tiddlerdate.substring(6, 8);
            if (selectabledate === "") {
                this.wiki.setText(tiddler, selectabledatefield, null, yearstr + "-" + monthstr + "-" + daystr);
            } else {
                const jyear = selectabledate.substring(0, 4);
                const jmonth = selectabledate.substring(5, 7);
                const jday = selectabledate.substring(8, 10);
                if (yearstr !== jyear || monthstr !== jmonth || daystr !== jday) {
                    yearstr = jyear;
                    monthstr = jmonth;
                    daystr = jday;
                    const updatedDate = yearstr + monthstr + daystr + tiddlerdate.substring(8);
                    this.wiki.setText(tiddler, datefield, null, updatedDate);
                }
            }
        }
    }
    return "";
};

})();
