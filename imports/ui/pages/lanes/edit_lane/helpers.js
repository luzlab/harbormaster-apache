import { Template } from 'meteor/templating';
import { Lanes } from '../../../../api/lanes/lanes.js';
import { Session } from 'meteor/session';
import { Users } from '../../../../api/users/users.js';
import { moment } from 'meteor/momentjs:moment';

let AMOUNT_SHOWN = 20;

Template.edit_lane.helpers({
  lane_name (current_name) {
    var name = FlowRouter.getParam('name');
    var lane = Lanes.findOne({ name: name }) ||
      Session.get('lane') ||
      {}
    ;

    lane.name = lane.name || 'New';

    Session.set('lane', lane);

    return current_name == 'New' ? '' : lane.name;
  },

  lane (sort_order) {
    var name = FlowRouter.getParam('name');
    var lane = Lanes.findOne({ name: name });
    var START_INDEX = 0;
    var END_INDEX = AMOUNT_SHOWN - 1;

    if (sort_order == 'history' && lane) {
      return lane.date_history ?
        lane.date_history.reverse().slice(START_INDEX, END_INDEX) :
        []
      ;
    }
    return lane;
  },

  shipping_log_amount_shown () {
    return AMOUNT_SHOWN;
  },

  validate_done () {
    if (! Session.get('lane') || ! Session.get('lane').minimum_complete) {
      return true;
    }

    return false;
  },

  validate_shippable () {
    var lane = Session.get('lane');
    var saved_lane = Lanes.findOne(lane._id);

    if (! saved_lane) {
      return true;
    }

    return false;
  },

  validate_prior_destination () {
    var lane = Session.get('lane');

    if (
      ! lane.destinations ||
      ! lane.destinations.length ||
      ! lane.destinations[lane.destinations.length - 1].complete
    ) {
      return true;
    }

    return false;
  },

  check_salvage_plan () {
    return 'disabled';
  },

  captain_list () {
    var users = Users.find().fetch();

    return users;
  },

  can_ply () {
    var lane = Session.get('lane');

    if (this.harbormaster) { return true; }

    if (lane.captains && lane.captains.length) {
      let user = this._id;

      return _.find(lane.captains, function (captain) {
        return user == captain;
      }) ?
        true :
        false
      ;
    }

    return false;
  },

  plying () {
    var lane = Session.get('lane');
    var user = Users.findOne(Meteor.user().emails[0].address);

    if (user && user.harbormaster) { return true; }

    if (lane.captains && lane.captains.length) {
      let captain = _.find(lane.captains, function (email) {
        return email == Meteor.user().emails[0].address;
      });

      return captain ? true : false;
    }

    return false;
  },

  can_set_ply () {
    var user = Users.findOne(Meteor.user().emails[0].address);

    if (this.harbormaster) { return true; }

    if (user) { return ! user.harbormaster; }

    return false;
  },

  destinations () {
    var lane = Session.get('lane');
    var destinations = lane.destinations || [];

    if (! destinations.length) {
      destinations.push({ name: "(New)" });
    }

    return destinations;
  },

  destination_name_value () {
    if (this.name != "(New)") {
      return this.name;
    }

    return '';
  },

  has_no_address () {
    var lane = Session.get('lane');
    var destination = _.where(lane.destinations, {
      name: this.name
    })[0];

    if (
      ! destination ||
      ! destination.addresses ||
      ! destination.addresses.length
    ) {
      return true;
    }

    return _.any(destination.addresses, function (address) {
      return address == "";
    });

  },

  has_no_name () {
    var lane = Session.get('lane');
    var destination = _.find(lane.destinations, function (target) {
      return target.name;
    });

    if (! destination) { return true; }

    return false;

  },

  addresses () {
    var addresses = this.addresses || [''];

    return addresses;
  },

  has_incomplete_stops () {
    if (
      ! this.stops ||
      ! this.stops.length ||
      this.stops[this.stops.length - 1].name == '' ||
      this.stops[this.stops.length - 1].command == ''
    ) {
      return true;
    }

    return false;
  },

  stops () {
    var stops = this.stops || [{
      name: '',
      command: ''
    }];

    return stops;
  },

  pretty_index (index) {
    return index + 1;
  },

  has_no_name_or_address (target) {
    var lane = Session.get('lane');
    var destination = _.where(lane.destinations, {
      name: target.name
    })[0];

    if (
      ! destination ||
      ! destination.name ||
      ! destination.addresses ||
      ! destination.addresses.length ||
      destination.addresses[0] == ''
    ) {
      return true;
    }

    return false;
  },

  pretty_date (date) {
    return new Date(date).toLocaleString();
  },

  duration () {
    return moment.duration(this.finished - this.actual).humanize();
  },

  destination_user_value () {
    if (this.user) {
      return this.user;
    }

    return '';
  },

  destination_use_private_key () {
    if (this.use_private_key) { return this.use_private_key; }

    return false;
  },

  destination_private_key_location () {
    if (this.private_key_location) { return this.private_key_location; }

    return '';
  },

  has_private_key_location () {
    if (this.use_private_key) {
      return false;
    }

    return true;
  },

  destination_password_value () {
    if (this.password) {
      return this.password;
    }

    return '';
  }
});

