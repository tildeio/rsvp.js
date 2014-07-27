/*
 * Using wildcard because RSVP does not currently have a
 * channel system in place.
 */
module.exports = function(revision,tag,date){
  return {
    'rsvp.js':
      { contentType: 'text/javascript',
        destinations: {
          wildcard: [
            'rsvp-latest.js',
            'rsvp-' + revision + '.js'
          ]
        }
      },
    'rsvp.min.js':
      { contentType: 'text/javascript',
        destinations: {
          wildcard: [
            'rsvp-latest.min.js',
            'rsvp-' + revision + '.min.js'
          ]
        }
      }
  }
}
