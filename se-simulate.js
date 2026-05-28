/* ═══════════════════════════════════════════════════
   se-simulate.js
   StreamElements event simulator + SE_API stub
   Drop this before widget.js in any standalone demo.
   ═══════════════════════════════════════════════════ */

// ─── SE_API stub (replaces the real StreamElements store) ───────────────────
const SE_API = {
  _store: {},
  store: {
    set(key, value) {
      SE_API._store[key] = JSON.parse(JSON.stringify(value)); // deep clone
      console.log('[SE_API] store.set', key, value);
    },
    async get(key) {
      const val = SE_API._store[key];
      console.log('[SE_API] store.get', key, val);
      return val ? JSON.parse(JSON.stringify(val)) : null;
    }
  }
};

// ─── jQuery mini-stub (widget uses $ for CSS tweaks) ────────────────────────
window.$ = window.jQuery = function(selector) {
  const elements = typeof selector === 'string'
    ? Array.from(document.querySelectorAll(selector))
    : [selector];
 
  return {
    css(prop, value) {
      elements.forEach(el => {
        if (el && el.style) el.style[prop] = value;
      });
      return this;
    },
    length: elements.length
  };
};

// ─── SESimulate — fire fake SE events ───────────────────────────────────────
const SESimulate = {

  widgetLoad(detail = {}) {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('onWidgetLoad', { detail }));
    }, 1);
  },

  follower(name = 'TestViewer') {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: { listener: 'follower-latest', event: { name } }
    }));
    console.log('[SE] follower-latest', name);
  },

  subscriber(name = 'TestViewer', amount = 1, tier = '1000') {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: {
        listener: 'subscriber-latest',
        event: {
          name,
          amount,
          tier,
          gifted: amount > 1,
          bulkGifted: amount > 1,
          isCommunityGift: false,
          sender: name
        }
      }
    }));
    console.log('[SE] subscriber-latest', name, amount, tier);
  },

  tip(name = 'TestViewer', amount = 5.00, message = 'Test tip!') {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: { listener: 'tip-latest', event: { name, amount, message } }
    }));
    console.log('[SE] tip-latest', name, amount);
  },

  cheer(name = 'TestViewer', amount = 100, message = 'Cheer100') {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: { listener: 'cheer-latest', event: { name, amount, message } }
    }));
    console.log('[SE] cheer-latest', name, amount);
  },

  raid(name = 'TestChannel', amount = 50) {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: { listener: 'raid-latest', event: { name, amount } }
    }));
    console.log('[SE] raid-latest', name, amount);
  },

  host(name = 'TestChannel', amount = 100) {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: { listener: 'host-latest', event: { name, amount } }
    }));
    console.log('[SE] host-latest', name, amount);
  },

  /** Fire a fake chat message — useful for mod commands */
  chat(nick, text, isMod = false) {
    window.dispatchEvent(new CustomEvent('onEventReceived', {
      detail: {
        listener: 'message',
        event: {
          name: nick,
          data: {
            nick,
            text,
            tags: { mod: isMod ? 1 : 0 }
          }
        }
      }
    }));
    console.log('[SE] message', nick, text);
  }
};

// ─── Auto-fire onWidgetLoad with demo fieldData ──────────────────────────────
SESimulate.widgetLoad({
  channel: {
    apiToken: 'demo-token',
    avatar: '',
    id: 'demo-id',
    providerId: 'demo-provider',
    username: 'megathon_demo'       // ← this becomes ownerName in the widget
  },
  currency: {
    code: 'USD',
    name: 'U.S. Dollar',
    symbol: '$'
  },
  fieldData: {
    // ── General ──────────────────────────────────────
    currencyCode:        'USD',
    eventTitleText:      'MEGATHON',
    eventTitleDisplay:   true,
    startHours:          2,
    summaryEnabled:      true,
    editSummary:         false,
    modHelp:             true,
    streamlabsDonos:     true,

    // ── Timer math ───────────────────────────────────
    timerValueRatio:     60,
    useAdvancedOptions:  false,
    advancedSubs:        150,
    advancedBits:        60,
    advancedDonos:       60,
    subSplit:            50,

    // ── Trackers ─────────────────────────────────────
    trackersDisplay:     true,
    trackSubs:           true,
    trackBits:           true,
    trackDonos:          true,
    capHours:            0,

    // ── Goals ────────────────────────────────────────
    goalDisplay:         true,
    goalType:            'valueCount',
    goal1:  50,   reward1:  '✨ Emote Only',
    goal2:  150,  reward2:  '🎮 Viewer Game',
    goal3:  300,  reward3:  '🎵 Song Requests',
    goal4:  500,  reward4:  '🌮 Order Food Live',
    goal5:  0,    reward5:  '',
    goal6:  0,    reward6:  '',
    goal7:  0,    reward7:  '',
    goal8:  0,    reward8:  '',
    goal9:  0,    reward9:  '',
    goal10: 0,    reward10: '',
    goal11: 0,    reward11: '',
    goal12: 0,    reward12: '',
    goal13: 0,    reward13: '',
    goal14: 0,    reward14: '',
    goal15: 0,    reward15: '',
    goal16: 0,    reward16: '',
    goal17: 0,    reward17: '',
    goal18: 0,    reward18: '',
    goal19: 0,    reward19: '',
    goal20: 0,    reward20: '',

    // ── Event title styling ───────────────────────────
    eventTitleFontFace:    'Luckiest Guy',
    eventTitleColor:       '#ffffff',
    eventTitleStrokeWidth: 0,
    eventTitleStrokeColor: '#000000',

    // ── Timer styling ─────────────────────────────────
    timerFontFace:    'Luckiest Guy',
    timerColor:       '#ffffff',
    timerStrokeWidth: 0,
    timerStrokeColor: '#000000',

    // ── Tracker styling ───────────────────────────────
    trackerFontFace:    'Luckiest Guy',
    trackerColor:       '#ffffff',
    trackerStrokeWidth: 2,
    trackerStrokeColor: '#000000',

    // ── Goal styling ──────────────────────────────────
    goalFontFace:    'Luckiest Guy',
    goalColor:       '#ffffff',
    goalStrokeWidth: 0,
    goalStrokeColor: '#000000',
    goalLockColor:   '#ffffff',

    // ── Summary styling ───────────────────────────────
    summaryFontFace:        'Luckiest Guy',
    summaryColor:           '#000000',
    summaryStrokeWidth:     0,
    summaryStrokeColor:     '#000000',
    summaryBackgroundColor1:'#ffffff',
    summaryBackgroundColor2:'#ffffff',
    summaryStarOpacity:     5
  },
  overlay: {
    isEditorMode: false,
    muted: false
  }
});

// ─── Scale #main to fit the viewport ────────────────────────────────────────
function scaleWidget() {
  const viewport = document.getElementById('widget-viewport');
  const main     = document.getElementById('main');
  if (!viewport || !main) return;

  const scaleX = viewport.clientWidth  / 1200;
  const scaleY = viewport.clientHeight / 800;
  const scale  = Math.min(scaleX, scaleY);

  main.style.transform = `scale(${scale})`;
}

window.addEventListener('load',   scaleWidget);
window.addEventListener('resize', scaleWidget);
