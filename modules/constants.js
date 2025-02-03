// constant values for background and popup
export const regions = [
    { id: "hokkaido-tohoku", name: "北海道・東北" },
    { id: "kanto", name: "関東" },
    { id: "hokuriku-koushinetsu", name: "北陸・甲信越" },
    { id: "chubu", name: "中部" },
    { id: "kinki", name: "近畿" },
    { id: "chugoku-shikoku", name: "中国・四国" },
    { id: "kyushu", name: "九州・沖縄" }];

//http://radiko.jp/v3/station/region/full.xml


//common.js
export const areaList = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];
// TODO: Firefox Only
export const areaSuffixList = ['', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '都', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '府', '府', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県', '県'];


// Only used for Firefox filterResponseData to pass area check API
// https://www.iso.org/obp/ui/#iso:code:3166:JP With language code: en
// Note: auth2 return KOUCHI instead of KOCHI
export const areaMap = { "JP1": "HOKKAIDO", "JP2": "AOMORI", "JP3": "IWATE", "JP4": "MIYAGI", "JP5": "AKITA", "JP6": "YAMAGATA", "JP7": "FUKUSHIMA", "JP8": "IBARAKI", "JP9": "TOCHIGI", "JP10": "GUNMA", "JP11": "SAITAMA", "JP12": "CHIBA", "JP13": "TOKYO", "JP14": "KANAGAWA", "JP15": "NIIGATA", "JP16": "TOYAMA", "JP17": "ISHIKAWA", "JP18": "FUKUI", "JP19": "YAMANASHI", "JP20": "NAGANO", "JP21": "GIFU", "JP22": "SHIZUOKA", "JP23": "AICHI", "JP24": "MIE", "JP25": "SHIGA", "JP26": "KYOTO", "JP27": "OSAKA", "JP28": "HYOGO", "JP29": "NARA", "JP30": "WAKAYAMA", "JP31": "TOTTORI", "JP32": "SHIMANE", "JP33": "OKAYAMA", "JP34": "HIROSHIMA", "JP35": "YAMAGUCHI", "JP36": "TOKUSHIMA", "JP37": "KAGAWA", "JP38": "EHIME", "JP39": "KOCHI", "JP40": "FUKUOKA", "JP41": "SAGA", "JP42": "NAGASAKI", "JP43": "KUMAMOTO", "JP44": "OITA", "JP45": "MIYAZAKI", "JP46": "KAGOSHIMA", "JP47": "OKINAWA" };

export const areaListParRegion = {
    'hokkaido-tohoku': [
        {
            id: 'JP1',
            name: '北海道'
        },
        {
            id: 'JP2',
            name: '青森'
        },
        {
            id: 'JP3',
            name: '岩手'
        },
        {
            id: 'JP4',
            name: '宮城'
        },
        {
            id: 'JP5',
            name: '秋田'
        },
        {
            id: 'JP6',
            name: '山形'
        },
        {
            id: 'JP7',
            name: '福島​'
        }
    ],
    'kanto': [
        {
            id: 'JP8',
            name: '茨城'
        },
        {
            id: 'JP9',
            name: '栃木'
        },
        {
            id: 'JP10',
            name: '群馬'
        },
        {
            id: 'JP11',
            name: '埼玉'
        },
        {
            id: 'JP12',
            name: '千葉'
        },
        {
            id: 'JP13',
            name: '東京'
        },
        {
            id: 'JP14',
            name: '神奈川'
        }
    ],
    'hokuriku-koushinetsu': [
        {
            id: 'JP15',
            name: '新潟'
        },
        {
            id: 'JP19',
            name: '山梨'
        },
        {
            id: 'JP20',
            name: '長野'
        },
        {
            id: 'JP17',
            name: '石川'
        },
        {
            id: 'JP16',
            name: '富山'
        },
        {
            id: 'JP18',
            name: '福井'
        }
    ],
    'chubu': [
        {
            id: 'JP23',
            name: '愛知'
        },
        {
            id: 'JP21',
            name: '岐阜'
        },
        {
            id: 'JP22',
            name: '静岡'
        },
        {
            id: 'JP24',
            name: '三重'
        }
    ],
    'kinki': [
        {
            id: 'JP27',
            name: '大阪'
        },
        {
            id: 'JP28',
            name: '兵庫'
        },
        {
            id: 'JP26',
            name: '京都'
        },
        {
            id: 'JP25',
            name: '滋賀'
        },
        {
            id: 'JP29',
            name: '奈良'
        },
        {
            id: 'JP30',
            name: '和歌山'
        }
    ],
    'chugoku-shikoku': [
        {
            id: 'JP33',
            name: '岡山'
        },
        {
            id: 'JP34',
            name: '広島'
        },
        {
            id: 'JP31',
            name: '鳥取'
        },
        {
            id: 'JP32',
            name: '島根'
        },
        {
            id: 'JP35',
            name: '山口'
        },
        {
            id: 'JP37',
            name: '香川'
        },
        {
            id: 'JP36',
            name: '徳島'
        },
        {
            id: 'JP38',
            name: '愛媛'
        },
        {
            id: 'JP39',
            name: '高知'
        }
    ],
    'kyushu': [
        {
            id: 'JP40',
            name: '福岡'
        },
        {
            id: 'JP41',
            name: '佐賀'
        },
        {
            id: 'JP42',
            name: '長崎'
        },
        {
            id: 'JP43',
            name: '熊本'
        },
        {
            id: 'JP44',
            name: '大分'
        },
        {
            id: 'JP45',
            name: '宮崎'
        },
        {
            id: 'JP46',
            name: '鹿児島'
        },
        {
            id: 'JP47',
            name: '沖縄'
        }
    ]
};


/*
from urllib.request import urlopen
import re,json
d = {}
footer = urlopen('https://radiko.jp/apps/js/footer/base.js').read().decode("utf-8")
radio_name=re.findall(r"{ id: ['\"](.*?)['\"], name: ['\"](.*?)['\"] }",footer)
for i in radio_name:
    radio = i[0]
    name = i[1]
    area = re.findall(r'/index/(JP\d*)/',re.findall('channel-detail-info__list.*?</ul>',urlopen('http://radiko.jp/index/'+radio).read().decode("utf-8"),re.S)[0],re.S)
    d[radio] = {"name":name, "area":area}
print(json.dumps(d,ensure_ascii=False))
*/
// update details refer to https://radiko.jp/#!/info/ and https://radiko.jp/#!/news_release
// TODO: ability to update runtime. however service worker doesn't support parsing dom/xml.
// Ref: https://radiko.jp/v3/station/region/full.xml
export const radioAreaId = { "HBC": { "name": "\uff28\uff22\uff23\u30e9\u30b8\u30aa", "area": ["JP1"] }, "STV": { "name": "\uff33\uff34\uff36\u30e9\u30b8\u30aa", "area": ["JP1"] }, "AIR-G": { "name": "AIR-G'\uff08FM\u5317\u6d77\u9053\uff09", "area": ["JP1"] }, "NORTHWAVE": { "name": "FM NORTH WAVE", "area": ["JP1"] }, "RAB": { "name": "\uff32\uff21\uff22\u9752\u68ee\u653e\u9001", "area": ["JP2"] }, "AFB": { "name": "\u30a8\u30d5\u30a8\u30e0\u9752\u68ee", "area": ["JP2"] }, "IBC": { "name": "IBC\u30e9\u30b8\u30aa", "area": ["JP3"] }, "FMI": { "name": "\u30a8\u30d5\u30a8\u30e0\u5ca9\u624b", "area": ["JP3"] }, "TBC": { "name": "TBC\u30e9\u30b8\u30aa", "area": ["JP4"] }, "DATEFM": { "name": "Date fm\uff08\u30a8\u30d5\u30a8\u30e0\u4ed9\u53f0\uff09", "area": ["JP4"] }, "ABS": { "name": "ABS\u30e9\u30b8\u30aa", "area": ["JP5"] }, "AFM": { "name": "\u30a8\u30d5\u30a8\u30e0\u79cb\u7530", "area": ["JP5"] }, "YBC": { "name": "YBC\u5c71\u5f62\u653e\u9001", "area": ["JP6"] }, "RFM": { "name": "Rhythm Station\u3000\u30a8\u30d5\u30a8\u30e0\u5c71\u5f62", "area": ["JP6"] }, "RFC": { "name": "RFC\u30e9\u30b8\u30aa\u798f\u5cf6", "area": ["JP7"] }, "FMF": { "name": "\u3075\u304f\u3057\u307eFM", "area": ["JP7"] }, "JOIK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u672d\u5e4c\uff09", "area": ["JP1"] }, "JOHK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u4ed9\u53f0\uff09", "area": ["JP2", "JP3", "JP4", "JP5", "JP6", "JP7"] }, "TBS": { "name": "TBS\u30e9\u30b8\u30aa", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "QRR": { "name": "\u6587\u5316\u653e\u9001", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "LFR": { "name": "\u30cb\u30c3\u30dd\u30f3\u653e\u9001", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "INT": { "name": "interfm", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "FMT": { "name": "TOKYO FM", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "FMJ": { "name": "J-WAVE", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "JORF": { "name": "\u30e9\u30b8\u30aa\u65e5\u672c", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "BAYFM78": { "name": "BAYFM78", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "NACK5": { "name": "NACK5", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "YFM": { "name": "\uff26\uff2d\u30e8\u30b3\u30cf\u30de", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "IBS": { "name": "LuckyFM \u8328\u57ce\u653e\u9001", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"] }, "CRT": { "name": "CRT\u6803\u6728\u653e\u9001", "area": ["JP9"] }, "RADIOBERRY": { "name": "RADIO BERRY", "area": ["JP9"] }, "FMGUNMA": { "name": "FM GUNMA", "area": ["JP10"] }, "JOAK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u6771\u4eac\uff09", "area": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP19", "JP20"] }, "BSN": { "name": "\uff22\uff33\uff2e\u30e9\u30b8\u30aa", "area": ["JP15"] }, "FMNIIGATA": { "name": "FM NIIGATA", "area": ["JP15"] }, "KNB": { "name": "\uff2b\uff2e\uff22\u30e9\u30b8\u30aa", "area": ["JP16"] }, "FMTOYAMA": { "name": "\uff26\uff2d\u3068\u3084\u307e", "area": ["JP16"] }, "MRO": { "name": "MRO\u30e9\u30b8\u30aa", "area": ["JP17"] }, "HELLOFIVE": { "name": "\u30a8\u30d5\u30a8\u30e0\u77f3\u5ddd", "area": ["JP17"] }, "FBC": { "name": "FBC\u30e9\u30b8\u30aa", "area": ["JP18"] }, "FMFUKUI": { "name": "FM\u798f\u4e95", "area": ["JP18"] }, "YBS": { "name": "YBS\u30e9\u30b8\u30aa", "area": ["JP19"] }, "FM-FUJI": { "name": "FM FUJI", "area": ["JP19"] }, "SBC": { "name": "SBC\u30e9\u30b8\u30aa", "area": ["JP20"] }, "FMN": { "name": "\uff26\uff2d\u9577\u91ce", "area": ["JP20"] }, "JOCK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u540d\u53e4\u5c4b\uff09", "area": ["JP16", "JP17", "JP18", "JP21", "JP22", "JP23", "JP24"] }, "CBC": { "name": "CBC\u30e9\u30b8\u30aa", "area": ["JP21", "JP23", "JP24"] }, "TOKAIRADIO": { "name": "TOKAI RADIO", "area": ["JP21", "JP23", "JP24"] }, "GBS": { "name": "\u304e\u3075\u30c1\u30e3\u30f3", "area": ["JP21", "JP23", "JP24"] }, "ZIP-FM": { "name": "ZIP-FM", "area": ["JP21", "JP23", "JP24"] }, "FMAICHI": { "name": "FM AICHI", "area": ["JP21", "JP23", "JP24"] }, "FMGIFU": { "name": "\uff26\uff2d \uff27\uff29\uff26\uff35", "area": ["JP21"] }, "SBS": { "name": "SBS\u30e9\u30b8\u30aa", "area": ["JP22"] }, "K-MIX": { "name": "K-MIX", "area": ["JP22"] }, "FMMIE": { "name": "\u30ec\u30c7\u30a3\u30aa\u30ad\u30e5\u30fc\u30d6 \uff26\uff2d\u4e09\u91cd", "area": ["JP24"] }, "ABC": { "name": "ABC\u30e9\u30b8\u30aa", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "MBS": { "name": "MBS\u30e9\u30b8\u30aa", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "OBC": { "name": "OBC\u30e9\u30b8\u30aa\u5927\u962a", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "CCL": { "name": "FM COCOLO", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "802": { "name": "FM802", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "FMO": { "name": "FM\u5927\u962a", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "CRK": { "name": "\u30e9\u30b8\u30aa\u95a2\u897f", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "KISSFMKOBE": { "name": "Kiss FM KOBE", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "E-RADIO": { "name": "e-radio FM\u6ecb\u8cc0", "area": ["JP25"] }, "KBS": { "name": "KBS\u4eac\u90fd\u30e9\u30b8\u30aa", "area": ["JP25", "JP26", "JP27"] }, "ALPHA-STATION": { "name": "\u03b1-STATION FM KYOTO", "area": ["JP25", "JP26", "JP27", "JP29"] }, "WBS": { "name": "wbs\u548c\u6b4c\u5c71\u653e\u9001", "area": ["JP30"] }, "JOBK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u5927\u962a\uff09", "area": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"] }, "BSS": { "name": "BSS\u30e9\u30b8\u30aa", "area": ["JP31", "JP32"] }, "FM-SANIN": { "name": "\u30a8\u30d5\u30a8\u30e0\u5c71\u9670", "area": ["JP31", "JP32"] }, "RSK": { "name": "\uff32\uff33\uff2b\u30e9\u30b8\u30aa", "area": ["JP33"] }, "FM-OKAYAMA": { "name": "\uff26\uff2d\u5ca1\u5c71", "area": ["JP33"] }, "RCC": { "name": "RCC\u30e9\u30b8\u30aa", "area": ["JP34"] }, "HFM": { "name": "\u5e83\u5cf6FM", "area": ["JP34"] }, "KRY": { "name": "\uff2b\uff32\uff39\u5c71\u53e3\u653e\u9001", "area": ["JP35"] }, "FMY": { "name": "\u30a8\u30d5\u30a8\u30e0\u5c71\u53e3", "area": ["JP35"] }, "JRT": { "name": "\uff2a\uff32\uff34\u56db\u56fd\u653e\u9001", "area": ["JP36"] }, "FM807": { "name": "FM\u5fb3\u5cf6", "area": ["JP36"] }, "RNC": { "name": "RNC\u897f\u65e5\u672c\u653e\u9001", "area": ["JP37"] }, "FMKAGAWA": { "name": "FM\u9999\u5ddd", "area": ["JP37"] }, "RNB": { "name": "RNB\u5357\u6d77\u653e\u9001", "area": ["JP38"] }, "JOEU-FM": { "name": "FM\u611b\u5a9b", "area": ["JP38"] }, "RKC": { "name": "RKC\u9ad8\u77e5\u653e\u9001", "area": ["JP39"] }, "HI-SIX": { "name": "\u30a8\u30d5\u30a8\u30e0\u9ad8\u77e5", "area": ["JP39"] }, "JOFK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u5e83\u5cf6\uff09", "area": ["JP31", "JP32", "JP33", "JP34", "JP35"] }, "JOZK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u677e\u5c71\uff09", "area": ["JP36", "JP37", "JP38", "JP39"] }, "RKB": { "name": "RKB\u30e9\u30b8\u30aa", "area": ["JP40", "JP41"] }, "KBC": { "name": "KBC\u30e9\u30b8\u30aa", "area": ["JP40", "JP41"] }, "LOVEFM": { "name": "LOVE FM", "area": ["JP40"] }, "CROSSFM": { "name": "CROSS FM", "area": ["JP40"] }, "FMFUKUOKA": { "name": "FM FUKUOKA", "area": ["JP40"] }, "FMS": { "name": "\u30a8\u30d5\u30a8\u30e0\u4f50\u8cc0", "area": ["JP41"] }, "NBC": { "name": "NBC\u30e9\u30b8\u30aa", "area": ["JP41", "JP42"] }, "FMNAGASAKI": { "name": "FM\u9577\u5d0e", "area": ["JP42"] }, "RKK": { "name": "RKK\u30e9\u30b8\u30aa", "area": ["JP43"] }, "FMK": { "name": "FMK\u30a8\u30d5\u30a8\u30e0\u718a\u672c", "area": ["JP43"] }, "OBS": { "name": "OBS\u30e9\u30b8\u30aa", "area": ["JP44"] }, "FM_OITA": { "name": "\u30a8\u30d5\u30a8\u30e0\u5927\u5206", "area": ["JP44"] }, "MRT": { "name": "\u5bae\u5d0e\u653e\u9001", "area": ["JP45"] }, "JOYFM": { "name": "\u30a8\u30d5\u30a8\u30e0\u5bae\u5d0e", "area": ["JP45"] }, "MBC": { "name": "\uff2d\uff22\uff23\u30e9\u30b8\u30aa", "area": ["JP46"] }, "MYUFM": { "name": "\u03bc\uff26\uff2d", "area": ["JP46"] }, "RBC": { "name": "RBCi\u30e9\u30b8\u30aa", "area": ["JP47"] }, "ROK": { "name": "\u30e9\u30b8\u30aa\u6c96\u7e04", "area": ["JP47"] }, "FM_OKINAWA": { "name": "FM\u6c96\u7e04", "area": ["JP47"] }, "JOLK": { "name": "NHK\u30e9\u30b8\u30aa\u7b2c1\uff08\u798f\u5ca1\uff09", "area": ["JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"] }, "RN1": { "name": "\u30e9\u30b8\u30aaNIKKEI\u7b2c1", "area": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"] }, "RN2": { "name": "\u30e9\u30b8\u30aaNIKKEI\u7b2c2", "area": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"] }, "JOAK-FM": { "name": "NHK-FM\uff08\u6771\u4eac\uff09", "area": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"] } }
// For calcuating RULEID
export const radioIndex = Object.keys(radioAreaId)