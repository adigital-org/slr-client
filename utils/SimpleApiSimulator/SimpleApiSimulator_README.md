SLR API Simple PHP Server Simulator
===================================

Just a simple API SLR simulator written in PHP to test some SLR-Client features.

***DISCLAIMER**: SimpleApiSimulator.php DOES NOT SIMULATE ALL SLR API RESPONSES. THE ACCURACY OF THE SIMULATOR RESPONSES IS NOT GUARANTEED.*

Usage
-----

### Docker

As root:
1. Build: `docker build --tag slr-client-sas .`
2. Run: `docker run --name slr-client-sas -d -p 80:80 slr-client-sas`
3. Show logs: `docker logs slr-client-sas`
3. Show only simulator logs: `docker logs slr-client-sas 2>&1 | grep "SimpleApiSimulator-Log"`
3. Show only apache logs: `docker logs slr-client-sas 2>&1 | grep -v "SimpleApiSimulator-Log"`
4. Stop: `docker stop slr-client-sas`
5. Start again: `docker start slr-client-sas` 
5. Clean: `docker container rm slr-client-sas && docker image rm slr-client-sas`

With the container running, point SLR Client to the container by editing config.js or using customApi option. 

### Apache

1. Serve the content of this folder. Manually redirect all petitions or allow .htaccess overrides in your apache config.

2. Update SLR Client config.js to point to the Simple API Simulator or use customApi option.

### Nginx

(*not tested*)

1. Add to your nginx config:

```
location / {
    rewrite ^/(.*) /SimpleApiSimulator.php?url=$1 break;
}
```

2. Update your API Client config.js or use customApi option.

Audit
-----

To audit performance and responses on Apache or Nginx, check web server logs (_access.log_). Errors due to malformed requests are logged to default PHP error log (_with error_log(...)_).

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
