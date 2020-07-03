/*
  Defaults for SLR-Client
 */

const hashesPerRequest = 60 // As SLR API documentation indicates
const maxRps = window.electronFs ? 2000 : 1000
const autoParallel = Math.ceil(maxRps/hashesPerRequest) // Math.ceil prevents autoParallel === 0
const maxParallel = autoParallel < 50 ? autoParallel : 50 // Prevent too many threads

const distUrl = 'https://cliente.api.listarobinson.es'

// Use complete URL for downloads or links will be broken in Electron/CLI env.
const config = {
  messages: {
    "appSlrHomeUrl": "https://www.listarobinson.es",
    "appSlrGetKeysUrl": "/enterprise/subscription-method",
    "appEnterpriseContactEmail": "empresas@listarobinson.es",
    "appVersion": process.env.REACT_APP_VERSION,
    "githubRepoUrl": "https://github.com/adigital-org/slr-client",
    "binChecksum": distUrl + "/dist/checksum.txt",
    "winCliDownloadUrl": distUrl + "/dist/slr-client-cli-win.exe",
    "linuxCliDownloadUrl": distUrl + "/dist/slr-client-cli-linux",
    "winInstallerDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Bwin-installer%5D.exe",
    "winPortableDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Bwin-portable%5D.exe",
    "linux32AppImageDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Blinux_i386%5D.AppImage",
    "linux64AppImageDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Blinux_x86_64%5D.AppImage",
    "linux32GzDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Blinux_ia32%5D.tar.gz",
    "linux64GzDownloadUrl":
      distUrl + "/dist/Cliente%20API%20-%20Servicio%20de%20Lista%20Robinson%5Blinux_x64%5D.tar.gz"
  },

  slrClientDistUrl: distUrl,

  apiProtocol: "https", //'https' or 'http'
  apiDomain: "api.listarobinson.es",
  apiBaseUrl: "/v1/api/",

  apiRegion: "eu-west-1",
  apiService: "execute-api",
  //'true' to send AWS signature in headers, 'false' to send it in query string
  //AWS signature in headers may require CORS preflight
  apiAuthHeaders: false,

  latestVersionCheckUrl: distUrl + "/index.html",

  hashesPerRequest,
  maxRps,
  maxParallel,
  threadStartDelay: 50, // ms
  maxAttempts: 3,
  retryWait: 15000, // ms
  workingUiUpdateInterval: 500, // ms

  supportedExtensions: ['txt','csv'],
  fileRecordsAlert: 1000000,
  signatureSize: 200, // bytes
  maxEstimatedSize: 1024*1024*1024, // bytes

  downloadingTimeout: 5000 // ms
}

window.customApi = (newUrl) => config.apiDomain = newUrl

export default config