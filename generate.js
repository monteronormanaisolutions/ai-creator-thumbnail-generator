// Renders a text-card thumbnail as PNG using Puppeteer (free, no image-gen API).
// Reads the day's headline from headline.json (written by n8n via a GitHub API
// commit, or edited manually during the free test).
//
// Usage: node generate.js
// Output: output/latest-thumbnail.png  (this is the file n8n's thumbnailUrl points to)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_PATH = path.join(__dirname, 'headline.json');
const OUTPUT_PATH = path.join(__dirname, 'output', 'latest-thumbnail.png');

function loadHeadline() {
    if (fs.existsSync(DATA_PATH)) {
          return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
    return {
          title: 'AI News Today',
          kicker: 'AI AUTOMATION DAILY'
    };
}

function buildHtml({ title, kicker }) {
    return `
      <html>
          <head>
                <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
                                        body {
                                                  width: 1080px;
                                                            height: 1080px;
                                                                      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
                                                                                display: flex;
                                                                                          flex-direction: column;
                                                                                                    justify-content: center;
                                                                                                              padding: 90px;
                                                                                                                        color: white;
                                                                                                                                }
                                                                                                                                        .kicker {
                                                                                                                                                  font-size: 32px;
                                                                                                                                                            font-weight: 700;
                                                                                                                                                                      letter-spacing: 4px;
                                                                                                                                                                                color: #7c5cff;
                                                                                                                                                                                          margin-bottom: 40px;
                                                                                                                                                                                                  }
                                                                                                                                                                                                          .title {
                                                                                                                                                                                                                    font-size: 72px;
                                                                                                                                                                                                                              font-weight: 900;
                                                                                                                                                                                                                                        line-height: 1.15;
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                        .bar {
                                                                                                                                                                                                                                                                  width: 120px;
                                                                                                                                                                                                                                                                            height: 8px;
                                                                                                                                                                                                                                                                                      background: #7c5cff;
                                                                                                                                                                                                                                                                                                margin-top: 50px;
                                                                                                                                                                                                                                                                                                          border-radius: 4px;
                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                        </style>
                                                                                                                                                                                                                                                                                                                            </head>
                                                                                                                                                                                                                                                                                                                                <body>
                                                                                                                                                                                                                                                                                                                                      <div class="kicker">${kicker}</div>
                                                                                                                                                                                                                                                                                                                                            <div class="title">${title}</div>
                                                                                                                                                                                                                                                                                                                                                  <div class="bar"></div>
                                                                                                                                                                                                                                                                                                                                                      </body>
                                                                                                                                                                                                                                                                                                                                                        </html>`;
}

(async () => {
    const data = loadHeadline();
    const html = buildHtml(data);

   const browser = await puppeteer.launch({
         args: ['--no-sandbox', '--disable-setuid-sandbox']
   });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

   fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    await page.screenshot({ path: OUTPUT_PATH });

   await browser.close();
    console.log('Thumbnail written to', OUTPUT_PATH);
})();
