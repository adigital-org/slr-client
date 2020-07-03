const remoteRequire = window.require('electron').remote.require;
window.electronFs = remoteRequire('fs');
window.tmpdir = remoteRequire('os').tmpdir();
window.electronFolderDialog = remoteRequire('electron').dialog.showOpenDialogSync;
window.basename = remoteRequire('path').basename;

window.toggleDevTools = window.require("electron").remote.getCurrentWebContents().toggleDevTools;
document.addEventListener("keydown", (e) => {
  if (e.type === "keydown" && e.code === "F12") window.toggleDevTools();
});
