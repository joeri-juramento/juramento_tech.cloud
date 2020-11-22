/* # DNS FAILOVER LOADBALANCE MULTIPLE BACKENDS * 
TKV - This script was created in a Cloudflare worker.

This script was inspired by: https://blog.cloudflare.com/update-response-headers-on-cloudflare-workers/
Though that 'Fallback' portion is not really working in 2020 today, I had a hard time getting it
to work, probably also because I am not a coder more of a tinkerer, so the whole async methodolgy took
some time. Anyway, I apologize if my code offends you, though I am glad I got it to work eventhough it
could use more work.

## The functionel desire is:
Hmz... I have this different (free) service to host my static website but nothing remains free forever
and overtime I want to switch to another service or I want my media-images to be hosted on a different
service which can be edited quicker without git, so how do I maintain one front-door with several back-
ends? (Besides buying Azure's frontdoor or Cloudflare's equivalent.)

That is where this scripts comes in. It will try to fetch the requested resource from source 1 and go
down the list of potential hostnames if it cannot find it. That way, I am not that depended on 1
specific service provider and have several backups in the air as well as dedicated special hosters
for media or files that need be served without going through the git process. The script will find 
where to find them.

Possible Extension:
If you are looking for an extension? Use KV namespace to maintain some intelligence on where to find
data so the script can fetch material from the correct resource at it's first try.

----------------------------------------------------------------------------------------------
Design of the spec can be found here:     n/a
Repo location of the script:              https://go.juramento.nl/source-dns-failover
This script is live at CloudFlare worker: n/a (not sharable worker; unique for owner.) 
FYI: Go-links can be kept up to date if their destionation changes, hence indirect links.

Regards, J•Juramento
*/

//Example: this Cloudflare worker gets all traffic routed to from https://www.example.tld/*
//Scripts fetches material from different sources having it's own SSL certificate and subdomain.

var mainhosts = [
  "skipping-index0",
  "sitegitlab.example.tld",    //Gitlab Pages (SSL on sitegitlab.~ , not www.~)
  "quick.example.tld",
  "media.example.tld",         //Keybase Team Files>Pages (SSL on media.~, not www.) [Future uncertain]
  "siteazure.example.tld",     //Azure Static Websites Free, Preview. (SSL on siteazure, not www.)
  "sitekb.example.tld"         //Keybase Team Files>Pages (SSL on sitekb.~, not www.) [Future uncertain]
];
// "juramento-site.imfast.io"   //Fast.io linked to Github private repo [Going out of business 2020-Dec]
var betahosts = [               //So you can test your script without messing with your real site.
  "skipping-index0",
  "beta1.example.tld",
  "beta2.example.tld",
  "beta3.example.tld"
];


var hostnames;

addEventListener('fetch', event => {
      event.respondWith(handleRequest(event.request)) 
    /*Avoid banging your head against the wall by starting with this respondWith
      and having your 'main' in an async function to avoid async/await/fetch problems.
      As a newbie, I ran into some async weirdness due 'fetch' being async by design even
      though it would have been easier for this script if it wasn't.
      The blog article did not really help me considering this particular point.
    */
});

    async function handleRequest(request) {

    // Choosing beta or main list.
    let requestURI = new URL(request.url);
    console.log('start: ' + requestURI.hostname);
    if (requestURI.hostname.startsWith("beta.")) {
        hostnames = betahosts;
        } else { hostnames = mainhosts;}
    console.log('hostnames: ' + hostnames);

    //Select primary host.
    var primary = 1;
    var primaryUrl = new URL(request.url);
    var finalUrl = new URL(request.url);
    console.log('primary0: ' + primaryUrl);
    

    function setPrimary (index,primaryUrl)
    {
        primaryUrl.hostname = hostnames[primary];
        console.log('primaryA: ' + primaryUrl);
    };

    setPrimary (primary, primaryUrl);
    console.log('primaryB: ' + primaryUrl + '  |  ' + primaryUrl.url + '  |  ' + primaryUrl.hostname);

    //Here we go; cross your fingers if you touch something.
    finalUrl = await setFinal(primary,primaryUrl);

    console.log('primaryD: ' + finalUrl);
    
    return fetch(finalUrl);

    };

    
async function setFinal(primary,primaryUrl)
    {
        //Feels link a function inside function; well I am not touching it again until I enjoyed it a bit! ;).
        finalUrl = await determineTarget(primaryUrl,primary);
        /* finalUrl.then(
            response => console.log('primaryCa: ' + finalUrl),
            err => console.log('ERROR--01')
        );*/
        console.log('primaryC: ' + finalUrl);
        return finalUrl;
    }


async function determineTarget(requested,usedIndex) {
  
    console.log('1: '+ requested);
    console.log('2: '+ requested.hostname);
    
    var targetIsLive = await checkTarget(requested)
    console.log('targetisLive: ' + targetIsLive);
    if (targetIsLive) 
    {
        console.log('What if target live: ');
        return requested;
    }
    else //If target is not live; go to then next one on the list:
    {
        usedIndex++;
        console.log('Target down...switching to ' + hostnames[usedIndex]);
        requested.hostname = hostnames[usedIndex];
        console.log('Switch: '+ requested);
        var target2IsLive = await checkTarget(requested)
        if (target2IsLive) 
        {
            return requested;
        }
        else //Self-critic: yes you can merge the else before, but now you can avoid loop complexity in testing.
        {
            // From here on, if not live, go to the next one on the list and end in 404 not 502 if no joy.
            do {
                usedIndex++;
                console.log('Target down (loop)...switching to ' + hostnames[usedIndex]);
                requested.hostname = hostnames[usedIndex];
                console.log('Switch: '+ requested); 
                var targetNextIsLive = await checkTarget(requested);
            }
            while (!targetNextIsLive && usedIndex < hostnames.length-1);
            
            return requested;
            
        };
    }
};


async function checkTarget(targetToCheck) {
    //var url;
    console.log('Target to be checked: '+ targetToCheck);
    const antwoord = await fetch(targetToCheck); //The nightmare maker.
    antwoord.ok;
    antwoord.status;

    console.log('returnA: ' + antwoord.status);
    console.log('returnB: ' + antwoord.ok);
    console.log('returnC:' + antwoord.statusText);
    
    return antwoord.ok;
};

/*
So painful, it deserves a haiku.

::fetch()::
The nightmare maker,
responding with promises;
instead of the stuff.

#tech
J•Juramento
*/




//EoF