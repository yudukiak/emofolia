window.onload = _ => {
  const target = document.body
  if (target == null) return
  const observer = new MutationObserver(records => {
    const ccfolia = document.getElementById('ccfolia')
    if (ccfolia && !/view/.test(location.href)) ccfolia.remove()
    if (ccfolia || !/view/.test(location.href)) return
    const ccfoliaButton = document.createElement('button')
    ccfoliaButton.id = 'ccfolia'
    ccfoliaButton.className = 'ml-3 v-btn theme--light elevation-0 v-size--default  error'
    ccfoliaButton.innerHTML = '<span class="v-btn__content">ココフォリア駒出力</span>'
    document.querySelector('#app > div.v-application--wrap > header > div > div').after(ccfoliaButton)
    ccfoliaButton.addEventListener('click', _ => buttonClick())
  })
  observer.observe(target, {
     characterData: true,
     childList: true,
     subtree: true
  })
  const buttonClick = _ => {
    const inputOptions = {
      'initiative': '（身体のみ）通常',
      'speed': '（身体＋スピード）地上',
      'dive': '（身体＋ダイブ）空中・水中',
      'debate': '（知力＋ディベート）議論',
      'money': '（社会）マネーゲーム',
      'live': '（魅力）ライブ'
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
   * テキストを返す
   * @return {String}
   */
  const getText = (pc, sp) => {
    const pcElm = document.querySelector(pc)
    const spElm = document.querySelector(sp)
    if (pcElm) return pcElm.textContent
    return spElm.textContent
  }
  /**
   * 能力値を返す
   * [身体, 器用, 精神, 五感, 知力, 魅力, 社会, 運勢]
   * [Number, Number, Number, Number, Number, Number, Number, Number]
   * @return {Array}
   */
  const getStatus = _ => {
    let status = []
    const selectorPc = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div:nth-child(5) > div > table > tbody > tr'
    const selectorSp = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div:nth-child(6) > div > table > tbody > tr'
    const elementsPc = document.querySelectorAll(selectorPc)
    const elementsSp = document.querySelectorAll(selectorSp)
    const elements = (elementsPc.length) ? elementsPc : elementsSp
    for (let i = 0, n = elements.length; i < n; i++) {
      const element = elements[i]
      const label = element.querySelector('td > div > span').textContent
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
    const selector = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.v-data-table.compact.section-margin-top.theme--light > div > table > tbody > tr'
    const elements = document.querySelectorAll(selector)
    for (let i = 0, n = elements.length; i < n; i++) {
      const element = elements[i]
      if ( !element.querySelector('td:nth-child(3) > div > span.outlinebox') ) continue
      //const label = element.querySelector('td:nth-child(1)').textContent.replace(/＊/, '')
      const labelElement = element.querySelector('td:nth-child(1)')
      const labelSpanElement = element.querySelector('td:nth-child(1) > span')
      let  label = ''
      if (labelSpanElement == null) {
        const labelName = labelElement.textContent
        label = labelName
      } else {
        const labelCustom = labelSpanElement.textContent
        const labelElementClone = labelElement.cloneNode(true)
        labelElementClone.querySelector('span').innerHTML = ''
        const labelName = labelElementClone.textContent
        label = `${labelName}（${labelCustom}）`
      }
      const level = element.querySelector('td:nth-child(2) > div > span').textContent.replace(/Lv./, '')
      const value = element.querySelector('td:nth-child(3) > div > span.outlinebox').textContent
      const skill = [label, Number(level), Number(value)]
      skills.push(skill)
    }
    const status = getStatus()
    //skills.push(['＊調査', 1, status[1]])
    //skills.push(['＊知覚', 1, status[3]])
    //skills.push(['＊交渉', 1, status[5]])
    //skills.push(['＊知識', 1, status[4]])
    //skills.push(['＊ニュース', 1, status[6]])
    //skills.push(['＊運動', 1, status[0]])
    //skills.push(['＊格闘', 1, status[0]])
    //skills.push(['＊投擲', 1, status[1]])
    //skills.push(['＊生存', 1, status[0]])
    //skills.push(['＊自我', 1, status[2]])
    //skills.push(['＊手当て', 1, status[4]])
    //skills.push(['＊細工', 1, status[1]])
    //skills.push(['＊幸運', 1, status[7]])
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
      'money': money,
      'live': live
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
    const selector = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.text-left.text-lg-h2.text-md-h3.text-h4'
    const nameElement = document.querySelector(selector)
    const text = nameElement.textContent
    return text
  }
  /**
   * メモ（PC読み方、PL記入箇所、表、裏、ルーツ）を返す
   * @return {String}
   */
  const getMemo = _ => {
    const selectorKana = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.text-left.text-h5'
    const kana = document.querySelector(selectorKana).textContent
    const selectorFrontPc = '#app > div > main > div > div > div > div > div.row > div > div > div > div.mt-4.col-sm-12.col-md-6.col-lg-6.col-12 > div.wrapper.mt-1.section-margin-top > div > div > table > tbody > tr:nth-child(2) > td'
    const selectorFrontSp = '#app > div.v-application--wrap > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.wrapper.mt-1 > div > div > table > tbody > tr:nth-child(2) > td'
    const front = getText(selectorFrontPc, selectorFrontSp)
    const selectorBackPc = '#app > div > main > div > div > div > div > div.row > div > div > div > div.mt-4.col-sm-12.col-md-6.col-lg-6.col-12 > div.wrapper.mt-1.section-margin-top > div > div > table > tbody > tr:nth-child(3) > td'
    const selectorBackSp = '#app > div.v-application--wrap > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.wrapper.mt-1 > div > div > table > tbody > tr:nth-child(3) > td'
    const back = getText(selectorBackPc, selectorBackSp)
    const selectorRootsPc = '#app > div > main > div > div > div > div > div.row > div > div > div > div.mt-4.col-sm-12.col-md-6.col-lg-6.col-12 > div.wrapper.mt-1.section-margin-top > div > div > table > tbody > tr:nth-child(4) > td'
    const selectorRootsSp = '#app > div.v-application--wrap > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.wrapper.mt-1 > div > div > table > tbody > tr:nth-child(4) > td'
    const roots = getText(selectorRootsPc, selectorRootsSp)
    const text = `PC　${kana}\nPL　\n\n表　${front}\n裏　${back}\nル　${roots}`
    return text
  }
  /**
   * メモ（PC読み方、PL記入箇所、表、裏、ルーツ）を返す
   * @return {String}
   */
//  const getColor = _ => {
//    const selector = '#app > div > main > div > div > div > div.row > div > div > div > div'
//    const color = document.querySelector(selector).style.backgroundColor
//    return color
//  }
  /**
   * 共鳴値を返す
   * @return {Number}
   */
  const getResonance = _ => {
    const selectorPc = '#app > div > main > div > div > div > div > div.row > div > div > div > div.mt-4.col-sm-12.col-md-6.col-lg-6.col-12 > div.wrapper.mt-1.section-margin-top > div > div > table > tbody > tr:nth-child(1) > td'
    const selectorSp = '#app > div > main > div > div > div > div > div.row > div > div > div > div:nth-child(1) > div.wrapper.mt-1 > div > div > table > tbody > tr:nth-child(1) > td'
    const text = getText(selectorPc, selectorSp)
    const number = Number(text)
    return number
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
      let cmd = '{共鳴}DM<={強度} 〈∞共鳴〉'
      cmd += '\n({共鳴}+1)DM<={強度} 共鳴判定（ルーツ属性一致）'
      cmd += '\n({共鳴}*2)DM<={強度} 共鳴判定（完全一致）'
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
//        'color': getColor(),
        'initiative': initiative,
        'externalUrl': location.href,
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
        ],
        'params': [{
            'label': '身体',
            'value': String(status[0])
          },
          {
            'label': '器用',
            'value': String(status[1])
          },
          {
            'label': '精神',
            'value': String(status[2])
          },
          {
            'label': '五感',
            'value': String(status[3])
          },
          {
            'label': '知力',
            'value': String(status[4])
          },
          {
            'label': '魅力',
            'value': String(status[5])
          },
          {
            'label': '社会',
            'value': String(status[6])
          },
          {
            'label': '運勢',
            'value': String(status[7])
          }
        ],
        'commands': commands
      }
    }
    return object
  }
}