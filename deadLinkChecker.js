process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
var fetch = require('node-fetch');
var axios = require('axios');
const jsdom = require("jsdom");
var fs = require('fs');
const { JSDOM } = jsdom;
const UrlsListToExclude = [
    'https://disqus.com/?ref_noscript',
    'https://news.google.com/publications/CAAqBwgKMMmQnQsw2pq1Aw',
    'https://www.facebook.com/DroidTechKnow/',
    'https://twitter.com/DroidTechKnow',
    'https://www.youtube.com/DroidTechKnow',
    'linkedin.com'
]

async function checkUrlExits(url) {
    console.log('Checking validity for URL -> ' + url);
    const response = await axios(url, { timeout: 5000 }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          console.log('Request timed out');
        } else {
          console.log(error.message);
        }
        return { status: 1000 };
      });
      ;
    console.log(response.status);
    return response.status;
}

async function getAllArticles() {
    console.log('Fetching articles....');
    const response = await axios('https://droidtechknow.com/api/search.php?query=a');
    return response.data;
}

async function findAllLinksForArtile(url) {
    const response = await axios(url);
    const dom = new JSDOM(response.data);
    const a = dom.window.document.getElementsByTagName('a');
    const list = [];
    for (let anchor of a) {
        if (!anchor.href.includes('linkedin.com') && !anchor.href.includes('droidtechknow') && anchor.href.includes('http') && !UrlsListToExclude.includes(anchor.href)) {
            const res = await checkUrlExits(anchor.href);
            if (res != 200) list.push(anchor.href);
        }
    }
    return list;
}


(async () => {
    const allArticles = await getAllArticles();
    const dealLinks = {};
    let index = 0;
    for (let article of allArticles) {
        const url = 'https://droidtechknow.com' + article.articleLink;
        console.log('Testing URL -> ' + url)
        const links = await findAllLinksForArtile(url);
        console.log(links);
        if (links.length) dealLinks[url] = links;
        index++;
        console.log('Completed->  \t' + (index / allArticles.length) * 100 + '% Done');
    }

    fs.writeFile('demo.json', JSON.stringify(dealLinks), 'utf8', (err, data) => {
        console.log(data);
    });
    console.log(dealLinks)
})();