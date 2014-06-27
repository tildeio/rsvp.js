export default function sequence(promises) {
    var functions = promises.map(function(promise){
        return function(){
            return promise;
        };
    });

    return functions.reduce(function(current, next){
        return current.then(next);
    }, RSVP.resolve());
}
