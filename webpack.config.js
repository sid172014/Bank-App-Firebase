// The 'webpack' module will basically look into main source file i.e 'index.js' file and look for all the imports present inside that file and basucally bundle it to our 'index.html' file or the frontend file
// This would help us to remove any unused code that we might have in our code

const path = require('path');

module.exports = {
    mode : "development",
    entry : "./src/index.js",
    output : {
        path : path.resolve(__dirname,'dist'),
        filename : "bundle.js"  // This will bundle our source code up and store it in the 'bundle.js' file inside the 'dist' directory or folder
    },  
    watch : true // Since we are watching the 'index.js' file so everytime we make changes to it the webpack will rebundle the program 
}