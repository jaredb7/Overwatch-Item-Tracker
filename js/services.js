OWI.factory("StorageService", function() {
  var service = {
    data: {},
    settings: {},
    defaultSettings: {
      particles: true,
      hdVideos: false,
      currentTheme: 'standard'
    },
    getData: function() {
      return service.data;
    },
    getSetting: function(key) {
      return (service.settings[key] ? service.settings[key] : (service.defaultSettings[key] ? service.defaultSettings[key] : false));
    },
    setSetting: function(key, value) {
      service.settings[key] = value;
      service.persist(true);
    },
    setData: function(data) {
      service.data = data;
      service.persist();
    },
    persist: function(settings) {
      localStorage.setItem(settings ? 'settings' : 'data', angular.toJson(service[settings ? 'settings' : 'data']));
    },
    init: function() {
      console.info("Init StorageService");
      var storedData = localStorage.getItem('data')
      if (storedData) {
        service.data = angular.fromJson(storedData);
      }
      var storedSettings = localStorage.getItem('settings');
      if (!storedSettings) {
        service.settings = service.defaultSettings;
      } else {
        service.settings = angular.fromJson(storedSettings);
      }
    }
  }
  service.init();
  return service;
})

OWI.factory("DataService", ["$http", "$q", "StorageService", function($http, $q, StorageService) {
  var items = '{"skinsLegendary":{},"skinsEpic":{},"emotes":{},"intros":{},"sprays":{},"voicelines":{},"poses":{},"icons":{}}'
  var items2 = '{"skins":{},"skins":{},"emotes":{},"intros":{},"sprays":{},"voicelines":{},"poses":{},"icons":{}}'
  function initialize(data) {
    console.info("Initializing");
    var storedData = StorageService.getData() || {};
    var out = {
      initialized: true,
      checked: {}
    }
    Object.keys(data.events).forEach(function(event) {
      out.checked[event] = JSON.parse(items)
    })
    Object.keys(data.heroes).forEach(function(hero) {
      out.checked[hero] = JSON.parse(items2)
    })
    Object.assign(out.checked, storedData)
    Object.assign(service, out, data)
  }

  var service = {
    checked: {},
    prices: {},
    events: {},
    heroes: {},
    initialized: false,
    isItemChecked: function(who, type, id) {
      return (service.checked[who] ? (service.checked[who][type] ? service.checked[who][type][id] : false) : false);
    },
    waitForInitialization: function() {
      return $q(function(resolve) {
        function waitForInitialize() {
            if (service.initialized) {
              resolve(service);
            } else {
              setTimeout(waitForInitialize, 50);
            }
        }
        waitForInitialize();
      });
    },
    init: function() {
      console.info("Fetching Data");
      $http.get('./data/master.json').then(function(resp) {
        if (resp.status == 200) {
          initialize(resp.data);
        } else {
          console.error("Failed loading master.json ???", resp.status, resp.error);
        }
      }, function(resp) {
        console.error("Failed loading master.json ???", resp.status, resp.error);
      })
    }
  }
  service.init();
  return service;
}])
