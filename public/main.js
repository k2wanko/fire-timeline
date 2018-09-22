async function initAuth() {
    const auth = firebase.auth();

    const $app = document.getElementById('app');
    const $load = document.getElementById('load');

    let loaded = false;
    auth.onAuthStateChanged(user => {
        if (!loaded) {
            loaded = true;
            $load.style.display = 'none';
            $app.style.display = '';
        }
        console.log('@@@', user);
    });
};

async function main() {
    await initAuth()
};

document.addEventListener('DOMContentLoaded', function() {
    main().catch(err => console.error(err));
});