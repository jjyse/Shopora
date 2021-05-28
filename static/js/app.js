// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data.

    app.data = {
        items: [],
        curr_item_id: 0,
    };

    app.set_curr_item_id = function (num) {

        axios.post(local_storage_url,
        {
            curr_id: num,
        });
    };

    app.methods = {
        // Complete.
        set_curr_item_id: app.set_curr_item_id,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_items_url,{}).then(function (response) {
            app.vue.items = response.data.rows;
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);