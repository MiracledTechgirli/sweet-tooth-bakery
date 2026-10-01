/**
 * GOOGLE AUTHENTICATION SERVICE MODULE (Google Cloud Console Integration)
 * Utilizes Google Identity Services (GIS) library for Google Sign-In.
 */

class GoogleAuthService {
    constructor() {
        this.clientId = localStorage.getItem('apex_google_client_id') || '';
        this.currentUser = null;
        this.listeners = [];
        this.init();
    }

    init() {
        // Load stored session if available
        const cachedUser = localStorage.getItem('apex_user_session');
        if (cachedUser) {
            try {
                this.currentUser = JSON.parse(cachedUser);
            } catch (e) {
                localStorage.removeItem('apex_user_session');
            }
        }

        // Fetch client ID from server if not set
        if (!this.clientId) {
            fetch('/api/config')
                .then(res => res.json())
                .then(config => {
                    if (config.googleClientId) {
                        this.setClientId(config.googleClientId);
                    }
                })
                .catch(() => {});
        }
    }

    setClientId(clientId) {
        this.clientId = clientId;
        localStorage.setItem('apex_google_client_id', clientId);
        this.renderGoogleButton();
    }

    renderGoogleButton() {
        if (window.google && this.clientId) {
            try {
                window.google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: (response) => this.handleCredentialResponse(response)
                });

                const btnContainer = document.getElementById('google-btn-container');
                if (btnContainer) {
                    btnContainer.innerHTML = '';
                    window.google.accounts.id.renderButton(
                        btnContainer,
                        { theme: 'filled_dark', size: 'large', shape: 'pill', width: 240 }
                    );
                }
            } catch (err) {
                console.warn('[Google Auth Init Warning]', err);
            }
        }
    }

    handleCredentialResponse(response) {
        if (!response.credential) return;

        // Parse JWT payload from Google Identity Services
        const user = this.parseJwt(response.credential);
        if (user) {
            this.currentUser = {
                id: user.sub,
                email: user.email,
                name: user.name,
                picture: user.picture,
                givenName: user.given_name,
                familyName: user.family_name,
                token: response.credential
            };

            localStorage.setItem('apex_user_session', JSON.stringify(this.currentUser));
            
            // Sync with Supabase DB
            if (window.dbService) {
                window.dbService.syncUser(user);
            }

            this.notifyListeners();
            if (window.app) {
                window.app.showToast(`Welcome back, ${user.name}! 👋`);
                window.app.autoFillCheckoutDetails();
            }
        }
    }

    // Helper: Parse Google OAuth JWT Payload
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Failed to parse JWT token', e);
            return null;
        }
    }

    // Interactive Demo / Sandbox Google Sign-In for testing without GCP setup
    simulateGoogleSignIn() {
        const mockUser = {
            id: 'google-10928374912',
            email: 'alex.developer@gmail.com',
            name: 'Alex Mercer',
            givenName: 'Alex',
            familyName: 'Mercer',
            picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            simulated: true
        };

        this.currentUser = mockUser;
        localStorage.setItem('apex_user_session', JSON.stringify(this.currentUser));

        if (window.dbService) {
            window.dbService.syncUser(mockUser);
        }

        this.notifyListeners();
        if (window.app) {
            window.app.showToast('Signed in as Alex Mercer via Google Sandbox! 🚀');
            window.app.autoFillCheckoutDetails();
        }
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('apex_user_session');
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        this.notifyListeners();
        if (window.app) {
            window.app.showToast('Logged out successfully.');
        }
    }

    onAuthChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentUser));
    }
}

window.authService = new GoogleAuthService();
