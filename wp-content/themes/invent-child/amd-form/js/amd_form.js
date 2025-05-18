class AMD_Form {
  table

  // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
  static wait_to_exist( selector ) {
    return new Promise(resolve => {
      if ( document.querySelector(selector) ) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if ( document.querySelector(selector) ) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      // If you get 'parameter 1 is not of type 'Node'' error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.documentElement, {
        childList : true,
        subtree   : true
      });
    });
  }

  static async init() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get : ( searchParams, prop ) => searchParams.get(prop),
    });

    if ( params.view_results !== null ) {
      await AMD_Form.wait_to_exist('#amd_table');
      this.table = new Tabulator('#amd_table', {
        height         : '100%',
        layout         : 'fitDataFill',
        pagination     : true,
        paginationMode : 'remote',
        sortMode       : 'remote',
        filterMode     : 'remote',
        ajaxURL        : window.location.href.split('?')[ 0 ],
        ajaxParams     : {
          'get_data' : 'true'
        },
        dataSendParams : {
          'page' : 'offset',
        },
        rowFormatter   : function ( row ) {
          const data = row.getData()
          const wrapper = document.createElement('div');
          const table = document.createElement('table');

          wrapper.style.boxSizing = 'border-box';
          wrapper.style.padding = '10px 30px 10px 10px';
          wrapper.style.borderTop = '1px solid #333';
          wrapper.style.borderBotom = '1px solid #333';
          wrapper.style.display = 'none'

          table.style.border = '1px solid #333';

          wrapper.appendChild(table);
          data.wrapper = wrapper
          row.getElement().appendChild(wrapper);

          const subTable = new Tabulator(table, {
            layout  : 'fitColumns',
            data    : data.answers,
            columns : [
              { title : 'Question', field : 'label' },
              { title : 'Score', field : 'value', width : 75 },
              { title : 'Answer', field : 'text', width : 250 },
            ]
          })
        },
        paginationSize : 10,
        columns        : [
          {
            formatter : function ( cell, formatterParams, onRendered ) {
              onRendered(function () {
                const toggle_button = document.createElement('button');
                toggle_button.addEventListener('click', function () {
                  const inner_table = cell.getData().wrapper; //lookup list element from row data
                  const old_display = inner_table.style.display
                  const hidden = old_display === 'none';
                  inner_table.style.display = hidden ? '' : 'none'
                  cell.getElement().querySelector('button').innerText = hidden ? '-' : '+'
                });

                toggle_button.innerText = '+'
                toggle_button.classList.add('amc_expand_button');

                cell.getElement().appendChild(toggle_button);
              })
            },
            width     : 30, minWidth : 50, hozAlign : 'center', resizable : false, headerSort : false
          },
          { title : 'Submitted', field : 'submitted', width : 150, headerSort : true },
          { title : 'Name', field : 'name', width : 200, headerSort : true },
          { title : 'Last 12', field : 'last_12', width : 150, headerSort : true },
          { title : 'Next 12', field : 'next_12', width : 150, headerSort : true },
          { title : 'Score', field : 'score', width : 75, headerSort : true },
        ],
      })
      this.set_filter_events()
    } else {
      await AMD_Form.wait_to_exist('#content.amd_form_content')
      this.set_total()
      this.set_select_events()
      this.make_score_plotly()
      this.set_submit_events()
      this.set_input_events()
    }

  }

  static get_entries() {
    return document.querySelectorAll('.amd_form_entry')
  }

  static get_selects() {
    return document.querySelectorAll('.amd_form_entry select')
  }

  static get_inputs() {
    return document.querySelectorAll('.amd_form_entry input')
  }

  static get_score() {
    const selects = this.get_selects()
    let score = 0
    selects.forEach(select => {
      score += +select.value
    })

    return score
  }

  static max_score() {
    const selects = this.get_selects()
    let score = 0
    selects.forEach(select => {
      const options = select.options
      let value = 0
      for ( let i = 0; i < options.length; i++ ) {
        value = Math.max(value, +options[ i ].value)
      }

      score += value
    })

    return score
  }

  static generage_score_plotly_data( override = null ) {
    const score = override ?? this.get_score()
    const max_score = this.max_score()
    const color = this.make_color(override)

    return [
      {
        domain : { x : [0, 1], y : [0, 1] },
        value  : score,
        title  : { text : 'Score' },
        type   : 'indicator',
        mode   : 'gauge+number',
        gauge  : {
          axis : {
            range : [0, max_score]
          },
          bar  : {
            color : color
          }
        }
      }
    ]
  }

  static generate_score_plotly_layout() {
    return {
      height : 180,
      width  : 300,
      margin : {
        r : 45,
        l : 30,
        t : 50,
        b : 0
      }
    };
  }

  static make_color( override = null ) {
    const score = override ?? this.get_score()
    const max_score = this.max_score()

    // document.querySelector('#amd_form_score_label').innerHTML = 'Score: ' + score
    const percent = Math.ceil((score / max_score) * 100)
    // const progress = document.querySelector('#amd_form_score')
    // progress.style.width = percent + '%'

    const checkpoints = {
      45  : 'red',
      75  : 'yellow',
      100 : 'green',
    }

    const keys = Object.keys(checkpoints)
    for ( let i = 0; i < keys.length; i++ ) {
      const key = +keys[ i ]
      if ( percent <= key ) {
        return checkpoints[ key ]
      }
    }

    return 'green'
  }

  /*
  static make_color( override = null ) {
    const score = override ?? this.get_score()
    const max_score = this.max_score()

    // document.querySelector('#amd_form_score_label').innerHTML = 'Score: ' + score
    const percent = Math.ceil((score / max_score) * 100)
    // const progress = document.querySelector('#amd_form_score')
    // progress.style.width = percent + '%'

    const min_degrees = 0
    const max_degrees = 127

    const checkpoints = {
      0   : min_degrees,
      50  : 30,
      75  : 55,
      90  : 80,
      100 : max_degrees,
    }

    let previous_key = 0
    let previous_checkpoint = checkpoints[ 0 ]
    let color = 'hsl(0deg, 100%, 50%)'
    const keys = Object.keys(checkpoints)
    keys.forEach(key => {
      const this_checkpoint = checkpoints[ key ]
      if ( (percent >= previous_key && percent <= key) ) {
        const percent_diff = percent - previous_key
        const key_diff = key - previous_key
        const key_percent = (percent_diff / key_diff)
        const checkpoint_diff = this_checkpoint - previous_checkpoint
        const degrees = previous_checkpoint + Math.ceil(checkpoint_diff * key_percent)
        // progress.style.backgroundColor = 'hsl(' + degrees + 'deg, 100%, 50%)'
        color = 'hsl(' + degrees + 'deg, 100%, 50%)'
      }
      previous_key = key
      previous_checkpoint = this_checkpoint
    })

    return color
  }
   */

  static update_score( override = null ) {
    Plotly.react('amd_form_score_bar', this.generage_score_plotly_data(override), this.generate_score_plotly_layout())
  }

  static update_answered() {
    const answered = document.querySelector('#amd_form_answered')
    if ( answered !== null ) {
      const score = this.get_score();
      let count = 0
      if ( score !== 0 ) {
        const selects = this.get_selects()
        selects.forEach(select => {
          if ( select.value !== '0' ) {
            count++
          }
        })
      }

      answered.innerText = count
      return count
    }
    return 0
  }

  static set_submit_state() {
    const answered = this.update_answered()
    const entries = this.get_selects().length
    const all_answered = answered === entries

    const name_filled = document.querySelector('#agent_name').value.trim() !== ''
    const last_twelve_filled = document.querySelector('#last_twelve_production').value.trim() !== ''
    const next_twelve_filled = document.querySelector('#next_twelve_production').value.trim() !== ''

    const text_filled = name_filled && last_twelve_filled && next_twelve_filled

    if ( all_answered && text_filled ) {
      //this.enable_submit()
    } else {
      //this.disable_submit()
    }
  }

  static on_select( element ) {
    this.update_answered()
    this.update_score()
    this.set_submit_state()
  }

  static on_input() {
    this.set_submit_state()
  }

  static make_score_plotly() {
    const data = this.generage_score_plotly_data()
    const layout = this.generate_score_plotly_layout();
    Plotly.newPlot('amd_form_score_bar', data, layout);
  }

  static set_select_events() {
    const selects = this.get_selects();
    selects.forEach(select => {
      select.addEventListener('change', this.on_select.bind(this))
    })
  }

  static get_submit() {
    return document.querySelector('#amd_form_submit')
  }

  static set_submit_events() {
    this.get_submit().addEventListener('click', this.on_submit.bind(this))
  }

  static set_input_events() {
    const selects = this.get_inputs();
    selects.forEach(select => {
      select.addEventListener('input', this.on_input.bind(this))
    })
  }

  static set_total() {
    const entries = this.get_selects()
    const total = document.querySelector('#amd_form_total')

    if ( total !== null ) {
      total.innerText = entries.length + ' Answered'
    }
  }

  static set_inputs_disabled( disabled ) {
    this.get_inputs().forEach(input => {
      input.disabled = disabled
    })
    this.get_selects().forEach(input => {
      input.disabled = disabled
    })
  }

  static disable_inputs() {
    this.set_inputs_disabled(true)
  }

  static enable_inputs() {
    this.set_inputs_disabled(false)
  }

  static set_submit_disabled( disabled ) {
    this.get_submit().disabled = disabled
  }

  static disable_submit() {
    this.set_submit_disabled(true)
  }

  static enable_submit() {
    this.set_submit_disabled(false)
  }

  static on_submit() {
    const data = {};
    data.agent_name = document.querySelector('#agent_name').value
    data.last_twelve_months_production = document.querySelector('#last_twelve_production').value
    data.next_twelve_months_goal = document.querySelector('#next_twelve_production').value
    data.score = this.get_score()
    data.answers = []

    const answers = document.querySelectorAll('.amd_form_entry.amd_form_selector')
    for ( let i = 0; i < answers.length; i++ ) {
      const answer = answers[ i ]
      const label = answer.querySelector('label').innerText
      const select = answer.querySelector('select')
      const option = select.options[ select.selectedIndex ]
      const value = option.value
      const text = option.text
      data.answers.push({ label, value, text })
    }

    const here = window.location.href;
    this.disable_submit()
    this.disable_inputs()
    fetch(here, {
      method : 'POST',
      body   : JSON.stringify(data),
    })
      .then(results => results.json())
      .then(results => {
        const error = document.querySelector('#amd_form_error')
        if ( results[ 'success' ] ) {
          error.innerText = 'Success!'
          error.style.color = 'green'
        } else {
          error.innerText = results[ 'data' ][ 'error' ]
          this.enable_submit()
          this.enable_inputs()
        }
      })
  }

  static on_search_input(e) {
    console.debug(e)
    const key = e.key.toLowerCase()
    if(key === 'enter') {
      document.querySelector('#amd_table_filter_submit').click()
    }
  }

  static on_search_submit_click() {
    const value = document.querySelector('#amd_table_filter_value').value
    console.debug(value);
    this.table.setFilter('name', 'like', value)
  }

  static set_filter_events() {
    document.querySelector('#amd_table_filter_submit').addEventListener('click', this.on_search_submit_click.bind(this))
    document.querySelector('#amd_table_filter_value').addEventListener('keyup', this.on_search_input.bind(this))
  }
}

AMD_Form.init()
