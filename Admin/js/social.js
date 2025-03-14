class SocialManager {
    constructor() {
        this.currentUser = null;
        this.postsListener = null;
        this.setupAuthListener();
        this.setupPostForm();
        this.setupPostsListener();
    }

    setupAuthListener() {
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (!user) {
                window.location.href = 'auth-login.html';
            }
        });
    }

    setupPostForm() {
        const postForm = document.getElementById('postForm');
        const mediaInput = document.getElementById('mediaInput');
        
        if (postForm) {
            postForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = document.getElementById('postContent').value;
                const files = mediaInput.files;
                
                try {
                    await this.createPost(content, files);
                    postForm.reset();
                    document.getElementById('mediaPreview').innerHTML = '';
                } catch (error) {
                    console.error('Error creating post:', error);
                    alert('Failed to create post. Please try again.');
                }
            });
        }

        // Handle media preview
        if (mediaInput) {
            mediaInput.addEventListener('change', this.handleMediaPreview.bind(this));
        }
    }

    async createPost(content, files) {
        if (!content && (!files || files.length === 0)) {
            alert('Please add some content or media to your post.');
            return;
        }

        const mediaUrls = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await this.uploadMedia(file);
                mediaUrls.push({
                    url: url,
                    type: file.type.startsWith('image/') ? 'image' : 'video'
                });
            }
        }

        const post = {
            content: content,
            media: mediaUrls,
            authorId: this.currentUser.uid,
            authorName: this.currentUser.displayName || 'Anonymous',
            authorPhoto: this.currentUser.photoURL || 'https://via.placeholder.com/32',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: [],
            comments: []
        };

        await db.collection('posts').add(post);
    }

    async uploadMedia(file) {
        const fileRef = storage.ref(`posts/${this.currentUser.uid}/${Date.now()}_${file.name}`);
        await fileRef.put(file);
        return await fileRef.getDownloadURL();
    }

    handleMediaPreview(e) {
        const preview = document.getElementById('mediaPreview');
        preview.innerHTML = '';
        
        for (const file of e.target.files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const mediaElement = file.type.startsWith('image/') 
                    ? this.createImagePreview(event.target.result)
                    : this.createVideoPreview(event.target.result);
                preview.appendChild(mediaElement);
            };
            reader.readAsDataURL(file);
        }
    }

    createImagePreview(src) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'preview-media';
        return img;
    }

    createVideoPreview(src) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.className = 'preview-media';
        return video;
    }

    setupPostsListener() {
        if (this.postsListener) {
            this.postsListener();
        }

        this.postsListener = db.collection('posts')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                this.renderPosts(snapshot);
            }, error => {
                console.error('Error listening to posts:', error);
            });
    }

    renderPosts(snapshot) {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        snapshot.docChanges().forEach(change => {
            const post = { id: change.doc.id, ...change.doc.data() };
            
            if (change.type === 'added') {
                const postElement = this.createPostElement(post);
                // Add new posts at the beginning
                postsContainer.insertBefore(postElement, postsContainer.firstChild);
            } else if (change.type === 'modified') {
                // Update existing post
                const existingPost = document.getElementById(`post-${post.id}`);
                if (existingPost) {
                    existingPost.replaceWith(this.createPostElement(post));
                }
            } else if (change.type === 'removed') {
                // Remove deleted post
                const existingPost = document.getElementById(`post-${post.id}`);
                if (existingPost) {
                    existingPost.remove();
                }
            }
        });
    }

    createPostElement(post) {
        const div = document.createElement('div');
        div.id = `post-${post.id}`;
        div.className = 'card mb-3 post';
        
        const timestamp = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now';
        const isLiked = post.likes.includes(this.currentUser.uid);
        
        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                    <img src="${post.authorPhoto}" alt="Profile" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <h6 class="mb-0">${post.authorName}</h6>
                        <small class="text-muted">${timestamp}</small>
                    </div>
                </div>
                <p class="card-text">${post.content}</p>
                ${this.renderMediaContent(post.media)}
                <div class="d-flex align-items-center mt-3">
                    <button class="btn btn-sm ${isLiked ? 'btn-primary' : 'btn-outline-primary'} me-2" onclick="socialManager.toggleLike('${post.id}')">
                        <i class="bi bi-heart-fill"></i> ${post.likes.length}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="socialManager.showComments('${post.id}')">
                        <i class="bi bi-chat-fill"></i> ${post.comments.length}
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }

    renderMediaContent(media) {
        if (!media || media.length === 0) return '';
        
        let html = '<div class="media-grid">';
        media.forEach(item => {
            if (item.type === 'image') {
                html += `<img src="${item.url}" alt="Post image" class="post-media">`;
            } else {
                html += `
                    <video controls class="post-media">
                        <source src="${item.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }
        });
        html += '</div>';
        return html;
    }

    async toggleLike(postId) {
        try {
            const postRef = db.collection('posts').doc(postId);
            const post = await postRef.get();
            const likes = post.data().likes || [];
            const userId = this.currentUser.uid;
            
            if (likes.includes(userId)) {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(userId)
                });
            } else {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(userId)
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    async showComments(postId) {
        try {
            const postRef = db.collection('posts').doc(postId);
            const post = await postRef.get();
            const comments = post.data().comments || [];
            
            // Show comments in a modal or expandable section
            // This is a basic implementation - you can enhance it
            alert(`Comments (${comments.length}):\n${comments.map(c => `${c.author}: ${c.text}`).join('\n')}`);
        } catch (error) {
            console.error('Error showing comments:', error);
        }
    }
}

// Initialize social manager
const socialManager = new SocialManager();
