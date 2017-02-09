var count=0;
(function() {
'use strict';
angular.module('wpoffice',[])
.controller('WordVariableController', function($q){
	console.log('WordVariableController init');
		var vm = this;
		vm.init = init;
		vm.getSelectedWordFromDocument = getSelectedWordFromDocument;
		vm.populateWordVar = populateWordVar;

		function init() {
			console.log('Initialized WordVariableController');
			vm.inputBoxObjects = [];
			vm.varValues = [];
			vm.onloadVariablesFound = [];

			// getAllSelectedContentControl();

			// Office.initialize = function (reason) {
	//  // Checks for the DOM to load using the jQuery ready function.
			//     //$(document).ready(function () {
			//     // After the DOM is loaded, code specific to the add-in can run.
			//     // Display initialization reason.
			//     if (Office.context.document) {
			// 	getAllSelectedContentControl();
			// } else {
			// 	ngNotify.set('Please reload Parrot365', 'error');
			// }
			//     if (reason == "inserted")
			//     write("The add-in was just inserted.");

			//     if (reason == "documentOpened")
			//     write("The add-in is already part of the document.");
			//    // });
			// }


			
		}

		/*
		*getAllSelectedContentControl----it will load the variable and  corresponding text box
		*@param --- no param
		*/
		function getAllSelectedContentControl() {
			console.log('getAllSelectedContentControl');
			console.log(Word);
			Word.run(function(context) {
				console.log('inside getSelectedContentControl 2');
					var thisDocument = context.document;
					context.load(thisDocument, 'contentControls/id, contentControls/text, contentControls/tag');
					return context.sync().then(function() {
						console.log('returned getSelectedContentControl');
						if (thisDocument.contentControls.items.length !== 0) {
							console.log(thisDocument.contentControls.items.length);
							for (var i = 0; i < thisDocument.contentControls.items.length; i++) {
								var variableLabel = thisDocument.contentControls.items[i].text;
								var tagId = thisDocument.contentControls.items[i].tag;
								if (tagId) {
									getVarArray(variableLabel,tagId).then(function(arrayObj) {
										createInputboxes(arrayObj);
									});
								}
							}
						} else {
							console.log('Content is empty');
						}
					});
				}).then(function() {
					console.log('completed');
				})
				.catch(function(error) {
					console.log('Error: ' + error);
					if (error instanceof OfficeExtension.Error) {
						console.log('Debug info: ' + JSON.stringify(error.debugInfo));
						console.log('Error code and message: ' + error.toString());
					}
				});
		}




		/*
		*getVarArray----creates object on load
		*@param variablevalue---value of variable
		*@param  TagId -----id of variable
		*/
		function getVarArray(variablevalue,tagId)
		{
			var deferred = $q.defer();
			var allBindings = [];
			var tagPrefix, variableLabel;

				if (tagId && tagId.lastIndexOf("__") != -1) {
					tagPrefix = tagId.substr(0,tagId.lastIndexOf('__'));
					var index = tagId.indexOf("_");
					if(index) {
						variableLabel = tagId.substr(0,index);
					}
				}

				var temp = {
					'id': tagId,
					'variableLabel': variableLabel,
					'tagPrefix': tagPrefix,
					'value': variablevalue
				};

				var indexOfBinding = _.findIndex(allBindings, {
					variableLabel: variableLabel,
					tagPrefix: tagPrefix
				});

				if (indexOfBinding === -1) {
					allBindings.push(temp);
				}

				deferred.resolve(allBindings);

			return deferred.promise;
		}

		/*
		*createInputboxes ----call createVariable function which will create scope obj
		*/
		function createInputboxes(arrayOfBindinds)
		{
			angular.forEach(arrayOfBindinds, function(binding) {
				console.log(binding);
				var textBoxValue = binding.value ? binding.value:'Enter Text';
				console.log(binding.variableLabel+'===='+binding.tagPrefix+'===='+textBoxValue+'===='+binding.id);
				createVariable (binding.variableLabel,binding.tagPrefix,textBoxValue,binding.id);
			});
		}



		/*getSelectedWord - Get Selected Data from the document which  user has  selected manually.
		 *@no param
		 *called on user selection
		 *
		 */
		function getSelectedWordFromDocument()
		{
			console.log('abc');
			Word.run(function(context) {
			console.log('inside word.run');
			var range = context.document.getSelection();
			var ContentControlForSelection = range.insertContentControl();
			ContentControlForSelection.load('text');
			return context.sync().then(function() {
				var variableLabel = ContentControlForSelection.text;
				var wordTag = '_tag';
				var tagPrefix = variableLabel + wordTag;
				//console.log(tagPrefix);
				ContentControlForSelection.tag = tagPrefix +'__'+ count;
				//var conditionalVariable = 'Onseletion';
				//createVariable(variableLabel, tagPrefix);
				var tag = ContentControlForSelection.tag;
				console.log('variable created with'+variableLabel+'----'+ContentControlForSelection.tag);
				//getVarArrayOnSelection(tag,variableLabel, tagPrefix);
				 getVarArrayOnSelection(tag,variableLabel, tagPrefix).then(function(bindings) {
					console.log(bindings);
					createInputboxes(bindings);
				});

			});

		})
		.catch(function(error) {
			console.log('Error: ' + error);
			if (error instanceof OfficeExtension.Error) {
				console.log('Debug info: ' + JSON.stringify(error.debugInfo));
			}
		});
	}



		/*
		*getVarArrayOnSelection --- it creates obj for selected word in document
		*@param--tagId
		*@param--userSelectedText
		*@param--tagPrefix
		*/
		function getVarArrayOnSelection(tagId,userSelectedText,tagPrefix)
		{
			var deferred = $q.defer();
			var allBindings = [];

			var temp = {
				'id': tagId,
				'variableLabel': userSelectedText,
				'tagPrefix': tagPrefix
			};

			var indexOfBinding = _.findIndex(allBindings, {
				variableLabel: userSelectedText,
				tagPrefix: tagPrefix
			})

			if (indexOfBinding === -1) {
				allBindings.push(temp);
			}

			deferred.resolve(allBindings);
			return deferred.promise;
		}


		function createVariable(variableLabel, tagPrefix, newValue, id) {
			console.log(variableLabel+'===='+ tagPrefix+'===='+ newValue+'===='+ id);
			var flag = false;
			var inputObj = {
				id: id,
				label: variableLabel,
				tag: tagPrefix,
				value: newValue
			};

			if (vm.inputBoxObjects.length > 0) {
				var index = _.findIndex(vm.inputBoxObjects, {
					label: variableLabel
				});
				if (index === -1) {
					vm.inputBoxObjects.push(inputObj);
				} else {
					console.log('it already exists in the array');
				}
			} else {
				vm.inputBoxObjects.push(inputObj);
			}
		}

		/*populateWordVar
		 *@TextBoxId = Text Box Id
		 *@tagPrefix = unique identifier
		 **/
		function populateWordVar(obj, $event, $index)
		{
			console.log(obj);
			var TextboxValue = ($event.target.value === '' ? obj.label : $event.target.value);

			console.log(TextboxValue);

			Word.run(function (context) {

				var contentControlsWithTag = context.document.contentControls.getByTag(obj.id);

				context.load(contentControlsWithTag, 'text');

				return context.sync().then(function () {
					if (contentControlsWithTag.items.length === 0) {
						console.log("There isn't a content control with a tag in this document.");
					} else {
						console.log('The first content control with the tag has this text: ' + contentControlsWithTag.items[0].text);
						for (var i = 0;i<contentControlsWithTag.items.length;i++){
						contentControlsWithTag.items[i].insertHtml(TextboxValue, 'Replace');
						}
					}
				});
			})
			.catch(function (error) {
				console.log('Error: ' + JSON.stringify(error));
				if (error instanceof OfficeExtension.Error) {
					console.log('Debug info: ' + JSON.stringify(error.debugInfo));
				}
			});
		}

});
})();