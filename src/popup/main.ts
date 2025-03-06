document.addEventListener("click", e => {
    browser.tabs
    .query({ active: true, currentWindow: true })
    .then(scrapeSite)
    .catch(reportError);
});

function scrapeSite(tabs: Array<browser.tabs.Tab>) {
    browser.tabs.sendMessage(tabs[0].id!, {
        command: "scrapeSite"
    });
}

function reportError(error: string) {
    document.getElementById("error")!.innerHTML = error;
}
