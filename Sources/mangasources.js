import getData from '../helper.js'
import cheerio from 'cheerio'
class reaaperScans {
    constructor() {
        this.name = 'reaperscans';
        this.baseUrl = 'https://www.reaperscans.com/'
        this.searchUrl = {
            before: '?s=',
            after: '&post_type=wp-manga'
        }
        this.functions = [
            {
                functionName: 'search',
                function: this.search,
                functionParams: ["query"]
            },
            {
                functionName: 'getChapters',
                function: this.getChapters,
                functionParams: ["link"]

            },
            {
                functionName: 'getContent',
                function: this.getContent,
                functionParams: ["link"]
            }
        ]
    }
    async search(query, context = this) {
        query = query.replace(/ /g, '+');
        let url = context.baseUrl + context.searchUrl.before + query + context.searchUrl.after;
        let html = await getData(url);
        let $ = cheerio.load(html);
        let results = []
        try {
        $(".c-tabs-item__content").each((i, elem) => {
            let title = $(elem).find(".post-title").text().trim();
            let link = $(elem).find(".post-title").find("a").attr("href")
            let image = $(elem).find("img").attr("src");
            results.push({
                title: title,
                link: link,
                image: image
            })
        })} catch (error) {
            results.push({
                title: "No results found",
                link: "",
                image: ""
            })
        }
        return results;
    }
    async getChapters(link, context = this) {
        let html = await getData(link);
        let $ = cheerio.load(html);
        let results = []
        try {
        $(".wp-manga-chapter").each((i, elem) => {
            let title = $(elem).find(".chapter-manhwa-title").text().trim();
            let link = $(elem).find("a").attr("href")
            let thumb = $(elem).find("img").attr("src");
            results.push({
                title: title,
                thumb: thumb,
                link: link
            })
        })}
        catch (e) {
            results.push({
                title: "No chapters found",
                thumb: "",
                link: ""
            })
        }
        return results;
    }
    async getContent(link){
        let html = await getData(link);
        let $ = cheerio.load(html);
        let results = []
        try{
        let pages = $(".wp-manga-chapter-img").map((i, elem) => {
            return $(elem).attr("data-src").trim();
        }).get()
        let title = $("#chapter-heading").text().trim();
        results.push({
            pages: pages,
            title: title
        })}
        catch(e){
            results.push({
                pages: [],
                title: "No content found"
            })
        }
        return results;
    }

}
export default reaaperScans;