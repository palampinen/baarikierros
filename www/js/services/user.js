angular.module('barhop.services')

.factory('User', function() {
  var prefix = 'BARHOP_';

  return {
    getUser: function() {
      return localStorage.getItem(`${prefix}user`);
    },
    saveUser: function(user) {
      return localStorage.setItem(`${prefix}user`, user);
    },

    getSetting: function(key) {
      return !!localStorage.getItem(`${prefix}${key}`);
    },
    setSetting: function(key, value) {
      if (value) {
        localStorage.setItem(`${prefix}${key}`, value);
      } else {
        localStorage.removeItem(`${prefix}${key}`);
      }
    },
    getListMode: function() {
      return this.getSetting('listMode')
    },
    setListMode: function(listMode) {
      this.setSetting('listMode', listMode)
    }
  }

})
