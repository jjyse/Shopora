// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete.

        // Page states are defined here.
        // Corresponds to comment_list in index.html
        comment_list: [],

        new_comment: "",
    };

    // Create the function we will need to use in index.html
    app.add_comment = function () {
        app.vue.comment_list.push(app.vue.new_comment);
        // Clear the comments so we can write another one.
        app.vue.new_comment = "";
    };

    app.methods = {
        // Complete.

        // Method to handle the add comment event
        add_comment: app.add_comment,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        // Do any initializations (e.g. networks calls) here.
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
