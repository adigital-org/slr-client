SLR API Simple PHP Server Simulator
===================================

Just a simple API SLR simulator written in PHP to test some SLR-Client features.

***DISCLAIMER**: SimpleApiSimulator.php IS NOT INTENDED AS A FULL SLR API IMPLEMENTATION. ONLY FOR SLR-CLIENT TESTING PURPOSES.*

Usage
-----

### Apache

1. Serve the content of this folder. Manually redirect all petitions or allow .htaccess overrides in your apache config.

2. Update SLR Client config.js to point to the Simple API Simulator.

### Nginx

(*not tested*)

1. Add to your nginx config:

```
location / {
    rewrite ^/(.*) /SimpleApiSimulator.php?url=$1 break;
}
```

2. Update your API Client config.js.


Configuration
-------------

You can edit the first lines of SimpleApiSimulator.php to configure your simulation:
1. ***MAX_DELAY and MIN_DELAY***: simulate server response delay with min and max milliseconds.
2. ***ERROR_PROB***: simulate fake errors. In %.
3. ***FOUND_PROB***: determine the probability of an OK result (only 'user' endpoint). In %.
4. ***SECRET***: the salt used to sign responses (only 'user' endpoint).
5. ***SECTORS***: possible sectors found (only 'user' endpoint).
