(function( ng ){


	// Define the module for this code.
	var app = ng.module( "DeferredWithUpdate", [] );


	// When defining the Deferred object, we need to have two things be true:
	//
	// 1. We have access to AngularJS' $q class.
	// 2. We return an object that can be instantiated.
	//
	// As such, we can define it as a service object and inject the $q class.
	app.service(
		"DeferredWithUpdate",
		function( $q ) {


			// I just pass-through to the core $q class.
			this.all = function() {

				return(
					$q.all.apply( $q, arguments )
				);

			};


			// I return a new deferred object with the decorated promise.
			this.defer = function() {

				// Get the core deferred class and its promise.
				var deferred = $q.defer();
				var promise = deferred.promise;

				// Store the original methods that we are going to decorate.
				var core = {
					resolve: deferred.resolve,
					reject: deferred.reject,
					then: promise.then
				};
				
				// Flag that the deferred value has not yet been resolved or rejected. Under
				// the hood, AngularJS does something rather odd with the promise - it calls 
				// resolve() for both resolved AND rejected deferred values. As such, we need 
				// to track the states slightly independently. 
				var isResolved = false;
				var isRejected = false;
				
				// Keep a collection of update and mistake callbacks.
				var updateCallbacks = [];
				var mistakeCallbacks = [];


				// I decorate tht resolve function, setting the internal pending flag.
				deferred.resolve = function() {

					// If the resolve() has been called more than once, alert the update 
					// callbacks. When doing this, we need to check the rejected flag since, 
					// internally, the $q class uses the resolve to announce the reject() 
					// event - odd.
					if ( isResolved && !isRejected ) {

						// Invoke all the update callbacks.
						for ( var i = 0, length = updateCallbacks.length ; i < length ; i++ ) {

							updateCallbacks[ i ].apply( {}, arguments );

						}

					} else {

						isResolved = true;

						// Invoke the underlying resolve function.
						core.resolve.apply( deferred, arguments )

					}

				};


				// I decorate the reject function, setting the internal pending flag.
				deferred.reject = function() {

					// If the reject method has been called after the deferred has been resolved, 
					// then we'll want to alert the mistake callbacks.
					if ( isResolved ) {

						// Invoke all the mistake callbacks.
						for ( var i = 0, length = mistakeCallbacks.length ; i < length ; i++ ) {

							mistakeCallbacks[ i ].apply( {}, arguments );

						}

					} else {

						isRejected = true;

						// Invoke the underlying reject function.
						core.reject.apply( deferred, arguments )

					}

				};


				// I decorate the then() method, adding the update() method to the wrapped promise.
				promise.then = function() {

					// Call the underlying then() method - this will return a new promise. We'll
					// then have to udpate that promise with its own update() method.
					var newPromise = core.then.apply( promise, arguments );

					// Copy the decorated methods.
					newPromise.update = promise.update;
					newPromise.mistake = promise.mistake;

					// Return the newly decorated promsie.
					return( newPromise );

				};


				// I add the update() callback registration on the promise.
				promise.update = function( callback ) {

					// Keep track of the callback.
					updateCallbacks.push( callback );

					// Return the existing promise.
					return( promise );

				};


				// I add the mistake() callback registration on the promise.
				promise.mistake = function( callback ) {

					// Keep track of the callback.
					mistakeCallbacks.push( callback );

					// Return the existing promise.
					return( promise );

				};


				// Return the decorated deferred object.
				return( deferred );

			};


			// I just pass-through to the core $q class.
			this.reject = function(){

				return(
					$q.reject.apply( $q, arguments )
				);

			};


			// I just pass-through to the core $q class.
			this.when = function() {

				return(
					$q.when.apply( $q, arguments )
				);

			};


		}
	);


})( angular );