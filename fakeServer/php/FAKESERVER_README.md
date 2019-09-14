SLR fake PHP server
===================

Just a simple API SLR emulator in PHP to test some SLR-client features.

***DISCLAIMER**: FAKESERVER.PHP IS NOT INTENDED AS A FULL SLR API IMPLEMENTATION. ONLY FOR SLR-CLIENT TESTING PURPOSES.*

Usage
-----

### Apache

1. Serve the content of this folder. Manually redirect all petitions or allow .htaccess overrides in your apache config.

2. Update your API Client config.js.

### Nginx

(*not tested*)

1. Add to your nginx config:

```
location / {
    rewrite ^/(.*) /fakeServer.php?url=$1 break;
}
```

2. Update your API Client config.js.


Configuration
-------------

You can edit the first lines of fakeServer.php to configure your simulation:
1. ***MAX_DELAY and MIN_DELAY***: simulate server response delay with min and max milliseconds.
2. ***ERROR_PROB***: simulate fake errors. In %.
3. ***FOUND_PROB***: determine the probability of a OK result (only 'user' endpoint). In %.
4. ***SECRET***: the salt used to sign responses (only 'user' endpoint).
5. ***SECTORS***: possible sectors found (only 'user' endpoint).
