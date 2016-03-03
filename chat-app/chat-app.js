Messages = new Mongo.Collection("msgs");

if (Meteor.isServer) {

	Meteor.publish("messages", function() {
		return Messages.find({}, {sort: {createdAt: -1}, limit: 5});
	});

}

if (Meteor.isClient) {

	Meteor.subscribe("messages");

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});

}

Meteor.methods({

	sendMessage: function(message) {

		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		Messages.insert({
			text: message,
			createdAt: new Date(),
			username: Meteor.user().username
		});
	}

});

if (Meteor.isClient) {
	Template.body.helpers({
		recentMessages: function() {
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			return Messages.find({}, {sort: {createdAt: 1}});
		}
	});

	Template.body.events({
		"submit .new-message": function(event) {

			var text = event.target.text.value;
			Meteor.call('sendMessage', text);
			event.target.text.value = "";

			return false;
		}
	});
}