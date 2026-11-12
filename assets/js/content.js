/* Roomila landing — all site copy, PL (default) + EN.
   Edit texts here; the HTML carries the Polish text only as the pre-script fallback.
   Loaded as a classic script so the pages also work when opened from disk.
   Polish copy: no English words (AI is the one exception) and no informal address.
   Some keys (modules, why.w3, plan, bento, decide, facts.b) are used only by variant B in b/. */
window.RUMILO_I18N = {
  en: {
    meta: {
      title: 'Roomila — guarding your hotel’s rates',
      desc: 'Roomila tracks events and demand and recommends the right rate for every night. For independent and boutique hotels, aparthotels and hostels.'
    },
    nav: {
      events: 'Events',
      product: 'Product',
      modules: 'Modules',
      audience: 'For whom',
      why: 'Why Roomila',
      contact: 'Contact',
      menu: 'Menu',
      close: 'Close menu',
      label: 'Main navigation',
      lang: 'Language',
      skip: 'Skip to content'
    },
    cta: {
      call: 'Book a call',
      how: 'How it works',
      modules: 'Explore the modules'
    },
    hero: {
      title: 'Guarding the rates of',
      titleSr: 'independent and boutique hotels, aparthotels and hostels',
      words: ['independent hotels', 'boutique hotels', 'aparthotels', 'hostels'],
      lead: 'So no room ever goes for next to nothing. Roomila watches local events and demand, forecasts occupancy and recommends the rate before a date sells out.',
      visualAlt: 'Illustration: a hotel with panels showing recommended rates, a demand calendar and a revenue chart',
      tagPricing: 'Dynamic Pricing',
      tagInsights: 'AI Insights',
      tagOccupancy: 'Maximize Occupancy',
      tagRevenue: 'Boost Revenue',
      tipTitle: 'New event',
      tipText: 'demand rising'
    },
    motion: {
      pause: 'Pause animation',
      play: 'Play animation'
    },
    ticker: {
      label: 'Market signals',
      demo: 'demo',
      aria: 'Market signals the system watches (demo data)',
      up: 'up',
      down: 'down',
      // d: up | down | new — shown like an exchange ticker; all values are illustrative
      items: [
        { d: 'up', v: '18%', t: 'Flight bookings to Warsaw' },
        { d: 'new', v: 'New', t: '3 concerts announced in Prague' },
        { d: 'up', v: '12%', t: 'Booking traffic in Kraków' },
        { d: 'down', v: '4%', t: 'Cancellations, next 14 days' },
        { d: 'up', v: '24%', t: 'Weekend demand in Zakopane' },
        { d: 'up', v: '6%', t: 'Competitor rates, Gdańsk Old Town' },
        { d: 'new', v: 'New', t: 'Trade fair in Poznań in 4 days' },
        { d: 'up', v: '31%', t: 'Searches for Wrocław Christmas market' },
        { d: 'down', v: '3 days', t: 'Booking lead time, city hotels' }
      ]
    },
    events: {
      title: 'Concert announced. Rates updated before anyone books cheap.',
      p: 'Concerts, trade fairs, matches and long weekends lift demand long before the first booking. Roomila tracks events around your hotel and recommends a new rate right away, before the cheapest rooms are gone.',
      name: 'Concert at Tauron Arena',
      before: 'Room rate before the announcement',
      after: 'Room rate after the announcement',
      priceOld: '€70',
      priceNew: '€165',
      gain: '+€950',
      gainLabel: 'with 10 rooms for one night'
    },
    facts: {
      title: 'Roomila at a glance',
      a: { unit: 'days', label: 'of rates planned ahead' },
      b: { unit: 'modules', label: 'in one system' },
      f: { unit: 'data sources', label: 'behind every rate' },
      c: { label: 'demand monitoring' },
      d: { unit: 'screen', label: 'for daily decisions' },
      e: { unit: 'spreadsheets', label: 'to maintain' }
    },
    product: {
      title: 'Data instead of empty rooms',
      p1: 'Roomila combines six data sources and turns them into a rate for every night and every room type. Built for hotels without a pricing specialist: no spreadsheets, no guesswork.',
      p2: 'You stay in control: every recommendation comes with its reasons, and you decide what goes live.'
    },
    data: {
      label: 'Data sources',
      s1: 'Events',
      s2: 'Historical data',
      s3: 'Competitor rates',
      s4: 'Booking-site traffic',
      s5: 'Demand level',
      s6: 'Season',
      result: 'The right rate for every night'
    },
    screen: {
      title: 'Today',
      occ: 'Occupancy',
      adr: 'ADR',
      revpar: 'RevPAR',
      vs: 'vs last year',
      legendThis: 'This year',
      legendLast: 'Last year',
      legendFc: 'Forecast'
    },
    demo: 'Demo data',
    modules: {
      title: 'Four modules, one daily routine',
      m1: { t: 'Dynamic pricing', d: 'Rate recommendations for every date and room type, updated as demand moves.' },
      m2: { t: 'Demand forecast', d: 'Occupancy and demand forecast for the months ahead, with high- and low-demand dates flagged.' },
      m3: { t: 'Dashboards & analytics', d: 'RevPAR, ADR, occupancy and pickup on one screen, compared with last year.' },
      m4: { t: 'Budgeting & planning', d: 'Monthly and yearly revenue plan, tracked against actuals as the season unfolds.' }
    },
    audience: {
      title: 'Built for hotels without a pricing specialist',
      a1: { t: 'Independent hotels', d: 'One property, one owner, a hundred decisions a day. Roomila takes pricing off the list.' },
      a2: { t: 'Boutique hotels', d: 'Few rooms, high value. Price every room type for what its date is really worth.' },
      a3: { t: 'Aparthotels & extended stay', d: 'Balance short and long stays so the calendar fills without gaps.' },
      a4: { t: 'Hostels', d: 'Price beds and private rooms by demand, night by night.' }
    },
    why: {
      title: 'Why Roomila',
      w1: {
        t: 'Automation you can read',
        b1: 'Every recommendation shows the reasons behind it: demand, booking pace, season.',
        b2: 'Accept, adjust or override in one click, within the limits you set.',
        b3: 'Less routine in spreadsheets, more time for guests and strategy.'
      },
      w2: {
        t: 'Revenue, not just rates',
        b1: 'Prices follow forecast demand, not last year’s calendar.',
        b2: 'High-demand dates are protected from selling out too cheap, too early.',
        b3: 'Low-demand dates get attention before they turn into empty rooms.'
      },
      w3: {
        t: 'Analytics that stay honest',
        b1: 'Forecasts are rebuilt from fresh booking data, so they move with the market.',
        b2: 'One set of numbers for the owner, the manager and the front office.',
        b3: 'Plan versus actual is visible every day, not at month end.'
      }
    },
    together: {
      title: 'Growing together with your hotel',
      lead: 'We don’t wait for your hotel to call with a problem. We reach out first.',
      s1: { t: 'Call', d: 'We get to know your hotel, its calendar and how you set rates today.' },
      s2: { t: 'Onboarding', d: 'We set up the system and agree the price limits with you.' },
      s3: { t: 'A call every week', d: 'Every week we call you to go over rates and upcoming events.' },
      s4: { t: 'New features for free', d: 'Every new feature reaches your hotel at no extra cost.' }
    },
    reco: {
      title: 'Recommendation',
      room: 'Double room',
      current: 'Current',
      recommended: 'Recommended',
      r1: 'Demand forecast: high',
      r2: 'Booking pace ahead of last year',
      r3: 'Weekend in high season',
      accept: 'Accept',
      adjust: 'Adjust',
      reject: 'Reject',
      now: 'now',
      s1: 'High demand',
      s2: 'Faster bookings',
      s3: 'Peak season'
    },
    plan: {
      title: 'Plan vs actual',
      plan: 'Plan',
      actual: 'Actual'
    },
    demand: {
      title: 'Demand calendar',
      high: 'High demand',
      low: 'Low demand',
      flag: 'Opportunity'
    },
    rates: {
      title: 'Rate recommendations'
    },
    bento: {
      title: 'One system, four jobs'
    },
    decide: {
      title: 'Every price comes with its reasons',
      p: 'Roomila shows why it recommends a rate: forecast demand, booking pace, season. You accept it, adjust it or set your own, within the limits you define.'
    },
    band: {
      title: 'What is your hotel’s calendar worth?'
    },
    book: {
      title: 'Pick a time for a call',
      lead: 'An online call with Antoni Małocha: we get to know your hotel and show you the product. The confirmation arrives by email.',
      loading: 'Loading the calendar…',
      failed: 'The calendar did not load. You can leave a call request in the form below.'
    },
    contact: {
      title: 'Book a call',
      lead: 'A short call: we get to know your hotel, you get to know the product.',
      name: 'Name',
      hotel: 'Hotel',
      reach: 'Email or phone',
      time: 'Preferred time (optional)',
      consent: 'I agree to be contacted about this request.',
      submit: 'Send request',
      subject: 'Call request',
      required: 'This field is required.',
      errorIcon: 'Error',
      sending: 'Sending…',
      sent: 'Thank you. Your request is with us and we will get back to you shortly.',
      fail: 'We could not send your request. Please try again in a moment.',
      err: 'Please fill in your name, hotel and a way to reach you, and tick the consent box.'
    },
    footer: {
      tagline: 'Guarding your hotel’s rates',
      rights: '© 2026 Roomila'
    }
  },

  pl: {
    meta: {
      title: 'Roomila — stoimy na straży cen hotelu',
      desc: 'Roomila śledzi wydarzenia i popyt i podpowiada właściwą cenę na każdą noc. Dla hoteli niezależnych, butikowych, aparthoteli i hosteli.'
    },
    nav: {
      events: 'Wydarzenia',
      product: 'Produkt',
      modules: 'Moduły',
      audience: 'Dla kogo',
      why: 'Dlaczego Roomila',
      contact: 'Kontakt',
      menu: 'Menu',
      close: 'Zamknięcie menu',
      label: 'Nawigacja główna',
      lang: 'Język',
      skip: 'Przejście do treści'
    },
    cta: {
      call: 'Porozmawiajmy',
      how: 'Jak to działa',
      modules: 'Przegląd modułów'
    },
    hero: {
      title: 'Stoimy na straży cen',
      titleSr: 'hoteli niezależnych i butikowych, aparthoteli i hosteli',
      words: ['hoteli niezależnych', 'hoteli butikowych', 'aparthoteli', 'hosteli'],
      lead: 'Pilnujemy, żeby żaden pokój nie poszedł przypadkiem za pół darmo. Roomila śledzi wydarzenia i popyt, prognozuje obłożenie i podpowiada cenę, zanim termin się wyprzeda.',
      visualAlt: 'Ilustracja: hotel z panelami pokazującymi rekomendowane ceny, kalendarz popytu i wykres przychodu',
      tagPricing: 'Dynamiczne ceny',
      tagInsights: 'Wskazówki AI',
      tagOccupancy: 'Wyższe obłożenie',
      tagRevenue: 'Większy przychód',
      tipTitle: 'Nowe wydarzenie',
      tipText: 'popyt rośnie'
    },
    motion: {
      pause: 'Wstrzymanie animacji',
      play: 'Włączenie animacji'
    },
    ticker: {
      label: 'Sygnały rynkowe',
      demo: 'przykładowe',
      aria: 'Sygnały rynkowe, które śledzi system (dane przykładowe)',
      up: 'wzrost',
      down: 'spadek',
      items: [
        { d: 'up', v: '18%', t: 'Rezerwacje lotów do Warszawy' },
        { d: 'new', v: 'Nowe', t: '3 koncerty ogłoszone w Pradze' },
        { d: 'up', v: '12%', t: 'Ruch rezerwacyjny w Krakowie' },
        { d: 'down', v: '4%', t: 'Anulacje, najbliższe 14 dni' },
        { d: 'up', v: '24%', t: 'Popyt weekendowy w Zakopanem' },
        { d: 'up', v: '6%', t: 'Ceny konkurencji, Gdańsk Stare Miasto' },
        { d: 'new', v: 'Nowe', t: 'Targi w Poznaniu za 4 dni' },
        { d: 'up', v: '31%', t: 'Wyszukiwania: jarmark we Wrocławiu' },
        { d: 'down', v: '3 dni', t: 'Wyprzedzenie rezerwacji, hotele miejskie' }
      ]
    },
    events: {
      title: 'Koncert ogłoszony. Ceny zmienione, zanim ktoś zarezerwuje tanio.',
      p: 'Koncerty, targi, mecze i długie weekendy podnoszą popyt na długo przed pierwszą rezerwacją. Roomila śledzi wydarzenia w okolicy hotelu i od razu podpowiada nową cenę, zanim najtańsze pokoje znikną.',
      name: 'Koncert w Tauron Arenie',
      before: 'Cena pokoju przed ogłoszeniem',
      after: 'Cena pokoju po ogłoszeniu',
      priceOld: '300 zł',
      priceNew: '700 zł',
      gain: '+4000 zł',
      gainLabel: 'przy 10 pokojach w jedną noc'
    },
    facts: {
      title: 'Roomila w skrócie',
      a: { unit: 'dni', label: 'cen zaplanowanych z wyprzedzeniem' },
      b: { unit: 'moduły', label: 'w jednym systemie' },
      f: { unit: 'źródeł danych', label: 'w każdej cenie' },
      c: { label: 'monitoring popytu' },
      d: { unit: 'ekran', label: 'do codziennych decyzji' },
      e: { unit: 'arkuszy', label: 'do prowadzenia' }
    },
    product: {
      title: 'Dane zamiast pustych pokoi',
      p1: 'Roomila łączy sześć źródeł danych i na ich podstawie wylicza cenę dla każdej nocy i każdego typu pokoju. Dla hoteli bez specjalisty od cen: bez arkuszy i bez zgadywania.',
      p2: 'Kontrola zostaje po stronie hotelu: każda rekomendacja ma uzasadnienie, a o publikacji ceny decyduje człowiek.'
    },
    data: {
      label: 'Źródła danych',
      s1: 'Wydarzenia',
      s2: 'Dane historyczne',
      s3: 'Ceny konkurencji',
      s4: 'Ruch na portalach',
      s5: 'Poziom popytu',
      s6: 'Sezon',
      result: 'Właściwa cena na każdą noc'
    },
    screen: {
      title: 'Dziś',
      occ: 'Obłożenie',
      adr: 'Średnia cena',
      revpar: 'Przychód na pokój',
      vs: 'r/r',
      legendThis: 'Ten rok',
      legendLast: 'Rok temu',
      legendFc: 'Prognoza'
    },
    demo: 'Dane przykładowe',
    modules: {
      title: 'Cztery moduły, jedna codzienna rutyna',
      m1: { t: 'Dynamiczne ceny', d: 'Rekomendacje cen dla każdego terminu i typu pokoju, aktualizowane wraz ze zmianą popytu.' },
      m2: { t: 'Prognoza popytu', d: 'Prognoza obłożenia i popytu na kolejne miesiące z oznaczeniem terminów o wysokim i niskim popycie.' },
      m3: { t: 'Pulpity i analityka', d: 'Średnia cena, przychód na pokój, obłożenie i tempo rezerwacji na jednym ekranie, w porównaniu z ubiegłym rokiem.' },
      m4: { t: 'Budżet i planowanie', d: 'Miesięczny i roczny plan przychodów, na bieżąco porównywany z wykonaniem.' }
    },
    audience: {
      title: 'Dla hoteli bez specjalisty od cen',
      a1: { t: 'Hotele niezależne', d: 'Jeden obiekt, jeden właściciel, sto decyzji dziennie. Roomila zdejmuje z tej listy ceny.' },
      a2: { t: 'Hotele butikowe', d: 'Mało pokoi, wysoka wartość. Każdy typ pokoju wyceniony tak, jak naprawdę wart jest dany termin.' },
      a3: { t: 'Aparthotele i długie pobyty', d: 'Równowaga krótkich i długich pobytów, dzięki której kalendarz zapełnia się bez luk.' },
      a4: { t: 'Hostele', d: 'Łóżka i pokoje prywatne wyceniane według popytu, noc po nocy.' }
    },
    why: {
      title: 'Dlaczego Roomila',
      w1: {
        t: 'Zrozumiała automatyzacja',
        b1: 'Każda rekomendacja pokazuje swoje powody: popyt, tempo rezerwacji, sezon.',
        b2: 'Akceptacja, korekta albo nadpisanie jednym kliknięciem, w granicach ustalonych przez hotel.',
        b3: 'Mniej rutyny w arkuszach, więcej czasu dla gości i strategii.'
      },
      w2: {
        t: 'Przychód, nie tylko cena',
        b1: 'Ceny podążają za prognozowanym popytem, a nie za zeszłorocznym kalendarzem.',
        b2: 'Terminy o wysokim popycie nie wyprzedają się za tanio i za wcześnie.',
        b3: 'Terminy o niskim popycie dostają uwagę, zanim zamienią się w puste pokoje.'
      },
      w3: {
        t: 'Analityka bez upiększeń',
        b1: 'Prognozy są przeliczane na świeżych danych o rezerwacjach, więc nadążają za rynkiem.',
        b2: 'Jeden zestaw liczb dla właściciela, dyrektora i recepcji.',
        b3: 'Plan i wykonanie widać codziennie, a nie dopiero na koniec miesiąca.'
      }
    },
    together: {
      title: 'Rośniemy razem z hotelem',
      lead: 'Nie czekamy, aż hotel zadzwoni z problemem. Odzywamy się pierwsi.',
      s1: { t: 'Rozmowa', d: 'Poznajemy hotel, jego kalendarz i to, jak dziś ustala ceny.' },
      s2: { t: 'Wdrożenie', d: 'Konfigurujemy system i razem z hotelem ustalamy granice cen.' },
      s3: { t: 'Telefon co tydzień', d: 'Co tydzień sami dzwonimy, żeby omówić ceny i nadchodzące wydarzenia.' },
      s4: { t: 'Nowe funkcje za darmo', d: 'Każda nowa funkcja trafia do hotelu bez dodatkowych opłat.' }
    },
    reco: {
      title: 'Rekomendacja',
      room: 'Pokój dwuosobowy',
      current: 'Obecna',
      recommended: 'Rekomendowana',
      r1: 'Prognoza popytu: wysoki',
      r2: 'Tempo rezerwacji powyżej ubiegłego roku',
      r3: 'Weekend w wysokim sezonie',
      accept: 'Akceptacja',
      adjust: 'Korekta',
      reject: 'Odrzucenie',
      now: 'teraz',
      s1: 'Wysoki popyt',
      s2: 'Szybsze rezerwacje',
      s3: 'Szczyt sezonu'
    },
    plan: {
      title: 'Plan a wykonanie',
      plan: 'Plan',
      actual: 'Wykonanie'
    },
    demand: {
      title: 'Kalendarz popytu',
      high: 'Wysoki popyt',
      low: 'Niski popyt',
      flag: 'Okazja'
    },
    rates: {
      title: 'Rekomendacje cen'
    },
    bento: {
      title: 'Jeden system, cztery zadania'
    },
    decide: {
      title: 'Każda cena ma swoje uzasadnienie',
      p: 'Roomila pokazuje, dlaczego rekomenduje daną cenę: prognozowany popyt, tempo rezerwacji, sezon. Cenę można zaakceptować, skorygować albo ustawić własną, w granicach określonych przez hotel.'
    },
    band: {
      title: 'Ile jest wart kalendarz Państwa hotelu?'
    },
    book: {
      title: 'Wolne terminy rozmów',
      lead: 'Rozmowa wideo z Antonim Małochą: poznajemy hotel i pokazujemy produkt. Potwierdzenie terminu przychodzi e-mailem.',
      loading: 'Ładowanie kalendarza…',
      failed: 'Kalendarz się nie załadował. Prośbę o rozmowę można zostawić w formularzu poniżej.'
    },
    contact: {
      title: 'Porozmawiajmy',
      lead: 'Krótka rozmowa: poznajemy hotel i pokazujemy produkt.',
      name: 'Imię i nazwisko',
      hotel: 'Hotel',
      reach: 'E-mail lub telefon',
      time: 'Dogodny termin (opcjonalnie)',
      consent: 'Zgadzam się na kontakt w sprawie tego zgłoszenia.',
      submit: 'Wysyłam prośbę',
      subject: 'Prośba o rozmowę',
      required: 'To pole jest wymagane.',
      errorIcon: 'Błąd',
      sending: 'Wysyłanie…',
      sent: 'Dziękujemy. Zgłoszenie dotarło, odezwiemy się wkrótce.',
      fail: 'Nie udało się wysłać zgłoszenia. Prosimy spróbować ponownie za chwilę.',
      err: 'Wymagane: imię, nazwa hotelu, sposób kontaktu i zaznaczona zgoda.'
    },
    footer: {
      tagline: 'Stoimy na straży cen hotelu',
      rights: '© 2026 Roomila'
    }
  }
};
