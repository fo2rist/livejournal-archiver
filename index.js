// dumps LiveJournal for a user as a series of .md files one per post
// user library: https://github.com/agentcooper/node-livejournal
// API documentation https://www.livejournal.com/doc/server/ljp.csp.xml-rpc.getevents.html

const { xmlrpc } = require("livejournal")
const fs = require("fs")


function getEventsPrior(date=null, doOnNext, doOnError) { 
    xmlrpc.getevents({
        usejournal: 'tema',
        auth_method: 'noauth', // use auth method 'clear' to enable user/pass login
        //username: 'put_name_here',
        //password: 'put_pass_here',
        selecttype: 'lastn',
        beforedate: date,
        howmany: 20
    }, function (err, res) {
            if (res) doOnNext(res.events)
            if (err) doOnError(err)
    })
}


function printError(err) {
    console.log("Houston, we got a problem", err)
}

function storeAndProceed(events) {
    console.log(`Got ${events.length} events. Dumping...`)
    
    if (events.length > 0) {
        events.forEach(event => {
            dumpEvent(event)
        });

        let lastDate = events[events.length - 1].eventtime
        console.log("Getting next events prior ", lastDate)
        getEventsPrior(lastDate, storeAndProceed, printError) 
    }
}

function dumpEvent(event) { 
    const filename = `${event.eventtime}.md`.replaceAll(':', '_')
    const data = `\
---
title: ${event.subject}
date: ${event.eventtime}
url: ${event.url}
---

${event.event}`
    
    fs.writeFile(filename, data, (err) => {
        if (err) console.log(`Error writing: ${filename}`, err);
    })
}

// main
getEventsPrior(null,
    doOnNext = storeAndProceed,
    doOnError = printError)