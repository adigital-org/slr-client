<?php
  //READ SimpleApiSimulator_README.md!!

  //TESTED ONLY UNDER PHP 7.0.3 + APACHE
  //Config
  $GLOBALS['MIN_DELAY'] = 40; //milliseconds
  $GLOBALS['MAX_DELAY'] = 120; //milliseconds
  $GLOBALS['ERROR_PROB'] = 0; //0 to 100 (%). Default 0.
  $GLOBALS['FOUND_PROB'] = 50; //0 to 100 (%). Default 50.

  $GLOBALS["SECRET"] = '85e6959915cc2d88b23b9f13c03f3b2b7d498db444a06d8a94a695c4e01e3228';
  $GLOBALS["SECTORS"] = ['1','2','3','4','5','6','7','8','9'];

  //Set CORS headers allowing all origins
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: OPTIONS, GET');
  header('Access-Control-Allow-Headers: Authorization, X-Amz-Date');

	//Handle OPTIONS request
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		exit;
	}

	//Simulate SLR API url pattern
	$expected_base_path = '/v1/api/';
	if (substr($_SERVER['REQUEST_URI'], 0, strlen($expected_base_path)) !== $expected_base_path) exit;

	//Generic functions
  function out($response, $httpStatus) {
    //Simulate latency
    usleep(random_int($GLOBALS['MIN_DELAY'] * 1000, $GLOBALS['MAX_DELAY'] * 1000));
    http_response_code($httpStatus);
    print(json_encode($response));
    exit; //Only allow 1 print
  }
  function reportError() {
    http_response_code(502);
    return array('message' => 'Internal server error');
  }
  function getTime() {
    return round(microtime(true) * 1000);
  }

  //DAO
  function searchSectors() {
    $numberOfSectors = random_int(0, count($GLOBALS['SECTORS']));
    if ($numberOfSectors === 0) {
      return null;
    } else {
      $foundSectors = array_rand($GLOBALS['SECTORS'], $numberOfSectors);
      if (!is_array($foundSectors)) $foundSectors = array($foundSectors);
      $sectors = [];
      foreach ($foundSectors as $sector) {
        $sectors[] = $GLOBALS['SECTORS'][$sector];
      }
      return $sectors;
    }
  }
  function searchRecord() {
    return (random_int(1, 100) <= $GLOBALS['FOUND_PROB'] ? 1 : 0);
  }

  //Signature
  function sign($queryTime, $request, $result, $sectors) {
    if ($sectors === null) {
      $sectors = '';
    } else if (is_array($sectors)) {
      $sectors = implode(',', $sectors);
    }

    $proofOfQuery =  hash('sha256',
      $request .
      $result .
      $queryTime .
      $GLOBALS['SECRET'] .
      $sectors);

    $signature = base64_encode(join(':', array(
      $queryTime,
      $request,
      $sectors,
      $proofOfQuery
    )));

    return $signature;
  }

  //Should fail?
  function shouldFail() {
    return random_int(1, 100) <= $GLOBALS['ERROR_PROB'] ? true : false;
  }

  //Endpoint 'requests'
  function handleRequestsQuery() {
      out(array('requests' => random_int(0, 99999999) . '', 'timestamp' => getTime()), 200);
  }

  //Endpoint 'user'
  function handleUserQuery($request) {
    $queryTime = getTime();
    $result = (random_int(1, 100) <= $GLOBALS['FOUND_PROB'] ? 1 : 0);
    if ($result === 1) {
      $sectors = searchSectors();
      $signature = sign($queryTime, $request, $result, $sectors);
      out(array('signature' => $signature, 'sectors' => $sectors), 200);
    } else {
      $signature = sign($queryTime, $request, $result, null);
      out(array('signature' => $signature), 404);
    }
  }


  //Detect and redirect to the right endpoint. Also calculate if should force fail.
  function endpointDetector() {
    $url = explode('/', $_SERVER['REQUEST_URI']);
    if ($url[3] === 'user') {
      if (shouldFail()) out(reportError(), 502);
      else handleUserQuery(explode("?", $url[4])[0]);
    }
    else if (substr($url[3], 0, 8) === 'requests') {
      if (shouldFail()) out(reportError(), 502);
      else handleRequestsQuery();
    }
    else out(reportError(), 502);
  }

  endpointDetector();
  exit;