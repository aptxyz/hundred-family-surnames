<template>

  <div id="app">

    <header>
      <h1>{{ title }}</h1>
      <h2>{{ titleEn }}</h2>
      <a :href="href('hundred-family-surnames.pdf')">pdf</a>
    </header>

    <content class="masterBox" ref="masterBox" @wheel.passive="wheel">

      <div class="groupBox flagBox">
        <span class="itemBox itemBox1">🏳️</span>
        <div v-for="region in regions" :key="region" class="itemBox">
            <img v-if="windows" :src="href(region + '.png')" :title="description[region]" />
            <span v-else :title="description[region]">{{ ascii(region) }}</span>
            <span>&nbsp;{{ descriptionEn[region] + ' ' + description[region] }}</span>
        </div>
      </div>

      <div v-for="(surnames, AtoZ) in en" :key="'AtoZ' + AtoZ" class="groupBox">




        <div class="itemBox itemBox1">{{AtoZ}}</div>
        <div :key="surname" v-for="(regions, surname) in surnames" class="itemBox surnameBox">

          <span class="surname" >{{ surname }}&nbsp;&nbsp;</span>
          <div class="regionBox">
            <div :key="surname + '-' + index" v-for="(group,index) in regions" class="region">
              <template v-for="region in group[0]">
                <!-- 該死的 windows 不支持 Regional Indicator Symbol ，都 9102 年了還是兩個英文字母。 -->
                <img v-if="windows" :key="surname + '-' + region" :src="href(region + '.png')" :title="description[region]" />
                <span v-else :key="surname + '-' + region + 'Txt'" :title="description[region]">{{ ascii(region) }}</span>
              </template>
              &nbsp;{{ group[1] }}
            </div>
          </div>

        </div>

      </div>

      <!-- <div class="groupBox enText">
        <template  v-for="(value, surname) in enText">
          <br :key="surname" />
          {{surname}} {{joinString(value.hkmo)}}|{{joinString(value.cntw)}}|{{joinString(value.sgmy)}}
        </template>
      </div>

      <pre class="groupBox message">{{message}}</pre>
      <div class="groupBox sign">{{sign}}</div> -->
      <div class="groupBox credit">Data From / 數據來自 <a :href="url" :title="credit">{{credit}}</a></div>


      

    </content>

  </div>

</template>

<script>

console.log(process.env);

import csv from "!raw-loader!./assets/data.csv";

let raw = csv.split(/\r\n/g);
let regions = raw[0].split(",");
let list = {
  code: {
    zh: 0,
    cn: 1,
    tw: 2,
    hk: 3,
    mo: 4,
    sg: 5,
    my: 6,
    vn: 7,
    ko: 8,
    jp2: 9,
    jp: 10,
  },
  description: {
    zh: "漢字",
    cn: "中國",
    tw: "台灣",
    hk: "香港",
    mo: "澳門",
    sg: "新加坡",
    my: "馬來西亞",
    vn: "越南",
    ko: "韓國",
    jp2: "琉球",
    jp: "日本",
    sgmy: "馬新",
    cntw: "中台",
    hkmo: "港澳",
  },
  descriptionEn: {
    zh: "Character",
    cn: "China",
    tw: "Taiwan",
    hk: "Hong Kong",
    mo: "Macau",
    sg: "Singapore",
    my: "Malaysia",
    vn: "Vietnam",
    ko: "Korea",
    jp2: "Japan",
    jp: "Japan",
    sgmy: "Singapore-Malaysia",
    cntw: "China-Taiwan",
    hkmo: "Hong Kong-Macau",
  },
  en: {},
  enText: {},
  zh: {}
  
}

