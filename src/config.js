/*
  Defaults for SLR-Client
 */

export default {
  messages: {
    "appSlrHomeUrl": "https://www.listarobinson.es",
    "appSlrGetKeysUrl": "/enterprise/subscription-method",
    "appEnterpriseContactEmail": "info@listarobinson.es",
    "appVersion": process.env.REACT_APP_VERSION
  },

  apiBaseUrl: "https://api.listarobinson.es/v1/api/",
  //apiBaseUrl: "http://localhost/v1/api/",
  apiRegion: "eu-west-1",
  apiService: "execute-api",
  //'true' to send AWS signature in headers, 'false' to send it in query string
  //AWS signature in headers may require CORS preflight
  apiAuthHeaders: false,

  maxParallel: 50,
  maxAttempts: 3,
  retryWait: 15000,
  workingUiUpdateInterval: 500,

  supportedExtensions: ['txt','csv'],
  fileRecordsAlert: 1000000,
  signatureSize: 200,
  maxEstimatedSize: 1024*1024*1024,

  downloadingTimeout: 5000
}