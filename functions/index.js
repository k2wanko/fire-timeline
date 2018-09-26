const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config());

const db = new admin.firestore.Firestore();
db.settings({ timestampsInSnapshots: true });

exports.postTimeline = functions.firestore
    .document('users/{userId}/timeline/{postId}').onCreate((snap, context) => {
        const userId = context.params.userId;
        const postId = context.params.postId;
        const postData = snap.data();
        const batchSize = 500; // 最大500

        // 無限ループ防止
        if (userId !== postData.uid) {
            return Promise.resolve();
        }

        const followersRef = db.collection('users').doc(userId)
            .collection('followers');
        function postToFollowesTimeline(prevRef, resolve, reject) {
            let ref = followersRef.orderBy('__name__').limit(batchSize);
            if (prevRef) {
                ref = ref.startAfter(prevRef);
            }
            ref.get()
                .then(snap => {
                    if (snap.size === 0) {
                        return null;
                    }

                    const batch = db.batch();
                    let prevRef = null;
                    snap.forEach(doc => {
                        prevRef = doc;
                        console.log('set:post', 'postId', postId, 'userId', doc.id)
                        const postRef = db.collection('users').doc(doc.id)
                            .collection('timeline').doc(postId);
                        batch.set(postRef, postData);
                    })

                    return batch.commit().then(() => {
                        return prevRef;
                    });
                })
                .then(prevRef => {
                    if (!prevRef) {
                        resolve();
                        return;
                    }

                    process.nextTick(() => {
                        postToFollowesTimeline(prevRef, resolve, reject);
                    });
                })
                .catch(reject);
        }

        return new Promise((resolve, reject) => {
            postToFollowesTimeline(null, resolve, reject);
        });
    });