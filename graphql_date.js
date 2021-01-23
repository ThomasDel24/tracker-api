const { GraphQLScalarType } = require('graphql'); //A scalar type resolver needs to be an object of the class GraphQLScalarType, defined in the package graphql-tools. So we import this class into server.js
const { Kind } = require('graphql/language');

const GraphQLDate = new GraphQLScalarType({ //The constructor of GraphQLScalarType takes an object with various properties. We can create this resolver by calling new() on the type
    name: 'GraphQLDate', //Two properties of the initializer —name and description— are used in introspection
    description: 'A Date() type in GraphQL as a scalar',
    serialize(value){ //The class method serialize() will be called to convert a date value to a string. This method takes the value as an argument and expects a string to be returned. All we need to do, thus, is call toISOString() on the value and return it. The value is initally a date object which is converted to a string
        return value.toISOString();
    },
    //We had postponed implementing the parsers for the custom scalar type GraphQLDate because we didn’t need it then. But now, since the type IssueInputs does have a GraphQLDate type, we must implement the parsers for receiving date values. There are two methods that need to be implemented in the GraphQLDate resolver: parseValue and parseLiteral. 
    parseValue(value){
        const dateValue = new Date(value); //The method parseValue will be called if the input is supplied as a variable. Donsider it as an input in the form of a JavaScript object, a pre-parsed JSON value. This method’s argument will be the value directly, without a kind specification, so all we need to do is construct a date out of it and return it
        return Number.isNaN(dateValue.getTime()) ? undefined : dateValue; //Catches invalid date strings while parsing the value on the way in. The new Date() constructor does not throw any errors when the date string is invalid. Instead, it creates a date object, but the object contains an invalid date. One way to detect input errors is by checking if the constructed date object is a valid value. It can be done using the check isNaN(date), after constructing the date. Note that returning undefined is treated as an error by the library. If the supplied literal is not a string, the function will not return anything, which is the same as returning undefined. 

    },
    parseLiteral(ast){
        if (ast.kind === Kind.STRING) { //The method parseLiteral is called in the normal case, where the field is specified in-place in the query. The parser calls this method with an argument ast, which contains a kind property as well as a value property. The kind property indicates the type of the token that the parser found, which can be a float, an integer, or a string. For GraphQLDate, the only type of token we’ll need to support is a string. We can check this using a constant defined in the Kind package in graphql/language. If the type of token is string, we will parse the value and return a date. Otherwise, we’ll return undefined. A return value of undefined indicates to the GraphQL library that the type could not be converted, and it will be treated as an error.
            const value = new Date(ast.value);
            return Number.isNaN(value.getTime()) ? undefined : value;
        } 
        return undefined;
    },
});

module.exports = GraphQLDate; //Whatever was assigned to module.exports is the value that a call to require() returns.