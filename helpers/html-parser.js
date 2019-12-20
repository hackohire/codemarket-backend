const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'figcaption', 'img', 'iframe', 'script',]);
const allowedAttributes = {
    iframe: ['*'],
    img: ['*'],
    a: ['*'],
    div: ['*'],
    h3: ['*'],
    script: ['*'],
    blockquote: ['*']
};

const parseMediumArticle = async (html) => {

    /** Create a Dummy DOM for using Jquery to parse HTML */
    this.$ = cheerio.load(html);

    /** Parse article tag with class @class meteredContent This works only for medium.com */
    let articleHtml = await this.$('article')
        .map((i, section) => this.$(section).html())
        .get()
        .join('<hr/>');

    return await sanitizeHtml(articleHtml, {
        allowedTags,
        allowedAttributes,
        transformTags: {
            'figcaption': (tagName, attribs) => {
                attribs['class'] = "cdx-input image-tool__caption";
                attribs['contenteditable'] = true;
                attribs['data-placeholder'] = 'Caption';
                return {
                    tagName: 'div',
                    attribs
                }
            },
            'strong': (tagName, attribs) => {
                return {
                    tagName: 'b',
                    attribs: attribs
                }
            },
            'em': (tagName, attribs) => {
                return {
                    tagName: 'i',
                    attribs: attribs
                }
            }
        },
        exclusiveFilter: function (frame) {
            if (frame.tag === 'br') {
                console.log(frame);
            }
            if (frame.tag === 'noscript' ||
                (frame.tag === 'img' && !frame.attribs['src']) ||
                (frame.tag === 'img' && frame.attribs['src'] && frame.attribs['src'].includes('/max/60/'))) {
                return true;
            }
            return false;
        }
    });
}

const parseMeetupEvent = async (html) => {
    /** Create a Dummy DOM for using Jquery to parse HTML */
    this.$ = cheerio.load(html);

    /** Parse article tag with class @class meteredContent This works only for medium.com */
    let articleHtml = await this.$('main')
        .map((i, section) => this.$(section).html())
        .get()
        .join('<hr/>');

    return await sanitizeHtml(articleHtml, {
        allowedTags,
        allowedAttributes,
        transformTags: {
            'div': (tagName, attribs) => {
                if (attribs['style'] && attribs['style'].includes('url(')) {
                    attribs['src'] = attribs['style'].replace(/.*\s?url\(['"]?/, '').replace(/['"]?\).*/, '');
                }
                return {
                    tagName: attribs['style'] && attribs['style'].includes('url(') ? 'img' : tagName,
                    attribs
                }
            },
            'figcaption': (attribs) => {
                attribs['class'] = "cdx-input image-tool__caption";
                attribs['contenteditable'] = true;
                attribs['data-placeholder'] = 'Caption';
                return {
                    tagName: 'div',
                    attribs
                }
            },
            'strong': (attribs) => {
                return {
                    tagName: 'b',
                    attribs: attribs
                }
            },
            'em': (attribs) => {
                return {
                    tagName: 'i',
                    attribs: attribs
                }
            }
        },
        exclusiveFilter: function (frame) {
            if (
                    frame.tag === 'noscript' ||

                    (frame.tag === 'img' && !frame.attribs['src']) ||

                    (frame.tag === 'div' && frame.attribs['class'] &&
                        (
                            frame.attribs['class'].includes('EventStickyFooter') ||
                            frame.attribs['class'].includes('seeAllMeetups') ||
                            frame.attribs['class'].includes('attendees-sample') ||
                            frame.attribs['class'].includes('eventHomeHeaderSticky')
                        )
                    ) ||

                    (frame.tag === 'button' && frame.attribs['class'] &&
                        (
                            frame.attribs['data-e2e'].includes('event-header--share-btn')
                        )
                    )
                ) {
                return true;
            }
            return false;
        }
    });
}

module.exports = {
    parseMediumArticle,
    parseMeetupEvent
}