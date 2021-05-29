// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data.

    app.data = {
        // Data for retrieving items
        items: [],
        curr_item: [],

        // Data related to review writing
        review_post_mode: false,
        review_content: "",
        reviews: [],
        add_email: ""
    };

    // *********************** Review writing methods *******************************
    app.set_mode = function(new_status){
        app.vue.review_post_mode = new_status;
    };

    app.add_review = function(){
        axios.post(add_review_url,
            {
                item_id: app.vue.curr_item[0].item_id,
                review_content: app.vue.review_content,
            })
            .then(function (response){
                app.vue.reviews.push({
                    id: response.data.id,
                    item_id: app.vue.curr_item[0].item_id,
                    review_content: app.vue.review_content,
                    reviewer_name: response.data.reviewer_name,
                    reviewer_email: response.data.reviewer_email,
                });
                app.enumerate(app.vue.reviews);
                app.reset_review();
                app.set_mode(false);
            });
    };

    app.reset_review = function (){
        app.vue.review_content = "";
    };

    app.del_review = (review_idx) => {
        let id = app.vue.reviews[review_idx].id;
        axios.get(del_review_url, {params: {id: id}}).then(function ( response){
            for (let i=0; i<app.vue.reviews.length; i++){
                if(app.vue.reviews[i],id == id){
                    app.vue.reviews.reverse().splice(i, 1);
                    app.enumerate(app.vue.reviews);
                    break;
                }
            }
        })
    }

    app.enumerate = (a) => {
        // This adds an _idx field (THE ROW INDEX) to each element of the array.
        let k = 0;
        a.map((e) => {
            e._idx = k++;
        });
        return a;
    };
    // ***********************************************************************************

    app.methods = {
        // Complete.
        set_mode: app.set_mode,
        add_review: app.add_review,
        reset_review: app.reset_review,
        del_review: app.del_review
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {

        // *************** Retrieving items from database ****************

        axios.get(load_items_url).then(function (response) {
            app.vue.items = response.data.rows;
        });
        axios.get(load_curr_item_url).then(function (response) {
            app.vue.curr_item = response.data.rows;
        });

        // ***************** Retrieving reviews from database **************
        axios.get(load_reviews_url)
            .then(function (response) {
                app.vue.reviews = app.enumerate(response.data.item_reviews);
                app.vue.add_email = response.data.email;
            });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);