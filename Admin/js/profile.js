class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserProfile();
            } else {
                window.location.href = 'auth-login.html';
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.updateProfileUI(userData);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    updateProfileUI(userData) {
        // Update profile image
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.src = userData.photoURL || 'https://via.placeholder.com/150';
        }

        // Update cover image
        const coverImage = document.getElementById('coverImage');
        if (coverImage) {
            coverImage.src = userData.coverURL || 'https://via.placeholder.com/1200x300';
        }

        // Update name and bio
        document.getElementById('userName').textContent = userData.displayName || 'Anonymous';
        document.getElementById('userTitle').textContent = userData.title || 'No title set';
        document.getElementById('userBio').textContent = userData.bio || 'No bio available';
        document.getElementById('userLocation').textContent = userData.location || 'Location not set';
        document.getElementById('userEmail').textContent = userData.email || this.currentUser.email;

        // Update stats
        document.getElementById('connectionsCount').textContent = userData.connections?.length || 0;
        document.getElementById('postsCount').textContent = userData.posts?.length || 0;
    }

    async updateProfile(formData) {
        try {
            const updates = {
                displayName: formData.get('displayName'),
                title: formData.get('title'),
                bio: formData.get('bio'),
                location: formData.get('location'),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Handle profile image upload
            const profileImage = formData.get('profileImage');
            if (profileImage) {
                const imageUrl = await this.uploadImage(profileImage, 'profile');
                updates.photoURL = imageUrl;
            }

            // Handle cover image upload
            const coverImage = formData.get('coverImage');
            if (coverImage) {
                const imageUrl = await this.uploadImage(coverImage, 'cover');
                updates.coverURL = imageUrl;
            }

            // Update Firestore
            await db.collection('users').doc(this.currentUser.uid).update(updates);
            
            // Update auth profile
            await this.currentUser.updateProfile({
                displayName: updates.displayName,
                photoURL: updates.photoURL
            });

            // Reload profile
            this.loadUserProfile();
            
            // Show success message
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    }

    async uploadImage(file, type) {
        const fileRef = storage.ref(`users/${this.currentUser.uid}/${type}/${Date.now()}_${file.name}`);
        await fileRef.put(file);
        return await fileRef.getDownloadURL();
    }
}

// Initialize profile manager
const profileManager = new ProfileManager();

// Handle profile form submission
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await profileManager.updateProfile(formData);
});
