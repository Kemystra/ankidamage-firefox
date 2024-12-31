(() => { 
    // Each time the user opens a popup, this script will be injected into the page
    // If it's opened multiple times, then there will be multiple instances of this script
    // The rest of them will be stopped since window.hasRun has been set to true by the first instance
    if (window.hasRun) {
        return;
    }

    import { sendKanjiInfo } from './scraper.js';

    window.hasRun = true;
    browser.runtime.onMessage.addListener(message => {
        if (message.command === "scrapeSite") {
            sendKanjiInfo();
        }
    })
})();


