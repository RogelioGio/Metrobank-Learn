import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export const echoPusherInstance = (token) => {
    return new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: 'https://api.mb-authoringtool.online/broadcasting/auth',
            // authEndpoint: 'https://connected.mblearn.online/broadcasting/auth',
            auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
};
