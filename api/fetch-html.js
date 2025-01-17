// const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { playlistid } = req.query;
  console.log(playlistid);

  const url = `https://music.youtube.com/playlist?list=${playlistid}`;
  console.log('Fetching HTML for:', url);


  if (playlistid == "") {
    return res.status(400).json({ error: 'playlistid is required' });
  }

  try {

    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });


    // const browser = await puppeteer.launch({
    //   args: [
    //     '--no-sandbox',
    //     '--disable-setuid-sandbox',
    //     '--disable-blink-features=AutomationControlled',
    //   ],
    //   headless: true, // Use full browser (set to true if needed for production)
    // });

    const page = await browser.newPage();

    // Add User-Agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    );

    // Remove Puppeteer's automation flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Set a viewport to ensure responsiveness
    await page.setViewport({ width: 1280, height: 800 });

    // Visit the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for some dynamic content to load (if needed)
    await page.waitForSelector('ytmusic-responsive-list-item-renderer');

    // Extract the page's HTML
    const html = await page.content();
    await browser.close();

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching HTML:', error);
    res.status(500).json({ error: 'Failed to fetch HTML' });
  }
}