const regions = [
    { id: "hokkaido-tohoku", name: "北海道・東北" },
    { id: "kanto", name: "関東" },
    { id: "hokuriku-koushinetsu", name: "北陸・甲信越" },
    { id: "chubu", name: "中部" },
    { id: "kinki", name: "近畿" },
    { id: "chugoku-shikoku", name: "中国・四国" },
    { id: "kyushu", name: "九州・沖縄" }];

//http://radiko.jp/v3/station/region/full.xml


//common.js
const areaList = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];


const areaListParRegion = {
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
d = {}
footer = requests.get('http://radiko.jp/apps/templates/common/footer.html').content
radioname = list(set(re.findall('/index/(.*)"',footer)) - set(re.findall('/index/(JP\d*)',footer)))
for i in radioname:
    d[i]=re.findall('/index/(JP\d*)/',re.findall('channel-detail-info__list.*?</ul>',requests.get('http://radiko.jp/index/'+i).content,re.S)[0],re.S)
d.keys()
json.dumps(d)
*/
//update at 2018-04-12 : see http://radiko.jp/newsrelease/pdf/20180322_001_pressrelease.pdf
const radioId =['ALPHA-STATION', 'HBC', 'CCL', 'FMAICHI', 'BAYFM78', 'FM-FUJI', 'RAB', 'JOAK-FM', 'JOLK', 'FMNAGASAKI', 'FMGUNMA', 'JOIK', 'MRT', 'K-MIX', 'KNB', 'TOKAIRADIO', 'MRO', 'HELLOFIVE', 'CROSSFM', 'FMNIIGATA', 'RKK', 'INT', 'CRT', 'YBS', 'RADIOBERRY', 'AIR-G', 'RN1', 'YBC', 'JOBK', 'ROK', 'RADIONEO', 'KBC', 'FMKAGAWA', 'KBS', 'FMFUKUOKA', 'AFB', 'NORTHWAVE', 'RFC', 'CRK', 'JOCK', 'CBC', 'RNC', 'RNB', 'TBS', 'JORF', 'JOZK', 'TBC', 'E-RADIO', 'HFM', 'FMTOYAMA', 'FMMIE', 'BSS', 'BSN', 'LFR', 'NBC', 'JOHK', 'KRY', 'FMY', 'FMT', 'OBC', 'FMN', 'FMO', 'FMJ', 'FMK', 'FMI', 'FMF', 'JOAK', 'OBS', 'FM_OITA', 'SBS', 'FBC', 'SBC', 'JRT', 'KISSFMKOBE', 'DATEFM', 'GBS', 'WBS', 'IBC', 'JOFK', 'NACK5', 'IBS', 'RCC', 'YFM', 'ZIP-FM', 'MBC', 'QRR', 'RKB', 'RKC', 'MBS', 'FM_OKINAWA', 'ABC', 'JOEU-FM', 'STV', 'ABS', 'RN2', 'LOVEFM', 'RBC', 'JOAB', 'RSK', 'HOUSOU-DAIGAKU', 'FMGIFU', 'FMPORT', 'MYUFM', '802'];
const radioAreaId = {"ALPHA-STATION": ["JP26"], "HBC": ["JP1"], "CCL": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "FMAICHI": ["JP21", "JP23", "JP24"], "BAYFM78": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "FM-FUJI": ["JP19"], "RAB": ["JP2"], "JOAK-FM": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "JOLK": ["JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "FMNAGASAKI": ["JP42"], "FMGUNMA": ["JP10"], "JOIK": ["JP1"], "MRT": ["JP45"], "K-MIX": ["JP22"], "KNB": ["JP16"], "TOKAIRADIO": ["JP21", "JP23", "JP24"], "MRO": ["JP17"], "HELLOFIVE": ["JP17"], "CROSSFM": ["JP40"], "FMNIIGATA": ["JP15"], "RKK": ["JP43"], "INT": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "CRT": ["JP9"], "YBS": ["JP19"], "RADIOBERRY": ["JP9"], "AIR-G": ["JP1"], "RN1": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "YBC": ["JP6"], "JOBK": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "ROK": ["JP47"], "RADIONEO": ["JP21", "JP23", "JP24"], "KBC": ["JP40"], "FMKAGAWA": ["JP37"], "KBS": ["JP25", "JP26"], "FMFUKUOKA": ["JP40"], "AFB": ["JP2"], "NORTHWAVE": ["JP1"], "RFC": ["JP7"], "CRK": ["JP26", "JP27", "JP28"], "JOCK": ["JP16", "JP17", "JP18", "JP21", "JP22", "JP23", "JP24"], "CBC": ["JP21", "JP23", "JP24"], "RNC": ["JP37"], "RNB": ["JP38"], "TBS": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "JORF": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "JOZK": ["JP36", "JP37", "JP38", "JP39"], "TBC": ["JP4"], "E-RADIO": ["JP25"], "HFM": ["JP34"], "FMTOYAMA": ["JP16"], "FMMIE": ["JP24"], "BSS": ["JP31", "JP32"], "BSN": ["JP15"], "LFR": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "NBC": ["JP42"], "JOHK": ["JP2", "JP3", "JP4", "JP5", "JP6", "JP7"], "KRY": ["JP35"], "FMY": ["JP35"], "FMT": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "OBC": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "FMN": ["JP20"], "FMO": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "FMJ": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "FMK": ["JP43"], "FMI": ["JP3"], "FMF": ["JP7"], "JOAK": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP19", "JP20"], "OBS": ["JP44"], "FM_OITA": ["JP44"], "SBS": ["JP22"], "FBC": ["JP18"], "SBC": ["JP20"], "JRT": ["JP36"], "KISSFMKOBE": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "DATEFM": ["JP4"], "GBS": ["JP21", "JP23", "JP24"], "WBS": ["JP30"], "IBC": ["JP3"], "JOFK": ["JP31", "JP32", "JP33", "JP34", "JP35"], "NACK5": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "IBS": ["JP8"], "RCC": ["JP34"], "YFM": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "ZIP-FM": ["JP21", "JP23", "JP24"], "MBC": ["JP46"], "QRR": ["JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14"], "RKB": ["JP40"], "RKC": ["JP39"], "MBS": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "FM_OKINAWA": ["JP47"], "ABC": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"], "JOEU-FM": ["JP38"], "STV": ["JP1"], "ABS": ["JP5"], "RN2": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "LOVEFM": ["JP40"], "RBC": ["JP47"], "JOAB": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "RSK": ["JP33"], "HOUSOU-DAIGAKU": ["JP1", "JP2", "JP3", "JP4", "JP5", "JP6", "JP7", "JP8", "JP9", "JP10", "JP11", "JP12", "JP13", "JP14", "JP15", "JP16", "JP17", "JP18", "JP19", "JP20", "JP21", "JP22", "JP23", "JP24", "JP25", "JP26", "JP27", "JP28", "JP29", "JP30", "JP31", "JP32", "JP33", "JP34", "JP35", "JP36", "JP37", "JP38", "JP39", "JP40", "JP41", "JP42", "JP43", "JP44", "JP45", "JP46", "JP47"], "FMGIFU": ["JP21"], "FMPORT": ["JP15"], "MYUFM": ["JP46"], "802": ["JP25", "JP26", "JP27", "JP28", "JP29", "JP30"]};