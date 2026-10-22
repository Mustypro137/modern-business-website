// Wood picker: builds a set of radio buttons from the plain list of woods in the HTML.
// If this script fails or is switched off, the list stays visible and the page still works.
(function () {
  const featured = document.querySelector('.featured');
  const list = document.querySelector('.wood-list');
  if (!featured || !list) return;

  const nameEl = featured.querySelector('.wood-name');
  const textEl = featured.querySelector('.wood-text');
  const priceEl = featured.querySelector('.wood-price');

  // Show one wood: set the colours, then fill in the text.
  function showWood(item) {
    featured.style.setProperty('--wood', item.dataset.colour);
    featured.style.setProperty('--wood-ink', item.dataset.ink);
    nameEl.textContent = item.querySelector('strong').textContent;
    // The description is the text after the name and before the price sentence.
    textEl.textContent = item.textContent
      .replace(item.querySelector('strong').textContent, '')
      .replace(/From £[\d,]+\./, '')
      .trim();
    priceEl.textContent = item.dataset.price;
  }

  // Build the picker.
  const picker = document.createElement('fieldset');
  picker.className = 'wood-picker';
  const legend = document.createElement('legend');
  legend.textContent = 'Choose a wood';
  picker.append(legend);

  list.querySelectorAll('li').forEach(function (item, index) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    input.type = 'radio';
    input.name = 'wood';
    input.checked = index === 0;
    text.textContent = item.querySelector('strong').textContent;

    input.addEventListener('change', function () { showWood(item); });

    label.append(input, text);
    picker.append(label);
  });

  list.hidden = true;        // hide the plain list
  list.before(picker);       // put the picker where the list was
  showWood(list.querySelector('li'));
})();

// Open-now status: reads the opening days and hours from the HTML and says whether the workshop is open.
// It uses London time, so a visitor in another country still sees the right answer.
(function () {
  const status = document.querySelector('.open-status');
  if (!status) return;

  const days = status.dataset.days.split(',').map(Number);   // 0 = Sunday ... 6 = Saturday
  const openHour = Number(status.dataset.open);
  const closeHour = Number(status.dataset.close);
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const longNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // The day number and the time (as hours, so 9:30 is 9.5) in London right now.
  function londonNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = function (type) { return parts.find(function (p) { return p.type === type; }).value; };
    return {
      day: shortNames.indexOf(get('weekday')),
      hours: Number(get('hour')) + Number(get('minute')) / 60
    };
  }

  function update() {
    const now = londonNow();
    const openToday = days.includes(now.day);

    if (openToday && now.hours >= openHour && now.hours < closeHour) {
      status.textContent = 'Open now, until ' + closeHour + ':00';
      return;
    }
    if (openToday && now.hours < openHour) {
      status.textContent = 'Closed now, opens today at ' + openHour + ':00';
      return;
    }
    // Closed for today: look ahead one day at a time for the next opening day.
    for (let ahead = 1; ahead <= 7; ahead++) {
      const next = (now.day + ahead) % 7;
      if (days.includes(next)) {
        const when = ahead === 1 ? 'tomorrow' : longNames[next];
        status.textContent = 'Closed now, opens ' + when + ' at ' + openHour + ':00';
        return;
      }
    }
  }

  update();
  setInterval(update, 60000);   // keep it right if the page stays open
})();