for (let i = 2; i < raw.length; i++) {

  let line = raw[i];
  line = line.split(/,/g);
  line.forEach((value,index) => {
      line[index] = value.split(/\//g);
  });
  
  let zh = line[0][0];
  let zhData = list.zh[zh] = {};

  regions.forEach((region,index) => {

    let items = line[index];

    switch (region) {
      
      case 'zh': 

        if (items[0].length) zhData.zh = items;
        break;

      case 'vn':
      case 'ko':
      case 'jp':
      case 'jp2':

        break;

      default: 

        items.forEach( en => {

          en = en.trim();

          if (en) {
            
            en = en[0].toUpperCase() + en.slice(1);

            let enData = list.en[en] = list.en[en] || {};
            enData = enData[region] = enData[region] || [];
            if (enData.indexOf(zh) == -1) enData.push(zh);

            // combine region by language ===> list.enText
            let regionText;
            if (region.match(/^(my|sg)$/)) regionText = "sgmy";
            if (region.match(/^(cn|tw)$/)) regionText = "cntw";
            if (region.match(/^(mo|hk)$/)) regionText = "hkmo";
            let enDataText = list.enText[en] = list.enText[en] || {};
            enDataText = enDataText[regionText] = enDataText[regionText] || [];
            if (enDataText.indexOf(zh) == -1) enDataText.push(zh);

          }

        })
      
    }

  })

}
// sort list.en object key, ignore case
let ordered = {
  A: {}, B: {}, C: {}, D: {}, E: {}, F: {}, G: {}, H: {}, I: {}, J: {}, K: {}, L: {}, M: {},
  N: {}, O: {}, P: {}, Q: {}, R: {}, S: {}, T: {}, U: {}, V: {}, W: {}, X: {}, Y: {}, Z: {}
};
Object.keys(list.en).sort().forEach(key => {
  let alphabet = key[0];
  ordered[alphabet][key] = list.en[key];
});
list.en = ordered;
ordered = {};
Object.keys(list.enText).sort().forEach(key => {
  ordered[key] = list.enText[key];
});
list.enText = ordered;

// ["a","b","c","d"] => "abcd"
for (let AtoZ in list.en) {
  for (let surname in list.en[AtoZ]) {

    let regions = list.en[AtoZ][surname];

    for (let region in regions) {

      regions[region] = regions[region].sort().join("");

    }

    let sorted = [];

    ['cn','tw','hk','mo','sg','my'].forEach( region => {

      let surnameZh = regions[region];
      let last = sorted[sorted.length-1];
      
      if      ( surnameZh && last && last[1] == regions[region] ) { last[0].push(region); }
      else if ( surnameZh )                                       { sorted.push([[region],surnameZh]); }

    });
   
   list.en[AtoZ][surname] = sorted;

  }

}

export default {
  name: "app",
  data: function() {
    return {
      title: "百家姓英中對照表",
      titleEn: "Chinese Surnames Translation",
      credit: "唸經堂",
      url: "https://www.ifreesite.com/scriptures/hundred-family-surnames-01.htm",
      message: decodeURIComponent(escape(window.atob("4oCU4oCU4oCU4oCU5q+P5YCL6Lyq5a2Q6IOM5b6M6YO95pyJ5LiA5YCL5oKy5YK355qE5pWF5LqL77yMCuaIkeWRgO+8jOS4iuWAi+aYn+acn+WcqOWJm+WFpeiBt+Wkp+amguS4ieWAi+aYn+acn+eahOmbu+ipseeHn+mKt+WFrOWPuOi+reiBt+S6hu+8jArog4zlvozlj4jmmK/kuIDlgIvmlYXkuovvvIzpgJnoo4/kuI3kvZzmt7Hoq4fjgIIKCuaIkeeahOiBt+iyrOaYr+Wuo+aYjuacg+e1puaIkeWAkeS4gOWAi+a4heWWru+8jOaIkeS7peS4reaWh+aJk+e1pua9m+WcqOWKqemkiuiAhe+8jArlkbznsbLku5blgJHliqnppIrnlJjogoXnnIHlpKnmsLTmrablsbHnmoTosqflm7DlsI/lranvvIwK5Yqp6aSK6ICF5ZKM5Yqp6aSK5bCP5a2p6YO95Y+q5piv57Wm5LiA5YCL6Iux5paH5ZCN5a2X77yMCuWuo+aYjuacg+aykuacieaPkOS+m+WwjeaWueeahOa8ouWtl+Wnk+WQjeOAggoK6YKj6bq85ZWP6aGM5bCx5L6G5LqG77yM6YCZ6KOP57Wm5YCL5L6L5a2Q77yMQ2h1IOWnk+S9oOipsuaAjum6vOirl++8jArkuI3mn6XkuI3nn6XpgZPvvIzkuIDmn6XlmofkuIDot7PvuZUKCiAg5Lit5Y+w77mV6KSa44CB5pyx44CB5bGI44CB56Wd44CB6Ku444CB6bq044CB5YSy44CB55Kp44CB556/44CB5bGF44CB6Z6g44CB56u644CB5qWaCiAg5riv5r6z77mV6KSa44CB5pyx44CB6Ku444CB5YSyCiAg6aas5paw77mV5pyx44CB5pu544CB6YSSCgroqqrnm7Tnmb3nmoTvvIzmiJHmspLovqjms5XmuIXlh7rlsI3mlrnnmoTlp5PmsI/mgI7purznlKjkuK3mlofoq5fvvIwK5L2V5rOB5a6j5piO5pyD5rKS5pyJ5o+Q5L6b5Yqp6aSK6ICF55qE6Kqe6KiA77yMCuaIkeS4jeefpemBk+ipsueUqOaZrumAmuipsemChOaYr+eyteiqnuS+hui3n+WwjeaWuea6nemAmu+8jArmiJHog73lpKDmoLnmk5roi7HmloflkI3lrZfnjJzlh7rlgIvlpKfmpoLvvIzmr5TlpoLmoLnmk5rlkI3lrZfmmK/mi7zpn7PmiJbnsrXmi7zkuYvpoZ7nmoTvvIwK5L2G55m+5a625aeT57SE5LqU55m+5YCL5aeT5rCP5a+m5Zyo5aSq5aSa77yMCuaIkeacrOi6q+S4jeaHgueyteaLvO+8jOaLvOmfs+S5n+WPquacieWNiuahtuawtOeahOaZuuitmO+8jArmm7TliqDliKXoqqrppqzkvobopb/kup7mlrDliqDnjrvpn5PlnIvkuYvpoZ7nmoTlkI3lrZfvvIznnIvnnYDlpoLlkIzlpKnmm7jjgIIKCuaIkeimuuW+l+WFrOWPuOWSjOWuo+aYjuacg+amgueEtuimgeaxguaIkeS7peS4reaWh+WSjOWwjeaWuea6nemAmu+8jArpgqPpurzmiJHog73lpKDku6XjgIzmlr3lhYjnlJ/kvaDlpb3jgI3kvZzngrrplovloLTnmb3vvIwK5piv5L2c54K65bCN5oiR5ZKM5Yqp6aSK6ICF55qE5pyA5Z+65pys5bCK6YeN5ZCn77yMCuWPr+aDnOaIkeeci+WIsOS7luWnkyBTemUg5pmC77yM5Lul54K65piv6KydIFRzZe+8jArkvr/nqLHlkbzlsI3mlrnjgIzorJ3lhYjnlJ/kvaDlpb3jgI3vvIzlubjlpb3lsI3mlrnlj6rmmK/mm7TmraPkuIDkuIvku5blp5Pmlr3vvIwK5rKS5pyJ5aSa5L2c55Sf5rCj44CCCgrlpJblnIvlhazlj7jkuI3nkIbop6PmiJHlgJHoj6/kurrnmoTpm6PomZXvvIwK5L6/6Ieq5bex5YuV5omL44CB6LGQ6KGj6Laz6aOf5ZCn77yMCuaDs+iqquS4iue2suaJvuaJvuacieaykuacieiLseS4reWwjeeFp+ihqO+8jArmib7lh7rkvoblhajmmK/kuK3oi7HlsI3nhafooajvvIzmspLmnInliY3kurrlgZrpgY7nm7jpl5znmoTlt6XkvZzvvIwK5oiW6ICF5oiRIEdvb2dsZSDmioDog73mspLpu57mu7/vvIwK5L6/5YuV5LqG5oSP6KuX5Yi25L2c5q2k6Iux5Lit5bCN54Wn6KGo77yMCuWPl+ecvuS4u+imgeaYr+e1pumcgOimgeS7peS4reaWh+WSjOa1t+WkluiPr+S6uua6nemAmuaZgueahOW3peWFt++8jArog73lpKDmoLnmk5rlsI3mlrnnmoToi7HmloflkI3lrZfnjJzlh7rlsI3mlrnlp5PmsI/nmoTmvKLlrZflkozoqp7oqIDvvIwK5rib5bCR5LiA5LiL5paH5YyW6KGd56qB77yMCuekvuacg+aViOaHieW+ruS5juWFtuW+ruWQp++8jOS9huWJm+WlveacgOi/keaDs+WtuCB2dWVqcyDvvIwK5bCx5ou/6YCZ5YCL57e05omL5LqG44CC"))),
      sign: "─豪　２０１９年３月３１日",
      en: list.en,
      enText: list.enText,
      zh: list.zh,
      description: list.description,
      descriptionEn: list.descriptionEn,
      regions: ['cn','tw','hk','mo','sg','my'],
      windows: navigator.appVersion.match('Win'),
    }
  },
  methods: {
    ascii(region) {
      switch (region) {
        case "cn": return "🇨🇳";
        case "tw": return "🇹🇼";
        case "hk": return "🇭🇰";
        case "mo": return "🇲🇴";
        case "sg": return "🇸🇬";
        case "my": return "🇲🇾";
      }
    },
    joinString(value) {
      value = value || [""];
      return value.join("");
    },
    wheel (event) {
      this.$refs.masterBox.scrollLeft += event.deltaY * 2.5;
    },
    href (url) {
      return process.env.BASE_URL + url;
    }
  },

}

</script>
















<style>

/* default css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-size: 14px;
}
html, body, #app {
  height: 100%;
  width: 100%;
}

.groupBox:nth-of-type(odd)          {background: rgba(0,0,255,0.05);}
.groupBox:nth-of-type(even)         {background: rgba(0,0,255,0.10);}
.groupBox:hover                     {background: rgba(0,0,255,0.15);}
.groupBox > .itemBox:hover, header > *:hover {background: rgba(255,0,0,0.15);}

#app > header     {height: 3em;}
#app > .masterBox {height: calc(100% - 3em);}

#app > header {

  display: flex;
  flex-flow: row nowrap;
  
}
header > * {

  padding: 0.25em 1em;
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: center;

}
header > h1, header > h2 {
  flex: 5 1 auto;
  font-size: 1.5em;
}
header > a {
  flex: 1 1 3em;
}
@media only screen and (max-width: 640px) {
  header > h1 { display: none; }
  header > h2 { font-size: 1em; }
}

.masterBox {

  display: flex;
  flex-flow: row nowrap;
  overflow-x: auto;
  overflow-y: hidden;

}
.groupBox {
  flex-grow: 1;
  display: flex;
  flex-flow: row wrap;
  writing-mode: vertical-lr;
  
}
.itemBox {
  writing-mode: horizontal-tb;
  padding: 0.75em 1em;
}
.itemBox1 {
  text-align: center;
  padding: 0.1em;
  font-size: 4em;
  font-weight: 800;
}
.flagBox > .itemBox1 {
  font-size: 3.5em;
}
.flagBox > .itemBox > span {
  font-weight: 800;
}
.surnameBox {
  display: flex;
}
.surnameBox > .surname {
  font-weight: 800;
}
.surnameBox > .regionBox {
  display: flex;
  flex-flow: column nowrap;
}
.surnameBox > .regionBox > .region {
  display: flex;
}
.itemBox > img,
.surnameBox > .regionBox > .region > img {
  width: 1em;
  height: 1em;
}

.message, .enText {
  padding: 3em;
}
.sign, .credit {
  padding: 3em 1em;
  justify-content: flex-end;
}
.enText {
  padding: 3em;
  writing-mode: horizontal-tb;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 500px;
}


a, a:visited {
  color: SteelBlue;
  text-decoration: none;
}
a:active, a:focus, a:hover {
  color: LightCoral;
  text-decoration: underline;
  
}

</style>
