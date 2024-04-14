/*\
title: $:/plugins/edersasch/journalhelper/journalfilter.js
type: application/javascript
module-type: macro

Show a list of journal tiddlers that match a set of filter fields

* parameter tmp: temporary tiddler to use for field lookup, default is `$:/temp/journalfilter`
* parameter filter_year_field: name of the field to look for year filter number, default is `Filter Year`
* parameter filter_month_field: name of the field to look for month filter number, default is `Filter Month`
* parameter filter_day_field: name of the field to look for day filter number, default is `Filter Day`
* parameter filter_dayname_field: name of the field to look for short name of weekday filter string, default is `Filter Dayname`
* parameter filter_title_content_field: title / caption or content must contain the text, default is `Filter Title Content`

Every set filter field must match the corresponding part of the field `created`
of every non draft tiddler tagged with `Journal` or in case of filter_title_content_field
the title / caption or content.

A `Journal` tiddler not having a `created` field will be shown.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "journalfilter";

exports.params = [
    {name: "tmp",                           default: "$:/temp/journalfilter"},
    {name: "filter_year_field",             default: "Filter Year"},
    {name: "filter_month_field",            default: "Filter Month"},
    {name: "filter_day_field",              default: "Filter Day"},
    {name: "filter_dayname_field",          default: "Filter Dayname"},
    {name: "filter_title_content_field",    default: "Filter Title Content"}
];

/*
Run the macro
*/
exports.run = function(tmp, filter_year_field, filter_month_field, filter_day_field, filter_dayname_field, filter_title_content_field) {
    let filter_year = "";
    let filter_month = "";
    let filter_day = "";
    let filter_dayname = "";
    let filter_title_content = "";
    const tmptid = this.wiki.getTiddler(tmp);
    if (tmptid) {
        filter_year = tmptid.getFieldString(filter_year_field);
        filter_month = tmptid.getFieldString(filter_month_field);
        filter_day = tmptid.getFieldString(filter_day_field);
        filter_dayname = tmptid.getFieldString(filter_dayname_field);
        filter_title_content = tmptid.getFieldString(filter_title_content_field);
    }
    const matching_list_filter = "[tag[Journal]!has[draft.of]]";
    const journal_tiddlers = this.wiki.filterTiddlers(matching_list_filter);
    let titles = "";
    let titlesCount = 0;
    for (let i in journal_tiddlers) {
        const journalentry = this.wiki.getTiddler(journal_tiddlers[i]);
        if (journalentry) {
            const created = journalentry.getFieldString("created");
            let match = created === "";
            /*
             * Filtering the tiddlers
             *
             * Show if the tiddler has no field "created"
             * else
             *     hide if a year filter is present and it is not part of the created year
             *     else
             *         hide if a month or day filter is present and does not match
             *         else
             *             hide if a dayname filter is present and does not match
             *             else
             *                 hide if title_content filter is present and does not match
             */
            if (match === false) {
                const jyear = created.substring(0, 4);
                const jmonth = created.substring(4, 6);
                const jday = created.substring(6, 8);
                match = filter_year === "" || jyear.includes(filter_year);
                function matchByPositiveNumber(dateSubstring, filterString) {
                    if (match && filterString !== "") {
                        const filterNumber = filterString * 1;
                        if (filterNumber > 0) {
                            const dateNumber = dateSubstring * 1;
                            match = match && filterNumber === dateNumber;
                        }
                    }
                }
                matchByPositiveNumber(jmonth, filter_month);
                matchByPositiveNumber(jday, filter_day);
                if (match && filter_dayname !== "") {
                    const dayname_filter = "[[" + created + "]format:date[ddd]]";
                    const dayname = this.wiki.filterTiddlers(dayname_filter);
                    if (dayname.length === 1) {
                        match = match && dayname[0].toLowerCase().includes(filter_dayname.toLowerCase());
                    }
                }
                if (match && filter_title_content !== "") {
                    const title_content_filter = "[[" + journal_tiddlers[i] + "]search:title,caption,text[" + filter_title_content + "]]";
                    const title_content = this.wiki.filterTiddlers(title_content_filter);
                    match = title_content.length === 1;
                }
            }
            if (match) {
                titles += " [[" + journal_tiddlers[i] + "]]";
                titlesCount += 1;
            }
        }
    }
    return "<$transclude $variable='journalhelperFilterOutput' titles='" + titles + "' />";
};

})();
