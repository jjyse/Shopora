// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data.

    app.data = {
        items: [],
        curr_item: [],
    };

    app.methods = {
        // Complete.
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_items_url).then(function (response) {
            app.vue.items = response.data.rows;
        });
        axios.get(load_curr_item_url).then(function (response) {
            app.vue.curr_item = response.data.rows;
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);