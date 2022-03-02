import {getData} from '../helper.js';
import cheerio from 'cheerio'
import puppeteer from 'puppeteer'

class reaperScans {
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
class mangaPill {
    constructor() {
        this.name = 'mangapill';
        this.baseUrl = 'https://mangapill.com/'
        this.searchUrl = {
            before: 'search?q=',
            after: ''
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
        const browser = await puppeteer.launch({headless: true, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]});
        const page = await browser.newPage();
        await page.goto(url);
        const results = await page.evaluate(()=>{
            let res = []
            let divv = document.querySelector("body > div.container > div.my-3.grid.justify-between.gap-3.grid-cols-2.md\\:grid-cols-4.lg\\:grid-cols-8").children
            for (var i = 0; i < divv.length; i++) {
                let child = divv[i];
                let image = child.querySelector("img").src
                let title = child.getElementsByClassName("block text-xs font-bold line-clamp-2")[0].innerText
                let link = child.querySelector("a").href
                res.push({
                    title: title,
                    link: link,
                    image: image
                })
            }
            return res

        })
        await browser.close()
        if (results.length == 0){
            results.push({
                title: "No results found",
                link: "",
                image: ""
            })
        }
        return results;
    }
    async getChapters(link, context = this) {
        const browser = await puppeteer.launch({headless: true, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]});
        const page = await browser.newPage();
        try {
        await page.goto(link);
        const results = await page.evaluate(()=>{
            let res = []
            let divv = document.querySelector("#chapters > div").children
            for (var i = 0; i < divv.length; i++) {
                let child = divv[i];
                res.push({
                    title: child.innerText,
                    link: child.href
                })
            }
            return res

        }) }
        catch (e) {
            return {
                title: "No chapters found",
                link: ""
            }
        }
        await browser.close()
        if (results.length == 0){
            results.push({
                title: "No results found",
                link: "",
            })
        }
        return results;
    }
    async getContent(link){
        const browser = await puppeteer.launch({headless: true, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]});
        const page = await browser.newPage();
        await page.goto(link);
        const results = await page.evaluate(()=>{

            let pages = []
            let title = document.getElementById("name").innerText
            let divv = document.getElementsByClassName("js-page")
            for (var i = 0; i < divv.length; i++) {
                let child = divv[i];
                pages.push(child.getAttribute("data-src"))
            }
            return {
                pages: pages,
                title: title
            }

        })
        await browser.close()
        return results;
    }

}
export{mangaPill, reaperScans};