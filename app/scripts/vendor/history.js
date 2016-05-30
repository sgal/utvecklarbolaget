var StateHistory = function() {
  var stateChangeListeners = [],
      fireStateChanged = function(state) {
        for(var i = 0; i < stateChangeListeners.length; i++) {
          stateChangeListeners[i](state);
        }
      };
  return {
    pushState: function(state) {
      if (!state) return;
      state = state.indexOf('#') == 0 ? state : '#' + state;
      if(history.pushState) {
        history.pushState(state, state, state);
      }
      else {
        var section = $(state);
        section.removeAttr('id');
        window.location.hash = state;
        section.attr('id', state.substr(1));
      }
      fireStateChanged(state);
    },

    getState: function() {
      return history.state || window.location.hash.indexOf('#') != -1 ? window.location.hash : '#' + window.location.hash;
    },

    onStateChanged: function(callback) {
      stateChangeListeners.push(callback);
    }
  }
}