function showError(err) {
    alert(err.message);
    console.error(err);
};

async function initAuth() {
    const auth = firebase.auth();
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });

    const $app = document.getElementById('app');
    const $load = document.getElementById('load');
    const $authButton = document.getElementById('auth-button');
    const $appTl = document.getElementById('app-tl');
    const $uid = document.getElementById('uid');
    const $profileName = document.getElementById('profile-name');
    const $profileImage = document.getElementById('profile-image');

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
            $appTl.style.display = 'flex'; // アプリケーションを表示する

            // ログイン中のユーザー情報を表示する
            $uid.innerText = user.uid;
            $profileName.innerText = user.displayName;
            $profileImage.src = user.photoURL;

            // ログイン中のユーザーのプロフィールを保存する
            db.collection('users').doc(user.uid).set({
                name: user.displayName,
                photoURL: user.photoURL,
            }).catch(showError);
        } else {
            $appTl.style.display = 'none';
            $authButton.innerText = 'Login';
        }
    });

    $authButton.addEventListener('click', () => {
        if (loginUser) {
            auth.signOut();
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithRedirect(provider);
    });

    try {
        await auth.getRedirectResult();
    } catch (err) {
        showError(err);
    }

};

async function initPost() {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const $post = document.getElementById('post');
    const $postButton = document.getElementById('post-button');

    const user = auth.currentUser;
    const userRef = db.collection('users').doc(user.uid);

    $postButton.addEventListener('click', async () => {
        // 二重投稿の予防
        $post.disabled = true;
        $postButton.disabled = true;
        const text = $post.value;
        const postRef = userRef.collection('timeline').doc();
        try {
            await postRef.set({
                uid: user.uid,
                text,
                created: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            showError(err);
        } finally {
            $post.value = ''; // clear
            $post.disabled = false;
            $postButton.disabled = false;
        }
    });
};

async function main() {
    await initAuth()
    await initPost()
};

document.addEventListener('DOMContentLoaded', function () {
    main().catch(err => console.error(err));
});