import http from '@/axios/index.js';

export function loginUserInfo() {
    return http.get('/my/loginUserInfo')
}

export function resetPassword(password) {
    return http.put('/my/resetPassword', {password})
}

export function userDelete() {
    return http.delete('/my/delete')
}

export function uploadAvatar(file) {
    const form = new FormData()
    form.append('avatar', file)
    return http.post('/my/avatar', form)
}

export function deleteAvatar() {
    return http.delete('/my/avatar')
}
