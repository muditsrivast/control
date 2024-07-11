const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');  // Assumes index.html is in the same directory
});


let activeTabs = {
    chrome: null,
    firefox: null
};

app.get('/start', (req, res) => {
    const browserName = req.query.browser;
    const url = req.query.url;

    if (browserName) {
        let command;
        if (browserName === "chrome") {
            command = url ? `start chrome "${url}"` : `start chrome https://www.google.com`;
            activeTabs[browserName] = url
        } else if (browserName === "mozilla") {
            command = url ? `start firefox "${url}"` : `start firefox https://www.google.com`;
            activeTabs[browserName] = url
        } else {
            return res.send("This browser isn't available");
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening browser: ${error.message}`);
                return res.status(500).send(`Error opening browser: ${error.message}`);
            }
            console.log(`Browser ${browserName} opened with ${url || 'default URL'}`);
            res.send(`${browserName.charAt(0).toUpperCase() + browserName.slice(1)} fired up with ${url ? 'specified URL' : 'default URL'}`);
        });
    } else if (url) {
        return res.send("Error only URL provided");
    } else {
        return res.send("Browser name required");
    }
});


app.get('/stop', (req, res) => {
    const browserName = req.query.browser;

    if (browserName) {
        let browserExe;
        if (browserName === "chrome") {
            browserExe = "chrome";
            activeTabs[browserName] = null;
        } else if (browserName === "mozilla") {
            browserExe = "firefox";
            activeTabs[browserName] = null;
        } else {
            return res.send("This browser isn't available");
        }

        const command = `taskkill /IM ${browserExe}.exe /F`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error stopping browser: ${error.message}`);
                return res.status(500).send(`Error stopping browser: ${error.message}`);
            }
            console.log(`Browser ${browserName} closed`);
            res.send(`${browserName.charAt(0).toUpperCase() + browserName.slice(1)} CLOSED`);
        });
    } else {
        return res.send("Browser name required");
    }
});


app.get('/cleanup', (req, res) => {
    if (req.query.browser) {
        const browserName = req.query.browser;
        console.log(browserName);
        if (browserName === "chrome") {
            exec('rmdir /Q /S "%LocalAppData%\\Google\\Chrome\\User Data\\Profile 8"', (err, stdout, stderr) => {

                if (err) {
                    console.error(`Error executing command: ${err}`);
                    console.error(`stderr: ${stderr}`);
                    return res.status(500).send('Error clearing Chrome data');
                }
                console.error(`stdout: ${stdout}`);
                activeTabs[browserName] = null;
                res.send("Chrome Data IS CLEARED-------");
            });

        }


        else if (browserName === "mozilla") {
            // Successfully deletes Mozilla content
            // && rmdir /s /q "%LocalAppData%\\Mozilla"
            exec('rmdir /s /q "%AppData%\\Mozilla" ', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error executing command: ${err}`);
                    console.error(`stderr: ${stderr}`);
                    return res.status(500).send('Error clearing Mozilla data');
                }
                console.error(`stdout: ${stdout}`);
                activeTabs[browserName] = null;
                res.send("Mozilla Data IS CLEARED");
            });
        } else {
            res.send("Invalid browser name");
        }
    } else {
        res.send("No query passed for filtration");
    }
});




app.get('/getActiveTab', (req, res) => {
    const { browser } = req.query;
    const url = getActiveTab(browser);
    res.send(`Active tab URL for ${browser}: ${url}`);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

// http://localhost:8000/start/?browser=chrome&url=https://www.facebook.com/



const getActiveTab = (browser) => {
    return activeTabs[browser];
};