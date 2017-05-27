import Cookies from './js.cookie-2.1.4.min.js'
export function check_logged() {
	console.log(Cookies.get('userinfo'));
	if (Cookies.get('userinfo')){
		return true;
	}
	else{
		return false;
	}
}

export function get_userinfo() {
	return Cookies.getJSON('userinfo');
}

export function set_userinfo(userinfo) {
	Cookies.set('userinfo', userinfo);
}

export function logout() {
	Cookies.remove('userinfo');
}

export function urlprefix() {
	return 'http://121.42.33.171:8800';
}