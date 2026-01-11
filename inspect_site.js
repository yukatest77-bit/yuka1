const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    try {
        const url = 'https://pharmaciedegardetanger.site/';
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        const items = $('.list__');
        console.log(`Found ${items.length} items with class .list__`);

        if (items.length > 0) {
            items.each((i, el) => {
                const name = $(el).find('.list__label--name').text().trim();
                const address = $(el).find('.list__label--address, .list__label--desc').text().trim(); // Guessed classes
                const phone = $(el).find('.list__label--phone, .list__phone').text().trim(); // Guessed classes
                const allText = $(el).text().trim().replace(/\s+/g, ' ');

                console.log(`\nItem ${i}:`);
                console.log(`Name: ${name}`);
                console.log(`All Text: ${allText}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspect();
