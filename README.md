
# DeferredWithUpdate.js

by Ben Nadel [www.bennadel.com][1]

DeferredWithUpdate.js is an [AngularJS][2] class that decorates the core
[$q class][3] with two additional promise methods:

* promise.update()
* promise.mistake()

By default, a Deferred object can only be resolved or rejected once in its 
life cycle. The same is (mostly) true for the DeferredWithUpdate.js. The 
difference is that if the resolve or reject methods are called after a Deferred 
instance has been taken out of its pending states, the update() and mistake() 
handlers will be invoked (rather than ignored).

Right now, this only decorates deferred objects that are create with the defer()
method. The other $q methods (all(), reject(), when()) are simply passed-through
to the underlying $q instance.

## Intended To Be Used With Cached Responses

At first, this might sound like a completely crazy idea; but, it does have a
very specific use case: using cached data to temporarily resolve a deferred
response from the server. 

When the request is initially made, the service layer could instantly resolve 
the deferred response with cached data (if its available). Then, once the 
actual data is returned, the deferred object could be "updated" with the fresh
data. Similarly, if an already-resolved response returns a 404 (or some other
failed HTTP status code), the deferred object could trigger the "mistake"
callbacks.

The beautiful thing about this is that the API for the Deferred object is still
exactly the same:

* resolve()
* reject()

The code that instantiates the DeferredWithUpdate.js doesn't have to change its
behavior at all. The invoking of the update() and mistake() methods are handled
completely internally to the DeferredWithUpdate.js class.


[1]: http://www.bennadel.com
[2]: http://angularjs.org/
[3]: http://docs.angularjs.org/api/ng.$q