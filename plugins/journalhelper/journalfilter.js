/*\
title: $:/plugins/edersasch/journalhelper/journalfilter.js
type: application/javascript
module-type: macro

special tiddler filtering

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
    {name: "filter_title_content_field",    default: "Filter Title Content"}
];

/*
Run the macro
*/
exports.run = function(tmp, filter_year_field, filter_month_field, filter_day_field, filter_title_content_field) {
    let filter_year = "";
    let filter_month = "";
    let filter_day = "";
    const tmptid = this.wiki.getTiddler(tmp);
    if (tmptid) {
        filter_year = tmptid.getFieldString(filter_year_field);
        filter_month = tmptid.getFieldString(filter_month_field);
        filter_day = tmptid.getFieldString(filter_day_field);
    }
    const matching_list_filter = "[tag[Journal]!has[draft.of]]";
    const journal_tiddlers = this.wiki.filterTiddlers(matching_list_filter);
    let titles = "";
    for (let i in journal_tiddlers) {
        const journalentry = this.wiki.getTiddler(journal_tiddlers[i]);
        if (journalentry) {
            const journaldate = journalentry.getFieldString("journaldate");
            let match = journaldate === "";
            if (match === false) {
                const jyear = journaldate.substring(0, 4);
                const jmonth = journaldate.substring(5, 7);
                const jday = journaldate.substring(8, 10);
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
            }
            if (match) {
                titles += " [[" + journal_tiddlers[i] + "]]";
            }
        }
    }
    titles += " +[!sort[created]]";
    let ret = '<$list filter="""' + titles + '""">';
    ret += '<div>';
    ret += '<$let yearstr={{{ [<currentTiddler>get[journaldate]split[-]nth[1]] }}} monthstr={{{ [<currentTiddler>get[journaldate]split[-]nth[2]] }}} daystr={{{ [<currentTiddler>get[journaldate]split[-]nth[3]] }}}>';
    ret += '<$edit-text field="doesnotexist" placeholder=<<yearstr>> disabled="yes" class="inputyear" /> / ';
    ret += '<$edit-text field="doesnotexist" placeholder=<<monthstr>> disabled="yes" class="inputmonthday" /> / ';
    ret += '<$edit-text field="doesnotexist" placeholder=<<daystr>> disabled="yes" class="inputmonthday" /> ';
    ret += '<code><$view field="created" format="date" template="ddd" /></code> ';
    ret += '<$link to=<<currentTiddler>>>';
    ret += '<$reveal state="!!caption" type="match" text=""><$view field="title"/></$reveal>';
    ret += '<$reveal state="!!caption" type="nomatch" text=""><$view field="caption"/></$reveal>';
    ret += '</$link>';
    ret += '</$let>';
    ret += '</div>';
    ret += '</$list>';
    return ret;
};

})();
