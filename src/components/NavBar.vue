<template>
    <nav id="mainNav" class="navbar navbar-expand-lg sticky-top custom-navbar">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">Admin Menu</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                </ul>
                <div>
                    <div v-if="!isUserLoggedIn">
                        <router-link to="/login"><button class="btn btn-primary me-2" style="width: 100px;">Login</button></router-link>
                        <router-link to="/register"><button class="btn btn-outline-primary"
                                style="width: 100px;">Sign-up</button></router-link>
                    </div>
                    <div v-else>
                        <button @click="logout" class="btn btn-outline-primary">Log out</button>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
  
<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const isUserLoggedIn = true; // Replace with actual login check
        const router = useRouter();

        function redirectToLogin() {
            router.push('/login');
        }

        function redirectToSignUp() {
            router.push('/signup');
        }

        function logout() {
            // logout logic here
            isUserLoggedIn.value = false;
            router.push('/');
        }

        return {
            isUserLoggedIn,
            redirectToLogin,
            redirectToSignUp,
            logout
        };
    }
};
</script>
  
<style scoped>
.custom-navbar {
    background-color: rgb(211, 222, 222);

}

.nav-link {
    border-radius: 1rem;
    padding-left: 5px;
    padding-right: 5px;
}

.nav-link:hover {
    color: rgb(0, 0, 0);
    background-color: rgba(44, 99, 124, 0.1);
    transition: color 0.3s, background-color 0.3s;
}

#navbarSupportedContent ul.navbar-nav {
    margin-left: 8%;

}


#navbarSupportedContent .navbar-text {
    margin-right: 10%;
}

.nav-item {
    display: flex;
}
.navbar-brand {
    font-size: x-large;
    color: rgb(44, 44, 44);
    font-weight: bolder;
    transition: color 0.3s, text-shadow 0.3s;
}

.navbar-brand:hover {
    color: rgb(0, 0, 0);
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.242), /* offset shadow */
    0 0 1em rgba(0, 0, 0, 0.5), /* inner shadow */
    0 0 0.2em rgba(0, 0, 0, 0.5); /*innermost shadow */
    transition: all 0.3s;
}
</style>