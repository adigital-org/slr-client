<?php
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //!! READ SimpleApiSimulator_README.md !!
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //TESTED ONLY UNDER PHP 7.0.3 + APACHE
  //Config
  $GLOBALS['MIN_DELAY'] = 60; //milliseconds
  $GLOBALS['MAX_DELAY'] = 200; //milliseconds
  $GLOBALS['FOUND_PROB'] = 50; //0 to 100 (%). Default 50.
  $GLOBALS['ERROR_PROB'] = 10; //0 to 100 (%). Default 10.
  $GLOBALS['ERROR_PROB_429'] = 25; //0 to 100 (%). Default 25.

  $GLOBALS['MAX_HASHES_PER_REQUEST'] = 20;
  $GLOBALS["SECRET"] = '85e6959915cc2d88b23b9f13c03f3b2b7d498db444a06d8a94a695c4e01e3228';
  $GLOBALS["SECTORS"] = ['1','2','3','4','5','6','7','8','9'];

	//Simulate SLR API url pattern
	$expected_base_path = '/v1/api/';
	if (substr($_SERVER['REQUEST_URI'], 0, strlen($expected_base_path)) !== $expected_base_path) exit;

	//Generic functions
  function out($response, $httpStatus, $cors) {
    header("content-type: application/json");
    //Simulate latency
    usleep(random_int($GLOBALS['MIN_DELAY'] * 1000, $GLOBALS['MAX_DELAY'] * 1000));
    //Set CORS headers allowing all origins
    if ($cors) {
      header('Access-Control-Allow-Origin: *');
      header('Access-Control-Allow-Credentials: true');
    }
    //Set response code and body
    http_response_code($httpStatus);
    print(json_encode($response));
    exit; //Only allow 1 print
  }

  function noMethodError($endpoint, $method) {
    out(
      array('message' => 'No method found matching route api/'.$endpoint.' for http method '.$method),
      404,
      false
    );
  }
  function genericApiError() {
    out(
      array('message' => 'Internal server error'),
      502,
      false
    );
  }
  function apiOverloadError() {
    out(
      array('message' => 'Too Many Requests'),
      429,
      true
    );
  }
  function tooManyTooFewRecordsError() {
    out(
      array('message' => 'The number of requested hashes must be greater than 0 and equal or less than '.$GLOBALS['MAX_HASHES_PER_REQUEST']),
      400,
      true
    );
  }
  function duplicatesError() {
    out(
      array('message' => 'Provided list of hashes contains duplicates.'),
      400,
      true
    );
  }
  function getTime() {
    return round(microtime(true) * 1000);
  }

  //fake DAO
  function searchSectors($nullSectors) {
    $numberOfSectors = random_int(0, count($GLOBALS['SECTORS']));
    if ($numberOfSectors === 0) {
      return ($nullSectors ? null : []);
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
  function fail() {
    if (random_int(1, 100) <= $GLOBALS['ERROR_PROB_429']) apiOverloadError();
    else genericApiError();
  }

  //Endpoint 'requests'
  function handleRequestsQuery() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET')
      noMethodError('requests', $_SERVER['REQUEST_METHOD']);
    out(array('requests' => random_int(0, 99999999) . '', 'timestamp' => getTime()), 200, true);
  }

  //Endpoint 'user' for POST and GET HTTP methods
  function handleUserQuery($request) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
      $record = explode("?", $request)[0];
      if (strlen($record) === 0) noMethodError('user/' . $request, $_SERVER['REQUEST_METHOD']);
      handleUserQueryGet($record);
    }
    else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $request === "")
      handleUserQueryPost();
    else noMethodError('user/' . $request, $_SERVER['REQUEST_METHOD']);
  }
  function handleUserQueryGet($request) {
    $queryTime = getTime();
    $result = searchRecord();
    if ($result === 1) {
      $sectors = searchSectors(true);
      $signature = sign($queryTime, $request, $result, $sectors);
      out(array('signature' => $signature, 'sectors' => $sectors), 200, true);
    } else {
      $signature = sign($queryTime, $request, $result, null);
      out(array('signature' => $signature), 404, true);
    }
  }
  function handleUserQueryPost() {
    $queryTime = getTime();

    $reqBody = file_get_contents('php://input');
    if (strlen($reqBody) === 0) tooManyTooFewRecordsError();
    $records = explode(",", $reqBody);
    if (count($records) > $GLOBALS['MAX_HASHES_PER_REQUEST']) tooManyTooFewRecordsError();
    if(count(array_unique($records)) < count($records)) duplicatesError();

    $resBody =  new stdClass();
    foreach ($records as $record) {
      $recResult = new stdClass();
      $recResult->found = true;
      $sectors = searchSectors(false);
      $recResult->signature = sign($queryTime, $record, $recResult->found, $sectors);
      $recResult->sectors = $sectors;

      $resBody->$record = $recResult;
    }

    out($resBody, 200, true);
  }


  //Detect and redirect to the right endpoint. Also calculate if should force fail.
  function endpointDetector() {
    if (shouldFail()) fail();

    $url = explode('/', $_SERVER['REQUEST_URI']);
    if (substr($url[3], 0, 4) === 'user') {
      if (count($url) === 5) handleUserQuery($url[4]);
      else handleUserQuery("");
    }
    else if (substr($url[3], 0, 8) === 'requests') {
      handleRequestsQuery();
    }
    else genericApiError();
  }

  endpointDetector();
  exit;
