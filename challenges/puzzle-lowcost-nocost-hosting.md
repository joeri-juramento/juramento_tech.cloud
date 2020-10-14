# Puzzle - Finding ideal free ish hosting 

*With some bells and whistles, but primarly for static sites.*

**Explored options:**

1. Azure Frontdoor et al.
2. Azure WebApp
3. Keybase Sites / Pages et al.
4. Fast.io & Repo

The order is based on chronicle experimentation, not priority or anything else.



**Requirements to validate:**

- A. SSL certificate so site is served via https. (Bonus if via TLS1.2, TLS1.3)
- B. Custom domain
- C. Privacy (about accessibility all website files, so no directory listing/browsing or public source files).
- D.+ Redundancy:  This requirement is about durability (by redundancy) of the chosen solution. 

> ! Extra note on use case: Files linked in PDFs or Mail footer or wherever are not frequently visited, but if they are, visitors should not be confronted with downtime. They should see the latest information that could not be provided in the original not-retrospectively-updatable information-carrier.



**Scenarios to contemplate**

- I. Add Time: What happens if you add time to the solution? One day? Four months? Six months? One year? What will happen? 
- II. Add a Reboot/Reset: Does your solution reboot or reset as normal deploy behaviour? If it does? How will this impact the solution?
- III. Add Trouble: it is hard to predict what we do not know, but try to think of some worse-case scenario and how it will affect the solution; any storm clouds visible?

<center>•••</center>

## Azure Frontdoor, Azure WebApp, Keybase Files

*Achievement: 0,61 euro per day*

**Chosen components**:

1. Cloudflare [SSL termination custom domain, cert automation, firewall, rules: http to https; providing (redundancy through) caching]
2. Azure Frontdoor [subdomain of Custom domain routing to non-customdomain-BackendPool; providing additional caching] (!LIMITATION: cannot link apex/root domain with cert automation.)
3. Keybase public folder, RAW path. [Serving static files]
4. Azure web app [Serving static files; providing redundancy.] !Sidenote: cannot link custom domain for free tier which is fine because of frontdoor.

   

**Requirements check:**
- A. SSL: yes, full route and automatic cert renewal
- B. Custom domain: yes, but redirect from apex to www.~ is mandatory.
- C. Privacy: at front end: yes, no browsing through all files. At backend pool: no privacy at keybase dir.
Bonus:
- D.+ Rudendancy: yes, I can work on one 'backend-location', even take it down, everything will sitll be up at the front.

Cloudflare delivers a lot of bonusses, but it cannot link a domain to a another domainsite like a (reverse) proxy, application gateway or azure frontdoor can.
Costs: Azure Frontdoor requires 1 routing rule costing 0,61 euro per day.



**Scenario check**
Add Time, Reset or Trouble and what happenst then?
- I. Continuity check: Softfail: Azure frontdoor cert-renewal might be broken when Cloudflare's proxy in DNS is enabled on the CNAME record of www.domain.tld. However, Cloudflare is terminating SSL for visitors, not Azure Frontdoor and afdverify.www.domain.tld is active without proxy; so maybe that is enough to proof ownership for automatic certificate renewal.
- II. Reboot check: no issues predicted
- III. Trouble check: Cloudflare's Always-On and other options deliver a lot of resilience; in combination with frontdoor's backendpool with two serving entities there is even redundancy.

**Monthly total: +-19 euro based on 0,61 euro per day**
Can you do better for the A,B,C,(D) requirements?

<center>•••</center>

## Azure WebApp

*Hypothesis: 0,264 euro per day (awaiting measurement) - (Measured!)*

**Chosen components**

