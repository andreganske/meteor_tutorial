Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
	
	angular.module('simple-todos', ['angular-meteor', 'accounts.ui']);

	function onReady() {
		angular.bootstrap(document, ['simple-todos']);
	}

	if (Meteor.isCordova) {
		angular.element(document).on('deviceready', onReady);
	} else {
		angular.element(document).ready(onReady);
	}

	angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
		function ($scope, $meteor) {

			$scope.$meteorSubscribe('tasks');

			$scope.tasks = $meteor.collection( function() {
				return Tasks.find( $scope.getReactively('query') , { sort: {createdAt: -1 }})
			});

			$scope.addTask = function (newTask) {
				$meteor.call('addTask', newTask);
			};

			$scope.deleteTask = function(task) {
				$meteor.call('deleteTask', task._id);
			}

			$scope.setChecked = function (task) {
				$meteor.call('setChecked', task._id, !task.checked);
			}

			$scope.setPrivate = function (task) {
				$meteor.call('setPrivate', task._id, !task.private);
			}

			$scope.incompleteCount = function() {
				return Tasks.find({ checked: {$ne: true}}).count();
			};

			$scope.$watch('hideCompleted', function() {
				if ($scope.hideCompleted) {
					$scope.query = { checked: {$ne: true}};
				} else {
					$scope.query = {};
				}
			});

	}]);
}

Meteor.methods({
	
	addTask: function(text) {
		if (!Meteor.userId()) {
			throw new Meteor.error('not-authorized');
		}

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},

	deleteTask: function(taskId) {
		if (Meteor.call('validateIsOwner', taskId))

		Tasks.remove(taskId);
	},

	setChecked: function(taskId, setChecked) {
		if (Meteor.call('validateIsOwner', taskId))

		Tasks.update(taskId, { $set: { checked:setChecked} });
	},

	setPrivate: function(taskId, setToPrivate) {
		if (Meteor.call('validateIsOwner', taskId))

		Tasks.update(taskId, { $set: { private: setToPrivate } });
	},

	validateIsOwner: function(taskId) {
		var task = Tasks.findOne(taskId);

		if (task.owner !== Meteor.userId()) {
			throw new Meteor.error('not-authorized');
		}
		return true;
	}

});


if (Meteor.isServer) {

	Meteor.publish('tasks', function() {
		return Tasks.find({
			$or: [
				{ private: {$ne: true} },
				{ owner: this.userId }
			]
		});
	});

}
