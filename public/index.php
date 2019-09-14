<?php
  //Search for credentials in POST body and if found add it to document
  if (isset($_POST['key']) && isset($_POST['secret'])) {
    //POST credentials found, inject in HTML file
    $givenCredentials = json_encode(array(
      'key' => $_POST['key'],
      'secret' => $_POST['secret']
    ));
    $placeholder = "<script name=\"givenCredentails\">const givenCredentials = null;</script>";

    //Get HTML content
    $html = file_get_contents('index.html');
    if ($html) {
      //Replace credentials script and send to user
      $credentialsScript = "<script>const givenCredentials = $givenCredentials;</script>";
      echo str_replace($placeholder, $credentialsScript, $html);
    }
  } else {
    //No POST credentials, just include the HTML file.
    include('index.html');
  }