1. Azure webapp, tier-shared [Servering static files, custom domain, SSL, cert-renewal (letsencrypt-alike-renewal-by-azure/digicert-combo.]

**Components:**
- A. SSL: yes and automatic cert renewal (new preview with digicert)
- B. Custom domain: yes, but redirect from apex to www.~ is mandatory because no cert-automation for root.
- C. Privacy: yes, no browsing through all files. 
Bonus:
- D.+ Rudendancy: none, only soft via caching in DNS via Always-On in Cloudflare.



**Scenario check**
Add Time, Reset or Trouble and what happenst then?
- I. Continiuity check: Softfail: Azure web app service certificate renewal might be broken when Cloudflare's proxy in DNS is enabled on the CNAME record of www.domain.tld. Unsure if web app will keep serving site with expired cert. Cloudflare is able to accept 'self-signed' certs at the backend, but unclear how it will react to expired certs.
- II. Reboot check: temporary offline or using cache, no further issues predicted
- III. Trouble check: Cloudflare's Always-On delivers the first go-to fix; however: not much redundancy options.

Last measurement: <0,01 euro per day. unclear why. > shared (free-percieved) tier is not actually free:
**Measurement: Monthly total: 10-11 euro per month for the Azure Shared Web-App**

<center>•••</center>

## Github & Fast.io - [Deprecating]
### Fast.io's free offering ends at 31st of December 2020 (announced October 14th).

**Chosen components**

1. Fast.io [providing hosting, deployment, cert renewal, caching, ssl termination]
2. Github [providing files in repo storage; non-public.]


**Requirements check:**
- A. SSL: yes, by fast.io's cloudflare account; automatic cert renewal.
- B. Custom domain: yes (Fyi: on moment of writing I forgot how i set up apex and www.)
- C. Privacy: yes after disabling browsing in fast.io's settings. Github repo is private.
- D.+ Redundancy: Cloudflare Always-on and cacheing. Fast.io seems reliable.



**Scenario check**
Add Time, Reset and Trouble and what happens then?

- I. Continuity check: works really well, automatic renewal and publishing after pushing to github, no additional action required at fast.io's site. Maybe that fast.io wants to charge after a while?! Unclear.
- II. Reboot check: Fast.io has end-points and cloudflare is entangled so their caching provides cover between publish pushes, no downtime expected.
- III. Trouble check: Because Fast.io is on cloudflare, your special dns settings are ignored but we do benefit from caching. However, the firewall keeping bots and weird visitors away from your sites were not blocked anymore until you put ns1 in between; so now the chain is: cloudflare DNS (you) --> ns1 DNS with alias record (you) --> Cloudflare (fast.io). The firewall is working again. - I expect fast.io's infra to be strong in uptime and cannot identify additional doom scenario's at this time.



~**Daily total: 0,00 euro a day**~

<center>•••</center>



## Keybase Sites (git variant)

**Chosen components**:

1. Keybase Pages [Providing hosting and deployment method and ssl termination and cert renewal]
2. Keybase Git Repo [Holding files, non-public]
3. Keybase (sub)Team. [Provides controlled access to deployment-bot while keeping source files private]

   

**Requirements check:**
- A. SSL: yes and automatic cert renewal with letsencrypt by kbpbot 
- B. Custom domain: yes, including root domain is possible with ALIAS record (NS1).
- C. Privacy: yes, no browsing through files by choosing private repo's and site does not allow directory listing by default.
- D.+ Redundancy: none, also Always-On on cloudflare would break cert renewal. Though Cloudflare might ignore lets encrypt expired cert via Flexible SSL.



**Scenario check**:
Add Time, Reset or Trouble and what happens then?

- I. Continuity check: if no cloudflare proxy: automatic cert renewal, only zoom-doom as factor.
- II. Reboot Check: no reset switch. unclear if the bot will take the site offline after a push. no caching.
- III. Trouble check: completely dependent on Keybase, at least uncertainty is on the horizon. 
  No cloudflare firewall protection if cloudflare proxy is off to keep kbpbot's cert renewal going. (Better topology available; see cloudflare worker.)



**Daily total: 0,00 euro a day**

<center>•••</center>



## Keybase Sites (team files variant)

**Chosen components**:

1. Keybase Pages [Providing hosting and deployment method and ssl termination and cert renewal]
2. Keybase Team files [Holding files, non-public]
3. Keybase (sub)Team. [Provides controlled access to deployment-bot while keeping source files private]

   

**Requirements check:**
- A. SSL: yes and automatic cert renewal with letsencrypt by kbpbot 
- B. Custom domain: yes, including root domain is possible with ALIAS record (NS1).
- C. Privacy: yes, no browsing through files by choosing keybase team files which are private and the site does not allow directory listing by default.
- D.+ Redundancy: none, also Always-On on cloudflare would break cert renewal. Though cloudflare might ignore lets encrypt expired cert via Flexible SSL, kbpbot will complain about renewal issues. (Better topology available; see cloudflare worker.)



**Scenario check**:
Add Time, Reset or Trouble and what happens then?

- I. Continuity check: if no cloudflare proxy: automatic cert renewal, uncertain what Zoom is going to do with Keybase.
- II. Reboot Check: no reset switch. unclear if the bot will take the site offline after a push. no caching.
- III. Trouble check: completely dependent on Keybase, at least uncertainty exist on the horizon due to Zoom take-over.
  No cloudflare firewall protection if cloudflare proxy is off to keep kbpbot's cert renewal going.
  (Better topology available; see cloudflare worker.)



**Daily total: 0,00 euro a day**

<center>•••</center>



## Keybase Sites & Cloudflare Worker & Gitlab Pages

**Chosen components**:

1. [Providing hosting and deployment method and *backend* ssl termination and cert renewal]

   1. Keybase Pages 
   2. ~~Github Pages~~ 
   3. Gitlab Pages 

2. [Holding files, non-public]

   1. Keybase git repo
   2. ~~Github git repo~~ (@TJN Github pages does not work for free for *private* repo's, a requirement.)
   3. Gitlab git repo

3. [Provides controlled access to deployment(-bot) while keeping source files private]

   1. Keybase (sub)Team + kbpot
   2. Gitlab + yml

4. [Load-balancing, firewall, cache: always-on, url-rewriting, frontend ssl-termination]

   1. Cloudflare Worker [Load-balancing, url-rewriting]
   2. Cloudflare DNS Proxy on [cache: always-on, SSL, firewall]

5. [Subdomains]

   1. Main domain (for visitors) blog.example.com or www.example.com
   2. Backend domain with Cloudflare DNS proxy off: sitekeybase.example.com
   3. Backend domain with Cloudflare DNS proxy off: sitegitlab.example.com
   4. (Optional extension point: media.example.com for images you would like to save outside git repo.)

   

**Requirements check:**

- A. SSL: yes and automatic cert renewal with letsencrypt by kbpbot and cloudflare cert flexible ssl & co.
- B. Custom domain: yes, including root domain is possible with ALIAS record (NS1).
- C. Privacy: yes, no browsing through files by choosing Keybase-team-files or Gitlab-private-repo which are private and the site does not allow directory listing by default. 
- D.+ Redundancy: yes, Always-On on cloudflare. Backend cert-renewal will work.



**Scenario check**:
Add Time, Reset or Trouble and what happens then?

- I. Continuity check: Future of Keybase backend uncertain due to zoom-takeover, but due to redundancy this is not a direct problem. Also, new backend options might be added later to the Cloudflare worker.
- II. Reboot Check: Uncertain if Cloudflare Always-On caches material if the Worker rewrites URLs to a target without DNS Proxy; if not, the media.~ subdomain can help here. That being said, having two backend is better than one. User can push to two different git remotes. No expected downtime window detected when updating static site.
- III. Trouble check: Cloudflare worker script it self is not version controlled, humans make mistakes. A limit on number of queries per day exist for a Worker (100 000 at moment of writing), but that should be more than enough for mortals.



**Daily total: 0,00 euro a day**

<center>•••</center>

----







