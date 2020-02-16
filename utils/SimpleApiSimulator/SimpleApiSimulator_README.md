SLR API Simple PHP Server Simulator
===================================

Just a simple API SLR simulator written in PHP to test some SLR-Client features.

***DISCLAIMER**: SimpleApiSimulator.php DOES NOT SIMULATE ALL SLR API RESPONSES. THE ACCURACY OF THE SIMULATOR RESPONSES IS NOT GUARANTEED.*

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
2. ***FOUND_PROB***: determine the probability of an OK result (only 'user' endpoint). In %.
3. ***ERROR_PROB***: simulate fake errors. In %.
4. ***ERROR_PROB_429***: determine what proportion of errors should be API overload error (429 Too Many Requests).
5. ***MAX_HASHES_PER_REQUEST***: max hashes allowed per request, see SLR API documentation.
6. ***SECRET***: the salt used to sign responses (only 'user' endpoint).
7. ***SECTORS***: possible sectors found (only 'user' endpoint).
