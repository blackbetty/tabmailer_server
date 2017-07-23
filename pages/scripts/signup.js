var signupScreen = new Vue({
    el: '#app-signup',
    data: {
        email: '',
        password: '',
        username: ''
    },
    methods: {
        signupButtonSubmit: function() {
            var request = new XMLHttpRequest();
            request.open("POST", '/createUser', true);
            console.log('shmoney?');
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.send(JSON.stringify({
                username: this.username,
                emailaddress: this.email,
                password: this.password
            }));
        }
    },
    computed: {
        isDisabled: function() {
            if (this.email && this.password && this.username && document.getElementById("email-address").validity.valid) {
                return false;
            }
            return true;
        }
    }
})
