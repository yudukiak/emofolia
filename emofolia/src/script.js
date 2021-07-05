window.onload = _ => {
  const target = document.getElementById('__nuxt')
  const observer = new MutationObserver(records => {
    const ccfolia = document.getElementById('ccfolia')
    if (ccfolia && !/view/.test(location.href)) ccfolia.remove()
    if (ccfolia || !/view/.test(location.href)) return
    const ccfoliaButton = document.createElement('button')
    ccfoliaButton.id = 'ccfolia'
    ccfoliaButton.className = 'ml-2 px-2 my-1 v-btn theme--light elevation-0 v-size--small error'
    const ccfoliaSpan = document.createElement('span')
    ccfoliaSpan.className = 'v-btn__content'
    ccfoliaSpan.textContent = 'ココフォリア駒出力'
    ccfoliaButton.appendChild(ccfoliaSpan)
    document.querySelector('#app > div.v-application--wrap > header > div > div').appendChild(ccfoliaButton)
    ccfoliaButton.addEventListener('click', _ => buttonClick())
  })
  observer.observe(target, {
    childList: true
  })
  const buttonClick = _ => {
    const inputOptions = {
      'initiative': '通常',
      'speed': '地上',
      'dive': '空中・水中',
      'debate': '議論',
      'money': 'マネーゲーム',
      'live': 'ライブ'
    }
    Swal.fire({
      input: 'select',
      inputOptions: inputOptions,
      inputValue: 'initiative',
      showCancelButton: true,
      confirmButtonText: 'ココフォリア駒出力',
      cancelButtonText: 'キャンセル',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve()
        })
      }
    }).then((result) => {
      if (result.value) {
        const value = result.value
        const character = getCharacter(value)
        console.log('character', character)
        const json = JSON.stringify(character)
        const textarea = document.createElement('textarea')
        textarea.textContent = json
        const body = document.getElementsByTagName('body')[0]
        body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        body.removeChild(textarea)
        Swal.fire({
          icon: 'success',
          html: `イニシアチブ「${inputOptions[value]}」<br>でコピーしました！`
        })
      }
    })
  }
  /**
   * 能力値を返す
   * [身体, 器用, 精神, 五感, 知力, 魅力, 社会, 運勢]
   * [Number, Number, Number, Number, Number, Number, Number, Number]
   * @return {Array}
   */
  const getStatus = _ => {
    let status = []
    const selectorStatus = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.v-card.v-sheet.theme--light > div > div.mt-4.col-sm-12.col-md-7.col-lg-7.col-12 > div.ml-0.ma-3.v-card.v-sheet.theme--light.elevation-1 > div > div > table > tbody > tr > td'
    const elementsStatus = document.querySelectorAll(selectorStatus)
    for (let i = 0, n = elementsStatus.length; i < n; i++) {
      const element = elementsStatus[i]
      const label = element.textContent
      status.push(Number(label))
    }
    return status
  }
  /**
   * 技能を返す
   * [['技能名', レベル, 判定値]]
   * [[String, Number, Number]...]
   * @return {Array}
   */
  const getSkills = _ => {
    let skills = []
    const selector = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.row > div.col-sm-12.col-md-8.col-lg-8.col-12 > div > div > div > div.v-expansion-panel.pt-1.v-expansion-panel--active.v-item--active > div > div > div.row > div > div > table > tbody > tr'
    const elements = document.querySelectorAll(selector)
    for (let i = 0, n = elements.length; i < n; i++) {
      const element = elements[i]
      const label = element.querySelector('td.pa-1.pl-5.text-h6 > div').textContent
      const level2 = element.querySelector('td:nth-child(2) > div > button:nth-child(2)').className
      const level3 = element.querySelector('td:nth-child(2) > div > button:nth-child(3)').className
      const level = (/grey/.test(level2)) ? 1 : (/grey/.test(level3)) ? 2 : 3
      const value = element.querySelector('td:nth-child(4) > div > div > div > div > input').value
      const skill = [label, Number(level), Number(value)]
      skills.push(skill)
    }
    const status = getStatus()
    skills.push(['＊調査', 1, status[1]])
    skills.push(['＊知覚', 1, status[3]])
    skills.push(['＊交渉', 1, status[5]])
    skills.push(['＊知識', 1, status[4]])
    skills.push(['＊ニュース', 1, status[6]])
    skills.push(['＊運動', 1, status[0]])
    skills.push(['＊格闘', 1, status[0]])
    skills.push(['＊投擲', 1, status[1]])
    skills.push(['＊生存', 1, status[0]])
    skills.push(['＊自我', 1, status[2]])
    skills.push(['＊手当て', 1, status[4]])
    skills.push(['＊細工', 1, status[1]])
    skills.push(['＊幸運', 1, status[7]])
    return skills
  }
  /**
   * イニシアチブを返す
   * {通常, 地上, 空中・水中, 議論, マネーゲーム, ライブ}
   * {'initiative': Number, 'speed': Number, 'dive': Number, 'debate': Number, 'money': Number, 'live': Number}
   * @return {Object}
   */
  const getInitiatives = _ => {
    const status = getStatus()
    const initiative = status[0]
    const speed = status[0] + getSkillLevel('スピード')
    const dive = status[0] + getSkillLevel('ダイブ')
    const debate = status[4] + getSkillLevel('ディベート')
    const money = status[6]
    const live = status[5]
    const initiatives = {
      'initiative': initiative,
      'speed': speed,
      'dive': dive,
      'debate': debate,
      'money': debate,
      'live': debate
    }
    return initiatives
  }
  /**
   * 特定の技能レベルを返す
   * @param {String} 技能名
   * @return {Number} 技能レベル
   */
  const getSkillLevel = skillName => {
    const skills = getSkills()
    for (let i = 0, n = skills.length; i < n; i++)
      if (skillName === skills[i][0]) return skills[i][1]
    return 0
  }
  /**
   * キャラクター名を返す
   * @return {String}
   */
  const getName = _ => {
    const selector = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.v-card.v-sheet.theme--light > div > div.mt-4.col-sm-12.col-md-7.col-lg-7.col-12 > div.text-left.text-lg-h2.text-md-h3.text-h4.pl-3'
    const nameElement = document.querySelector(selector)
    nameElement.querySelector('.text-h4').innerHTML = ''
    const text = nameElement.textContent
    return text
  }
  /**
   * メモ（PC読み方、PL記入箇所、表、裏、ルーツ）を返す
   * @return {String}
   */
  const getMemo = _ => {
    const selectorKana = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.v-card.v-sheet.theme--light > div > div.mt-4.col-sm-12.col-md-7.col-lg-7.col-12 > div.text-left.text-h5.pl-2'
    const kana = document.querySelector(selectorKana).textContent
    const selectorFront = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.row > div.col-sm-12.col-md-4.col-lg-4.col-12 > div:nth-child(2) > div > div > div:nth-child(1) > div'
    const front = document.querySelector(selectorFront).textContent
    const selectorBack = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.row > div.col-sm-12.col-md-4.col-lg-4.col-12 > div:nth-child(2) > div > div > div:nth-child(2) > div'
    const back = document.querySelector(selectorBack).textContent
    const selectorRoots = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.row > div.col-sm-12.col-md-4.col-lg-4.col-12 > div:nth-child(2) > div > div > div:nth-child(3) > div'
    const roots = document.querySelector(selectorRoots).textContent
    const text = `PC　${kana}\nPL　\n\n表　${front}\n裏　${back}\nル　${roots}`
    return text
  }
  /**
   * 共鳴値を返す
   * @return {Number}
   */
  const getResonance = _ => {
    const selector = '#app > div.v-application--wrap > main > div > div > div > div.row > div > div > div > div > div > div > div.row > div.col-sm-12.col-md-4.col-lg-4.col-12 > div:nth-child(3) > div > div > div:nth-child(2) > div > div > div.v-input__slot > div > input'
    const value = document.querySelector(selector).value
    return value
  }
  /**
   * キャラクターオブジェクトを返す
   * @param {String} イニシアチブ名
   * @return {Object} キャラクターオブジェクト
   */
  const getCharacter = initiativeTarget => {
    const status = getStatus()
    const hp = status[0] + 10
    const mp = status[2] + status[4]
    const skills = getSkills() // [['技能名', レベル, 判定値]]
    const commands = (() => {
      let cmd = '{共鳴}DM<= 〈∞共鳴〉'
      for (let i = 0, n = skills.length; i < n; i++) {
        const a = skills[i][0]
        const b = skills[i][1]
        const c = skills[i][2]
        cmd += `\n${b}DM<=${c} 〈${a}〉`
      }
      return cmd
    })()
    const initiatives = getInitiatives()
    const initiative = initiatives[initiativeTarget]
    const object = {
      'kind': 'character',
      'data': {
        'name': getName(),
        'memo': getMemo(),
        'initiative': initiative,
        'externalUrl': location.href,
        'commands': commands,
        'status': [{
            'label': 'HP',
            'value': hp,
            'max': hp
          },
          {
            'label': 'MP',
            'value': mp,
            'max': mp
          },
          {
            'label': '共鳴',
            'value': getResonance(),
            'max': 10
          }
        ]
      }
    }
    return object
  }
}