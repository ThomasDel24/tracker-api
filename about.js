const { mustBeSignedIn } = require('./auth.js');

let aboutMessage = 'Issue Tracker API v1.0';

function setMessage(_, { message }) { //The return value should be of the type that is specified in the schema. In the case of the field setAboutMessage, since the return value is optional, it can choose to return nothing. But it’s good practice to return some value to indicate successful execution of the field, so let’s just return the message input value. We will also not be using any properties of the parent object (Query) in this case, so we can ignore the first argument, obj, and use only the property within args.
    aboutMessage = message;
    return aboutMessage;
}

function getMessage() {
    return aboutMessage;
}

module.exports = { getMessage, setMessage: mustBeSignedIn(setMessage) };