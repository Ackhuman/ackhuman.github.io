
export class SoundProfileService {
    profiles = {}

    addProfile(key, data) {
        this.profiles[key] = data;
    }

    getProfile(key) {
        return this.profiles[key];
    }
}