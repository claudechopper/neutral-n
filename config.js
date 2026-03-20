// ─────────────────────────────────────────────────────────
// config.js — Central configuration for Neutral News
// ─────────────────────────────────────────────────────────

module.exports = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: 'claude-haiku-4-5-20251001',
  port: parseInt(process.env.PORT, 10) || 3000,
  schedules: ['0 6 * * *', '0 11 * * *', '0 18 * * *'],
  timezone: 'America/Toronto',
  maxStoriesPerCategory: 8,
  scrapeDefaults: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timeout: 20000,
    maxItems: 20,
  },

  // ──────────────────────────────────────────────────────
  // SOURCE LIBRARY  —  Region > Country > City hierarchy
  // settings.countries = ['usa','uk',...]      → national feeds pooled into International
  // settings.cities    = ['toronto','london',...] → each city its own section
  // settings.influencers = ['foundmyfitness',...]
  // Canada national is ALWAYS enabled (never in settings, always scraped)
  // ──────────────────────────────────────────────────────
  sourceLibrary: {

    regions: [

      // ── NORTH AMERICA ─────────────────────────────────
      {
        id: 'north_america', label: 'North America',
        countries: [
          {
            id: 'canada', label: 'Canada', alwaysEnabled: true,
            nationalSources: [
              { name: 'CBC News',        url: 'https://www.cbc.ca/cmlink/rss-topstories', type: 'rss' },
              { name: 'CTV News',        url: 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009', type: 'rss' },
              { name: 'Globe and Mail',  url: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/', type: 'rss' },
              { name: 'National Post',   url: 'https://nationalpost.com/feed', type: 'rss' },
              { name: 'Global News CA',  url: 'https://globalnews.ca/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'toronto',   label: 'Toronto',   defaultEnabled: true,  sources: [
                { name: 'CBC Toronto',        url: 'https://www.cbc.ca/cmlink/rss-canada-toronto', type: 'rss' },
                { name: 'CTV Toronto',        url: 'https://toronto.ctvnews.ca/rss/ctv-news-toronto-1.822319', type: 'rss' },
                { name: 'Toronto Star',       url: 'https://www.thestar.com/search/?f=rss&t=article&c=news/gta*&l=50&s=start_time&sd=desc', type: 'rss' },
                { name: 'Global News TO',     url: 'https://globalnews.ca/toronto/feed/', type: 'rss' },
              ]},
              { id: 'vancouver', label: 'Vancouver', defaultEnabled: false, sources: [
                { name: 'CBC Vancouver',      url: 'https://www.cbc.ca/cmlink/rss-canada-britishcolumbia', type: 'rss' },
                { name: 'Global News Van',    url: 'https://globalnews.ca/vancouver/feed/', type: 'rss' },
                { name: 'Vancouver Sun',      url: 'https://www.vancouversun.com/feed', type: 'rss' },
              ]},
              { id: 'montreal',  label: 'Montreal',  defaultEnabled: false, sources: [
                { name: 'CBC Montreal',       url: 'https://www.cbc.ca/cmlink/rss-canada-montreal', type: 'rss' },
                { name: 'CTV Montreal',       url: 'https://montreal.ctvnews.ca/rss/ctv-news-montreal-1.822323', type: 'rss' },
                { name: 'Montreal Gazette',   url: 'https://montrealgazette.com/feed', type: 'rss' },
              ]},
              { id: 'calgary',   label: 'Calgary',   defaultEnabled: false, sources: [
                { name: 'CBC Calgary',        url: 'https://www.cbc.ca/cmlink/rss-canada-calgary', type: 'rss' },
                { name: 'Calgary Herald',     url: 'https://calgaryherald.com/feed', type: 'rss' },
              ]},
              { id: 'ottawa',    label: 'Ottawa',    defaultEnabled: false, sources: [
                { name: 'CBC Ottawa',         url: 'https://www.cbc.ca/cmlink/rss-canada-ottawa', type: 'rss' },
                { name: 'Ottawa Citizen',     url: 'https://ottawacitizen.com/feed', type: 'rss' },
              ]},
              { id: 'edmonton',  label: 'Edmonton',  defaultEnabled: false, sources: [
                { name: 'CBC Edmonton',       url: 'https://www.cbc.ca/cmlink/rss-canada-edmonton', type: 'rss' },
                { name: 'Edmonton Journal',   url: 'https://edmontonjournal.com/feed', type: 'rss' },
              ]},
              { id: 'winnipeg',  label: 'Winnipeg',  defaultEnabled: false, sources: [
                { name: 'CBC Manitoba',       url: 'https://www.cbc.ca/cmlink/rss-canada-manitoba', type: 'rss' },
                { name: 'Winnipeg Free Press',url: 'https://www.winnipegfreepress.com/rss/', type: 'rss' },
              ]},
              { id: 'halifax',   label: 'Halifax',   defaultEnabled: false, sources: [
                { name: 'CBC Nova Scotia',    url: 'https://www.cbc.ca/cmlink/rss-canada-novascotia', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'usa', label: 'United States', defaultEnabled: false,
            nationalSources: [
              { name: 'AP News',   url: 'https://rsshub.app/apnews/topics/apf-topnews', type: 'rss' },
              { name: 'NPR',       url: 'https://feeds.npr.org/1001/rss.xml', type: 'rss' },
              { name: 'PBS',       url: 'https://www.pbs.org/newshour/feeds/rss/headlines', type: 'rss' },
              { name: 'The Hill',  url: 'https://thehill.com/news/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'new_york',      label: 'New York',      defaultEnabled: false, sources: [
                { name: 'NY Post',       url: 'https://nypost.com/feed/', type: 'rss' },
                { name: 'Gothamist',     url: 'https://gothamist.com/feed', type: 'rss' },
              ]},
              { id: 'los_angeles',   label: 'Los Angeles',   defaultEnabled: false, sources: [
                { name: 'LA Times',      url: 'https://www.latimes.com/rss2.0.xml', type: 'rss' },
                { name: 'LAist',         url: 'https://laist.com/feeds/latest', type: 'rss' },
              ]},
              { id: 'chicago',       label: 'Chicago',       defaultEnabled: false, sources: [
                { name: 'Chicago Tribune', url: 'https://www.chicagotribune.com/arcio/rss/', type: 'rss' },
                { name: 'WGN TV',        url: 'https://wgntv.com/feed/', type: 'rss' },
              ]},
              { id: 'washington_dc', label: 'Washington DC', defaultEnabled: false, sources: [
                { name: 'WTOP',          url: 'https://feeds.feedburner.com/wtop/news', type: 'rss' },
                { name: 'DCist',         url: 'https://dcist.com/feed', type: 'rss' },
              ]},
              { id: 'miami',         label: 'Miami',         defaultEnabled: false, sources: [
                { name: 'CBS Miami',     url: 'https://miami.cbslocal.com/feed/', type: 'rss' },
              ]},
              { id: 'seattle',       label: 'Seattle',       defaultEnabled: false, sources: [
                { name: 'KUOW',          url: 'https://kuow.org/rss/news', type: 'rss' },
                { name: 'KOMO News',     url: 'https://komonews.com/feeds/rss', type: 'rss' },
              ]},
              { id: 'boston',        label: 'Boston',        defaultEnabled: false, sources: [
                { name: 'WBUR',          url: 'https://www.wbur.org/rss/news', type: 'rss' },
              ]},
              { id: 'san_francisco', label: 'San Francisco', defaultEnabled: false, sources: [
                { name: 'KQED',          url: 'https://www.kqed.org/feed', type: 'rss' },
              ]},
              { id: 'houston',       label: 'Houston',       defaultEnabled: false, sources: [
                { name: 'Click2Houston', url: 'https://www.click2houston.com/rss/headlines.rss', type: 'rss' },
              ]},
              { id: 'atlanta',       label: 'Atlanta',       defaultEnabled: false, sources: [
                { name: 'WSB-TV',        url: 'https://www.wsbtv.com/rss/news/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'mexico', label: 'Mexico', defaultEnabled: false,
            nationalSources: [
              { name: 'Mexico News Daily', url: 'https://mexiconewsdaily.com/feed/', type: 'rss' },
              { name: 'El Universal EN',   url: 'https://www.eluniversal.com.mx/rss.xml', type: 'rss' },
            ],
            cities: [
              { id: 'mexico_city', label: 'Mexico City', defaultEnabled: false, sources: [
                { name: 'Mexico News Daily', url: 'https://mexiconewsdaily.com/feed/', type: 'rss' },
              ]},
            ],
          },
        ],
      },

      // ── EUROPE ────────────────────────────────────────
      {
        id: 'europe', label: 'Europe',
        countries: [
          {
            id: 'uk', label: 'United Kingdom', defaultEnabled: false,
            nationalSources: [
              { name: 'BBC UK',          url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', type: 'rss' },
              { name: 'The Guardian',    url: 'https://www.theguardian.com/uk-news/rss', type: 'rss' },
              { name: 'Sky News',        url: 'https://feeds.skynews.com/feeds/rss/uk.xml', type: 'rss' },
              { name: 'The Independent', url: 'https://www.independent.co.uk/news/uk/rss', type: 'rss' },
            ],
            cities: [
              { id: 'london',     label: 'London',     defaultEnabled: false, sources: [
                { name: 'BBC London',       url: 'https://feeds.bbci.co.uk/news/england/london/rss.xml', type: 'rss' },
                { name: 'Evening Standard', url: 'https://www.standard.co.uk/rss', type: 'rss' },
              ]},
              { id: 'manchester', label: 'Manchester', defaultEnabled: false, sources: [
                { name: 'BBC Manchester',   url: 'https://feeds.bbci.co.uk/news/england/manchester/rss.xml', type: 'rss' },
                { name: 'Manchester Evening News', url: 'https://www.manchestereveningnews.co.uk/rss', type: 'rss' },
              ]},
              { id: 'edinburgh',  label: 'Edinburgh',  defaultEnabled: false, sources: [
                { name: 'BBC Scotland',     url: 'https://feeds.bbci.co.uk/news/scotland/rss.xml', type: 'rss' },
                { name: 'The Scotsman',     url: 'https://www.scotsman.com/feed', type: 'rss' },
              ]},
              { id: 'birmingham', label: 'Birmingham', defaultEnabled: false, sources: [
                { name: 'BBC West Midlands',url: 'https://feeds.bbci.co.uk/news/england/west_midlands/rss.xml', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'germany', label: 'Germany', defaultEnabled: false,
            nationalSources: [
              { name: 'Deutsche Welle',    url: 'https://rss.dw.com/rdf/rss-en-all', type: 'rss' },
              { name: 'The Local Germany', url: 'https://www.thelocal.de/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'berlin',  label: 'Berlin',  defaultEnabled: false, sources: [
                { name: 'Berlin Spectator',  url: 'https://berlinspectator.com/feed/', type: 'rss' },
                { name: 'DW Berlin',         url: 'https://rss.dw.com/xml/rss-en-ger', type: 'rss' },
              ]},
              { id: 'munich',  label: 'Munich',  defaultEnabled: false, sources: [
                { name: 'Munich Eye',        url: 'https://munich-eye.com/feed/', type: 'rss' },
              ]},
              { id: 'hamburg', label: 'Hamburg', defaultEnabled: false, sources: [
                { name: 'DW Germany',        url: 'https://rss.dw.com/rdf/rss-en-all', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'france', label: 'France', defaultEnabled: false,
            nationalSources: [
              { name: 'France 24',         url: 'https://www.france24.com/en/rss', type: 'rss' },
              { name: 'The Local France',  url: 'https://www.thelocal.fr/feed/', type: 'rss' },
              { name: 'RFI English',       url: 'https://www.rfi.fr/en/rss', type: 'rss' },
            ],
            cities: [
              { id: 'paris', label: 'Paris', defaultEnabled: false, sources: [
                { name: 'France 24 France', url: 'https://www.france24.com/en/france/rss', type: 'rss' },
                { name: 'The Local France', url: 'https://www.thelocal.fr/feed/', type: 'rss' },
              ]},
              { id: 'marseille', label: 'Marseille', defaultEnabled: false, sources: [
                { name: 'France 24',        url: 'https://www.france24.com/en/france/rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'spain', label: 'Spain', defaultEnabled: false,
            nationalSources: [
              { name: 'The Local Spain',   url: 'https://www.thelocal.es/feed/', type: 'rss' },
              { name: 'EuroNews Spain',    url: 'https://feeds.feedburner.com/euronews/en/home', type: 'rss' },
            ],
            cities: [
              { id: 'madrid',    label: 'Madrid',    defaultEnabled: false, sources: [
                { name: 'The Local Spain',  url: 'https://www.thelocal.es/feed/', type: 'rss' },
              ]},
              { id: 'barcelona', label: 'Barcelona', defaultEnabled: false, sources: [
                { name: 'The Local Spain',  url: 'https://www.thelocal.es/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'italy', label: 'Italy', defaultEnabled: false,
            nationalSources: [
              { name: 'The Local Italy',   url: 'https://www.thelocal.it/feed/', type: 'rss' },
              { name: 'ANSA English',      url: 'https://www.ansa.it/sito/ansait_rss.xml', type: 'rss' },
            ],
            cities: [
              { id: 'rome',  label: 'Rome',  defaultEnabled: false, sources: [
                { name: 'ANSA',             url: 'https://www.ansa.it/sito/ansait_rss.xml', type: 'rss' },
              ]},
              { id: 'milan', label: 'Milan', defaultEnabled: false, sources: [
                { name: 'The Local Italy',  url: 'https://www.thelocal.it/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'netherlands', label: 'Netherlands', defaultEnabled: false,
            nationalSources: [
              { name: 'DutchNews.nl',      url: 'https://www.dutchnews.nl/feed/', type: 'rss' },
              { name: 'NL Times',          url: 'https://nltimes.nl/rss.xml', type: 'rss' },
            ],
            cities: [
              { id: 'amsterdam', label: 'Amsterdam', defaultEnabled: false, sources: [
                { name: 'DutchNews',        url: 'https://www.dutchnews.nl/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'sweden', label: 'Sweden', defaultEnabled: false,
            nationalSources: [
              { name: 'The Local Sweden',  url: 'https://www.thelocal.se/feed/', type: 'rss' },
              { name: 'Radio Sweden',      url: 'https://sverigesradio.se/rss/kanalredaktion.aspx?kanalid=2054', type: 'rss' },
            ],
            cities: [
              { id: 'stockholm', label: 'Stockholm', defaultEnabled: false, sources: [
                { name: 'The Local Sweden', url: 'https://www.thelocal.se/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'switzerland', label: 'Switzerland', defaultEnabled: false,
            nationalSources: [
              { name: 'The Local Switzerland', url: 'https://www.thelocal.ch/feed/', type: 'rss' },
              { name: 'SWI swissinfo',         url: 'https://www.swissinfo.ch/eng/rss/headline_news', type: 'rss' },
            ],
            cities: [
              { id: 'zurich', label: 'Zürich', defaultEnabled: false, sources: [
                { name: 'SWI swissinfo',    url: 'https://www.swissinfo.ch/eng/rss/headline_news', type: 'rss' },
              ]},
              { id: 'geneva', label: 'Geneva', defaultEnabled: false, sources: [
                { name: 'SWI swissinfo',    url: 'https://www.swissinfo.ch/eng/rss/headline_news', type: 'rss' },
              ]},
            ],
          },
        ],
      },

      // ── ASIA-PACIFIC ──────────────────────────────────
      {
        id: 'asia_pacific', label: 'Asia-Pacific',
        countries: [
          {
            id: 'australia', label: 'Australia', defaultEnabled: false,
            nationalSources: [
              { name: 'ABC Australia',     url: 'https://www.abc.net.au/news/feed/51120/rss.xml', type: 'rss' },
              { name: 'SBS News',          url: 'https://www.sbs.com.au/news/feed', type: 'rss' },
            ],
            cities: [
              { id: 'sydney',    label: 'Sydney',    defaultEnabled: false, sources: [
                { name: 'ABC NSW',          url: 'https://www.abc.net.au/news/feed/1534/rss.xml', type: 'rss' },
                { name: 'Sydney Morning Herald', url: 'https://www.smh.com.au/rss/feed.xml', type: 'rss' },
              ]},
              { id: 'melbourne', label: 'Melbourne', defaultEnabled: false, sources: [
                { name: 'ABC Victoria',     url: 'https://www.abc.net.au/news/feed/1530/rss.xml', type: 'rss' },
                { name: 'The Age',          url: 'https://www.theage.com.au/rss/feed.xml', type: 'rss' },
              ]},
              { id: 'brisbane',  label: 'Brisbane',  defaultEnabled: false, sources: [
                { name: 'ABC Queensland',   url: 'https://www.abc.net.au/news/feed/1538/rss.xml', type: 'rss' },
              ]},
              { id: 'perth',     label: 'Perth',     defaultEnabled: false, sources: [
                { name: 'ABC WA',           url: 'https://www.abc.net.au/news/feed/1542/rss.xml', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'japan', label: 'Japan', defaultEnabled: false,
            nationalSources: [
              { name: 'NHK World',         url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/latest.xml', type: 'rss' },
              { name: 'Japan Times',       url: 'https://www.japantimes.co.jp/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'tokyo', label: 'Tokyo', defaultEnabled: false, sources: [
                { name: 'NHK World',        url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/latest.xml', type: 'rss' },
                { name: 'Japan Times',      url: 'https://www.japantimes.co.jp/feed/', type: 'rss' },
              ]},
              { id: 'osaka', label: 'Osaka', defaultEnabled: false, sources: [
                { name: 'NHK World',        url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/latest.xml', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'india', label: 'India', defaultEnabled: false,
            nationalSources: [
              { name: 'NDTV',              url: 'https://feeds.feedburner.com/ndtvnews-top-stories', type: 'rss' },
              { name: 'Times of India',    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', type: 'rss' },
              { name: 'The Hindu',         url: 'https://www.thehindu.com/news/national/?service=rss', type: 'rss' },
            ],
            cities: [
              { id: 'mumbai',    label: 'Mumbai',    defaultEnabled: false, sources: [
                { name: 'TOI Mumbai',       url: 'https://timesofindia.indiatimes.com/rss/city/mumbai', type: 'rss' },
              ]},
              { id: 'delhi',     label: 'Delhi',     defaultEnabled: false, sources: [
                { name: 'TOI Delhi',        url: 'https://timesofindia.indiatimes.com/rss/city/delhi', type: 'rss' },
                { name: 'Hindustan Times',  url: 'https://www.hindustantimes.com/feeds/rss/delhi-news/rssfeed.xml', type: 'rss' },
              ]},
              { id: 'bangalore', label: 'Bangalore', defaultEnabled: false, sources: [
                { name: 'TOI Bangalore',    url: 'https://timesofindia.indiatimes.com/rss/city/bangalore', type: 'rss' },
              ]},
              { id: 'chennai',   label: 'Chennai',   defaultEnabled: false, sources: [
                { name: 'The Hindu Chennai',url: 'https://www.thehindu.com/news/cities/chennai/?service=rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'singapore', label: 'Singapore', defaultEnabled: false,
            nationalSources: [
              { name: 'Channel NewsAsia',  url: 'https://www.channelnewsasia.com/rssfeeds/8395986', type: 'rss' },
              { name: 'Straits Times',     url: 'https://www.straitstimes.com/news/latest', type: 'rss' },
            ],
            cities: [
              { id: 'singapore_city', label: 'Singapore City', defaultEnabled: false, sources: [
                { name: 'CNA Singapore',    url: 'https://www.channelnewsasia.com/rssfeeds/8395986', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'south_korea', label: 'South Korea', defaultEnabled: false,
            nationalSources: [
              { name: 'Korea Herald',      url: 'https://www.koreaherald.com/rss', type: 'rss' },
              { name: 'Arirang News',      url: 'https://www.arirang.com/rss/rss_news.asp', type: 'rss' },
            ],
            cities: [
              { id: 'seoul', label: 'Seoul', defaultEnabled: false, sources: [
                { name: 'Korea Herald',     url: 'https://www.koreaherald.com/rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'china', label: 'China', defaultEnabled: false,
            nationalSources: [
              { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', type: 'rss' },
              { name: 'Sixth Tone',        url: 'https://www.sixthtone.com/rss', type: 'rss' },
            ],
            cities: [
              { id: 'beijing',   label: 'Beijing',   defaultEnabled: false, sources: [
                { name: 'SCMP',             url: 'https://www.scmp.com/rss/91/feed', type: 'rss' },
              ]},
              { id: 'shanghai',  label: 'Shanghai',  defaultEnabled: false, sources: [
                { name: 'SCMP',             url: 'https://www.scmp.com/rss/91/feed', type: 'rss' },
              ]},
              { id: 'hong_kong', label: 'Hong Kong', defaultEnabled: false, sources: [
                { name: 'SCMP',             url: 'https://www.scmp.com/rss/91/feed', type: 'rss' },
                { name: 'RTHK',             url: 'https://rthk.hk/rthk/news/rss/e_expressnews_all.xml', type: 'rss' },
              ]},
            ],
          },
        ],
      },

      // ── MIDDLE EAST & AFRICA ──────────────────────────
      {
        id: 'middle_east_africa', label: 'Middle East & Africa',
        countries: [
          {
            id: 'israel', label: 'Israel', defaultEnabled: false,
            nationalSources: [
              { name: 'Jerusalem Post',    url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', type: 'rss' },
              { name: 'Times of Israel',   url: 'https://www.timesofisrael.com/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'tel_aviv',  label: 'Tel Aviv',  defaultEnabled: false, sources: [
                { name: 'Times of Israel',  url: 'https://www.timesofisrael.com/feed/', type: 'rss' },
              ]},
              { id: 'jerusalem', label: 'Jerusalem', defaultEnabled: false, sources: [
                { name: 'Jerusalem Post',   url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'uae', label: 'UAE', defaultEnabled: false,
            nationalSources: [
              { name: 'Gulf News',         url: 'https://gulfnews.com/rss', type: 'rss' },
              { name: 'The National',      url: 'https://www.thenationalnews.com/rss', type: 'rss' },
              { name: 'Khaleej Times',     url: 'https://www.khaleejtimes.com/rss', type: 'rss' },
            ],
            cities: [
              { id: 'dubai',     label: 'Dubai',     defaultEnabled: false, sources: [
                { name: 'Gulf News',        url: 'https://gulfnews.com/rss', type: 'rss' },
              ]},
              { id: 'abu_dhabi', label: 'Abu Dhabi', defaultEnabled: false, sources: [
                { name: 'The National',     url: 'https://www.thenationalnews.com/rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'qatar', label: 'Qatar', defaultEnabled: false,
            nationalSources: [
              { name: 'Al Jazeera',        url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
              { name: 'Qatar Tribune',     url: 'https://www.qatar-tribune.com/rss', type: 'rss' },
            ],
            cities: [
              { id: 'doha', label: 'Doha', defaultEnabled: false, sources: [
                { name: 'Qatar Tribune',    url: 'https://www.qatar-tribune.com/rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'south_africa', label: 'South Africa', defaultEnabled: false,
            nationalSources: [
              { name: 'News24',            url: 'https://feeds.news24.com/articles/news24/TopStories/rss', type: 'rss' },
              { name: 'Daily Maverick',    url: 'https://www.dailymaverick.co.za/rss', type: 'rss' },
              { name: 'Mail & Guardian',   url: 'https://mg.co.za/feed', type: 'rss' },
            ],
            cities: [
              { id: 'johannesburg', label: 'Johannesburg', defaultEnabled: false, sources: [
                { name: 'News24',           url: 'https://feeds.news24.com/articles/news24/TopStories/rss', type: 'rss' },
              ]},
              { id: 'cape_town',    label: 'Cape Town',    defaultEnabled: false, sources: [
                { name: 'Daily Maverick',   url: 'https://www.dailymaverick.co.za/rss', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'nigeria', label: 'Nigeria', defaultEnabled: false,
            nationalSources: [
              { name: 'Punch Nigeria',     url: 'https://punchng.com/feed/', type: 'rss' },
              { name: 'Vanguard',          url: 'https://www.vanguardngr.com/feed/', type: 'rss' },
              { name: 'The Nation',        url: 'https://thenationonlineng.net/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'lagos',  label: 'Lagos',  defaultEnabled: false, sources: [
                { name: 'Punch Lagos',      url: 'https://punchng.com/feed/', type: 'rss' },
              ]},
              { id: 'abuja',  label: 'Abuja',  defaultEnabled: false, sources: [
                { name: 'Vanguard',         url: 'https://www.vanguardngr.com/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'kenya', label: 'Kenya', defaultEnabled: false,
            nationalSources: [
              { name: 'Nation Africa',     url: 'https://nation.africa/kenya/rss', type: 'rss' },
              { name: 'The Standard',      url: 'https://www.standardmedia.co.ke/rss', type: 'rss' },
            ],
            cities: [
              { id: 'nairobi', label: 'Nairobi', defaultEnabled: false, sources: [
                { name: 'Nation Africa',    url: 'https://nation.africa/kenya/rss', type: 'rss' },
              ]},
            ],
          },
        ],
      },

      // ── LATIN AMERICA ─────────────────────────────────
      {
        id: 'latin_america', label: 'Latin America',
        countries: [
          {
            id: 'brazil', label: 'Brazil', defaultEnabled: false,
            nationalSources: [
              { name: 'Agência Brasil',    url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', type: 'rss' },
              { name: 'The Rio Times',     url: 'https://riotimesonline.com/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'sao_paulo',    label: 'São Paulo',    defaultEnabled: false, sources: [
                { name: 'The Rio Times',    url: 'https://riotimesonline.com/feed/', type: 'rss' },
              ]},
              { id: 'rio_de_janeiro', label: 'Rio de Janeiro', defaultEnabled: false, sources: [
                { name: 'The Rio Times',    url: 'https://riotimesonline.com/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'argentina', label: 'Argentina', defaultEnabled: false,
            nationalSources: [
              { name: 'Buenos Aires Times', url: 'https://www.batimes.com.ar/feed/', type: 'rss' },
              { name: 'MercoPress',         url: 'https://en.mercopress.com/rss.xml', type: 'rss' },
            ],
            cities: [
              { id: 'buenos_aires', label: 'Buenos Aires', defaultEnabled: false, sources: [
                { name: 'Buenos Aires Times', url: 'https://www.batimes.com.ar/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'colombia', label: 'Colombia', defaultEnabled: false,
            nationalSources: [
              { name: 'Colombia Reports',  url: 'https://colombiareports.com/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'bogota', label: 'Bogotá', defaultEnabled: false, sources: [
                { name: 'Colombia Reports', url: 'https://colombiareports.com/feed/', type: 'rss' },
              ]},
            ],
          },
          {
            id: 'chile', label: 'Chile', defaultEnabled: false,
            nationalSources: [
              { name: 'Santiago Times',    url: 'https://santiagotimes.cl/feed/', type: 'rss' },
            ],
            cities: [
              { id: 'santiago', label: 'Santiago', defaultEnabled: false, sources: [
                { name: 'Santiago Times',   url: 'https://santiagotimes.cl/feed/', type: 'rss' },
              ]},
            ],
          },
        ],
      },

    ], // end regions

    // ── Health & Science influencers ────────────────────
    influencers: [
      { id: 'foundmyfitness', label: 'Dr. Rhonda Patrick — @foundmyfitness', defaultEnabled: true, sources: [
        { name: '@foundmyfitness', url: 'https://nitter.poast.org/foundmyfitness/rss', type: 'rss' },
        { name: '@foundmyfitness', url: 'https://nitter.privacydev.net/foundmyfitness/rss', type: 'rss' },
        { name: '@foundmyfitness', url: 'https://nitter.net/foundmyfitness/rss', type: 'rss' },
        { name: 'FoundMyFitness Podcast', url: 'https://www.foundmyfitness.com/episodes/feed', type: 'rss' },
      ]},
      { id: 'peterattia', label: 'Dr. Peter Attia — @PeterAttiaMD', defaultEnabled: false, sources: [
        { name: '@PeterAttiaMD', url: 'https://nitter.poast.org/PeterAttiaMD/rss', type: 'rss' },
        { name: '@PeterAttiaMD', url: 'https://nitter.privacydev.net/PeterAttiaMD/rss', type: 'rss' },
        { name: 'Peter Attia Podcast', url: 'https://peterattiamd.com/feed/', type: 'rss' },
      ]},
      { id: 'huberman', label: 'Dr. Andrew Huberman — @hubermanlab', defaultEnabled: false, sources: [
        { name: '@hubermanlab', url: 'https://nitter.poast.org/hubermanlab/rss', type: 'rss' },
        { name: '@hubermanlab', url: 'https://nitter.privacydev.net/hubermanlab/rss', type: 'rss' },
        { name: 'Huberman Lab', url: 'https://feeds.megaphone.fm/hubermanlab', type: 'rss' },
      ]},
      { id: 'bryanjohnson', label: 'Bryan Johnson — @bryan_johnson', defaultEnabled: false, sources: [
        { name: '@bryan_johnson', url: 'https://nitter.poast.org/bryan_johnson/rss', type: 'rss' },
        { name: '@bryan_johnson', url: 'https://nitter.privacydev.net/bryan_johnson/rss', type: 'rss' },
      ]},
      { id: 'harvardhealth', label: 'Harvard Health Blog', defaultEnabled: false, sources: [
        { name: 'Harvard Health', url: 'https://feeds.health.harvard.edu/rss/blog-harvard-health', type: 'rss' },
      ]},
      { id: 'nih',          label: 'NIH Health News',             defaultEnabled: false, sources: [
        { name: 'NIH News', url: 'https://www.nih.gov/rss/news/nih-news.xml', type: 'rss' },
      ]},
      { id: 'examine',      label: 'Examine.com — Nutrition Science', defaultEnabled: false, sources: [
        { name: 'Examine.com', url: 'https://examine.com/feed/', type: 'rss' },
      ]},
      { id: 'sciencedaily', label: 'Science Daily — Health',       defaultEnabled: false, sources: [
        { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/health_medicine.xml', type: 'rss' },
      ]},
    ],

  }, // end sourceLibrary
};
