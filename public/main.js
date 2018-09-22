async function initAuth() {
    const auth = firebase.auth();

    const $app = document.getElementById('app');
    const $load = document.getElementById('load');
    const $authButton = document.getElementById('auth-button');

    let loaded = false;
    let loginUser = null;
    auth.onAuthStateChanged(user => {
        if (!loaded) {
            loaded = true;
            $load.style.display = 'none';
            $app.style.display = '';
        }

        loginUser = user;

        if (user) {
            $authButton.innerText = 'Logout';
        } else {
            $authButton.innerText = 'Login';
        }
    });

    $authButton.addEventListener('click', () => {
        if(loginUser) {
            auth.signOut();
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithRedirect(provider);
    });

    try {
        const result = await auth.getRedirectResult();
        // 次のトークンを使ってGoogle APIを呼び出せる。
        // const token = result.credential.accessToken;
    } catch (err) {
        alert(err.message);
        console.error(err);
    }

};

async function main() {
    await initAuth()
};

document.addEventListener('DOMContentLoaded', function () {
    main().catch(err => console.error(err));
});