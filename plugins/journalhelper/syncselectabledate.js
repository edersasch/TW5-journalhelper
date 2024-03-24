/*\
title: $:/plugins/edersasch/journalhelper/syncselectabledate.js
type: application/javascript
module-type: macro

Synchronizes the date content of a field with standard tiddler date content and
a date for an `edit-text type="date"` format YYYY-MM-DD

This macro does not return any text, but modifies tiddler fields, which means
you must
[[take care where to call it|https://tiddlywiki.com/dev/#JavaScript%20Macros]].
There should be little danger of an infinite update cycle, because the fields are
not blindly updated every time, but only on change.
The examples below don't cause problems.

* parameter tiddler: use the fields from the tiddler with the given title, default is currentTiddler
* parameter datefield: a field with a format like a [[tiddlywiki date field|https://tiddlywiki.com/#Date%20Fields]], default is created
* parameter selectabledatefield: a field with a format for an `edit-text type="date"` format YYYY-MM-DD, default is journaldate

If the tiddler does not exist or both date fields are missing, the macro does
nothing. On existing datefield but missing selectabledatefield the latter is
created with the content from the former. If the selectabledatefield is
present and it differs from the date part of the content of datefield, this
part is updated.

Example to create a date edit in the edit view for the default field
`journaldate` in a tiddler tagged with "Journal":

```
list-after: $:/plugins/edersasch/journalhelper/ui/EditTemplate/journalcaption
tags: $:/tags/EditTemplate
title: $:/plugins/edersasch/journalhelper/ui/EditTemplate/journaldate

<$list filter="[<currentTiddler>tag[Journal]]">
<<syncselectabledate>>
<div class="tc-edit-tags">
<$edit-text field="journaldate" type="date" />
</div>
</$list>
```

If `journaldate` has its own editor it does not need a default field editor.
Note that no end-of-line must be present after `hide`.

```
title: $:/config/EditTemplateFields/Visibility/journaldate

hide
```

Example for viewing the selected date in human readable form in tiddlers tagged
with "Journal":

```
list-before: $:/core/ui/ViewTemplate/title
tags: $:/tags/ViewTemplate
title: $:/plugins/edersasch/journalhelper/ui/ViewTemplate/journalcreated

<$list filter="[<currentTiddler>tag[Journal]]">
<<syncselectabledate>>
<$view field="created" format="date" template="DDD, DDth MMM YYYY" />
</$list>
```

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
